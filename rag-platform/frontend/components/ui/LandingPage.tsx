"use client";

import React from "react";
import {
  Layers,
  Sparkles,
  ShieldCheck,
  Zap,
  Building,
  User,
  ArrowRight,
  FileSearch,
  Lock,
  Play,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "./ThemeToggle";

interface LandingPageProps {
  onOpenAuth: () => void;
  onStartDemo: () => void;
}

export function LandingPage({ onOpenAuth, onStartDemo }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#080b14] text-slate-900 dark:text-white flex flex-col font-sans relative overflow-hidden transition-colors duration-200">
      {/* Dynamic Background Glow Gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-tr from-blue-600/20 via-indigo-500/10 to-cyan-400/20 blur-[120px] pointer-events-none rounded-full" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[350px] bg-gradient-to-br from-indigo-600/15 to-purple-600/15 blur-[100px] pointer-events-none rounded-full" />

      {/* Landing Page Navbar */}
      <header className="h-20 border-b border-slate-200/80 dark:border-[#1e2738] bg-white/70 dark:bg-[#0d1322]/70 backdrop-blur-xl flex items-center justify-between px-6 lg:px-12 z-30 sticky top-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl neu-pressed flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-black tracking-tight text-slate-900 dark:text-white">
                Nexus RAG
              </h1>
              <span className="px-2 py-0.5 text-[10px] font-extrabold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 rounded-full font-mono border border-blue-200 dark:border-blue-500/20">
                Enterprise AI
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggle />

          <button
            onClick={onStartDemo}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 neu-flat transition-all cursor-pointer flex items-center gap-1.5"
          >
            <Play className="w-3.5 h-3.5 text-blue-500 fill-blue-500" />
            <span>Try Demo Sandbox</span>
          </button>

          <button
            onClick={onOpenAuth}
            className="neu-btn-primary px-5 py-2 rounded-xl text-xs font-bold text-white flex items-center gap-2 shadow-lg shadow-blue-500/20 cursor-pointer"
          >
            <span>Sign In / Create Account</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* Main Hero Section */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-6 pt-12 pb-16 flex flex-col items-center justify-center text-center z-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full neu-pressed text-xs font-bold text-blue-600 dark:text-blue-400 mb-6 border border-blue-500/20">
          <Sparkles className="w-4 h-4 animate-spin text-blue-500" />
          <span>Multimodal OCR • Vision AI • PostgreSQL Vector Search</span>
        </div>

        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white max-w-4xl leading-[1.15]">
          Transform Your Knowledge Base into{" "}
          <span className="bg-gradient-to-r from-blue-600 via-cyan-500 to-indigo-500 bg-clip-text text-transparent">
            Instant AI Answers
          </span>
        </h1>

        <p className="mt-5 text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
          Upload colorful PDFs, scanned docs, Word files, or screenshots. Nexus RAG extracts multimodal text with Gemini Vision AI and grounds responses using PGVector vector similarity.
        </p>

        {/* CTA Actions */}
        <div className="mt-8 flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          <button
            onClick={onStartDemo}
            className="w-full sm:w-auto neu-btn-primary py-3.5 px-8 rounded-2xl text-sm font-extrabold text-white flex items-center justify-center gap-2.5 shadow-xl shadow-blue-500/25 cursor-pointer transform transition-transform hover:scale-[1.02]"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>Try Demo Sandbox (No Login)</span>
          </button>

          <button
            onClick={onOpenAuth}
            className="w-full sm:w-auto py-3.5 px-8 rounded-2xl text-sm font-extrabold text-slate-800 dark:text-slate-200 neu-flat hover:border-blue-500/50 transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <Lock className="w-4 h-4 text-emerald-500" />
            <span>Sign In for Workspace Isolation</span>
          </button>
        </div>

        {/* Feature Highlights Cards */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 w-full text-left">
          <div className="p-6 rounded-2xl neu-flat bg-white/60 dark:bg-[#121927]/60 border border-slate-200/80 dark:border-[#222b3e] flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 neu-pressed rounded-xl flex items-center justify-center text-blue-600 dark:text-blue-400 mb-4">
                <FileSearch className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Multimodal Vision OCR
              </h3>
              <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Extract text from complex graphic PDFs, screenshots, infographics, and images using Gemini Vision AI with local Tesseract.js fallback.
              </p>
            </div>
            <div className="mt-4 flex items-center gap-1.5 text-[11px] font-bold text-blue-600 dark:text-blue-400">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>PNG, JPG, WEBP, PDF, DOCX</span>
            </div>
          </div>

          <div className="p-6 rounded-2xl neu-flat bg-white/60 dark:bg-[#121927]/60 border border-slate-200/80 dark:border-[#222b3e] flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 neu-pressed rounded-xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-4">
                <Building className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Individual vs. Org Scoping
              </h3>
              <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Isolate personal documents in Individual mode or share team knowledge safely across your Organization.
              </p>
            </div>
            <div className="mt-4 flex items-center gap-1.5 text-[11px] font-bold text-indigo-600 dark:text-indigo-400">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>Strict Data Scoping</span>
            </div>
          </div>

          <div className="p-6 rounded-2xl neu-flat bg-white/60 dark:bg-[#121927]/60 border border-slate-200/80 dark:border-[#222b3e] flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 neu-pressed rounded-xl flex items-center justify-center text-cyan-600 dark:text-cyan-400 mb-4">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                PGVector & Hybrid Rerank
              </h3>
              <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                High-performance cosine vector indexing in PostgreSQL with intelligent context reranking and citation grounding.
              </p>
            </div>
            <div className="mt-4 flex items-center gap-1.5 text-[11px] font-bold text-cyan-600 dark:text-cyan-400">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Grounded Citations</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
