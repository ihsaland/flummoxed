const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/brainTeasers')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Define User Schema
const userSchema = new mongoose.Schema({
  username: String,
  email: String,
  password: String,
  role: String,
  points: Number,
  solvedTeasers: [mongoose.Schema.Types.ObjectId],
  createdAt: Date
});

const User = mongoose.model('User', userSchema);

// Create admin user
async function createAdmin() {
  try {
    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@example.com' });
    if (existingAdmin) {
      console.log('Admin user already exists.');
      return;
    }

    // Create new admin user
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const admin = new User({
      username: 'admin',
      email: 'admin@example.com',
      password: hashedPassword,
      role: 'admin',
      points: 0,
      solvedTeasers: [],
      createdAt: new Date()
    });

    await admin.save();
    console.log('Admin user created successfully!');
    console.log('Email: admin@example.com');
    console.log('Password: admin123');
  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    mongoose.connection.close();
  }
}

createAdmin(); 