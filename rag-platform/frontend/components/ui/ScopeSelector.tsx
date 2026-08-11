"use client";

import React from "react";
import { User, Building, ShieldCheck } from "lucide-react";
import { useAuth, WorkspaceScope } from "@/context/AuthContext";
import { cn } from "@/lib/utils";

export function ScopeSelector() {
  const { user, scope, setScope } = useAuth();

  if (!user) return null;

  const hasOrg = Boolean(user.organizationId);

  return (
    <div className="flex items-center gap-1.5 p-1 neu-pressed rounded-xl">
      <button
        type="button"
        onClick={() => setScope("individual")}
        className={cn(
          "px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer",
          scope === "individual"
            ? "neu-btn-primary text-white shadow-sm"
            : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
        )}
      >
        <User className="w-3.5 h-3.5" />
        <span>Individual</span>
      </button>

      {hasOrg && (
        <button
          type="button"
          onClick={() => setScope("org")}
          className={cn(
            "px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer",
            scope === "org"
              ? "neu-btn-primary text-white shadow-sm"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
          )}
        >
          <Building className="w-3.5 h-3.5" />
          <span className="truncate max-w-[110px]">{user.organizationName || "Organization"}</span>
          <ShieldCheck className="w-3 h-3 text-emerald-400 ml-0.5" />
        </button>
      )}
    </div>
  );
}
