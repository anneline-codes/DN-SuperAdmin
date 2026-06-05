import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import Restaurant from './models/Restaurant.js';
import Hotel from './models/Hotel.js';
import Order from './models/Order.js';
import Booking from './models/Booking.js';
import Review from './models/Review.js';
import Transaction from './models/Transaction.js';
import SupportTicket from './models/SupportTicket.js';

dotenv.config();
await mongoose.connect(process.env.MONGO_URI);

// Clear
await Promise.all([
  User.deleteMany(), Restaurant.deleteMany(), Hotel.deleteMany(),
  Order.deleteMany(), Booking.deleteMany(), Review.deleteMany(),
  Transaction.deleteMany(), SupportTicket.deleteMany(),
]);

// Users
const admin = await User.create({ name: 'Super Admin', email: 'admin@dineway.com', password: 'admin123', role: 'super_admin' });
const users = await User.insertMany([
  { name: 'John Doe', email: 'john@example.com', password: 'pass123', role: 'customer', phone: '+1 555-0101', status: 'active' },
  { name: 'Jane Smith', email: 'jane@example.com', password: 'pass123', role: 'customer', phone: '+1 555-0102', status: 'active' },
  { name: 'Alex Johnson', email: 'alex@example.com', password: 'pass123', role: 'hotel_manager', phone: '+1 555-0103', status: 'active' },
  { name: 'Maria Garcia', email: 'maria@example.com', password: 'pass123', role: 'restaurant_manager', phone: '+1 555-0104', status: 'active' },
  { name: 'Michael Brown', email: 'michael@example.com', password: 'pass123', role: 'customer', phone: '+1 555-0105', status: 'inactive' },
]);

// Restaurants
const restaurants = await Restaurant.insertMany([
  { name: 'The Grand Kitchen', ownerEmail: 'thegrand@dineway.com', location: 'New York, USA', city: 'New York', country: 'USA', status: 'active', rating: 4.9, totalOrders: 1249, revenue: 48400, joinedOn: new Date('2013-05-12') },
  { name: 'Spice Villa', ownerEmail: 'spice@dineway.com', location: 'Dubai, UAE', city: 'Dubai', country: 'UAE', status: 'active', rating: 4.7, totalOrders: 987, revenue: 36300, joinedOn: new Date('2015-03-14') },
  { name: 'Pizza Palace', ownerEmail: 'pizza@dineway.com', location: 'Chicago, USA', city: 'Chicago', country: 'USA', status: 'pending', rating: 4.5, totalOrders: 0, revenue: 0, joinedOn: new Date('2023-05-20') },
  { name: 'Teds Bites', ownerEmail: 'teds@dineway.com', location: 'Toronto, Canada', city: 'Toronto', country: 'Canada', status: 'inactive', rating: 2.6, totalOrders: 224, revenue: 4240, joinedOn: new Date('2018-04-30') },
  { name: 'Mountain Retreat', ownerEmail: 'mountain@dineway.com', location: 'Denver, USA', city: 'Denver', country: 'USA', status: 'active', rating: 4.6, totalOrders: 871, revenue: 31800 },
  { name: 'Skyline Dine', ownerEmail: 'skyline@dineway.com', location: 'Los Angeles, USA', city: 'Los Angeles', country: 'USA', status: 'active', rating: 4.5, totalOrders: 745, revenue: 14290 },
]);

// Hotels
const hotels = await Hotel.insertMany([
  { name: 'Oceanview Hotel', managerEmail: 'manager@oceanview.com', location: 'Miami, USA', city: 'Miami', country: 'USA', status: 'active', rating: 4.8, totalBookings: 1100, revenue: 55068, stars: 5, joinedOn: new Date('2015-05-01') },
  { name: 'Mountain Retreat', managerEmail: 'manager@mountain.com', location: 'Denver, USA', city: 'Denver', country: 'USA', status: 'active', rating: 4.6, totalBookings: 876, revenue: 32989, stars: 4, joinedOn: new Date('2016-07-15') },
  { name: 'Sea Breeze', managerEmail: 'manager@seabreeze.com', location: 'Bali, Indonesia', city: 'Bali', country: 'Indonesia', status: 'active', rating: 4.7, totalBookings: 964, revenue: 12989, stars: 4, joinedOn: new Date('2017-05-08') },
  { name: 'City Lights Hotel', managerEmail: 'manager@citylights.com', location: 'New York, USA', city: 'New York', country: 'USA', status: 'active', rating: 4.2, totalBookings: 502, revenue: 0, stars: 3, joinedOn: new Date('2019-04-09') },
  { name: 'Desert Paradise', managerEmail: 'manager@desert.com', location: 'Dubai, UAE', city: 'Dubai', country: 'UAE', status: 'pending', rating: 0, totalBookings: 0, revenue: 0, stars: 5, joinedOn: new Date('2024-05-24') },
]);

