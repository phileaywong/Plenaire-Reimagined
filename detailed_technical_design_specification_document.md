# Plenaire E-commerce Platform: Detailed Technical Design Specification

## 1. Introduction

### 1.1. Purpose
This document provides a comprehensive technical design specification for the Plenaire e-commerce platform. It details the system's architecture, components, data structures, APIs, security considerations, and operational aspects based on the current state of the codebase. This specification serves as a foundational reference for ongoing development, testing, maintenance, and future enhancements of the platform.

### 1.2. Scope
This specification encompasses the technical details of the Plenaire platform, including:
*   **Frontend Application:** Built with React, TypeScript, Vite, Tailwind CSS, and Shadcn UI.
*   **Backend API:** Developed using Express.js and TypeScript.
*   **Database:** PostgreSQL managed via Drizzle ORM, including schema definition and data access patterns.
*   **Shared Code:** TypeScript definitions and schemas used by both frontend and backend.
*   **Authentication & Authorization:** Session-based authentication mechanism, user roles, and access control.
*   **Core E-commerce Features:** Product catalog, categories, search, shopping cart, wishlist, user reviews.
*   **Checkout & Order Management:** Order creation, address management, order history.
*   **Payment Integration:** Secure payment processing using Stripe (Payment Intents and Webhooks).
*   **Admin Functionality:** Management interfaces for users, products, categories, orders, and enquiries.
*   **Configuration & Build:** Project setup, dependencies, build processes, and environment configuration.
*   **Supporting Scripts:** Database schema creation script.

### 1.3. Design Philosophy & Principles
The Plenaire platform adheres to the following design principles:
*   **Modularity:** Separation of concerns between frontend, backend, and shared code (`client/`, `server/`, `shared/` directories).
*   **Type Safety:** Extensive use of TypeScript across the stack and Drizzle ORM for database interactions to minimize runtime errors.
*   **Component-Based UI:** Leveraging React and Shadcn UI for a reusable and maintainable frontend codebase.
*   **RESTful API Design:** Providing a clear and consistent interface between the frontend and backend.
*   **Security:** Implementing standard security practices for authentication, data handling, and payment processing.
*   **Developer Experience:** Utilizing modern tooling like Vite, `tsx`, and Drizzle Kit to streamline development workflows.
*   **Maintainability:** Employing clear code structure, consistent naming conventions, and comments where necessary.

### 1.4. Document Structure
This document is organized into the following sections:
1.  **Introduction:** Purpose, scope, design principles.
2.  **System Architecture:** High-level overview and technology stack.
3.  **Database Design:** Schema details, tables, relationships, and data types.
4.  **Shared Code:** Overview of the `shared/` directory contents.
5.  **Backend Implementation:** API structure, authentication, data access, payment integration, middleware, and utilities.
6.  **Frontend Implementation:** Project structure, key components, state management, and UI libraries.
7.  **Build & Deployment:** Configuration, build process, and deployment considerations.
8.  **Security Considerations:** Authentication, authorization, payment security, and input validation.
9.  **Operational Aspects:** Logging, error handling, and monitoring.
10. **Identified Issues & Recommendations:** Potential problems found during review and suggestions for improvement.
11. **Conclusion:** Summary.

## 2. System Architecture

### 2.1. High-Level Overview
The Plenaire platform employs a client-server architecture with a distinct separation between the frontend user interface and the backend API logic. A shared library facilitates type safety and code reuse between the two.

```mermaid
graph LR
    A[Client Browser] -- HTTPS --> B(Express Server);
    B -- API Calls --> C{Application Logic};
    C -- Drizzle ORM --> D[(PostgreSQL DB)];
    C -- Session/Auth --> D;
    B -- Serve Static Files/Vite Proxy --> A;
    C -- Stripe API --> E[Stripe];
    F[Stripe Webhooks] -- HTTPS --> B;

    subgraph Frontend (React/TS/Vite)
        A
    end

    subgraph Backend (Express/TS)
        B
        C
    end

    subgraph Database
        D
    end

    subgraph External Services
        E
        F
    end
```

*   **Client:** A single-page application (SPA) built with React and TypeScript, responsible for rendering the user interface and interacting with the backend API.
*   **Server:** An Express.js application built with TypeScript, providing a RESTful API for data management, business logic execution, authentication, and payment processing.
*   **Database:** A PostgreSQL database storing all persistent application data (users, products, orders, etc.). Drizzle ORM is used for schema definition and type-safe database access.
*   **Shared Library:** Contains TypeScript types and Zod validation schemas derived from the database schema, ensuring consistency between frontend and backend.
*   **Stripe:** External service used for handling payment processing securely.

### 2.2. Technology Stack

*   **Frontend:**
    *   **Framework/Library:** React 18
    *   **Language:** TypeScript 5.6
    *   **Build Tool:** Vite 5.4
    *   **Styling:** Tailwind CSS 3.4, PostCSS, Autoprefixer
    *   **UI Components:** Shadcn UI (built on Radix UI primitives)
    *   **Routing:** Wouter
    *   **State Management:** React Context API, TanStack React Query (for server state)
    *   **Forms:** React Hook Form, Zod (for validation via `@hookform/resolvers`)
    *   **HTTP Client:** Likely `fetch` API (used implicitly by React Query)
*   **Backend:**
    *   **Framework:** Express.js 4.21
    *   **Language:** TypeScript 5.6
    *   **Runtime:** Node.js (version inferred from `tsconfig.json` `types: ["node"]`)
    *   **Database ORM:** Drizzle ORM 0.39
    *   **Database Driver:** `postgres` (pg) 8.14 (Primary), `@neondatabase/serverless` 0.10 (Secondary, potentially conflicting in `db.ts`)
    *   **Authentication:** Session-based (using `cookie-parser`, potentially `express-session` with `connect-pg-simple` or `memorystore`), bcrypt (for password hashing)
    *   **Validation:** Zod 3.23
    *   **Payment:** Stripe SDK 17.7
    *   **Development Runner:** `tsx` 4.19
    *   **Production Build:** `esbuild` 0.25
