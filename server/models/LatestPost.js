const mongoose = require('mongoose');

const LatestPostSchema = new mongoose.Schema(
  {
    title: { type: String, trim: true },
    body: { type: String, trim: true },
    type: {
      type: String,
      enum: ['image', 'video', 'youtube', 'text'],
      required: true,
    },
    mediaUrl: { type: String, trim: true },
    public_id: { type: String, trim: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('LatestPost', LatestPostSchema);

