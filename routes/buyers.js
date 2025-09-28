// BACKEND/routes/buyers.js
import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';

const router = express.Router();

// Buyer Mongoose schema
const buyerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  phone: { type: String, required: true },
  aadhar: { type: String, required: true },
  password: { type: String, required: true },
});

const Buyer = mongoose.model('Buyer', buyerSchema);

// =======================
// JWT Middleware
// =======================
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1]; // Bearer <token>
  if (!token) return res.status(401).json({ message: 'No token provided' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.buyerId = decoded.id;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

// =======================
// Signup Route
// =======================
router.post('/signup', async (req, res) => {
  const { name, email, phone, aadhar, password } = req.body;
  if (!name || !email || !phone || !aadhar || !password) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    const existingBuyer = await Buyer.findOne({ email });
    if (existingBuyer) return res.status(400).json({ message: 'Email already registered' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const buyer = new Buyer({ name, email, phone, aadhar, password: hashedPassword });
    await buyer.save();

    res.status(201).json({ message: 'Buyer signed up successfully', data: buyer });
  } catch (err) {
    console.error('Signup Error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// =======================
// Login Route
// =======================
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: 'Email and password are required' });

  try {
    const buyer = await Buyer.findOne({ email });
    if (!buyer) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, buyer.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: buyer._id }, process.env.JWT_SECRET, { expiresIn: '1d' });

    res.status(200).json({ message: 'Login successful', token, data: buyer });
  } catch (err) {
    console.error('Login Error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// =======================
// Get Current Buyer
// =======================
router.get('/current', authMiddleware, async (req, res) => {
  try {
    const buyer = await Buyer.findById(req.buyerId).select('-password');
    if (!buyer) return res.status(404).json({ message: 'Buyer not found' });
    res.json(buyer);
  } catch (err) {
    console.error('Fetch Current Buyer Error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

export default router;
