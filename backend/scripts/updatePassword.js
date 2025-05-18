const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const MONGO_URI = 'mongodb://localhost:27017/flummoxed';
const username = 'isalandy';
const newPassword = '123456';

const userSchema = new mongoose.Schema({
  username: String,
  password: String,
});

const User = mongoose.model('User', userSchema, 'users');

async function updatePassword() {
  await mongoose.connect(MONGO_URI);
  const hash = await bcrypt.hash(newPassword, 10);
  const result = await User.updateOne(
    { username },
    { $set: { password: hash } }
  );
  console.log('Update result:', result);
  await mongoose.disconnect();
}

updatePassword().catch(console.error); 