const User = require("../models/User");
const Product = require("../models/Product");

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
router.get("/", async (req, res) => {
  // const query = req.query.new;
  try {
    const page = parseInt(req.query.page) - 1 || 0;
    const limit = parseInt(req.query.limit);
    const search = req.query.search || "";
    let sort = req.query.sort || "username";

    // sorting query
    req.query.sort ? (sort = req.query.sort.split(",")) : (sort = [sort]);
    let sortBy = {};
    if (sort[1]) {
      sortBy[sort[0]] = sort[1];
    } else {
      sortBy[sort[0]] = "asc";
    }

    console.log(sort, sortBy, "sortu ma");
    // find users with received filter
    // const users = await User.find({ name: { $regex: search, $options: "i" } })
    let users;
    if (req.query.isArtist) {
      users = await User.find({ isArtist: true })
        .collation({ locale: "en" })
        // .where("genre")
        // .in([...genre])
        .sort(sortBy)
        // .skip(page * limit)
        .limit(limit);
    } else {
      users = await User.find()
        .collation({ locale: "en" })
        // .where("genre")
        // .in([...genre])
        .sort(sortBy)
        // .skip(page * limit)
        .limit(limit);
    }

    const response = {
      error: false,
      // total,
      // page: page + 1,
      // limit,
      // genres: genreOptions,
      users,
    };

    res.status(200).json(response);

    // old find all users
    // const users = query
    //   ? await User.find().sort({ _id: -1 }).limit(5)
    //   : await User.find();
    // res.status(200).json(users);
  } catch (err) {
    res.status(500).json(err);
  }
});

//follow a user

router.put("/:id/follow", async (req, res) => {
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

//GET USERS(ARTIST'S) ALL PAINTINGS
router.get("/artists", async (req, res) => {
  const query = req.query.drawnBy;
  try {
    // const users = query
    //   ? await Product.find({ drawnBy: query }).collation({
    //       locale: "en",
    //       strength: 2,
    //     })
    //   : await Product.find().collation({ locale: "en", strength: 2 });
    // res.status(200).json(users);

    const page = parseInt(req.query.page) - 1 || 0;
    const limit = parseInt(req.query.limit) || 5;
    const search = req.query.search || "";
    let sort = req.query.sort || "price";

    // sorting query
    req.query.sort ? (sort = req.query.sort.split(",")) : (sort = [sort]);
    let sortBy = {};
    if (sort[1]) {
      sortBy[sort[0]] = sort[1];
    } else {
      sortBy[sort[0]] = "asc";
    }

    console.log(sort, sortBy);

    // find users with received filter
    // const users = await User.find({ name: { $regex: search, $options: "i" } })
    const products = await Product.find({ drawnBy: query })
      .collation({
        locale: "en",
        strength: 2,
      })
      // .where("genre")
      // .in([...genre])
      .sort(sortBy);
    // .skip(page * limit)
    // .limit(limit);

    const response = {
      error: false,
      // total,
      // page: page + 1,
      // limit,
      // genres: genreOptions,
      products,
    };

    res.status(200).json(response);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
