"use client";

import React, { useState } from "react";
import { FileText, Search, Trash2, HardDrive } from "lucide-react";

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
    <div className="space-y-4 h-full flex flex-col px-2 md:px-6 py-4 bg-slate-100 dark:bg-[#151a26] transition-colors duration-200">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl neu-flat">
        <div>
          <div className="flex items-center gap-2">
            <HardDrive className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">
              Vector Knowledge Base
            </h2>
            <span className="px-2.5 py-0.5 text-[10px] font-mono font-bold bg-blue-100 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 rounded-full">
              {documents.length} Files
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Documents indexed into PostgreSQL vector database available for RAG search.
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
            className="w-full neu-pressed rounded-xl pl-9 pr-4 py-2 text-xs outline-none focus:ring-1 focus:ring-blue-500 text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500"
          />
        </div>
      </div>

      {/* Document Cards List */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-1">
        {filteredDocs.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-center p-8 rounded-2xl neu-flat">
            <div className="w-12 h-12 rounded-xl neu-pressed flex items-center justify-center mb-3 text-slate-400">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">No documents found</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-xs">
              {searchQuery
                ? "No document matching your search query."
                : "Upload PDF, DOCX, or raw text using the sidebar ingestion engine."}
            </p>
          </div>
        ) : (
          filteredDocs.map((doc, idx) => (
            <div
              key={doc.id || idx}
              className="rounded-xl p-4 flex items-center justify-between neu-card group"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-10 h-10 rounded-xl neu-pressed flex items-center justify-center shrink-0 text-blue-600 dark:text-blue-400">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs md:text-sm font-bold text-slate-800 dark:text-slate-100 truncate group-hover:text-blue-600 dark:group-hover:text-blue-300 transition-colors">
                    {doc.name}
                  </h4>
                  <div className="flex items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-mono">
                    <span>{doc.size || "Indexed"}</span>
                    {doc.chunkCount !== undefined && (
                      <span>• {doc.chunkCount} Chunks</span>
                    )}
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold">
                      Vectorized
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {onDeleteDoc && (
                  <button
                    onClick={() => onDeleteDoc(doc.id)}
                    className="p-2 rounded-lg neu-btn-secondary text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-all cursor-pointer"
                    title="Remove from database"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
