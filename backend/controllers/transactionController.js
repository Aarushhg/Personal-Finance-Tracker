import Transaction from "../models/Transaction.js";
import Budget from "../models/Budget.js";
import { createNotification } from "./notificationController.js";

// Create Transaction
export const createTransaction = async (req, res) => {
  try {
    const { amount, category, type, date } = req.body;

    // Save the transaction
    const transaction = new Transaction({
      user: req.user.id,
      amount,
      category,
      type,
      date,
    });
    await transaction.save();

    // ---------------------------
    // ✅ Expense Limit Alerts
    // ---------------------------
    if (type === "expense") {
      const budget = await Budget.findOne({
        user: req.user.id,
        category,
        period: "monthly",
      });

      if (budget) {
        const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);

        const totalSpentAgg = await Transaction.aggregate([
          { $match: { user: req.user.id, category, type: "expense", date: { $gte: startOfMonth } } },
          { $group: { _id: null, total: { $sum: "$amount" } } },
        ]);

        const totalSpent = totalSpentAgg[0]?.total || 0;

        if (totalSpent >= budget.amount * 0.8 && totalSpent - amount < budget.amount * 0.8) {
          // Trigger alert only when crossing 80% threshold
          await createNotification(
            req.user.id,
            "budget",
            `⚠️ You are approaching your budget limit for ${category}`
          );
        }

        if (totalSpent >= budget.amount && totalSpent - amount < budget.amount) {
          await createNotification(
            req.user.id,
            "budget",
            `❌ You have exceeded your budget for ${category}`
          );
        }
      }
    }

    // ---------------------------
    // ✅ Bill Reminders (if due in 3 days)
    // ---------------------------
    if (category.toLowerCase() === "bills") {
      const dueDate = new Date(date);
      const today = new Date();
      const diffDays = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));

      if (diffDays <= 3) {
        await createNotification(
          req.user.id,
          "bill",
          `Reminder: Upcoming bill "${category}" due on ${dueDate.toLocaleDateString()}`,
          transaction._id
        );
      }
    }

    res.json(transaction);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
    console.error(err);
  }
};

// Get all transactions for user
export const getTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({ user: req.user.id }).sort({ date: -1 });
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
    console.error(err);
  }
};

// Delete a transaction
export const deleteTransaction = async (req, res) => {
  try {
    await Transaction.findByIdAndDelete(req.params.id);
    res.json({ message: "Transaction deleted" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
    console.error(err);
  }
};
