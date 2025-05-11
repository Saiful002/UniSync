"use client"
import { useState, useRef, useEffect } from "react";
import useSWR from "swr";
import useSWRMutation from "swr/mutation";
import { SendHorizonal, Bot, User } from "lucide-react"; // Icons from lucide-react

export const postFetcher = async (url, { arg }) => {
  const res = await fetch(`http://localhost:5000${url}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(arg),
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || "Request failed");
  }

  return res.json();
};

export const getFetcher = async (url) => {
  const res = await fetch(`http://localhost:5000${url}`, {
    credentials: "include",
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || "Failed to fetch");
  }

  return res.json();
};

export default function ChatBot() {
  const [messages, setMessages] = useState([
    { sender: "bot", text: "Hello! How can I assist you with room booking today?" },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const chatEndRef = useRef(null);

  const { trigger } = useSWRMutation("/api/chat", postFetcher);
  const { data: user } = useSWR("/api/me", getFetcher);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { sender: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setTyping(true);

    try {
      const data = await trigger({ message: input, user_email: user.email });
      const botReply = { sender: "bot", text: data.reply };
      setMessages((prev) => [...prev, botReply]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: `❌ ${error.message}` },
      ]);
    } finally {
      setTyping(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") sendMessage();
  };

  return (
    <div className="max-w-md mx-auto mt-32 p-4 border rounded-2xl shadow-lg bg-[#FFFFFF20]">
      <div className="h-96 overflow-y-auto space-y-4 mb-4 p-3 rounded-lg">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-xs px-4 py-2 rounded-xl shadow-sm text-sm flex items-start gap-2
              ${msg.sender === "user" ? "bg-blue-500 text-white" : "bg-green-100 text-gray-800"}`}>
              {msg.sender === "bot" && <Bot className="w-4 h-4 mt-1 text-green-600" />}
              {msg.sender === "user" && <User className="w-4 h-4 mt-1 text-white" />}
              <span>{msg.text}</span>
            </div>
          </div>
        ))}
        {typing && <div className="text-gray-400 text-sm">🤖 Bot is typing...</div>}
        <div ref={chatEndRef} />
      </div>

      <div className="flex items-center gap-2">
        <input
          type="text"
          className="flex-1 border border-gray-300 px-4 py-2 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-400"
          value={input}
          placeholder="Type your message..."
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyPress}
        />
        <button
          className="bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600 transition"
          onClick={sendMessage}
        >
          <SendHorizonal className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
