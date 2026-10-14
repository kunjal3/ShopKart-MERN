const Customer = require("../models/customer.model");

const bcrypt = require("bcrypt");
const generateToken = require("../utils/generateToken");

const registerCustomer = async (req, res) => {

    const { fullName, email, password, phone } = req.body;

    if (!fullName || !email || !password || !phone) {
        return res.status(400).json({
            message: "All fields are required"
        });
    }

    if (password.length < 6) {
        return res.status(400).json({
            message: "Password must be at least 6 characters"
        });
    }

    const existingCustomer = await Customer.findOne({ email });

    if (existingCustomer) {
        return res.status(409).json({
            message: "Email already registered"
        });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const customer = new Customer({
        fullName,
        email,
        password: hashedPassword,
        phone
    });

    await customer.save();

    return res.status(201).json({
        message: "Customer registered successfully",
        customer: {
            id: customer._id,
            fullName: customer.fullName,
            email: customer.email,
            phone: customer.phone
        }
    });
};


const loginCustomer = async (req, res) => {

    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({
            message: "Email and password are required"
        });
    }

    const customer = await Customer.findOne({ email });

    if (!customer) {
        return res.status(401).json({
            message: "Invalid credentials"
        });
    }

    const isPasswordCorrect = await bcrypt.compare(
        password,
        customer.password
    );

    if (!isPasswordCorrect) {
        return res.status(401).json({
            message: "Invalid credentials"
        });
    }

    const token = generateToken(customer._id);

    res.cookie("token", token, {
        httpOnly: true,
        secure: false
    });

    return res.status(200).json({
        message: "Login successful",
        customer: {
            id: customer._id,
            fullName: customer.fullName,
            email: customer.email,
            phone: customer.phone
        }
    });
};
const getMyProfile = async (req, res) => {

    const customer = await Customer.findById(req.user.id).select("-password");

    if (!customer) {
        return res.status(404).json({
            message: "Customer not found"
        });
    }

    return res.status(200).json(customer);
};
const logoutCustomer = (req, res) => {

    res.clearCookie("token");

    return res.status(200).json({
        success: true,
        message: "Logged out successfully"
    });
};
module.exports = {
    registerCustomer,
    loginCustomer,
    getMyProfile,
    logoutCustomer
};