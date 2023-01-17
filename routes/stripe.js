const router = require("express").Router();
require("dotenv").config();
const Stripe = require("stripe");
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
const CLIENT_URL = process.env.CLIENT_URL;
const express = require("express");
const bodyParser = require("body-parser");
const { Order } = require("../models/Order");
const User = require("../models/User");
const Product = require("../models/Product");
// create order

let ids = [];
let usrId;

router.post("/create-checkout-session", async (req, res) => {
  ids = req.body.products.map((item) => item);
  usrId = req.body.userId;

  const customer = await stripe.customers.create({
    email: req.body.email,
    metadata: {
      userId: req.body.userId,
      // cart: JSON.stringify(...req.body.products),
    },
  });

  const lineItems = req.body.products.map((item) => {
    return {
      price_data: {
        currency: "inr",
        product_data: {
          name: item.title,
          images: [item.image],
          // metadata: {
          //   id: item._id,
          // },
        },
        unit_amount: item.price * 100,
      },
      quantity: 1,
    };
  });

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    // shipping_address_collection: { allowed_countries: ["US", "CA"] },
    line_items: lineItems,
    customer: customer.id,
    mode: "payment",
    success_url: "http://localhost:3000/success",
    cancel_url: "http://localhost:3000/cancel",
  });
  res.status(200).json(session);
});

const createOrder = async (customer, data) => {
  const Items = JSON.parse(customer.metadata.cart);

  const newOrder = new Order({
    userId: customer.metadata.userId,
    customerId: data.customer,
    paymentIntentId: data.payment_intent,
    products: Items,
    total: data.amount_total,
    payment_status: data.payment_status,
  });

  try {
    const savedOrder = await newOrder.save();
    // console.log("processed order:", savedOrder);
  } catch (err) {
    // console.log(err);
  }
};

router.post(
  "/webhook",
  bodyParser.raw({ type: "application/json" }),
  async (req, res, next) => {
    let data;
    let eventType;

    const payload = req.body;

    const reqUserId = JSON.parse(payload).data.object.metadata.userId;

    const sig = req.headers["stripe-signature"];
    const endpointSecret = "whsec_gENvr4rEiXhBYzpp5ZlZ0ujmYGCI8A2P";

    let event;
    if (endpointSecret) {
      // console.log("first stage");
      try {
        event = stripe.webhooks.constructEvent(payload, sig, endpointSecret);
        // console.log("verified success");
      } catch (err) {
        res.status(400).send(`Webhook Error: ${err.message}`);
        // console.log(err.message, "verify failed");
        return;
      }
      data = event.data.object;
      eventType = event.type;
      // console.log(data, "data");
    } else {
      data = req.body.data.object;
      eventType = req.body.type;
      // console.log(eventType, "eventType");
    }

    // handleEvent event
    if (eventType === "checkout.session.completed") {
      console.log(usrId, "indapa");

      const user = await User.findById(usrId);
      await user.updateOne({ $push: { prchdPrd: ids } });

      ids.forEach(async (item) => {
        const updateSoldCount = await Product.findById(item._id);
        // console.log(updateSoldCountOfArtist);
        await updateSoldCount.updateOne({ $inc: { soldCount: 1 } });
        await User.updateOne(
          { username: updateSoldCount.drawnBy },
          { $inc: { soldCount: 1 } }
        ).collation({
          locale: "en",
          strength: 2,
        });

        // console.log(updateSoldCount);
      });

      // const updateSoldCount = ids.forEach(async (id) => {
      //   await Product.updateOne({ _id: id }, { $inc: { soldCount: 1 } });
      // });

      // console.log(updateSoldCount, "soldmame");

      // stripe.customers
      //   .retrieve(data.customer)
      //   .then((customer) => {
      //     createOrder(customer, data);
      //   })
      //   .catch((er) => console.log(er.message));
    }
    // Return a 200 res to acknowledge receipt of the event
    console.log(res);
    res.send("Hello baby").end();
  }
);

module.exports = router;
// blithe-wieldy-shine-beckon
