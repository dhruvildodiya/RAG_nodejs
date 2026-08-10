"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Database, Menu, X, Sparkles } from "lucide-react";

export function DashboardContainer({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#151a26] text-slate-100 relative font-sans">
      {children}
    </div>
  );
}

export function Sidebar({ children }: { children: React.ReactNode }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const checkDesktop = () => setIsDesktop(window.innerWidth >= 1024);
    checkDesktop();
    window.addEventListener("resize", checkDesktop);
    return () => window.removeEventListener("resize", checkDesktop);
  }, []);

  return (
    <>
      {/* Mobile Menu Toggle */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="fixed top-4 left-4 z-50 lg:hidden p-2.5 rounded-xl neu-btn-secondary text-slate-300 shadow-md"
      >
        {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileMenuOpen(false)}
            className="fixed inset-0 bg-slate-950/80 z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar Container */}
      <aside
        className={`fixed lg:relative w-80 h-full bg-[#181f2e] border-r border-[#222b3e] flex flex-col p-5 z-50 lg:z-10 shrink-0 transition-transform duration-200 ${
          isDesktop || isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand Header */}
        <div className="mb-5 pb-4 border-b border-[#222b3e] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl neu-pressed flex items-center justify-center text-blue-400">
              <Sparkles className="w-4.5 h-4.5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-100">
                Knowledge Ingestion
              </h2>
              <p className="text-[11px] text-slate-400">
                Vector Knowledge Base
              </p>
            </div>
          </div>
        </div>

        {/* Sidebar Main Content */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
          {children}
        </div>

        {/* Footer Database Status Card */}
        <div className="mt-auto pt-4 border-t border-[#222b3e]">
          <div className="rounded-xl p-3.5 neu-pressed space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-emerald-400 font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>Vector Index Active</span>
              </div>
              <span className="text-[10px] text-slate-500 font-mono">user1</span>
            </div>
            <div className="flex items-center gap-2 text-slate-400 text-[11px]">
              <Database className="w-3.5 h-3.5 text-blue-400" />
              <span>PostgreSQL + pgvector</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

export function MainCanvas({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex-1 flex flex-col h-full overflow-hidden z-10 bg-[#151a26]">
      {children}
    </main>
  );
}
