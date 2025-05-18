import mongoose from 'mongoose';

const MAX_RETRIES = 5;
const RETRY_INTERVAL = 5000; // 5 seconds

export const connectDB = async (retryCount = 0): Promise<void> => {
  try {
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/brain-teasers';
    
    await mongoose.connect(MONGODB_URI);

    console.log('Connected to MongoDB successfully');
    
    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB disconnected. Attempting to reconnect...');
      setTimeout(() => connectDB(), RETRY_INTERVAL);
    });

  } catch (error) {
    console.error('MongoDB connection error:', error);
    
    if (retryCount < MAX_RETRIES) {
      console.log(`Retrying connection... (${retryCount + 1}/${MAX_RETRIES})`);
      setTimeout(() => connectDB(retryCount + 1), RETRY_INTERVAL);
    } else {
      console.error('Max retries reached. Could not connect to MongoDB.');
      process.exit(1);
    }
  }
}; 