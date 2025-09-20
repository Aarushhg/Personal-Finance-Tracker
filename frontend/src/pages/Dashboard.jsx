import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from "recharts";

export default function Dashboard() {
  const [transactions, setTransactions] = useState([]);
  const [income, setIncome] = useState(0);
  const [expenses, setExpenses] = useState(0);
  const [currency, setCurrency] = useState("$");
  const [monthlyData, setMonthlyData] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [goals, setGoals] = useState([]);

  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
    setTimeout(() => window.location.reload(), 300);
  };

  // Helper to format currency
  const formatCurrency = (amount) => `${currency}${Number(amount).toLocaleString()}`;

  useEffect(() => {
    const fetchAll = async () => {
      const token = localStorage.getItem("token");

      try {
        const profileRes = await axios.get("http://localhost:5000/api/auth/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (profileRes.data?.currency) {
          const cur = profileRes.data.currency.symbol || profileRes.data.currency;
          setCurrency(cur);
        } else {
          const storedUser = localStorage.getItem("user");
          const cur = storedUser ? JSON.parse(storedUser)?.currency || "₹" : "₹";
          setCurrency(cur);
        }
      } catch (err) {
        console.error("Profile fetch error", err);
      }

      try {
        const res = await axios.get("http://localhost:5000/api/transactions", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setTransactions(res.data || []);
        let inc = 0, exp = 0;
        (res.data || []).forEach(t => {
          if (t.type === "income") inc += t.amount;
          else exp += t.amount;
        });
        setIncome(inc);
        setExpenses(exp);

        const monthly = [];
        (res.data || []).forEach(t => {
          const m = new Date(t.date).toLocaleString("default", { month: "short", year: "numeric" });
          let found = monthly.find(x => x.month === m);
          if (!found) {
            found = { month: m, income: 0, expenses: 0, savings: 0 };
            monthly.push(found);
          }
          if (t.type === "income") found.income += t.amount;
          else found.expenses += t.amount;
          found.savings = found.income - found.expenses;
        });
        monthly.sort((a, b) => new Date(a.month) - new Date(b.month));
        setMonthlyData(monthly);
      } catch (err) {
        console.error("Transactions fetch error", err);
      }

      try {
        const bres = await axios.get("http://localhost:5000/api/budgets", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setBudgets(bres.data || []);
      } catch (err) {
        console.error("Budgets fetch error", err);
      }

      try {
        const gres = await axios.get("http://localhost:5000/api/goals", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setGoals(gres.data || []);
      } catch (err) {
        console.error("Goals fetch error", err);
      }
    };

    fetchAll();
  }, []);

  const balance = income - expenses;

  const getSpentByCategoryForPeriod = (period = "monthly") => {
    const now = new Date();
    const spent = {};
    transactions.forEach(t => {
      if (t.type !== "expense") return;
      const d = new Date(t.date);
      if (period === "monthly") {
        if (d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()) {
          spent[t.category] = (spent[t.category] || 0) + t.amount;
        }
      } else {
        if (d.getFullYear() === now.getFullYear()) {
          spent[t.category] = (spent[t.category] || 0) + t.amount;
        }
      }
    });
    return spent;
  };

  const spentThisMonth = getSpentByCategoryForPeriod("monthly");
  const spentThisYear = getSpentByCategoryForPeriod("yearly");

  const budgetStatus = budgets.map(b => {
    const spent = b.period === "monthly" ? (spentThisMonth[b.category] || 0) : (spentThisYear[b.category] || 0);
    const pct = b.amount > 0 ? Math.min(100, Math.round((spent / b.amount) * 100)) : 0;
    const state = spent > b.amount ? "exceeded" : (spent > 0.9 * b.amount ? "warning" : "ok");
    return { ...b._doc ? b._doc : b, spent, pct, state };
  });

  const avgMonthlySavings = (() => {
    if (!monthlyData.length) return 0;
    const last = monthlyData.slice(-6);
    const sums = last.reduce((s, m) => s + (m.savings || 0), 0);
    return last.length ? sums / last.length : 0;
  })();

  const goalsWithEstimates = goals.map(g => {
    const progress = g.targetAmount > 0 ? (g.savedAmount / g.targetAmount) * 100 : 0;
    let monthsLeft = null;
    if (avgMonthlySavings > 0) {
      monthsLeft = Math.ceil(Math.max(0, (g.targetAmount - g.savedAmount) / avgMonthlySavings));
    }
    let estimatedDate = null;
    if (monthsLeft !== null) {
      const d = new Date();
      d.setMonth(d.getMonth() + monthsLeft);
      estimatedDate = d;
    }
    return { ...g, progress: Math.min(100, progress), monthsLeft, estimatedDate };
  });

  const expenseData = transactions
    .filter(t => t.type === "expense")
    .reduce((acc, t) => {
      const found = acc.find(x => x.name === t.category);
      if (found) found.value += t.amount; else acc.push({ name: t.category, value: t.amount });
      return acc;
    }, []);
  const COLORS = ["#f87171", "#fbbf24", "#60a5fa", "#34d399", "#a78bfa", "#fb7185", "#f59e0b"];

  return (
    <div className="p-6 bg-gray-100 dark:bg-[#121212] min-h-screen text-gray-900 dark:text-gray-200">
      {/* 🔹 Top bar with logout only */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Dashboard</h2>
        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-4 py-2 rounded shadow hover:bg-red-600"
        >
          Logout
        </button>
      </div>

      {/* Top summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-[#1E1E1E] shadow p-6 rounded-lg text-center">
          <h3 className="text-lg font-bold">💰 Income</h3>
          <p className="text-2xl font-semibold text-green-500">{formatCurrency(income)}</p>
        </div>
        <div className="bg-white dark:bg-[#1E1E1E] shadow p-6 rounded-lg text-center">
          <h3 className="text-lg font-bold">💸 Expenses</h3>
          <p className="text-2xl font-semibold text-red-500">{formatCurrency(expenses)}</p>
        </div>
        <div className="bg-white dark:bg-[#1E1E1E] shadow p-6 rounded-lg text-center">
          <h3 className="text-lg font-bold">🏦 Balance</h3>
          <p className="text-2xl font-semibold">{formatCurrency(balance)}</p>
        </div>
        <div className="bg-white dark:bg-[#1E1E1E] shadow p-6 rounded-lg text-center">
          <h3 className="text-lg font-bold">📊 Last Month Savings</h3>
          <p className="text-2xl font-semibold">
            {formatCurrency(monthlyData.length ? monthlyData[monthlyData.length - 1].savings : 0)}
          </p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Line Chart with left margin */}
        <div className="bg-white dark:bg-[#1E1E1E] shadow p-6 rounded-lg ml-4"> {/* <-- added ml-4 */}
          <h3 className="text-lg font-bold mb-4">Income vs Expenses vs Savings</h3>
          <LineChart
            width={400}
            height={300}
            data={monthlyData}
            margin={{ top: 20, right: 30, left: 50, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis tickFormatter={formatCurrency} />
            <Tooltip formatter={value => formatCurrency(value)} />
            <Legend />
            <Line type="monotone" dataKey="income" stroke="#4ade80" strokeWidth={2} />
            <Line type="monotone" dataKey="expenses" stroke="#f87171" strokeWidth={2} />
            <Line type="monotone" dataKey="savings" stroke="#3b82f6" strokeWidth={2} />
          </LineChart>
        </div>

        {/* Pie Chart with larger size and legend on right */}
        <div className="bg-white dark:bg-[#1E1E1E] shadow p-6 rounded-lg">
          <h3 className="text-lg font-bold mb-4">Expenses by Category</h3>
          <div className="flex items-center"> {/* Wrap chart and legend horizontally */}
            <PieChart width={300} height={300}> {/* <-- increased width and height */}
              <Pie data={expenseData} dataKey="value" outerRadius={120} label> {/* <-- increased outerRadius */}
                {expenseData.map((entry, idx) => (
                  <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={value => formatCurrency(value)} />
            </PieChart>

            {/* Custom Legend on the right */}
            <ul className="ml-36 space-y-2">
              {expenseData.map((entry, idx) => (
                <li key={idx} className="flex items-center space-x-2">
                  <span
                    className="inline-block w-3 h-3 rounded-full"
                    style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                  ></span>
                  <span className="text-sm">{entry.name}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>


      {/* Budgets */}
      <div className="bg-white dark:bg-[#1E1E1E] p-6 rounded shadow mb-6">
        <h3 className="text-xl font-bold mb-4">Budgets</h3>
        {budgetStatus.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400">No budgets set. Add budgets from Budget page.</p>
        ) : (
          <div className="space-y-4">
            {budgetStatus.map(b => (
              <div key={b._id} className="flex items-center justify-between gap-4 p-3 border rounded dark:border-gray-700">
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold">{b.category} <span className="text-sm text-gray-500">({b.period})</span></div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">{formatCurrency(b.spent)} spent of {formatCurrency(b.amount)}</div>
                    </div>
                    <div className="text-right">
                      {b.state === "exceeded" ? (
                        <div className="text-sm text-red-600 font-semibold">Exceeded</div>
                      ) : b.state === "warning" ? (
                        <div className="text-sm text-yellow-600 font-semibold">Approaching</div>
                      ) : (
                        <div className="text-sm text-green-600 font-semibold">OK</div>
                      )}
                    </div>
                  </div>

                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded h-2 mt-2">
                    <div style={{ width: `${b.pct}%` }} className={`h-2 rounded ${b.state === "exceeded" ? "bg-red-500" : b.state === "warning" ? "bg-yellow-400" : "bg-green-500"}`}></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Goals */}
      <div className="bg-white dark:bg-[#1E1E1E] p-6 rounded shadow mb-6">
        <h3 className="text-xl font-bold mb-4">Financial Goals</h3>
        {goalsWithEstimates.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400">No goals yet. Create goals from Goals page.</p>
        ) : (
          <div className="space-y-4">
            {goalsWithEstimates.map(g => (
              <div key={g._id} className="p-3 border rounded dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold">{g.name}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">{formatCurrency(g.savedAmount)} / {formatCurrency(g.targetAmount)}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm">{Math.round(g.progress)}%</div>
                    {g.estimatedDate && <div className="text-xs text-gray-500 dark:text-gray-400">Est: {new Date(g.estimatedDate).toLocaleDateString()}</div>}
                  </div>
                </div>

                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded h-3 mt-2">
                  <div style={{ width: `${g.progress}%` }} className="h-3 bg-green-500 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Transactions */}
      <div className="bg-white dark:bg-[#1E1E1E] shadow p-6 rounded-lg">
        <h3 className="text-lg font-bold mb-4">Recent Transactions</h3>
        <table className="w-full border dark:border-gray-700">
          <thead>
            <tr className="bg-gray-100 dark:bg-gray-800">
              <th className="p-2">Date</th>
              <th className="p-2">Category</th>
              <th className="p-2">Type</th>
              <th className="p-2">Amount</th>
            </tr>
          </thead>
          <tbody>
            {transactions.slice(0, 5).map((t, i) => (
              <tr key={i} className="border-t text-center dark:border-gray-700">
                <td className="p-2">{new Date(t.date).toLocaleDateString()}</td>
                <td className="p-2">{t.category}</td>
                <td className={`p-2 ${t.type === "income" ? "text-green-500" : "text-red-500"}`}>{t.type}</td>
                <td className="p-2">{formatCurrency(t.amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
