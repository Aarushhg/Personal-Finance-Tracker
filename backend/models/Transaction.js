import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    type: { type: String, enum: ["income", "expense"], required: true },
    category: { type: String, required: true },
    amount: { type: Number, required: true },
    date: { type: Date, default: Date.now },
    note: { type: String },

    // Recurring payment fields
    isRecurring: { type: Boolean, default: false },
    frequency: {
      type: String,
      enum: ["once","daily", "weekly", "monthly", "yearly"],
      default: "once",
    },
    endDate: { type: Date }, // optional end date for recurring payments
  },
  { timestamps: true }
);

const Transaction = mongoose.model("Transaction", transactionSchema);
export default Transaction;
