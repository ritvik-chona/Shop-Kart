import mongoose from "mongoose";
import Customer from "../models/customer.model.js";
import Product from "../models/product.model.js";

const CART_PRODUCT_FIELDS = "name price category image stock";

// Loads the cart with every row's product filled in. Used as the response of
// each mutation so the frontend always receives the authoritative cart and
// never has to guess what the database now holds.
const loadCart = async (customerId) => {
    const customer = await Customer.findById(customerId).populate({
        path: "cart.product",
        select: CART_PRODUCT_FIELDS,
    });

    // A product deleted from the catalogue populates as null, so those rows
    // are dropped from the response rather than crashing the UI.
    return customer.cart.filter((item) => item.product);
};

// POST /cart/:productId
export const addToCart = async (req, res) => {
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

        const existing = customer.cart.find(
            (item) => item.product.toString() === productId
        );

        // Adding the same product again increases the quantity instead of
        // creating a second row for it.
        const nextQuantity = existing ? existing.quantity + 1 : 1;

        if (nextQuantity > product.stock) {
            return res.status(400).json({
                success: false,
                message:
                    product.stock === 0
                        ? "This product is out of stock"
                        : `Only ${product.stock} units are available`,
            });
        }

        if (existing) existing.quantity = nextQuantity;
        else customer.cart.push({ product: productId, quantity: 1 });

        await customer.save();

        return res.status(200).json({
            success: true,
            message: "Cart updated",
            cart: await loadCart(customer._id),
        });
    } catch (error) {
        return res
            .status(500)
            .json({ success: false, message: "Something went wrong" });
    }
};

// GET /cart
export const getCart = async (req, res) => {
    try {
        const cart = await loadCart(req.user._id);

        return res.status(200).json({ success: true, count: cart.length, cart });
    } catch (error) {
        return res
            .status(500)
            .json({ success: false, message: "Something went wrong" });
    }
};

// PATCH /cart/:productId   body: { quantity }
export const updateCartQuantity = async (req, res) => {
    try {
        const { productId } = req.params;
        const { quantity } = req.body;

        if (!mongoose.isValidObjectId(productId)) {
            return res
                .status(400)
                .json({ success: false, message: "Invalid product id" });
        }

        if (typeof quantity !== "number" || !Number.isInteger(quantity)) {
            return res
                .status(400)
                .json({ success: false, message: "Quantity must be a whole number" });
        }

        if (quantity < 1) {
            return res
                .status(400)
                .json({ success: false, message: "Quantity must be at least 1" });
        }

        const product = await Product.findById(productId);
        if (!product) {
            return res
                .status(404)
                .json({ success: false, message: "Product not found" });
        }

        // Stock is re-read from the Product document on every change, so a
        // stock drop since the item was added is respected.
        if (quantity > product.stock) {
            return res.status(400).json({
                success: false,
                message: `Only ${product.stock} units are available`,
            });
        }

        const customer = await Customer.findById(req.user._id);

        const existing = customer.cart.find(
            (item) => item.product.toString() === productId
        );

        if (!existing) {
            return res
                .status(404)
                .json({ success: false, message: "Product not in cart" });
        }

        existing.quantity = quantity;
        await customer.save();

        return res.status(200).json({
            success: true,
            message: "Quantity updated",
            cart: await loadCart(customer._id),
        });
    } catch (error) {
        return res
            .status(500)
            .json({ success: false, message: "Something went wrong" });
    }
};

// DELETE /cart/:productId
export const removeFromCart = async (req, res) => {
    try {
        const { productId } = req.params;

        if (!mongoose.isValidObjectId(productId)) {
            return res
                .status(400)
                .json({ success: false, message: "Invalid product id" });
        }

        const customer = await Customer.findById(req.user._id);

        const isInCart = customer.cart.some(
            (item) => item.product.toString() === productId
        );

        if (!isInCart) {
            return res
                .status(404)
                .json({ success: false, message: "Product not in cart" });
        }

        customer.cart = customer.cart.filter(
            (item) => item.product.toString() !== productId
        );
        await customer.save();

        return res.status(200).json({
            success: true,
            message: "Product removed from cart",
            cart: await loadCart(customer._id),
        });
    } catch (error) {
        return res
            .status(500)
            .json({ success: false, message: "Something went wrong" });
    }
};
