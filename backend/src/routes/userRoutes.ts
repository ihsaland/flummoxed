import express from 'express';
import { register, login, getProfile, updateProfile, getLeaderboard, getUserStats } from '../controllers/userController';
import { auth } from '../middleware/auth';

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes
router.get('/profile', auth, getProfile);
router.patch('/profile', auth, updateProfile);
router.get('/stats', auth, getUserStats);
router.get('/leaderboard', auth, getLeaderboard);

export default router; 