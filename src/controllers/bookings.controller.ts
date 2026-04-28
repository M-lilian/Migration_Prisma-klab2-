import { Request, Response, NextFunction } from 'express';
import prisma from '../config/prisma';

export const getAllBookings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const bookings = await prisma.booking.findMany({
      include: { guest: { select: { name: true } }, listing: { select: { title: true } } }
    });
    res.json(bookings);
  } catch (error) { next(error); }
};

export const getBookingById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const booking = await prisma.booking.findUnique({
      where: { id: parseInt(req.params.id as string) },
      include: { guest: true, listing: true }
    });
    if (!booking) return res.status(404).json({ error: 'Booking not found' });
    res.json(booking);
  } catch (error) { next(error); }
};

export const createBooking = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { guestId, listingId, checkIn, checkOut } = req.body;
    
    const listing = await prisma.listing.findUnique({ where: { id: listingId } });
    if (!listing) return res.status(404).json({ error: 'Listing not found' });

    const inDate = new Date(checkIn);
    const outDate = new Date(checkOut);
    const days = Math.ceil((outDate.getTime() - inDate.getTime()) / (1000 * 60 * 60 * 24));
    const totalPrice = days * listing.pricePerNight;

    const booking = await prisma.booking.create({
      data: { guestId, listingId, checkIn: inDate, checkOut: outDate, totalPrice }
    });
    res.status(201).json(booking);
  } catch (error) { next(error); }
};

export const deleteBooking = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await prisma.booking.delete({ where: { id: parseInt(req.params.id as string) } });
    res.status(204).send();
  } catch (error) { next(error); }
};