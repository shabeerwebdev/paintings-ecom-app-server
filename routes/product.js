const { query } = require("express");
const Product = require("../models/Product");
const {
  verifyToken,
  verifyTokenAndAuthorization,
  verifyTokenAndAdmin,
} = require("./verifyToken");

const router = require("express").Router();

//CREATE

router.post("/", verifyTokenAndAdmin, async (req, res) => {
  const newProduct = new Product(req.body);

  try {
    const savedProduct = await newProduct.save();
    res.status(200).json(savedProduct);
  } catch (err) {
    res.status(500).json(err);
  }
});

//UPDATE
router.put("/:id", verifyTokenAndAdmin, async (req, res) => {
  try {
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      {
        $set: req.body,
      },
      { new: true }
    );
    res.status(200).json(updatedProduct);
  } catch (err) {
    res.status(500).json(err);
  }
});

//DELETE
router.delete("/:id", verifyTokenAndAdmin, async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.status(200).json("Product has been deleted...");
  } catch (err) {
    res.status(500).json(err);
  }
});

//GET PRODUCT
router.get("/find/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    res.status(200).json(product);
  } catch (err) {
    res.status(500).json(err);
  }
});

//GET ALL PRODUCTS
router.get("/", async (req, res) => {
  // const qNew = req.query.new;
  // const qCategory = req.query.category;
  // try {
  //   let products;

  //   if (qNew) {
  //     products = await Product.find().sort({ createdAt: -1 }).limit(1);
  //   } else if (qCategory) {
  //     products = await Product.find({
  //       categories: {
  //         $in: [qCategory],
  //       },
  //     });
  //   } else {
  //     products = await Product.find();
  //   }

  console.log(req.query.limit);
  console.log(req.query.sort);
  try {
    const limit = parseInt(req.query.limit) || 0;
    let sort = req.query.sort || "price";

    req.query.sort ? (sort = req.query.sort.split(",")) : (sort = [sort]);
    let sortBy = {};
    if (sort[1]) {
      sortBy[sort[0]] = sort[1];
    } else {
      sortBy[sort[0]] = "asc";
    }

    // find users with received filter
    // const users = await User.find({ name: { $regex: search, $options: "i" } })
    // { drawnBy: query }
    const products = await Product.find()
      .collation({
        locale: "en",
        strength: 2,
      })
      // .where("genre")
      // .in([...genre])

      .sort(sortBy)
      // .skip(page * limit)
      .limit(limit);

    const response = {
      error: false,
      // total,
      // page: page + 1,
      // limit,
      // genres: genreOptions,
      products,
    };

    // console.log(response, "response");

    res.status(200).json(response);
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});

module.exports = router;
