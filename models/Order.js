const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    // userId: { type: String, required: true },
    userId: { type: String, required: true },
    customerId: { type: String },
    products: [
      {
        id: {
          type: String,
        },
        title: {
          type: String,
        },
        artist: {
          type: String,
        },
        price: {
          type: String,
        },
        image: {
          type: String,
        },
        description: {
          type: String,
        },
      },
    ],
    total: { type: Number },
    payment_status: { type: String, default: "pending" },
  },
  { timestamps: true }
);

const Order = mongoose.model("Order", orderSchema);

exports.Order = Order;
