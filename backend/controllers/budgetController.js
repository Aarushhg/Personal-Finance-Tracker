import Budget from "../models/Budget.js";

export const createOrUpdateBudget = async (req, res) => {
  try {
    const { category, amount, period } = req.body;
    const userId = req.user.id;

    let budget = await Budget.findOne({ user: userId, category, period });
    if (budget) {
      budget.amount = amount;
      await budget.save();
    } else {
      budget = new Budget({ user: userId, category, amount, period });
      await budget.save();
    }
    res.json(budget);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getBudgets = async (req, res) => {
  try {
    const budgets = await Budget.find({ user: req.user.id });
    res.json(budgets);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteBudget = async (req, res) => {
  try {
    await Budget.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
