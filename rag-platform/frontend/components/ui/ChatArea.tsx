"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, User, Bot, Sparkles, Loader2, Mic, Paperclip, MoreVertical, Library, ExternalLink } from "lucide-react";

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
  loading: boolean;
}

export function ChatArea({
  messages,
  input,
  onInputChange,
  onSend,
  loading,
}: ChatAreaProps) {
  const [isTyping, setIsTyping] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(messages.length === 0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const suggestions = [
    "What are the key findings in my documents?",
    "Summarize the main topics covered",
    "What data sources were used?",
    "Find information about specific topics"
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    setShowSuggestions(messages.length === 0);
  }, [messages]);

  const handleInputChange = (value: string) => {
    onInputChange(value);
    setIsTyping(value.length > 0);
  };

  const handleSuggestionClick = (suggestion: string) => {
    onInputChange(suggestion);
    inputRef.current?.focus();
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto space-y-6 pb-20 scroll-smooth pr-4 bg-transparent">
        <AnimatePresence initial={false}>
          {messages.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="h-full flex flex-col items-center justify-center text-slate-500 space-y-8"
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
                className="w-16 h-16 sm:w-24 sm:h-24 rounded-2xl sm:rounded-3xl premium-gradient flex items-center justify-center border border-white/20 backdrop-blur-md shadow-2xl"
              >
                <Sparkles className="w-8 h-8 sm:w-12 sm:h-12 text-white" />
              </motion.div>

              <div className="text-center space-y-3 sm:space-y-4">
                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-2xl sm:text-3xl font-bold bg-linear-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2"
                >
                  Welcome to RAG Platform
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-sm sm:text-base text-slate-300 max-w-lg leading-relaxed px-4"
                >
                  Ask anything about your knowledge base. I'll search through your documents to find the most relevant information using advanced AI.
                </motion.p>

              </div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="w-full max-w-2xl"
              >
                <p className="text-xs sm:text-sm text-slate-400 mb-3 sm:mb-4 text-center font-medium">Popular Questions</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  {suggestions.map((suggestion, index) => (
                    <motion.button
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 + index * 0.1 }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="glass-card rounded-xl sm:rounded-2xl p-3 sm:p-4 text-left text-xs sm:text-sm text-slate-300 hover:border-blue-500/30 hover:bg-blue-500/10 transition-all group"
                    >
                      <div className="flex items-start gap-2 sm:gap-3">
                        <motion.div
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 2, repeat: Infinity, delay: index * 0.2 }}
                          className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-blue-400 mt-1 sm:mt-1.5 shrink-0"
                        />
                        <span className="group-hover:text-blue-400 transition-colors leading-relaxed text-xs sm:text-sm">{suggestion}</span>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          ) : (
            messages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 25,
                  delay: i * 0.1
                }}
                className={`flex gap-4 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {msg.role === "assistant" && (
                  <motion.div
                    initial={{ rotate: -180, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                    className="w-10 h-10 rounded-xl premium-gradient flex items-center justify-center shrink-0 shadow-lg"
                  >
                    <Bot className="w-6 h-6 text-white" />
                  </motion.div>
                )}

                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 }}
                  className={`max-w-[85%] rounded-2xl px-6 py-4 text-sm leading-relaxed relative group ${msg.role === "user"
                    ? "bg-linear-to-br from-blue-600 to-blue-500 text-white shadow-lg"
                    : "glass-card text-slate-200 border border-blue-500/20"
                    }`}
                >
                  {msg.role === "assistant" && (
                    <motion.div
                      className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/50"
                      animate={{ scale: [1, 1.3, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  )}
                  <p className="whitespace-pre-line font-medium mb-3">{msg.content}</p>

                  {msg.role === "assistant" && msg.sources && msg.sources.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                      className="mt-4 pt-4 border-t border-blue-500/20"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <Library className="w-3.5 h-3.5 text-blue-400" />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-blue-400/80">Sources used</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {msg.sources.map((source, idx) => (
                          <div
                            key={idx}
                            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-500/10 border border-blue-500/20 text-[10px] text-slate-300 font-medium hover:bg-blue-500/20 hover:border-blue-500/30 transition-all cursor-default"
                          >
                            <ExternalLink className="w-2.5 h-2.5 text-blue-400" />
                            {source}
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  <motion.div
                    className="absolute -bottom-0.5 left-1/2 transform -translate-x-1/2 w-12 h-0.5 bg-current opacity-30 scale-x-0 group-hover:scale-x-100 transition-transform origin-center rounded-full"
                  />
                </motion.div>

                {msg.role === "user" && (
                  <motion.div
                    initial={{ rotate: 180, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                    className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center shrink-0 border border-slate-700 group-hover:border-blue-500/30 transition-all"
                  >
                    <User className="w-6 h-6 text-slate-400 group-hover:text-blue-400 transition-colors" />
                  </motion.div>
                )}
              </motion.div>
            ))
          )}
        </AnimatePresence>

        {loading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-4"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="w-10 h-10 rounded-xl premium-gradient flex items-center justify-center shrink-0 shadow-lg"
            >
              <Bot className="w-6 h-6 text-white" />
            </motion.div>
            <motion.div
              className="glass-card rounded-2xl px-6 py-4 flex items-center gap-4 border border-blue-500/20"
              animate={{
                scale: [1, 1.02, 1],
                opacity: [0.9, 1, 0.9]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <div className="flex gap-2">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="w-2.5 h-2.5 rounded-full bg-blue-400 shadow-lg shadow-blue-400/50"
                    animate={{
                      scale: [1, 1.5, 1],
                      opacity: [0.6, 1, 0.6],
                      y: [0, -3, 0]
                    }}
                    transition={{
                      duration: 1.2,
                      repeat: Infinity,
                      delay: i * 0.15,
                      ease: "easeInOut"
                    }}
                  />
                ))}
              </div>
              <span className="text-sm text-slate-300 font-medium">AI is thinking...</span>
            </motion.div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="relative mt-auto">

        <motion.div
          className="glass-card flex gap-2 sm:gap-4 p-2 sm:p-3 rounded-xl sm:rounded-2xl shadow-2xl border border-blue-500/20"
          animate={{
            scale: isTyping ? [1, 1.01, 1] : 1,
          }}
          transition={{ duration: 0.3 }}
        >
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => handleInputChange(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && onSend()}
            placeholder="Ask anything about your knowledge base..."
            className="flex-1 bg-transparent border-none focus:ring-0 text-sm sm:text-base px-3 py-2 sm:px-4 sm:py-3 outline-none placeholder:text-slate-500 font-medium"
          />

          <motion.button
            onClick={onSend}
            disabled={loading || !input.trim()}
            className="premium-gradient p-2 sm:p-3 rounded-lg sm:rounded-xl transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden"
            whileHover={{ scale: 1.05, boxShadow: "0 10px 30px rgba(102, 126, 234, 0.3)" }}
            whileTap={{ scale: 0.95 }}
          >
            <motion.div
              className="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent"
              initial={{ x: "-100%" }}
              whileHover={{ x: "100%" }}
              transition={{ duration: 0.6 }}
            />
            <Send className="w-4 h-4 sm:w-5 sm:h-5 text-white relative z-10" />
          </motion.button>
        </motion.div>

        <motion.div
          className="flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-0 mt-3 sm:mt-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-emerald-500 animate-pulse shadow-lg shadow-emerald-500/50" />
            <span className="text-[10px] sm:text-xs text-emerald-400 font-medium hidden xs:inline">System Active</span>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="text-[10px] sm:text-xs text-slate-500 hidden xs:inline">RAG Platform</span>
            <div className="w-1 h-1 rounded-full bg-slate-600 hidden xs:inline" />
            <span className="text-[10px] sm:text-xs text-blue-400 font-mono hidden xs:inline">v2.0</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
