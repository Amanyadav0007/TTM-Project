import express from 'express';
import { protect, admin } from '../middleware/authMiddleware.js';
import { registerAdmin, loginUser, getMembers, createMember, deleteMember } from '../controllers/authController.js';

const router = express.Router();

router.post('/register', registerAdmin);
router.post('/login', loginUser);

router.route('/members').get(protect, admin, getMembers).post(protect, admin, createMember);

router.route('/members/:id').delete(protect, admin, deleteMember);

export default router;
