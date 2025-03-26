import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertNewsletterSubscriptionSchema } from "@shared/schema";
import { z } from "zod";
import { ZodError } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
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
