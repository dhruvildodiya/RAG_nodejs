"use client";

import React, { useState, useEffect, useRef } from "react";
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
    "What is Zignuts and what services do they offer?",
    "Summarize key technical points from the uploaded documents",
    "What AWS and database services are covered?",
    "List specific architecture recommendations found in knowledge base",
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
    <div className="flex flex-col h-full relative px-2 md:px-6 py-4 bg-slate-100 dark:bg-[#151a26] transition-colors duration-200">
      {/* Top Header Session Controls */}
      {messages.length > 0 && (
        <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-200 dark:border-[#222b3e]">
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-mono">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-sm" />
            <span>Active Knowledge Session</span>
            <span>•</span>
            <span className="text-slate-400 dark:text-slate-500">{messages.length} messages</span>
          </div>
          {onClearChat && (
            <button
              onClick={onClearChat}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg neu-btn-secondary text-xs text-slate-600 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-all cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear Chat</span>
            </button>
          )}
        </div>
      )}

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto pr-1 pb-24">
        {messages.length === 0 ? (
          <div className="h-full min-h-[350px] py-6 flex flex-col items-center justify-center space-y-5">
            <div className="w-12 h-12 md:w-16 md:h-16 rounded-2xl neu-pressed flex items-center justify-center text-blue-600 dark:text-blue-400">
              <Sparkles className="w-6 h-6 md:w-8 md:h-8" />
            </div>

            <div className="text-center space-y-1.5 max-w-lg px-2">
              <h2 className="text-base md:text-xl font-bold text-slate-800 dark:text-white tracking-tight">
                Ask Anything From Knowledge Base
              </h2>
              <p className="text-[11px] md:text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Query indexed documents in real time. Retrieve facts, summarize topics, and inspect exact source citations.
              </p>
            </div>

            <div className="w-full max-w-xl px-1">
              <p className="text-[10px] md:text-[11px] font-bold text-slate-400 dark:text-slate-400 mb-2.5 uppercase tracking-wider font-mono">
                Suggested Starters
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      onInputChange(suggestion);
                      inputRef.current?.focus();
                    }}
                    className="p-3 rounded-xl neu-card text-left text-[11px] md:text-xs text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-white transition-all flex items-start gap-2.5 cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                    <span className="leading-snug">{suggestion}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4 pb-4">
            {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex gap-2.5 md:gap-3.5 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {msg.role === "assistant" && (
                <div className="w-7 h-7 md:w-9 md:h-9 rounded-xl neu-pressed flex items-center justify-center shrink-0 text-blue-600 dark:text-blue-400 mt-1">
                  <Bot className="w-4 h-4 md:w-4.5 md:h-4.5" />
                </div>
              )}

              <div
                className={`max-w-[88%] md:max-w-[85%] rounded-2xl px-4 py-3 md:px-5 md:py-4 text-xs md:text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "neu-btn-primary text-white"
                    : "neu-flat text-slate-800 dark:text-slate-200"
                }`}
              >
                <p className="whitespace-pre-line font-normal leading-relaxed">{msg.content}</p>

                {/* Actions Bar for Assistant Message */}
                {msg.role === "assistant" && (
                  <div className="flex items-center justify-between mt-2.5 pt-2.5 border-t border-slate-200 dark:border-[#222b3e]">
                    {msg.sources && msg.sources.length > 0 ? (
                      <button
                        onClick={() => setSelectedSources(msg.sources || null)}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-lg neu-pressed text-[10px] md:text-[11px] text-blue-600 dark:text-blue-300 hover:text-blue-700 dark:hover:text-blue-200 transition-all font-mono cursor-pointer"
                      >
                        <Library className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                        <span>{msg.sources.length} Citation{msg.sources.length > 1 ? "s" : ""}</span>
                        <ExternalLink className="w-2.5 h-2.5 text-blue-600 dark:text-blue-400" />
                      </button>
                    ) : (
                      <div />
                    )}

                    <button
                      onClick={() => handleCopy(msg.content, i)}
                      className="flex items-center gap-1 text-[10px] md:text-[11px] text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors px-2 py-0.5 md:px-2.5 md:py-1 rounded-lg neu-pressed font-mono cursor-pointer"
                    >
                      {copiedIndex === i ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                          <span className="text-emerald-600 dark:text-emerald-400">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>

              {msg.role === "user" && (
                <div className="w-7 h-7 md:w-9 md:h-9 rounded-xl neu-pressed flex items-center justify-center shrink-0 text-slate-600 dark:text-slate-300 mt-1">
                  <User className="w-4 h-4 md:w-4.5 md:h-4.5" />
                </div>
              )}
            </div>
          ))}
        </div>
      )}

        {loading && (
          <div className="flex gap-2.5 md:gap-3.5">
            <div className="w-7 h-7 md:w-9 md:h-9 rounded-xl neu-pressed flex items-center justify-center shrink-0 text-blue-600 dark:text-blue-400">
              <Bot className="w-4 h-4 md:w-4.5 md:h-4.5" />
            </div>
            <div className="px-4 py-3 md:px-5 md:py-3.5 rounded-2xl neu-flat flex items-center gap-2.5">
              <div className="flex gap-1.5">
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-blue-500 dark:bg-blue-400 animate-pulse"
                    style={{ animationDelay: `${i * 0.2}s` }}
                  />
                ))}
              </div>
              <span className="text-[11px] md:text-xs text-slate-500 dark:text-slate-400 font-mono">Generating Response...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Floating Prompt Bar */}
      <div className="sticky bottom-2 left-0 right-0 z-20 pt-2 pb-1 bg-slate-100 dark:bg-[#151a26]">
        <div className="neu-pressed flex items-center gap-1.5 p-1.5 md:p-2 rounded-2xl border border-slate-300 dark:border-[#232c3f]">
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => onInputChange(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && onSend()}
            placeholder="Ask a question..."
            className="flex-1 bg-transparent border-none outline-none text-xs md:text-sm px-3 md:px-4 py-1.5 md:py-2 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 min-w-0"
          />

          <button
            onClick={onSend}
            disabled={loading || !input.trim()}
            className="neu-btn-primary p-2.5 md:p-3 rounded-xl text-white shrink-0 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
          >
            <Send className="w-3.5 h-3.5 md:w-4 md:h-4" />
          </button>
        </div>
      </div>

      {/* Source Modal Drawer */}
      <SourceModal
        isOpen={selectedSources !== null}
        onClose={() => setSelectedSources(null)}
        sources={selectedSources || []}
      />
    </div>
  );
}

