import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Buyer from "../models/buyer.js";

const router = express.Router();

// Default admin credentials
const ADMIN_CREDENTIALS = { username: "admin", password: "admin123" };

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Admin login
    if (email === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
      const token = jwt.sign({ role: "admin" }, process.env.JWT_SECRET, { expiresIn: "1d" });
      return res.json({ message: "Admin login successful", token, admin: { username: email } });
    }

    // Buyer login
    const buyer = await Buyer.findOne({ email });
    if (!buyer) return res.status(400).json({ message: "Invalid email or password" });

    const isMatch = await bcrypt.compare(password, buyer.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid email or password" });

    const token = jwt.sign({ id: buyer._id, role: "buyer" }, process.env.JWT_SECRET, { expiresIn: "1d" });

    res.json({ message: "Buyer login successful", token, buyer: { id: buyer._id, name: buyer.name, email: buyer.email } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
