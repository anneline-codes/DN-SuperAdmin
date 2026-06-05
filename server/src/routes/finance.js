import express from 'express';
import Transaction from '../models/Transaction.js';
import Order from '../models/Order.js';
import Booking from '../models/Booking.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();

router.get('/', protect, adminOnly, async (req, res) => {
  try {
    const { type, status, search, page = 1, limit = 10 } = req.query;
    const filter = {};
    if (type) filter.type = type;
    if (status) filter.status = status;
    if (search) filter.$or = [
      { transactionId: { $regex: search, $options: 'i' } },
      { venue: { $regex: search, $options: 'i' } },
    ];

    const total = await Transaction.countDocuments(filter);
    const transactions = await Transaction.find(filter)
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    // Summary stats
    const allTx = await Transaction.find({ status: 'completed' });
    const totalRevenue = allTx.reduce((s, t) => s + (t.amount || 0), 0);
    const refunds = await Transaction.find({ type: 'refund' });
    const totalRefunds = refunds.reduce((s, t) => s + (t.amount || 0), 0);
    const pending = await Transaction.find({ status: 'pending' });
    const pendingPayout = pending.reduce((s, t) => s + (t.amount || 0), 0);

    res.json({
      transactions, total,
      page: Number(page), pages: Math.ceil(total / limit),
      summary: { totalRevenue, totalRefunds, pendingPayout },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
