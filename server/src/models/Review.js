import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  reviewer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  reviewerName: String,
  reviewerEmail: String,
  targetType: { type: String, enum: ['restaurant', 'hotel'] },
  target: { type: mongoose.Schema.Types.ObjectId, refPath: 'targetType' },
  targetName: String,
  rating: { type: Number, min: 1, max: 5 },
  comment: String,
  status: { type: String, enum: ['published', 'pending', 'flagged', 'removed'], default: 'published' },
  date: { type: Date, default: Date.now },
}, { timestamps: true });

export default mongoose.model('Review', reviewSchema);
