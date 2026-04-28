import { Router } from 'express';
import { getAllListings, getListingById, createListing, updateListing, deleteListing } from '../controllers/listings.controller';
import { authenticate, requireHost } from '../middlewares/auth.middleware';

const router = Router();

// Public routes (Anyone can window-shop for a house)
router.get('/', getAllListings);
router.get('/:id', getListingById);

// Protected routes (VIPs only!)
router.post('/', authenticate, requireHost, createListing); // Must be logged in AND be a HOST
router.put('/:id', authenticate, updateListing); // Must be logged in
router.delete('/:id', authenticate, deleteListing); // Must be logged in

export default router;