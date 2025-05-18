import express from 'express';
import {
  getTodayTeaser,
  submitSolution,
  createTeaser,
  getAllTeasers,
  updateTeaser,
  deleteTeaser,
  generateTeaser,
} from '../controllers/brainTeaserController';
import { auth, adminAuth } from '../middleware/auth';

const router = express.Router();

// Public routes
router.get('/today', getTodayTeaser);

// Protected routes
router.post('/submit', auth, submitSolution);

// Admin routes
router.post('/', adminAuth, createTeaser);
router.get('/all', adminAuth, getAllTeasers);
router.patch('/:id', adminAuth, updateTeaser);
router.delete('/:id', adminAuth, deleteTeaser);
router.post('/generate', adminAuth, generateTeaser);

export default router; 