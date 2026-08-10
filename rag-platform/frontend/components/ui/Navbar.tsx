"use client";

import React from "react";
import { motion } from "framer-motion";
import { Sparkles, FileText, MessageSquare, Activity } from "lucide-react";

interface NavbarProps {
  activeTab: "chat" | "documents";
  setActiveTab: (tab: "chat" | "documents") => void;
  documentCount: number;
}

export function Navbar({ activeTab, setActiveTab, documentCount }: NavbarProps) {
  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="h-16 md:h-20 glass border-b border-slate-800/60 flex items-center justify-between px-4 md:px-8 z-30 relative"
    >
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          <motion.div
            whileHover={{ scale: 1.05, rotate: 180 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className="w-10 h-10 rounded-xl premium-gradient flex items-center justify-center shadow-lg shadow-blue-500/20"
          >
            <Sparkles className="w-5 h-5 text-white" />
          </motion.div>
          <div>
            <h1 className="text-xl md:text-2xl font-black bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent tracking-tight">
              Nexus RAG
            </h1>
            <p className="text-[10px] text-slate-400 font-mono tracking-wider uppercase hidden sm:block">
              AI Knowledge Intelligence Platform
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-1 bg-slate-900/60 border border-slate-800 p-1.5 rounded-xl">
        <button
          onClick={() => setActiveTab("chat")}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs md:text-sm font-semibold transition-all ${
            activeTab === "chat"
              ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-600/30"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>AI Assistant</span>
        </button>

        <button
          onClick={() => setActiveTab("documents")}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs md:text-sm font-semibold transition-all relative ${
            activeTab === "documents"
              ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-600/30"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Knowledge Base</span>
          {documentCount > 0 && (
            <span className="ml-1 px-1.5 py-0.5 text-[10px] bg-blue-500/30 border border-blue-400/40 text-blue-300 rounded-full font-mono">
              {documentCount}
            </span>
          )}
        </button>
      </div>

      {/* Status Badge */}
      <div className="hidden sm:flex items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400">
          <Activity className="w-3.5 h-3.5 animate-pulse text-emerald-400" />
          <span className="font-medium">System Online</span>
        </div>
      </div>
    </motion.header>
  );
}
