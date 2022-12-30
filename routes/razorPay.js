const router = require("express").Router();
const Razorpay = require("razorpay");
const Order = require("../models/Order");
var crypto = require("crypto");

const {
  verifyToken,
  verifyTokenAndAuthorization,
  verifyTokenAndAdmin,
} = require("./verifyToken");

router.get("/get-razorpay-key", (req, res) => {
  res.send({ key: process.env.RAZORPAY_KEY_ID });
});

router.post("/create-order", async (req, res) => {
  try {
    const instance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_SECRET,
    });
    const options = {
      amount: req.body.amount,
      currency: "INR",
    };
    const order = await instance.orders.create(options);
    console.log(order, "lk");
    if (!order) return res.status(500).send("Some error occured");
    res.send(order);
  } catch (error) {
    res.status(500).send(error);
  }
});

router.post("/pay-order", async (req, res) => {
  try {
    const {
      amount,
      razorpayPaymentId,
      razorpayOrderId,
      razorpaySignature,
      carty,
      userId,
    } = req.body;
    const newOrder = Order({
      userId: userId,
      isPaid: true,
      amount: amount,
      products: [{ productId: carty }],
      razorpay: {
        orderId: razorpayOrderId,
        paymentId: razorpayPaymentId,
        signature: razorpaySignature,
      },
    });
    await newOrder.save();
    res.send({
      msg: "Payment was successfull",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
});

//Inside app.js
router.post("/verifyOrder", async (req, res) => {
  // STEP 7: Receive Payment Data
  const { order_id, payment_id } = req.body;
  const razorpay_signature = req.headers["x-razorpay-signature"];

  // Pass yours key_secret here
  const key_secret = process.env.RAZORPAY_SECRET;

  // STEP 8: Verification & Send Response to User

  // Creating hmac object
  let hmac = crypto.createHmac("sha256", key_secret);

  // Passing the data to be hashed
  hmac.update(order_id + "|" + payment_id);

  // Creating the hmac in the required format
  const generated_signature = hmac.digest("hex");

  if (razorpay_signature === generated_signature) {
    console.log("cerified payment______________shabeer");
    res.json({ success: true, message: "Payment has been verified" });
  } else res.json({ success: false, message: "Payment verification failed" });
});

router.get("/list-orders", async (req, res) => {
  const orders = await Order.find();
  res.send(orders);
});

module.exports = router;
