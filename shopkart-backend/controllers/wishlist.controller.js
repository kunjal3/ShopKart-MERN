const mongoose = require("mongoose");

const Customer = require("../models/customer.model");
const Product = require("../models/product.model");



const addToWishlist = async (req, res) => {
    try {
        const { productId } = req.params;

        // Check whether product ID is valid
        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({
                message: "Invalid product ID"
            });
        }

        // Check whether product exists
        const product = await Product.findById(productId);

        if (!product) {
            return res.status(404).json({
                message: "Product not found"
            });
        }

        // Find logged-in customer
        const customer = await Customer.findById(req.user.id);

        if (!customer) {
            return res.status(404).json({
                message: "Customer not found"
            });
        }

        // Prevent duplicate wishlist entries
        if (customer.wishlist.includes(productId)) {
            return res.status(409).json({
                message: "Product already in wishlist"
            });
        }

        // Add product to wishlist
        customer.wishlist.push(productId);

        await customer.save();

        return res.status(201).json({
            success: true,
            message: "Product added to wishlist"
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            message: "Failed to add product to wishlist"
        });
    }
};


// GET MY WISHLIST
const getWishlist = async (req, res) => {
    try {
        const customer = await Customer.findById(req.user.id)
            .populate("wishlist");

        if (!customer) {
            return res.status(404).json({
                message: "Customer not found"
            });
        }

        return res.status(200).json({
            success: true,
            wishlist: customer.wishlist
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            message: "Failed to fetch wishlist"
        });
    }
};


// REMOVE FROM WISHLIST
const removeFromWishlist = async (req, res) => {
    try {
        const { productId } = req.params;

        // Check whether product ID is valid
        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({
                message: "Invalid product ID"
            });
        }

        const customer = await Customer.findById(req.user.id);

        if (!customer) {
            return res.status(404).json({
                message: "Customer not found"
            });
        }

        // Check whether product is in wishlist
        const exists = customer.wishlist.some(
            (id) => id.toString() === productId
        );

        if (!exists) {
            return res.status(404).json({
                message: "Product not found in wishlist"
            });
        }

        // Remove product
        customer.wishlist = customer.wishlist.filter(
            (id) => id.toString() !== productId
        );

        await customer.save();

        return res.status(200).json({
            success: true,
            message: "Product removed from wishlist"
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            message: "Failed to remove product from wishlist"
        });
    }
};


module.exports = {
    addToWishlist,
    getWishlist,
    removeFromWishlist
};