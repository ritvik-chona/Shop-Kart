import express from "express";
import {
  createPaymentOrder,
  verifyPayment,
  markPaymentFailed,
  getMyOrders,
  getOrderById,
  advanceOrderStatus,
} from "../controllers/order.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Every order route requires a valid session.
router.use(protect);

// Static paths come before "/:id" so they are not read as order ids.
router.post("/create-payment-order", createPaymentOrder);
router.post("/verify-payment", verifyPayment);

router.get("/", getMyOrders);
router.get("/:id", getOrderById);
router.post("/:id/payment-failed", markPaymentFailed);
router.patch("/:id/status", advanceOrderStatus);

export default router;
