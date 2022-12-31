const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    image: { type: String, required: true },
    originalFile: { type: String },
    product: { type: String, required: false },
    category: { type: Array },
    price: { type: Number, required: true },
    soldCount: { type: Number, required: true },
    drawnBy: { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", ProductSchema);
