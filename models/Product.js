// models/Product.js
import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  priceType: { type: String, enum: ['unit', 'kg'], default: 'unit' }, // NEW
  category: { type: String },
  description: { type: String },
  image: { type: String },
  quantity: { type: Number, default: 0 },
  available: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Product", productSchema);
