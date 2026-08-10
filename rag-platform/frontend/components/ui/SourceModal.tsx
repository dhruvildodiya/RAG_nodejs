"use client";

import React from "react";
import { X, BookOpen, Quote } from "lucide-react";

interface SourceModalProps {
  isOpen: boolean;
  onClose: () => void;
  sources: string[];
}

export function SourceModal({ isOpen, onClose, sources }: SourceModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs"
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-lg neu-flat rounded-2xl p-6 shadow-2xl z-10 max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#222b3e]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl neu-pressed flex items-center justify-center text-blue-400 font-bold">
              <BookOpen className="w-4.5 h-4.5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100">Attributed Sources</h3>
              <p className="text-[11px] text-slate-400">Knowledge base chunks used for response</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl neu-btn-secondary text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Source items list */}
        <div className="flex-1 overflow-y-auto space-y-3 py-4 pr-1">
          {sources.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-4">No explicit sources recorded for this response.</p>
          ) : (
            sources.map((src, index) => (
              <div
                key={index}
                className="p-4 rounded-xl neu-pressed flex items-start gap-3.5"
              >
                <div className="w-6 h-6 rounded-lg neu-btn-secondary text-blue-400 flex items-center justify-center shrink-0 text-xs font-mono font-bold mt-0.5">
                  {index + 1}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-xs font-bold text-blue-400 truncate">{src}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-mono font-bold">
                      Vector Match
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed italic flex items-start gap-1">
                    <Quote className="w-3 h-3 text-slate-500 shrink-0 mt-0.5" />
                    Relevant document chunk retrieved & passed to LLM generation prompt.
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-[#222b3e] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl neu-btn-secondary text-xs font-bold text-slate-200 transition-colors cursor-pointer"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
}
