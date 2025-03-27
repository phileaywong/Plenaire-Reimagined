# Plenaire E-commerce Platform Design Specification Document

## 1. Introduction

### 1.1. Purpose
This document provides a comprehensive technical design specification for the Plenaire e-commerce platform. It outlines the architecture, components, data flow, and interactions of the application, serving as a reference for development, testing, and ongoing maintenance.

### 1.2. Scope
This specification covers the entire application architecture including:

- Frontend React.js application structure
- Backend Express.js API implementation
- PostgreSQL database schema and relationships
- Authentication system
- Product catalog management
- Shopping cart and checkout system
- Stripe payment integration
- Order management and tracking

### 1.3. Design Philosophy Overview
The Plenaire e-commerce platform is built around the following key design principles:

- **Luxury Brand Experience:** Clean, sophisticated UI with carefully chosen typography, color palettes, and imagery reflecting the premium beauty brand identity.
- **Component-Based Architecture:** Modular, reusable React components for consistent UI and maintainable codebase.
- **Responsive Design:** Mobile-first approach ensuring optimal display across all devices.
- **RESTful API Structure:** Clear, consistent API endpoints for data operations.
- **Secure Authentication:** JWT-based authentication with PostgreSQL session management.
- **Persistent Data Storage:** PostgreSQL database with well-defined schema and relationships.
- **Secure Payment Processing:** Stripe integration for handling financial transactions.

## 2. System Architecture

### 2.1. High-Level Architecture
The application follows a modern client-server architecture:

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │     │                 │
│   React.js      │     │   Express.js    │     │   PostgreSQL    │
│   Frontend      │◄────►   Backend API   │◄────►   Database      │
│                 │     │                 │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
        ▲                       ▲
        │                       │
        ▼                       ▼
┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │
│   Stripe        │     │   Other         │
│   Payment API   │     │   External APIs │
│                 │     │                 │
└─────────────────┘     └─────────────────┘
```

### 2.2. Technology Stack

**Frontend:**
- React.js for UI components and state management
- TypeScript for type safety
- React Query for server state management
- React Hook Form for form handling
- Tailwind CSS with Shadcn UI components for styling
- Wouter for routing

**Backend:**
- Express.js for REST API
- TypeScript for type safety
- Passport.js for authentication
- bcrypt for password hashing
- JWT for authorization tokens

**Database:**
- PostgreSQL for persistent storage
- Drizzle ORM for database operations
- Zod for validation schemas

**External Integrations:**
- Stripe API for payment processing

## 3. Database Design

### 3.1. Entity Relationship Diagram
The primary entities and their relationships are illustrated below:

```
┌──────────────┐       ┌───────────────┐       ┌──────────────┐
│    Users     │       │  Addresses    │       │ Categories   │
├──────────────┤       ├───────────────┤       ├──────────────┤
│ id           │       │ id            │       │ id           │
│ email        │       │ user_id       │------>│ name         │
│ password     │<------│ address_line1 │       │ description  │
│ first_name   │       │ city          │       │ image_url    │
│ last_name    │       │ country       │       └──────────────┘
│ phone        │       │ is_default    │              ▲
│ role         │       └───────────────┘              │
└──────────────┘               ▲                      │
      ▲   ▲                    │                      │
      │   │                    │                      │
      │   │                    │                      │
┌─────┴───┴─────┐      ┌───────┴───────┐     ┌────────┴───────┐
│  Orders       │      │   Cart        │     │   Products     │
├───────────────┤      ├───────────────┤     ├────────────────┤
│ id            │      │ id            │     │ id             │
│ user_id       │      │ user_id       │     │ name           │
│ status        │      └───────────────┘     │ price          │
│ total         │              │             │ description    │
│ address_id    │              │             │ image_url      │
│ payment_status│              ▼             │ category_id    │
└───────────────┘      ┌───────────────┐     │ featured       │
      │                │  Cart Items   │     │ ingredients    │
      │                ├───────────────┤     │ stock          │
      ▼                │ id            │     │ sku            │