*   **Database:**
    *   **Type:** PostgreSQL (version not specified)
    *   **Schema Management:** Drizzle Kit 0.30 (`db:push`), Python script (`create_db_updated.py`) using `psycopg2` (potential redundancy).
*   **Shared:**
    *   **Schema Definition:** Drizzle ORM, TypeScript
    *   **Validation:** Zod

### 2.3. Project Structure Overview

```
/home/phileaywong/Plenaire-Reimagined/
├── client/                 # Frontend React application source
│   ├── index.html          # Entry HTML file
│   └── src/                # Main source directory (components, pages, hooks, etc.)
├── server/                 # Backend Express application source
│   ├── middleware/         # Express middleware (e.g., auth)
│   ├── utils/              # Utility functions (e.g., password hashing)
│   ├── db.ts               # Database connection setup (potentially conflicting)
│   ├── index.ts            # Express server entry point
│   ├── routes.ts           # API route definitions
│   ├── storage.ts          # Data access layer (IStorage interface, implementations)
│   └── vite.ts             # Vite integration/static serving logic
├── shared/                 # Code shared between frontend and backend
│   └── schema.ts           # Drizzle ORM schema, Zod validation schemas, TS types
├── .env                    # Environment variables (placeholder)
├── create_db_updated.py    # Python script for DB schema creation (SQL)
├── drizzle.config.ts       # Drizzle Kit configuration
├── package.json            # Project dependencies and scripts
├── tsconfig.json           # TypeScript configuration
├── tailwind.config.ts      # Tailwind CSS configuration
├── vite.config.ts          # Vite configuration (referenced by server/vite.ts)
└── ...                     # Other config files (.gitignore, .replit, etc.)
```

## 3. Database Design

The database schema is primarily defined using Drizzle ORM in `shared/schema.ts`. A potentially redundant or alternative definition exists as SQL statements within the Python script `create_db_updated.py`. The Drizzle definition is likely the source of truth for development, especially given the `drizzle-kit push` script in `package.json`.

### 3.1. Schema Definition Files
*   **`shared/schema.ts`:** Defines tables, columns, types, enums, and relationships using Drizzle ORM's TypeScript syntax. It also uses `drizzle-zod` to generate Zod schemas for validation and infers TypeScript types.
*   **`create_db_updated.py`:** Contains Python code using `psycopg2` to execute raw SQL commands (`CREATE TYPE`, `CREATE TABLE`, `ALTER TABLE ADD CONSTRAINT`, `CREATE INDEX`) to build the schema.

**Note:** Maintaining schema definitions in two separate places (`schema.ts` and `create_db_updated.py`) is prone to inconsistencies. The recommended approach is to rely solely on `shared/schema.ts` and Drizzle Kit for schema management and migrations.

### 3.2. Enumerated Types (`pgEnum`)
Defined in `shared/schema.ts` and `create_db_updated.py`:
*   `user_role`: ('user', 'admin') - Defines user access levels.
*   `order_status`: ('pending', 'processing', 'shipped', 'delivered', 'cancelled') - Tracks the fulfillment status of an order.
*   `payment_status`: ('pending', 'processing', 'completed', 'failed', 'refunded') - Tracks the payment status of an order.

```typescript
// shared/schema.ts
export const userRoleEnum = pgEnum('user_role', ['user', 'admin']);
export const orderStatusEnum = pgEnum('order_status', ['pending', 'processing', 'shipped', 'delivered', 'cancelled']);
export const paymentStatusEnum = pgEnum('payment_status', ['pending', 'processing', 'completed', 'failed', 'refunded']);
```

### 3.3. Core Tables (`pgTable`)

#### `categories`
Stores product categories.
```typescript
// shared/schema.ts
export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});
```

#### `products`
Stores product information, including pricing, description, images, stock, and relationship to categories.
```typescript
// shared/schema.ts
export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  price: doublePrecision("price").notNull(),
  description: text("description").notNull(),
  imageUrl: text("image_url").notNull(),
  featured: boolean("featured").default(false),
  reviewCount: integer("review_count").default(0), // Denormalized count
  ingredients: text("ingredients").array(),
  categoryId: integer("category_id").references(() => categories.id), // FK to categories
  stock: integer("stock").default(100),
  sku: text("sku").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});
```

#### `lifestyle_items`
Stores content for the lifestyle section (e.g., blog posts, articles).
```typescript
// shared/schema.ts
export const lifestyleItems = pgTable("lifestyle_items", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  imageUrl: text("image_url").notNull(),
  link: text("link").notNull(), // Link to the content
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});
```

#### `newsletter_subscriptions`
Stores email addresses of users subscribed to the newsletter.
```typescript
// shared/schema.ts
export const newsletterSubscriptions = pgTable("newsletter_subscriptions", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow(),
});
```

#### `users`
Stores user account information, including credentials and roles.
```typescript
// shared/schema.ts
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(), // Hashed password
  firstName: text("first_name"),
  lastName: text("last_name"),
  phone: text("phone"),
  role: userRoleEnum("role").default('user'), // FK to user_role enum
  loginAttempts: integer("login_attempts").default(0), // For brute-force protection
  lockUntil: timestamp("lock_until"), // For account lockout
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});
```

#### `sessions`
Stores active user sessions for authentication.
```typescript
// shared/schema.ts
export const sessions = pgTable("sessions", {
  id: uuid("id").primaryKey().defaultRandom(), // Session ID (UUID)
  userId: integer("user_id").references(() => users.id).notNull(), // FK to users
  captchaText: text("captcha_text"), // Stores expected captcha for verification
  expiresAt: timestamp("expires_at").notNull(), // Session expiry timestamp
  createdAt: timestamp("created_at").defaultNow(),
});
```

