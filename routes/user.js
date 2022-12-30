const User = require("../models/User");
const {
  verifyToken,
  verifyTokenAndAuthorization,
  verifyTokenAndAdmin,
} = require("./verifyToken");

const router = require("express").Router();

//UPDATE
router.put("/:id", async (req, res) => {
  if (req.body.password) {
    req.body.password = CryptoJS.AES.encrypt(
      req.body.password,
      process.env.PASS_SEC
    ).toString();
  }

  Object.keys(req.body).forEach((k) => {
    if (req.body[k] == "" || req.body[k] == null) {
      delete req.body[k];
    }
  });
  console.log(req.body);

  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      {
        $set: req.body,
      },
      { new: true }
    );
    res.status(200).json(updatedUser);
  } catch (err) {
    res.status(500).json(err);
  }
});

// update purchased products
router.put("/:id/purchasedProducts", async (req, res) => {
  // if (req.body.userId !== req.params.id) {
  try {
    const user = await User.findById(req.params.id);
    if (!user.prchdPrd.includes(req.body.prchdPrd)) {
      await user.updateOne({ $push: { prchdPrd: req.body.prchdPrd } });
      res.status(200).json("product purchased");
      console.log(user, "ll");
    } else {
      res.status(403).json("product is already purchased");
    }
  } catch (err) {
    res.status(500).json(err);
  }
  // } else {
  // res.status(403).json("you cant follow yourself");}
});

// update cart items
router.put("/:id/cartitems", async (req, res) => {
  // if (req.body.userId !== req.params.id) {
  try {
    const user = await User.findById(req.params.id);
    if (!user.cartItems.includes(req.body.cartItems)) {
      await user.updateOne({ $push: { cartItems: req.body.cartItems } });
      res.status(200).json("Item added to cart");
      console.log(user, "ll");
    } else {
      res.status(403).json("Item is already added to cart");
    }
  } catch (err) {
    res.status(500).json(err);
  }
});

//DELETE
router.delete("/:id", verifyTokenAndAuthorization, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.status(200).json("User has been deleted...");
  } catch (err) {
    res.status(500).json(err);
  }
});

router.get("/find", async (req, res) => {
  const userId = req.query.userId;
  const username = req.query.username;
  console.log(userId);
  try {
    const user = userId
      ? await User.findById(userId)
      : await User.findOne({ username: username });
    const { password, updatedAt, ...other } = user._doc;
    res.status(200).json(other);
  } catch (err) {
    res.status(500).json(err);
  }
});

//GET USER
// router.get("/find/:id", async (req, res) => {
//   try {
//     const user = await User.findById(req.params.id);
//     const { password, ...others } = user._doc;
//     res.status(200).json(others);
//   } catch (err) {
//     res.status(500).json(err);
//   }
// });

//GET ALL USER
router.get("/", verifyTokenAndAdmin, async (req, res) => {
  const query = req.query.new;
  try {
    const users = query
      ? await User.find().sort({ _id: -1 }).limit(5)
      : await User.find();
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json(err);
  }
});

//follow a user

router.put("/:id/follow", async (req, res) => {
  console.log(req.body, req.params);
  if (req.body.userId !== req.params.id) {
    try {
      const user = await User.findById(req.params.id);
      const currentUser = await User.findById(req.body.userId);
      if (!user.flwrs.includes(req.body.userId)) {
        await user.updateOne({ $push: { flwrs: req.body.userId } });
        await currentUser.updateOne({ $push: { flwngs: req.params.id } });
        res.status(200).json("user has been followed");
      } else {
        res.status(403).json("you allready follow this user");
      }
    } catch (err) {
      res.status(500).json(err);
    }
  } else {
    res.status(403).json("you cant follow yourself");
  }
});

//unfollow a user

router.put("/:id/unfollow", async (req, res) => {
  console.log(req.body, req.params);

  if (req.body.userId !== req.params.id) {
    try {
      const user = await User.findById(req.params.id);
      const currentUser = await User.findById(req.body.userId);
      if (user.flwrs.includes(req.body.userId)) {
        await user.updateOne({ $pull: { flwrs: req.body.userId } });
        await currentUser.updateOne({ $pull: { flwngs: req.params.id } });
        res.status(200).json("user has been unfollowed");
      } else {
        res.status(403).json("you dont follow this user");
      }
    } catch (err) {
      res.status(500).json(err);
    }
  } else {
    res.status(403).json("you cant unfollow yourself");
  }
});

//GET USER STATS

router.get("/stats", verifyTokenAndAdmin, async (req, res) => {
  const date = new Date();
  const lastYear = new Date(date.setFullYear(date.getFullYear() - 1));

  try {
    const data = await User.aggregate([
      { $match: { createdAt: { $gte: lastYear } } },
      {
        $project: {
          month: { $month: "$createdAt" },
        },
      },
      {
        $group: {
          _id: "$month",
          total: { $sum: 1 },
        },
      },
    ]);
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
