import { Request, Response, NextFunction } from 'express';
import prisma from '../config/prisma';
import { createBookingSchema } from '../validators/bookings.validator';
import { AuthRequest } from '../middlewares/auth.middleware';

export const getAllBookings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const bookings = await prisma.booking.findMany({
      include: {
        guest: { select: { name: true } },
        listing: { select: { title: true } }
      }
    });
    res.json(bookings);
  } catch (error) { next(error); }
};

export const getBookingById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const booking = await prisma.booking.findUnique({
      where: { id: parseInt(req.params.id as string) },
      include: {
        guest: { select: { name: true, email: true } },
        listing: { include: { host: { select: { name: true } } } }
      }
    });
    if (!booking) return res.status(404).json({ error: "Booking not found" });
    res.json(booking);
  } catch (error) { next(error); }
};

export const createBooking = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const result = createBookingSchema.safeParse(req.body);
    if (!result.success) return res.status(400).json({ errors: result.error.issues });

    const { listingId, checkIn, checkOut } = result.data;
    const guestId = req.userId as number; // Identity pulled directly from the JWT!

    // 1. Does the listing even exist?
    const listing = await prisma.listing.findUnique({ where: { id: listingId } });
    if (!listing) return res.status(404).json({ error: "Listing not found" });

    const inDate = new Date(checkIn);
    const outDate = new Date(checkOut);

    // 2. The Overlap Check (Research Task)
    // If a confirmed booking's checkIn is before our checkOut AND its checkOut is after our checkIn = Conflict!
    const conflict = await prisma.booking.findFirst({
      where: {
        listingId,
        status: "CONFIRMED",
        checkIn: { lt: outDate },
        checkOut: { gt: inDate }
      }
    });

    if (conflict) {
      return res.status(409).json({ error: "These dates are already booked." });
    }

    // 3. Server-side math (Never trust the client's math)
    const days = Math.ceil((outDate.getTime() - inDate.getTime()) / (1000 * 60 * 60 * 24));
    const totalPrice = days * listing.pricePerNight;

    // 4. Create the pending booking
    const booking = await prisma.booking.create({
      data: {
        listingId,
        guestId,
        checkIn: inDate,
        checkOut: outDate,
        totalPrice,
        status: "PENDING"
      }
    });
    res.status(201).json(booking);
  } catch (error) { next(error); }
};

export const deleteBooking = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const bookingId = parseInt(req.params.id as string);

    // 1. Find the booking
    const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
    if (!booking) return res.status(404).json({ error: "Booking not found" });

    // 2. Ownership check: Only the guest (or Bang PD) can cancel
    if (booking.guestId !== req.userId && req.role !== "ADMIN") {
      return res.status(403).json({ error: "Forbidden: You can only cancel your own bookings" });
    }

    // 3. Make sure it isn't already cancelled
    if (booking.status === "CANCELLED") {
      return res.status(400).json({ error: "Booking is already cancelled" });
    }

    // 4. Soft Delete: Update status to CANCELLED instead of erasing the row
    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: { status: "CANCELLED" }
    });
    
    res.json(updatedBooking);
  } catch (error) { next(error); }
};