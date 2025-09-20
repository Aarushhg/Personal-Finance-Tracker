import { useState, useEffect } from "react";
import axios from "axios";

function Goals() {
  const [goals, setGoals] = useState([]);
  const [form, setForm] = useState({ name: "", targetAmount: "", deadline: "" });
  const [currency, setCurrency] = useState("₹");
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchCurrency();
    fetchGoals();
  }, []);

  // ✅ Safe fetch for currency (backend first, fallback to localStorage, then default ₹)
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

  const fetchGoals = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/goals", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setGoals(res.data);
    } catch (err) {
      console.error("Goals fetch error", err);
    }
  };

  const addGoal = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:5000/api/goals", {
        name: form.name,
        targetAmount: form.targetAmount,
        deadline: form.deadline,
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setGoals([res.data, ...goals]);
      setForm({ name: "", targetAmount: "", deadline: "" });
    } catch (err) {
      console.error("Add goal error", err);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 dark:text-gray-100">Financial Goals</h2>

      {/* Add Goal Form */}
      <form
        onSubmit={addGoal}
        className="space-y-4 bg-white dark:bg-gray-800 p-4 rounded shadow"
      >
        <input
          type="text"
          placeholder="Goal Name"
          value={form.name}
          onChange={e => setForm({ ...form, name: e.target.value })}
          className="w-full border p-2 rounded bg-white dark:bg-gray-700 dark:text-white border-gray-300 dark:border-gray-600 placeholder-gray-700 dark:placeholder-gray-400"
          required
        />
        <input
          type="number"
          placeholder="Target Amount"
          value={form.targetAmount}
          onChange={e => setForm({ ...form, targetAmount: e.target.value })}
          className="w-full border p-2 rounded bg-white dark:bg-gray-700 dark:text-white border-gray-300 dark:border-gray-600 placeholder-gray-700 dark:placeholder-gray-400"
          required
        />
        <input
          type="date"
          value={form.deadline}
          onChange={e => setForm({ ...form, deadline: e.target.value })}
          className="w-full border p-2 rounded bg-white dark:bg-gray-700 dark:text-white border-gray-300 dark:border-gray-600 placeholder-gray-700 dark:placeholder-gray-400"
          required
        />
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded shadow hover:bg-blue-600"
        >
          Add Goal
        </button>
      </form>

      {/* Goals List */}
      <ul className="mt-6 space-y-3">
        {goals.map(g => (
          <li
            key={g._id}
            className="bg-gray-100 dark:bg-gray-700 p-3 rounded shadow dark:text-gray-100"
          >
            <p className="font-semibold">{g.name}</p>
            <p>Target: {currency}{Number(g.targetAmount).toLocaleString()}</p>
            <p>Deadline: {new Date(g.deadline).toLocaleDateString()}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Goals;