#### `addresses`
Stores shipping and billing addresses associated with users.
```typescript
// shared/schema.ts
export const addresses = pgTable("addresses", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(), // FK to users
  addressLine1: text("address_line1").notNull(),
  addressLine2: text("address_line2"),
  city: text("city").notNull(),
  state: text("state").notNull(),
  postalCode: text("postal_code").notNull(),
  country: text("country").notNull(),
  isDefault: boolean("is_default").default(false), // Indicates default address
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});
```

#### `wishlists`
Stores products added to a user's wishlist (Many-to-Many relationship between users and products).
```typescript
// shared/schema.ts
export const wishlists = pgTable("wishlists", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(), // FK to users
  productId: integer("product_id").references(() => products.id).notNull(), // FK to products
  createdAt: timestamp("created_at").defaultNow(),
  // Implicit unique constraint on (userId, productId) should exist or be handled in logic
});
```

#### `reviews`
Stores user reviews for products.
```typescript
// shared/schema.ts
export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(), // FK to users
  productId: integer("product_id").references(() => products.id).notNull(), // FK to products
  rating: integer("rating").notNull(), // e.g., 1-5 stars
  comment: text("comment"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  // Implicit unique constraint on (userId, productId) should exist or be handled in logic
});
```

#### `carts`
Represents a user's shopping cart.
```typescript
// shared/schema.ts
export const carts = pgTable("carts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(), // FK to users (One-to-One or One-to-Many if history kept)
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});
```

#### `cart_items`
Stores items within a shopping cart (Many-to-Many relationship between carts and products with quantity).
```typescript
// shared/schema.ts
export const cartItems = pgTable("cart_items", {
  id: serial("id").primaryKey(),
  cartId: integer("cart_id").references(() => carts.id).notNull(), // FK to carts
  productId: integer("product_id").references(() => products.id).notNull(), // FK to products
  quantity: integer("quantity").notNull().default(1),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  // Implicit unique constraint on (cartId, productId) should exist or be handled in logic
});
```

#### `orders`
Stores customer order information.
```typescript
// shared/schema.ts
export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(), // FK to users
  orderNumber: text("order_number").notNull().unique(), // User-facing order identifier
  status: orderStatusEnum("status").default('pending'), // FK to order_status enum
  total: doublePrecision("total").notNull(), // Total order amount
  shippingAddressId: integer("shipping_address_id").references(() => addresses.id).notNull(), // FK to addresses
  billingAddressId: integer("billing_address_id").references(() => addresses.id).notNull(), // FK to addresses
  paymentStatus: paymentStatusEnum("payment_status").default('pending'), // FK to payment_status enum
  stripePaymentIntentId: text("stripe_payment_intent_id"), // Reference to Stripe transaction
  notes: text("notes"), // Customer notes
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});
```

#### `order_items`
Stores individual items within an order (Many-to-Many relationship between orders and products with quantity and price at time of order).
```typescript
// shared/schema.ts
export const orderItems = pgTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").references(() => orders.id).notNull(), // FK to orders
  productId: integer("product_id").references(() => products.id).notNull(), // FK to products
  quantity: integer("quantity").notNull(),
  price: doublePrecision("price").notNull(), // Price at the time of order
  createdAt: timestamp("created_at").defaultNow(),
});
```

#### `enquiries`
Stores messages submitted through the contact form.
```typescript
// shared/schema.ts
export const enquiries = pgTable("enquiries", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  subject: text("subject").notNull(),
  message: text("message").notNull(),
  userId: integer("user_id").references(() => users.id), // Optional FK to users if submitted by logged-in user
  isResolved: boolean("is_resolved").default(false), // Status flag for admin
  createdAt: timestamp("created_at").defaultNow(),
});
```

### 3.4. Relationships & Constraints
Foreign key constraints are defined in `create_db_updated.py` and implicitly by Drizzle's `.references()` syntax in `shared/schema.ts`. Key relationships include:
*   `products` to `categories` (Many-to-One)
*   `users` to `addresses` (One-to-Many)
*   `users` to `wishlists` (One-to-Many)
*   `products` to `wishlists` (One-to-Many)
*   `users` to `reviews` (One-to-Many)
*   `products` to `reviews` (One-to-Many)
*   `users` to `carts` (One-to-One, typically)
*   `carts` to `cart_items` (One-to-Many)
*   `products` to `cart_items` (One-to-Many)
*   `users` to `orders` (One-to-Many)
*   `addresses` to `orders` (Many-to-One, for shipping and billing)
*   `orders` to `order_items` (One-to-Many)
*   `products` to `order_items` (One-to-Many)
*   `users` to `sessions` (One-to-Many)
*   `users` to `enquiries` (One-to-Many, optional)

Unique constraints exist on `users.email`, `products.sku`, `newsletter_subscriptions.email`, and `orders.orderNumber`.

### 3.5. Indexes
Indexes are defined in `create_db_updated.py` to optimize common query patterns:
*   `idx_products_featured`: On `products(featured)` for quick featured product lookups.
*   `idx_products_category`: On `products(category_id)`.
*   `idx_products_name_search`: GIN index on `products(name)` for text search.
*   `idx_orders_user`: On `orders(user_id)`.
*   `idx_orders_status`: On `orders(status)`.
*   `idx_orders_created_at`: On `orders(created_at DESC)`.
*   `idx_cart_items_cart`: On `cart_items(cart_id)`.

Drizzle does not explicitly define indexes in `shared/schema.ts` in the same way as constraints, but they can be added via Drizzle Kit migrations or potentially inferred.

