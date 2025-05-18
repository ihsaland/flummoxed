import { Request, Response } from 'express';
import BrainTeaser from '../models/BrainTeaser';
import User from '../models/User';
import GameState from '../models/GameState';
import OpenAI from 'openai';

interface AuthRequest extends Request {
  user?: any;
}

// Initialize OpenAI client with error handling
let openai: OpenAI | null = null;
try {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.warn('Warning: OPENAI_API_KEY is not set. AI features will be disabled.');
  } else {
    openai = new OpenAI({ apiKey });
  }
} catch (error) {
  console.error('Error initializing OpenAI client:', error);
}

// Get today's brain teaser
export const getTodayTeaser = async (req: Request, res: Response) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const teaser = await BrainTeaser.findOne({
      publishDate: {
        $gte: today,
        $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
      },
      isActive: true,
    });

    if (!teaser) {
      return res.status(404).json({ message: 'No brain teaser available for today' });
    }

    // Don't send solution to client
    const teaserWithoutSolution = {
      ...teaser.toObject(),
      solution: undefined,
      id: teaser._id,
    };

    res.json(teaserWithoutSolution);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching today\'s brain teaser' });
  }
};

// Submit solution
export const submitSolution = async (req: AuthRequest, res: Response) => {
  try {
    const { teaserId, solution } = req.body;

    const teaser = await BrainTeaser.findById(teaserId);
    if (!teaser) {
      return res.status(404).json({ message: 'Brain teaser not found' });
    }

    // Check if user already solved this teaser
    if (teaser.winners.includes(req.user._id)) {
      return res.status(400).json({ message: 'You have already solved this brain teaser' });
    }

    // Check if solution is correct (case-insensitive)
    const isCorrect = solution.toLowerCase() === teaser.solution.toLowerCase();

    if (isCorrect) {
      // Add user to winners
      teaser.winners.push(req.user._id);
      await teaser.save();

      // Update user points and solved teasers
      req.user.points += 1;
      req.user.solvedTeasers.push(teaserId);
      await req.user.save();

      // Update game state
      const gameState = await GameState.findOne();
      if (gameState) {
        gameState.totalPoints += 1;
        gameState.updateCreatureAttackInterval();
        gameState.checkLevelUp();
        gameState.checkEnigmaticPeace();
        await gameState.save();
      }

      res.json({ message: 'Correct solution!', points: req.user.points });
    } else {
      res.status(400).json({ message: 'Incorrect solution' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error submitting solution' });
  }
};

// Create new brain teaser (admin only)
export const createTeaser = async (req: AuthRequest, res: Response) => {
  try {
    const { title, description, solution, difficulty, publishDate, imageUrl } = req.body;

    const teaser = new BrainTeaser({
      title,
      description,
      solution,
      difficulty,
      publishDate: new Date(publishDate),
      imageUrl,
    });

    await teaser.save();
    res.status(201).json(teaser);
  } catch (error) {
    res.status(500).json({ message: 'Error creating brain teaser' });
  }
};

// Get all brain teasers (admin only)
export const getAllTeasers = async (req: Request, res: Response) => {
  try {
    const teasers = await BrainTeaser.find()
      .sort({ publishDate: -1 })
      .select('-solution');
    res.json(teasers);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching brain teasers' });
  }
};

// Update brain teaser (admin only)
export const updateTeaser = async (req: Request, res: Response) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ['title', 'description', 'solution', 'difficulty', 'publishDate', 'imageUrl', 'isActive'];
  const isValidOperation = updates.every((update) => allowedUpdates.includes(update));

  if (!isValidOperation) {
    return res.status(400).json({ message: 'Invalid updates' });
  }

  try {
    const teaser = await BrainTeaser.findById(req.params.id);
    if (!teaser) {
      return res.status(404).json({ message: 'Brain teaser not found' });
    }

    updates.forEach((update) => {
      if (update === 'publishDate') {
        teaser.publishDate = new Date(req.body[update]);
      } else {
        (teaser as any)[update] = req.body[update];
      }
    });
    await teaser.save();

    res.json(teaser);
  } catch (error) {
    res.status(400).json({ message: 'Error updating brain teaser' });
  }
};

// Delete brain teaser (admin only)
export const deleteTeaser = async (req: Request, res: Response) => {
  try {
    const teaser = await BrainTeaser.findByIdAndDelete(req.params.id);
    if (!teaser) {
      return res.status(404).json({ message: 'Brain teaser not found' });
    }
    res.json({ message: 'Brain teaser deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting brain teaser' });
  }
};

// Generate a brain teaser using AI
export const generateTeaser = async (req: Request, res: Response) => {
  try {
    if (!openai) {
      return res.status(503).json({ message: 'AI features are currently disabled. Please set OPENAI_API_KEY in your environment variables.' });
    }

    const { prompt, difficulty } = req.body;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `You are a brain teaser creator. Create a ${difficulty} difficulty brain teaser based on the user's prompt. 
          The response should be in JSON format with the following structure:
          {
            "title": "The title of the brain teaser",
            "description": "The full description of the brain teaser, including any necessary context or rules",
            "solution": "The solution to the brain teaser with a clear explanation"
          }`
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" }
    });

    const teaser = JSON.parse(completion.choices[0].message.content || '{}');
    res.json(teaser);
  } catch (error) {
    console.error('Error generating brain teaser:', error);
    res.status(500).json({ message: 'Error generating brain teaser' });
  }
}; 