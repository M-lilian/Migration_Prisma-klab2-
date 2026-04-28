import { Request, Response, NextFunction } from 'express';
import prisma from '../config/prisma';
import { ListingType } from '@prisma/client';

export const getAllListings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const { location, type, maxPrice, sortBy, order } = req.query;

    const filter: any = {};
    if (location) filter.location = { contains: location as string, mode: 'insensitive' };
    if (type) filter.type = type as ListingType;
    if (maxPrice) filter.pricePerNight = { lte: parseFloat(maxPrice as string) };

    const orderBy: any = {};
    if (sortBy) orderBy[sortBy as string] = order === 'desc' ? 'desc' : 'asc';

    const listings = await prisma.listing.findMany({
      where: filter,
      skip,
      take: limit,
      orderBy: Object.keys(orderBy).length ? orderBy : undefined,
      select: {
        id: true, title: true, location: true, pricePerNight: true,
        host: { select: { name: true, avatar: true } }
      }
    });
    res.json(listings);
  } catch (error) { next(error); }
};

export const getListingById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const listing = await prisma.listing.findUnique({
      where: { id: parseInt(req.params.id as string) },
      include: { host: true, bookings: true }
    });
    if (!listing) return res.status(404).json({ error: 'Listing not found' });
    res.json(listing);
  } catch (error) { next(error); }
};

export const createListing = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const listing = await prisma.listing.create({ data: req.body });
    res.status(201).json(listing);
  } catch (error) { next(error); }
};

export const updateListing = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const listing = await prisma.listing.update({
      where: { id: parseInt(req.params.id as string) },
      data: req.body
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