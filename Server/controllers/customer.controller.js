import Customer from "../models/customer.model.js";
import { generateToken, cookieOptions } from "../utils/generateToken.js";

// POST /customers/register
export const registerCustomer = async (req, res) => {
    try {
        const { fullName, email, password, phone } = req.body;

        if (!fullName || !email || !password || !phone) {
            return res
                .status(400)
                .json({ success: false, message: "All fields are required" });
        }

        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: "Password must be at least 6 characters",
            });
        }

        const existing = await Customer.findOne({ email: email.toLowerCase() });
        if (existing) {
            return res
                .status(409)
                .json({ success: false, message: "Email already registered" });
        }

        const customer = await Customer.create({ fullName, email, password, phone });

        return res.status(201).json({
            success: true,
            message: "Customer registered successfully",
            customer: {
                _id: customer._id,
                fullName: customer.fullName,
                email: customer.email,
                phone: customer.phone,
            },
        });
    } catch (error) {
        if (error.code === 11000) {
            return res
                .status(409)
                .json({ success: false, message: "Email already registered" });
        }
        return res
            .status(500)
            .json({ success: false, message: "Something went wrong" });
    }
};

// POST /customers/login
export const loginCustomer = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res
                .status(400)
                .json({ success: false, message: "Email and password are required" });
        }

        const customer = await Customer.findOne({
            email: email.toLowerCase(),
        }).select("+password");

        if (!customer) {
            return res
                .status(401)
                .json({ success: false, message: "Invalid credentials" });
        }

        const isMatch = await customer.comparePassword(password);
        if (!isMatch) {
            return res
                .status(401)
                .json({ success: false, message: "Invalid credentials" });
        }

        const token = generateToken(customer.id);
        res.cookie("token", token, cookieOptions);

        return res.status(200).json({
            success: true,
            message: "Login successful",
            customer: {
                _id: customer._id,
                fullName: customer.fullName,
                email: customer.email,
                phone: customer.phone,
            },
        });
    } catch (error) {
        return res
            .status(500)
            .json({ success: false, message: "Something went wrong" });
    }
};

// GET /customers/me
export const getMyProfile = async (req, res) => {
    return res.status(200).json(req.user);
};

// POST /customers/logout
export const logoutCustomer = async (req, res) => {
    res.clearCookie("token", { ...cookieOptions, maxAge: undefined });
    return res
        .status(200)
        .json({ success: true, message: "Logged out successfully" });
};

// PATCH /customers/change-password 
export const changePassword = async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body;

        if (!oldPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: "Old and new password are required",
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                message: "New password must be at least 6 characters",
            });
        }

        const customer = await Customer.findById(req.user._id).select("+password");
        const isMatch = await customer.comparePassword(oldPassword);
        if (!isMatch) {
            return res
                .status(401)
                .json({ success: false, message: "Old password is incorrect" });
        }

        customer.password = newPassword;
        await customer.save();

        return res
            .status(200)
            .json({ success: true, message: "Password changed successfully" });
    } catch (error) {
        return res
            .status(500)
            .json({ success: false, message: "Something went wrong" });
    }
};