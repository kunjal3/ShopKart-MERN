const express = require("express");

const {
    registerCustomer,
    loginCustomer,
    getMyProfile,
    logoutCustomer
} = require("../controllers/customer.controller");

const router = express.Router();

const protect = require("../middlewares/auth.middleware");

router.post("/register", registerCustomer);
router.post("/login", loginCustomer);
router.get("/me", protect, getMyProfile);
router.post("/logout", protect, logoutCustomer);

module.exports = router;