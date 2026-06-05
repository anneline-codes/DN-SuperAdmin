import express from 'express';
import Order from '../models/Order.js';
import Booking from '../models/Booking.js';
import Restaurant from '../models/Restaurant.js';
import Hotel from '../models/Hotel.js';
import User from '../models/User.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();

router.get('/', protect, adminOnly, async (req, res) => {
  try {
    const [totalOrders, totalBookings, totalRestaurants, totalHotels, totalUsers] = await Promise.all([
      Order.countDocuments(),
      Booking.countDocuments(),
      Restaurant.countDocuments(),
      Hotel.countDocuments(),
      User.countDocuments(),
    ]);

    const orders = await Order.find().sort({ date: 1 });
    // Revenue over time (group by day)
    const revenueMap = {};
    orders.forEach(o => {
      const day = new Date(o.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      revenueMap[day] = (revenueMap[day] || 0) + o.total;
    });

    // Orders by category
    const catAgg = await Order.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);

    const totalRevenue = orders.reduce((s, o) => s + o.total, 0);

    res.json({
      summary: { totalOrders, totalBookings, totalRestaurants, totalHotels, totalUsers, totalRevenue },
      revenueChart: Object.entries(revenueMap).map(([date, revenue]) => ({ date, revenue })),
      ordersByCategory: catAgg.map(c => ({ category: c._id, count: c.count })),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
