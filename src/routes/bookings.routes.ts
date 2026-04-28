import { Router } from 'express';
import { getAllBookings, getBookingById, createBooking, deleteBooking } from '../controllers/bookings.controller';

const router = Router();

router.get('/', getAllBookings);
router.get('/:id', getBookingById);
router.post('/', createBooking);
router.delete('/:id', deleteBooking);

export default router;