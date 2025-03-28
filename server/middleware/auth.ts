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
        captchaText?: string;
      };
    }
  }
}

// Helper function to generate tokens
export const generateToken = (userId: number): string => {
  return jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: '7d' });
};

// Authentication middleware - combines both token and session-based auth
export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // First try session-based auth (more secure)
    const sessionId = req.cookies?.sessionId;
    
    if (sessionId) {
      const session = await storage.getSessionById(sessionId);
      
      if (session) {
        // Check if session is expired
        if (new Date() > new Date(session.expiresAt)) {
          // Delete expired session
          await storage.deleteSession(sessionId);
        } else {
          // Session is valid, get user
          const user = await storage.getUserById(session.userId);
          
          if (user) {
            // Attach user and session to request
            req.user = {
              id: user.id,
              email: user.email,
              role: user.role || 'user'
            };
            
            // Convert captchaText to string | undefined (avoiding null)
            const captchaText = typeof session.captchaText === 'string' ? session.captchaText : undefined;
            
            req.session = {
              id: session.id,
              captchaText: captchaText
            };
            
            return next();
          }
        }
      }
    }
    
    // If session auth failed, try token-based auth as fallback
    const token = req.headers.authorization?.split(' ')[1] || req.cookies?.token;
    
    if (token) {
      const decoded = jwt.verify(token, JWT_SECRET) as { id: number };
      const user = await storage.getUserById(decoded.id);
      
      if (user) {
        // Attach user to request
        req.user = {
          id: user.id,
          email: user.email,
          role: user.role || 'user'
        };
        
        return next();
      }
    }
    
    // No valid authentication found
    next();
  } catch (error) {
    // Error during authentication, continue without authenticating
    console.error('Auth error:', error);
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

// Session-based authentication (kept for backward compatibility)
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
      role: user.role || 'user'
    };
    
    // Convert captchaText to string | undefined (avoiding null)
    const captchaText = typeof session.captchaText === 'string' ? session.captchaText : undefined;
    
    req.session = {
      id: session.id,
      captchaText: captchaText
    };
    
    next();
  } catch (error) {
    // Error, continue without authentication
    console.error('Session auth error:', error);
    next();
  }
};