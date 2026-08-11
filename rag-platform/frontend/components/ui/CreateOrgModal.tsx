"use client";

import React, { useState } from "react";
import { Building, X, Sparkles } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";

interface CreateOrgModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateOrgModal({ isOpen, onClose }: CreateOrgModalProps) {
  const { login } = useAuth();
  const [mode, setMode] = useState<"create" | "join">("create");
  const [organizationName, setOrganizationName] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === "create") {
        const res = await api.post("/auth/organization", { organizationName });
        login(res.data.token, res.data.user);
      } else {
        const res = await api.post("/auth/organization/join", { inviteCode });
        login(res.data.token, res.data.user);
      }
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || "Operation failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-md bg-white dark:bg-[#121927] border border-slate-200 dark:border-[#222b3e] rounded-3xl p-6 md:p-8 shadow-2xl space-y-5">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl neu-pressed text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex flex-col items-center text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl neu-pressed flex items-center justify-center text-blue-600 dark:text-blue-400">
            <Building className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-black tracking-tight text-slate-900 dark:text-white">
            Organization Setup
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Create a new team workspace or join an existing organization
          </p>
        </div>

        {/* Mode Switcher */}
        <div className="grid grid-cols-2 p-1 neu-pressed rounded-xl">
          <button
            type="button"
            onClick={() => setMode("create")}
            className={`py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              mode === "create" ? "neu-btn-primary text-white shadow-sm" : "text-slate-600 dark:text-slate-400"
            }`}
          >
            Create New Org
          </button>
          <button
            type="button"
            onClick={() => setMode("join")}
            className={`py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              mode === "join" ? "neu-btn-primary text-white shadow-sm" : "text-slate-600 dark:text-slate-400"
            }`}
          >
            Join Existing Org
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs font-semibold text-rose-500 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "create" ? (
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Organization Name
              </label>
              <input
                type="text"
                required
                value={organizationName}
                onChange={(e) => setOrganizationName(e.target.value)}
                placeholder="e.g. Zignuts Technolab"
                className="w-full px-4 py-2.5 rounded-xl neu-pressed bg-slate-50 dark:bg-[#182030] text-xs font-medium text-slate-900 dark:text-white outline-none border border-slate-200 dark:border-[#263147] focus:border-blue-500"
              />
            </div>
          ) : (
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Organization Invite Code
              </label>
              <input
                type="text"
                required
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value)}
                placeholder="e.g. zignuts-technolab"
                className="w-full px-4 py-2.5 rounded-xl neu-pressed bg-slate-50 dark:bg-[#182030] text-xs font-mono font-medium text-slate-900 dark:text-white outline-none border border-slate-200 dark:border-[#263147] focus:border-blue-500"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading || (mode === "create" ? !organizationName.trim() : !inviteCode.trim())}
            className="w-full py-3 rounded-xl neu-btn-primary text-xs font-extrabold text-white flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-blue-500/20 disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4" />
            <span>
              {loading
                ? "Processing..."
                : mode === "create"
                ? "Create & Switch Workspace"
                : "Join & Switch Workspace"}
            </span>
          </button>
        </form>
      </div>
    </div>
  );
}
