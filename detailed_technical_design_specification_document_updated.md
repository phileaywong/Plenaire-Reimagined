
# Plenaire E-commerce Platform Technical Design Specification

## 1. Introduction

### 1.1. Purpose
This document provides a comprehensive technical specification for the Plenaire e-commerce platform. It serves as a reference for development, testing, and maintenance purposes, detailing the complete system architecture and implementation.

### 1.2. Scope
The specification covers:
- Frontend React/TypeScript application
- Express.js backend API 
- PostgreSQL database with Drizzle ORM
- Authentication system
- Product catalog management
- Shopping cart functionality
- Stripe payment integration
- Order management system

### 1.3. Design Philosophy
Key design principles:
- Clean, modern UI reflecting premium brand identity
- Component-based architecture with TypeScript
- Mobile-first responsive design
- RESTful API architecture
- Session-based authentication with PostgreSQL
- Secure payment processing via Stripe

## 2. System Architecture

### 2.1. High-Level Overview
```
┌──────────────┐      ┌──────────────┐      ┌──────────────┐
│              │      │              │      │              │
│   React      │◄────►│   Express    │◄────►│  PostgreSQL  │
│   Frontend   │      │   Backend    │      │  Database    │
│              │      │              │      │              │
└──────────────┘      └──────────────┘      └──────────────┘
       ▲                     ▲
       │                     │
       ▼                     ▼
┌──────────────┐      ┌──────────────┐
│   Stripe     │      │   External   │
│   Payment    │      │   Services   │
└──────────────┘      └──────────────┘
```

### 2.2. Technology Stack

#### Frontend
- React with TypeScript
- Tailwind CSS for styling
- Shadcn UI components
- Vite for build tooling

#### Backend
- Express.js with TypeScript
- Drizzle ORM
- PostgreSQL database
- Stripe payment integration

## 3. Database Design

### 3.1. Schema Overview
The database uses PostgreSQL with Drizzle ORM for type-safe queries. Key features:
- Enumerated types for roles and statuses
- Foreign key relationships
- Timestamp tracking
- Unique constraints

### 3.2. Core Tables

#### Users Table
```typescript
users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  phone: text("phone"),
  role: userRoleEnum("role").default('user'),
  loginAttempts: integer("login_attempts").default(0),
  lockUntil: timestamp("lock_until"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
```

#### Products Table
```typescript
products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  price: doublePrecision("price").notNull(),
  description: text("description").notNull(),
  imageUrl: text("image_url").notNull(),
  featured: boolean("featured").default(false),
  reviewCount: integer("review_count").default(0),
  ingredients: text("ingredients").array(),
  categoryId: integer("category_id").references(() => categories.id),
  stock: integer("stock").default(100),
  sku: text("sku").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
```

#### Orders Table
```typescript
orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  orderNumber: text("order_number").notNull().unique(),
  status: orderStatusEnum("status").default('pending'),
  total: doublePrecision("total").notNull(),
  shippingAddressId: integer("shipping_address_id").references(() => addresses.id).notNull(),
  billingAddressId: integer("billing_address_id").references(() => addresses.id).notNull(),
  paymentStatus: paymentStatusEnum("payment_status").default('pending'),
  stripePaymentIntentId: text("stripe_payment_intent_id"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
```

## 4. Backend Implementation

### 4.1. API Structure
The Express backend implements a RESTful API with the following key endpoints:

#### Authentication
- POST /api/auth/register
- POST /api/auth/login
- POST /api/auth/logout
- GET /api/auth/me

#### Products
- GET /api/products
- GET /api/products/:id
- GET /api/products/featured
- GET /api/products/search

#### Orders
- GET /api/orders
- POST /api/orders
- GET /api/orders/:id

### 4.2. Authentication Flow
```typescript
// Authentication middleware
const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  const sessionId = req.cookies.sessionId;
  if (!sessionId) {
    return next();
  }
  
  try {
    const session = await storage.getSessionById(sessionId);
    if (!session) {
      return next();
    }
    
    const user = await storage.getUserById(session.userId);
    if (!user) {
      return next();
    }
    
    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};
```

### 4.3. Data Access Layer
The storage layer provides a clean interface for database operations:
```typescript
export interface IStorage {
  // User operations
  getUserById(id: number): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User | undefined>;
  
  // Product operations  
  getAllProducts(): Promise<Product[]>;
  getProduct(id: number): Promise<Product | undefined>;
  
  // Order operations
  createOrder(order: InsertOrder, items: InsertOrderItem[]): Promise<Order>;
  getOrderById(id: number): Promise<Order | undefined>;
}
```

## 5. Frontend Implementation

### 5.1. Project Structure
```
client/
├── src/
│   ├── components/
│   │   ├── ui/
│   │   ├── layout/
│   │   └── product/
│   ├── hooks/
│   ├── pages/
│   ├── lib/
│   └── App.tsx
```

### 5.2. Key Components
Primary UI components include:
- ProductGrid for displaying product listings
- CartSummary for shopping cart display
- CheckoutForm for order processing
- PaymentForm using Stripe Elements

### 5.3. State Management
```typescript
// Shopping cart context
export const CartContext = createContext<{
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: number) => void;
  clearCart: () => void;
} | undefined>(undefined);
```

## 6. Payment Integration

### 6.1. Stripe Implementation
```typescript
// Payment intent creation
app.post("/api/create-payment-intent", async (req: Request, res: Response) => {
  if (!stripe) {
    return res.status(500).json({ 
      message: "Stripe is not configured" 
    });
  }
  
  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(order.total * 100),
    currency: "usd",
    metadata: {
      orderId: order.id.toString()
    }
  });
  
  res.json({ clientSecret: paymentIntent.client_secret });
});
```

## 7. Testing Strategy

### 7.1. Frontend Testing
- Component testing with React Testing Library
- Integration tests for key user flows
- End-to-end testing with Playwright

### 7.2. Backend Testing
- API endpoint testing
- Database operation testing
- Authentication flow testing
- Payment integration testing

### 7.3. Test Scenarios
Key test cases include:
- User registration and login
- Product browsing and search
- Cart operations
- Checkout process
- Order management

## 8. Deployment

### 8.1. Environment Setup
The application is configured for deployment on Replit:
- Frontend served via Vite
- Backend API on port 5000
- PostgreSQL database connection via environment variables

### 8.2. Build Process
```typescript
// Vite configuration
export default defineConfig({
  server: {
    port: 5000,
    host: '0.0.0.0'
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  }
});
```

## 9. Security Considerations

### 9.1. Authentication Security
- Password hashing with bcrypt
- Session-based authentication
- CSRF protection
- Rate limiting on login attempts

### 9.2. Payment Security
- PCI compliance via Stripe Elements
- Secure webhook handling
- Encryption of sensitive data

## 10. Monitoring and Maintenance

### 10.1. Error Handling
Centralized error handling middleware:
```typescript
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  res.status(status).json({ message });
});
```

### 10.2. Logging
Structured logging for key operations:
- API requests and responses
- Authentication events
- Payment processing
- Error conditions

## 11. Future Enhancements

### 11.1. Planned Features
- Advanced product search
- User reviews and ratings
- Inventory management
- Analytics dashboard
- Marketing integrations

### 11.2. Technical Improvements
- Performance optimization
- Caching implementation
- API versioning
- Enhanced security measures

## 12. Conclusion

This technical specification provides a comprehensive overview of the Plenaire e-commerce platform implementation. It serves as the primary reference for development and QA processes, ensuring consistent understanding of the system architecture and functionality.
