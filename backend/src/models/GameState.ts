import mongoose, { Document, Schema } from 'mongoose';

export interface IGameState extends Document {
  userId: mongoose.Types.ObjectId;
  totalPoints: number;
  currentLevel: number;
  lastCreatureAttack: Date;
  creatureAttackInterval: number; // in minutes
  isEnigmaticPeace: boolean;
  currentStreak: number;
  longestStreak: number;
  lastSolvedDate: Date;
  updatedAt: Date;
  updateCreatureAttackInterval(): void;
  shouldCreaturesAttack(): boolean;
  handleCreatureAttack(): void;
  checkLevelUp(): boolean;
  checkEnigmaticPeace(): boolean;
  updateStreak(): void;
}

const GameStateSchema = new Schema<IGameState>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: false,
    },
    totalPoints: {
      type: Number,
      default: 0,
    },
    currentLevel: {
      type: Number,
      default: 1,
    },
    lastCreatureAttack: {
      type: Date,
      default: Date.now,
    },
    creatureAttackInterval: {
      type: Number,
      default: 60, // 60 minutes
    },
    isEnigmaticPeace: {
      type: Boolean,
      default: false,
    },
    currentStreak: {
      type: Number,
      default: 0,
    },
    longestStreak: {
      type: Number,
      default: 0,
    },
    lastSolvedDate: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Method to update creature attack interval based on total points
GameStateSchema.methods.updateCreatureAttackInterval = function() {
  // Decrease interval as points increase (minimum 5 minutes)
  this.creatureAttackInterval = Math.max(5, 60 - Math.floor(this.totalPoints / 100));
};

// Method to check if creatures should attack
GameStateSchema.methods.shouldCreaturesAttack = function(): boolean {
  const now = new Date();
  const timeSinceLastAttack = (now.getTime() - this.lastCreatureAttack.getTime()) / (1000 * 60);
  return timeSinceLastAttack >= this.creatureAttackInterval;
};

// Method to handle creature attack
GameStateSchema.methods.handleCreatureAttack = function() {
  // Reduce points by a percentage (10%)
  const pointsToDeduct = Math.floor(this.totalPoints * 0.1);
  this.totalPoints = Math.max(0, this.totalPoints - pointsToDeduct);
  this.lastCreatureAttack = new Date();
};

// Method to check for level up
GameStateSchema.methods.checkLevelUp = function(): boolean {
  const pointsForNextLevel = this.currentLevel * 1000;
  if (this.totalPoints >= pointsForNextLevel) {
    this.currentLevel += 1;
    return true;
  }
  return false;
};

// Method to check for Enigmatic Peace
GameStateSchema.methods.checkEnigmaticPeace = function(): boolean {
  if (this.currentLevel >= 10 && !this.isEnigmaticPeace) {
    this.isEnigmaticPeace = true;
    return true;
  }
  return false;
};

// Method to update streak
GameStateSchema.methods.updateStreak = function() {
  const now = new Date();
  const lastSolved = this.lastSolvedDate ? new Date(this.lastSolvedDate) : null;
  
  if (!lastSolved) {
    // First solve
    this.currentStreak = 1;
  } else {
    const daysSinceLastSolve = Math.floor((now.getTime() - lastSolved.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysSinceLastSolve === 1) {
      // Solved yesterday, increment streak
      this.currentStreak += 1;
    } else if (daysSinceLastSolve > 1) {
      // Streak broken
      this.currentStreak = 1;
    }
  }
  
  // Update longest streak if needed
  if (this.currentStreak > this.longestStreak) {
    this.longestStreak = this.currentStreak;
  }
  
  this.lastSolvedDate = now;
};

export default mongoose.model<IGameState>('GameState', GameStateSchema); 