## 4. Shared Code (`shared/`)

The `shared/` directory plays a crucial role in maintaining consistency and type safety between the frontend and backend.

### 4.1. `schema.ts`
This is the most critical file in the `shared/` directory. Its responsibilities include:
*   **Database Schema Definition:** Defines all PostgreSQL tables, columns, data types, and enums using Drizzle ORM's syntax (`pgTable`, `pgEnum`, etc.).
*   **Type Inference:** Automatically infers TypeScript types for database models (e.g., `type Product = typeof products.$inferSelect;`) and insert shapes (e.g., `type InsertProduct = z.infer<typeof insertProductSchema>;`). These types are used throughout the backend (`storage.ts`, `routes.ts`) and potentially the frontend for data consistency.
*   **Validation Schemas:** Uses `drizzle-zod` to generate Zod schemas (`insert...Schema`) from the Drizzle table definitions. These schemas are used for validating incoming API request data (e.g., in `routes.ts` for registration, login, cart operations). Custom Zod schemas (e.g., `loginUserSchema`) and refinements (e.g., password complexity, matching confirmation) are also defined here.

```typescript
// Example: Zod schema for user registration with password validation
export const insertUserSchema = createInsertSchema(users)
  .omit({ id: true, role: true, createdAt: true, updatedAt: true })
  .extend({
    password: z.string()
      .min(8, "Password must be at least 8 characters long")
      // ... other regex checks ...
      .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

// Example: Inferred TypeScript type
export type Product = typeof products.$inferSelect;
```

## 5. Backend Implementation (`server/`)

The backend is an Express.js application responsible for handling API requests, interacting with the database, processing payments, and managing user sessions.

### 5.1. Server Setup (`index.ts`)
*   **Initialization:** Creates an Express application instance.
*   **Middleware:**
    *   **Stripe Webhook Body Parsing:** Special handling to allow raw body parsing for the `/api/webhook` endpoint, while using `express.json()` for others.
    *   `express.urlencoded()`: Parses URL-encoded request bodies.
    *   `cookie-parser`: Parses cookies from incoming requests (essential for session management).
    *   **Request Logging:** Custom middleware logs details of API requests (`/api/*`), including method, path, status code, duration, and truncated JSON response.
    *   **Authentication Middleware:** `app.use(authenticate)` (from `./middleware/auth`) is applied globally to attempt session validation for every request.
    *   **Error Handling:** A final middleware catches errors, determines an appropriate status code, and sends a JSON error response.
*   **Routing:** Calls `registerRoutes(app)` to attach all API endpoints.
*   **Vite Integration / Static Serving:**
    *   In `development` mode, uses `setupVite` (from `./vite`) to integrate Vite's development server and HMR.
    *   In `production` mode, uses `serveStatic` (from `./vite`) to serve the built frontend static files from `dist/public`.
*   **Server Listening:** Starts the HTTP server, listening on `0.0.0.0:5000`. Port 5000 is explicitly mentioned as the required port.

```typescript
// server/index.ts (Simplified)
import express from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import cookieParser from "cookie-parser";
import { authenticate } from "./middleware/auth"; // Added import

const app = express();

// Stripe webhook raw body handling (conditional JSON parsing)
// ...

app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// Custom Request Logging Middleware
// ...

app.use(authenticate); // Apply authentication middleware globally

(async () => {
  const server = await registerRoutes(app); // Register API routes

  // Global Error Handling Middleware
  // ...

  if (app.get("env") === "development") {
    await setupVite(app, server); // Vite dev server integration
  } else {
    serveStatic(app); // Serve static build
  }

  const port = 5000;
  server.listen({ port, host: "0.0.0.0" }, () => {
    log(`serving on port ${port}`);
  });
})();
```

### 5.2. API Routes (`routes.ts`)
This file defines all `/api/*` endpoints. It uses the `storage` object for database interactions and Zod schemas (imported from `@shared/schema`) for input validation.

**Key Route Groups:**

*   **Authentication (`/api/auth/...`)**
    *   `POST /register`: Validates input using `insertUserSchema`, checks for existing email, hashes password using `hashPassword`, creates user and session via `storage`, sets `sessionId` cookie. Includes detailed logging.
    *   `POST /login`: Validates input using `loginUserSchema`, retrieves user, checks login attempts/lockout status, verifies captcha if needed (`req.session.captchaText` or `storage.getSessionById`), compares password using `comparePassword`, updates login attempts/lock status, creates session, sets `sessionId` cookie. Includes detailed logging.
    *   `POST /logout`: Clears the session from storage (`storage.deleteSession`) and removes the `sessionId` cookie.
    *   `GET /captcha`: Generates a simple 6-digit captcha, stores it in the session (both memory `req.session` and database via `storage.updateSessionCaptcha`), and returns it. Handles temporary session creation for unauthenticated users.
    *   `GET /me` (`requireAuth`): Returns the currently authenticated user's data (excluding password) based on the session.
    *   `PUT /profile` (`requireAuth`): Updates user's first name, last name, email, phone. Validates required fields and checks for email uniqueness if changed.
    *   `PUT /password` (`requireAuth`): Updates user's password after verifying the current password. Hashes the new password. **(Issue: Does not validate new password complexity)**.
*   **Addresses (`/api/addresses/...`)** (`requireAuth`)
    *   `GET /`: Fetches all addresses for the logged-in user.
    *   `POST /`: Creates a new address, validating against `insertAddressSchema`.
    *   `PUT /:id`: Updates an existing address after verifying ownership.
    *   `DELETE /:id`: Deletes an address after verifying ownership.
*   **Wishlist (`/api/wishlist/...`)** (`requireAuth`)
    *   `GET /`: Fetches the user's wishlist with product details.
    *   `POST /`: Adds a product to the wishlist, validating against `insertWishlistSchema`.
    *   `DELETE /:productId`: Removes a product from the wishlist.
