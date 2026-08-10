"use client";

import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, FileText, Loader2, X, FileCode, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface UploadCardProps {
  onUpload: (text: string, file: File | null) => void;
  loading: boolean;
  value: string;
  onChange: (val: string) => void;
  selectedFile: File | null;
  onFileSelect: (file: File | null) => void;
}

export function UploadCard({
  onUpload,
  loading,
  value,
  onChange,
  selectedFile,
  onFileSelect,
}: UploadCardProps) {
  const [ingestMode, setIngestMode] = useState<"file" | "text">("file");

  const onDrop = useCallback(
    (acceptedFiles: File[], rejectedFiles: any[]) => {
      if (rejectedFiles.length > 0) {
        const rejection = rejectedFiles[0];
        if (rejection.errors.some((e: any) => e.code === "file-too-large")) {
          alert("File is too large. Maximum size is 10MB.");
        } else if (rejection.errors.some((e: any) => e.code === "file-invalid-type")) {
          alert("Invalid file type. Please upload PDF, DOCX, or TXT files.");
        } else {
          alert("File upload failed. Please try again.");
        }
        return;
      }

      if (acceptedFiles.length > 0) {
        onFileSelect(acceptedFiles[0]);
      }
    },
    [onFileSelect]
  );

  const { getRootProps, getInputProps, isDragActive, isDragReject, isDragAccept } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
      "text/plain": [".txt"],
    },
    maxSize: 10 * 1024 * 1024,
    multiple: false,
  });

  return (
    <div className="space-y-4">
      {/* Mode Switcher Tabs */}
      <div className="grid grid-cols-2 gap-1.5 p-1.5 neu-pressed rounded-xl">
        <button
          type="button"
          onClick={() => setIngestMode("file")}
          className={cn(
            "py-2 px-3 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer",
            ingestMode === "file"
              ? "neu-btn-primary text-white shadow-sm"
              : "text-slate-400 hover:text-slate-200"
          )}
        >
          <Upload className="w-3.5 h-3.5" />
          <span>Upload File</span>
        </button>
        <button
          type="button"
          onClick={() => setIngestMode("text")}
          className={cn(
            "py-2 px-3 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer",
            ingestMode === "text"
              ? "neu-btn-primary text-white shadow-sm"
              : "text-slate-400 hover:text-slate-200"
          )}
        >
          <FileCode className="w-3.5 h-3.5" />
          <span>Raw Text</span>
        </button>
      </div>

      {ingestMode === "file" ? (
        <div
          {...getRootProps()}
          className={cn(
            "border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer transition-all neu-flat",
            isDragActive && isDragAccept && "border-blue-500 bg-blue-950/20",
            isDragActive && isDragReject && "border-rose-500 bg-rose-950/20",
            !isDragActive && "border-[#283348] hover:border-blue-500/60",
            selectedFile && "border-blue-500/60 bg-blue-950/20"
          )}
        >
          <input {...getInputProps()} />

          {selectedFile ? (
            <div className="flex flex-col items-center text-center w-full">
              <div className="w-11 h-11 rounded-xl neu-pressed flex items-center justify-center mb-2.5 text-blue-400">
                <FileText className="w-5.5 h-5.5" />
              </div>
              <p className="text-xs font-bold text-slate-100 truncate max-w-[200px]">
                {selectedFile.name}
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5 font-mono">
                {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
              </p>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onFileSelect(null);
                }}
                className="mt-3 px-3 py-1 text-[11px] font-bold text-rose-400 neu-btn-secondary rounded-lg flex items-center gap-1 transition-all cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
                <span>Remove file</span>
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center text-center">
              <div className="w-11 h-11 rounded-xl neu-pressed flex items-center justify-center mb-2.5 text-blue-400">
                <Upload className="w-5.5 h-5.5" />
              </div>
              <p className="text-xs font-bold text-slate-200">
                Drag & drop document
              </p>
              <p className="text-[11px] text-slate-400 mt-1">
                or click to browse file
              </p>
              <div className="mt-3.5 px-3 py-1 rounded-lg neu-pressed text-[10px] font-mono text-slate-400 flex items-center gap-1.5">
                <span>PDF • DOCX • TXT</span>
                <span>Max 10MB</span>
              </div>
            </div>
          )}
        </div>
      ) : (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Paste raw text or documentation to index into vector database..."
          className="w-full h-44 neu-pressed rounded-xl p-3.5 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all resize-none font-mono"
        />
      )}

      {/* Indexing Action Button */}
      <button
        type="button"
        onClick={() => onUpload(value, selectedFile)}
        disabled={loading || (!value && !selectedFile)}
        className="neu-btn-primary w-full py-3 px-4 rounded-xl text-xs font-bold text-white flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin text-white" />
            <span>Indexing document...</span>
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4" />
            <span>Vectorize & Index</span>
          </>
        )}
      </button>
    </div>
  );
}
