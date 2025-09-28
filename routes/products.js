import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import Product from '../models/Product.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.join(__dirname, '..', 'uploads');

// Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) =>
    cb(null, Date.now() + path.extname(file.originalname)),
});

const upload = multer({ storage });
const router = express.Router();

// GET all products
router.get('/', async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST new product (or reactivate existing)
router.post('/', upload.single('image'), async (req, res) => {
  try {
    const { name, price, category, description, quantity, priceType } = req.body;

    if (!name || !price || !category) {
      return res
        .status(400)
        .json({ message: 'Name, price, and category are required' });
    }

    const parsedPrice = Number(price);
    const parsedQty = Number(quantity) || 0;
    const finalPriceType = priceType === 'kg' ? 'kg' : 'unit';

    let product = await Product.findOne({ name });

    if (product) {
      // Reactivate existing product
      product.available = true;
      product.price = parsedPrice;
      product.priceType = finalPriceType;
      product.category = category;
      product.description = description || '';
      product.quantity += parsedQty;
      if (req.file) product.image = `/uploads/${req.file.filename}`;
      await product.save();
      return res.status(200).json(product);
    }

    const image = req.file ? `/uploads/${req.file.filename}` : '';
    product = new Product({
      name,
      price: parsedPrice,
      priceType: finalPriceType,
      category,
      description: description || '',
      quantity: parsedQty,
      image,
      available: true,
    });

    await product.save();
    res.status(201).json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// PUT route: Full product update (edit product)
router.put('/:id', upload.single('image'), async (req, res) => {
  try {
    const { name, price, category, description, quantity, priceType } = req.body;
    const product = await Product.findById(req.params.id);

    if (!product) return res.status(404).json({ message: 'Product not found' });

    if (name) product.name = name;
    if (price) product.price = Number(price);
    if (category) product.category = category;
    if (description !== undefined) product.description = description;
    if (quantity !== undefined) product.quantity = Number(quantity);
    if (priceType) product.priceType = priceType === 'kg' ? 'kg' : 'unit';
    if (req.file) product.image = `/uploads/${req.file.filename}`;

    await product.save();
    res.json({ message: 'Product updated successfully', product });
  } catch (err) {
    console.error('Error updating product:', err);
    res.status(500).json({ message: 'Failed to update product', error: err.message });
  }
});

// PATCH to update only availability, quantity change, or priceType
router.patch('/:id', async (req, res) => {
  try {
    const { available, quantityChange, priceType } = req.body;
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    if (available !== undefined) product.available = available;
    if (quantityChange !== undefined) {
      product.quantity = Math.max(0, product.quantity + Number(quantityChange));
      if (product.quantity === 0) product.available = false;
    }
    if (priceType !== undefined) product.priceType = priceType === 'kg' ? 'kg' : 'unit';

    await product.save();
    res.json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to update product', error: err.message });
  }
});

// DELETE (soft-delete: mark unavailable)
router.delete('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    product.available = false;
    await product.save();

    res.json({ message: 'Product marked as unavailable' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
