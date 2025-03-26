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
}

export interface Category {
  id: number;
  name: string;
  description: string;
}

export interface LifestyleItem {
  id: number;
  title: string;
  description: string;
  imageUrl: string;
  link: string;
}

export interface NewsletterSubscription {
  id: number;
  email: string;
  createdAt: string;
}
