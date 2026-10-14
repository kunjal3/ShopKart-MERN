const mongoose = require("mongoose");
const Customer = require("../models/customer.model");
const Product = require("../models/product.model");


const addToCart = async (req, res) => {
    try {
        const { productId } = req.params;

        // Check if product ID is valid
        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({
                message: "Invalid product ID"
            });
        }

        // Check if product exists
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

        // Check if product is already in cart
        const cartItem = customer.cart.find(
            (item) => item.product.toString() === productId
        );

        if (cartItem) {
            // Product already exists → increase quantity
            if (cartItem.quantity + 1 > product.stock) {
                return res.status(400).json({
                    message: "Cannot add more than available stock"
                });
            }

            cartItem.quantity += 1;
        } else {
            // Product not in cart → add with quantity 1
            if (product.stock < 1) {
                return res.status(400).json({
                    message: "Product is out of stock"
                });
            }

            customer.cart.push({
                product: productId,
                quantity: 1
            });
        }

        await customer.save();

        return res.status(201).json({
            success: true,
            message: "Product added to cart",
            cart: customer.cart
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            message: "Failed to add product to cart"
        });
    }
};

const getCart = async (req, res) => {
    try {
        const customer = await Customer.findById(req.user.id)
            .populate("cart.product");

        if (!customer) {
            return res.status(404).json({
                message: "Customer not found"
            });
        }

        return res.status(200).json({
            success: true,
            cart: customer.cart
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            message: "Failed to fetch cart"
        });
    }
};
// UPDATE CART QUANTITY
const updateCartQuantity = async (req, res) => {
    try {
        const { productId } = req.params;
        const { quantity } = req.body;

        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({
                message: "Invalid product ID"
            });
        }

        if (!Number.isInteger(quantity) || quantity < 1) {
            return res.status(400).json({
                message: "Quantity must be at least 1"
            });
        }

        const product = await Product.findById(productId);

        if (!product) {
            return res.status(404).json({
                message: "Product not found"
            });
        }

        if (quantity > product.stock) {
            return res.status(400).json({
                message: "Quantity cannot exceed available stock"
            });
        }

        const customer = await Customer.findById(req.user.id);

        if (!customer) {
            return res.status(404).json({
                message: "Customer not found"
            });
        }

        const cartItem = customer.cart.find(
            (item) => item.product.toString() === productId
        );

        if (!cartItem) {
            return res.status(404).json({
                message: "Product not found in cart"
            });
        }

        cartItem.quantity = quantity;

        await customer.save();

        return res.status(200).json({
            success: true,
            message: "Cart quantity updated",
            cart: customer.cart
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            message: "Failed to update cart quantity"
        });
    }
};
const removeFromCart = async (req, res) => {
    try {
        const { productId } = req.params;

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

        const exists = customer.cart.some(
            (item) => item.product.toString() === productId
        );

        if (!exists) {
            return res.status(404).json({
                message: "Product not found in cart"
            });
        }

        customer.cart = customer.cart.filter(
            (item) => item.product.toString() !== productId
        );

        await customer.save();

        return res.status(200).json({
            success: true,
            message: "Product removed from cart",
            cart: customer.cart
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            message: "Failed to remove product from cart"
        });
    }
};

module.exports = {
    addToCart,
    getCart,
    updateCartQuantity,
    removeFromCart
};