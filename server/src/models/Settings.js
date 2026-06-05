import mongoose from 'mongoose';

const settingsSchema = new mongoose.Schema({
  siteName: { type: String, default: 'Dineway Global' },
  siteEmail: { type: String, default: 'admin@dineway.com' },
  sitePhone: String,
  siteAddress: String,
  logo: String,
  timezone: { type: String, default: '(UTC-05:00) Eastern Time (US & Canada)' },
  currency: { type: String, default: 'USD - US Dollar' },
  maintenanceMode: { type: Boolean, default: false },
  emailNotifications: { type: Boolean, default: true },
  smsNotifications: { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.model('Settings', settingsSchema);
