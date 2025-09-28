// controllers/cartController.js

import Cart from '../models/Cart.js';
import Product from '../models/Product.js';

// Get Cart
export const getCart = async (req, res) => {
  try {
    const { buyerId } = req.params;
    const cart = await Cart.findOne({ buyer: buyerId }).populate('items.product');
    if (!cart) return res.json([]);
    res.json(cart.items);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch cart' });
  }
};

// Add to Cart
export const addToCart = async (req, res) => {
  try {
    const { buyerId } = req.params;
    const { productId, quantity } = req.body;

    let cart = await Cart.findOne({ buyer: buyerId });
    if (!cart) {
      cart = new Cart({ buyer: buyerId, items: [] });
    }

    const existingItem = cart.items.find(
      (item) => item.product.toString() === productId
    );

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.items.push({ product: productId, quantity });
    }

    await cart.save();
    await cart.populate('items.product');
    res.json(cart.items);
  } catch (err) {
    res.status(500).json({ message: 'Failed to add to cart' });
  }
};

// Update Quantity
export const updateCartItem = async (req, res) => {
  try {
    const { buyerId, productId } = req.params;
    const { quantity } = req.body;

    const cart = await Cart.findOne({ buyer: buyerId });
    if (!cart) return res.status(404).json({ message: 'Cart not found' });

    const item = cart.items.find(
      (item) => item.product.toString() === productId
    );
    if (!item) return res.status(404).json({ message: 'Item not found' });

    item.quantity = quantity;
    await cart.save();
    await cart.populate('items.product');
    res.json(cart.items);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update cart' });
  }
};
// controllers/cartController.js

// Clear all cart items
export const clearCart = async (req, res) => {
  try {
    const { buyerId } = req.params;
    const cart = await Cart.findOne({ buyer: buyerId });
    if (!cart) return res.status(404).json({ message: 'Cart not found' });

    cart.items = [];
    await cart.save();
    res.json([]); // always return array
  } catch (err) {
    res.status(500).json({ message: 'Failed to clear cart' });
  }
};


// Remove Item
export const removeCartItem = async (req, res) => {
  try {
    const { buyerId, productId } = req.params;

    const cart = await Cart.findOne({ buyer: buyerId });
    if (!cart) return res.status(404).json({ message: 'Cart not found' });

    cart.items = cart.items.filter(
      (item) => item.product.toString() !== productId
    );
    await cart.save();
    await cart.populate('items.product');
    res.json(cart.items);
  } catch (err) {
    res.status(500).json({ message: 'Failed to remove cart item' });
  }
};
