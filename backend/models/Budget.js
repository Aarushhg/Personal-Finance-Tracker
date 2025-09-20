import mongoose from "mongoose";

const budgetSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  category: { type: String, required: true },
  amount: { type: Number, required: true },          // amount limit
  period: { type: String, enum: ["monthly","yearly"], default: "monthly" },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Budget", budgetSchema);
