import express from "express";
import Order from "../models/Order.js";
import Cart from "../models/Cart.js";
import Product from "../models/Product.js"; // Make sure this exists

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { buyer, items, totalAmount } = req.body;

    if (!buyer || !items || items.length === 0 || !totalAmount) {
      return res.status(400).json({ message: "Invalid order data" });
    }

    // Ensure quantity and price are numbers
    const processedItems = items.map(item => ({
      product: item.product,
      name: item.name,
      quantity: Number(item.quantity || 0),
      price: Number(item.price || 0),
    }));

    // 1️⃣ Save the order
    const newOrder = new Order({
      buyer,
      items: processedItems,
      totalAmount: Number(totalAmount),
    });
    await newOrder.save();

    // 2️⃣ Reduce product quantities in inventory
   // 2️⃣ Reduce product quantities in inventory and mark unavailable if needed
for (const item of processedItems) {
  const updatedProduct = await Product.findByIdAndUpdate(
    item.product,
    { $inc: { quantity: -item.quantity } },
    { new: true }
  );

  // If quantity drops to 0 or below, mark as unavailable
  if (updatedProduct.quantity <= 0 && updatedProduct.available) {
    await Product.findByIdAndUpdate(item.product, { available: false });
  }
}


    // 3️⃣ Clear buyer's cart
    await Cart.updateOne({ buyer }, { $set: { items: [] } });

    res.status(201).json({ message: "Order placed successfully", order: newOrder });
  } catch (err) {
    console.error("Order Error:", err.message);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

export default router;
