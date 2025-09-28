// BACKEND/server.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import buyersRouter from './routes/buyers.js';
import authRouter from './routes/auth.js';
import adminRouter from './routes/admin.js';
import productsRouter from './routes/products.js';
import cartRouter from './routes/cart.js';
import orderRoutes from "./routes/orders.js";
import adminAnalyticsRouter from './routes/adminAnalytics.js';
import adminAnalyticsPDFRouter from './routes/adminAnalyticsPDF.js';
import contactRouter from './routes/contact.js';

dotenv.config();
const app = express();

// Middleware
app.use(cors());
app.use(express.json()); // for JSON payloads

// __dirname in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure uploads folder exists safely
try {
  const uploadsDir = path.join(__dirname, 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
    console.log('📁 Created uploads folder:', uploadsDir);
  }
  app.use('/uploads', express.static(uploadsDir));
} catch (err) {
  console.error('Error creating uploads folder:', err);
}

// MongoDB connection with proper error handling
const mongoURI = process.env.MONGO_URI;
if (!mongoURI) {
  console.error('❌ MONGO_URI not defined in .env');
  process.exit(1);
}

mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected ✅'))
.catch((err) => {
  console.error('MongoDB connection error ❌:', err);
  process.exit(1); // terminate if DB not connected
});

// Routes
app.use('/api/buyers', buyersRouter);
app.use('/api/auth', authRouter);
app.use('/api/admin', adminRouter);
app.use('/api/products', productsRouter);
app.use('/api/cart', cartRouter);
app.use("/api/orders", orderRoutes);
app.use("/api/analytics", adminAnalyticsRouter);
app.use('/api/contact', contactRouter);

// ✅ PDF route fix: mount on same /api/analytics
app.use("/api/analytics", adminAnalyticsPDFRouter);

// Root route
app.get('/', (req, res) => {
  res.send('API is running...');
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Global Error:', err.stack || err);
  res.status(500).json({ message: 'Server error', error: err.message || err });
});

// Start server safely
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
