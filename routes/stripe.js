const router = require("express").Router();
// const stripe = require("stripe")(process.env.STRIPE_KEY);
const KEY = process.env.STRIPE_SECRET_KEY;
const stripe = require("stripe")(KEY);
const CLIENT_URL = process.env.CLIENT_URL;
const express = require("express");

// router.post("/create-checkout-session", async (req, res) => {
//   console.log(req.body);
//   const { paintings } = req.body;
//   const lineItems = await Promise
//     .all
//     // paintings.map(async (product) => {
//     //   const item = await strapi
//     //     .service("api::painting.painting")
//     //     .findOne(product._id);
//     //   return {
//     //     price_data: {
//     //       currency: "inr",
//     //       product_data: {
//     //         name: item.title,
//     //       },
//     //       unit_amount: item.price * 100,
//     //     },
//     //     quantity: 1,
//     //   };
//     // })
//     ();
//   try {
//     const session = await stripe.checkout.sessions.create({
//       line_items: lineItems,
//       mode: "payment",
//       success_url: `${CLIENT_URL}/success.html`,
//       cancel_url: `${CLIENT_URL}/canceled.html`,
//     });

//     // await strapi.service("api::order.order").create({
//     //   data: {
//     //     paintings,
//     //     stripeId: session.id,
//     //   },
//     // });

//     return {
//       stripeSession: session,
//     };
//   } catch (err) {
//     err.response.status = 500;
//     console.log(err);
//     // res.redirect(303, session.url);
//     return err;
//   }
// });

// webhooks

// server.js
//
// Use this sample code to handle webhook events in your integration.
//
// 1) Paste this code into a new file (server.js)
//
// 2) Install dependencies
//   npm install stripe
//   npm install express
//
// 3) Run the server on http://localhost:4242
//   node server.js

// const stripe = require("stripe");

// This is your Stripe CLI webhook secret for testing your endpoint locally.
let endpointSecret;
// endpointSecret =
//   "whsec_54eb3973f7b8bb579cc616945ddec271bd2a758a97ed83fce2f9c5475d1c7d6f";

// const customer = await stripe.customers.create({
//   metaData: {
//     // userID: req.body.userId,
//     cart: JSON.stringify(products),
//   },
// });
router.post("/create-checkout-session", async (req, res) => {
  try {
    const { products } = req.body;
    const lineItems = products.map((item) => {
      return {
        price_data: {
          currency: "inr",
          product_data: {
            name: item.title,
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
      mode: "payment",
      success_url: "http://localhost:3000/success",
      cancel_url: "http://localhost:3000/cancel",
    });
    res.status(200).json({ id: session.id });
  } catch (err) {
    res.status(500).json(err);
  }
});

router.post("/retrieve-checkout-session", async (req, res) => {
  try {
    const sessionRetrieve = await stripe.checkout.sessions.retrieve(
      req.sessionId
    );
    res.json(sessionRetrieve);
  } catch (err) {
    res.status(500).json(err);
  }
});

// router.post(
//   "/create-order",
//   express.raw({ type: "application/json" }),
//   (request, response) => {
//     const sig = request.headers["stripe-signature"];
//     let data;
//     let eventType;

//     if (endpointSecret) {
//       let event;

//       try {
//         event = stripe.webhooks.constructEvent(
//           request.body,
//           sig,
//           endpointSecret
//         );
//         console.log("verified success");
//       } catch (err) {
//         response.status(400).send(`Webhook Error: ${err.message}`);
//         console.log(err.message, "verify failed");
//         return;
//       }
//       data = event.data.object;
//       eventType = event.type;
//     } else {
//       console.log(request.body);
//       // data = request.body.data.object;
//       // eventType = request.body.type;
//     }

//     // handleEvent event
//     if (eventType === "checkout.session.completed") {
//       stripe.customers
//         .retrieve(data.customer)
//         .then((customer) => {
//           console.log(customer, data, ":data");
//         })
//         .catch((er) => console.log(er));
//     }

//     // Return a 200 response to acknowledge receipt of the event
//     response.send().end();
//   }
// );

module.exports = router;
// blithe-wieldy-shine-beckon
