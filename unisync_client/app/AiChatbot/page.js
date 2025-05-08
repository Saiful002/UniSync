// components/AiChatbot.js
"use client";

import React, { useState, useEffect, useRef } from "react";

const FAQS = [
  "How to cancel a booking?",
  "How to book a seminar hall?",
  "What is the approval time?",
];

const AiChatbot = () => {
  const [messages, setMessages] = useState([
    { sender: "bot", text: "Hello! How can I assist you with room booking today?" },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const chatEndRef = useRef(null);

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
      const res = await fetch("http://localhost:5000/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ message: input }),
      });

      const data = await res.json();
      const botReply = { sender: "bot", text: data.reply };
      setMessages((prev) => [...prev, botReply]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "❌ Sorry, something went wrong. Please try again later." },
      ]);
    } finally {
      setTyping(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") sendMessage();
  };

  const handleSuggestion = (text) => {
    setInput(text);
    sendMessage();
  };

  return (
    <div className="w-full max-w-lg mx-auto bg-[#FFFFFF20] shadow-lg rounded-lg overflow-hidden">
      <div className="bg-green-600 text-white px-4 py-3 text-lg font-semibold">AI Chatbot</div>
      <div className="h-[400px] overflow-y-auto p-4 space-y-2 bg-[#FFFFFF20]">
        {messages.map((msg, index) => (
          <div key={index} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`px-4 py-2 rounded-lg text-sm max-w-[70%] ${
                msg.sender === "user" ? "bg-green-200" : "border"
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
        {typing && (
          <div className="flex justify-start">
            <div className="px-4 py-2 border rounded-lg text-sm animate-pulse">Typing...</div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      <div className="p-4 border-t">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type your message..."
          className="w-full p-2 border rounded"
        />
        <button
          onClick={sendMessage}
          className="mt-2 w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
        >
          Send
        </button>

        <div className="mt-4">
          <p className="text-sm font-medium mb-2">💡 Quick Suggestions:</p>
          <div className="flex flex-wrap gap-2">
            {FAQS.map((faq, i) => (
              <button
                key={i}
                onClick={() => handleSuggestion(faq)}
                className="text-sm px-3 py-1 rounded hover:bg-gray-300"
              >
                {faq}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AiChatbot;
