import { 
  products, 
  categories, 
  lifestyleItems, 
  newsletterSubscriptions,
  type Product, 
  type InsertProduct,
  type Category, 
  type InsertCategory,
  type LifestyleItem, 
  type InsertLifestyleItem,
  type NewsletterSubscription,
  type InsertNewsletterSubscription
} from "@shared/schema";

// Storage interface
export interface IStorage {
  // User methods (kept from template)
  getUser(id: number): Promise<any | undefined>;
  getUserByUsername(username: string): Promise<any | undefined>;
  createUser(user: any): Promise<any>;
  
  // Product methods
  getAllProducts(): Promise<Product[]>;
  getProduct(id: number): Promise<Product | undefined>;
  getFeaturedProduct(): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  
  // Category methods
  getAllCategories(): Promise<Category[]>;
  getCategory(id: number): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  
  // Lifestyle methods
  getAllLifestyleItems(): Promise<LifestyleItem[]>;
  getLifestyleItem(id: number): Promise<LifestyleItem | undefined>;
  createLifestyleItem(item: InsertLifestyleItem): Promise<LifestyleItem>;
  
  // Newsletter methods
  createNewsletterSubscription(subscription: InsertNewsletterSubscription): Promise<NewsletterSubscription>;
}

export class MemStorage implements IStorage {
  private users: Map<number, any>;
  private productsMap: Map<number, Product>;
  private categoriesMap: Map<number, Category>;
  private lifestyleItemsMap: Map<number, LifestyleItem>;
  private newsletterSubscriptionsMap: Map<number, NewsletterSubscription>;
  
  private productIdCounter: number;
  private categoryIdCounter: number;
  private lifestyleItemIdCounter: number;
  private newsletterSubscriptionIdCounter: number;
  private userIdCounter: number;

  constructor() {
    this.users = new Map();
    this.productsMap = new Map();
    this.categoriesMap = new Map();
    this.lifestyleItemsMap = new Map();
    this.newsletterSubscriptionsMap = new Map();
    
    this.productIdCounter = 1;
    this.categoryIdCounter = 1;
    this.lifestyleItemIdCounter = 1;
    this.newsletterSubscriptionIdCounter = 1;
    this.userIdCounter = 1;
    
    // Initialize with some sample data
    this.initializeData();
  }

  private initializeData() {
    // Create categories
    const skincare = this.createCategory({
      name: "Skincare",
      description: "Nourishing products for your skin",
    });
    
    // Create products
    this.createProduct({
      name: "Rose Jelly Gentle Makeup Remover",
      price: 42.00,
      description: "A gentle yet effective makeup remover that transforms from a jelly to an oil, then to a milk when mixed with water. Infused with damask rose and soothing botanicals to leave skin clean, soft, and refreshed.",
      imageUrl: "https://images.unsplash.com/photo-1570194065650-d99195209a19?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
      featured: true,
      reviewCount: 124,
      ingredients: ["Damask Rose", "Jojoba Oil", "Vitamin E", "Aloe Vera"],
      categoryId: skincare.id,
    });
    
    this.createProduct({
      name: "Rose Cleanser",
      price: 36.00,
      description: "A gentle daily cleanser with rose extracts to purify and hydrate skin.",
      imageUrl: "https://images.unsplash.com/photo-1594125311687-8ad3ecdca5bf?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
      featured: false,
      reviewCount: 89,
      ingredients: ["Rose Water", "Glycerin", "Green Tea Extract"],
      categoryId: skincare.id,
    });
    
    this.createProduct({
      name: "Vitamin C Serum",
      price: 58.00,
      description: "Brightening serum with stabilized vitamin C to even skin tone and boost radiance.",
      imageUrl: "https://images.unsplash.com/photo-1611080541439-ba44905e709b?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
      featured: false,
      reviewCount: 113,
      ingredients: ["Vitamin C", "Hyaluronic Acid", "Ferulic Acid"],
      categoryId: skincare.id,
    });
    
    this.createProduct({
      name: "Hydrating Mask",
      price: 48.00,
      description: "Intensive hydrating mask with hyaluronic acid and botanical extracts.",
      imageUrl: "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
      featured: false,
      reviewCount: 76,
      ingredients: ["Hyaluronic Acid", "Aloe Vera", "Rose Water", "Ceramides"],
      categoryId: skincare.id,
    });
    
    this.createProduct({
      name: "Night Cream",
      price: 52.00,
      description: "Rich, overnight treatment to restore and replenish skin while you sleep.",
      imageUrl: "https://images.unsplash.com/photo-1616962037373-f6de60d5e964?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
      featured: false,
      reviewCount: 94,
      ingredients: ["Retinol", "Peptides", "Niacinamide", "Shea Butter"],
      categoryId: skincare.id,
    });
    
    this.createProduct({
      name: "Face Oil",
      price: 62.00,
      description: "Luxurious facial oil blend to nourish and balance all skin types.",
      imageUrl: "https://images.unsplash.com/photo-1608412082459-23532ff5e751?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
      featured: false,
      reviewCount: 67,
      ingredients: ["Argan Oil", "Rosehip Oil", "Evening Primrose Oil", "Vitamin E"],
      categoryId: skincare.id,
    });
    
    this.createProduct({
      name: "Eye Contour",
      price: 46.00,
      description: "Targeted treatment for the delicate eye area to reduce fine lines and puffiness.",
      imageUrl: "https://images.unsplash.com/photo-1592136957897-b2b6ca21e10d?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
      featured: false,
      reviewCount: 58,
      ingredients: ["Caffeine", "Peptides", "Hyaluronic Acid", "Green Tea"],
      categoryId: skincare.id,
    });
    
    // Create lifestyle items
    this.createLifestyleItem({
      title: "Morning Rituals",
      description: "Start your day with intention and radiance",
      imageUrl: "https://images.unsplash.com/photo-1556228578-8c89e6adf883?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
      link: "#morning-rituals",
    });
    
    this.createLifestyleItem({
      title: "Evening Rituals",
      description: "Unwind and restore with our calming collection",
      imageUrl: "https://images.unsplash.com/photo-1552693673-1bf958298935?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
      link: "#evening-rituals",
    });
  }

  // User methods (kept from template)
  async getUser(id: number): Promise<any | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<any | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: any): Promise<any> {
    const id = this.userIdCounter++;
    const user = { ...insertUser, id };
    this.users.set(id, user);
    return user;
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
    const newProduct: Product = { ...product, id };
    this.productsMap.set(id, newProduct);
    return newProduct;
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
    const newCategory: Category = { ...category, id };
    this.categoriesMap.set(id, newCategory);
    return newCategory;
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
    const newItem: LifestyleItem = { ...item, id };
    this.lifestyleItemsMap.set(id, newItem);
    return newItem;
  }
  
  // Newsletter methods
  async createNewsletterSubscription(subscription: InsertNewsletterSubscription): Promise<NewsletterSubscription> {
    const id = this.newsletterSubscriptionIdCounter++;
    const newSubscription: NewsletterSubscription = { 
      ...subscription, 
      id, 
      createdAt: new Date().toISOString() 
    };
    this.newsletterSubscriptionsMap.set(id, newSubscription);
    return newSubscription;
  }
}

export const storage = new MemStorage();
