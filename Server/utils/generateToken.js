import jwt from "jsonwebtoken";

export const generateToken = (customerId) => {
    return jwt.sign({ id: customerId }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES || "6d",
    });
};

export const cookieOptions = {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    maxAge: 6 * 24 * 60 * 60 * 1000,
};
