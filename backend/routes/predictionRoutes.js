// routes/predictionRoutes.js
import express from "express";
import axios from "axios";
import Transaction from "../models/Transaction.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/predict", authMiddleware, async (req, res) => {
  try {
    const transactions = await Transaction.find({ user: req.user.id });
    const response = await axios.post("http://localhost:5001/predict", { transactions });
    res.json({ prediction: response.data.prediction });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Prediction failed" });
  }
});

export default router;
