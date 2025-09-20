import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", {
        email,
        password,
      });
      // Save JWT and user info in localStorage
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      // Redirect to dashboard, then refresh to update Navbar
      navigate("/dashboard");
      setTimeout(() => {
        window.location.reload();
      }, 300); // small delay so navigation completes first
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 bg-white dark:bg-gray-900 p-6 rounded shadow dark:text-gray-100">
      <h2 className="text-2xl font-bold mb-4">🔑 Login</h2>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-2 border rounded bg-white dark:bg-gray-700 dark:text-white border-gray-300 dark:border-gray-600 placeholder-gray-700 dark:placeholder-gray-400"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-2 border rounded bg-white dark:bg-gray-700 dark:text-white border-gray-300 dark:border-gray-600 placeholder-gray-700 dark:placeholder-gray-400"
          required
        />
        <button
          type="submit"
          className="w-full bg-yellow-400 text-black py-2 rounded font-bold hover:bg-yellow-500"
        >
          Login
        </button>
      </form>

      <p className="text-sm text-gray-600 mt-4 text-center dark:text-gray-400">
        Don’t have an account?{" "}
        <Link
          to="/register"
          className="text-yellow-500 hover:underline font-medium"
        >
          Register
        </Link>
      </p>

      {error && <p className="text-red-500 mt-2 dark:text-red-400">{error}</p>}
    </div>
  );
}
