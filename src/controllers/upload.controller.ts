import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { uploadToCloudinary, deleteFromCloudinary } from '../config/cloudinary';

const prisma = new PrismaClient();

// 1. UPLOAD AVATAR
export const uploadAvatar = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // 🔥 The updated strict-type fix
    const targetUserId = parseInt(req.params.id as string);

    if (req.userId !== targetUserId) {
      return res.status(403).json({ error: "Forbidden: You can only update your own avatar" });
    }

    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const user = await prisma.user.findUnique({ where: { id: targetUserId } });
    if (!user) return res.status(404).json({ error: "User not found" });

    if (user.avatarPublicId) {
      await deleteFromCloudinary(user.avatarPublicId);
    }

    const result = await uploadToCloudinary(req.file.buffer, "airbnb/avatars");

    const updatedUser = await prisma.user.update({
      where: { id: targetUserId },
      data: {
        avatar: result.url,
        avatarPublicId: result.publicId,
      },
    });

    const { password, resetToken, resetTokenExpiry, ...safeUser } = updatedUser;
    res.json(safeUser);
  } catch (error) { next(error); }
};

// 2. DELETE AVATAR
export const deleteAvatar = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // 🔥 The updated strict-type fix
    const targetUserId = parseInt(req.params.id as string);

    if (req.userId !== targetUserId) {
      return res.status(403).json({ error: "Forbidden: You can only delete your own avatar" });
    }

    const user = await prisma.user.findUnique({ where: { id: targetUserId } });
    if (!user) return res.status(404).json({ error: "User not found" });

    if (!user.avatar || !user.avatarPublicId) {
      return res.status(400).json({ error: "No avatar to remove" });
    }

    await deleteFromCloudinary(user.avatarPublicId);

    await prisma.user.update({
      where: { id: targetUserId },
      data: {
        avatar: null,
        avatarPublicId: null,
      },
    });

    res.json({ message: "Avatar successfully removed" });
  } catch (error) { next(error); }
};