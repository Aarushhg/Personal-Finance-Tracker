import { useEffect, useState } from "react";
import axios from "axios";
import { FiArrowDownRight, FiArrowUpRight } from "react-icons/fi";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

function Budget() {
  const [transactions, setTransactions] = useState([]);
  const [income, setIncome] = useState(0);
  const [expense, setExpense] = useState(0);

  // ✅ Currency state
  const [currency, setCurrency] = useState("₹");

  // ✅ Filters (active vs pending)
  const [filters, setFilters] = useState({
    category: "",
    startDate: "",
    endDate: "",
  });
  const [pendingFilters, setPendingFilters] = useState({ ...filters });

  const [filteredIncome, setFilteredIncome] = useState(0);
  const [filteredExpense, setFilteredExpense] = useState(0);

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

  // ✅ Fetch currency from backend → localStorage → fallback
  useEffect(() => {
    const fetchCurrency = async () => {
      try {
        if (token) {
          const res = await axios.get("http://localhost:5000/api/auth/profile", {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (res.data?.currency) {
            setCurrency(res.data.currency);
            return;
          }
        }
      } catch (err) {
        console.warn("Failed to fetch currency from backend:", err);
      }

      // fallback to localStorage
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        try {
          const parsed = JSON.parse(storedUser);
          setCurrency(parsed?.currency || "₹");
        } catch (e) {
          console.warn("Invalid user in localStorage, using default currency.");
          setCurrency("₹");
        }
      } else {
        setCurrency("₹");
      }
    };

    fetchCurrency();
  }, [token]);

  // Helper to format amount with currency symbol
  const formatCurrency = (amount) =>
    `${currency} ${Number(amount).toLocaleString()}`;

  // Fetch transactions
  const fetchTransactions = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/transactions", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTransactions(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  // Overall totals
  useEffect(() => {
    let inc = 0;
    let exp = 0;
    transactions.forEach((t) => {
      if (t.type === "income") inc += t.amount;
      else exp += t.amount;
    });
    setIncome(inc);
    setExpense(exp);
  }, [transactions]);

  // Group by date based on ACTIVE filters
  const groupedByDate = transactions.reduce((acc, t) => {
    const tDate = new Date(t.date);
    const start = filters.startDate ? new Date(filters.startDate) : null;
    const end = filters.endDate ? new Date(filters.endDate) : null;

    if (
      (!filters.category || t.category === filters.category) &&
      (!start || tDate >= start) &&
      (!end || tDate <= end)
    ) {
      const dateStr = tDate.toLocaleDateString();
      if (!acc[dateStr]) acc[dateStr] = [];
      acc[dateStr].push(t);
    }
    return acc;
  }, {});

  const sortedDates = Object.keys(groupedByDate).sort(
    (a, b) => new Date(b) - new Date(a)
  );

  // Calculate filtered totals
  useEffect(() => {
    let inc = 0;
    let exp = 0;
    sortedDates.forEach((date) => {
      groupedByDate[date].forEach((t) => {
        if (t.type === "income") inc += t.amount;
        else exp += t.amount;
      });
    });
    setFilteredIncome(inc);
    setFilteredExpense(exp);
  }, [filters, transactions]);

  // PDF Download
  const downloadPDF = () => {
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text("Expense History", 14, 20);

    doc.setFontSize(12);
    doc.text(`Total Income: ${formatCurrency(filteredIncome)}`, 14, 30);
    doc.text(`Total Expense: ${formatCurrency(filteredExpense)}`, 14, 38);

    let filterText = "Filters: ";
    if (filters.category) filterText += `Category: ${filters.category} `;
    if (filters.startDate) filterText += `From: ${filters.startDate} `;
    if (filters.endDate) filterText += `To: ${filters.endDate}`;
    if (filterText !== "Filters: ") {
      doc.text(filterText, 14, 46);
    }

    const tableColumn = ["Date", "Type", "Category", "Amount", "Note"];
    const tableRows = [];

    sortedDates.forEach((date) => {
      groupedByDate[date].forEach((t) => {
        tableRows.push([
          new Date(t.date).toLocaleDateString(),
          t.type,
          t.category,
          formatCurrency(t.amount),
          t.note || "-",
        ]);
      });
    });

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 55,
    });

    doc.save("expense_history.pdf");
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 text-gray-800 dark:text-gray-100">
      <h2 className="text-2xl font-bold mb-6">Budget Overview</h2>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded shadow flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-gray-600 dark:text-gray-300">
              Income
            </h3>
            <p className="text-2xl font-bold text-green-600">
              {formatCurrency(filteredIncome)}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Overall: {formatCurrency(income)}
            </p>
          </div>
          <FiArrowDownRight className="text-green-600 text-4xl" />
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded shadow flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-gray-600 dark:text-gray-300">
              Expense
            </h3>
            <p className="text-2xl font-bold text-red-600">
              {formatCurrency(filteredExpense)}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Overall: {formatCurrency(expense)}
            </p>
          </div>
          <FiArrowUpRight className="text-red-600 text-4xl" />
        </div>
      </div>

      {/* Download Button */}
      <div className="mb-6">
        <button
          onClick={downloadPDF}
          className="bg-blue-500 text-white px-4 py-2 rounded shadow hover:bg-blue-600 dark:hover:bg-blue-700"
        >
          📥 Download Expense History (PDF)
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded shadow mb-6">
        <h3 className="text-lg font-semibold mb-4">Filter Transactions</h3>
        <div className="flex flex-wrap gap-4 items-end">
          <select
            value={pendingFilters.category}
            onChange={(e) =>
              setPendingFilters({ ...pendingFilters, category: e.target.value })
            }
            className="border p-2 rounded dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          <div className="flex flex-col">
            <label className="text-sm text-gray-600 dark:text-gray-300 mb-1">
              From:
            </label>
            <input
              type="date"
              value={pendingFilters.startDate}
              onChange={(e) =>
                setPendingFilters({ ...pendingFilters, startDate: e.target.value })
              }
              className="border p-2 rounded dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600"
            />
          </div>

          <div className="flex flex-col">
            <label className="text-sm text-gray-600 dark:text-gray-300 mb-1">
              To:
            </label>
            <input
              type="date"
              value={pendingFilters.endDate}
              onChange={(e) =>
                setPendingFilters({ ...pendingFilters, endDate: e.target.value })
              }
              className="border p-2 rounded dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600"
            />
          </div>

          <button
            onClick={() => setFilters(pendingFilters)}
            className="bg-blue-500 text-white px-4 py-2 rounded shadow hover:bg-blue-600 dark:hover:bg-blue-700"
          >
            Apply Filters
          </button>
        </div>
      </div>

      {/* Transactions */}
      {sortedDates.length === 0 ? (
        <p className="text-center text-gray-500 dark:text-gray-400 mt-8">
          No transactions match the selected filters.
        </p>
      ) : (
        sortedDates.map((date) => (
          <div key={date} className="mb-6">
            <h3 className="text-lg font-semibold mb-2 text-gray-700 dark:text-gray-200">
              {date}
            </h3>
            <ul className="space-y-2">
              {groupedByDate[date].map((t) => (
                <li
                  key={t._id}
                  className="flex justify-between items-center bg-gray-100 dark:bg-gray-700 p-3 rounded shadow-sm"
                >
                  <div>
                    <p className="font-medium">
                      {t.type === "income" ? "💰 Income" : "💸 Expense"} -{" "}
                      {t.category}
                    </p>
                    {t.note && (
                      <p className="text-xs text-gray-500 dark:text-gray-300">
                        📝 {t.note}
                      </p>
                    )}
                  </div>
                  <span
                    className={`font-bold ${
                      t.type === "income" ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {t.type === "income" ? "+" : "-"}
                    {formatCurrency(t.amount)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ))
      )}
    </div>
  );
}

export default Budget;
