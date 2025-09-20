import express from "express";
import { createTransaction, getTransactions, deleteTransaction } from "../controllers/transactionController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", authMiddleware, createTransaction);   // Add
router.get("/", authMiddleware, getTransactions);     // Get all
router.delete("/:id", authMiddleware, deleteTransaction); // Delete

export default router;
