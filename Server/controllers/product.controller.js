import mongoose from "mongoose";
import Product from "../models/product.model.js";

// Text typed by the user is placed inside a regular expression, so any regex
// character in it must be treated as a plain character.
const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// POST /products
export const createProduct = async (req, res) => {
    try {
        const { name, description, price, category, image, stock } = req.body;

        if (!name || !description || !category || !image) {
            return res
                .status(400)
                .json({ success: false, message: "All fields are required" });
        }

        if (price === undefined || stock === undefined) {
            return res
                .status(400)
                .json({ success: false, message: "Price and stock are required" });
        }

        if (typeof price !== "number" || Number.isNaN(price) || price <= 0) {
            return res
                .status(400)
                .json({ success: false, message: "Price must be a number greater than 0" });
        }

        if (typeof stock !== "number" || !Number.isInteger(stock) || stock < 0) {
            return res
                .status(400)
                .json({ success: false, message: "Stock must be an integer of 0 or more" });
        }

        const product = await Product.create({
            name,
            description,
            price,
            category,
            image,
            stock,
        });

        return res.status(201).json({
            success: true,
            message: "Product created successfully",
            product,
        });
    } catch (error) {
        if (error.name === "ValidationError") {
            return res.status(400).json({ success: false, message: error.message });
        }
        return res
            .status(500)
            .json({ success: false, message: "Something went wrong" });
    }
};

// GET /products?search=&category=&sort=
export const getProducts = async (req, res) => {
    try {
        const { search, category, sort } = req.query;

        // The filter object is built up step by step, so any combination of
        // query parameters works without extra endpoints.
        const filter = {};

        if (search && search.trim()) {
            filter.name = { $regex: escapeRegex(search.trim()), $options: "i" };
        }

        if (category && category.trim() && category !== "All") {
            filter.category = { $regex: `^${escapeRegex(category.trim())}$`, $options: "i" };
        }

        const sortOptions = {
            price_asc: { price: 1 },
            price_desc: { price: -1 },
            newest: { createdAt: -1 },
        };

        const products = await Product.find(filter)
            .select("name price category image stock")
            .sort(sortOptions[sort] || { createdAt: -1 });

        return res.status(200).json({
            success: true,
            count: products.length,
            products,
        });
    } catch (error) {
        return res
            .status(500)
            .json({ success: false, message: "Something went wrong" });
    }
};

// GET /products/:id
export const getProductById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.isValidObjectId(id)) {
            return res
                .status(400)
                .json({ success: false, message: "Invalid product id" });
        }

        const product = await Product.findById(id);

        if (!product) {
            return res
                .status(404)
                .json({ success: false, message: "Product not found" });
        }

        return res.status(200).json({ success: true, product });
    } catch (error) {
        return res
            .status(500)
            .json({ success: false, message: "Something went wrong" });
    }
};

// GET /products/categories/list
export const getCategories = async (req, res) => {
    try {
        const categories = await Product.distinct("category");
        return res.status(200).json({ success: true, categories });
    } catch (error) {
        return res
            .status(500)
            .json({ success: false, message: "Something went wrong" });
    }
};
