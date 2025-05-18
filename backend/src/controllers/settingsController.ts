import { Request, Response } from 'express';
import GameSettings from '../models/GameSettings';

interface AuthRequest extends Request {
  user?: any;
}

// Get game settings
export const getSettings = async (req: Request, res: Response) => {
  try {
    const settings = await GameSettings.getSettings();
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching settings' });
  }
};

// Update game settings
export const updateSettings = async (req: AuthRequest, res: Response) => {
  try {
    const settings = await GameSettings.getSettings();
    
    // Update settings
    Object.assign(settings, req.body);
    await settings.save();

    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: 'Error updating settings' });
  }
}; 