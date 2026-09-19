"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { 
  User, 
  Mail, 
  Tag, 
  MessageSquare, 
  Send, 
  CheckCircle2, 
  XCircle, 
  Headphones 
} from "lucide-react";

export default function ContactAdmin() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [toast, setToast] = useState(null);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!form.name) newErrors.name = "Name is required";
    if (!form.email) newErrors.email = "Email is required";
    if (!form.subject) newErrors.subject = "Subject is required";
    if (!form.message) newErrors.message = "Message is required";

    if (Object.keys(newErrors).length > 0) return setErrors(newErrors);
    setErrors({});
    setIsSubmitting(true);

    try {
      const res = await fetch("http://localhost:5000/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        setToast({ type: "success", text: "Message submitted successfully! Admin will respond shortly." });
        setForm({ name: "", email: "", subject: "", message: "" });
        setTimeout(() => setToast(null), 4000);
      } else {
        setToast({ type: "error", text: "Failed to send message. Please try again." });
        setTimeout(() => setToast(null), 4000);
      }
    } catch (error) {
      setToast({ type: "error", text: "Server error occurred while dispatching message." });
      setTimeout(() => setToast(null), 4000);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 space-y-8">
      {/* Header */}
      <div className="text-center max-w-xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-950/60 border border-emerald-500/20 text-emerald-300 text-xs font-semibold uppercase tracking-wider">
          <Headphones className="w-3.5 h-3.5 text-emerald-400" />
          <span>Campus Administrator Support</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white">
          Contact <span className="bg-gradient-to-r from-[#6ADB6A] to-emerald-400 bg-clip-text text-transparent">Administration</span>
        </h1>
        <p className="text-emerald-100/70 text-sm sm:text-base">
          Have special room requirements, schedule clashes, or technical issues? Send a direct message to university administrators.
        </p>
      </div>

      {/* Glassmorphic Form Card */}
      <div className="glass-panel p-6 sm:p-10 rounded-3xl border-emerald-500/20 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Name */}
            <div className="space-y-2">
              <label className="block text-xs uppercase tracking-wider font-semibold text-emerald-300 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-emerald-400" />
                <span>Full Name</span>
              </label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="John Doe"
                className="w-full glass-input p-3.5 rounded-xl text-sm border-emerald-500/20 text-white placeholder-emerald-400/40"
              />
              {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label className="block text-xs uppercase tracking-wider font-semibold text-emerald-300 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-emerald-400" />
                <span>Email Address</span>
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="john.doe@university.edu"
                className="w-full glass-input p-3.5 rounded-xl text-sm border-emerald-500/20 text-white placeholder-emerald-400/40"
              />
              {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
            </div>
          </div>

          {/* Subject */}
          <div className="space-y-2">
            <label className="block text-xs uppercase tracking-wider font-semibold text-emerald-300 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-emerald-400" />
              <span>Subject</span>
            </label>
            <input
              name="subject"
              value={form.subject}
              onChange={handleChange}
              placeholder="e.g. Special Seminar Room Reservation Query"
              className="w-full glass-input p-3.5 rounded-xl text-sm border-emerald-500/20 text-white placeholder-emerald-400/40"
            />
            {errors.subject && <p className="text-red-400 text-xs mt-1">{errors.subject}</p>}
          </div>

          {/* Message */}
          <div className="space-y-2">
            <label className="block text-xs uppercase tracking-wider font-semibold text-emerald-300 flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
              <span>Message</span>
            </label>
            <textarea
              name="message"
              value={form.message}
              onChange={handleChange}
              rows="5"
              placeholder="Describe your request or issue in detail..."
              className="w-full glass-input p-3.5 rounded-xl text-sm border-emerald-500/20 text-white placeholder-emerald-400/40 resize-none"
            />
            {errors.message && <p className="text-red-400 text-xs mt-1">{errors.message}</p>}
          </div>

          {/* Toast Notification */}
          {toast && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-4 rounded-xl border flex items-center gap-3 text-sm font-semibold ${
                toast.type === "success"
                  ? "bg-emerald-950/80 border-emerald-500 text-emerald-300"
                  : "bg-red-950/80 border-red-500 text-red-300"
              }`}
            >
              {toast.type === "success" ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
              ) : (
                <XCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
              )}
              <span>{toast.text}</span>
            </motion.div>
          )}

          {/* Submit Button */}
          <div className="pt-2 flex justify-end">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              disabled={isSubmitting}
              type="submit"
              className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-[#02B81C] to-emerald-500 hover:from-emerald-500 hover:to-[#02B81C] text-white font-bold rounded-xl shadow-xl shadow-emerald-950/50 flex items-center justify-center gap-2.5 transition-all duration-300 disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span>{isSubmitting ? "Sending..." : "Submit Message"}</span>
            </motion.button>
          </div>
        </form>
      </div>
    </div>
  );
}
