const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      require: true,
      min: 3,
      max: 20,
      unique: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      max: 50,
      unique: true,
      index: true,
    },
    password: {
      type: String,
      required: true,
      min: 6,
    },
    dob: {
      type: Date,
    },
    prfPic: {
      type: String,
      default: "",
    },
    cvrPic: {
      type: String,
      default: "",
    },
    flwrs: {
      type: Array,
      default: [],
    },
    flwngs: {
      type: Array,
      default: [],
    },
    prchdPrd: {
      type: Array,
      default: [],
    },
    cartItems: {
      type: Array,
      default: [],
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    isArtist: {
      type: Boolean,
      default: false,
    },
    desc: {
      type: String,
      max: 50,
    },
    city: {
      type: String,
      max: 50,
    },
    from: {
      type: String,
      max: 50,
    },
    relationship: {
      type: Number,
      enum: [1, 2, 3],
    },
    img: { type: String },
    soldCount: {
      type: Number,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);
