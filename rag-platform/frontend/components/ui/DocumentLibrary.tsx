"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, Search, Trash2, Database, Sparkles, Clock, CheckCircle, ExternalLink, HardDrive } from "lucide-react";

export interface IndexedDoc {
  id: string;
  name: string;
  type: string;
  size?: string;
  timestamp: string;
  chunkCount?: number;
}

interface DocumentLibraryProps {
  documents: IndexedDoc[];
  onSelectDoc?: (doc: IndexedDoc) => void;
  onDeleteDoc?: (id: string) => void;
}

export function DocumentLibrary({ documents, onSelectDoc, onDeleteDoc }: DocumentLibraryProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredDocs = documents.filter((doc) =>
    doc.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 h-full flex flex-col">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 glass-card p-6 rounded-2xl border border-blue-500/20">
        <div>
          <h2 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent flex items-center gap-2">
            <HardDrive className="w-5 h-5 text-blue-400" />
            Knowledge Base Documents
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Manage vector-indexed sources available to the AI search pipeline.
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search indexed sources..."
            className="w-full bg-slate-950/60 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs outline-none focus:border-blue-500/50 text-slate-200"
          />
        </div>
      </div>

      {/* Document List Container */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-2">
        <AnimatePresence mode="popLayout">
          {filteredDocs.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="h-64 flex flex-col items-center justify-center text-center p-8 glass rounded-2xl border border-slate-800"
            >
              <div className="w-12 h-12 rounded-2xl bg-slate-800/60 flex items-center justify-center mb-3">
                <FileText className="w-6 h-6 text-slate-500" />
              </div>
              <h3 className="text-sm font-semibold text-slate-300">No documents found</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-xs">
                {searchQuery
                  ? "No files matching your search filter."
                  : "Upload PDF, DOCX, or text from the sidebar dropzone to see indexed documents."}
              </p>
            </motion.div>
          ) : (
            filteredDocs.map((doc, idx) => (
              <motion.div
                key={doc.id || idx}
                layout
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2, delay: idx * 0.05 }}
                className="glass-card rounded-xl p-4 flex items-center justify-between border border-slate-800/80 hover:border-blue-500/30 transition-all group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5 text-blue-400" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-sm font-medium text-slate-200 truncate group-hover:text-blue-300 transition-colors">
                      {doc.name}
                    </h4>
                    <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-1">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-500" />
                        {doc.timestamp}
                      </span>
                      {doc.size && <span>• {doc.size}</span>}
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-mono">
                        Indexed
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {onDeleteDoc && (
                    <button
                      onClick={() => onDeleteDoc(doc.id)}
                      className="p-2 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                      title="Remove document"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
