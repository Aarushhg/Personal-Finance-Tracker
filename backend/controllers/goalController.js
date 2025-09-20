import Goal from "../models/Goal.js";
import { createNotification } from "./notificationController.js";

// Create a new goal
export const createGoal = async (req, res) => {
  try {
    const { name, targetAmount, deadline } = req.body;
    const goal = new Goal({ user: req.user.id, name, targetAmount, deadline });
    await goal.save();
    res.json(goal);
  } catch (err) {
    res.status(500).json({ error: err.message });
    console.error(err);
  }
};

// Get all goals for a user
export const getGoals = async (req, res) => {
  try {
    const goals = await Goal.find({ user: req.user.id });
    res.json(goals);
  } catch (err) {
    res.status(500).json({ error: err.message });
    console.error(err);
  }
};

// Update goal details
export const updateGoal = async (req, res) => {
  try {
    const goal = await Goal.findById(req.params.id);
    if (!goal) return res.status(404).json({ error: "Not found" });

    Object.assign(goal, req.body); // careful: validate in prod
    await goal.save();

    // ✅ Alert if goal is completed after update
    if (goal.savedAmount >= goal.targetAmount) {
      await createNotification(
        req.user.id,
        "goal",
        `🎉 Congratulations! You have completed your goal: "${goal.name}"`
      );
    }

    res.json(goal);
  } catch (err) {
    res.status(500).json({ error: err.message });
    console.error(err);
  }
};

// Contribute towards a goal
export const contributeToGoal = async (req, res) => {
  try {
    const { amount } = req.body;
    const goal = await Goal.findById(req.params.id);
    if (!goal) return res.status(404).json({ error: "Not found" });

    goal.savedAmount += Number(amount);
    await goal.save();

    // ✅ Alert when user is close to goal (>=80% of target)
    if (goal.savedAmount >= goal.targetAmount * 0.8 && goal.savedAmount - amount < goal.targetAmount * 0.8) {
      await createNotification(
        req.user.id,
        "goal",
        `Almost there! You're 80% towards your goal: "${goal.name}"`
      );
    }

    // ✅ Alert when goal is fully achieved
    if (goal.savedAmount >= goal.targetAmount && goal.savedAmount - amount < goal.targetAmount) {
      await createNotification(
        req.user.id,
        "goal",
        `🎉 Congratulations! You have completed your goal: "${goal.name}"`
      );
    }

    res.json(goal);
  } catch (err) {
    res.status(500).json({ error: err.message });
    console.error(err);
  }
};

// Delete a goal
export const deleteGoal = async (req, res) => {
  try {
    await Goal.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
    console.error(err);
  }
};
