import express from "express";
import { createOrUpdateBudget, getBudgets, deleteBudget } from "../controllers/budgetController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();
router.post("/", authMiddleware, createOrUpdateBudget);
router.get("/", authMiddleware, getBudgets);
router.delete("/:id", authMiddleware, deleteBudget);

export default router;
