const Product = require("../models/Product");

// Update product
const updateProduct = async (req, res) => {
  try {
    console.log("Incoming update request:", req.params.id, req.body); // 👀 Debug log

    const { id } = req.params;

    const updated = await Product.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!updated) {
      console.log("Product not found for id:", id);
      return res.status(404).json({ message: "Product not found" });
    }

    console.log("Updated product:", updated);
    res.json({ message: "Product updated successfully", product: updated });
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({ message: "Error updating product", error: error.message });
  }
};
