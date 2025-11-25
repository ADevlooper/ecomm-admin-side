import express from "express";
import { getAllCategories } from "../controllers/categoriesController.js";

const router = express.Router();

// Only allow fetching the predefined categories
router.get("/", getAllCategories);

export default router;
