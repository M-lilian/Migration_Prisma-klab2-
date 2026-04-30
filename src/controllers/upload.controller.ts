import { Request, Response, NextFunction } from 'express';
import prisma from '../config/prisma';
import { uploadToCloudinary, deleteFromCloudinary } from '../config/cloudinary';

export interface AuthRequest extends Request {
  userId?: number;
}

// 1. UPLOAD AVATAR
export const uploadAvatar = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
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

    const result = await uploadToCloudinary(req.file.buffer, req.file.mimetype, "airbnb/avatars");

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
export const deleteAvatar = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
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

// 3. UPLOAD LISTING PHOTOS
export const uploadListingPhotos = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const listingId = parseInt(req.params.id as string);

    const listing = await prisma.listing.findUnique({ where: { id: listingId } });
    if (!listing) return res.status(404).json({ error: "Listing not found" });

    if (listing.hostId !== req.userId) {
      return res.status(403).json({ error: "Forbidden: You can only upload photos to your own listings" });
    }

    // Count existing photos
    const existingCount = await prisma.listingPhoto.count({ where: { listingId } });
    if (existingCount >= 5) {
      return res.status(400).json({ error: "Maximum of 5 photos allowed per listing" });
    }

    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0) {
      return res.status(400).json({ error: "No files uploaded" });
    }

    // Only process up to remaining slots
    const remainingSlots = 5 - existingCount;
    const filesToProcess = files.slice(0, remainingSlots);

    // Upload each file to Cloudinary and save to DB
    const uploadedPhotos = await Promise.all(
      filesToProcess.map(async (file) => {
        const result = await uploadToCloudinary(file.buffer, file.mimetype, "airbnb/listings");
        return prisma.listingPhoto.create({
          data: {
            url: result.url,
            publicId: result.publicId,
            listingId,
          },
        });
      })
    );

    // Return updated listing with all photos
    const updatedListing = await prisma.listing.findUnique({
      where: { id: listingId },
      include: { photos: true },
    });

    res.status(201).json(updatedListing);
  } catch (error) { next(error); }
};

// 4. DELETE LISTING PHOTO
export const deleteListingPhoto = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const listingId = parseInt(req.params.id as string);
    const photoId = parseInt(req.params.photoId as string);

    const listing = await prisma.listing.findUnique({ where: { id: listingId } });
    if (!listing) return res.status(404).json({ error: "Listing not found" });

    if (listing.hostId !== req.userId) {
      return res.status(403).json({ error: "Forbidden: You can only delete photos from your own listings" });
    }

    const photo = await prisma.listingPhoto.findUnique({ where: { id: photoId } });
    if (!photo) return res.status(404).json({ error: "Photo not found" });

    // Prevent deleting photos from other listings
    if (photo.listingId !== listingId) {
      return res.status(403).json({ error: "Photo does not belong to this listing" });
    }

    await deleteFromCloudinary(photo.publicId);
    await prisma.listingPhoto.delete({ where: { id: photoId } });

    res.json({ message: "Photo successfully deleted" });
  } catch (error) { next(error); }
};