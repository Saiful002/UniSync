"use client"
import { useState, useRef, useEffect } from "react";
import useSWRMutation from "swr/mutation";

const fetcher = async ([url, body]) => {
  const res = await fetch(`http://localhost:5000${url}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include", // includes cookies
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || "Request failed");
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

  const { trigger, data, error, isMutating } = useSWRMutation('/api/chat', fetcher);
  

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { sender: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setTyping(true);

    try {
      const data = await trigger({ message: input });
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
    <div className="max-w-md mx-auto p-4 border rounded-lg shadow">
      <div className="h-96 overflow-y-auto space-y-2 mb-4 bg-gray-100 p-2 rounded">
        {messages.map((msg, i) => (
          <div key={i} className={`text-sm ${msg.sender === "user" ? "text-right" : "text-left"}`}>
            <span className={`inline-block p-2 rounded ${msg.sender === "user" ? "bg-blue-200" : "bg-green-200"}`}>
              {msg.text}
            </span>
          </div>
        ))}
        {typing && <div className="text-gray-500">Bot is typing...</div>}
        <div ref={chatEndRef} />
      </div>
      <input
        type="text"
        className="w-full border px-3 py-2 rounded"
        value={input}
        placeholder="Type your message..."
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyPress}
      />
      <button className="mt-2 w-full bg-blue-500 text-white p-2 rounded" onClick={sendMessage}>
        Send
      </button>
    </div>
  );
}
