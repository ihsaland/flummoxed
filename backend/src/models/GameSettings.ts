import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IGameSettings extends Document {
  creatureAttackInterval: number;
  pointsPerSolve: number;
  streakBonus: number;
  enigmaticPeaceThreshold: number;
  isEnigmaticPeaceEnabled: boolean;
  isCreatureAttacksEnabled: boolean;
  maxDailyTeasers: number;
  maintenanceMode: boolean;
  updatedAt: Date;
}

interface IGameSettingsModel extends Model<IGameSettings> {
  getSettings(): Promise<IGameSettings>;
}

const GameSettingsSchema = new Schema<IGameSettings>(
  {
    creatureAttackInterval: {
      type: Number,
      default: 60,
      min: 5,
    },
    pointsPerSolve: {
      type: Number,
      default: 1,
      min: 1,
    },
    streakBonus: {
      type: Number,
      default: 0.5,
      min: 0,
    },
    enigmaticPeaceThreshold: {
      type: Number,
      default: 10,
      min: 1,
    },
    isEnigmaticPeaceEnabled: {
      type: Boolean,
      default: true,
    },
    isCreatureAttacksEnabled: {
      type: Boolean,
      default: true,
    },
    maxDailyTeasers: {
      type: Number,
      default: 1,
      min: 1,
    },
    maintenanceMode: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Ensure only one settings document exists
GameSettingsSchema.statics.getSettings = async function() {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create({});
  }
  return settings;
};

export default mongoose.model<IGameSettings, IGameSettingsModel>('GameSettings', GameSettingsSchema); 