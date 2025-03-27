export interface Product {
  id: number;
  name: string;
  price: number;
  description: string;
  imageUrl: string;
  featured: boolean;
  reviewCount: number;
  ingredients?: string[];
  categoryId: number;
  stock?: number;
  sku: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Category {
  id: number;
  name: string;
  description: string;
  imageUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface LifestyleItem {
  id: number;
  title: string;
  description: string;
  imageUrl: string;
  link: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface NewsletterSubscription {
  id: number;
  email: string;
  createdAt: string;
}

export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  phone?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Address {
  id: number;
  userId: number;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Wishlist {
  id: number;
  userId: number;
  productId: number;
  createdAt: string;
  product: Product;
}

export interface Review {
  id: number;
  userId: number;
  productId: number;
  rating: number;
  comment?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Cart {
  id: number;
  userId: number;
  createdAt: string;
  updatedAt?: string;
}

export interface CartItem {
  id: number;
  cartId: number;
  productId: number;
  quantity: number;
  createdAt?: string;
  updatedAt?: string;
  product: Product;
}

export interface Order {
  id: number;
  userId: number;
  orderNumber: string;
  status: string;
  total: number;
  paymentStatus: string;
  shippingAddressId: number;
  billingAddressId: number;
  stripePaymentIntentId?: string;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
  items?: OrderItem[];
}

export interface OrderItem {
  id: number;
  orderId: number;
  productId: number;
  quantity: number;
  price: number;
  createdAt?: string;
  product: Product;
}

export interface Enquiry {
  id: number;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  userId?: number;
  isResolved: boolean;
  createdAt: string;
}
