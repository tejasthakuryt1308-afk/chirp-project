const User = require('../models/User');
const Tweet = require('../models/Tweet');

const safe = (user) => {
  const obj = user.toObject ? user.toObject() : user;
  delete obj.password;
  delete obj.resetPasswordToken;
  delete obj.resetPasswordExpire;
  return obj;
};

exports.getUser = async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json(safe(user));
};

exports.updateUser = async (req, res) => {
  const allowed = ['name', 'bio', 'location', 'website', 'avatar', 'coverPhoto'];
  const updates = {};
  allowed.forEach((k) => { if (req.body[k] !== undefined) updates[k] = req.body[k]; });
  const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true });
  res.json(safe(user));
};

exports.getUserTweets = async (req, res) => {
  const tweets = await Tweet.find({ author: req.params.id }).sort({ createdAt: -1 }).populate('author', 'name handle avatar verified');
  res.json(tweets);
};

exports.getFollowers = async (req, res) => {
  const user = await User.findById(req.params.id).populate('followers', 'name handle avatar verified');
  res.json(user?.followers || []);
};

exports.getFollowing = async (req, res) => {
  const user = await User.findById(req.params.id).populate('following', 'name handle avatar verified');
  res.json(user?.following || []);
};

exports.follow = async (req, res) => {
  const target = await User.findById(req.params.id);
  if (!target) return res.status(404).json({ message: 'User not found' });
  await User.findByIdAndUpdate(req.user._id, { $addToSet: { following: target._id } });
  await User.findByIdAndUpdate(target._id, { $addToSet: { followers: req.user._id } });
  res.json({ message: 'Followed' });
};

exports.unfollow = async (req, res) => {
  const target = await User.findById(req.params.id);
  if (!target) return res.status(404).json({ message: 'User not found' });
  await User.findByIdAndUpdate(req.user._id, { $pull: { following: target._id } });
  await User.findByIdAndUpdate(target._id, { $pull: { followers: req.user._id } });
  res.json({ message: 'Unfollowed' });
};

exports.bookmarks = async (req, res) => {
  const user = await User.findById(req.user._id).populate('bookmarks');
  res.json(user.bookmarks || []);
};
