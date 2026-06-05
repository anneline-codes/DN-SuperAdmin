import mongoose from 'mongoose';

const ticketSchema = new mongoose.Schema({
  ticketId: { type: String, unique: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  userName: String,
  subject: String,
  category: { type: String, enum: ['Payment', 'Booking', 'Order', 'Account', 'Other'], default: 'Other' },
  priority: { type: String, enum: ['low', 'medium', 'high', 'urgent'], default: 'medium' },
  status: { type: String, enum: ['open', 'in_progress', 'resolved', 'closed'], default: 'open' },
  message: String,
  responses: [{ from: String, message: String, date: { type: Date, default: Date.now } }],
  date: { type: Date, default: Date.now },
}, { timestamps: true });

ticketSchema.pre('save', function (next) {
  if (!this.ticketId) {
    this.ticketId = '#TKT-' + Math.random().toString(36).substring(2, 6).toUpperCase();
  }
  next();
});

export default mongoose.model('SupportTicket', ticketSchema);
