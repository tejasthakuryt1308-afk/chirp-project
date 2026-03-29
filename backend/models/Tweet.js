const mongoose = require('mongoose');

const imageSchema = new mongoose.Schema({
  url: String,
  width: Number,
  height: Number
}, { _id: false });

const tweetSchema = new mongoose.Schema({
  text: { type: String, maxlength: 280, trim: true, default: '' },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  images: [imageSchema],
  category: { type: String, default: 'general', index: true },
  hashtags: [{ type: String, index: true }],
  mentions: [String],
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  retweets: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  replies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Tweet' }],
  replyTo: { type: mongoose.Schema.Types.ObjectId, ref: 'Tweet', default: null, index: true },
  isNewsArticle: { type: Boolean, default: false, index: true },
  newsSource: { type: String, default: '' },
  articleUrl: { type: String, default: '' }
}, { timestamps: true });

tweetSchema.index({ text: 'text', hashtags: 'text', mentions: 'text' });

module.exports = mongoose.model('Tweet', tweetSchema);
