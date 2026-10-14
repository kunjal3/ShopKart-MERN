const express = require("express");

const protect = require("../middlewares/auth.middleware");

const {
    addToWishlist,
    getWishlist,
    removeFromWishlist
} = require("../controllers/wishlist.controller");

const router = express.Router();

router.post("/:productId", protect, addToWishlist);

router.get("/", protect, getWishlist);

router.delete("/:productId", protect, removeFromWishlist);

module.exports = router;