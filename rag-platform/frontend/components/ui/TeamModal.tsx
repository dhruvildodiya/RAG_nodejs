"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Users, X, UserPlus, Copy, Check, ShieldCheck, Mail } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";

interface Member {
  id: string;
  name: string;
  email: string;
  role: string;
  created_at: string;
  invite_code?: string;
  organization_name?: string;
}

interface TeamModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TeamModal({ isOpen, onClose }: TeamModalProps) {
  const { user } = useAuth();
  const [members, setMembers] = useState<Member[]>([]);
  const [inviteEmail, setInviteEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [inviteLoading, setInviteLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);

  const fetchMembers = useCallback(async () => {
    if (!isOpen || !user?.organizationId) return;
    try {
      setLoading(true);
      const res = await api.get("/auth/organization/members");
      if (Array.isArray(res.data)) {
        setMembers(res.data);
      }
    } catch (err: any) {
      console.error("Failed to fetch members:", err);
    } finally {
      setLoading(false);
    }
  }, [isOpen, user?.organizationId]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  if (!isOpen) return null;

  const inviteCode = members[0]?.invite_code || user?.organizationName?.toLowerCase().replace(/\s+/g, "-") || "";

  const handleCopyCode = () => {
    if (!inviteCode) return;
    navigator.clipboard.writeText(inviteCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;

    setError(null);
    setMessage(null);
    setInviteLoading(true);

    try {
      const res = await api.post("/auth/organization/invite", { email: inviteEmail.trim() });
      setMessage(res.data.message || "Team member invited successfully!");
      setInviteEmail("");
      await fetchMembers();
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || "Failed to invite member");
    } finally {
      setInviteLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-xl bg-white dark:bg-[#121927] border border-slate-200 dark:border-[#222b3e] rounded-3xl p-6 md:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl neu-pressed text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl neu-pressed flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-black tracking-tight text-slate-900 dark:text-white">
              {user?.organizationName || "Organization Team"}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Manage organization team members and share vector documents
            </p>
          </div>
        </div>

        {/* Invite Code Banner */}
        <div className="p-4 rounded-2xl bg-blue-50/60 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 font-mono">
              Team Invite Code
            </span>
            <div className="text-xs font-mono font-extrabold text-slate-900 dark:text-white mt-0.5">
              {inviteCode}
            </div>
          </div>

          <button
            onClick={handleCopyCode}
            className="px-3.5 py-2 rounded-xl neu-btn-primary text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shrink-0 shadow-sm"
          >
            {copiedCode ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-300" />
                <span>Copied Code</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Code</span>
              </>
            )}
          </button>
        </div>

        {/* Invite Member Form */}
        <form onSubmit={handleInviteSubmit} className="space-y-3">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <UserPlus className="w-4 h-4 text-blue-500" />
            <span>Invite Member by Email</span>
          </label>

          <div className="flex gap-2">
            <div className="relative flex-1">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="email"
                required
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="colleague@zignuts.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl neu-pressed bg-slate-50 dark:bg-[#182030] text-xs font-medium text-slate-900 dark:text-white outline-none border border-slate-200 dark:border-[#263147] focus:border-blue-500"
              />
            </div>

            <button
              type="submit"
              disabled={inviteLoading || !inviteEmail.trim()}
              className="px-5 py-2.5 rounded-xl neu-btn-primary text-xs font-bold text-white shrink-0 cursor-pointer shadow-sm disabled:opacity-50"
            >
              {inviteLoading ? "Adding..." : "Add Member"}
            </button>
          </div>

          {message && (
            <p className="text-xs text-emerald-500 font-semibold text-center">{message}</p>
          )}
          {error && (
            <p className="text-xs text-rose-500 font-semibold text-center">{error}</p>
          )}
        </form>

        {/* Members List Table */}
        <div className="space-y-2 pt-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-[#222b3e] pb-2">
            <span>Team Members ({members.length})</span>
            <span className="font-mono text-[10px] text-slate-400">Role</span>
          </div>

          {loading ? (
            <div className="p-4 text-xs text-slate-400 text-center animate-pulse">Loading members...</div>
          ) : (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {members.map((m) => (
                <div
                  key={m.id}
                  className="flex items-center justify-between p-3 rounded-xl neu-pressed bg-slate-50/50 dark:bg-[#151c2a]/50 text-xs"
                >
                  <div>
                    <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <span>{m.name}</span>
                      {m.role === "admin" && (
                        <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
                      )}
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                      {m.email}
                    </div>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold font-mono uppercase ${
                      m.role === "admin"
                        ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20"
                        : "bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20"
                    }`}
                  >
                    {m.role}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
