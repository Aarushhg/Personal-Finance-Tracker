import { Link } from "react-router-dom";
import DarkModeToggle from "./DarkModeToggle";

export default function Navbar() {
  const token = localStorage.getItem("token");

  return (
    <nav className="bg-gray-900 text-white px-6 py-4 flex justify-between items-center shadow-md dark:bg-gray-800 dark:text-gray-200">
      
      {/* Logo instead of Finance Tracker */}
      <Link to="/dashboard" className="flex items-center">
        <img 
          src="/Cashly.png" 
          alt="Cashly Logo" 
          className="h-12 w-auto object-contain" // 👈 adjust height as needed
        />
      </Link>
      
      <div className="flex items-center space-x-6">
        <Link to="/dashboard" className="hover:text-yellow-400">Dashboard</Link>
        <Link to="/notifications" className="hover:text-yellow-400">Notifications</Link>
        <Link to="/transactions" className="hover:text-yellow-400">Transaction</Link>
        <Link to="/budget" className="hover:text-yellow-400">History</Link>
        <Link to="/budgets" className="hover:text-yellow-400">Budgets</Link>
        <Link to="/goals" className="hover:text-yellow-400">Goals</Link>
        <Link to="/ai-assistant" className="hover:text-yellow-400">AI Assistant</Link>
        <Link to="/profile" className="hover:text-yellow-400">Profile</Link>
        {!token && (
          <Link to="/login" className="hover:text-yellow-400">Login</Link>
        )}
        
        <DarkModeToggle />
      </div>
    </nav>
  );
}