// Orders
const categories = ['Food', 'Drinks', 'Room Service', 'Other'];
const statuses = ['pending', 'confirmed', 'preparing', 'delivered', 'cancelled'];
const orderDocs = [];
for (let i = 0; i < 80; i++) {
  const d = new Date();
  d.setDate(d.getDate() - Math.floor(Math.random() * 30));
  orderDocs.push({
    customerName: users[Math.floor(Math.random() * users.length)].name,
    restaurantName: restaurants[Math.floor(Math.random() * restaurants.length)].name,
    category: categories[Math.floor(Math.random() * categories.length)],
    total: Math.floor(Math.random() * 200) + 20,
    status: statuses[Math.floor(Math.random() * statuses.length)],
    paymentStatus: 'paid',
    date: d,
  });
}
const createdOrders = await Order.insertMany(orderDocs);

// Bookings
const bStatuses = ['confirmed', 'pending', 'cancelled', 'checked_out'];
const roomTypes = ['Standard', 'Deluxe', 'Suite', 'Presidential'];
const bookingDocs = [];
for (let i = 0; i < 40; i++) {
  const checkIn = new Date(); checkIn.setDate(checkIn.getDate() - Math.floor(Math.random() * 20));
  const nights = Math.floor(Math.random() * 5) + 1;
  const checkOut = new Date(checkIn); checkOut.setDate(checkOut.getDate() + nights);
  bookingDocs.push({
    guestName: users[Math.floor(Math.random() * users.length)].name,
    guestEmail: users[Math.floor(Math.random() * users.length)].email,
    hotelName: hotels[Math.floor(Math.random() * hotels.length)].name,
    roomType: roomTypes[Math.floor(Math.random() * roomTypes.length)],
    checkIn, checkOut, nights,
    total: nights * (Math.floor(Math.random() * 200) + 100),
    status: bStatuses[Math.floor(Math.random() * bStatuses.length)],
    paymentStatus: 'paid',
  });
}
await Booking.insertMany(bookingDocs);

// Reviews
const reviewDocs = [];
for (let i = 0; i < 30; i++) {
  const isRest = Math.random() > 0.5;
  reviewDocs.push({
    reviewerName: users[Math.floor(Math.random() * users.length)].name,
    reviewerEmail: users[Math.floor(Math.random() * users.length)].email,
    targetType: isRest ? 'restaurant' : 'hotel',
    targetName: isRest
      ? restaurants[Math.floor(Math.random() * restaurants.length)].name
      : hotels[Math.floor(Math.random() * hotels.length)].name,
    rating: Math.floor(Math.random() * 3) + 3,
    comment: 'Great experience overall, would definitely recommend to others.',
    status: 'published',
  });
}
await Review.insertMany(reviewDocs);

// Transactions
const txDocs = [];
const txTypes = ['payment', 'refund', 'payout'];
for (let i = 0; i < 50; i++) {
  const type = txTypes[Math.floor(Math.random() * txTypes.length)];
  txDocs.push({
    type,
    description: type === 'payment' ? 'Order payment received' : type === 'refund' ? 'Refund for cancelled order' : 'Venue payout',
    amount: Math.floor(Math.random() * 500) + 50,
    status: Math.random() > 0.2 ? 'completed' : 'pending',
    venue: restaurants[Math.floor(Math.random() * restaurants.length)].name,
    venueType: 'restaurant',
  });
}
await Transaction.insertMany(txDocs);

// Support Tickets
const priorities = ['low', 'medium', 'high', 'urgent'];
const tStatuses = ['open', 'in_progress', 'resolved', 'closed'];
const subjects = ['Payment not received', 'Booking cancellation issue', 'Menu update request', 'Refund not processed', 'Login problem'];
const ticketDocs = [];
for (let i = 0; i < 20; i++) {
  ticketDocs.push({
    userName: users[Math.floor(Math.random() * users.length)].name,
    subject: subjects[Math.floor(Math.random() * subjects.length)],
    category: ['Payment', 'Booking', 'Order', 'Account', 'Other'][Math.floor(Math.random() * 5)],
    priority: priorities[Math.floor(Math.random() * priorities.length)],
    status: tStatuses[Math.floor(Math.random() * tStatuses.length)],
    message: 'I need help with my recent transaction. Please look into this matter.',
  });
}
await SupportTicket.insertMany(ticketDocs);

console.log('✅ Database seeded successfully!');
console.log('👤 Admin: admin@dineway.com / admin123');
await mongoose.disconnect();