*   **Reviews (`/api/products/:id/reviews/...`)**
    *   `GET /`: Fetches reviews for a specific product (public).
    *   `POST /` (`requireAuth`): Adds or updates a review for a product, validating against `insertReviewSchema`.
*   **Cart (`/api/cart/...`)** (`requireAuth`)
    *   `GET /`: Fetches the user's cart items with product details.
    *   `POST /items`: Adds an item to the cart (creates cart if needed), validating against `insertCartItemSchema`. Handles existing items by updating quantity.
    *   `PUT /items/:id`: Updates the quantity of a specific cart item.
    *   `DELETE /items/:id`: Removes an item from the cart.
    *   `DELETE /`: Clears all items from the user's cart.
*   **Orders (`/api/orders/...`)** (`requireAuth`)
    *   `GET /`: Fetches the user's order history.
    *   `GET /:id`: Fetches details of a specific order, verifying ownership.
    *   `POST /`: Creates a new order (checkout process). Validates addresses, fetches cart items, calculates total, validates order data using `insertOrderSchema`, creates order and order items via `storage`, clears the cart.
*   **Enquiries (`/api/enquiries/...`)**
    *   `POST /`: Submits a contact enquiry, validating against `insertEnquirySchema`. Associates with user if logged in. (Public)
    *   `GET /` (`requireAuth`): Fetches enquiries submitted by the logged-in user.
*   **Payments (`/api/create-payment-intent`, `/api/webhook`)**
    *   `POST /create-payment-intent`: Creates a Stripe Payment Intent. Handles both order-based payments (requires auth, uses order total) and direct amount-based payments. Updates the order with the `stripePaymentIntentId`. Requires Stripe configuration.
    *   `POST /webhook`: Handles incoming Stripe webhooks (e.g., `payment_intent.succeeded`, `payment_intent.payment_failed`). Verifies webhook signature (unless in test mode). Updates order payment and fulfillment status via `storage`. Requires Stripe webhook secret. Uses custom `rawBodyMiddleware`.
*   **Products & Categories (`/api/products/...`, `/api/categories/...`)** (Public)
    *   `GET /products`: Fetches all products.
    *   `GET /products/featured`: Fetches the featured product.
    *   `GET /products/search`: Searches products based on query parameter `q`.
    *   `GET /products/:id`: Fetches a single product by ID.
    *   `GET /categories`: Fetches all categories.
    *   `GET /categories/:id/products`: Fetches products belonging to a specific category.
*   **Lifestyle (`/api/lifestyle`)** (Public)
    *   `GET /`: Fetches all lifestyle items.
*   **Newsletter (`/api/newsletter`)** (Public)
    *   `POST /`: Subscribes an email address, validating against `insertNewsletterSubscriptionSchema`.
*   **Admin Routes (`/api/admin/...`)** (`requireAdmin`)
    *   Provides CRUD operations for Users, Products, Categories, Orders (status update), Enquiries (resolve), Newsletter Subscriptions, and Reviews.
    *   **Issue:** Most admin routes lack specific input validation using Zod schemas before calling `storage` methods (e.g., `storage.createProduct(req.body)`).

### 5.3. Data Access Layer (`storage.ts`)
This file abstracts database operations, providing a consistent interface (`IStorage`) for the rest of the backend.

*   **`IStorage` Interface:** Defines the contract for all storage operations (CRUD for all entities, plus specific methods like `getFeaturedProduct`, `searchProducts`, `getCartWithItems`, `updateOrderStatus`, etc.).
*   **`PostgresStorage` Class:** Implements `IStorage` using `drizzle-orm` and the `postgres` library to interact with a PostgreSQL database. Contains logic for all database queries, including joins where necessary (e.g., `getWishlistByUserId`, `getCartWithItems`). Handles password hashing on user creation/update. Includes data seeding logic (`initializeData`) if the database is empty.
*   **`MemStorage` Class:** Implements `IStorage` using in-memory Maps. Serves as a fallback or for testing environments where a database connection string (`DATABASE_URL`) is not provided. Mimics the database structure and relationships in memory.
*   **Export:** Exports an instance of either `PostgresStorage` or `MemStorage` based on the presence of the `DATABASE_URL` environment variable.

```typescript
// server/storage.ts (Conceptual)
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from "@shared/schema";
// ... other imports ...

export interface IStorage {
  // Method signatures for all data operations...
  getUserById(id: number): Promise<schema.User | undefined>;
  createProduct(product: schema.InsertProduct): Promise<schema.Product>;
  // ... many more methods ...
}

export class PostgresStorage implements IStorage {
  private client;
  private db; // Drizzle instance

  constructor() {
    // Initialize postgres client and Drizzle db instance
  }

  private async initializeData() {
    // Seed initial data (categories, products) if DB is empty
  }

  async getUserById(id: number): Promise<schema.User | undefined> {
    // Implementation using this.db.select()...
  }
  // ... Implementations for all IStorage methods ...
}

export class MemStorage implements IStorage {
  // In-memory maps for each table
  private users: Map<number, schema.User>;
  // ... other maps ...
  // Counters for IDs

  constructor() {
    // Initialize maps and counters
    this.initializeData(); // Seed initial data
  }

  async getUserById(id: number): Promise<schema.User | undefined> {
    // Implementation using this.users.get(id)...
  }
  // ... Implementations for all IStorage methods ...
}

// Export the appropriate storage instance
export const storage: IStorage = process.env.DATABASE_URL ? new PostgresStorage() : new MemStorage();
```

**Database Connection:** Note the potential conflict: `server/db.ts` initializes Drizzle with `@neondatabase/serverless`, while `server/storage.ts` initializes it with `postgres`. The `storage` implementation using `postgres` seems to be the one actively used by `routes.ts`. The `server/db.ts` file might be unused or intended for a different setup (e.g., Neon).

