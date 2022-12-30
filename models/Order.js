const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema(
  {
    // userId: { type: String, required: true },
    userId: { type: String },
    isPaid: { type: Boolean }, //new schema
    razorpay: {
      orderId: String,
      paymentId: String,
      signature: String,
    }, // new schema

    products: [
      {
        productId: {
          type: String,
        },
        quantity: {
          type: Number,
          default: 1,
        },
      },
    ],
    // amount: { type: Number, required: true },
    amount: { type: Number },
    // address: { type: Object, required: true },
    address: { type: Object },
    status: { type: String, default: "pending" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", OrderSchema);
