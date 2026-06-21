import mongoose from 'mongoose';

const dailyResponseSchema = new mongoose.Schema({
  group: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Group',
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  response: {
    type: String,
    enum: ['yes', 'no', 'pending'],
    default: 'pending',
  },
  time: {
    type: String,
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Compound index to ensure one response per user per group per day
dailyResponseSchema.index({ group: 1, user: 1, date: 1 }, { unique: true });

export default mongoose.model('DailyResponse', dailyResponseSchema);