### 5.4. Authentication (`middleware/auth.ts`, `routes.ts`, `storage.ts`)
*   **Mechanism:** Session-based authentication using HTTP-only cookies.
*   **Session Storage:** Sessions are stored in the `sessions` PostgreSQL table (via `PostgresStorage`) or in memory (`MemStorage`). Each session has a UUID, user ID, optional captcha text, and an expiry timestamp.
*   **Login Flow:**
    1.  User submits email/password (+ captcha if required).
    2.  Backend validates credentials (`comparePassword`).
    3.  If valid, a new session is created in storage (`storage.createSession`).
    4.  A `sessionId` cookie (HTTP-only, SameSite=Strict) is set in the response. The cookie itself doesn't have `maxAge`, making it a browser session cookie by default, but the session *in the database* has an `expiresAt` timestamp (7 days in `storage.ts`).
*   **Request Authentication (`authenticate` middleware):**
    1.  Checks for `sessionId` cookie on incoming requests.
    2.  If found, retrieves the session from storage (`storage.getSessionById`).
    3.  If session exists and hasn't expired (expiry check seems missing in middleware, relies on DB cleanup or session retrieval failing), retrieves the associated user (`storage.getUserById`).
    4.  Attaches the user object to `req.user`.
*   **Protected Routes:** `requireAuth` middleware checks if `req.user` exists, returning 401 if not. `requireAdmin` checks if `req.user && req.user.role === 'admin'`, returning 403 if not.
*   **Logout Flow:** Deletes the session from storage (`storage.deleteSession`) and clears the `sessionId` cookie.
*   **Security Features:**
    *   Password Hashing: `bcrypt` is used (`utils/password.ts`).
    *   Login Attempts & Lockout: Tracks failed attempts (`users.login_attempts`), requires captcha after 3 attempts, locks account (`users.lockUntil`) after 5 attempts for 30 minutes.
    *   Captcha: Simple 6-digit captcha generated and stored in session for verification after multiple failed login attempts.

### 5.5. Payment Integration (`routes.ts`, `storage.ts`)
*   **Provider:** Stripe
*   **Client-Side:** Uses `@stripe/react-stripe-js` and `@stripe/stripe-js`. The frontend likely uses Stripe Elements for securely collecting card details and confirming the Payment Intent using the `clientSecret` obtained from the backend.
*   **Backend-Side:**
    *   **Initialization:** Stripe SDK initialized with `STRIPE_SECRET_KEY` from environment variables.
    *   **Payment Intent Creation (`/api/create-payment-intent`):** Creates a Stripe Payment Intent with the order amount and currency. Associates the `orderId` in metadata. Stores the `paymentIntent.id` in the `orders` table. Returns the `clientSecret` to the frontend.
    *   **Webhook Handling (`/api/webhook`):** Listens for events from Stripe (e.g., `payment_intent.succeeded`, `payment_intent.payment_failed`). Verifies the webhook signature using `STRIPE_WEBHOOK_SECRET`. Updates the corresponding order's `paymentStatus` and `status` in the database via `storage`.

### 5.6. Middleware (`middleware/`, `index.ts`)
*   `authenticate` (`middleware/auth.ts`): Attempts to authenticate user based on session cookie.
*   `requireAuth` (`middleware/auth.ts`): Ensures a user is authenticated.
*   `requireAdmin` (`middleware/auth.ts`): Ensures a user is authenticated and has the 'admin' role.
*   `cookieParser` (`index.ts`): Parses cookies.
*   `express.json` / `express.urlencoded` (`index.ts`): Parse request bodies.
*   Custom Logging Middleware (`index.ts`): Logs API request details.
*   Stripe Raw Body Middleware (`routes.ts`): Custom middleware specifically for the `/api/webhook` route to preserve the raw body needed for signature verification.
*   Global Error Handler (`index.ts`): Catches and formats errors.

### 5.7. Utilities (`utils/`)
*   `password.ts`: Contains `hashPassword` and `comparePassword` functions using `bcrypt`.

## 6. Frontend Implementation (`client/`)

Details are inferred from `client/index.html`, `package.json`, `tsconfig.json`, `tailwind.config.ts`, and standard React practices.

### 6.1. Entry Point & Setup
*   **HTML:** `client/index.html` is the main HTML file, loading CSS (fonts, Font Awesome) and the main JavaScript entry point (`/src/main.tsx`).
*   **Main Script:** `client/src/main.tsx` likely renders the root React component (`App.tsx`) into the `<div id="root"></div>` element. It probably sets up routing, context providers (e.g., React Query, Auth, Cart), and the toaster.

### 6.2. Core Libraries & Features
*   **React & TypeScript:** Foundation of the UI.
*   **Vite:** Development server and build tool, providing fast HMR and optimized production builds.
*   **Tailwind CSS & Shadcn UI:** Used for styling and UI components. `tailwind.config.ts` defines the theme based on CSS variables (likely managed by `theme.json` via `@replit/vite-plugin-shadcn-theme-json`). Provides a consistent and modern look and feel.
*   **Routing (`wouter`):** Handles navigation between different pages/views within the SPA.
*   **State Management:**
    *   **Server State:** `@tanstack/react-query` is used for fetching, caching, and synchronizing server data (products, orders, user profile, etc.). This simplifies data fetching logic in components. A `queryClient` instance is likely configured in `src/lib/queryClient.ts`.
    *   **Global UI State:** React Context API is likely used for managing global state like authentication status (`use-auth.tsx` hook suggests an AuthContext) and shopping cart contents.
