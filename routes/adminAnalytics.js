import express from "express";
import Product from "../models/Product.js";
import Order from "../models/Order.js";

const router = express.Router();

// Monthly analytics (existing)
router.get("/", async (req, res) => {
  try {
    const products = await Product.find();
    const orders = await Order.find();

    const totalProducts = products.length;
    let totalSales = 0;
    let totalRevenue = 0;
    const monthlyData = {};

    orders.forEach(order => {
      const month = order.createdAt?.toLocaleString('default', { month: 'short' }) || "Unknown";
      if (!monthlyData[month]) monthlyData[month] = { sales: 0, revenue: 0 };

      order.items.forEach(item => {
        const quantity = Number(item.quantity || 0);
        const price = Number(item.price || 0);

        totalSales += quantity;
        totalRevenue += quantity * price;

        monthlyData[month].sales += quantity;
        monthlyData[month].revenue += quantity * price;
      });
    });

    const monthlySalesArray = Object.keys(monthlyData).map(month => ({
      month,
      ...monthlyData[month]
    }));

    res.json({ totalProducts, totalSales, totalRevenue, monthlySalesArray });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Daily analytics
router.get("/daily", async (req, res) => {
  try {
    const products = await Product.find();
    const orders = await Order.find();

    const totalProducts = products.length;
    let totalSales = 0;
    let totalRevenue = 0;
    const dailyData = {};

    orders.forEach(order => {
      // Format date as YYYY-MM-DD
      const date = order.createdAt?.toISOString().split('T')[0] || "Unknown";
      if (!dailyData[date]) dailyData[date] = { sales: 0, revenue: 0 };

      order.items.forEach(item => {
        const quantity = Number(item.quantity || 0);
        const price = Number(item.price || 0);

        totalSales += quantity;
        totalRevenue += quantity * price;

        dailyData[date].sales += quantity;
        dailyData[date].revenue += quantity * price;
      });
    });

    const dailySalesArray = Object.keys(dailyData).map(date => ({
      date,
      ...dailyData[date]
    }));

    res.json({ totalProducts, totalSales, totalRevenue, dailySalesArray });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
