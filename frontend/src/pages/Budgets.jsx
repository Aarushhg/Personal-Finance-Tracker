import { useState, useEffect } from "react";
import axios from "axios";

function Budgets() {
  const [budgets, setBudgets] = useState([]);
  const [form, setForm] = useState({ category: "Food", amount: "", period: "monthly" });
  const [currency, setCurrency] = useState("₹");
  const token = localStorage.getItem("token");

  const categories = ["Food","Transport","Shopping","Entertainment","Bills","Other"];

  // ✅ Helper to format amount with currency symbol
  const formatCurrency = (amount) => `${currency}${Number(amount).toLocaleString()}`;

  useEffect(() => {
    fetchCurrency();
    fetchBudgets();
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

  const fetchBudgets = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/budgets", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBudgets(res.data);
    } catch (err) {
      console.error("Budgets fetch error", err);
    }
  };

  const addBudget = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:5000/api/budgets", form, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBudgets([res.data, ...budgets]);
      setForm({ category: "Food", amount: "", period: "monthly" });
    } catch (err) {
      console.error("Add budget error", err);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 dark:text-gray-100">Budgets</h2>

      {/* Add Budget Form */}
      <form onSubmit={addBudget} className="space-y-4 bg-white dark:bg-gray-800 p-4 rounded shadow">
        <select 
          value={form.category} 
          onChange={e => setForm({...form, category: e.target.value})} 
          className="w-full border p-2 bg-white dark:bg-gray-700 dark:text-white border-gray-300 dark:border-gray-600 rounded"
        >
          {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
        </select>

        <input 
          type="number" 
          placeholder="Budget Amount" 
          value={form.amount} 
          onChange={e => setForm({...form, amount: e.target.value})} 
          className="w-full border p-2 bg-white dark:bg-gray-700 dark:text-white border-gray-300 dark:border-gray-600 rounded" 
          required 
        />

        <select 
          value={form.period} 
          onChange={e => setForm({...form, period: e.target.value})} 
          className="w-full border p-2 bg-white dark:bg-gray-700 dark:text-white border-gray-300 dark:border-gray-600 rounded"
        >
          <option value="monthly">Monthly</option>
          <option value="yearly">Yearly</option>
        </select>

        <button 
          type="submit" 
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Add Budget
        </button>
      </form>

      {/* Budgets List */}
      <ul className="mt-6 space-y-3">
        {budgets.map(b => (
          <li 
            key={b._id} 
            className="bg-gray-100 dark:bg-gray-700 p-3 rounded shadow dark:text-gray-100"
          >
            <p className="font-semibold">{b.category} - {formatCurrency(b.amount)} ({b.period})</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Budgets;
