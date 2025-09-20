import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import cron from "node-cron";

import authRoutes from "./routes/authRoutes.js";
import transactionRoutes from "./routes/transactionRoutes.js";
import Transaction from "./models/Transaction.js"; 
import budgetRoutes from "./routes/budgetRoutes.js";
import goalRoutes from "./routes/goalRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/budgets", budgetRoutes);
app.use("/api/goals", goalRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/ai", aiRoutes);

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error(err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// ===================== Recurring Payments Scheduler =====================
// Runs every day at midnight
cron.schedule("0 0 * * *", async () => {
  console.log("Checking recurring transactions...");
  const today = new Date();

  try {
    const recurringTransactions = await Transaction.find({ isRecurring: true });

    for (const t of recurringTransactions) {
      // Skip if endDate exists and is in the past
      if (t.endDate && t.endDate < today) continue;

      const lastDate = new Date(t.date);
      let shouldCreate = false;

      switch (t.frequency) {
        case "daily":
          shouldCreate = lastDate.toDateString() !== today.toDateString();
          break;
        case "weekly":
          shouldCreate = today.getDay() === lastDate.getDay() && today > lastDate;
          break;
        case "monthly":
          shouldCreate = today.getDate() === lastDate.getDate() && today > lastDate;
          break;
        case "yearly":
          shouldCreate =
            today.getMonth() === lastDate.getMonth() &&
            today.getDate() === lastDate.getDate() &&
            today > lastDate;
          break;
      }

      if (shouldCreate) {
        const newTx = new Transaction({
          user: t.user,
          type: t.type,
          category: t.category,
          amount: t.amount,
          date: today,
          note: `${t.note || ""} (recurring)`,
          isRecurring: t.isRecurring,
          frequency: t.frequency,
          endDate: t.endDate,
        });
        await newTx.save();
        console.log("Recurring transaction added:", newTx);
      }
    }
  } catch (err) {
    console.error("Error processing recurring transactions:", err);
  }
});