┌───────────────┐      │ cart_id       │     └────────────────┘
│  Order Items  │      │ product_id    │-----┐      ▲   ▲
├───────────────┤      │ quantity      │     │      │   │
│ id            │      └───────────────┘     │      │   │
│ order_id      │                            │      │   │
│ product_id    │----------------------------┘      │   │
│ quantity      │                                   │   │
│ price         │                                   │   │
└───────────────┘                                   │   │
                                                    │   │
                                           ┌────────┴───┴─────┐
                                           │   Wishlists      │
                                           ├──────────────────┤
                                           │ id               │
                                           │ user_id          │
                                           │ product_id       │
                                           └──────────────────┘
```

### 3.2. Database Schema

The database uses PostgreSQL with the following schema:

#### 3.2.1. Enumerations
- **user_role:** user, admin
- **order_status:** pending, processing, shipped, delivered, cancelled
- **payment_status:** pending, processing, completed, failed, refunded

#### 3.2.2. Tables

| Table                    | Description                                                            |
|--------------------------|------------------------------------------------------------------------|
| **users**                | Stores user account information including credentials and profile data |
| **sessions**             | Manages active user sessions for authentication                        |
| **addresses**            | Stores shipping and billing addresses for users                         |
| **categories**           | Product categories for organization                                     |
| **products**             | Complete product catalog with details and inventory                     |
| **lifestyle_items**      | Marketing content for the lifestyle section                             |
| **reviews**              | Product reviews by users                                                |
| **wishlists**            | User favorite/saved products                                            |
| **carts**                | Shopping carts for users                                                |
| **cart_items**           | Individual items in shopping carts                                      |
| **orders**               | Customer order details including status                                 |
| **order_items**          | Individual items in orders                                              |
| **newsletter_subscriptions** | Email subscriptions for marketing                                  |
| **enquiries**            | Customer contact/support requests                                       |

Detailed field specifications for each table are available in the attached database schema document.

## 4. Frontend Architecture

### 4.1. Component Structure
The React application is organized using a modular component structure:

```
client/
├── assets/           # Static assets (images, icons)
├── components/       # Reusable UI components
│   ├── ui/           # Basic UI elements from shadcn
│   ├── layout/       # Layout components (Header, Footer)
│   ├── product/      # Product-related components
│   ├── cart/         # Shopping cart components
│   ├── checkout/     # Checkout flow components
│   ├── auth/         # Authentication components
│   └── common/       # Shared utility components
├── hooks/            # Custom React hooks
├── lib/              # Utility functions and API clients
│   └── queryClient.ts # React Query configuration
├── pages/            # Page components
│   ├── HomePage.tsx
│   ├── ProductPage.tsx
│   ├── CartPage.tsx
│   ├── CheckoutPage.tsx
│   ├── OrderPage.tsx
│   └── ...
├── contexts/         # React contexts for global state
└── App.tsx           # Main application component
```

### 4.2. Routing Structure
The application uses Wouter for client-side routing with the following main routes:

| Route              | Component           | Description                                |
|--------------------|---------------------|--------------------------------------------|
| `/`                | HomePage            | Landing page with featured products        |
| `/products`        | ProductsPage        | Full product catalog with filtering        |
| `/products/:id`    | ProductDetailPage   | Individual product details                 |
| `/cart`            | CartPage            | Shopping cart management                   |
| `/checkout`        | CheckoutPage        | Multi-step checkout process                |
| `/payment`         | PaymentPage         | Stripe payment integration                 |
| `/orders`          | OrdersPage          | List of user orders                        |
| `/orders/:id`      | OrderDetailPage     | Individual order details                   |
| `/account`         | AccountPage         | User account management                    |
| `/auth/login`      | LoginPage           | User authentication                        |
| `/auth/register`   | RegisterPage        | New user registration                      |
| `/wishlist`        | WishlistPage        | User saved products                        |

### 4.3. State Management
- **React Query:** Used for server state (data fetching, caching, synchronization)
- **React Context:** Used for global application state (auth status, cart, etc.)
- **Component State:** Local state managed with useState/useReducer for component-specific concerns
- **URL State:** Route parameters used for navigation state (current product, filter options)

### 4.4. Form Handling
Forms use React Hook Form with Zod schema validation:
- Login/Registration forms
- Address forms
- Product review forms
- Checkout forms

## 5. Backend Architecture

### 5.1. API Structure
The Express.js backend provides a RESTful API with the following main endpoints:

#### 5.1.1. Authentication Endpoints
- **POST** `/api/auth/register`: Create new user account
- **POST** `/api/auth/login`: User authentication
- **POST** `/api/auth/logout`: End user session
- **GET** `/api/auth/me`: Get current user profile
- **PUT** `/api/auth/profile`: Update user profile
- **PUT** `/api/auth/password`: Change password

#### 5.1.2. Product Endpoints
- **GET** `/api/products`: List all products with optional filtering
- **GET** `/api/products/featured`: Get featured product
- **GET** `/api/products/:id`: Get single product details
- **GET** `/api/products/search`: Search products
- **GET** `/api/categories`: List product categories
- **GET** `/api/categories/:id/products`: Get products by category

#### 5.1.3. Cart Endpoints
- **GET** `/api/cart`: Get current user's cart
- **POST** `/api/cart/items`: Add item to cart
- **PUT** `/api/cart/items/:id`: Update cart item
- **DELETE** `/api/cart/items/:id`: Remove item from cart
- **DELETE** `/api/cart`: Clear entire cart

#### 5.1.4. Order Endpoints
- **GET** `/api/orders`: List user orders
- **GET** `/api/orders/:id`: Get order details
- **POST** `/api/orders`: Create new order

#### 5.1.5. Address Endpoints
- **GET** `/api/addresses`: List user addresses
- **POST** `/api/addresses`: Add new address
- **PUT** `/api/addresses/:id`: Update address
- **DELETE** `/api/addresses/:id`: Delete address

#### 5.1.6. Wishlist Endpoints
- **GET** `/api/wishlist`: Get user wishlist
- **POST** `/api/wishlist`: Add product to wishlist
- **DELETE** `/api/wishlist/:productId`: Remove from wishlist

#### 5.1.7. Review Endpoints
- **GET** `/api/products/:id/reviews`: Get product reviews
- **POST** `/api/products/:id/reviews`: Add product review

#### 5.1.8. Payment Endpoints
- **POST** `/api/create-payment-intent`: Initialize Stripe payment
- **POST** `/api/webhook`: Handle Stripe webhook events

#### 5.1.9. Other Endpoints
- **GET** `/api/lifestyle`: Get lifestyle content
- **POST** `/api/newsletter`: Subscribe to newsletter
- **POST** `/api/enquiries`: Submit customer enquiry

### 5.2. Middleware Architecture
The application uses several middleware components:
- `auth.middleware.ts`: Authentication validation
- `errorHandler.middleware.ts`: Central error handling
- `validation.middleware.ts`: Request validation using Zod schemas

### 5.3. Data Access Layer
- The `storage.ts` module implements the data access interface using PostgreSQL.
- This layer abstracts database operations from the API endpoints.
- Methods correspond to the core operations needed by the API endpoints.

## 6. Authentication System

### 6.1. Authentication Flow
- User submits credentials via login form
- Server validates credentials against stored bcrypt hash
- On success, server:
  - Creates a new session in the database
  - Issues a JWT token containing user ID and session ID
  - Sets HTTP-only cookie with the token
- Authenticated requests include this token
- Protected routes verify token validity and session existence

### 6.2. Authorization
- Role-based access controls using the `user.role` field
- Available roles: 'user', 'admin'
- Middleware guards protected routes

## 7. Stripe Payment Integration

### 7.1. Payment Flow
- User proceeds to checkout from cart
- Frontend requests a Stripe Payment Intent from `/api/create-payment-intent`
- Server creates Payment Intent with Stripe API and returns client secret
- Frontend uses Stripe Elements to securely collect payment details
- On successful payment, Stripe webhooks notify the application
- Order status is updated based on payment result

### 7.2. Components
- `StripeCheckout.tsx`: Frontend component using Stripe Elements
- `create-payment-intent.ts`: Backend endpoint to initialize payment
- `webhook.ts`: Handler for Stripe event notifications

## 8. User Interfaces

### 8.1. Design System
The application uses a consistent design system with:
- **Color Palette:** Clean whites, soft pastels, and subtle gold accents
- **Typography:** Elegant serif fonts for headings, clean sans-serif for body text
- **Component Library:** Shadcn UI components with Tailwind CSS for styling
- **Responsive Breakpoints:** Mobile (< 640px), Tablet (640px-1024px), Desktop (> 1024px)

### 8.2. Key Pages

#### 8.2.1. Home Page
- Hero section with gradient background and promotional messaging
- Featured product showcase
- Product category navigation
- Lifestyle content section
- Newsletter signup

#### 8.2.2. Product Listing Page
- Filterable grid of product cards
- Sidebar with category filters
- Responsive layout adjusting columns by viewport width

#### 8.2.3. Product Detail Page
- Product imagery with zoom capability
- Product information (name, price, description)
- Ingredient list
- Add to cart/wishlist functionality
- Related products section
- Review section

#### 8.2.4. Shopping Cart Page
- Line items with product details
- Quantity adjustment controls
- Cart summary with subtotal
- Proceed to checkout button

#### 8.2.5. Checkout Flow
- Multi-step process:
  - Shipping information
  - Billing information
  - Order review
  - Payment with Stripe Elements

#### 8.2.6. Account Pages
- Profile management
- Order history and tracking
- Saved addresses
- Wishlist management

## 9. Testing Strategy

### 9.1. Frontend Testing
- Component testing with React Testing Library
- Form validation testing
- User flow testing
- Responsive design testing across devices

### 9.2. Backend Testing
- API endpoint testing
- Database query testing
- Authentication/authorization testing
- Error handling testing

### 9.3. Integration Testing
End-to-end testing of key flows:
- User registration and login
- Product browsing and filtering
- Cart and checkout process
- Order placement and tracking

### 9.4. Performance Testing
- Page load time monitoring
- API response time benchmarking
- Database query optimization

## 10. Deployment and Operations

### 10.1. Deployment Architecture
- **Frontend:** Vite-built static assets served via CDN
- **Backend:** Node.js Express application on scalable infrastructure
- **Database:** PostgreSQL with appropriate backups and replication

### 10.2. Environment Configuration
- **Development:** Local environment with hot reloading
- **Testing:** Isolated environment for automated testing
- **Production:** Optimized environment with security hardening

### 10.3. Monitoring and Analytics
- Application performance monitoring
- Error tracking and alerting
- User analytics for feature usage
- Conversion funnel analysis

## 11. Future Enhancements

### 11.1. Potential Features
- User account social login integration
- Product recommendation engine
- Advanced filtering and search capabilities
- Subscription-based purchase options
- Loyalty/rewards program
- Admin dashboard for content management
- Internationalization and localization
- Enhanced mobile app experience

## 12. Conclusion

The Plenaire e-commerce platform delivers a luxurious online shopping experience for beauty products through a modern, responsive web application. It leverages React.js for the frontend UI, Express.js for the backend API, and PostgreSQL for data persistence. The system provides comprehensive features including user authentication, product catalog management, shopping cart functionality, secure checkout with Stripe, and order management. This technical specification outlines the complete architecture and implementation details for development, testing, and maintenance of the application.

This document serves as a comprehensive reference for the technical implementation of the Plenaire e-commerce platform. For detailed database schema information, API specifications, and UI component documentation, please refer to the accompanying specialized documents.
