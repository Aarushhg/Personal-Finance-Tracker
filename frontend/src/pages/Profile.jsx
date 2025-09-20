import { useEffect, useState } from "react";
import axios from "axios";
import countries from "../utils/countries.json";

function Profile() {
  const [user, setUser] = useState(null);
  const [name, setName] = useState("");
  const [country, setCountry] = useState("India");
  const [currency, setCurrency] = useState("INR");
  const token = localStorage.getItem("token");

  useEffect(() => {
    // Safely load user from localStorage
    const storedUser = localStorage.getItem("user");
    if (storedUser && storedUser !== "undefined") {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setName(parsedUser.name || "");
        setCountry(parsedUser.country ?? "India");   // ✅ safer fallback
        setCurrency(parsedUser.currency ?? "INR");   // ✅ safer fallback
      } catch (err) {
        console.error("Error parsing user from localStorage:", err);
      }
    }

    // Fetch latest profile from backend (if token exists)
    const fetchProfile = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/auth/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const profile = res.data.user || res.data;

        setUser(profile);
        setName(profile.name || "");
        setCountry(profile.country ?? country);   // ✅ don’t override with India if missing
        setCurrency(profile.currency ?? currency);

        localStorage.setItem("user", JSON.stringify(profile));
      } catch (err) {
        console.error("Error fetching profile:", err);
      }
    };

    if (token) {
      fetchProfile();
    }
  }, [token]);

  const handleCountryChange = (e) => {
    const selectedCountry = e.target.value;
    setCountry(selectedCountry);

    // Auto update currency based on selected country
    const countryData = countries.find((c) => c.name === selectedCountry);
    if (countryData) setCurrency(countryData.currency);
  };

  const handleSave = async () => {
    try {
      const res = await axios.put(
        "http://localhost:5000/api/auth/profile",
        { name, country, currency },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setUser(res.data.user);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      alert("Profile updated successfully!");
    } catch (err) {
      console.error("Error updating profile:", err);
      alert("Error updating profile");
    }
  };

  return (
    <div className="max-w-xl mx-auto bg-white dark:bg-gray-800 p-6 rounded shadow">
      <h2 className="text-2xl font-bold mb-6 dark:text-gray-100">Profile</h2>

      <div className="mb-4">
        <label className="block text-gray-700 dark:text-gray-300 mb-1">Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border p-2 rounded bg-white dark:bg-gray-700 dark:text-white border-gray-300 dark:border-gray-600 placeholder-gray-700 dark:placeholder-gray-400"
        />
      </div>

      <div className="mb-4">
        <label className="block text-gray-700 dark:text-gray-300 mb-1">Email</label>
        <input
          type="text"
          value={user?.email || ""}
          disabled
          className="w-full border p-2 rounded bg-gray-100 dark:bg-gray-600 dark:text-gray-200 border-gray-300 dark:border-gray-600"
        />
      </div>

      <div className="mb-4">
        <label className="block text-gray-700 dark:text-gray-300 mb-1">Country</label>
        <select
          value={country}
          onChange={handleCountryChange}
          className="w-full border p-2 rounded bg-white dark:bg-gray-700 dark:text-white border-gray-300 dark:border-gray-600"
        >
          {countries.map((c) => (
            <option key={c.code} value={c.name}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-6">
        <label className="block text-gray-700 dark:text-gray-300 mb-1">Currency</label>
        <input
          type="text"
          value={currency}
          disabled
          className="w-full border p-2 rounded bg-gray-100 dark:bg-gray-600 dark:text-gray-200 border-gray-300 dark:border-gray-600"
        />
      </div>

      <button
        onClick={handleSave}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Save Changes
      </button>
    </div>
  );
}

export default Profile;
