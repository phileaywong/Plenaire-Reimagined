import { drizzle } from 'drizzle-orm/postgres-js';
import { eq, and, desc, sql, InferSelectModel } from 'drizzle-orm';
import postgres from 'postgres';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { 
  products, 
  categories, 
  lifestyleItems, 
  newsletterSubscriptions,
  users,
  addresses,
  wishlists,
  reviews,
  carts,
  cartItems,
  orders,
  orderItems,
  enquiries,
  sessions,
  orderStatusEnum,
  paymentStatusEnum,
  type Product, 
  type InsertProduct,
  type Category, 
  type InsertCategory,
  type LifestyleItem, 
  type InsertLifestyleItem,
  type NewsletterSubscription,
  type InsertNewsletterSubscription,
  type User,
  type InsertUser,
  type Address,
  type InsertAddress,
  type Wishlist,
  type InsertWishlist,
  type Review,
  type InsertReview,
  type Cart,
  type InsertCart,
  type CartItem,
  type InsertCartItem,
  type Order,
  type InsertOrder,
  type OrderItem,
  type InsertOrderItem,
  type Enquiry,
  type InsertEnquiry,
  type Session
} from "@shared/schema";

// Create DB client
const connectionString = process.env.DATABASE_URL;

// Define types for order and payment status from enums
type OrderStatus = typeof orderStatusEnum.enumValues[number];
type PaymentStatus = typeof paymentStatusEnum.enumValues[number];

// Storage interface
export interface IStorage {
  // User methods
  getUserById(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User | undefined>;
  updateUser(id: number, user: Partial<User>): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;
  
  // Session methods
  createSession(userId: number): Promise<Session>;
  getSessionById(id: string): Promise<Session | undefined>;
  updateSessionCaptcha(id: string, captchaText: string): Promise<Session | undefined>;
  deleteSession(id: string): Promise<void>;
  
  // Product methods
  getAllProducts(): Promise<Product[]>;
  getProduct(id: number): Promise<Product | undefined>;
  getFeaturedProduct(): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, product: Partial<Product>): Promise<Product | undefined>;
  deleteProduct(id: number): Promise<void>;
  searchProducts(query: string): Promise<Product[]>;
  getProductsByCategory(categoryId: number): Promise<Product[]>;
  
  // Category methods
  getAllCategories(): Promise<Category[]>;
  getCategory(id: number): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  updateCategory(id: number, category: Partial<Category>): Promise<Category | undefined>;
  deleteCategory(id: number): Promise<void>;
  
  // Lifestyle methods
  getAllLifestyleItems(): Promise<LifestyleItem[]>;
  getLifestyleItem(id: number): Promise<LifestyleItem | undefined>;
  createLifestyleItem(item: InsertLifestyleItem): Promise<LifestyleItem>;
  updateLifestyleItem(id: number, item: Partial<LifestyleItem>): Promise<LifestyleItem | undefined>;
  deleteLifestyleItem(id: number): Promise<void>;
  
  // Newsletter methods
  createNewsletterSubscription(subscription: InsertNewsletterSubscription): Promise<NewsletterSubscription>;
  getAllNewsletterSubscriptions(): Promise<NewsletterSubscription[]>;
  
  // Address methods
  getAddressesByUserId(userId: number): Promise<Address[]>;
  getAddress(id: number): Promise<Address | undefined>;
  createAddress(address: InsertAddress): Promise<Address>;
  updateAddress(id: number, address: Partial<Address>): Promise<Address | undefined>;
  deleteAddress(id: number): Promise<void>;
  
  // Wishlist methods
  getWishlistByUserId(userId: number): Promise<(Wishlist & { product: Product })[]>;
  addToWishlist(wishlist: InsertWishlist): Promise<Wishlist>;
  removeFromWishlist(userId: number, productId: number): Promise<void>;
  
  // Review methods
  getReviewsByProductId(productId: number): Promise<Review[]>;
  getReviewByUserAndProduct(userId: number, productId: number): Promise<Review | undefined>;
  createReview(review: InsertReview): Promise<Review>;
  updateReview(id: number, review: Partial<Review>): Promise<Review | undefined>;
  getAllReviews(): Promise<Review[]>;
  
  // Cart methods
  getCartByUserId(userId: number): Promise<Cart | undefined>;
  getCartWithItems(userId: number): Promise<(CartItem & { product: Product })[] | undefined>;
  createCart(cart: InsertCart): Promise<Cart>;
  addItemToCart(item: InsertCartItem): Promise<CartItem>;
  updateCartItem(id: number, quantity: number): Promise<CartItem | undefined>;
  removeCartItem(id: number): Promise<void>;
  clearCart(userId: number): Promise<void>;
  
  // Order methods
  getOrdersByUserId(userId: number): Promise<Order[]>;
  getOrderById(id: number): Promise<Order | undefined>;
  getOrderWithItems(id: number): Promise<(Order & { items: (OrderItem & { product: Product })[] }) | undefined>;
  createOrder(order: InsertOrder, items: InsertOrderItem[]): Promise<Order>;
  updateOrderStatus(id: number, status: OrderStatus): Promise<Order | undefined>;
  updatePaymentStatus(id: number, status: PaymentStatus, paymentIntentId?: string): Promise<Order | undefined>;
  getAllOrders(): Promise<Order[]>;
  
  // Enquiry methods
  createEnquiry(enquiry: InsertEnquiry): Promise<Enquiry>;
  getEnquiriesByUserId(userId: number): Promise<Enquiry[]>;
  getAllEnquiries(): Promise<Enquiry[]>;
  getEnquiry(id: number): Promise<Enquiry | undefined>;
  resolveEnquiry(id: number): Promise<Enquiry | undefined>;
  
  // Helper methods
  generateOrderNumber(): string;
}

export class PostgresStorage implements IStorage {
  private client;
  private db;

  constructor() {
    if (!connectionString) {
      throw new Error('DATABASE_URL is not defined');
    }
    
    // Create Postgres client
    this.client = postgres(connectionString);
    this.db = drizzle(this.client);
    
    this.initializeData();
  }

