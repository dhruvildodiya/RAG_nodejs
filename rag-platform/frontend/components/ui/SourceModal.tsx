"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, FileText, Sparkles, BookOpen, Quote } from "lucide-react";

interface SourceModalProps {
  isOpen: boolean;
  onClose: () => void;
  sources: string[];
}

export function SourceModal({ isOpen, onClose, sources }: SourceModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-lg glass-card border border-blue-500/30 rounded-2xl p-6 shadow-2xl z-10 max-h-[80vh] flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-500/20 border border-blue-400/30 flex items-center justify-center">
                  <BookOpen className="w-4 h-4 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-100">Retrieved Sources</h3>
                  <p className="text-xs text-slate-400">Attributed knowledge base fragments</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Source items */}
            <div className="flex-1 overflow-y-auto space-y-3 py-4 pr-1">
              {sources.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-4">No explicit sources recorded for this response.</p>
              ) : (
                sources.map((src, index) => (
                  <div
                    key={index}
                    className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-start gap-3"
                  >
                    <div className="w-6 h-6 rounded-md bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center shrink-0 text-xs font-mono font-bold mt-0.5">
                      {index + 1}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="text-xs font-semibold text-blue-300 truncate">{src}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                          Matched
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed italic flex items-start gap-1">
                        <Quote className="w-3 h-3 text-slate-600 shrink-0 mt-0.5" />
                        Relevant document chunk passed into RAG generation prompt.
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="pt-3 border-t border-slate-800 flex justify-end">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 transition-colors"
              >
                Close Inspector
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
