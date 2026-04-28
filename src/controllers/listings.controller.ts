import { Request, Response, NextFunction } from 'express';
import prisma from '../config/prisma';
import { createListingSchema, updateListingSchema } from '../validators/listings.validator';

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

export const createListing = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = createListingSchema.safeParse(req.body);
    if (!result.success) return res.status(400).json({ errors: result.error.issues });

    const listing = await prisma.listing.create({ data: result.data });
    res.status(201).json(listing);
  } catch (error) { next(error); }
};

export const updateListing = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = updateListingSchema.safeParse(req.body);
    if (!result.success) return res.status(400).json({ errors: result.error.issues });

    const listing = await prisma.listing.update({
      where: { id: parseInt(req.params.id as string) },
      data: result.data
    });
    res.json(listing);
  } catch (error) { next(error); }
};

export const deleteListing = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await prisma.listing.delete({ where: { id: parseInt(req.params.id as string) } });
    res.status(204).send();
  } catch (error) { next(error); }
};