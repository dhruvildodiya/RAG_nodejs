"use client";

import React from "react";
import { Cpu, FileText, MessageSquare, Database, Layers } from "lucide-react";

interface NavbarProps {
  activeTab: "chat" | "documents";
  setActiveTab: (tab: "chat" | "documents") => void;
  documentCount: number;
}

export function Navbar({ activeTab, setActiveTab, documentCount }: NavbarProps) {
  return (
    <header className="h-16 md:h-20 border-b border-[#222b3e] bg-[#181f2e] flex items-center justify-between px-4 md:px-8 z-30 relative shrink-0">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl neu-pressed flex items-center justify-center text-blue-400 font-bold">
          <Layers className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base md:text-lg font-bold text-white tracking-tight">
              Nexus RAG
            </h1>
            <span className="px-2 py-0.5 text-[10px] font-bold text-blue-400 bg-blue-500/10 rounded-full font-mono">
              Soft UI
            </span>
          </div>
          <p className="text-[11px] text-slate-400 hidden sm:block">
            Enterprise Vector Search Platform
          </p>
        </div>
      </div>

      {/* Navigation View Switcher */}
      <div className="flex items-center gap-1.5 p-1.5 neu-pressed rounded-xl">
        <button
          onClick={() => setActiveTab("chat")}
          className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            activeTab === "chat"
              ? "neu-btn-primary text-white shadow-md"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>AI Assistant</span>
        </button>

        <button
          onClick={() => setActiveTab("documents")}
          className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            activeTab === "documents"
              ? "neu-btn-primary text-white shadow-md"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Knowledge Base</span>
          {documentCount > 0 && (
            <span className="px-2 py-0.5 text-[10px] bg-blue-900/80 text-blue-200 rounded-full font-mono font-bold">
              {documentCount}
            </span>
          )}
        </button>
      </div>

      {/* Live System Status Badges */}
      <div className="hidden lg:flex items-center gap-3">
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl neu-pressed text-xs text-slate-300">
          <Database className="w-3.5 h-3.5 text-emerald-400" />
          <span className="font-mono text-[11px]">PGVector: Online</span>
        </div>

        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl neu-pressed text-xs text-slate-300">
          <Cpu className="w-3.5 h-3.5 text-blue-400" />
          <span className="font-mono text-[11px]">OpenRouter: Active</span>
        </div>
      </div>
    </header>
  );
}
