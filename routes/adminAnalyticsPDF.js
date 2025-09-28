import express from 'express';
import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Product from '../models/Product.js';
import Order from '../models/Order.js';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Optional custom font
const fontPath = path.join(__dirname, '../fonts/NotoSansDevanagari.ttf');

router.get('/pdf', async (req, res) => {
  try {
    const period = req.query.period || 'monthly'; // "monthly" or "daily"

    // Fetch products and orders
    const totalProducts = await Product.countDocuments();
    const orders = await Order.find({});

    // Total sales & revenue
    let totalSales = 0;
    let totalRevenue = 0;

    // Compute totals
    orders.forEach(o => {
      o.items.forEach(item => {
        totalSales += Number(item.quantity);
        totalRevenue += Number(item.price) * Number(item.quantity);
      });
    });

    let dataArray = [];

    if (period === 'daily') {
      // Group orders by YYYY-MM-DD
      const dailyData = {};
      orders.forEach(o => {
        const date = o.createdAt.toISOString().split('T')[0];
        if (!dailyData[date]) dailyData[date] = { sales: 0, revenue: 0 };
        o.items.forEach(item => {
          dailyData[date].sales += Number(item.quantity);
          dailyData[date].revenue += Number(item.price) * Number(item.quantity);
        });
      });
      dataArray = Object.keys(dailyData).sort().map(date => ({
        date,
        ...dailyData[date]
      }));
    } else {
      // Monthly
      const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
      dataArray = months.map((month, i) => {
        const monthOrders = orders.filter(o => o.createdAt.getMonth() === i);
        const sales = monthOrders.reduce(
          (sum, o) => sum + o.items.reduce((s, item) => s + Number(item.quantity), 0),
          0
        );
        const revenue = monthOrders.reduce((sum, o) => sum + o.items.reduce((s, item) => s + Number(item.price) * Number(item.quantity), 0), 0);
        return { month, sales, revenue };
      });
    }

    // PDF setup
    const doc = new PDFDocument({ margin: 50 });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=admin_analytics_${period}.pdf`);
    doc.pipe(res);

    if (fs.existsSync(fontPath)) doc.font(fontPath);

    // Title
    doc.fontSize(22).text('📊 Admin Analytics Report', { align: 'center' });
    doc.moveDown(2);

    // Summary
    doc.fontSize(16).text(`Total Products: ${totalProducts}`);
    doc.text(`Total Sales (units): ${totalSales}`);
    doc.text(`Total Revenue: ₹${totalRevenue}`);
    doc.moveDown(1.5);

    // Period data
    doc.fontSize(16).text(`${period === 'monthly' ? 'Monthly' : 'Daily'} Sales & Revenue:`, { underline: true });
    dataArray.forEach(d => {
      const label = period === 'monthly' ? d.month : d.date;
      doc.fontSize(14).text(`${label} → Sales: ${d.sales}, Revenue: ₹${d.revenue}`);
    });

    doc.end();

  } catch (err) {
    console.error('PDF generation error:', err);
    if (!res.headersSent) {
      res.status(500).json({ message: 'Failed to generate PDF', error: err.message });
    }
  }
});

export default router;
