import { Request, Response, NextFunction } from 'express';
import prisma from '../config/prisma';
import { profileSchema } from '../validators/profile.validator';

export const getProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = parseInt(req.params.id as string);
    const profile = await prisma.profile.findUnique({ where: { userId } });
    
    if (!profile) return res.status(404).json({ error: "Profile not found for this user" });
    res.json(profile);
  } catch (error) { next(error); }
};

export const createProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = parseInt(req.params.id as string);
    
    // 1. Check if the user even exists
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return res.status(404).json({ error: "User not found" });

    // 2. Check if they already have a profile (Assignment requirement: 409 Conflict)
    const existingProfile = await prisma.profile.findUnique({ where: { userId } });
    if (existingProfile) return res.status(409).json({ error: "Profile already exists for this user" });

    // 3. Let Zod bounce bad data
    const result = profileSchema.safeParse(req.body);
    if (!result.success) return res.status(400).json({ errors: result.error.issues });

    // 4. Create it!
    const profile = await prisma.profile.create({
      data: { ...result.data, userId }
    });
    res.status(201).json(profile);
  } catch (error) { next(error); }
};

export const updateProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = parseInt(req.params.id as string);

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return res.status(404).json({ error: "User not found" });

    const existingProfile = await prisma.profile.findUnique({ where: { userId } });
    if (!existingProfile) return res.status(404).json({ error: "Profile not found" });

    const result = profileSchema.safeParse(req.body);
    if (!result.success) return res.status(400).json({ errors: result.error.issues });

    const profile = await prisma.profile.update({
      where: { userId },
      data: result.data
    });
    res.json(profile);
  } catch (error) { next(error); }
};