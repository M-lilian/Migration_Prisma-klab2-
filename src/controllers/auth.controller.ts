import { Request, Response, NextFunction } from 'express';
import prisma from '../config/prisma';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { AuthRequest } from '../middlewares/auth.middleware';

// 1. REGISTER
export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, email, username, phone, password, role } = req.body;

    if (!name || !email || !username || !phone || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }
    if (password.length < 8) {
      return res.status(400).json({ error: "Password must be at least 8 characters" });
    }

    const existingUser = await prisma.user.findFirst({
      where: { OR: [{ email }, { username }] }
    });
    if (existingUser) {
      return res.status(409).json({ error: "Email or username is already taken" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const assignedRole = (role === "HOST" || role === "GUEST") ? role : "GUEST";

    const user = await prisma.user.create({
      data: {
        name, email, username, phone,
        password: hashedPassword,
        role: assignedRole
      }
    });

    const { password: _, ...userWithoutPassword } = user;
    res.status(201).json(userWithoutPassword);
  } catch (error) { next(error); }
};

// 2. LOGIN
export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    
    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) return res.status(401).json({ error: "Invalid credentials" });

    const token = jwt.sign(
      { userId: user.id, role: user.role }, 
      process.env.JWT_SECRET as string, 
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    const { password: _, ...userWithoutPassword } = user;
    res.json({ token, user: userWithoutPassword });
  } catch (error) { next(error); }
};

// 3. GET ME (User Profile)
export const getMe = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId as number },
      include: {
        listings: req.role === "HOST" ? true : false,
        bookings: req.role === "GUEST" ? { include: { listing: true } } : false
      }
    });

    if (!user) return res.status(404).json({ error: "User not found" });

    // Strip out all the security stuff before sending it back
    const { password, resetToken, resetTokenExpiry, ...safeUser } = user;
    res.json(safeUser);
  } catch (error) { next(error); }
};

// 4. CHANGE PASSWORD
export const changePassword = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) return res.status(400).json({ error: "Both passwords required" });

    const user = await prisma.user.findUnique({ where: { id: req.userId as number } });
    if (!user) return res.status(404).json({ error: "User not found" });

    const isValid = await bcrypt.compare(currentPassword, user.password);
    if (!isValid) return res.status(401).json({ error: "Invalid current password" });

    if (newPassword.length < 8) return res.status(400).json({ error: "New password must be at least 8 characters" });

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: req.userId as number },
      data: { password: hashedPassword }
    });

    res.json({ message: "Password updated successfully!" });
  } catch (error) { next(error); }
};

// 5. FORGOT PASSWORD
export const forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email is required" });

    const user = await prisma.user.findUnique({ where: { email } });
    
    const successMessage = "If that email is registered, a reset link has been sent.";
    if (!user) return res.json({ message: successMessage });

    const rawToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');
    
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken: hashedToken,
        resetTokenExpiry: new Date(Date.now() + 60 * 60 * 1000)
      }
    });

    const resetLink = `http://localhost:3000/auth/reset-password/${rawToken}`;
    console.log(`[EMAIL SIMULATOR] Send this link to ${email}: ${resetLink}`);

    res.json({ message: successMessage });
  } catch (error) { next(error); }
};

// 6. RESET PASSWORD
export const resetPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const rawToken = req.params.token as string;
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 8) {
      return res.status(400).json({ error: "Password must be at least 8 characters" });
    }

    const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');

    const user = await prisma.user.findFirst({
      where: {
        resetToken: hashedToken,
        resetTokenExpiry: { gt: new Date() }
      }
    });

    if (!user) return res.status(400).json({ error: "Invalid or expired reset token" });

    const hashedPassword = await bcrypt.hash(newPassword,