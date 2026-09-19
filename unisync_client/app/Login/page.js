"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Mail, 
  Lock, 
  LogIn, 
  AlertCircle, 
  CheckCircle2, 
  User, 
  ShieldCheck, 
  KeyRound, 
  ArrowLeft,
  RefreshCw
} from "lucide-react";
import BrandLogo from "../components/BrandLogo";
import LoginThreeBackground from "../components/LoginThreeBackground";

export default function Login() {
  const [role, setRole] = useState("user"); // 'user' or 'admin'
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Forgot Password Modal State
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotStep, setForgotStep] = useState(1); // 1: Email, 2: Reset Code & New Password
  const [resetCode, setResetCode] = useState("");
  const [enteredCode, setEnteredCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [forgotMsg, setForgotMsg] = useState(null);
  const [isForgotLoading, setIsForgotLoading] = useState(false);

  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");

    try {
      const res = await fetch("http://localhost:5000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password, role }),
      });

      const data = await res.json();

      if (res.ok) {
        setIsSuccess(true);
        const targetPath = role === "admin" ? "/AdminPanel" : "/";
        setMessage(`Login Successful as ${role === "admin" ? "Admin" : "User"}! Redirecting...`);
        
        setTimeout(() => {
          window.location.href = targetPath;
        }, 1000);
      } else {
        setIsSuccess(false);
        setMessage(data.message || "Invalid credentials for selected role. Please try again.");
      }
    } catch (err) {
      console.error(err);
      setIsSuccess(false);
      setMessage("Server error. Please verify backend database service.");
    } finally {
      setIsLoading(false);
    }
  };

  // Step 1: Request Password Reset
  const handleRequestReset = async (e) => {
    e.preventDefault();
    setIsForgotLoading(true);
    setForgotMsg(null);

    try {
      const res = await fetch("http://localhost:5000/api/admin/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail }),
      });
      const data = await res.json();

      if (res.ok) {
        setResetCode(data.resetCode);
        setForgotStep(2);
        setForgotMsg({ type: "success", text: `Verification code generated: ${data.resetCode}` });
      } else {
        setForgotMsg({ type: "error", text: data.message || "Email not found in database." });
      }
    } catch (error) {
      setForgotMsg({ type: "error", text: "Server error initiating password reset." });
    } finally {
      setIsForgotLoading(false);
    }
  };

  // Step 2: Confirm Reset Code & Submit New Password
  const handleConfirmReset = async (e) => {
    e.preventDefault();
    if (enteredCode !== resetCode) {
      setForgotMsg({ type: "error", text: "Invalid verification code. Please check again." });
      return;
    }

    setIsForgotLoading(true);
    setForgotMsg(null);

    try {
      const res = await fetch("http://localhost:5000/api/admin/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail, newPassword: newPassword }),
      });
      const data = await res.json();

      if (res.ok) {
        setForgotMsg({ type: "success", text: "Password reset successfully! Redirecting to login..." });
        setTimeout(() => {
          setShowForgotModal(false);
          setForgotStep(1);
          setForgotMsg(null);
        }, 1800);
      } else {
        setForgotMsg({ type: "error", text: data.message || "Failed to update password." });
      }
    } catch (error) {
      setForgotMsg({ type: "error", text: "Server error updating password." });
    } finally {
      setIsForgotLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 sm:px-6 py-12 relative overflow-hidden">
      {/* 3D Full-Page Floating Bubble Animation Canvas */}
      <LoginThreeBackground />

      {/* Dark Ambient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#050806]/85 via-transparent to-[#050806]/90 z-0 pointer-events-none" />

      {/* Main Glassmorphic Login Card */}
      <motion.div
        initial={{ opacity: 0, y: 25, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md glass-panel p-8 sm:p-10 rounded-3xl border-emerald-500/30 shadow-2xl shadow-black/90 space-y-7 relative z-10 bg-[#080d09]/90"
      >
        {/* Header Logo */}
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <BrandLogo size="lg" />
          </div>
          <h2 className="text-2xl font-extrabold text-white">Sign In to UniSync</h2>
          <p className="text-xs text-emerald-200/70">
            Select your portal role to access database services
          </p>
        </div>

        {/* Role Switcher Tabs */}
        <div className="grid grid-cols-2 gap-2 p-1.5 rounded-2xl bg-[#040605] border border-emerald-500/20">
          <button
            type="button"
            onClick={() => setRole("user")}
            className={`py-2.5 px-4 rounded-xl text-xs font-bold transition-all duration-300 flex items-center justify-center gap-2 ${
              role === "user"
                ? "bg-gradient-to-r from-emerald-600 to-green-500 text-white shadow-lg shadow-emerald-950/60"
                : "text-emerald-200/60 hover:text-white"
            }`}
          >
            <User className="w-4 h-4" />
            <span>User Portal</span>
          </button>

          <button
            type="button"
            onClick={() => setRole("admin")}
            className={`py-2.5 px-4 rounded-xl text-xs font-bold transition-all duration-300 flex items-center justify-center gap-2 ${
              role === "admin"
                ? "bg-gradient-to-r from-emerald-600 to-green-500 text-white shadow-lg shadow-emerald-950/60"
                : "text-emerald-200/60 hover:text-white"
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Admin Portal</span>
          </button>
        </div>

        {/* Role Subtext Banner */}
        <div className="px-4 py-2 rounded-xl bg-emerald-950/40 border border-emerald-500/20 text-center text-xs font-medium text-emerald-300">
          {role === "admin" ? (
            <span>🛡️ Admin Mode: Authenticate from DB & manage system approvals</span>
          ) : (
            <span>🎓 Student Mode: Browse rooms, check schedules & submit requests</span>
          )}
        </div>

        {/* Credentials Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          {/* Email Input */}
          <div className="space-y-1.5">
            <label className="block text-xs uppercase tracking-wider font-semibold text-emerald-300 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-emerald-400" />
              <span>{role === "admin" ? "Admin Email" : "Campus Email"}</span>
            </label>
            <input
              type="email"
              className="w-full glass-input p-3.5 rounded-xl text-sm border-emerald-500/20 text-white placeholder-emerald-400/40"
              placeholder={role === "admin" ? "admin@university.edu" : "student@university.edu"}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {/* Password Input */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs uppercase tracking-wider font-semibold text-emerald-300 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-emerald-400" />
                <span>Password</span>
              </label>

              {/* Forgot Password Trigger */}
              <button
                type="button"
                onClick={() => {
                  setForgotEmail(email);
                  setShowForgotModal(true);
                }}
                className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold underline underline-offset-2 transition"
              >
                Forgot Password?
              </button>
            </div>

            <input
              type="password"
              className="w-full glass-input p-3.5 rounded-xl text-sm border-emerald-500/20 text-white placeholder-emerald-400/40"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {/* Submit Action */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={isLoading}
            type="submit"
            className="w-full mt-2 py-4 bg-gradient-to-r from-[#02B81C] to-emerald-500 hover:from-emerald-500 hover:to-[#02B81C] text-white font-bold rounded-xl shadow-xl shadow-emerald-950/60 flex items-center justify-center gap-2 text-sm transition-all duration-300 disabled:opacity-50"
          >
            <LogIn className="w-4 h-4" />
            <span>
              {isLoading
                ? "Authenticating..."
                : `Login as ${role === "admin" ? "Administrator" : "User"}`}
            </span>
          </motion.button>
        </form>

        {/* Toast Alert Message */}
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-4 rounded-xl border flex items-center gap-3 text-xs font-semibold ${
              isSuccess
                ? "bg-emerald-950/90 border-emerald-500 text-emerald-300"
                : "bg-red-950/90 border-red-500 text-red-300"
            }`}
          >
            {isSuccess ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
            )}
            <span>{message}</span>
          </motion.div>
        )}
      </motion.div>

      {/* Forgot Password Modal */}
      <AnimatePresence>
        {showForgotModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="w-full max-w-md glass-panel p-6 sm:p-8 rounded-3xl border-emerald-500/30 shadow-2xl space-y-6 bg-[#080d09] relative"
            >
              <div className="flex items-center justify-between border-b border-emerald-500/15 pb-4">
                <div className="flex items-center gap-2">
                  <KeyRound className="w-5 h-5 text-emerald-400" />
                  <h3 className="text-lg font-bold text-white">Reset Account Password</h3>
                </div>
                <button
                  onClick={() => setShowForgotModal(false)}
                  className="p-1 text-emerald-400/60 hover:text-white rounded-lg"
                >
                  ✕
                </button>
              </div>

              {forgotStep === 1 ? (
                <form onSubmit={handleRequestReset} className="space-y-4">
                  <p className="text-xs text-emerald-100/70">
                    Enter your registered email address to verify account and generate password reset token.
                  </p>
                  <div className="space-y-1.5">
                    <label className="block text-xs uppercase tracking-wider font-semibold text-emerald-300">
                      Registered Email
                    </label>
                    <input
                      type="email"
                      required
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      placeholder="admin@university.edu"
                      className="w-full glass-input p-3 rounded-xl text-sm border-emerald-500/20 text-white"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isForgotLoading}
                    className="w-full py-3 bg-gradient-to-r from-emerald-600 to-green-500 text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2"
                  >
                    <RefreshCw className={`w-4 h-4 ${isForgotLoading ? "animate-spin" : ""}`} />
                    <span>{isForgotLoading ? "Verifying Email..." : "Generate Reset Code"}</span>
                  </button>
                </form>
              ) : (
                <form onSubmit={handleConfirmReset} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs uppercase tracking-wider font-semibold text-emerald-300">
                      Enter Reset Code
                    </label>
                    <input
                      type="text"
                      required
                      value={enteredCode}
                      onChange={(e) => setEnteredCode(e.target.value)}
                      placeholder="e.g. 894201"
                      className="w-full glass-input p-3 rounded-xl text-sm border-emerald-500/20 text-white tracking-widest font-mono text-center"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs uppercase tracking-wider font-semibold text-emerald-300">
                      New Password
                    </label>
                    <input
                      type="password"
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password"
                      className="w-full glass-input p-3 rounded-xl text-sm border-emerald-500/20 text-white"
                    />
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setForgotStep(1)}
                      className="px-4 py-3 glass-card text-emerald-200 text-xs font-semibold rounded-xl flex items-center gap-1"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" /> Back
                    </button>
                    <button
                      type="submit"
                      disabled={isForgotLoading}
                      className="flex-1 py-3 bg-gradient-to-r from-emerald-600 to-green-500 text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2"
                    >
                      <span>{isForgotLoading ? "Updating..." : "Update Password"}</span>
                    </button>
                  </div>
                </form>
              )}

              {forgotMsg && (
                <div
                  className={`p-3 rounded-xl border text-xs font-semibold flex items-center gap-2 ${
                    forgotMsg.type === "success"
                      ? "bg-emerald-950/90 border-emerald-500 text-emerald-300"
                      : "bg-red-950/90 border-red-500 text-red-300"
                  }`}
                >
                  {forgotMsg.type === "success" ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                  )}
                  <span>{forgotMsg.text}</span>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
