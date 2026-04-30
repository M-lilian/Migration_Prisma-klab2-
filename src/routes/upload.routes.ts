import { Router } from 'express';
import { uploadAvatar, deleteAvatar, uploadListingPhotos, deleteListingPhoto } from '../controllers/upload.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { upload } from '../config/multer';

const router = Router();

// Avatar routes
router.post('/users/:id/avatar', authenticate, upload.single("image"), uploadAvatar);
router.delete('/users/:id/avatar', authenticate, deleteAvatar);

// Listing photo routes
router.post('/listings/:id/photos', authenticate, upload.array("photos", 5), uploadListingPhotos);
router.delete('/listings/:id/photos/:photoId', authenticate, deleteListingPhoto);

export default router;