*   **Forms (`react-hook-form`, `zod`):** Used for managing form state, validation (using Zod schemas via `@hookform/resolvers`), and submission, particularly for registration, login, profile updates, address forms, checkout, and contact forms.
*   **Components:** Organized within `src/components/`, likely categorized into `ui` (reusable Shadcn components), `layout` (Header, Footer, Sidebar), `product` (ProductCard, ProductGrid), `auth`, `account`, etc.
*   **Pages:** Located in `src/pages/`, representing different views/routes of the application (Home, Products, ProductDetail, Cart, Checkout, Account, Admin sections, etc.).
*   **Hooks:** Custom hooks in `src/hooks/` (e.g., `use-auth`, `use-toast`, `use-mobile`) encapsulate reusable logic and stateful behavior.
*   **Utilities (`src/lib/`):** Contains helper functions (`utils.ts`), type definitions (`types.ts`), and potentially API client setup.

### 6.3. Key UI Flows (Inferred)
*   **Authentication:** Modals or pages for login/registration (`AuthModal.tsx`, `Login.tsx`, `Register.tsx`). State managed via AuthContext/`use-auth`.
*   **Product Browsing:** Grid/list views (`ProductGrid.tsx`), detail pages (`ProductDetail.tsx`), category filtering, search (`Search.tsx`). Data fetched via React Query.
*   **Cart Management:** Adding items from product pages, viewing cart (`Cart.tsx`), updating quantities, removing items. State managed via CartContext.
*   **Checkout:** Multi-step process (`Checkout.tsx`) involving address selection, order summary, and payment.
*   **Payment:** Integration with Stripe Elements (`PaymentForm` likely exists) within the checkout flow, using the `clientSecret` from the backend to confirm payment. Redirects to `OrderConfirmation.tsx` on success.
*   **Account Management (`Account.tsx`):** Sections for profile updates, address book, order history, wishlist (`AccountProfile.tsx`, `AccountAddresses.tsx`, etc.).
*   **Admin Dashboard (`AdminPage.tsx`, etc.):** Separate section for managing application data (products, users, orders).

## 7. Build & Deployment

