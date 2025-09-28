import mongoose from 'mongoose';

const buyerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  aadhar: { type: String, required: true },
  password: { type: String, required: true },
  role: { type: String, default: 'buyer' },
  isAdmin: { type: Boolean, default: false },
});

// Check if model already exists to prevent OverwriteModelError
const Buyer = mongoose.models.Buyer || mongoose.model('Buyer', buyerSchema);
export default Buyer;
