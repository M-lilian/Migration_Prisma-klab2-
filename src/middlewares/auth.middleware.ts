import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// 1. Extend the Express Request type so TypeScript knows about our custom fields
export interface AuthRequest extends Request {
  userId?: number;
  role?: string;
}

// 2. The Main Bouncer (Checks if you have a valid token)
export const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  
  // Check if token exists and starts with "Bearer "
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }

  // Extract the actual token string
  const token = authHeader.split(' ')[1];

  try {
    // Verify the token using your secret key
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { userId: number, role: string };
    
    // Attach the user's ID and role to the request so the controllers can use them later!
    req.userId = decoded.userId;
    req.role = decoded.role;
    
    next(); // Let them pass
  } catch (error) {
    // If the token is fake, modified, or expired, jwt.verify throws an error
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};

// 3. The VIP Checkers (Run AFTER authenticate)

export const requireHost = (req: AuthRequest, res: Response, next: NextFunction) => {
  // ADMINs can do everything a HOST can do
  if (req.role === "HOST" || req.role === "ADMIN") {
    next();
  } else {
    return res.status(403).json({ error: "Forbidden: You do not have host privileges" });
  }
};

export const requireGuest = (req: AuthRequest, res: Response, next: NextFunction) => {
  // ADMINs can do everything a GUEST can do
  if (req.role === "GUEST" || req.role === "ADMIN") {
    next();
  } else {
    return res.status(403).json({ error: "Forbidden: You do not have guest privileges" });
  }
};

export const requireAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.role === "ADMIN") {
    next();
  } else {
    return res.status(403).json({ error: "Forbidden: Admins only" });
  }
};