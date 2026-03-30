const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, unique: true, index: true, required: true, lowercase: true, trim: true },
  password: { type: String, required: true, select: false },
  handle: { type: String, unique: true, index: true, required: true, trim: true },
  bio: { type: String, maxlength: 160, default: '' },
  avatar: { 
  type: String, 
  default: 'https://ui-avatars.com/api/?name=User&background=0D8ABC&color=fff' 
},
  coverPhoto: { type: String, default: '' },
  location: { type: String, default: '' },
  website: { type: String, default: '' },
  verified: { type: Boolean, default: false },
  followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  bookmarks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Tweet' }],
  resetPasswordToken: String,
  resetPasswordExpire: Date
}, { timestamps: true });

userSchema.index({ name: 'text', handle: 'text', bio: 'text' });

module.exports = mongoose.model('User', userSchema);
