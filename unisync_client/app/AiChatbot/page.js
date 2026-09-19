"use client";

import { useState, useRef, useEffect } from "react";
import useSWR from "swr";
import useSWRMutation from "swr/mutation";
import { SendHorizonal, Bot, User, Sparkles, MessageCircleCode } from "lucide-react";
import { motion } from "framer-motion";

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
    { 
      sender: "bot", 
      text: "Hello! I am your UniSync AI Assistant. How can I assist you with university room bookings or schedule inquiries today?" 
    },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const chatEndRef = useRef(null);

  const { trigger } = useSWRMutation("/api/chat", postFetcher);
  const { data: user } = useSWR("/api/me", getFetcher);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { sender: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);
    const currentInput = input;
    setInput("");
    setTyping(true);

    try {
      const userEmail = user?.email || "student@unisync.edu";
      const data = await trigger({ message: currentInput, user_email: userEmail });
      const botReply = { sender: "bot", text: data.reply };
      setMessages((prev) => [...prev, botReply]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: `I am currently in offline mode or unable to connect. (${error.message})` },
      ]);
    } finally {
      setTyping(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") sendMessage();
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 space-y-6">
      {/* Title */}
      <div className="text-center max-w-xl mx-auto space-y-2">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-950/60 border border-emerald-500/20 text-emerald-300 text-xs font-semibold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
          <span>Intelligent AI Assistant</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white">
          UniSync <span className="bg-gradient-to-r from-[#6ADB6A] to-emerald-400 bg-clip-text text-transparent">AI Chatbot</span>
        </h1>
      </div>

      {/* Main Messenger Glass Card */}
      <div className="glass-panel rounded-3xl border-emerald-500/20 shadow-2xl overflow-hidden flex flex-col h-[600px] relative">
        {/* Header Bar */}
        <div className="p-4 sm:p-5 border-b border-emerald-500/15 bg-emerald-950/40 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center text-white shadow-md shadow-emerald-900/40">
                <Bot className="w-5 h-5" />
              </div>
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 border-2 border-[#031109] rounded-full" />
            </div>
            <div>
              <h2 className="font-bold text-white text-base">UniSync AI Companion</h2>
              <span className="text-xs text-emerald-400 font-medium">Online & Ready to Help</span>
            </div>
          </div>

          <div className="px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
            v2.4 Smart AI
          </div>
        </div>

        {/* Message Container */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.25 }}
              className={`flex items-start gap-3 ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
            >
              {msg.sender === "bot" && (
                <div className="w-8 h-8 rounded-xl bg-emerald-900/80 border border-emerald-500/30 flex items-center justify-center text-emerald-300 flex-shrink-0 mt-0.5">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-md px-5 py-3.5 rounded-2xl text-sm leading-relaxed shadow-lg ${
                  msg.sender === "user"
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-tr-xs"
                    : "glass-card text-emerald-100 border-emerald-500/20 rounded-tl-xs"
                }`}
              >
                {msg.text}
              </div>

              {msg.sender === "user" && (
                <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white flex-shrink-0 mt-0.5">
                  <User className="w-4 h-4" />
                </div>
              )}
            </motion.div>
          ))}

          {typing && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-3 text-emerald-400/80 text-xs font-semibold pl-2"
            >
              <div className="w-7 h-7 rounded-xl bg-emerald-950 border border-emerald-500/30 flex items-center justify-center">
                <Bot className="w-3.5 h-3.5 animate-pulse" />
              </div>
              <span>AI is thinking & analyzing room database...</span>
            </motion.div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Input Footer Bar */}
        <div className="p-4 border-t border-emerald-500/15 bg-emerald-950/40">
          <div className="flex items-center gap-3">
            <input
              type="text"
              className="flex-1 glass-input px-5 py-3.5 rounded-2xl text-sm border-emerald-500/20 text-white placeholder-emerald-400/40"
              value={input}
              placeholder="Ask about room availability, schedules, or amenities..."
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-3.5 bg-gradient-to-r from-[#02B81C] to-emerald-500 hover:from-emerald-500 hover:to-[#02B81C] text-white rounded-2xl shadow-lg shadow-emerald-950/50 transition-all flex items-center justify-center"
              onClick={sendMessage}
            >
              <SendHorizonal className="w-5 h-5" />
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
}
