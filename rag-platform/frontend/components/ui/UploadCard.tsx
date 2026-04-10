"use client";

import React, { useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDropzone } from "react-dropzone";
import { Upload, FileText, CheckCircle2, Loader2, X, File, AlertCircle } from "lucide-react";
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
  const fileInputRef = useRef<HTMLInputElement>(null);

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    if (rejectedFiles.length > 0) {
      const rejection = rejectedFiles[0];
      if (rejection.errors.some((e: any) => e.code === 'file-too-large')) {
        alert('File is too large. Maximum size is 10MB.');
      } else if (rejection.errors.some((e: any) => e.code === 'file-invalid-type')) {
        alert('Invalid file type. Please upload PDF, DOCX, or TXT files.');
      } else {
        alert('File upload failed. Please try again.');
      }
      return;
    }

    if (acceptedFiles.length > 0) {
      onFileSelect(acceptedFiles[0]);
    }
  }, [onFileSelect]);

  const { getRootProps, getInputProps, isDragActive, isDragReject, isDragAccept } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt'],
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    multiple: false,
  });

  return (
    <div className="space-y-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="glass-card rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 relative overflow-hidden group"
      >
        {/* Premium Accent Line */}
        <motion.div 
          className="absolute top-0 left-0 w-full h-0.75 premium-gradient opacity-0 group-hover:opacity-100 transition-opacity"
          initial={{ scaleX: 0 }}
          whileHover={{ scaleX: 1 }}
          transition={{ duration: 0.3 }}
        />
        
        {/* Header with enhanced styling */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-0 mb-4 sm:mb-6">
          <motion.h3 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg sm:text-xl font-bold bg-linear-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent flex items-center gap-2 sm:gap-3"
          >
            <motion.div
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="premium-gradient w-6 h-6 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg"
            >
              <Upload className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
            </motion.div>
            <span className="text-sm sm:text-base">Knowledge Ingestion</span>
          </motion.h3>
        </div>

        <motion.textarea
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Paste raw text to index for AI processing..."
          className="w-full h-24 sm:h-32 bg-slate-950/50 border border-slate-800 rounded-lg sm:rounded-xl p-3 sm:p-4 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 outline-none transition-all resize-none mb-4 sm:mb-6"
        />

        <motion.div 
          {...getRootProps({ 
            onAnimationStart: undefined,
            onAnimationEnd: undefined,
            onAnimationIteration: undefined,
            onTransitionStart: undefined,
            onTransitionEnd: undefined,
            onTransitionCancel: undefined
          })}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className={cn(
            "border-2 border-dashed rounded-xl sm:rounded-2xl p-6 sm:p-8 md:p-10 flex flex-col items-center justify-center cursor-pointer transition-all relative overflow-hidden",
            isDragActive && isDragAccept && "border-emerald-500/50 bg-emerald-500/10 scale-[1.02]",
            isDragActive && isDragReject && "border-rose-500/50 bg-rose-500/10 scale-[1.02]",
            !isDragActive && "border-slate-800 hover:border-blue-500/30 hover:bg-blue-500/5",
            selectedFile && "border-blue-500/30 bg-blue-500/5"
          )}
        >
          <input {...getInputProps()} />
          
          <AnimatePresence mode="wait">
            {isDragActive ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="flex flex-col items-center"
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mb-3 sm:mb-4"
                >
                  <Upload className="w-6 h-6 sm:w-8 sm:h-8 text-emerald-400" />
                </motion.div>
                <p className="text-sm sm:text-base font-semibold text-slate-200 text-center">
                  {isDragAccept ? "Perfect! Drop to upload" : "Invalid file type"}
                </p>
                <p className="text-xs sm:text-sm text-slate-500 mt-1 sm:mt-2 text-center">
                  {isDragAccept ? "Release to confirm upload" : "Only PDF, DOCX, TXT allowed"}
                </p>
              </motion.div>
            ) : selectedFile ? (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex flex-col items-center"
              >
                <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-blue-500/20 flex items-center justify-center mb-3 sm:mb-4">
                  <FileText className="w-6 h-6 sm:w-8 sm:h-8 text-blue-400" />
                </div>
                <p className="text-sm sm:text-base font-semibold text-slate-200 text-center truncate max-w-full">{selectedFile.name}</p>
                <p className="text-xs sm:text-sm text-slate-500 mt-1 text-center">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB • Ready to process
                </p>
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    onFileSelect(null);
                  }}
                  className="mt-2 sm:mt-3 px-3 py-1.5 sm:px-4 sm:py-2 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg transition-all flex items-center gap-2 border border-rose-500/30"
                >
                  <X className="w-3 h-3" /> <span className="hidden sm:inline">Remove File</span>
                </motion.button>
              </motion.div>
            ) : (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex flex-col items-center"
              >
                <motion.div
                  animate={{ 
                    scale: [1, 1.05, 1],
                    rotate: [0, 1, -1, 0]
                  }}
                  transition={{ 
                    scale: { duration: 3, repeat: Infinity, ease: "easeInOut" },
                    rotate: { duration: 4, repeat: Infinity, ease: "easeInOut" }
                  }}
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-slate-800/50 flex items-center justify-center mb-4 sm:mb-6 group-hover:bg-blue-500/10 transition-colors border-2 border-dashed border-slate-700"
                >
                  <Upload className="w-8 h-8 sm:w-10 sm:h-10 text-slate-500 group-hover:text-blue-400 transition-colors" />
                </motion.div>
                <p className="text-sm sm:text-base font-semibold text-slate-300 mb-2 text-center">Drag & drop your files here</p>
                <p className="text-xs sm:text-sm text-slate-500 mb-3 sm:mb-4 text-center">or click to browse documents</p>
                <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 text-xs text-slate-600 bg-slate-800/50 px-3 py-2 sm:px-4 sm:py-2 rounded-full">
                  <File className="w-3 h-3 sm:w-4 sm:h-4 text-blue-400" />
                  <span>PDF, DOCX, TXT</span>
                  <span className="hidden sm:inline">•</span>
                  <span className="hidden sm:inline">Max 10MB</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        <motion.button
          onClick={() => onUpload(value, selectedFile)}
          disabled={loading || (!value && !selectedFile)}
          className="premium-gradient w-full mt-6 sm:mt-8 h-12 sm:h-14 rounded-xl sm:rounded-2xl font-bold flex items-center justify-center gap-2 sm:gap-3 shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
        >
          <motion.div
            className="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent"
            initial={{ x: "-100%" }}
            whileHover={{ x: "100%" }}
            transition={{ duration: 0.6 }}
          />
          
          {loading ? (
            <>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-5 h-5 flex items-center justify-center"
              >
                <Loader2 className="w-full h-full text-white" />
              </motion.div>
              <span className="text-white">Processing with AI...</span>
            </>
          ) : (
            <>
              <motion.div
                initial={{ rotate: -180, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
              >
                <CheckCircle2 className="w-5 h-5 text-white" />
              </motion.div>
              <span className="text-white">Index Document</span>
              <motion.div
                className="w-2 h-2 rounded-full bg-white"
                animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </>
          )}
        </motion.button>
      </motion.div>
    </div>
  );
}
