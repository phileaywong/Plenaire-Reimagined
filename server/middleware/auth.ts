import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { storage } from '../storage';

// JWT secret - in production this should be an environment variable
const JWT_SECRET = process.env.JWT_SECRET || 'plenaire-secret-key';

// Types
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        email: string;
        role: string;
      };
      session?: {
        id: string;
      };
    }
  }
}

// Helper function to generate tokens
export const generateToken = (userId: number): string => {
  return jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: '7d' });
};

// Authentication middleware
export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get token from header or cookie
    const token = req.headers.authorization?.split(' ')[1] || req.cookies?.token;
    
    if (!token) {
      return next(); // Continue without authentication
    }
    
    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET) as { id: number };
    
    // Get user from DB
    const user = await storage.getUserById(decoded.id);
    
    if (!user) {
      return next(); // User not found, continue without authentication
    }
    
    // Attach user to request
    req.user = {
      id: user.id,
      email: user.email,
      role: user.role
    };
    
    next();
  } catch (error) {
    // Invalid token, continue without authentication
    next();
  }
};

// Check if user is authenticated
export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  next();
};

// Check if user is an admin
export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin permission required' });
  }
  
  next();
};

// Session-based authentication
export const authenticateSession = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get session ID from cookie
    const sessionId = req.cookies?.sessionId;
    
    if (!sessionId) {
      return next(); // Continue without authentication
    }
    
    // Get session from DB
    const session = await storage.getSessionById(sessionId);
    
    if (!session) {
      return next(); // Session not found, continue without authentication
    }
    
    // Check if session is expired
    if (new Date() > new Date(session.expiresAt)) {
      // Delete expired session
      await storage.deleteSession(sessionId);
      return next(); // Continue without authentication
    }
    
    // Get user from DB
    const user = await storage.getUserById(session.userId);
    
    if (!user) {
      return next(); // User not found, continue without authentication
    }
    
    // Attach user and session to request
    req.user = {
      id: user.id,
      email: user.email,
      role: user.role
    };
    
    req.session = {
      id: session.id
    };
    
    next();
  } catch (error) {
    // Error, continue without authentication
    next();
  }
};