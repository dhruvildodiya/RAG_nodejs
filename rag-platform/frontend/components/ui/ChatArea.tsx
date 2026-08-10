"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, User, Bot, Sparkles, Library, ExternalLink, Copy, Check, Trash2 } from "lucide-react";
import { SourceModal } from "./SourceModal";

interface Message {
  role: "user" | "assistant";
  content: string;
  sources?: string[];
}

interface ChatAreaProps {
  messages: Message[];
  input: string;
  onInputChange: (val: string) => void;
  onSend: () => void;
  onClearChat?: () => void;
  loading: boolean;
}

export function ChatArea({
  messages,
  input,
  onInputChange,
  onSend,
  onClearChat,
  loading,
}: ChatAreaProps) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [selectedSources, setSelectedSources] = useState<string[] | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const suggestions = [
    "What are the key findings in my uploaded documents?",
    "Summarize the main topics covered in the knowledge base",
    "List all technical requirements mentioned in the texts",
    "Find specific metrics or data points from my documents"
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleCopy = (content: string, index: number) => {
    navigator.clipboard.writeText(content);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="flex flex-col h-full relative">
      {/* Top Action Bar for Chat */}
      {messages.length > 0 && (
        <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-800/80">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
            <span>Active Chat Session</span>
            <span className="text-slate-600">•</span>
            <span className="text-slate-500">{messages.length} messages</span>
          </div>
          {onClearChat && (
            <button
              onClick={onClearChat}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-[11px] text-slate-400 hover:text-rose-400 hover:border-rose-500/30 transition-all"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Clear Conversation
            </button>
          )}
        </div>
      )}

      {/* Messages Scroll View */}
      <div className="flex-1 overflow-y-auto space-y-6 pb-20 scroll-smooth pr-2 bg-transparent">
        <AnimatePresence initial={false}>
          {messages.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="h-full flex flex-col items-center justify-center text-slate-500 space-y-8 py-10"
            >
              <motion.div
                animate={{
                  scale: [1, 1.05, 1],
                  rotate: [0, 2, -2, 0]
                }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="w-20 h-20 rounded-3xl premium-gradient flex items-center justify-center border border-white/20 shadow-2xl shadow-blue-500/20"
              >
                <Sparkles className="w-10 h-10 text-white" />
              </motion.div>

              <div className="text-center space-y-2 max-w-md px-4">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">
                  Intelligent Knowledge Assistant
                </h2>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Query your indexed documents in real-time. Ask questions, extract summaries, and trace exact citations.
                </p>
              </div>

              <div className="w-full max-w-xl px-4">
                <p className="text-xs font-semibold text-slate-400 mb-3 text-center uppercase tracking-wider">Suggested Queries</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {suggestions.map((suggestion, index) => (
                    <motion.button
                      key={index}
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        onInputChange(suggestion);
                        inputRef.current?.focus();
                      }}
                      className="glass-card rounded-xl p-3 text-left text-xs text-slate-300 hover:border-blue-500/40 hover:text-white transition-all group border border-slate-800"
                    >
                      <div className="flex items-start gap-2.5">
                        <Sparkles className="w-4 h-4 text-blue-400 shrink-0 mt-0.5 group-hover:text-cyan-300 transition-colors" />
                        <span className="leading-snug">{suggestion}</span>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>
            </motion.div>
          ) : (
            messages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={`flex gap-3 md:gap-4 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {msg.role === "assistant" && (
                  <div className="w-9 h-9 rounded-xl premium-gradient flex items-center justify-center shrink-0 shadow-lg shadow-blue-500/20 mt-1">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-2xl px-5 py-4 text-sm leading-relaxed relative group ${
                    msg.role === "user"
                      ? "bg-gradient-to-br from-blue-600 via-indigo-600 to-blue-700 text-white shadow-lg shadow-blue-600/20"
                      : "glass-card text-slate-200 border border-slate-800/80 hover:border-blue-500/30"
                  }`}
                >
                  <p className="whitespace-pre-line font-normal text-sm leading-relaxed">{msg.content}</p>

                  {/* Actions Bar for Assistant Message */}
                  {msg.role === "assistant" && (
                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-800/80">
                      {msg.sources && msg.sources.length > 0 ? (
                        <button
                          onClick={() => setSelectedSources(msg.sources || null)}
                          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-500/10 border border-blue-500/20 text-[11px] text-blue-300 hover:bg-blue-500/20 transition-all"
                        >
                          <Library className="w-3.5 h-3.5 text-blue-400" />
                          <span>{msg.sources.length} Source Citation{msg.sources.length > 1 ? "s" : ""}</span>
                          <ExternalLink className="w-3 h-3 text-blue-400" />
                        </button>
                      ) : (
                        <div />
                      )}

                      <button
                        onClick={() => handleCopy(msg.content, i)}
                        className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-200 transition-colors px-2 py-1 rounded hover:bg-slate-800/50"
                        title="Copy text"
                      >
                        {copiedIndex === i ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="text-emerald-400 font-medium">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>

                {msg.role === "user" && (
                  <div className="w-9 h-9 rounded-xl bg-slate-800 flex items-center justify-center shrink-0 border border-slate-700 mt-1">
                    <User className="w-5 h-5 text-slate-300" />
                  </div>
                )}
              </motion.div>
            ))
          )}
        </AnimatePresence>

        {loading && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-4"
          >
            <div className="w-9 h-9 rounded-xl premium-gradient flex items-center justify-center shrink-0 shadow-lg shadow-blue-500/20">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div className="glass-card rounded-2xl px-5 py-3.5 flex items-center gap-3 border border-slate-800">
              <div className="flex gap-1.5">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="w-2 h-2 rounded-full bg-blue-400"
                    animate={{
                      scale: [1, 1.4, 1],
                      opacity: [0.4, 1, 0.4]
                    }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      delay: i * 0.2
                    }}
                  />
                ))}
              </div>
              <span className="text-xs text-slate-400 font-medium">Searching knowledge base...</span>
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Chat Input Container */}
      <div className="mt-auto pt-2">
        <div className="glass-card flex items-center gap-2 p-2 rounded-2xl border border-slate-800 focus-within:border-blue-500/50 transition-all shadow-xl">
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => onInputChange(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && onSend()}
            placeholder="Type your question..."
            className="flex-1 bg-transparent border-none outline-none text-sm px-3 py-2 text-slate-200 placeholder:text-slate-500"
          />

          <button
            onClick={onSend}
            disabled={loading || !input.trim()}
            className="premium-gradient p-3 rounded-xl transition-all shadow-lg disabled:opacity-40 disabled:cursor-not-allowed hover:scale-105 active:scale-95 shrink-0"
          >
            <Send className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>

      {/* Source Citation Modal */}
      <SourceModal
        isOpen={selectedSources !== null}
        onClose={() => setSelectedSources(null)}
        sources={selectedSources || []}
      />
    </div>
  );
}

