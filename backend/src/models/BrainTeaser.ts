import mongoose, { Document, Schema } from 'mongoose';

export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert';

export interface IBrainTeaser extends Document {
  title: string;
  description: string;
  imageUrl?: string;
  solution: string;
  difficulty: DifficultyLevel;
  publishDate: Date;
  isActive: boolean;
  winners: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const DIFFICULTY_DESCRIPTIONS = {
  beginner: 'Challenging logic puzzles that require careful analysis',
  intermediate: 'Complex problems that test multiple skills',
  advanced: 'Intricate puzzles that require creative thinking',
  expert: 'Master-level challenges that push your limits'
};

const BrainTeaserSchema = new Schema<IBrainTeaser>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    imageUrl: {
      type: String,
      required: false,
    },
    solution: {
      type: String,
      required: true,
    },
    difficulty: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced', 'expert'],
      required: true,
      default: 'beginner',
    },
    publishDate: {
      type: Date,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    winners: [{
      type: Schema.Types.ObjectId,
      ref: 'User',
    }],
  },
  {
    timestamps: true,
  }
);

// Index for efficient querying of active brain teasers
BrainTeaserSchema.index({ isActive: 1, publishDate: 1 });

export { DIFFICULTY_DESCRIPTIONS };
export default mongoose.model<IBrainTeaser>('BrainTeaser', BrainTeaserSchema); 