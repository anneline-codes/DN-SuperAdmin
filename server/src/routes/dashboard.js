import express from 'express';
import Restaurant from '../models/Restaurant.js';
import Hotel from '../models/Hotel.js';
import User from '../models/User.js';
import Order from '../models/Order.js';
import Booking from '../models/Booking.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();

router.get('/', protect, adminOnly, async (req, res) => {
  try {
    const [totalRestaurants, totalHotels, totalUsers, totalOrders] = await Promise.all([
      Restaurant.countDocuments(),
      Hotel.countDocuments(),
      User.countDocuments(),
      Order.countDocuments(),
    ]);

    const orders = await Order.find().sort({ date: 1 });
    const totalRevenue = orders.reduce((s, o) => s + o.total, 0);

    // Revenue chart last 7 days
    const last7 = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const dayOrders = orders.filter(o => {
        const od = new Date(o.date);
        return od.toDateString() === d.toDateString();
      });
      last7.push({ date: label, revenue: dayOrders.reduce((s, o) => s + o.total, 0), orders: dayOrders.length });
    }

    // Top venues
    const restaurants = await Restaurant.find().sort({ revenue: -1 }).limit(5);
    const hotels = await Hotel.find().sort({ revenue: -1 }).limit(3);

    // Recent activity (last 5 orders/bookings)
    const recentOrders = await Order.find().sort({ createdAt: -1 }).limit(5);
    const recentUsers = await User.find().sort({ createdAt: -1 }).limit(3).select('-password');

    res.json({
      stats: { totalRestaurants, totalHotels, totalUsers, totalOrders, totalRevenue },
      revenueChart: last7,
      topRestaurants: restaurants,
      topHotels: hotels,
      recentActivity: { orders: recentOrders, users: recentUsers },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
