import express from 'express';
import { getSettings, updateSettings } from '../controllers/settingsController';
import { auth, adminAuth } from '../middleware/auth';

const router = express.Router();

// Public route to get settings
router.get('/', getSettings);

// Protected admin routes
router.put('/', auth, adminAuth, updateSettings);

export default router; 