import mongoose from "mongoose";
import Customer from "../models/customer.model.js";
import Product from "../models/product.model.js";

// The fields the wishlist UI needs. Anything else stays out of the response.
const WISHLIST_FIELDS = "name price category image stock";

// Every handler below runs behind the protect middleware, so req.user is the
// authenticated customer. The id is never read from the body or the URL.

// POST /wishlist/:productId
export const addToWishlist = async (req, res) => {
    try {
        const { productId } = req.params;

        if (!mongoose.isValidObjectId(productId)) {
            return res
                .status(400)
                .json({ success: false, message: "Invalid product id" });
        }

        const product = await Product.findById(productId);
        if (!product) {
            return res
                .status(404)
                .json({ success: false, message: "Product not found" });
        }

        const customer = await Customer.findById(req.user._id);

        // Ids are ObjectId instances, so they are compared as strings.
        const alreadySaved = customer.wishlist.some(
            (id) => id.toString() === productId
        );

        if (alreadySaved) {
            return res
                .status(409)
                .json({ success: false, message: "Product already in wishlist" });
        }

        customer.wishlist.push(productId);
        await customer.save();

        return res.status(201).json({
            success: true,
            message: "Product added to wishlist",
            count: customer.wishlist.length,
        });
    } catch (error) {
        return res
            .status(500)
            .json({ success: false, message: "Something went wrong" });
    }
};

// GET /wishlist
export const getWishlist = async (req, res) => {
    try {
        // populate swaps each stored ObjectId for the matching Product document.
        const customer = await Customer.findById(req.user._id).populate({
            path: "wishlist",
            select: WISHLIST_FIELDS,
        });

        return res.status(200).json({
            success: true,
            count: customer.wishlist.length,
            wishlist: customer.wishlist,
        });
    } catch (error) {
        return res
            .status(500)
            .json({ success: false, message: "Something went wrong" });
    }
};

// GET /wishlist/ids
// A light response used by the products page and the navbar badge, so neither
// has to download the full wishlist just to know what is saved.
export const getWishlistIds = async (req, res) => {
    try {
        const customer = await Customer.findById(req.user._id).select("wishlist");

        return res.status(200).json({
            success: true,
            count: customer.wishlist.length,
            ids: customer.wishlist,
        });
    } catch (error) {
        return res
            .status(500)
            .json({ success: false, message: "Something went wrong" });
    }
};

// DELETE /wishlist/:productId
export const removeFromWishlist = async (req, res) => {
    try {
        const { productId } = req.params;

        if (!mongoose.isValidObjectId(productId)) {
            return res
                .status(400)
                .json({ success: false, message: "Invalid product id" });
        }

        const customer = await Customer.findById(req.user._id);

        const isSaved = customer.wishlist.some(
            (id) => id.toString() === productId
        );

        if (!isSaved) {
            return res
                .status(404)
                .json({ success: false, message: "Product not in wishlist" });
        }

        customer.wishlist = customer.wishlist.filter(
            (id) => id.toString() !== productId
        );
        await customer.save();

        return res.status(200).json({
            success: true,
            message: "Product removed from wishlist",
            count: customer.wishlist.length,
        });
    } catch (error) {
        return res
            .status(500)
            .json({ success: false, message: "Something went wrong" });
    }
};

// PATCH /wishlist/:productId/toggle
export const toggleWishlist = async (req, res) => {
    try {
        const { productId } = req.params;

        if (!mongoose.isValidObjectId(productId)) {
            return res
                .status(400)
                .json({ success: false, message: "Invalid product id" });
        }

        const product = await Product.findById(productId);
        if (!product) {
            return res
                .status(404)
                .json({ success: false, message: "Product not found" });
        }

        const customer = await Customer.findById(req.user._id);

        const isSaved = customer.wishlist.some(
            (id) => id.toString() === productId
        );

        if (isSaved) {
            customer.wishlist = customer.wishlist.filter(
                (id) => id.toString() !== productId
            );
        } else {
            customer.wishlist.push(productId);
        }

        await customer.save();

        return res.status(200).json({
            success: true,
            saved: !isSaved,
            message: isSaved
                ? "Product removed from wishlist"
                : "Product added to wishlist",
            count: customer.wishlist.length,
        });
    } catch (error) {
        return res
            .status(500)
            .json({ success: false, message: "Something went wrong" });
    }
};