  private async initializeData() {
    // Check if we have any products
    const existingProducts = await this.getAllProducts();
    
    if (existingProducts.length === 0) {
      // Create categories
      const skincare = await this.createCategory({
        name: "Skincare",
        description: "Nourishing products for your skin",
        imageUrl: "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
      });
      
      // Create products
      await this.createProduct({
        name: "Rose Jelly Gentle Makeup Remover",
        price: 42.00,
        description: "A gentle yet effective makeup remover that transforms from a jelly to an oil, then to a milk when mixed with water. Infused with damask rose and soothing botanicals to leave skin clean, soft, and refreshed.",
        imageUrl: "https://images.unsplash.com/photo-1570194065650-d99195209a19?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
        featured: true,
        reviewCount: 124,
        ingredients: ["Damask Rose", "Jojoba Oil", "Vitamin E", "Aloe Vera"],
        categoryId: skincare.id,
        stock: 100,
        sku: "RJGMR-001"
      });
      
      await this.createProduct({
        name: "Rose Cleanser",
        price: 36.00,
        description: "A gentle daily cleanser with rose extracts to purify and hydrate skin.",
        imageUrl: "https://images.unsplash.com/photo-1594125311687-8ad3ecdca5bf?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
        featured: false,
        reviewCount: 89,
        ingredients: ["Rose Water", "Glycerin", "Green Tea Extract"],
        categoryId: skincare.id,
        stock: 100,
        sku: "RC-002"
      });
      
      await this.createProduct({
        name: "Vitamin C Serum",
        price: 58.00,
        description: "Brightening serum with stabilized vitamin C to even skin tone and boost radiance.",
        imageUrl: "https://images.unsplash.com/photo-1611080541439-ba44905e709b?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
        featured: false,
        reviewCount: 113,
        ingredients: ["Vitamin C", "Hyaluronic Acid", "Ferulic Acid"],
        categoryId: skincare.id,
        stock: 100,
        sku: "VCS-003"
      });
      
      await this.createProduct({
        name: "Hydrating Mask",
        price: 48.00,
        description: "Intensive hydrating mask with hyaluronic acid and botanical extracts.",
        imageUrl: "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
        featured: false,
        reviewCount: 76,
        ingredients: ["Hyaluronic Acid", "Aloe Vera", "Rose Water", "Ceramides"],
        categoryId: skincare.id,
        stock: 100,
        sku: "HM-004"
      });
      
      await this.createProduct({
        name: "Night Cream",
        price: 52.00,
        description: "Rich, overnight treatment to restore and replenish skin while you sleep.",
        imageUrl: "https://images.unsplash.com/photo-1616962037373-f6de60d5e964?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
        featured: false,
        reviewCount: 94,
        ingredients: ["Retinol", "Peptides", "Niacinamide", "Shea Butter"],
        categoryId: skincare.id,
        stock: 100,
        sku: "NC-005"
      });
      
      await this.createProduct({
        name: "Face Oil",
        price: 62.00,
        description: "Luxurious facial oil blend to nourish and balance all skin types.",
        imageUrl: "https://images.unsplash.com/photo-1608412082459-23532ff5e751?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
        featured: false,
        reviewCount: 67,
        ingredients: ["Argan Oil", "Rosehip Oil", "Evening Primrose Oil", "Vitamin E"],
        categoryId: skincare.id,
        stock: 100,
        sku: "FO-006"
      });
      
      await this.createProduct({
        name: "Eye Contour",
        price: 46.00,
        description: "Targeted treatment for the delicate eye area to reduce fine lines and puffiness.",
        imageUrl: "https://images.unsplash.com/photo-1592136957897-b2b6ca21e10d?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
        featured: false,
        reviewCount: 58,
        ingredients: ["Caffeine", "Peptides", "Hyaluronic Acid", "Green Tea"],
        categoryId: skincare.id,
        stock: 100,
        sku: "EC-007"
      });
      
      // Create lifestyle items
      await this.createLifestyleItem({
        title: "Morning Rituals",
        description: "Start your day with intention and radiance",
        imageUrl: "https://images.unsplash.com/photo-1556228578-8c89e6adf883?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
        link: "#morning-rituals"
      });
      
      await this.createLifestyleItem({
        title: "Evening Rituals",
        description: "Unwind and restore with our calming collection",
        imageUrl: "https://images.unsplash.com/photo-1552693673-1bf958298935?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
        link: "#evening-rituals"
      });
    }
  }

  // User methods
  async getUserById(id: number): Promise<User | undefined> {
    const result = await this.db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await this.db.select().from(users).where(eq(users.email, email)).limit(1);
    return result[0];
  }

  async createUser(user: InsertUser): Promise<User | undefined> {
    // Hash password
    const hashedPassword = await bcrypt.hash(user.password, 10);
    
    const result = await this.db.insert(users).values({
      ...user,
      password: hashedPassword,
    }).returning();
    
    return result[0];
  }

  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    // If updating password, hash it first
    if (userData.password) {
      userData.password = await bcrypt.hash(userData.password, 10);
    }
    
    const result = await this.db.update(users)
      .set({
        ...userData,
        updatedAt: new Date()
      })
      .where(eq(users.id, id))
      .returning();
    
