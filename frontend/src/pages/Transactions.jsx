import { useEffect, useState } from "react";
import axios from "axios";

function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [currency, setCurrency] = useState("₹");
  const [form, setForm] = useState({
    amount: "",
    category: "Food",
    type: "expense",
    date: new Date().toISOString().split("T")[0], // Set today's date as default
    note: "",
    isRecurring: false,
    frequency: "",
    endDate: "",
  });

  const token = localStorage.getItem("token");

  const categories = [
    "Food",
    "Transport",
    "Shopping",
    "Entertainment",
    "Bills",
    "Salary",
    "Freelance",
    "Other",
  ];

  const frequencies = ["daily", "weekly", "monthly", "yearly"];

  // ✅ Fetch currency safely
  const fetchCurrency = async () => {
    try {
      const profileRes = await axios.get("http://localhost:5000/api/auth/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (profileRes.data?.currency) {
        setCurrency(profileRes.data.currency.symbol || profileRes.data.currency);
        return;
      }
    } catch (err) {
      console.error("Currency fetch error", err);
    }

    // Fallback: localStorage
    try {
      const storedUser = localStorage.getItem("user");
      const parsedUser = storedUser ? JSON.parse(storedUser) : null;
      if (parsedUser?.currency) {
        setCurrency(parsedUser.currency);
      }
    } catch (e) {
      console.warn("User parse error, using default currency");
    }
  };

  // Fetch transactions
  const fetchTransactions = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/transactions", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTransactions(res.data);
    } catch (err) {
      console.error("Transactions fetch error", err);
    }
  };

  // Add transaction
  const addTransaction = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:5000/api/transactions", form, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTransactions([res.data, ...transactions]);
      setForm({
        amount: "",
        category: "Food",
        type: "expense",
        date: new Date().toISOString().split("T")[0],
        note: "",
        isRecurring: false,
        frequency: "",
        endDate: "",
      });
    } catch (err) {
      console.error("Add transaction error", err);
    }
  };

  // Delete transaction
  const deleteTransaction = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/transactions/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTransactions(transactions.filter((t) => t._id !== id));
    } catch (err) {
      console.error("Delete transaction error", err);
    }
  };

  useEffect(() => {
    fetchCurrency();
    fetchTransactions();
  }, []);

  // ✅ Currency formatter
  const formatCurrency = (amount) => `${currency}${Number(amount).toLocaleString()}`;

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4 dark:text-gray-100">Transactions</h2>

      {/* Add Transaction Form */}
      <form
        onSubmit={addTransaction}
        className="space-y-4 bg-white dark:bg-gray-800 p-4 rounded shadow"
      >
        <input
          type="number"
          placeholder="Amount"
          value={form.amount}
          onChange={(e) => setForm({ ...form, amount: e.target.value })}
          className="w-full border p-2 rounded border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-white placeholder-gray-700 dark:placeholder-gray-400"
          required
        />

        {/* Category dropdown */}
        <select
          value={form.category}
          onChange={(e) => setForm({ ...form, category: e.target.value })}
          className="w-full border p-2 rounded border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-white"
        >
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>

        {/* Type */}
        <select
          value={form.type}
          onChange={(e) => setForm({ ...form, type: e.target.value })}
          className="w-full border p-2 rounded border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-white"
        >
          <option value="expense">Expense</option>
          <option value="income">Income</option>
        </select>

        {/* Date */}
        <input
          type="date"
          value={form.date}
          onChange={(e) => setForm({ ...form, date: e.target.value })}
          className="w-full border p-2 rounded border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-white"
          required
        />

        {/* Note */}
        <textarea
          placeholder="Add a note (optional)"
          value={form.note}
          onChange={(e) => setForm({ ...form, note: e.target.value })}
          className="w-full border p-2 rounded border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-white placeholder-gray-700 dark:placeholder-gray-400"
          rows="2"
        />

        {/* Recurring Options */}
        <div className="flex items-center space-x-2 text-gray-900 dark:text-gray-200">
          <input
            type="checkbox"
            checked={form.isRecurring}
            onChange={(e) => setForm({ ...form, isRecurring: e.target.checked })}
            className="rounded"
          />
          <label>Recurring?</label>
        </div>

        {form.isRecurring && (
          <>
            <select
              value={form.frequency}
              onChange={(e) => setForm({ ...form, frequency: e.target.value })}
              className="w-full border p-2 rounded border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-white"
              required
            >
              <option value="">Select Frequency</option>
              {frequencies.map((freq) => (
                <option key={freq} value={freq}>
                  {freq.charAt(0).toUpperCase() + freq.slice(1)}
                </option>
              ))}
            </select>

            {/* End Date with label and helper */}
            <div className="mt-2 text-gray-900 dark:text-gray-200">
              <label className="block mb-1 font-semibold">End Date (optional)</label>
              <input
                type="date"
                value={form.endDate}
                onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                className="w-full border p-2 rounded border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-white"
              />
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Leave empty for unlimited recurring transactions.
              </p>
            </div>
          </>
        )}

        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Add Transaction
        </button>
      </form>

      {/* List */}
      <ul className="mt-6 space-y-2">
        {transactions.map((t) => (
          <li
            key={t._id}
            className="flex justify-between items-center bg-gray-100 dark:bg-gray-700 p-2 rounded"
          >
            <div className="text-gray-900 dark:text-gray-100">
              <span className="font-semibold">{t.category}</span> -{" "}
              {formatCurrency(t.amount)} ({t.type}){" "}
              <span className="text-gray-500 dark:text-gray-400">
                [{new Date(t.date).toLocaleDateString()}]
              </span>
              {t.note && (
                <p className="text-sm text-gray-600 dark:text-gray-300">📝 {t.note}</p>
              )}
              {t.isRecurring && (
                <p className="text-sm text-blue-500 dark:text-blue-400">
                  🔁 Recurring ({t.frequency})
                  {t.endDate && ` until ${new Date(t.endDate).toLocaleDateString()}`}
                </p>
              )}
            </div>
            <button
              onClick={() => deleteTransaction(t._id)}
              className="text-red-500 hover:underline"
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Transactions;
