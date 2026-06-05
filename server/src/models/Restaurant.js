import mongoose from 'mongoose';

const restaurantSchema = new mongoose.Schema({
  name: { type: String, required: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  ownerEmail: String,
  location: String,
  city: String,
  country: String,
  status: { type: String, enum: ['active', 'inactive', 'pending'], default: 'active' },
  rating: { type: Number, default: 0 },
  totalOrders: { type: Number, default: 0 },
  revenue: { type: Number, default: 0 },
  image: String,
  phone: String,
  cuisine: String,
  joinedOn: { type: Date, default: Date.now },
}, { timestamps: true });

export default mongoose.model('Restaurant', restaurantSchema);