    return result[0];
  }
  
  async getAllUsers(): Promise<User[]> {
    return this.db.select().from(users).orderBy(desc(users.createdAt));
  }
  
  // Session methods
  async createSession(userId: number): Promise<Session> {
    // Set expiry to 7 days from now
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);
    
    const result = await this.db.insert(sessions).values({
      userId,
      expiresAt
    }).returning();
    
    return result[0];
  }
  
  async getSessionById(id: string): Promise<Session | undefined> {
    const result = await this.db.select().from(sessions).where(eq(sessions.id, id)).limit(1);
    return result[0];
  }
  
  async updateSessionCaptcha(id: string, captchaText: string): Promise<Session | undefined> {
    const result = await this.db.update(sessions)
      .set({ captchaText })
      .where(eq(sessions.id, id))
      .returning();
    
    return result[0];
  }
  
  async deleteSession(id: string): Promise<void> {
    await this.db.delete(sessions).where(eq(sessions.id, id));
  }
  
  // Product methods
  async getAllProducts(): Promise<Product[]> {
    return this.db.select().from(products);
  }
  
  async getProduct(id: number): Promise<Product | undefined> {
    const result = await this.db.select().from(products).where(eq(products.id, id)).limit(1);
    return result[0];
  }
  
  async getFeaturedProduct(): Promise<Product | undefined> {
    const result = await this.db.select().from(products).where(eq(products.featured, true)).limit(1);
    return result[0];
  }
  
  async createProduct(product: InsertProduct): Promise<Product> {
    const result = await this.db.insert(products).values(product).returning();
    return result[0];
  }
  
  async updateProduct(id: number, productData: Partial<Product>): Promise<Product | undefined> {
    const result = await this.db.update(products)
      .set({
        ...productData,
        updatedAt: new Date()
      })
      .where(eq(products.id, id))
      .returning();
    
    return result[0];
  }
  
  async deleteProduct(id: number): Promise<void> {
    await this.db.delete(products).where(eq(products.id, id));
  }
  
  async searchProducts(query: string): Promise<Product[]> {
    return this.db.select().from(products).where(
      sql`to_tsvector('english', ${products.name} || ' ' || ${products.description}) @@ to_tsquery('english', ${query.replace(/\s+/g, ' & ')})`
    );
  }
  
  async getProductsByCategory(categoryId: number): Promise<Product[]> {
    return this.db.select().from(products).where(eq(products.categoryId, categoryId));
  }
  
  // Category methods
  async getAllCategories(): Promise<Category[]> {
    return this.db.select().from(categories);
  }
  
  async getCategory(id: number): Promise<Category | undefined> {
    const result = await this.db.select().from(categories).where(eq(categories.id, id)).limit(1);
    return result[0];
  }
  
  async createCategory(category: InsertCategory): Promise<Category> {
    const result = await this.db.insert(categories).values(category).returning();
    return result[0];
  }
  
  async updateCategory(id: number, category: Partial<Category>): Promise<Category | undefined> {
    const result = await this.db.update(categories)
      .set({
        ...category,
        updatedAt: new Date()
      })
      .where(eq(categories.id, id))
      .returning();
    
    return result[0];
  }
  
  async deleteCategory(id: number): Promise<void> {
    await this.db.delete(categories).where(eq(categories.id, id));
  }
  
  // Lifestyle methods
  async getAllLifestyleItems(): Promise<LifestyleItem[]> {
    return this.db.select().from(lifestyleItems);
  }
  
  async getLifestyleItem(id: number): Promise<LifestyleItem | undefined> {
    const result = await this.db.select().from(lifestyleItems).where(eq(lifestyleItems.id, id)).limit(1);
    return result[0];
  }
  
  async createLifestyleItem(item: InsertLifestyleItem): Promise<LifestyleItem> {
    const result = await this.db.insert(lifestyleItems).values(item).returning();
    return result[0];
  }
  
  async updateLifestyleItem(id: number, item: Partial<LifestyleItem>): Promise<LifestyleItem | undefined> {
    const result = await this.db.update(lifestyleItems)
      .set({
        ...item,
        updatedAt: new Date()
      })
      .where(eq(lifestyleItems.id, id))
      .returning();
    
    return result[0];
  }
  
  async deleteLifestyleItem(id: number): Promise<void> {
    await this.db.delete(lifestyleItems).where(eq(lifestyleItems.id, id));
  }
  
  // Newsletter methods
  async createNewsletterSubscription(subscription: InsertNewsletterSubscription): Promise<NewsletterSubscription> {
    const result = await this.db.insert(newsletterSubscriptions).values(subscription).returning();
    return result[0];
  }
  
  async getAllNewsletterSubscriptions(): Promise<NewsletterSubscription[]> {
    return this.db.select().from(newsletterSubscriptions).orderBy(desc(newsletterSubscriptions.createdAt));
  }
  
  // Address methods
  async getAddressesByUserId(userId: number): Promise<Address[]> {
    return this.db.select().from(addresses).where(eq(addresses.userId, userId));
  }
  
  async getAddress(id: number): Promise<Address | undefined> {
    const result = await this.db.select().from(addresses).where(eq(addresses.id, id)).limit(1);
    return result[0];
  }
  
  async createAddress(address: InsertAddress): Promise<Address> {
    // If this is a default address, make sure to unset any other default addresses for this user
    if (address.isDefault) {
      await this.db.update(addresses)
        .set({ isDefault: false })
        .where(eq(addresses.userId, address.userId));
    }
    
    const result = await this.db.insert(addresses).values(address).returning();
    return result[0];
  }
  
  async updateAddress(id: number, addressData: Partial<Address>): Promise<Address | undefined> {
    // If setting as default, unset any other defaults
    if (addressData.isDefault) {
      const address = await this.getAddress(id);
      if (address) {
        await this.db.update(addresses)
          .set({ isDefault: false })
          .where(eq(addresses.userId, address.userId));
      }
    }
    
    const result = await this.db.update(addresses)
      .set({
        ...addressData,
        updatedAt: new Date()
      })
      .where(eq(addresses.id, id))
      .returning();
    
    return result[0];
  }
  
  async deleteAddress(id: number): Promise<void> {
    await this.db.delete(addresses).where(eq(addresses.id, id));
  }
  
  // Wishlist methods
  async getWishlistByUserId(userId: number): Promise<(Wishlist & { product: Product })[]> {
    const result = await this.db.select({
      id: wishlists.id,
      userId: wishlists.userId,
      productId: wishlists.productId,
      createdAt: wishlists.createdAt,
      product: products
    })
    .from(wishlists)
    .leftJoin(products, eq(wishlists.productId, products.id))
    .where(eq(wishlists.userId, userId));
    
    return result;
  }
  
  async addToWishlist(wishlist: InsertWishlist): Promise<Wishlist> {
    // Check if already in wishlist
    const existing = await this.db.select()
      .from(wishlists)
      .where(
        and(
          eq(wishlists.userId, wishlist.userId),
          eq(wishlists.productId, wishlist.productId)
        )
      )
      .limit(1);
    
    // If already exists, return it
    if (existing.length > 0) {
      return existing[0];
    }
    
    // Otherwise create new
    const result = await this.db.insert(wishlists).values(wishlist).returning();
    return result[0];
  }
  
  async removeFromWishlist(userId: number, productId: number): Promise<void> {
    await this.db.delete(wishlists)
      .where(
        and(
          eq(wishlists.userId, userId),
          eq(wishlists.productId, productId)
        )
      );
  }
  
  // Review methods
  async getReviewsByProductId(productId: number): Promise<Review[]> {
    return this.db.select().from(reviews).where(eq(reviews.productId, productId));
  }
  
  async getReviewByUserAndProduct(userId: number, productId: number): Promise<Review | undefined> {
    const result = await this.db.select()
      .from(reviews)
      .where(
        and(
          eq(reviews.userId, userId),
          eq(reviews.productId, productId)
        )
      )
      .limit(1);
    
    return result[0];
  }
  
  async createReview(review: InsertReview): Promise<Review> {
    // Check if user already reviewed this product
    const existing = await this.getReviewByUserAndProduct(review.userId, review.productId);
    
    if (existing) {
      // Update existing review
      const updated = await this.updateReview(existing.id, {
        rating: review.rating,
        comment: review.comment
      });
      return updated!;
    }
    
    // Create new review
    const result = await this.db.insert(reviews).values(review).returning();
    
    // Update product review count
    const product = await this.getProduct(review.productId);
    if (product) {
      await this.db.update(products)
        .set({ 
          reviewCount: (product.reviewCount || 0) + 1,
          updatedAt: new Date()
        })
        .where(eq(products.id, product.id));
    }
    
    return result[0];
  }
  
  async updateReview(id: number, reviewData: Partial<Review>): Promise<Review | undefined> {
    const result = await this.db.update(reviews)
      .set({
        ...reviewData,
        updatedAt: new Date()
      })
      .where(eq(reviews.id, id))
      .returning();
    
    return result[0];
  }
  
  async getAllReviews(): Promise<Review[]> {
    return this.db.select().from(reviews).orderBy(desc(reviews.createdAt));
  }
  
  // Cart methods
  async getCartByUserId(userId: number): Promise<Cart | undefined> {
    const result = await this.db.select().from(carts).where(eq(carts.userId, userId)).limit(1);
    return result[0];
  }
  
  async getCartWithItems(userId: number): Promise<(CartItem & { product: Product })[] | undefined> {
    // Get cart
    const cart = await this.getCartByUserId(userId);
    if (!cart) return undefined;
    
    // Get cart items with products
    const items = await this.db.select({
      id: cartItems.id,
      cartId: cartItems.cartId,
      productId: cartItems.productId,
      quantity: cartItems.quantity,
      createdAt: cartItems.createdAt,
      updatedAt: cartItems.updatedAt,
      product: products
    })
    .from(cartItems)
    .leftJoin(products, eq(cartItems.productId, products.id))
    .where(eq(cartItems.cartId, cart.id));
    
    return items;
  }
  
  async createCart(cart: InsertCart): Promise<Cart> {
    // Check if user already has a cart
    const existing = await this.getCartByUserId(cart.userId);
    if (existing) return existing;
    
    // Create new cart
    const result = await this.db.insert(carts).values(cart).returning();
    return result[0];
  }
  
  async addItemToCart(item: InsertCartItem): Promise<CartItem> {
    // Check if item already in cart
    const existing = await this.db.select()
      .from(cartItems)
      .where(
        and(
          eq(cartItems.cartId, item.cartId),
          eq(cartItems.productId, item.productId)
        )
      )
      .limit(1);
    
    if (existing.length > 0) {
      // Update quantity
      const updatedItem = await this.updateCartItem(
        existing[0].id, 
        existing[0].quantity + (item.quantity || 1)
      );
      return updatedItem!;
    }
    
    // Create new cart item
    const result = await this.db.insert(cartItems).values(item).returning();
    return result[0];
  }
  
  async updateCartItem(id: number, quantity: number): Promise<CartItem | undefined> {
    const result = await this.db.update(cartItems)
      .set({
        quantity,
        updatedAt: new Date()
      })
      .where(eq(cartItems.id, id))
      .returning();
    
    return result[0];
  }
  
  async removeCartItem(id: number): Promise<void> {
    await this.db.delete(cartItems).where(eq(cartItems.id, id));
  }
  
  async clearCart(userId: number): Promise<void> {
    const cart = await this.getCartByUserId(userId);
    if (cart) {
      await this.db.delete(cartItems).where(eq(cartItems.cartId, cart.id));
    }
  }
  
  // Order methods
  async getOrdersByUserId(userId: number): Promise<Order[]> {
    return this.db.select().from(orders).where(eq(orders.userId, userId)).orderBy(desc(orders.createdAt));
  }
  
  async getOrderById(id: number): Promise<Order | undefined> {
    const result = await this.db.select().from(orders).where(eq(orders.id, id)).limit(1);
    return result[0];
  }
  
  async getOrderWithItems(id: number): Promise<(Order & { items: (OrderItem & { product: Product })[] }) | undefined> {
    // Get order
    const order = await this.getOrderById(id);
    if (!order) return undefined;
    
    // Get order items with products
    const items = await this.db.select({
      id: orderItems.id,
      orderId: orderItems.orderId,
      productId: orderItems.productId,
      quantity: orderItems.quantity,
      price: orderItems.price,
      createdAt: orderItems.createdAt,
      product: products
    })
    .from(orderItems)
    .leftJoin(products, eq(orderItems.productId, products.id))
    .where(eq(orderItems.orderId, order.id));
    
    return { ...order, items };
  }
  
  async createOrder(order: InsertOrder, orderItemsList: InsertOrderItem[]): Promise<Order> {
    // Create order
    const [newOrder] = await this.db.insert(orders).values(order).returning();
    
    // Create order items
    for (const item of orderItemsList) {
      await this.db.insert(orderItems).values({
        ...item,
        orderId: newOrder.id
      });
    }
    
    return newOrder;
  }
  
  async updateOrderStatus(id: number, status: OrderStatus): Promise<Order | undefined> {
    const result = await this.db.update(orders)
      .set({
        status,
        updatedAt: new Date()
      })
      .where(eq(orders.id, id))
      .returning();
    
    return result[0];
  }
  
  async updatePaymentStatus(id: number, status: PaymentStatus, paymentIntentId?: string): Promise<Order | undefined> {
    const updateData: any = {
      paymentStatus: status,
      updatedAt: new Date()
    };
    
    if (paymentIntentId) {
      updateData.stripePaymentIntentId = paymentIntentId;
    }
    
    const result = await this.db.update(orders)
      .set(updateData)
      .where(eq(orders.id, id))
      .returning();
    
    return result[0];
  }
  
  async getAllOrders(): Promise<Order[]> {
    return this.db.select().from(orders).orderBy(desc(orders.createdAt));
  }
  
  // Enquiry methods
  async createEnquiry(enquiry: InsertEnquiry): Promise<Enquiry> {
    const result = await this.db.insert(enquiries).values(enquiry).returning();
    return result[0];
  }
  
  async getEnquiriesByUserId(userId: number): Promise<Enquiry[]> {
    return this.db.select().from(enquiries).where(eq(enquiries.userId, userId));
  }
  
  async getAllEnquiries(): Promise<Enquiry[]> {
    return this.db.select().from(enquiries).orderBy(desc(enquiries.createdAt));
  }
  
  async getEnquiry(id: number): Promise<Enquiry | undefined> {
    const result = await this.db.select().from(enquiries).where(eq(enquiries.id, id)).limit(1);
    return result[0];
  }
  
  async resolveEnquiry(id: number): Promise<Enquiry | undefined> {
    const result = await this.db.update(enquiries)
      .set({
        isResolved: true,
        updatedAt: new Date()
      })
      .where(eq(enquiries.id, id))
      .returning();
    
    return result[0];
  }
  
  // Helper methods
  generateOrderNumber(): string {
    // Format: PL-YYYYMMDD-XXXX where XXXX is a random 4-digit number
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = Math.floor(1000 + Math.random() * 9000); // 4-digit random number
    
    return `PL-${year}${month}${day}-${random}`;
  }
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private sessions: Map<string, Session>;
  private productsMap: Map<number, Product>;
  private categoriesMap: Map<number, Category>;
  private lifestyleItemsMap: Map<number, LifestyleItem>;
  private newsletterSubscriptionsMap: Map<number, NewsletterSubscription>;
  private addressesMap: Map<number, Address>;
  private wishlistsMap: Map<number, Wishlist>;
  private reviewsMap: Map<number, Review>;
  private cartsMap: Map<number, Cart>;
  private cartItemsMap: Map<number, CartItem>;
  private ordersMap: Map<number, Order>;
  private orderItemsMap: Map<number, OrderItem>;
  private enquiriesMap: Map<number, Enquiry>;
  
  private productIdCounter: number;
  private categoryIdCounter: number;
  private lifestyleItemIdCounter: number;
  private newsletterSubscriptionIdCounter: number;
  private userIdCounter: number;
  private addressIdCounter: number;
  private wishlistIdCounter: number;
  private reviewIdCounter: number;
  private cartIdCounter: number;
  private cartItemIdCounter: number;
  private orderIdCounter: number;
  private orderItemIdCounter: number;
  private enquiryIdCounter: number;

  constructor() {
    this.users = new Map();
    this.sessions = new Map();
    this.productsMap = new Map();
    this.categoriesMap = new Map();
    this.lifestyleItemsMap = new Map();
    this.newsletterSubscriptionsMap = new Map();
    this.addressesMap = new Map();
    this.wishlistsMap = new Map();
    this.reviewsMap = new Map();
    this.cartsMap = new Map();
    this.cartItemsMap = new Map();
    this.ordersMap = new Map();
    this.orderItemsMap = new Map();
    this.enquiriesMap = new Map();
    
    this.productIdCounter = 1;
    this.categoryIdCounter = 1;
    this.lifestyleItemIdCounter = 1;
    this.newsletterSubscriptionIdCounter = 1;
    this.userIdCounter = 1;
    this.addressIdCounter = 1;
    this.wishlistIdCounter = 1;
    this.reviewIdCounter = 1;
    this.cartIdCounter = 1;
    this.cartItemIdCounter = 1;
    this.orderIdCounter = 1;
    this.orderItemIdCounter = 1;
    this.enquiryIdCounter = 1;
    
    // Initialize with some sample data
    this.initializeData();
  }

  private async initializeData() {
    // Create categories
    const skincare = await this.createCategory({
      name: "Skincare",
      description: "Nourishing products for your skin",
      imageUrl: "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
    });
    
    // Create products
    await this.createProduct({
      name: "Rose Jelly Gentle Makeup Remover",
      price: 42.00,
      description: "A gentle yet effective makeup remover that transforms from a jelly to an oil, then to a milk when mixed with water. Infused with damask rose and soothing botanicals to leave skin clean, soft, and refreshed.",
      imageUrl: "https://images.unsplash.com/photo-1570194065650-d99195209a19?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
      featured: true,
      reviewCount: 124,
      ingredients: ["Damask Rose", "Jojoba Oil", "Vitamin E", "Aloe Vera"],
      categoryId: skincare.id,
      stock: 100,
      sku: "RJGMR-001"
    });
    
    await this.createProduct({
      name: "Rose Cleanser",
      price: 36.00,
      description: "A gentle daily cleanser with rose extracts to purify and hydrate skin.",
      imageUrl: "https://images.unsplash.com/photo-1594125311687-8ad3ecdca5bf?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
      featured: false,
      reviewCount: 89,
      ingredients: ["Rose Water", "Glycerin", "Green Tea Extract"],
      categoryId: skincare.id,
      stock: 100,
      sku: "RC-002"
    });
    
    await this.createProduct({
      name: "Vitamin C Serum",
      price: 58.00,
      description: "Brightening serum with stabilized vitamin C to even skin tone and boost radiance.",
      imageUrl: "https://images.unsplash.com/photo-1611080541439-ba44905e709b?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
      featured: false,
      reviewCount: 113,
      ingredients: ["Vitamin C", "Hyaluronic Acid", "Ferulic Acid"],
      categoryId: skincare.id,
      stock: 100,
      sku: "VCS-003"
    });
    
    await this.createProduct({
      name: "Hydrating Mask",
      price: 48.00,
      description: "Intensive hydrating mask with hyaluronic acid and botanical extracts.",
      imageUrl: "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
      featured: false,
      reviewCount: 76,
      ingredients: ["Hyaluronic Acid", "Aloe Vera", "Rose Water", "Ceramides"],
      categoryId: skincare.id,
      stock: 100,
      sku: "HM-004"
    });
    
    await this.createProduct({
      name: "Night Cream",
      price: 52.00,
      description: "Rich, overnight treatment to restore and replenish skin while you sleep.",
      imageUrl: "https://images.unsplash.com/photo-1616962037373-f6de60d5e964?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
      featured: false,
      reviewCount: 94,
      ingredients: ["Retinol", "Peptides", "Niacinamide", "Shea Butter"],
      categoryId: skincare.id,
      stock: 100,
      sku: "NC-005"
    });
    
    await this.createProduct({
      name: "Face Oil",
      price: 62.00,
      description: "Luxurious facial oil blend to nourish and balance all skin types.",
      imageUrl: "https://images.unsplash.com/photo-1608412082459-23532ff5e751?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
      featured: false,
      reviewCount: 67,
      ingredients: ["Argan Oil", "Rosehip Oil", "Evening Primrose Oil", "Vitamin E"],
      categoryId: skincare.id,
      stock: 100,
      sku: "FO-006"
    });
    
    await this.createProduct({
      name: "Eye Contour",
      price: 46.00,
      description: "Targeted treatment for the delicate eye area to reduce fine lines and puffiness.",
      imageUrl: "https://images.unsplash.com/photo-1592136957897-b2b6ca21e10d?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
      featured: false,
      reviewCount: 58,
      ingredients: ["Caffeine", "Peptides", "Hyaluronic Acid", "Green Tea"],
      categoryId: skincare.id,
      stock: 100,
      sku: "EC-007"
    });
    
    // Create lifestyle items
    await this.createLifestyleItem({
      title: "Morning Rituals",
      description: "Start your day with intention and radiance",
      imageUrl: "https://images.unsplash.com/photo-1556228578-8c89e6adf883?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
      link: "#morning-rituals"
    });
    
    await this.createLifestyleItem({
      title: "Evening Rituals",
      description: "Unwind and restore with our calming collection",
      imageUrl: "https://images.unsplash.com/photo-1552693673-1bf958298935?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
      link: "#evening-rituals"
    });
  }

  // User methods
  async getUserById(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email
    );
  }

  async createUser(insertUser: InsertUser): Promise<User | undefined> {
    const hashedPassword = await bcrypt.hash(insertUser.password, 10);
    
    const id = this.userIdCounter++;
    const now = new Date();
    const user: User = {
      ...insertUser,
      id,
      password: hashedPassword,
      role: 'user',
      createdAt: now,
      updatedAt: now
    };
    
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    // If updating password, hash it
    if (userData.password) {
      userData.password = await bcrypt.hash(userData.password, 10);
    }
    
    const updatedUser = {
      ...user,
      ...userData,
      updatedAt: new Date()
    };
    
    this.users.set(id, updatedUser);
    return updatedUser;
  }
  
  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }
  
  // Session methods
  async createSession(userId: number): Promise<Session> {
    const id = crypto.randomUUID();
    
    // Set expiry to 7 days from now
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);
    
    const session: Session = {
      id,
      userId,
      expiresAt,
      createdAt: new Date(),
      captchaText: null
    };
    
    this.sessions.set(id, session);
    return session;
  }
  
  async getSessionById(id: string): Promise<Session | undefined> {
    return this.sessions.get(id);
  }
  
  async updateSessionCaptcha(id: string, captchaText: string): Promise<Session | undefined> {
    const session = this.sessions.get(id);
    if (!session) return undefined;
    
    const updatedSession: Session = {
      ...session,
      captchaText
    };
    
    this.sessions.set(id, updatedSession);
    return updatedSession;
  }
  
  async deleteSession(id: string): Promise<void> {
    this.sessions.delete(id);
  }
  
  // Product methods
  async getAllProducts(): Promise<Product[]> {
    return Array.from(this.productsMap.values());
  }
  
  async getProduct(id: number): Promise<Product | undefined> {
    return this.productsMap.get(id);
  }
  
  async getFeaturedProduct(): Promise<Product | undefined> {
    return Array.from(this.productsMap.values()).find(product => product.featured);
  }
  
  async createProduct(product: InsertProduct): Promise<Product> {
    const id = this.productIdCounter++;
    const now = new Date();
    const newProduct: Product = { 
      ...product, 
      id,
      createdAt: now,
      updatedAt: now
    };
    
    this.productsMap.set(id, newProduct);
    return newProduct;
  }
  
  async updateProduct(id: number, productData: Partial<Product>): Promise<Product | undefined> {
    const product = this.productsMap.get(id);
    if (!product) return undefined;
    
    const updatedProduct = {
      ...product,
      ...productData,
      updatedAt: new Date()
    };
    
    this.productsMap.set(id, updatedProduct);
    return updatedProduct;
  }
  
  async deleteProduct(id: number): Promise<void> {
    this.productsMap.delete(id);
  }
  
  async searchProducts(query: string): Promise<Product[]> {
    const searchTerms = query.toLowerCase().split(/\s+/);
    return Array.from(this.productsMap.values()).filter(product => {
      const searchText = `${product.name} ${product.description}`.toLowerCase();
      return searchTerms.every(term => searchText.includes(term));
    });
  }
  
  async getProductsByCategory(categoryId: number): Promise<Product[]> {
    return Array.from(this.productsMap.values()).filter(
      product => product.categoryId === categoryId
    );
  }
  
  // Category methods
  async getAllCategories(): Promise<Category[]> {
    return Array.from(this.categoriesMap.values());
  }
  
  async getCategory(id: number): Promise<Category | undefined> {
    return this.categoriesMap.get(id);
  }
  
  async createCategory(category: InsertCategory): Promise<Category> {
    const id = this.categoryIdCounter++;
    const now = new Date();
    const newCategory: Category = { 
      ...category, 
      id,
      createdAt: now,
      updatedAt: now
    };
    
    this.categoriesMap.set(id, newCategory);
    return newCategory;
  }
  
  async updateCategory(id: number, categoryData: Partial<Category>): Promise<Category | undefined> {
    const category = this.categoriesMap.get(id);
    if (!category) return undefined;
    
    const updatedCategory = {
      ...category,
      ...categoryData,
      updatedAt: new Date()
    };
    
    this.categoriesMap.set(id, updatedCategory);
    return updatedCategory;
  }
  
  async deleteCategory(id: number): Promise<void> {
    this.categoriesMap.delete(id);
  }
  
  // Lifestyle methods
  async getAllLifestyleItems(): Promise<LifestyleItem[]> {
    return Array.from(this.lifestyleItemsMap.values());
  }
  
  async getLifestyleItem(id: number): Promise<LifestyleItem | undefined> {
    return this.lifestyleItemsMap.get(id);
  }
  
  async createLifestyleItem(item: InsertLifestyleItem): Promise<LifestyleItem> {
    const id = this.lifestyleItemIdCounter++;
    const now = new Date();
    const newItem: LifestyleItem = { 
      ...item, 
      id,
      createdAt: now,
      updatedAt: now
    };
    
    this.lifestyleItemsMap.set(id, newItem);
    return newItem;
  }
  
  async updateLifestyleItem(id: number, itemData: Partial<LifestyleItem>): Promise<LifestyleItem | undefined> {
    const item = this.lifestyleItemsMap.get(id);
    if (!item) return undefined;
    
    const updatedItem = {
      ...item,
      ...itemData,
      updatedAt: new Date()
    };
    
    this.lifestyleItemsMap.set(id, updatedItem);
    return updatedItem;
  }
  
  async deleteLifestyleItem(id: number): Promise<void> {
    this.lifestyleItemsMap.delete(id);
  }
  
  // Newsletter methods
  async createNewsletterSubscription(subscription: InsertNewsletterSubscription): Promise<NewsletterSubscription> {
    const id = this.newsletterSubscriptionIdCounter++;
    const newSubscription: NewsletterSubscription = { 
      ...subscription, 
      id, 
      createdAt: new Date() 
    };
    
    this.newsletterSubscriptionsMap.set(id, newSubscription);
    return newSubscription;
  }
  
  async getAllNewsletterSubscriptions(): Promise<NewsletterSubscription[]> {
    return Array.from(this.newsletterSubscriptionsMap.values());
  }
  
  // Address methods
  async getAddressesByUserId(userId: number): Promise<Address[]> {
    return Array.from(this.addressesMap.values()).filter(
      address => address.userId === userId
    );
  }
  
  async getAddress(id: number): Promise<Address | undefined> {
    return this.addressesMap.get(id);
  }
  
  async createAddress(address: InsertAddress): Promise<Address> {
    // If this is a default address, unset any other defaults
    if (address.isDefault) {
      const userAddresses = await this.getAddressesByUserId(address.userId);
      for (const addr of userAddresses) {
        if (addr.isDefault) {
          const updated = { ...addr, isDefault: false };
          this.addressesMap.set(addr.id, updated);
        }
      }
    }
    
    const id = this.addressIdCounter++;
    const now = new Date();
    const newAddress: Address = { 
      ...address, 
      id,
      createdAt: now,
      updatedAt: now
    };
    
    this.addressesMap.set(id, newAddress);
    return newAddress;
  }
  
  async updateAddress(id: number, addressData: Partial<Address>): Promise<Address | undefined> {
    const address = this.addressesMap.get(id);
    if (!address) return undefined;
    
    // If setting as default, unset other defaults
    if (addressData.isDefault) {
      const userAddresses = await this.getAddressesByUserId(address.userId);
      for (const addr of userAddresses) {
        if (addr.id !== id && addr.isDefault) {
          const updated = { ...addr, isDefault: false };
          this.addressesMap.set(addr.id, updated);
        }
      }
    }
    
    const updatedAddress = {
      ...address,
      ...addressData,
      updatedAt: new Date()
    };
    
    this.addressesMap.set(id, updatedAddress);
    return updatedAddress;
  }
  
  async deleteAddress(id: number): Promise<void> {
    this.addressesMap.delete(id);
  }
  
  // Wishlist methods
  async getWishlistByUserId(userId: number): Promise<(Wishlist & { product: Product })[]> {
    const wishlistItems = Array.from(this.wishlistsMap.values()).filter(
      item => item.userId === userId
    );
    
    return wishlistItems.map(item => {
      const product = this.productsMap.get(item.productId)!;
      return { ...item, product };
    });
  }
  
  async addToWishlist(wishlist: InsertWishlist): Promise<Wishlist> {
    // Check if item already in wishlist
    const existing = Array.from(this.wishlistsMap.values()).find(
      item => item.userId === wishlist.userId && item.productId === wishlist.productId
    );
    
    if (existing) return existing;
    
    const id = this.wishlistIdCounter++;
    const newWishlist: Wishlist = { 
      ...wishlist, 
      id,
      createdAt: new Date()
    };
    
    this.wishlistsMap.set(id, newWishlist);
    return newWishlist;
  }
  
  async removeFromWishlist(userId: number, productId: number): Promise<void> {
    const wishlistItems = Array.from(this.wishlistsMap.entries());
    for (const [id, item] of wishlistItems) {
      if (item.userId === userId && item.productId === productId) {
        this.wishlistsMap.delete(id);
      }
    }
  }
  
  // Review methods
  async getReviewsByProductId(productId: number): Promise<Review[]> {
    return Array.from(this.reviewsMap.values()).filter(
      review => review.productId === productId
    );
  }
  
  async getReviewByUserAndProduct(userId: number, productId: number): Promise<Review | undefined> {
    return Array.from(this.reviewsMap.values()).find(
      review => review.userId === userId && review.productId === productId
    );
  }
  
  async createReview(review: InsertReview): Promise<Review> {
    // Check if user already reviewed this product
    const existing = await this.getReviewByUserAndProduct(review.userId, review.productId);
    
    if (existing) {
      // Update existing review
      const updated = await this.updateReview(existing.id, {
        rating: review.rating,
        comment: review.comment
      });
      return updated!;
    }
    
    const id = this.reviewIdCounter++;
    const now = new Date();
    const newReview: Review = { 
      ...review, 
      id,
      createdAt: now,
      updatedAt: now
    };
    
    this.reviewsMap.set(id, newReview);
    
    // Update product review count
    const product = this.productsMap.get(review.productId);
    if (product) {
      const updatedProduct = { 
        ...product, 
        reviewCount: (product.reviewCount || 0) + 1,
        updatedAt: new Date()
      };
      this.productsMap.set(product.id, updatedProduct);
    }
    
    return newReview;
  }
  
  async updateReview(id: number, reviewData: Partial<Review>): Promise<Review | undefined> {
    const review = this.reviewsMap.get(id);
    if (!review) return undefined;
    
    const updatedReview = {
      ...review,
      ...reviewData,
      updatedAt: new Date()
    };
    
    this.reviewsMap.set(id, updatedReview);
    return updatedReview;
  }
  
  async getAllReviews(): Promise<Review[]> {
    return Array.from(this.reviewsMap.values());
  }
  
  // Cart methods
  async getCartByUserId(userId: number): Promise<Cart | undefined> {
    return Array.from(this.cartsMap.values()).find(
      cart => cart.userId === userId
    );
  }
  
  async getCartWithItems(userId: number): Promise<(CartItem & { product: Product })[] | undefined> {
    const cart = await this.getCartByUserId(userId);
    if (!cart) return undefined;
    
    const cartItems = Array.from(this.cartItemsMap.values()).filter(
      item => item.cartId === cart.id
    );
    
    return cartItems.map(item => {
      const product = this.productsMap.get(item.productId)!;
      return { ...item, product };
    });
  }
  
  async createCart(cart: InsertCart): Promise<Cart> {
    // Check if user already has a cart
    const existing = await this.getCartByUserId(cart.userId);
    if (existing) return existing;
    
    const id = this.cartIdCounter++;
    const now = new Date();
    const newCart: Cart = { 
      ...cart, 
      id,
      createdAt: now,
      updatedAt: now
    };
    
    this.cartsMap.set(id, newCart);
    return newCart;
  }
  
  async addItemToCart(item: InsertCartItem): Promise<CartItem> {
    // Check if item already in cart
    const existing = Array.from(this.cartItemsMap.values()).find(
      cartItem => cartItem.cartId === item.cartId && cartItem.productId === item.productId
    );
    
    if (existing) {
      // Update quantity
      const updated = await this.updateCartItem(
        existing.id, 
        existing.quantity + (item.quantity || 1)
      );
      return updated!;
    }
    
    const id = this.cartItemIdCounter++;
    const now = new Date();
    const newItem: CartItem = { 
      ...item, 
      id,
      createdAt: now,
      updatedAt: now
    };
    
    this.cartItemsMap.set(id, newItem);
    return newItem;
  }
  
  async updateCartItem(id: number, quantity: number): Promise<CartItem | undefined> {
    const cartItem = this.cartItemsMap.get(id);
    if (!cartItem) return undefined;
    
    const updatedItem = {
      ...cartItem,
      quantity,
      updatedAt: new Date()
    };
    
    this.cartItemsMap.set(id, updatedItem);
    return updatedItem;
  }
  
  async removeCartItem(id: number): Promise<void> {
    this.cartItemsMap.delete(id);
  }
  
  async clearCart(userId: number): Promise<void> {
    const cart = await this.getCartByUserId(userId);
    if (!cart) return;
    
    const cartItems = Array.from(this.cartItemsMap.entries());
    for (const [id, item] of cartItems) {
      if (item.cartId === cart.id) {
        this.cartItemsMap.delete(id);
      }
    }
  }
  
  // Order methods
  async getOrdersByUserId(userId: number): Promise<Order[]> {
    return Array.from(this.ordersMap.values())
      .filter(order => order.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
  
  async getOrderById(id: number): Promise<Order | undefined> {
    return this.ordersMap.get(id);
  }
  
  async getOrderWithItems(id: number): Promise<(Order & { items: (OrderItem & { product: Product })[] }) | undefined> {
    const order = this.ordersMap.get(id);
    if (!order) return undefined;
    
    const items = Array.from(this.orderItemsMap.values())
      .filter(item => item.orderId === order.id)
      .map(item => {
        const product = this.productsMap.get(item.productId)!;
        return { ...item, product };
      });
    
    return { ...order, items };
  }
  
  async createOrder(order: InsertOrder, orderItemsList: InsertOrderItem[]): Promise<Order> {
    const id = this.orderIdCounter++;
    const now = new Date();
    const newOrder: Order = { 
      ...order, 
      id,
      createdAt: now,
      updatedAt: now
    };
    
    this.ordersMap.set(id, newOrder);
    
    // Create order items
    for (const item of orderItemsList) {
      const itemId = this.orderItemIdCounter++;
      const newItem: OrderItem = {
        ...item,
        id: itemId,
        orderId: id,
        createdAt: now
      };
      
      this.orderItemsMap.set(itemId, newItem);
    }
    
    return newOrder;
  }
  
  async updateOrderStatus(id: number, status: OrderStatus): Promise<Order | undefined> {
    const order = this.ordersMap.get(id);
    if (!order) return undefined;
    
    const updatedOrder = {
      ...order,
      status,
      updatedAt: new Date()
    };
    
    this.ordersMap.set(id, updatedOrder);
    return updatedOrder;
  }
  
  async updatePaymentStatus(id: number, status: PaymentStatus, paymentIntentId?: string): Promise<Order | undefined> {
    const order = this.ordersMap.get(id);
    if (!order) return undefined;
    
    const updatedOrder = {
      ...order,
      paymentStatus: status,
      ...(paymentIntentId && { stripePaymentIntentId: paymentIntentId }),
      updatedAt: new Date()
    };
    
    this.ordersMap.set(id, updatedOrder);
    return updatedOrder;
  }
  
  async getAllOrders(): Promise<Order[]> {
    return Array.from(this.ordersMap.values());
  }
  
  // Enquiry methods
  async createEnquiry(enquiry: InsertEnquiry): Promise<Enquiry> {
    const id = this.enquiryIdCounter++;
    const newEnquiry: Enquiry = { 
      ...enquiry, 
      id,
      isResolved: false,
      createdAt: new Date()
    };
    
    this.enquiriesMap.set(id, newEnquiry);
    return newEnquiry;
  }
  
  async getEnquiriesByUserId(userId: number): Promise<Enquiry[]> {
    return Array.from(this.enquiriesMap.values()).filter(
      enquiry => enquiry.userId === userId
    );
  }
  
  async getAllEnquiries(): Promise<Enquiry[]> {
    return Array.from(this.enquiriesMap.values());
  }
  
  async getEnquiry(id: number): Promise<Enquiry | undefined> {
    return this.enquiriesMap.get(id);
  }
  
  async resolveEnquiry(id: number): Promise<Enquiry | undefined> {
    const enquiry = this.enquiriesMap.get(id);
    if (!enquiry) return undefined;
    
    const updatedEnquiry = {
      ...enquiry,
      isResolved: true
    };
    
    this.enquiriesMap.set(id, updatedEnquiry);
    return updatedEnquiry;
  }
  
  // Helper methods
  generateOrderNumber(): string {
    // Format: PL-YYYYMMDD-XXXX where XXXX is a random 4-digit number
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = Math.floor(1000 + Math.random() * 9000); // 4-digit random number
    
    return `PL-${year}${month}${day}-${random}`;
  }
}

// Export the appropriate storage based on environment
export const storage = connectionString ? new PostgresStorage() : new MemStorage();
