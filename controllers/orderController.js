import Order from '../models/Order.js';
import Cart from '../models/Cart.js';

export const createOrder = async (req, res) => {
  try {
    const { buyerId, items } = req.body;

    if (!buyerId || !items || !items.length) {
      return res.status(400).json({ message: 'Invalid order data' });
    }

    // Create order
    const order = new Order({ buyer: buyerId, items });
    await order.save();

    // Optionally clear cart
    const cart = await Cart.findOne({ buyer: buyerId });
    if (cart) {
      cart.items = [];
      await cart.save();
    }

    res.status(201).json(order);
  } catch (err) {
    console.error('Order creation failed:', err);
    res.status(500).json({ message: 'Failed to create order', error: err.message });
  }
};
