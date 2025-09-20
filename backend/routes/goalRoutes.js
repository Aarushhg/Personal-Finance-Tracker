import express from "express";
import { createGoal, getGoals, updateGoal, contributeToGoal, deleteGoal } from "../controllers/goalController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();
router.post("/", authMiddleware, createGoal);
router.get("/", authMiddleware, getGoals);
router.put("/:id", authMiddleware, updateGoal);
router.post("/:id/save", authMiddleware, contributeToGoal);
router.delete("/:id", authMiddleware, deleteGoal);

export default router;
