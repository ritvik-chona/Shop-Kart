import jwt from "jsonwebtoken";
import Customer from "../models/customer.model.js";

export const protect = async (req, res, next) => {
    try {
        const token = req.cookies?.token;

        if (!token) {
            return res
                .status(401)
                .json({ success: false, message: "Unauthorized: no token" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const customer = await Customer.findById(decoded.id);
        if (!customer) {
            return res
                .status(401)
                .json({ success: false, message: "Unauthorized: user not found" });
        }

        req.user = customer;
        next();
    } catch (error) {
        return res
            .status(401)
            .json({ success: false, message: "Unauthorized: invalid token" });
    }
};