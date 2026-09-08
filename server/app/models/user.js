import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  }
}, {
  timestamps: true
});

// Instance method to get public data
userSchema.methods.toPublicData = function () {
  const { password, ...publicData } = this.toObject();
  return publicData;
};

const User = mongoose.models.User || mongoose.model('User', userSchema);

export default User;