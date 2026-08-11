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
          alert("Invalid file type. Please upload PDF, DOCX, TXT, or Image (PNG, JPG, WEBP) files.");
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
      "image/*": [".png", ".jpg", ".jpeg", ".webp", ".gif", ".bmp", ".tiff", ".svg"],
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
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
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
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
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
            "border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 relative overflow-hidden neu-flat",
            // Drag Hover active effects
            isDragActive &&
              "border-blue-500 bg-blue-50/80 dark:bg-blue-950/40 scale-[1.02] shadow-xl shadow-blue-500/10 ring-4 ring-blue-500/20",
            isDragReject &&
              "border-rose-500 bg-rose-50/80 dark:bg-rose-950/40 scale-[1.02] ring-4 ring-rose-500/20",
            !isDragActive &&
              "border-slate-300 dark:border-[#283348] hover:border-blue-500/60 hover:bg-blue-50/20 dark:hover:bg-blue-950/10 hover:scale-[1.01]",
            selectedFile && "border-blue-500/60 bg-blue-50/30 dark:bg-blue-950/20"
          )}
        >
          <input {...getInputProps()} />

          {/* Animated glow background on hover/drag */}
          {isDragActive && (
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-cyan-500/10 to-blue-500/10 animate-pulse pointer-events-none" />
          )}

          {selectedFile ? (
            <div className="flex flex-col items-center text-center w-full z-10">
              <div className="w-12 h-12 rounded-xl neu-pressed flex items-center justify-center mb-2.5 text-blue-600 dark:text-blue-400 transform transition-transform duration-200 hover:scale-110">
                {selectedFile.type.startsWith("image/") ? (
                  <img
                    src={URL.createObjectURL(selectedFile)}
                    alt="Uploaded preview"
                    className="w-full h-full object-cover rounded-xl"
                  />
                ) : (
                  <FileText className="w-6 h-6" />
                )}
              </div>
              <p className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate max-w-[220px]">
                {selectedFile.name}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 font-mono">
                {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
              </p>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onFileSelect(null);
                }}
                className="mt-3 px-3 py-1 text-[11px] font-bold text-rose-600 dark:text-rose-400 neu-btn-secondary rounded-lg flex items-center gap-1 transition-all cursor-pointer hover:bg-rose-50 dark:hover:bg-rose-950/30"
              >
                <X className="w-3.5 h-3.5" />
                <span>Remove file</span>
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center text-center z-10">
              <div
                className={cn(
                  "w-12 h-12 rounded-xl neu-pressed flex items-center justify-center mb-2.5 transition-all duration-300",
                  isDragActive
                    ? "scale-125 text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/50 shadow-md animate-bounce"
                    : "text-blue-600 dark:text-blue-400"
                )}
              >
                <Upload className="w-6 h-6" />
              </div>

              <p
                className={cn(
                  "text-xs font-bold transition-colors duration-200",
                  isDragActive
                    ? "text-blue-600 dark:text-blue-400 text-sm scale-105"
                    : "text-slate-800 dark:text-slate-200"
                )}
              >
                {isDragActive
                  ? isDragReject
                    ? "Unsupported file format!"
                    : "Drop document or image here!"
                  : "Drag & drop document or image"}
              </p>

              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                {isDragActive ? "Release to attach file" : "or click to browse files"}
              </p>

              <div
                className={cn(
                  "mt-3.5 px-3 py-1 rounded-lg text-[10px] font-mono transition-all duration-200 flex items-center gap-1.5",
                  isDragActive
                    ? "bg-blue-500 text-white font-bold shadow-sm"
                    : "neu-pressed text-slate-500 dark:text-slate-400"
                )}
              >
                <span>PDF • DOCX • TXT • PNG • JPG • WEBP</span>
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
          className="w-full h-44 neu-pressed rounded-xl p-3.5 text-xs text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all resize-none font-mono"
        />
      )}

      {/* Indexing Action Button */}
      <button
        type="button"
        onClick={() => onUpload(value, selectedFile)}
        disabled={loading || (!value && !selectedFile)}
        className="neu-btn-primary w-full py-3 px-4 rounded-xl text-xs font-bold text-white flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-sm"
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
