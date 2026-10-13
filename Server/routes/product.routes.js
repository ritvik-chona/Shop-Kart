import express from "express";
import {
  createProduct,
  getProducts,
  getProductById,
  getCategories,
} from "../controllers/product.controller.js";

const router = express.Router();

// Static paths must be declared before "/:id", otherwise Express would treat
// "categories" as an id.
router.get("/categories/list", getCategories);

router.post("/", createProduct);
router.get("/", getProducts);
router.get("/:id", getProductById);

export default router;
