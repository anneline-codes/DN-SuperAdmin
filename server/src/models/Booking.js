import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
  bookingId: { type: String, unique: true },
  guest: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  guestName: String,
  guestEmail: String,
  hotel: { type: mongoose.Schema.Types.ObjectId, ref: 'Hotel' },
  hotelName: String,
  roomType: String,
  checkIn: Date,
  checkOut: Date,
  nights: Number,
  total: Number,
  status: { type: String, enum: ['confirmed', 'pending', 'cancelled', 'checked_out'], default: 'pending' },
  paymentStatus: { type: String, enum: ['paid', 'unpaid', 'refunded'], default: 'unpaid' },
  date: { type: Date, default: Date.now },
}, { timestamps: true });

bookingSchema.pre('save', function (next) {
  if (!this.bookingId) {
    this.bookingId = '#BK-' + Math.random().toString(36).substring(2, 8).toUpperCase();
  }
  next();
});

export default mongoose.model('Booking', bookingSchema);
