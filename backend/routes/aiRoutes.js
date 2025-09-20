import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import axios from "axios";
import Transaction from "../models/Transaction.js";
import User from "../models/User.js"; // ✅ import User model

const router = express.Router();

router.post("/chat", authMiddleware, async (req, res) => {
  try {
    const { messages, input } = req.body;

    // ✅ Get user currency
    const user = await User.findById(req.user.id).select("currency");
    const currency = user?.currency || "USD";

    // ✅ Fetch last 20 transactions
    const transactions = await Transaction.find({ user: req.user.id })
      .sort({ date: -1 })
      .limit(20);

    const transactionSummary =
      transactions.length > 0
        ? transactions
            .map(
              (t) =>
                `${t.category}: ${t.amount} ${currency} on ${new Date(
                  t.date
                ).toDateString()}`
            )
            .join("\n")
        : "No transactions available.";

    // ✅ Build chat history
    const chatHistory = messages && Array.isArray(messages) ? messages : [];
    if (input) {
      chatHistory.push({ role: "user", text: input });
    }

    // ✅ Instead of system role, prepend context as a user message
    const contents = [
      {
        role: "user",
        parts: [
          {
            text: `The user's preferred currency is ${currency}. Always show amounts in ${currency}.
Here are the user's most recent transactions:\n${transactionSummary}\n\nUse this data to answer their finance-related questions clearly and concisely.`,
          },
        ],
      },
      ...chatHistory.map((m) => ({
        role: m.role === "user" ? "user" : "model",
        parts: [{ text: m.text }],
      })),
    ];

    // ✅ Call Gemini API
    const response = await axios.post(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent",
      { contents },
      {
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": process.env.GEMINI_API_KEY,
        },
      }
    );

    const reply =
      response.data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "No response from AI";

    res.json({ reply });
  } catch (err) {
    console.error("Gemini API error:", err.response?.data || err.message);
    res.status(500).json({ reply: "AI API failed." });
  }
});

export default router;
