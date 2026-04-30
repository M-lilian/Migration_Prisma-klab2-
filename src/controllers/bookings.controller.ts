import { Request, Response, NextFunction } from 'express';
import prisma from '../config/prisma';
import { createBookingSchema } from '../validators/bookings.validator';
import { AuthRequest } from '../middlewares/auth.middleware';
import { sendEmail } from '../config/email';
import { bookingConfirmationEmail, bookingCancellationEmail } from '../templates/emails';

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
    const guestId = req.userId as number;

    const listing = await prisma.listing.findUnique({ where: { id: listingId } });
    if (!listing) return res.status(404).json({ error: "Listing not found" });

    const inDate = new Date(checkIn);
    const outDate = new Date(checkOut);

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

    const days = Math.ceil((outDate.getTime() - inDate.getTime()) / (1000 * 60 * 60 * 24));
    const totalPrice = days * listing.pricePerNight;

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

    // Send booking confirmation email
    res.status(201).json(booking);
    try {
      const guest = await prisma.user.findUnique({ where: { id: guestId } });
      if (guest) {
        await sendEmail(
          guest.email,
          "Your Booking is Confirmed!",
          bookingConfirmationEmail(
            guest.name,
            listing.title,
            listing.location,
            inDate.toDateString(),
            outDate.toDateString(),
            totalPrice
          )
        );
      }
    } catch (emailError) {
      console.error("[EMAIL ERROR] Booking confirmation email failed:", emailError);
    }
  } catch (error) { next(error); }
};

export const deleteBooking = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const bookingId = parseInt(req.params.id as string);

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        guest: true,
        listing: true
      }
    });
    if (!booking) return res.status(404).json({ error: "Booking not found" });

    if (booking.guestId !== req.userId && req.role !== "ADMIN") {
      return res.status(403).json({ error: "Forbidden: You can only cancel your own bookings" });
    }

    if (booking.status === "CANCELLED") {
      return res.status(400).json({ error: "Booking is already cancelled" });
    }

    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: { status: "CANCELLED" }
    });

    // Send cancellation email
    res.json(updatedBooking);
    try {
      await sendEmail(
        booking.guest.email,
        "Your Booking Has Been Cancelled",
        bookingCancellationEmail(
          booking.guest.name,
          booking.listing.title,
          booking.checkIn.toDateString(),
          booking.checkOut.toDateString()
        )
      );
    } catch (emailError) {
      console.error("[EMAIL ERROR] Cancellation email failed:", emailError);
    }
  } catch (error) { next(error); }
};