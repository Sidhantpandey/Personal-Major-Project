import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  phone: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    match: [/^\d{10}$/, 'Phone number must be exactly 10 digits']
  },
  name: {
    type: String,
    required: true,
    trim: true
  }
}, {
  timestamps: true
});

userSchema.methods.toPublicData = function () {
  return this.toObject();
};

const User = mongoose.models.User || mongoose.model('User', userSchema);

export const syncUserIndexes = async () => {
  try {
    await User.collection.dropIndex('email_1');
  } catch {
    // Index may not exist on a fresh database
  }

  await User.collection.updateMany({}, { $unset: { email: 1, password: 1 } });
  await User.syncIndexes();
};

export default User;
