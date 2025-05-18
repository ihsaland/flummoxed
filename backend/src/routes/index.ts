import express from 'express';
import userRoutes from './userRoutes';
import brainTeaserRoutes from './brainTeaserRoutes';
import gameStateRoutes from './gameStateRoutes';

const router = express.Router();

router.use('/users', userRoutes);
router.use('/brain-teasers', brainTeaserRoutes);
router.use('/game-state', gameStateRoutes);

export default router; 