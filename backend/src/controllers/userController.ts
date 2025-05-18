import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import GameState from '../models/GameState';

interface AuthRequest extends Request {
  user?: any;
}

// Register a new user
export const register = async (req: Request, res: Response) => {
  try {
    const { username, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create new user
    const user = new User({
      username,
      email,
      password,
    });

    await user.save();

    // Generate token
    const token = jwt.sign(
      { _id: user._id },
      process.env.JWT_SECRET || 'your_jwt_secret_key_here',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        points: user.points,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Error creating user' });
  }
};

// Login user
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate token
    const token = jwt.sign(
      { _id: user._id },
      process.env.JWT_SECRET || 'your_jwt_secret_key_here',
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        points: user.points,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Error logging in' });
  }
};

// Get user profile
export const getProfile = async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.user._id)
      .select('-password')
      .populate('solvedTeasers');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      id: user._id,
      username: user.username,
      email: user.email,
      points: user.points,
      role: user.role,
      solvedTeasers: user.solvedTeasers,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching profile' });
  }
};

// Update user profile
export const updateProfile = async (req: AuthRequest, res: Response) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ['username', 'email', 'password'];
  const isValidOperation = updates.every((update) => allowedUpdates.includes(update));

  if (!isValidOperation) {
    return res.status(400).json({ message: 'Invalid updates' });
  }

  try {
    updates.forEach((update) => (req.user[update] = req.body[update]));
    await req.user.save();

    res.json({
      user: {
        id: req.user._id,
        username: req.user.username,
        email: req.user.email,
        points: req.user.points,
        role: req.user.role,
      },
    });
  } catch (error) {
    res.status(400).json({ message: 'Error updating profile' });
  }
};

// Get leaderboard
export const getLeaderboard = async (req: Request, res: Response) => {
  try {
    const users = await User.find()
      .select('username points')
      .sort({ points: -1 })
      .limit(10);

    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching leaderboard' });
  }
};

// Get user stats
export const getUserStats = async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get current streak
    const gameState = await GameState.findOne({ userId: user._id });
    const currentStreak = gameState?.currentStreak || 0;
    const longestStreak = gameState?.longestStreak || 0;

    // Get total solved
    const totalSolved = user.solvedTeasers?.length || 0;

    // Get global rank
    const usersWithHigherPoints = await User.countDocuments({
      points: { $gt: user.points }
    });
    const rank = usersWithHigherPoints + 1;

    res.json({
      totalSolved,
      currentStreak,
      longestStreak,
      rank,
      points: user.points
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user stats' });
  }
}; 