### 7.1. Configuration
*   **`package.json`:** Defines dependencies and scripts.
*   **`tsconfig.json`:** Configures TypeScript compiler options for the entire project (client, server, shared). Includes path aliases (`@/`, `@shared/`).
*   **`vite.config.ts`:** Configures Vite build tool (likely includes React plugin, potentially others like `@replit/vite-plugin-cartographer`, `@replit/vite-plugin-shadcn-theme-json`). Specifies build output directory (`dist`).
*   **`drizzle.config.ts`:** Configures Drizzle Kit for database schema management.
*   **`.env`:** Used for storing sensitive information like `DATABASE_URL`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`.

### 7.2. Development Workflow
*   Run `npm run dev` or `yarn dev`.
*   This executes `tsx server/index.ts`.
*   `tsx` runs the TypeScript backend server directly.
*   The server (`server/index.ts`) detects `NODE_ENV=development` and uses `setupVite` (`server/vite.ts`).
*   Vite middleware serves the frontend, providing HMR for client-side changes. Backend changes require restarting the `tsx` process.
*   The server listens on `0.0.0.0:5000`.

### 7.3. Production Build & Deployment
*   Run `npm run build` or `yarn build`.
*   This executes `vite build` (builds the frontend React app into static assets in `dist/public` - inferred path based on `server/vite.ts`) and `esbuild server/index.ts ... --outdir=dist` (compiles the backend TypeScript code into JavaScript in `dist/`).
*   Run `npm run start` or `yarn start`.
*   This executes `NODE_ENV=production node dist/index.js`.
*   The production Node.js server starts.
*   It detects `NODE_ENV=production` and uses `serveStatic` (`server/vite.ts`) to serve the pre-built static frontend assets from `dist/public`.
*   The API endpoints function as normal.
*   The server listens on `0.0.0.0:5000`.
*   Requires necessary environment variables (`DATABASE_URL`, Stripe keys) to be set in the production environment.

### 7.4. Database Schema Management
*   `npm run db:push` executes `drizzle-kit push`.
*   This command compares the schema defined in `shared/schema.ts` with the connected database (specified by `DATABASE_URL` in `drizzle.config.ts`) and generates/applies SQL statements to synchronize the database schema. This is the likely intended method for schema updates.
*   The `create_db_updated.py` script offers an alternative, SQL-based way to create the schema, potentially for initial setup or as documentation.

## 8. Security Considerations

### 8.1. Authentication & Session Management
*   **Password Hashing:** Good practice using `bcrypt`.
*   **Session Cookies:** Configured as `httpOnly` and `SameSite=Strict`, which is good.
*   **Session Expiry:** Inconsistency between browser session cookie (no `maxAge`) and database session expiry (7 days). If the browser is kept open, the cookie persists, but the backend session might expire. The `authenticate` middleware should explicitly check `session.expiresAt`.
*   **Session Fixation:** Not explicitly prevented, but using new session IDs on login helps mitigate.
*   **CSRF Protection:** No explicit CSRF middleware (like `csurf`) is visible. SPAs with cookie-based auth are vulnerable. Implementing CSRF tokens (e.g., double-submit cookie or synchronizer token pattern) is recommended.
*   **Brute Force Protection:** Login attempt tracking and account lockout are implemented, which is good. Captcha adds another layer.

### 8.2. Authorization
*   Role-based access control (`user`, `admin`) is defined.
*   Middleware (`requireAuth`, `requireAdmin`) enforces access to specific routes. Seems correctly applied to user account sections and admin routes.

### 8.3. Input Validation
*   **Good:** Zod schemas (`shared/schema.ts`) are used for validating public-facing input (registration, login, cart, checkout, enquiry). Detailed error messages are provided on validation failure (e.g., registration).
*   **Weakness:** Admin API endpoints (`/api/admin/...`) appear to lack rigorous input validation using Zod schemas before passing data to the `storage` layer (e.g., `req.body` passed directly). This is a significant vulnerability, potentially allowing invalid data or injection attacks if an admin account is compromised or makes mistakes. All input, especially for create/update operations, should be strictly validated.
*   **Weakness:** Password update (`/api/auth/password`) does not seem to re-validate the `newPassword` against the complexity rules defined in `insertUserSchema`.

### 8.4. Payment Security (Stripe)
*   **PCI Compliance:** Handled by Stripe. Card details are collected client-side using Stripe Elements and tokenized, never hitting the backend server directly.
*   **Webhook Security:** Signature verification is implemented using `STRIPE_WEBHOOK_SECRET`, which is crucial to ensure webhook authenticity. The test mode bypass needs careful management.
*   **Secret Management:** `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET` must be securely stored as environment variables and not exposed.

### 8.5. Other
*   **Dependencies:** Regular updates and audits of dependencies (`package.json`) are necessary to patch vulnerabilities.
*   **Error Handling:** While a global handler exists, ensuring sensitive information doesn't leak in error messages returned to the client is important.
*   **HTTPS:** Assumed to be handled by the deployment environment (e.g., Replit, load balancer).

## 9. Operational Aspects

### 9.1. Logging
*   **Request Logging:** `server/index.ts` includes middleware to log incoming API requests (method, path, status, duration, truncated response).
*   **Authentication Logging:** `server/routes.ts` contains detailed `console.log` statements for registration attempts, validation failures, login attempts, captcha verification, and successful logins/registrations.
*   **General Logging:** A basic `log` utility exists in `server/vite.ts`.
*   **Improvements:** Logging could be more structured (e.g., JSON format) and centralized using a dedicated logging library (like Winston or Pino) to allow for different log levels and destinations (file, console, external service). Logging database errors in `storage.ts` could be enhanced.

### 9.2. Error Handling
*   **Backend:** A global error handling middleware in `server/index.ts` catches unhandled errors, logs them (implicitly via default Express error logging or if `throw err` causes process exit), and returns a generic JSON error response. Specific routes handle Zod validation errors explicitly, returning 400 status codes with error details. Other errors often result in a 500 status.
*   **Frontend:** React Query handles server errors during data fetching. Form validation errors are handled by React Hook Form. UI should display user-friendly error messages based on API responses or client-side issues. The `@replit/vite-plugin-runtime-error-modal` might provide overlays for development errors.

### 9.3. Monitoring
*   No specific monitoring tools are integrated in the codebase.
*   Basic monitoring can be achieved by observing server logs for request patterns, errors, and performance (request duration).
*   For production, integrating application performance monitoring (APM) tools (e.g., Datadog, New Relic) and uptime monitoring would be beneficial.

## 10. Identified Issues & Recommendations

1.  **Database Connection Inconsistency (`server/db.ts` vs `server/storage.ts`):** Clarify whether Neon serverless (`@neondatabase/serverless`) or standard Postgres (`postgres` library) is the intended driver. Remove the unused configuration (`server/db.ts` seems unused).
2.  **Schema Definition Redundancy (`shared/schema.ts` vs `create_db_updated.py`):** Rely solely on `shared/schema.ts` and Drizzle Kit (`drizzle-kit push` / migrations) for schema management. Remove or clearly mark `create_db_updated.py` as deprecated or for initial setup only.
3.  **Missing Input Validation in Admin Routes:** Implement strict input validation using Zod schemas (from `shared/schema.ts`) for all admin API endpoints (`/api/admin/...`) that perform create or update operations. Do not pass `req.body` directly to storage functions without validation.
4.  **Missing New Password Validation:** The `/api/auth/password` endpoint should validate the `newPassword` against the complexity rules defined in `insertUserSchema`.
5.  **Session Expiry Check:** The `authenticate` middleware should explicitly check if `session.expiresAt` is in the past and reject the session if it is expired, even if the cookie is still present.
6.  **CSRF Protection:** Implement CSRF protection for routes handling state changes (POST, PUT, DELETE) initiated via browser interactions, especially given the use of session cookies. The double-submit cookie pattern is often suitable for SPAs.
7.  **Structured Logging:** Replace `console.log` with a dedicated logging library (e.g., Pino) for structured, leveled logging across the backend.
8.  **Error Handling Granularity:** Improve error handling within routes to return more specific error codes and messages where appropriate, rather than defaulting to 500 for many database or internal errors. Ensure sensitive details are not leaked.
9.  **Dependency Management:** Regularly review and update dependencies listed in `package.json` to patch security vulnerabilities.
10. **Transaction Management:** For operations involving multiple database writes (e.g., `createOrder` which inserts into `orders` and `orderItems`, and `clearCart`), ensure they are wrapped in database transactions within `PostgresStorage` to maintain data integrity. Drizzle ORM supports transactions.
11. **Denormalized `reviewCount`:** The `products.reviewCount` needs to be carefully managed. Ensure it's correctly incremented/decremented when reviews are created/deleted (creation seems handled in `storage.createReview`, deletion needs checking).

## 11. Conclusion

The Plenaire e-commerce platform is a substantial application built with a modern technology stack (React, TypeScript, Express, PostgreSQL, Drizzle, Stripe). It features a well-defined project structure with separation of concerns between frontend, backend, and shared code. Key functionalities like user authentication, product management, cart, checkout, and payment integration are implemented.

While the core architecture is sound, several areas require attention, particularly regarding input validation in admin routes, potential inconsistencies in database configuration and schema management, session expiry handling, and the need for CSRF protection. Addressing these issues, along with implementing more robust logging and error handling, will significantly enhance the platform's security, reliability, and maintainability. The use of TypeScript, Drizzle ORM, and Zod provides a strong foundation for building a type-safe and robust application.