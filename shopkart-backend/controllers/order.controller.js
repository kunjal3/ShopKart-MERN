
const crypto = require("crypto");
const Razorpay = require("razorpay");

const Order = require("../models/order.model");
const Customer = require("../models/customer.model");
const Product = require("../models/product.model");

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

// Create a pending order and a Razorpay payment order
const createPaymentOrder = async (req, res) => {
    let savedOrder;

    try {
        const {
            fullName,
            phone,
            addressLine,
            city,
            state,
            pincode
        } = req.body.shippingAddress || {};

        if (
            !fullName?.trim() ||
            !phone?.trim() ||
            !addressLine?.trim() ||
            !city?.trim() ||
            !state?.trim() ||
            !pincode?.trim()
        ) {
            return res.status(400).json({
                success: false,
                message: "Please provide all shipping address fields."
            });
        }

        if (
            !process.env.RAZORPAY_KEY_ID ||
            !process.env.RAZORPAY_KEY_SECRET
        ) {
            return res.status(500).json({
                success: false,
                message: "Razorpay credentials are not configured."
            });
        }

        const customer = await Customer.findById(req.user.id)
            .populate("cart.product");

        if (!customer) {
            return res.status(404).json({
                success: false,
                message: "Customer not found."
            });
        }

        if (!customer.cart || customer.cart.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Your cart is empty."
            });
        }

        let totalAmount = 0;
        const orderItems = [];

        for (const cartItem of customer.cart) {
            const product = cartItem.product;
            const quantity = Number(cartItem.quantity);

            if (!product) {
                return res.status(400).json({
                    success: false,
                    message: "A product in your cart no longer exists."
                });
            }

            if (
                !Number.isInteger(quantity) ||
                quantity < 1 ||
                quantity > product.stock
            ) {
                return res.status(400).json({
                    success: false,
                    message: `Insufficient stock for ${product.name}.`
                });
            }

            const price = Number(product.price);

            if (!Number.isFinite(price) || price < 0) {
                return res.status(400).json({
                    success: false,
                    message: "A product has an invalid price."
                });
            }

            totalAmount += price * quantity;

            orderItems.push({
                product: product._id,
                name: product.name,
                image: product.image || "",
                price,
                quantity
            });
        }

        totalAmount = Math.round(totalAmount * 100) / 100;

        if (totalAmount <= 0) {
            return res.status(400).json({
                success: false,
                message: "Order total must be greater than zero."
            });
        }

        savedOrder = await Order.create({
            customer: customer._id,
            items: orderItems,
            shippingAddress: {
                fullName: fullName.trim(),
                phone: phone.trim(),
                addressLine: addressLine.trim(),
                city: city.trim(),
                state: state.trim(),
                pincode: pincode.trim()
            },
            totalAmount,
            orderStatus: "PENDING",
            paymentStatus: "PENDING"
        });

        const razorpayOrder = await razorpay.orders.create({
            amount: Math.round(totalAmount * 100),
            currency: "INR",
            receipt: savedOrder._id.toString()
        });

        savedOrder.razorpayOrderId = razorpayOrder.id;
        await savedOrder.save();

        return res.status(201).json({
            success: true,
            shopKartOrderId: savedOrder._id,
            razorpayOrderId: razorpayOrder.id,
            amount: razorpayOrder.amount,
            currency: razorpayOrder.currency,
            key: process.env.RAZORPAY_KEY_ID
        });
    } catch (error) {
        if (savedOrder) {
            try {
                await Order.findByIdAndDelete(savedOrder._id);
            } catch (cleanupError) {
                console.error("Pending order cleanup failed:", cleanupError.message);
            }
        }

        console.error("Create payment order error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Unable to create payment order."
        });
    }
};

// Verify Razorpay payment
const verifyPayment = async (req, res) => {
    try {
        const {
            shopKartOrderId,
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature
        } = req.body;

        if (
            !shopKartOrderId ||
            !razorpay_order_id ||
            !razorpay_payment_id ||
            !razorpay_signature
        ) {
            return res.status(400).json({
                success: false,
                message: "Payment verification details are incomplete."
            });
        }

        const order = await Order.findOne({
            _id: shopKartOrderId,
            customer: req.user.id
        });

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found."
            });
        }

        if (order.paymentStatus !== "PENDING") {
            return res.status(400).json({
                success: false,
                message: "This order has already been processed."
            });
        }

        if (order.razorpayOrderId !== razorpay_order_id) {
            return res.status(400).json({
                success: false,
                message: "Razorpay order ID does not match."
            });
        }

        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(`${razorpay_order_id}|${razorpay_payment_id}`)
            .digest("hex");

        const expectedBuffer = Buffer.from(expectedSignature);
        const receivedBuffer = Buffer.from(razorpay_signature);

        if (
            expectedBuffer.length !== receivedBuffer.length ||
            !crypto.timingSafeEqual(expectedBuffer, receivedBuffer)
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid payment signature."
            });
        }

        // Confirm the payment with Razorpay before changing the order.
        const payment = await razorpay.payments.fetch(razorpay_payment_id);

        if (
            payment.order_id !== razorpay_order_id ||
            payment.amount !== Math.round(order.totalAmount * 100) ||
            payment.currency !== "INR" ||
            payment.status !== "captured"
        ) {
            return res.status(400).json({
                success: false,
                message: "Payment has not been successfully captured."
            });
        }

        // Recheck stock before decrementing it.
        for (const item of order.items) {
            const updatedProduct = await Product.findOneAndUpdate(
                {
                    _id: item.product,
                    stock: { $gte: item.quantity }
                },
                {
                    $inc: { stock: -item.quantity }
                },
                { new: true }
            );

            if (!updatedProduct) {
                return res.status(409).json({
                    success: false,
                    message: `Insufficient stock for ${item.name}. Contact support regarding your payment.`
                });
            }
        }

        order.paymentStatus = "PAID";
        order.orderStatus = "PLACED";
        order.razorpayPaymentId = razorpay_payment_id;
        order.razorpaySignature = razorpay_signature;

        await order.save();

        await Customer.findByIdAndUpdate(order.customer, {
            $set: { cart: [] }
        });

        return res.status(200).json({
            success: true,
            message: "Payment verified and order placed successfully.",
            order
        });
    } catch (error) {
        console.error("Verify payment error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Unable to verify payment."
        });
    }
};

// Get the logged-in customer's orders
const getOrders = async (req, res) => {
    try {
        const orders = await Order.find({
            customer: req.user.id
        }).sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            orders
        });
    } catch (error) {
        console.error("Get orders error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Unable to fetch orders."
        });
    }
};

// Get one order belonging to the logged-in customer
const getOrderById = async (req, res) => {
    try {
        if (!/^[0-9a-fA-F]{24}$/.test(req.params.id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid order ID."
            });
        }

        const order = await Order.findOne({
            _id: req.params.id,
            customer: req.user.id
        });

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found."
            });
        }

        return res.status(200).json({
            success: true,
            order
        });
    } catch (error) {
        console.error("Get order error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Unable to fetch order."
        });
    }
};

module.exports = {
    createPaymentOrder,
    verifyPayment,
    getOrders,
    getOrderById
};
