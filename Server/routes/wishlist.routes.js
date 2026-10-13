import express from "express";
import {
  addToWishlist,
  getWishlist,
  getWishlistIds,
  removeFromWishlist,
  toggleWishlist,
} from "../controllers/wishlist.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = express.Router();

// One guard for the whole router: every route below requires a valid session.
router.use(protect);

// The static path is declared before the dynamic one.
router.get("/ids", getWishlistIds);

router.get("/", getWishlist);
router.post("/:productId", addToWishlist);
router.delete("/:productId", removeFromWishlist);
router.patch("/:productId/toggle", toggleWishlist);

export default router;
