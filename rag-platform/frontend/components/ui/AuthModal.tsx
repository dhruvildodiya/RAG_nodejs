"use client";

import React, { useState } from "react";
import { X, User, Building, Lock, Mail, Loader2, Sparkles, LogIn } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";

import { api } from "@/lib/api";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const { login } = useAuth();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [accountType, setAccountType] = useState<"individual" | "organization">("individual");
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [organizationName, setOrganizationName] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const endpoint = mode === "login" ? "/auth/login" : "/auth/register";

    try {
      const payload = mode === "login"
        ? { email, password }
        : { email, password, name, accountType, organizationName };

      const res = await api.post(endpoint, payload);
      const data = res.data;

      login(data.token, data.user);
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md p-6 neu-flat rounded-2xl bg-white dark:bg-[#1a2333] border border-slate-200 dark:border-[#283348] shadow-2xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 neu-pressed rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-12 h-12 neu-pressed rounded-2xl flex items-center justify-center text-blue-600 dark:text-blue-400 mb-3">
            <Sparkles className="w-6 h-6 animate-pulse" />
          </div>
          <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">
            {mode === "login" ? "Welcome Back to NexusRAG" : "Create Your Account"}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {mode === "login"
              ? "Sign in to access your personal & organization knowledge base"
              : "Set up your workspace for individual or organization vector search"}
          </p>
        </div>

        {/* Mode Switcher */}
        <div className="grid grid-cols-2 gap-1.5 p-1 neu-pressed rounded-xl mb-5">
          <button
            type="button"
            onClick={() => { setMode("login"); setError(null); }}
            className={cn(
              "py-2 text-xs font-bold rounded-lg transition-all",
              mode === "login"
                ? "neu-btn-primary text-white shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
            )}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setMode("register"); setError(null); }}
            className={cn(
              "py-2 text-xs font-bold rounded-lg transition-all",
              mode === "register"
                ? "neu-btn-primary text-white shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
            )}
          >
            Sign Up
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/50 text-rose-600 dark:text-rose-400 text-xs font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "register" && (
            <>
              {/* Account Type Selection */}
              <div className="grid grid-cols-2 gap-2 mb-3">
                <button
                  type="button"
                  onClick={() => setAccountType("individual")}
                  className={cn(
                    "p-3 rounded-xl border text-left flex flex-col transition-all",
                    accountType === "individual"
                      ? "border-blue-500 bg-blue-50/50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 font-bold"
                      : "border-slate-200 dark:border-[#283348] neu-pressed text-slate-600 dark:text-slate-400"
                  )}
                >
                  <User className="w-4 h-4 mb-1" />
                  <span className="text-xs">Individual</span>
                  <span className="text-[10px] text-slate-400 font-normal">Personal documents only</span>
                </button>
                <button
                  type="button"
                  onClick={() => setAccountType("organization")}
                  className={cn(
                    "p-3 rounded-xl border text-left flex flex-col transition-all",
                    accountType === "organization"
                      ? "border-blue-500 bg-blue-50/50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 font-bold"
                      : "border-slate-200 dark:border-[#283348] neu-pressed text-slate-600 dark:text-slate-400"
                  )}
                >
                  <Building className="w-4 h-4 mb-1" />
                  <span className="text-xs">Organization</span>
                  <span className="text-[10px] text-slate-400 font-normal">Team shared documents</span>
                </button>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Jane Doe"
                    className="w-full pl-9 pr-3 py-2.5 neu-pressed rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              {accountType === "organization" && (
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Organization Name
                  </label>
                  <div className="relative">
                    <Building className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={organizationName}
                      onChange={(e) => setOrganizationName(e.target.value)}
                      placeholder="Acme Corp"
                      className="w-full pl-9 pr-3 py-2.5 neu-pressed rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>
              )}
            </>
          )}

          <div>
            <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="w-full pl-9 pr-3 py-2.5 neu-pressed rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2.5 neu-pressed rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="neu-btn-primary w-full py-3 rounded-xl text-xs font-bold text-white flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50 mt-6 shadow-md"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>Processing...</span>
              </>
            ) : mode === "login" ? (
              <>
                <LogIn className="w-4 h-4" />
                <span>Sign In</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Create Account</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
