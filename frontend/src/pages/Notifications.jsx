import { useEffect, useState } from "react";
import axios from "axios";

function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/notifications", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setNotifications(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchNotifications();
  }, [token]);

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4 dark:text-gray-100">Notifications</h2>

      {notifications.length === 0 ? (
        <p className="text-center text-gray-500 dark:text-gray-400 mt-4">
          You have no notifications.
        </p>
      ) : (
        <ul className="space-y-2">
          {notifications.map((n) => (
            <li
              key={n._id}
              className={`p-3 rounded shadow 
                ${n.read ? "bg-gray-200 dark:bg-gray-700" : "bg-yellow-100 dark:bg-yellow-800"} 
                dark:text-gray-100`}
            >
              {n.message}
              <span className="text-gray-500 dark:text-gray-400 text-sm block">
                {new Date(n.createdAt).toLocaleString()}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default Notifications;
