import { Router } from 'express';
import { getAllBookings, getBookingById, createBooking, deleteBooking } from '../controllers/bookings.controller';
import { authenticate, requireGuest } from '../middlewares/auth.middleware';

const router = Router();

// Public routes (Admins/Hosts might want to see these, or just general viewing)
router.get('/', getAllBookings);
router.get('/:id', getBookingById);

// VIP Protected Routes
router.post('/', authenticate, requireGuest, createBooking); // ONLY Guests can book
router.delete('/:id', authenticate, deleteBooking); // Canceling a booking (ownership checked in controller)

export default router;