"use client";

import React, { useState } from "react";
import { Cpu, FileText, MessageSquare, Database, Layers, User as UserIcon, LogOut, LogIn } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { useAuth } from "@/context/AuthContext";
import { ScopeSelector } from "./ScopeSelector";
import { AuthModal } from "./AuthModal";
import { cn } from "@/lib/utils";

interface NavbarProps {
  activeTab: "chat" | "documents";
  setActiveTab: (tab: "chat" | "documents") => void;
  documentCount: number;
  onExitDemo?: () => void;
}

export function Navbar({ activeTab, setActiveTab, documentCount, onExitDemo }: NavbarProps) {
  const { user, logout } = useAuth();
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  return (
    <>
      <header className="h-16 md:h-20 border-b border-slate-200 dark:border-[#222b3e] bg-white dark:bg-[#181f2e] flex items-center justify-between px-3 pl-14 lg:pl-6 md:px-8 z-30 relative shrink-0 gap-2 transition-colors duration-200">
        <div
          onClick={onExitDemo}
          className={cn(
            "flex items-center gap-2 md:gap-3 min-w-0",
            onExitDemo && "cursor-pointer group hover:opacity-90 transition-opacity"
          )}
          title={onExitDemo ? "Return to Landing Page" : undefined}
        >
          <div className="w-8 h-8 md:w-9 md:h-9 rounded-xl neu-pressed flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold shrink-0">
            <Layers className="w-4 h-4 md:w-5 md:h-5 group-hover:scale-110 transition-transform" />
          </div>
          <div className="truncate">
            <div className="flex items-center gap-1.5">
              <h1 className="text-sm md:text-lg font-bold text-slate-800 dark:text-white tracking-tight truncate">
                Nexus RAG
              </h1>
              <span className="hidden sm:inline-block px-1.5 py-0.5 text-[9px] md:text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 rounded-full font-mono">
                Soft UI
              </span>
            </div>
            <p className="text-[10px] md:text-[11px] text-slate-500 dark:text-slate-400 hidden sm:block">
              {onExitDemo ? "← Click to return to Landing Page" : "Enterprise Vector Search Platform"}
            </p>
          </div>
        </div>

        {/* Navigation View Switcher & Scope Selector */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center gap-1 p-1 neu-pressed rounded-xl">
            <button
              onClick={() => setActiveTab("chat")}
              className={`flex items-center gap-1.5 px-2.5 md:px-4 py-1.5 rounded-lg text-[11px] md:text-xs font-bold transition-all cursor-pointer ${
                activeTab === "chat"
                  ? "neu-btn-primary text-white shadow-md"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">AI Assistant</span>
              <span className="xs:hidden">Chat</span>
            </button>

            <button
              onClick={() => setActiveTab("documents")}
              className={`flex items-center gap-1.5 px-2.5 md:px-4 py-1.5 rounded-lg text-[11px] md:text-xs font-bold transition-all cursor-pointer ${
                activeTab === "documents"
                  ? "neu-btn-primary text-white shadow-md"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">Knowledge Base</span>
              <span className="xs:hidden">Docs</span>
              {documentCount > 0 && (
                <span className="px-1.5 py-0.2 text-[9px] md:text-[10px] bg-blue-100 dark:bg-blue-900/80 text-blue-700 dark:text-blue-200 rounded-full font-mono font-bold">
                  {documentCount}
                </span>
              )}
            </button>
          </div>

          {/* Scope Selector */}
          <ScopeSelector />
        </div>

        {/* Right Controls: User Profile / Auth Button & Theme Toggle */}
        <div className="flex items-center gap-2 md:gap-3">
          {user ? (
            <div className="flex items-center gap-2 neu-pressed px-3 py-1.5 rounded-xl">
              <div className="w-6 h-6 rounded-lg bg-blue-500/20 text-blue-600 dark:text-blue-400 font-bold flex items-center justify-center text-xs">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="hidden md:flex flex-col text-left">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate max-w-[100px]">
                  {user.name}
                </span>
                <span className="text-[9px] text-slate-400 font-mono">
                  {user.organizationName ? "Org Member" : "Individual"}
                </span>
              </div>
              <button
                onClick={logout}
                title="Sign out"
                className="p-1 text-slate-400 hover:text-rose-500 transition-colors ml-1"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsAuthOpen(true)}
              className="neu-btn-primary px-3 py-1.5 rounded-xl text-xs font-bold text-white flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
          )}

          {/* Theme Toggle Button */}
          <ThemeToggle />
        </div>
      </header>

      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </>
  );
}
