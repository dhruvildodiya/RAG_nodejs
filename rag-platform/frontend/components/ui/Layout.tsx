"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Database, ShieldCheck, Zap, Menu, X } from "lucide-react";

export function DashboardContainer({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen w-full overflow-hidden" style={{ backgroundColor: 'var(--background)', color: 'var(--foreground)' }}>
      {/* Premium Background Effects */}
      <div className="fixed top-[-20%] left-[-20%] w-[60%] h-[60%] opacity-30">
        <div className="w-full h-full rounded-full blur-[150px]" style={{ background: 'var(--primary-gradient)' }} />
      </div>
      <div className="fixed bottom-[-20%] right-[-20%] w-[60%] h-[60%] opacity-20">
        <div className="w-full h-full rounded-full blur-[150px]" style={{ background: 'var(--accent-gradient)' }} />
      </div>
      
      {/* Animated Background Particles */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-blue-400 rounded-full opacity-20"
            style={{
              left: `${(i * 5 + 10) % 90}%`,
              top: `${(i * 7 + 15) % 80}%`,
              animation: `float ${10 + (i % 10) * 2}s ease-in-out infinite`,
              animationDelay: `${(i % 5) * 1}s`
            }}
          />
        ))}
      </div>
      
      {children}
    </div>
  );
}

export function Sidebar({ children }: { children: React.ReactNode }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const checkDesktop = () => setIsDesktop(window.innerWidth >= 1024); 
    checkDesktop();
    window.addEventListener('resize', checkDesktop);
    return () => window.removeEventListener('resize', checkDesktop);
  }, []);

  return (
    <>
      {/* Mobile Menu Toggle */}
      <motion.button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="fixed top-4 left-4 z-50 lg:hidden p-2 glass rounded-lg"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <AnimatePresence mode="wait">
          {isMobileMenuOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <X className="w-5 h-5 text-slate-300" />
            </motion.div>
          ) : (
            <motion.div
              key="menu"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Menu className="w-5 h-5 text-slate-300" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileMenuOpen(false)}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ 
          x: isDesktop || isMobileMenuOpen ? 0 : -320,
          transition: { type: "spring", stiffness: 300, damping: 30 }
        }}
        className="fixed lg:relative w-80 lg:w-80 md:w-64 sm:w-56 h-full glass border-r border-slate-800/50 flex flex-col p-3 sm:p-4 md:p-6 z-50 lg:z-10 shrink-0"
      >
      {/* Premium Branding */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-8 md:mb-10"
      >
        <div className="flex items-center gap-3 px-2">
          <motion.div
            whileHover={{ scale: 1.1, rotate: 360 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className="premium-gradient w-12 h-12 rounded-2xl flex items-center justify-center shadow-2xl"
          >
            <Zap className="w-7 h-7 text-white" />
          </motion.div>
          <div className="flex flex-col">
            <motion.h1 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="hidden md:block text-2xl font-bold bg-linear-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent"
            >
              RAG Platform
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="hidden md:block text-xs text-slate-400 tracking-wider uppercase"
            >
              AI-Powered Knowledge
            </motion.p>
            <div className="md:hidden">
              <h1 className="text-xl font-bold bg-linear-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                RAG
              </h1>
            </div>
          </div>
        </div>
      </motion.div>
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="flex-1 overflow-y-auto space-y-6"
      >
        {children}
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-auto pt-6 border-t border-slate-800/50 space-y-3"
      >
        <div className="glass-card rounded-xl p-3 space-y-2">
          <div className="flex items-center gap-3 text-xs">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-lg shadow-emerald-500/50" />
            <span className="text-emerald-400 font-medium">Database Online</span>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <Database className="w-4 h-4 text-blue-400 shrink-0" />
            <span className="text-slate-400">PostgreSQL + pgvector</span>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <ShieldCheck className="w-4 h-4 text-purple-400 shrink-0" />
            <span className="text-slate-400">User: user1</span>
          </div>
        </div>
      </motion.div>
    </motion.aside>
    </>
  );
}

export function MainCanvas({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex-1 flex flex-col h-full z-10 relative">
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="h-16 sm:h-20 glass border-b border-slate-800/50 flex items-center px-3 sm:px-4 md:px-8 justify-between"
      >
        <div className="flex items-center gap-2 sm:gap-4 ml-14 sm:ml-0">
          <div className=" font-extrabold text-2xl ">RAG-Platform</div>
        </div>
        
        <div className="flex items-center gap-2 sm:gap-4">
          
        </div>
      </motion.header>
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.6 }}
        className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-8 flex justify-center"
      >
        <div className="max-w-5xl w-full h-full flex flex-col px-2 xs:px-0">
          {children}
        </div>
      </motion.div>
    </main>
  );
}
