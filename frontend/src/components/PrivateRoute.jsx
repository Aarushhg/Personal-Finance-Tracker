import { Navigate } from "react-router-dom";

export default function PrivateRoute({ children }) {
  // Check if token exists in localStorage
  const token = localStorage.getItem("token");
  console.log(token); 

  // If token is missing, redirect to login
  if (!token) return <Navigate to="/login" replace />;

  // If token exists, allow access
  return children;
}
