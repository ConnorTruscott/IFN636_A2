const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');
const notificationService = require('./design_patterns/NotificationService');
const {AdminObserver, UserObserver, StaffObserver} = require('./design_patterns/NotificationObservers');
const analyticsRoutes = require('./routes/analyticsRoute');
const staffRoutes = require('./routes/staffRoutes'); // <-- 1. ADD THIS IMPORT

dotenv.config();

const app = express();

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Core middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/navbar', require('./routes/navbarRoutes'));
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/complaints', require('./routes/complaintRoutes'));
app.use('/api/feedback', require('./routes/feedbackRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/departments', require('./routes/departmentRoutes'));
app.use('/api/analytics', analyticsRoutes);
app.use('/api/staff', staffRoutes);

// Export the app object for testing or start server if run directly
if (require.main === module) {
  connectDB();
  const PORT = process.env.PORT || 5001;
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

// const adminObserver = new AdminObserver();
// notificationService.subscribe(adminObserver);

module.exports = app;