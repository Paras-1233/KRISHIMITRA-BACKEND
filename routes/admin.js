import express from 'express';
import Buyer from '../models/Buyer.js';

const router = express.Router();

// GET all buyers
router.get('/users', async (req, res) => {
  try {
    const buyers = await Buyer.find();
    res.json(buyers);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE buyer
router.delete('/users/:id', async (req, res) => {
  try {
    await Buyer.findByIdAndDelete(req.params.id);
    res.json({ message: 'Buyer deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
