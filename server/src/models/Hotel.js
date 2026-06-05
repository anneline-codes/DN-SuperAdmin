import mongoose from 'mongoose';

const hotelSchema = new mongoose.Schema({
  name: { type: String, required: true },
  manager: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  managerEmail: String,
  location: String,
  city: String,
  country: String,
  status: { type: String, enum: ['active', 'inactive', 'pending'], default: 'active' },
  rating: { type: Number, default: 0 },
  totalBookings: { type: Number, default: 0 },
  revenue: { type: Number, default: 0 },
  image: String,
  phone: String,
  stars: { type: Number, default: 3 },
  joinedOn: { type: Date, default: Date.now },
}, { timestamps: true });

export default mongoose.model('Hotel', hotelSchema);
