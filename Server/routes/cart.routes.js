import express from "express";
import {
  addToCart,
  getCart,
  updateCartQuantity,
  removeFromCart,
} from "../controllers/cart.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = express.Router();

// One guard for the whole router: every cart route needs a valid session.
router.use(protect);

router.get("/", getCart);
router.post("/:productId", addToCart);
router.patch("/:productId", updateCartQuantity);
router.delete("/:productId", removeFromCart);

export default router;
