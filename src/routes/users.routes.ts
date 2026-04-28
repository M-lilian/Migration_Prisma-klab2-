import { Router } from 'express';
import { getAllUsers, getUserById , updateUser, deleteUser } from '../controllers/users.controller';
import { getProfile, createProfile, updateProfile } from '../controllers/profiles.controller'; // Import the new controller!

const router = Router();

// Standard User CRUD
router.get('/', getAllUsers);
router.get('/:id', getUserById);
// router.post('/', createUser);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);

// New Profile Endpoints
router.get('/:id/profile', getProfile);
router.post('/:id/profile', createProfile);
router.put('/:id/profile', updateProfile);

export default router;