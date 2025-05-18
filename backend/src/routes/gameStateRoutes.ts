import express from 'express';
import { getGameState, checkCreatureAttacks, getCommunityProgress, createGameState } from '../controllers/gameStateController';
import { auth } from '../middleware/auth';

const router = express.Router();

// Public routes
router.get('/', getGameState);
router.get('/progress', getCommunityProgress);
router.post('/', createGameState);

// Protected routes
router.post('/check-attacks', auth, checkCreatureAttacks);

export default router; 