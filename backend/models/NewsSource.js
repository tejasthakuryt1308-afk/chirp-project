const mongoose = require('mongoose');

const newsSourceSchema = new mongoose.Schema({
  name: { type: String, required: true },
  handle: { type: String, required: true, unique: true, index: true },
  logo: { type: String, default: '' },
  description: { type: String, default: '' },
  category: { type: String, default: 'general', index: true },
  website: { type: String, default: '' },
  verified: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('NewsSource', newsSourceSchema);
