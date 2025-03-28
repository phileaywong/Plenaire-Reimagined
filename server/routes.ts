import express, { type Express, type Request, type Response, type NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertNewsletterSubscriptionSchema, 
  insertUserSchema, 
  loginUserSchema,
  insertAddressSchema,
  insertWishlistSchema,
  insertReviewSchema,
  insertCartSchema,
  insertCartItemSchema,
  insertOrderSchema,
  insertOrderItemSchema,
  insertEnquirySchema
} from "@shared/schema";
import { ZodError } from "zod";
import { authenticate, requireAuth, requireAdmin } from "./middleware/auth";
import { comparePassword, hashPassword } from "./utils/password";
import Stripe from "stripe";

// Define custom session interface
declare global {
  namespace Express {
    interface Session {
      captchaText?: string;
    }
  }
}
import cookieParser from "cookie-parser";

// Initialize Stripe with secret key if available
let stripe: Stripe | null = null;
if (process.env.STRIPE_SECRET_KEY) {
  stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2023-10-16" as any, // Type assertion to avoid TS error
  });
} else {
  console.warn("STRIPE_SECRET_KEY not found. Stripe functionality will be disabled.");
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Add cookie parser middleware
  app.use(cookieParser());
  
  // Add authentication middleware
  app.use(authenticate);
  
  // User routes
  
  // Register a new user
  app.post("/api/auth/register", async (req: Request, res: Response) => {
    try {
      // Clear log format that will help us debug the registration issue
      const requestBody = {
        email: req.body.email,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        passwordProvided: !!req.body.password,
        passwordLength: req.body.password?.length,
        confirmPasswordProvided: !!req.body.confirmPassword,
        passwordsMatch: req.body.password === req.body.confirmPassword
      };
      
      console.log("====== REGISTRATION REQUEST RECEIVED =======");
      console.log(JSON.stringify(requestBody, null, 2));
      console.log("===========================================");
      
      // Simply create these fields if they're not already provided
      // This will make sure firstName, lastName, and phone are at least empty strings
      const formData = {
        ...req.body,
        firstName: req.body.firstName || '',
        lastName: req.body.lastName || '',
        phone: req.body.phone || ''
      };
      
      // Validate the input data using the enhanced schema
      const validationResult = insertUserSchema.safeParse(formData);
      
      // If validation fails, provide detailed error messages
      if (!validationResult.success) {
        const errors = validationResult.error.format();
        
        console.log("====== REGISTRATION VALIDATION FAILED =======");
        console.log(JSON.stringify(errors, null, 2));
        console.log("=============================================");
        
        // Determine the most important validation error to show
        let primaryErrorMessage = "Please check your form inputs";
        let allErrorMessages: string[] = [];
        
        // Process password errors first as they're most common
        if (errors.password?._errors?.length) {
          primaryErrorMessage = errors.password._errors[0];
          allErrorMessages.push(`Password: ${errors.password._errors.join(', ')}`);
        }
        else if (errors.confirmPassword?._errors?.length) {
          primaryErrorMessage = errors.confirmPassword._errors[0];
          allErrorMessages.push(`Confirm Password: ${errors.confirmPassword._errors.join(', ')}`);
        }
        else if (errors.email?._errors?.length) {
          primaryErrorMessage = errors.email._errors[0];
          allErrorMessages.push(`Email: ${errors.email._errors.join(', ')}`);
        }
        else if (errors.firstName?._errors?.length) {
          primaryErrorMessage = errors.firstName._errors[0]; 
          allErrorMessages.push(`First Name: ${errors.firstName._errors.join(', ')}`);
        }
        else if (errors.lastName?._errors?.length) {
          primaryErrorMessage = errors.lastName._errors[0];
          allErrorMessages.push(`Last Name: ${errors.lastName._errors.join(', ')}`);
        }
        
        // Collect all other error messages
        Object.entries(errors).forEach(([field, error]) => {
          if (field !== '_errors' && 
              typeof error === 'object' && 
              error !== null && 
              '_errors' in error && 
              Array.isArray(error._errors) && 
              error._errors.length && 
              !allErrorMessages.some(msg => msg.startsWith(field))) {
            allErrorMessages.push(`${field}: ${error._errors.join(', ')}`);
          }
        });
        
        console.log("Sending validation error response:", {
          primaryMessage: primaryErrorMessage,
          allErrors: allErrorMessages
        });
        
        return res.status(400).json({ 
          message: primaryErrorMessage, 
          errors: allErrorMessages
        });
      }
      
      const data = validationResult.data;
      
      // Check if email already exists
      const existingUser = await storage.getUserByEmail(data.email);
      if (existingUser) {
        return res.status(400).json({ message: "Email already in use" });
      }
      
      // Hash the password before storing it
      const hashedPassword = await hashPassword(data.password);
      
      // Create user with hashed password
      const user = await storage.createUser({
        ...data,
        password: hashedPassword
      });
      
      if (!user) {
        return res.status(500).json({ message: "Failed to create user" });
      }
      
      // Create session
      const session = await storage.createSession(user.id);
      
      // Set session cookie - expires when browser is closed (no maxAge)
      res.cookie("sessionId", session.id, {
        httpOnly: true,
        sameSite: "strict",
        secure: process.env.NODE_ENV === "production"
      });
      
      // Log successful registration
      console.log(`New user registered: ${user.email} (ID: ${user.id})`);
      
      // Send user info (without password)
      const { password, ...userWithoutPassword } = user;
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      if (error instanceof ZodError) {
        console.error("Registration ZodError:", error.errors);
        res.status(400).json({ 
          message: "Invalid input data. Please check all fields and try again.", 
          errors: error.errors 
        });
      } else {
        console.error("Registration error:", error);
        res.status(500).json({ message: "Server error while creating account. Please try again later." });
      }
    }
  });
  
  // Login
  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      const data = loginUserSchema.parse(req.body);
      
      // Get user by email
      const user = await storage.getUserByEmail(data.email);
      
      // Verify captcha if provided
      if (data.captcha) {
        // Check in both the memory session (req.session) and the database session (via cookies)
        let expectedCaptcha = req.session?.captchaText;
        console.log("Memory session captcha:", expectedCaptcha);
        
        // If not in memory session, try to get from database session
        if (!expectedCaptcha && req.cookies.sessionId) {
          const session = await storage.getSessionById(req.cookies.sessionId);
          expectedCaptcha = session?.captchaText || undefined;
          console.log("Database session captcha:", expectedCaptcha);
        }
        
        console.log("Provided captcha:", data.captcha);
        console.log("Expected captcha:", expectedCaptcha);
        
        if (!expectedCaptcha || data.captcha !== expectedCaptcha) {
          return res.status(400).json({ 
            message: "Incorrect security code. Please try again.",
            requireCaptcha: true 
          });
        }
        
        // Clear the captcha after verification
        if (req.session) {
          req.session.captchaText = undefined;
        }
        
        if (req.cookies.sessionId) {
          await storage.updateSessionCaptcha(req.cookies.sessionId, ""); // Clear it in the database
        }
      }
      
      // Check if captcha is required but not provided
      if (user && user.loginAttempts && user.loginAttempts >= 3 && !data.captcha) {
        return res.status(400).json({ 
          message: "Security code is required for this account.",
          requireCaptcha: true 
        });
      }
      if (!user) {
        return res.status(401).json({ message: "User not found. Please check your email address." });
      }
      
      // Check for account lockout
      const now = new Date();
      if (user.lockUntil && user.lockUntil > now) {
        const minutesLeft = Math.ceil((user.lockUntil.getTime() - now.getTime()) / (60 * 1000));
        return res.status(401).json({ 
          message: `Account temporarily locked. Please try again in ${minutesLeft} minute${minutesLeft !== 1 ? 's' : ''}.` 
        });
      }
      
      // Check password
      const passwordMatch = await comparePassword(data.password, user.password);
      if (!passwordMatch) {
        // Increment login attempts
        const loginAttempts = (user.loginAttempts || 0) + 1;
        const updateData: any = { loginAttempts };
        
        // If 5 or more attempts, lock the account for 30 minutes
        if (loginAttempts >= 5) {
          const lockUntil = new Date();
          lockUntil.setMinutes(lockUntil.getMinutes() + 30);
          updateData.lockUntil = lockUntil;
        }
        
        await storage.updateUser(user.id, updateData);
        
        return res.status(401).json({ 
          message: `Incorrect password. ${5 - loginAttempts} attempt${loginAttempts !== 4 ? 's' : ''} remaining.`,
          requireCaptcha: loginAttempts >= 3
        });
      }
      
      // Reset login attempts on successful login
      if ((user.loginAttempts && user.loginAttempts > 0) || user.lockUntil) {
        await storage.updateUser(user.id, {
          loginAttempts: 0,
          lockUntil: null
        });
      }
      
      // Create session
      const session = await storage.createSession(user.id);
      
      // Set session cookie - expires when browser is closed (no maxAge)
      res.cookie("sessionId", session.id, {
        httpOnly: true,
        sameSite: "strict",
        secure: process.env.NODE_ENV === "production"
      });
      
      // Log user data for debugging
      console.log("Login success - User data:", {
        id: user.id,
        email: user.email,
        role: user.role,
        roleType: typeof user.role
      });
      
      // Send user info (without password)
      const { password, ...userWithoutPassword } = user;
      
      // Ensure role is properly sent with detailed logging
      console.log("Login successful - Raw user data from DB:", {
        id: user.id,
        email: user.email,
        role: user.role,
        roleType: typeof user.role
      });
      
      // Create a clean user object with explicit role handling
      const userData = {
        ...userWithoutPassword,
        // Normalize role to avoid any type issues
        role: user.role ? String(user.role) : 'user'
      };
      
      console.log("Sending user data to client:", userData);
      
      res.json(userData);
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ message: "Invalid input", errors: error.errors });
      } else {
        console.error("Login error:", error);
        res.status(500).json({ message: "Login failed due to a server error. Please try again later." });
      }
    }
  });
  
  // Logout
  app.post("/api/auth/logout", async (req: Request, res: Response) => {
    try {
      // Get sessionId from cookie
      const sessionId = req.cookies.sessionId;
      
      // Clear session if sessionId exists
      if (sessionId) {
        console.log("Logging out session:", sessionId);
        await storage.deleteSession(sessionId);
      } else {
        console.log("No sessionId found in cookies during logout");
      }
      
      // Clear cookie
      res.clearCookie("sessionId");
      
      res.status(200).json({ message: "Logged out successfully" });
    } catch (error) {
      console.error("Logout error:", error);
      res.status(500).json({ message: "Logout failed" });
    }
  });
  
  // We already have the session interface declared at the top of the file

  // Generate simple captcha for login attempts
  app.get("/api/auth/captcha", async (req: Request, res: Response) => {
    try {
      // Generate a random 6-digit number for simplicity
      const captchaText = Math.floor(100000 + Math.random() * 900000).toString();
      
      // Create a temporary session if one doesn't exist
      if (!req.user) {
        // Create a 15-minute session for captcha
        const tempUser = await storage.getUserByEmail("admin@localhost.localdomain");
        if (!tempUser) {
          return res.status(500).json({ message: "Failed to generate captcha session" });
        }
        
        const session = await storage.createSession(tempUser.id);
        
        // Update session with captcha text
        await storage.updateSessionCaptcha(session.id, captchaText);
        
        // Set the session ID in a cookie
        res.cookie('sessionId', session.id, { 
          httpOnly: true,
          sameSite: 'strict',
          secure: process.env.NODE_ENV === 'production',
          maxAge: 15 * 60 * 1000 // 15 minutes
        });
        
        // Also store in memory session for compatibility
        if (req.session) {
          req.session.captchaText = captchaText;
        }
      } else if (req.session) {
        // User is logged in, use their existing session
        req.session.captchaText = captchaText;
        
        // Also update the database session if we have the ID
        if (req.cookies.sessionId) {
          await storage.updateSessionCaptcha(req.cookies.sessionId, captchaText);
        }
      }
      
      console.log("Generated captcha:", captchaText); // Logging for debugging
      
      // Return the captcha text for display
      res.json({ captcha: captchaText });
    } catch (error) {
      console.error("Captcha generation error:", error);
      res.status(500).json({ message: "Failed to generate captcha" });
    }
  });
  
  // Get current user
  app.get("/api/auth/me", requireAuth, async (req: Request, res: Response) => {
    try {
      // Get full user data from storage
      const user = await storage.getUserById(req.user!.id);
      
      if (!user) {
        console.error(`User not found in DB with ID: ${req.user!.id}`);
        return res.status(404).json({ message: "User not found" });
      }
      
      // Log the user data to debug
      console.log("User data from /api/auth/me endpoint:", {
        id: user.id,
        email: user.email,
        role: user.role,
        roleType: typeof user.role
      });
      
      // Remove sensitive data
      const { password, ...userWithoutPassword } = user;
      
      // Ensure role is properly sent with detailed logging
      console.log("Auth/me endpoint - Raw user data from DB:", {
        id: user.id,
        email: user.email,
        role: user.role,
        roleType: typeof user.role
      });
      
      // Create a clean user object with explicit role handling
      const userData = {
        ...userWithoutPassword,
        // Normalize role to avoid any type issues
        role: user.role ? String(user.role) : 'user'
      };
      
      console.log("Auth/me sending user data to client:", userData);
      
      res.json(userData);
    } catch (error) {
      console.error("Get user error:", error);
      res.status(500).json({ message: "Failed to get user data" });
    }
  });
  
  // Update user profile
  app.put("/api/auth/profile", requireAuth, async (req: Request, res: Response) => {
    try {
      const { firstName, lastName, email, phone } = req.body;
      
      console.log("Profile update request:", { firstName, lastName, email, phone });
      
      // Validate inputs
      if (!firstName || !lastName || !email) {
        return res.status(400).json({ message: "First name, last name, and email are required" });
      }
      
      // Check if email is being changed and already exists
      if (email !== req.user!.email) {
        const existingUser = await storage.getUserByEmail(email);
        if (existingUser && existingUser.id !== req.user!.id) {
          return res.status(400).json({ message: "Email already in use" });
        }
      }
      
      // Update user with correct field names
      const updatedUser = await storage.updateUser(req.user!.id, {
        firstName,
        lastName,
        email,
        phone
      });
      
      console.log("User updated:", updatedUser);
      
      if (!updatedUser) {
        return res.status(500).json({ message: "Failed to update profile" });
      }
      
      // Return updated user without password
      const { password, ...userWithoutPassword } = updatedUser;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Update profile error:", error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });
  
  // Update user password
  app.put("/api/auth/password", requireAuth, async (req: Request, res: Response) => {
    try {
      const { currentPassword, newPassword } = req.body;
      
      // Validate inputs
      if (!currentPassword || !newPassword) {
        return res.status(400).json({ message: "Current password and new password are required" });
      }
      
      // Get user
      const user = await storage.getUserById(req.user!.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Check current password
      const passwordMatch = await comparePassword(currentPassword, user.password);
      if (!passwordMatch) {
        return res.status(401).json({ message: "Current password is incorrect" });
      }
      
      // Hash new password
      const hashedPassword = await hashPassword(newPassword);
      
      // Update password
      const updatedUser = await storage.updateUser(req.user!.id, {
        password: hashedPassword
      });
      
      if (!updatedUser) {
        return res.status(500).json({ message: "Failed to update password" });
      }
      
      res.json({ message: "Password updated successfully" });
    } catch (error) {
      console.error("Update password error:", error);
      res.status(500).json({ message: "Failed to update password" });
    }
  });
  
  // Address routes
  
  // Get user addresses
  app.get("/api/addresses", requireAuth, async (req: Request, res: Response) => {
    try {
      const addresses = await storage.getAddressesByUserId(req.user!.id);
      res.json(addresses);
    } catch (error) {
      console.error("Get addresses error:", error);
      res.status(500).json({ message: "Failed to fetch addresses" });
    }
  });
  
  // Add address
  app.post("/api/addresses", requireAuth, async (req: Request, res: Response) => {
    try {
      const data = insertAddressSchema.parse({
        ...req.body,
        userId: req.user!.id
      });
      
      const address = await storage.createAddress(data);
      res.status(201).json(address);
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ message: "Invalid input", errors: error.errors });
      } else {
        console.error("Create address error:", error);
        res.status(500).json({ message: "Failed to create address" });
      }
    }
  });
  
  // Update address
  app.put("/api/addresses/:id", requireAuth, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid address ID" });
      }
      
      // Check if address belongs to user
      const address = await storage.getAddress(id);
      if (!address || address.userId !== req.user!.id) {
        return res.status(404).json({ message: "Address not found" });
      }
      
      const updatedAddress = await storage.updateAddress(id, req.body);
      res.json(updatedAddress);
    } catch (error) {
      console.error("Update address error:", error);
      res.status(500).json({ message: "Failed to update address" });
    }
  });
  
  // Delete address
  app.delete("/api/addresses/:id", requireAuth, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid address ID" });
      }
      
      // Check if address belongs to user
      const address = await storage.getAddress(id);
      if (!address || address.userId !== req.user!.id) {
        return res.status(404).json({ message: "Address not found" });
      }
      
      await storage.deleteAddress(id);
      res.status(204).end();
    } catch (error) {
      console.error("Delete address error:", error);
      res.status(500).json({ message: "Failed to delete address" });
    }
  });
  
  // Wishlist routes
  
  // Get user wishlist
  app.get("/api/wishlist", requireAuth, async (req: Request, res: Response) => {
    try {
      const wishlist = await storage.getWishlistByUserId(req.user!.id);
      res.json(wishlist);
    } catch (error) {
      console.error("Get wishlist error:", error);
      res.status(500).json({ message: "Failed to fetch wishlist" });
    }
  });
  
  // Add to wishlist
  app.post("/api/wishlist", requireAuth, async (req: Request, res: Response) => {
    try {
      const data = insertWishlistSchema.parse({
        ...req.body,
        userId: req.user!.id
      });
      
      const wishlistItem = await storage.addToWishlist(data);
      res.status(201).json(wishlistItem);
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ message: "Invalid input", errors: error.errors });
      } else {
        console.error("Add to wishlist error:", error);
        res.status(500).json({ message: "Failed to add to wishlist" });
      }
    }
  });
  
  // Remove from wishlist
  app.delete("/api/wishlist/:productId", requireAuth, async (req: Request, res: Response) => {
    try {
      const productId = parseInt(req.params.productId);
      if (isNaN(productId)) {
        return res.status(400).json({ message: "Invalid product ID" });
      }
      
      await storage.removeFromWishlist(req.user!.id, productId);
      res.status(204).end();
    } catch (error) {
      console.error("Remove from wishlist error:", error);
      res.status(500).json({ message: "Failed to remove from wishlist" });
    }
  });
  
  // Review routes
  
  // Get product reviews
  app.get("/api/products/:id/reviews", async (req: Request, res: Response) => {
    try {
      const productId = parseInt(req.params.id);
      if (isNaN(productId)) {
        return res.status(400).json({ message: "Invalid product ID" });
      }
      
      const reviews = await storage.getReviewsByProductId(productId);
      res.json(reviews);
    } catch (error) {
      console.error("Get reviews error:", error);
      res.status(500).json({ message: "Failed to fetch reviews" });
    }
  });
  
  // Add/update product review
  app.post("/api/products/:id/reviews", requireAuth, async (req: Request, res: Response) => {
    try {
      const productId = parseInt(req.params.id);
      if (isNaN(productId)) {
        return res.status(400).json({ message: "Invalid product ID" });
      }
      
      const data = insertReviewSchema.parse({
        ...req.body,
        userId: req.user!.id,
        productId
      });
      
      const review = await storage.createReview(data);
      res.status(201).json(review);
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ message: "Invalid input", errors: error.errors });
      } else {
        console.error("Create review error:", error);
        res.status(500).json({ message: "Failed to create review" });
      }
    }
  });
  
  // Cart routes
  
  // Get user cart
  app.get("/api/cart", requireAuth, async (req: Request, res: Response) => {
    try {
      const cartItems = await storage.getCartWithItems(req.user!.id);
      res.json(cartItems || []);
    } catch (error) {
      console.error("Get cart error:", error);
      res.status(500).json({ message: "Failed to fetch cart" });
    }
  });
  
  // Add item to cart
  app.post("/api/cart/items", requireAuth, async (req: Request, res: Response) => {
    try {
      // Get or create cart
      let cart = await storage.getCartByUserId(req.user!.id);
      if (!cart) {
        cart = await storage.createCart({ userId: req.user!.id });
      }
      
      const data = insertCartItemSchema.parse({
        ...req.body,
        cartId: cart.id
      });
      
      const cartItem = await storage.addItemToCart(data);
      res.status(201).json(cartItem);
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ message: "Invalid input", errors: error.errors });
      } else {
        console.error("Add to cart error:", error);
        res.status(500).json({ message: "Failed to add to cart" });
      }
    }
  });
  
  // Update cart item quantity
  app.put("/api/cart/items/:id", requireAuth, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid cart item ID" });
      }
      
      const { quantity } = req.body;
      if (typeof quantity !== "number" || quantity < 1) {
        return res.status(400).json({ message: "Quantity must be a positive number" });
      }
      
      const cartItem = await storage.updateCartItem(id, quantity);
      if (!cartItem) {
        return res.status(404).json({ message: "Cart item not found" });
      }
      
      res.json(cartItem);
    } catch (error) {
      console.error("Update cart item error:", error);
      res.status(500).json({ message: "Failed to update cart item" });
    }
  });
  
  // Remove item from cart
  app.delete("/api/cart/items/:id", requireAuth, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid cart item ID" });
      }
      
      await storage.removeCartItem(id);
      res.status(204).end();
    } catch (error) {
      console.error("Remove cart item error:", error);
      res.status(500).json({ message: "Failed to remove cart item" });
    }
  });
  
  // Clear cart
  app.delete("/api/cart", requireAuth, async (req: Request, res: Response) => {
    try {
      await storage.clearCart(req.user!.id);
      res.status(204).end();
    } catch (error) {
      console.error("Clear cart error:", error);
      res.status(500).json({ message: "Failed to clear cart" });
    }
  });
  
  // Order routes
  
  // Get user orders
  app.get("/api/orders", requireAuth, async (req: Request, res: Response) => {
    try {
      const orders = await storage.getOrdersByUserId(req.user!.id);
      res.json(orders);
    } catch (error) {
      console.error("Get orders error:", error);
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });
  
  // Get order details
  app.get("/api/orders/:id", requireAuth, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid order ID" });
      }
      
      const order = await storage.getOrderWithItems(id);
      if (!order || order.userId !== req.user!.id) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      res.json(order);
    } catch (error) {
      console.error("Get order error:", error);
      res.status(500).json({ message: "Failed to fetch order" });
    }
  });
  
  // Create order (checkout)
  app.post("/api/orders", requireAuth, async (req: Request, res: Response) => {
    try {
      console.log("Order creation request body:", JSON.stringify(req.body));
      // Extract data from request body
      const { shippingAddressId, billingAddressId, notes } = req.body;
      console.log("Extracted values:", { shippingAddressId, billingAddressId, notes });
      
      // Validate addresses
      const shippingId = parseInt(String(shippingAddressId));
      const billingId = parseInt(String(billingAddressId));
      console.log("Parsed IDs:", { shippingId, billingId });
      
      const shippingAddress = await storage.getAddress(shippingId);
      const billingAddress = await storage.getAddress(billingId);
      
      if (!shippingAddress || shippingAddress.userId !== req.user!.id) {
        return res.status(400).json({ message: "Invalid shipping address" });
      }
      
      if (!billingAddress || billingAddress.userId !== req.user!.id) {
        return res.status(400).json({ message: "Invalid billing address" });
      }
      
      // Get cart items
      const cartItems = await storage.getCartWithItems(req.user!.id);
      if (!cartItems || cartItems.length === 0) {
        return res.status(400).json({ message: "Cart is empty" });
      }
      
      // Calculate order total
      const total = cartItems.reduce((sum, item) => {
        return sum + (item.product.price * item.quantity);
      }, 0);
      
      // Create order
      // Build the order data ensuring all fields have proper types
      const orderData = {
        userId: req.user!.id,
        orderNumber: storage.generateOrderNumber(),
        total,
        shippingAddressId: shippingId,
        billingAddressId: billingId,
        notes: notes || null,
        status: 'pending' as const, // Use 'as const' to correctly type the enum
        paymentStatus: 'pending' as const // Use 'as const' to correctly type the enum
      };
      
      console.log("Preparing order data:", orderData);
      
      // Now parse the data through the schema
      const validatedOrderData = insertOrderSchema.parse(orderData);
      
      // Create order items
      const orderItemsData = cartItems.map(item => insertOrderItemSchema.parse({
        productId: item.productId,
        quantity: item.quantity,
        price: item.product.price
      }));
      
      const order = await storage.createOrder(validatedOrderData, orderItemsData);
      
      // Clear cart
      await storage.clearCart(req.user!.id);
      
      res.status(201).json(order);
    } catch (error) {
      if (error instanceof ZodError) {
        console.error("Zod validation error:", JSON.stringify(error.errors, null, 2));
        console.error("Failed at:", error.issues.map(issue => issue.path).join(', '));
        res.status(400).json({ message: "Invalid input", errors: error.errors });
      } else {
        console.error("Create order error:", error);
        res.status(500).json({ message: "Failed to create order" });
      }
    }
  });
  
  // Enquiry routes
  
  // Submit enquiry
  app.post("/api/enquiries", async (req: Request, res: Response) => {
    try {
      const data = insertEnquirySchema.parse({
        ...req.body,
        userId: req.user?.id
      });
      
      const enquiry = await storage.createEnquiry(data);
      res.status(201).json(enquiry);
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ message: "Invalid input", errors: error.errors });
      } else {
        console.error("Create enquiry error:", error);
        res.status(500).json({ message: "Failed to submit enquiry" });
      }
    }
  });
  
  // Get user enquiries
  app.get("/api/enquiries", requireAuth, async (req: Request, res: Response) => {
    try {
      const enquiries = await storage.getEnquiriesByUserId(req.user!.id);
      res.json(enquiries);
    } catch (error) {
      console.error("Get enquiries error:", error);
      res.status(500).json({ message: "Failed to fetch enquiries" });
    }
  });
  
  // Payment routes with Stripe
  
  // Create payment intent
  app.post("/api/create-payment-intent", async (req: Request, res: Response) => {
    try {
      if (!stripe) {
        return res.status(500).json({ message: "Stripe is not configured. Please provide STRIPE_SECRET_KEY." });
      }
      
      // Check if request is for an order or direct payment
      if (req.body.orderId) {
        // Order-based payment flow (requires authentication)
        if (!req.user) {
          return res.status(401).json({ message: "Authentication required for order payments" });
        }
        
        const { orderId } = req.body;
        
        // Validate order
        const order = await storage.getOrderById(parseInt(orderId));
        if (!order || order.userId !== req.user.id) {
          return res.status(404).json({ message: "Order not found" });
        }
        
        // Check if order already has payment intent
        if (order.stripePaymentIntentId) {
          const paymentIntent = await stripe.paymentIntents.retrieve(order.stripePaymentIntentId);
          return res.json({ clientSecret: paymentIntent.client_secret });
        }
        
        // Create payment intent
        const paymentIntent = await stripe.paymentIntents.create({
          amount: Math.round(order.total * 100), // Convert to cents
          currency: "usd",
          metadata: {
            orderId: order.id.toString(),
            orderNumber: order.orderNumber
          }
        });
        
        // Update order with payment intent ID
        await storage.updatePaymentStatus(
          order.id, 
          'processing',
          paymentIntent.id
        );
        
        res.json({ clientSecret: paymentIntent.client_secret });
      } else if (req.body.amount) {
        // Direct payment flow (standalone payment without an order)
        const { amount } = req.body;
        
        if (typeof amount !== 'number' || amount <= 0) {
          return res.status(400).json({ message: "Valid amount is required" });
        }
        
        // Create payment intent for direct payment
        const paymentIntent = await stripe.paymentIntents.create({
          amount: Math.round(amount * 100), // Convert to cents
          currency: "usd",
          metadata: {
            type: "direct_payment",
            userId: req.user?.id?.toString() || 'guest'
          }
        });
        
        res.json({ clientSecret: paymentIntent.client_secret });
      } else {
        res.status(400).json({ message: "Either orderId or amount is required" });
      }
    } catch (error) {
      console.error("Create payment intent error:", error);
      res.status(500).json({ message: "Failed to create payment intent" });
    }
  });
  
  // Create a raw body middleware specifically for this route
  const rawBodyMiddleware = (req: Request, res: Response, next: NextFunction) => {
    if (req.headers['content-type'] === 'application/json') {
      let data = '';
      req.setEncoding('utf8');
      req.on('data', (chunk) => {
        data += chunk;
      });
      req.on('end', () => {
        (req as any).rawBody = data;
        next();
      });
    } else {
      next();
    }
  };

  // Webhook for Stripe events
  app.post("/api/webhook", rawBodyMiddleware, async (req: Request, res: Response) => {
    if (!stripe) {
      return res.status(500).json({ message: "Stripe is not configured. Please provide STRIPE_SECRET_KEY." });
    }
    
    const sig = req.headers["stripe-signature"];
    
    if (!sig) {
      return res.status(400).json({ message: "Missing Stripe signature" });
    }
    
    if (!process.env.STRIPE_WEBHOOK_SECRET) {
      return res.status(500).json({ message: "Stripe webhook secret is not configured" });
    }
    
    let event;
    
    try {
      // Check if we're in development mode and a test flag is provided
      const isTestMode = process.env.NODE_ENV !== 'production' && req.query.test === 'true';
      
      if (isTestMode) {
        // In test mode, parse the body directly without signature validation
        event = JSON.parse((req as any).rawBody || JSON.stringify(req.body));
        console.log("Webhook test mode: bypassing signature verification");
      } else {
        // In production mode, verify the signature
        event = stripe.webhooks.constructEvent(
          (req as any).rawBody || JSON.stringify(req.body),
          sig,
          process.env.STRIPE_WEBHOOK_SECRET
        );
      }
    } catch (err) {
      console.error("Webhook signature verification failed:", err);
      return res.status(400).send(`Webhook Error: ${err}`);
    }
    
    // Handle the event
    switch (event.type) {
      case "payment_intent.succeeded":
        const paymentIntent = event.data.object;
        
        // Update order status
        if (paymentIntent.metadata.orderId) {
          const orderId = parseInt(paymentIntent.metadata.orderId);
          await storage.updatePaymentStatus(orderId, "completed");
          await storage.updateOrderStatus(orderId, "processing");
        }
        break;
        
      case "payment_intent.payment_failed":
        const failedPaymentIntent = event.data.object;
        
        // Update order status
        if (failedPaymentIntent.metadata.orderId) {
          const orderId = parseInt(failedPaymentIntent.metadata.orderId);
          await storage.updatePaymentStatus(orderId, "failed");
        }
        break;
        
      default:
        // Unexpected event type
        console.log(`Unhandled event type ${event.type}`);
    }
    
    // Return a 200 response to acknowledge receipt of the event
    res.send();
  });
  
  // Product routes
  app.get("/api/products", async (_req: Request, res: Response) => {
    try {
      const products = await storage.getAllProducts();
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });

  app.get("/api/products/featured", async (_req: Request, res: Response) => {
    try {
      const product = await storage.getFeaturedProduct();
      if (product) {
        res.json(product);
      } else {
        res.status(404).json({ message: "Featured product not found" });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch featured product" });
    }
  });
  
  // Search products
  app.get("/api/products/search", async (req: Request, res: Response) => {
    try {
      const query = req.query.q as string;
      if (!query) {
        return res.status(400).json({ message: "Search query is required" });
      }
      
      const products = await storage.searchProducts(query);
      res.json(products);
    } catch (error) {
      console.error("Search products error:", error);
      res.status(500).json({ message: "Failed to search products" });
    }
  });
  
  // Get products by category
  app.get("/api/categories/:id/products", async (req: Request, res: Response) => {
    try {
      const categoryId = parseInt(req.params.id);
      if (isNaN(categoryId)) {
        return res.status(400).json({ message: "Invalid category ID" });
      }
      
      const products = await storage.getProductsByCategory(categoryId);
      res.json(products);
    } catch (error) {
      console.error("Get products by category error:", error);
      res.status(500).json({ message: "Failed to fetch products by category" });
    }
  });

  app.get("/api/products/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid product ID" });
      }
      
      const product = await storage.getProduct(id);
      if (product) {
        res.json(product);
      } else {
        res.status(404).json({ message: "Product not found" });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch product" });
    }
  });

  // Category routes
  app.get("/api/categories", async (_req: Request, res: Response) => {
    try {
      const categories = await storage.getAllCategories();
      res.json(categories);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  // Lifestyle section
  app.get("/api/lifestyle", async (_req: Request, res: Response) => {
    try {
      const items = await storage.getAllLifestyleItems();
      res.json(items);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch lifestyle items" });
    }
  });

  // Newsletter subscription
  app.post("/api/newsletter", async (req: Request, res: Response) => {
    try {
      const data = insertNewsletterSubscriptionSchema.parse(req.body);
      const subscription = await storage.createNewsletterSubscription(data);
      res.status(201).json(subscription);
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ message: "Invalid input", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to process subscription" });
      }
    }
  });
  
  // ===================== Admin Routes =====================
  
  // Get all users (admin only)
  app.get("/api/admin/users", requireAdmin, async (req: Request, res: Response) => {
    try {
      const users = await storage.getAllUsers();
      // Remove passwords from the response
      const usersWithoutPasswords = users.map(user => {
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
      });
      res.json(usersWithoutPasswords);
    } catch (error) {
      console.error("Get all users error:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });
  
  // Get all products (admin only)
  app.get("/api/admin/products", requireAdmin, async (req: Request, res: Response) => {
    try {
      const products = await storage.getAllProducts();
      res.json(products);
    } catch (error) {
      console.error("Get all products error:", error);
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });
  
  // Create product (admin only)
  app.post("/api/admin/products", requireAdmin, async (req: Request, res: Response) => {
    try {
      const product = await storage.createProduct(req.body);
      res.status(201).json(product);
    } catch (error) {
      console.error("Create product error:", error);
      res.status(500).json({ message: "Failed to create product" });
    }
  });
  
  // Update product (admin only)
  app.put("/api/admin/products/:id", requireAdmin, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid product ID" });
      }
      
      const product = await storage.updateProduct(id, req.body);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      res.json(product);
    } catch (error) {
      console.error("Update product error:", error);
      res.status(500).json({ message: "Failed to update product" });
    }
  });
  
  // Delete product (admin only)
  app.delete("/api/admin/products/:id", requireAdmin, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid product ID" });
      }
      
      await storage.deleteProduct(id);
      res.status(204).end();
    } catch (error) {
      console.error("Delete product error:", error);
      res.status(500).json({ message: "Failed to delete product" });
    }
  });
  
  // Get all categories (admin only)
  app.get("/api/admin/categories", requireAdmin, async (req: Request, res: Response) => {
    try {
      const categories = await storage.getAllCategories();
      res.json(categories);
    } catch (error) {
      console.error("Get all categories error:", error);
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });
  
  // Create category (admin only)
  app.post("/api/admin/categories", requireAdmin, async (req: Request, res: Response) => {
    try {
      const category = await storage.createCategory(req.body);
      res.status(201).json(category);
    } catch (error) {
      console.error("Create category error:", error);
      res.status(500).json({ message: "Failed to create category" });
    }
  });
  
  // Update category (admin only)
  app.put("/api/admin/categories/:id", requireAdmin, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid category ID" });
      }
      
      const category = await storage.updateCategory(id, req.body);
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }
      
      res.json(category);
    } catch (error) {
      console.error("Update category error:", error);
      res.status(500).json({ message: "Failed to update category" });
    }
  });
  
  // Delete category (admin only)
  app.delete("/api/admin/categories/:id", requireAdmin, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid category ID" });
      }
      
      await storage.deleteCategory(id);
      res.status(204).end();
    } catch (error) {
      console.error("Delete category error:", error);
      res.status(500).json({ message: "Failed to delete category" });
    }
  });
  
  // Get all orders (admin only)
  app.get("/api/admin/orders", requireAdmin, async (req: Request, res: Response) => {
    try {
      const orders = await storage.getAllOrders();
      res.json(orders);
    } catch (error) {
      console.error("Get all orders error:", error);
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });
  
  // Update order status (admin only)
  app.put("/api/admin/orders/:id/status", requireAdmin, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid order ID" });
      }
      
      const { status } = req.body;
      if (!status || !["pending", "processing", "shipped", "delivered", "cancelled"].includes(status)) {
        return res.status(400).json({ message: "Invalid status value" });
      }
      
      const order = await storage.updateOrderStatus(id, status);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      res.json(order);
    } catch (error) {
      console.error("Update order status error:", error);
      res.status(500).json({ message: "Failed to update order status" });
    }
  });
  
  // Get all enquiries (admin only)
  app.get("/api/admin/enquiries", requireAdmin, async (req: Request, res: Response) => {
    try {
      const enquiries = await storage.getAllEnquiries();
      res.json(enquiries);
    } catch (error) {
      console.error("Get all enquiries error:", error);
      res.status(500).json({ message: "Failed to fetch enquiries" });
    }
  });
  
  // Resolve enquiry (admin only)
  app.put("/api/admin/enquiries/:id/resolve", requireAdmin, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid enquiry ID" });
      }
      
      const enquiry = await storage.resolveEnquiry(id);
      if (!enquiry) {
        return res.status(404).json({ message: "Enquiry not found" });
      }
      
      res.json(enquiry);
    } catch (error) {
      console.error("Resolve enquiry error:", error);
      res.status(500).json({ message: "Failed to resolve enquiry" });
    }
  });
  
  // Get all newsletter subscriptions (admin only)
  app.get("/api/admin/newsletter-subscriptions", requireAdmin, async (req: Request, res: Response) => {
    try {
      const subscriptions = await storage.getAllNewsletterSubscriptions();
      res.json(subscriptions);
    } catch (error) {
      console.error("Get all newsletter subscriptions error:", error);
      res.status(500).json({ message: "Failed to fetch newsletter subscriptions" });
    }
  });
  
  // Get all reviews (admin only)
  app.get("/api/admin/reviews", requireAdmin, async (req: Request, res: Response) => {
    try {
      const reviews = await storage.getAllReviews();
      res.json(reviews);
    } catch (error) {
      console.error("Get all reviews error:", error);
      res.status(500).json({ message: "Failed to fetch reviews" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
