const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/brainTeasers')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Define User Schema
const userSchema = new mongoose.Schema({
  username: String,
  email: String,
  role: String,
  points: Number,
  solvedTeasers: [mongoose.Schema.Types.ObjectId],
  createdAt: Date
});

const User = mongoose.model('User', userSchema);

// Find and display admin users
async function showAdmins() {
  try {
    const admins = await User.find({ role: 'admin' });
    console.log('\nAdmin Users:');
    console.log('============');
    
    if (admins.length === 0) {
      console.log('No admin users found.');
    } else {
      admins.forEach(admin => {
        console.log(`\nUsername: ${admin.username}`);
        console.log(`Email: ${admin.email}`);
        console.log(`Role: ${admin.role}`);
        console.log(`Points: ${admin.points}`);
        console.log(`Created: ${admin.createdAt}`);
        console.log('-------------------');
      });
    }
  } catch (error) {
    console.error('Error fetching admin users:', error);
  } finally {
    mongoose.connection.close();
  }
}

showAdmins(); 