import { Request, Response } from 'express';
import GameState from '../models/GameState';

// Create new game state
export const createGameState = async (req: Request, res: Response) => {
  try {
    const gameState = new GameState();
    await gameState.save();
    res.status(201).json(gameState);
  } catch (error) {
    res.status(500).json({ message: 'Error creating game state' });
  }
};

// Get current game state
export const getGameState = async (req: Request, res: Response) => {
  try {
    // Try to find the global game state (no userId)
    let gameState = await GameState.findOne({ userId: { $exists: false } });

    // If no game state exists, create one
    if (!gameState) {
      gameState = new GameState();
      await gameState.save();
    }

    res.json(gameState);
  } catch (error) {
    console.error('Error in getGameState:', error);
    res.status(500).json({ message: 'Error fetching game state' });
  }
};

// Check for creature attacks
export const checkCreatureAttacks = async (req: Request, res: Response) => {
  try {
    const gameState = await GameState.findOne({ userId: { $exists: false } });
    if (!gameState) {
      return res.status(404).json({ message: 'Game state not found' });
    }

    if (gameState.shouldCreaturesAttack()) {
      gameState.handleCreatureAttack();
      await gameState.save();
      res.json({
        message: 'Creatures have attacked!',
        pointsLost: Math.floor(gameState.totalPoints * 0.1),
        newTotal: gameState.totalPoints,
      });
    } else {
      res.json({
        message: 'No creature attacks at this time',
        nextAttackIn: gameState.creatureAttackInterval - 
          ((new Date().getTime() - gameState.lastCreatureAttack.getTime()) / (1000 * 60)),
      });
    }
  } catch (error) {
    console.error('Error in checkCreatureAttacks:', error);
    res.status(500).json({ message: 'Error checking creature attacks' });
  }
};

// Get community progress
export const getCommunityProgress = async (req: Request, res: Response) => {
  try {
    const gameState = await GameState.findOne({ userId: { $exists: false } });
    if (!gameState) {
      return res.status(404).json({ message: 'Game state not found' });
    }

    const progress = {
      currentLevel: gameState.currentLevel,
      totalPoints: gameState.totalPoints,
      pointsToNextLevel: gameState.currentLevel * 1000 - gameState.totalPoints,
      isEnigmaticPeace: gameState.isEnigmaticPeace,
      creatureAttackInterval: gameState.creatureAttackInterval,
      timeUntilNextAttack: Math.max(
        0,
        gameState.creatureAttackInterval - 
          ((new Date().getTime() - gameState.lastCreatureAttack.getTime()) / (1000 * 60))
      ),
    };

    res.json(progress);
  } catch (error) {
    console.error('Error in getCommunityProgress:', error);
    res.status(500).json({ message: 'Error fetching community progress' });
  }
}; 