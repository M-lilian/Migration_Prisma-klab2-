import { Request, Response, NextFunction } from 'express';
import prisma from '../config/prisma';
import { createListingSchema, updateListingSchema } from '../validators/listings.validator';
import { AuthRequest } from '../middlewares/auth.middleware'; // Import our custom request type!

export const getAllListings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const listings = await prisma.listing.findMany({
      skip,
      take: limit,
      include: {
        host: { select: { name: true, avatar: true } },
        _count: { select: { bookings: true } }
      }
    });
    res.json(listings);
  } catch (error) { next(error); }
};

export const getListingById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const listing = await prisma.listing.findUnique({
      where: { id: parseInt(req.params.id as string) },
      include: {
        host: true,
        bookings: {
          include: {
            guest: { select: { name: true, avatar: true } }
          }
        }
      }
    });
    if (!listing) return res.status(404).json({ error: 'Listing not found' });
    res.json(listing);
  } catch (error) { next(error); }
};

export const createListing = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const result = createListingSchema.safeParse(req.body);
    if (!result.success) return res.status(400).json({ errors: result.error.issues });

    // Force the hostId to be the logged-in user's ID. No faking allowed!
    const listing = await prisma.listing.create({ 
      data: { 
        ...result.data, 
        hostId: req.userId as number 
      } 
    });
    res.status(201).json(listing);
  } catch (error) { next(error); }
};

export const updateListing = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const listingId = parseInt(req.params.id as string);

    // 1. Fetch the listing to check who owns it
    const listing = await prisma.listing.findUnique({ where: { id: listingId } });
    if (!listing) return res.status(404).json({ error: 'Listing not found' });

    // 2. Ownership Check: Are you the owner? Or are you an ADMIN?
    if (listing.hostId !== req.userId && req.role !== "ADMIN") {
      return res.status(403).json({ error: "You can only edit your own listings" });
    }

    const result = updateListingSchema.safeParse(req.body);
    if (!result.success) return res.status(400).json({ errors: result.error.issues });

    const updatedListing = await prisma.listing.update({
      where: { id: listingId },
      data: result.data
    });
    res.json(updatedListing);
  } catch (error) { next(error); }
};

export const deleteListing = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const listingId = parseInt(req.params.id as string);

    // 1. Fetch the listing
    const listing = await prisma.listing.findUnique({ where: { id: listingId } });
    if (!listing) return res.status(404).json({ error: 'Listing not found' });

    // 2. Ownership Check
    if (listing.hostId !== req.userId && req.role !== "ADMIN") {
      return res.status(403).json({ error: "You can only delete your own listings" });
    }

    await prisma.listing.delete({ where: { id: listingId } });
    res.status(204).send();
  } catch (error) { next(error); }
};