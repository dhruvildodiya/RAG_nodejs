import React, { useState } from "react";
import { User, Building, ShieldCheck, Plus, Users } from "lucide-react";
import { useAuth, WorkspaceScope } from "@/context/AuthContext";
import { cn } from "@/lib/utils";
import { CreateOrgModal } from "./CreateOrgModal";
import { TeamModal } from "./TeamModal";

export function ScopeSelector() {
  const { user, scope, setScope } = useAuth();
  const [isOrgModalOpen, setIsOrgModalOpen] = useState(false);
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);

  if (!user) return null;

  const hasOrg = Boolean(user.organizationId);

  return (
    <>
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

        {hasOrg ? (
          <div className="flex items-center gap-1">
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

            <button
              type="button"
              onClick={() => setIsTeamModalOpen(true)}
              className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title="Manage Team & Invite Members"
            >
              <Users className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setIsOrgModalOpen(true)}
            className="px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-all text-blue-600 dark:text-blue-400 hover:bg-blue-500/10 cursor-pointer"
            title="Create or join an organization"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Org</span>
          </button>
        )}
      </div>

      <CreateOrgModal
        isOpen={isOrgModalOpen}
        onClose={() => setIsOrgModalOpen(false)}
      />

      <TeamModal
        isOpen={isTeamModalOpen}
        onClose={() => setIsTeamModalOpen(false)}
      />
    </>
  );
}
