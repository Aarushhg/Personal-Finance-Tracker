import { useState } from "react";
import axios from "axios";

function AIAssistant() {
  const [messages, setMessages] = useState([
    { role: "system", text: "Hello! I am your AI finance assistant." },
  ]);
  const [input, setInput] = useState("");
  const token = localStorage.getItem("token");

  const sendMessage = async () => {
    if (!input) return;

    // Add user message locally
    const newMessages = [...messages, { role: "user", text: input }];
    setMessages(newMessages);
    setInput("");

    try {
      // Send both messages + latest input
      const res = await axios.post(
        "http://localhost:5000/api/ai/chat",
        { input, messages: newMessages },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Add AI response to chat
      setMessages((prev) => [
        ...prev,
        { role: "ai", text: res.data.reply || "No response from AI." },
      ]);
    } catch (err) {
      console.error("AI chat error:", err.response?.data || err.message);
      setMessages((prev) => [
        ...prev,
        { role: "ai", text: "Sorry, something went wrong." },
      ]);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-4">
      <h2 className="text-2xl font-bold mb-4 dark:text-gray-100">AI Assistant</h2>

      {/* Chat Window */}
      <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded shadow h-96 overflow-y-auto flex flex-col gap-2">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`p-2 rounded ${
              msg.role === "user"
                ? "bg-blue-200 text-blue-900 self-end dark:bg-blue-700 dark:text-blue-100"
                : msg.role === "ai"
                ? "bg-green-200 text-green-900 self-start dark:bg-green-700 dark:text-green-100"
                : "bg-gray-200 text-gray-900 self-start dark:bg-gray-700 dark:text-gray-100"
            }`}
          >
            {msg.text}
          </div>
        ))}
      </div>

      {/* Input Box */}
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask me about your spending..."
          className="flex-1 border p-2 rounded dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600"
        />
        <button
          onClick={sendMessage}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Send
        </button>
      </div>
    </div>
  );
}

export default AIAssistant;
