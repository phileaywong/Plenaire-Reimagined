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
import { authenticate, requireAuth } from "./middleware/auth";
import { comparePassword } from "./utils/password";
import Stripe from "stripe";
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
      const data = insertUserSchema.parse(req.body);
      
      // Check if email already exists
      const existingUser = await storage.getUserByEmail(data.email);
      if (existingUser) {
        return res.status(400).json({ message: "Email already in use" });
      }
      
      // Create user
      const user = await storage.createUser(data);
      if (!user) {
        return res.status(500).json({ message: "Failed to create user" });
      }
      
      // Create session
      const session = await storage.createSession(user.id);
      
      // Set session cookie
      res.cookie("sessionId", session.id, {
        httpOnly: true,
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        sameSite: "strict",
        secure: process.env.NODE_ENV === "production"
      });
      
      // Send user info (without password)
      const { password, ...userWithoutPassword } = user;
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ message: "Invalid input", errors: error.errors });
      } else {
        console.error("Registration error:", error);
        res.status(500).json({ message: "Registration failed" });
      }
    }
  });
  
  // Login
  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      const data = loginUserSchema.parse(req.body);
      
      // Get user by email
      const user = await storage.getUserByEmail(data.email);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      // Check password
      const passwordMatch = await comparePassword(data.password, user.password);
      if (!passwordMatch) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      // Create session
      const session = await storage.createSession(user.id);
      
      // Set session cookie
      res.cookie("sessionId", session.id, {
        httpOnly: true,
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        sameSite: "strict",
        secure: process.env.NODE_ENV === "production"
      });
      
      // Send user info (without password)
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ message: "Invalid input", errors: error.errors });
      } else {
        console.error("Login error:", error);
        res.status(500).json({ message: "Login failed" });
      }
    }
  });
  
  // Logout
  app.post("/api/auth/logout", async (req: Request, res: Response) => {
    try {
      // Clear session if exists
      if (req.session?.id) {
        await storage.deleteSession(req.session.id);
      }
      
      // Clear cookie
      res.clearCookie("sessionId");
      
      res.json({ message: "Logged out successfully" });
    } catch (error) {
      console.error("Logout error:", error);
      res.status(500).json({ message: "Logout failed" });
    }
  });
  
  // Get current user
  app.get("/api/auth/me", requireAuth, (req: Request, res: Response) => {
    res.json(req.user);
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
      const hashedPassword = await require('./utils/password').hashPassword(newPassword);
      
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
      const { shippingAddressId, billingAddressId, notes } = req.body;
      
      // Validate addresses
      const shippingAddress = await storage.getAddress(shippingAddressId);
      const billingAddress = await storage.getAddress(billingAddressId);
      
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
      const orderData = insertOrderSchema.parse({
        userId: req.user!.id,
        orderNumber: storage.generateOrderNumber(),
        total,
        shippingAddressId,
        billingAddressId,
        notes,
        status: 'pending',
        paymentStatus: 'pending'
      });
      
      // Create order items
      const orderItemsData = cartItems.map(item => insertOrderItemSchema.parse({
        productId: item.productId,
        quantity: item.quantity,
        price: item.product.price
      }));
      
      const order = await storage.createOrder(orderData, orderItemsData);
      
      // Clear cart
      await storage.clearCart(req.user!.id);
      
      res.status(201).json(order);
    } catch (error) {
      if (error instanceof ZodError) {
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
  app.post("/api/create-payment-intent", requireAuth, async (req: Request, res: Response) => {
    try {
      if (!stripe) {
        return res.status(500).json({ message: "Stripe is not configured. Please provide STRIPE_SECRET_KEY." });
      }
      
      const { orderId } = req.body;
      
      // Validate order
      const order = await storage.getOrderById(parseInt(orderId));
      if (!order || order.userId !== req.user!.id) {
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

  const httpServer = createServer(app);
  return httpServer;
}
