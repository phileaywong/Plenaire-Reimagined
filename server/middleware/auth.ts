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
    
    // Log the sessionId for debugging
    console.log(`Auth middleware - Session ID from cookie: ${sessionId || 'none'}`);
    
    if (sessionId) {
      const session = await storage.getSessionById(sessionId);
      
      if (session) {
        // Check if session is expired
        if (new Date() > new Date(session.expiresAt)) {
          // Delete expired session
          console.log(`Auth middleware - Session expired: ${sessionId}`);
          await storage.deleteSession(sessionId);
        } else {
          // Session is valid, get user
          console.log(`Auth middleware - Valid session for user ID: ${session.userId}`);
          const user = await storage.getUserById(session.userId);
          
          if (user) {
            // Log user data for debugging
            console.log('Auth middleware - User data from session:', {
              id: user.id,
              email: user.email,
              role: user.role,
              roleType: typeof user.role
            });
            
            // Attach user and session to request with normalized role
            req.user = {
              id: user.id,
              email: user.email,
              // Ensure role is properly normalized as a string value
              role: user.role ? String(user.role) : 'user'
            };
            
            // Convert captchaText to string | undefined (avoiding null)
            const captchaText = typeof session.captchaText === 'string' ? session.captchaText : undefined;
            
            req.session = {
              id: session.id,
              captchaText: captchaText
            };
            
            return next();
          } else {
            console.log(`Auth middleware - User not found for session: ${sessionId}`);
          }
        }
      } else {
        console.log(`Auth middleware - Session not found: ${sessionId}`);
      }
    }
    
    // If session auth failed, try token-based auth as fallback
    const token = req.headers.authorization?.split(' ')[1] || req.cookies?.token;
    
    if (token) {
      console.log('Auth middleware - Attempting token-based auth');
      try {
        const decoded = jwt.verify(token, JWT_SECRET) as { id: number };
        const user = await storage.getUserById(decoded.id);
        
        if (user) {
          // Log user data for debugging
          console.log('Auth middleware - User data from token:', {
            id: user.id,
            email: user.email,
            role: user.role,
            roleType: typeof user.role
          });
          
          // Attach user to request with normalized role
          req.user = {
            id: user.id,
            email: user.email,
            // Ensure role is properly normalized as a string value
            role: user.role ? String(user.role) : 'user'
          };
          
          return next();
        } else {
          console.log(`Auth middleware - User not found for token ID: ${decoded.id}`);
        }
      } catch (tokenError) {
        console.error('Auth middleware - Token verification error:', tokenError);
      }
    }
    
    // No valid authentication found
    console.log('Auth middleware - No valid authentication found');
    next();
  } catch (error) {
    // Error during authentication, continue without authenticating
    console.error('Auth middleware - Error:', error);
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

// Helper function to check if a user is an admin
const isUserAdmin = (user: any): boolean => {
  if (!user) return false;
  
  console.log('SERVER - isUserAdmin check - Raw user data:', {
    id: user.id,
    email: user.email,
    role: user.role,
    roleType: typeof user.role,
    roleStringified: JSON.stringify(user.role)
  });
  
  // First check: Known admin email (most reliable)
  const isKnownAdmin = user.email === 'admin@localhost.localdomain';
  if (isKnownAdmin) {
    console.log('SERVER - Admin check: Email matches known admin');
    return true;
  }
  
  // Second check: Direct role comparison with multiple admin values
  const adminValues = ['admin', 'ADMIN', 'Admin', '1', 1];
  if (adminValues.includes(user.role)) {
    console.log('SERVER - Admin check: Direct role match');
    return true;
  }
  
  // Third check: Case-insensitive string comparison
  if (typeof user.role === 'string') {
    const normalizedRole = user.role.toLowerCase().trim();
    if (normalizedRole === 'admin') {
      console.log('SERVER - Admin check: Normalized role match');
      return true;
    }
  }
  
  // Last check: Special handling for numeric role if stored as number
  if (user.role === 1 || user.role === '1') {
    console.log('SERVER - Admin check: Numeric role match');
    return true;
  }
  
  // Not an admin by any check
  console.log('SERVER - Admin check: All checks failed, not an admin');
  return false;
};

// Check if user is an admin
export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    console.log("Admin check failed: No user found in request");
    return res.status(401).json({ message: 'Authentication required' });
  }
  
  // Detailed debug logging for troubleshooting
  console.log(`Admin check for user ${req.user.id}:`, {
    userId: req.user.id,
    email: req.user.email,
    role: req.user.role,
    roleType: typeof req.user.role,
    normalizedRole: String(req.user.role || '').toLowerCase(),
    isAdmin: isUserAdmin(req.user)
  });
  
  // Use the helper function for consistent admin checks
  if (!isUserAdmin(req.user)) {
    console.log(`Admin access denied for user ${req.user.id}`);
    return res.status(403).json({ message: 'Admin permission required' });
  }
  
  // Admin access granted
  console.log(`Admin access granted for user ${req.user.id}`);
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
    
    // Attach user and session to request with normalized role
    req.user = {
      id: user.id,
      email: user.email,
      // Ensure role is properly normalized as a string value
      role: user.role ? String(user.role) : 'user'
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