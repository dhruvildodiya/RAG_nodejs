"use client";

import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api";
import { DashboardContainer, Sidebar, MainCanvas } from "@/components/ui/Layout";
import { Navbar } from "@/components/ui/Navbar";
import { UploadCard } from "@/components/ui/UploadCard";
import { ChatArea } from "@/components/ui/ChatArea";
import { DocumentLibrary, IndexedDoc } from "@/components/ui/DocumentLibrary";
import { LandingPage } from "@/components/ui/LandingPage";
import { AuthModal } from "@/components/ui/AuthModal";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { Play, Lock } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
  sources?: string[];
}

export default function Home() {
  const { user, scope } = useAuth();
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  // Navigation View Tab
  const [activeTab, setActiveTab] = useState<"chat" | "documents">("chat");

  // Upload state
  const [text, setText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [uploadLoading, setUploadLoading] = useState(false);

  // Document Library state
  const [documents, setDocuments] = useState<IndexedDoc[]>([]);

  // Chat state
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  // Conversation History state
  const [conversations, setConversations] = useState<{ id: string; title: string; updated_at: string }[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [askLoading, setAskLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Generate or retrieve unique guest session ID per browser for sandbox isolation
  const [guestId, setGuestId] = useState<string>("");

  useEffect(() => {
    let savedGuestId = localStorage.getItem("nexus_rag_guest_id");
    if (!savedGuestId) {
      savedGuestId = `demo_guest_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      localStorage.setItem("nexus_rag_guest_id", savedGuestId);
    }
    setGuestId(savedGuestId);
  }, []);

  const activeUserId = user?.id || guestId || "demo_guest_user";

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const fetchDocuments = useCallback(async () => {
    try {
      const res = await api.get(`/documents?userId=${activeUserId}&scope=${scope}`);
      if (res.data && Array.isArray(res.data)) {
        setDocuments(res.data);
      }
    } catch (err) {
      console.error("Failed to fetch documents from database:", err);
    }
  }, [activeUserId, scope]);

  const fetchConversations = useCallback(async () => {
    try {
      const res = await api.get(`/conversations?userId=${activeUserId}&scope=${scope}`);
      if (res.data && Array.isArray(res.data)) {
        setConversations(res.data);
      }
    } catch (err) {
      console.error("Failed to fetch conversations from database:", err);
    }
  }, [activeUserId, scope]);

  useEffect(() => {
    fetchDocuments();
    fetchConversations();
  }, [fetchDocuments, fetchConversations]);

  const handleSelectConversation = async (id: string) => {
    try {
      setActiveConversationId(id);
      const res = await api.get(`/conversations/${id}/messages`);
      if (res.data && Array.isArray(res.data)) {
        setMessages(
          res.data.map((m: any) => ({
            role: m.role,
            content: m.content,
            sources: m.sources,
          }))
        );
      }
    } catch (err) {
      console.error("Failed to load conversation messages:", err);
    }
  };

  const handleNewChat = () => {
    setActiveConversationId(null);
    setMessages([]);
  };

  const handleDeleteConversation = async (id: string) => {
    try {
      await api.delete(`/conversations/${id}`);
      if (activeConversationId === id) {
        handleNewChat();
      }
      await fetchConversations();
      showToast("Conversation deleted");
    } catch (err) {
      console.error("Failed to delete conversation:", err);
    }
  };

  // Upload document handler
  const handleUpload = async (rawText: string, selectedFile: File | null) => {
    if (!rawText && !selectedFile) {
      showToast("Please provide text or attach a file to index");
      return;
    }

    try {
      setUploadLoading(true);

      const sourceName = selectedFile ? selectedFile.name : "Manual Entry Text";

      if (selectedFile) {
        const formData = new FormData();
        formData.append("file", selectedFile);
        formData.append("userId", activeUserId);
        formData.append("source", selectedFile.name);
        formData.append("scope", scope);

        await api.post("/upload", formData);
      } else {
        await api.post("/upload", {
          text: rawText,
          userId: activeUserId,
          source: sourceName,
          scope,
        });
      }

      await fetchDocuments();
      showToast(`Document indexed successfully in ${scope === "org" ? "Organization" : "Individual"} workspace!`);
      setText("");
      setFile(null);
    } catch (error: any) {
      console.error(error);
      const errMsg = error.response?.data?.message || "Upload failed. Ensure backend server is running.";
      showToast(errMsg);
      if (error.response?.data?.isDemoLimit) {
        setTimeout(() => setIsAuthOpen(true), 800);
      }
    } finally {
      setUploadLoading(false);
    }
  };

  // Ask question handler
  const handleAsk = async () => {
    if (!question.trim()) return;

    const userMsg = question;
    setQuestion("");
    setMessages((prev) => [...prev, { role: "user", content: userMsg }]);

    try {
      setAskLoading(true);

      const res = await api.post("/ask", {
        question: userMsg,
        userId: activeUserId,
        conversationId: activeConversationId,
        scope,
      });

      if (res.data.conversationId) {
        setActiveConversationId(res.data.conversationId);
        fetchConversations();
      }

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: res.data.answer,
          sources: res.data.sources,
        },
      ]);
    } catch (error: any) {
      console.error(error);
      const errMsg = error.response?.data?.error || error.response?.data?.message || "Sorry, I encountered an error processing your query.";
      
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: errMsg,
        },
      ]);

      if (error.response?.data?.isDemoLimit) {
        showToast(errMsg);
        setTimeout(() => setIsAuthOpen(true), 800);
      }
    } finally {
      setAskLoading(false);
    }
  };

  const handleDeleteDoc = async (id: string) => {
    const docToDelete = documents.find((d) => d.id === id);
    if (!docToDelete) return;

    try {
      await api.delete("/documents", {
        data: { source: docToDelete.name, userId: activeUserId, scope },
      });
      await fetchDocuments();
      showToast("Document removed from database");
    } catch (err) {
      console.error(err);
      showToast("Failed to delete document from database");
    }
  };

  // Render Landing Page for Unauthenticated Visitors
  if (!user && !isDemoMode) {
    return (
      <>
        <LandingPage
          onOpenAuth={() => setIsAuthOpen(true)}
          onStartDemo={() => setIsDemoMode(true)}
        />
        <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
      </>
    );
  }

  return (
    <DashboardContainer>
      <Sidebar>
        <UploadCard
          value={text}
          onChange={setText}
          selectedFile={file}
          onFileSelect={setFile}
          loading={uploadLoading}
          onUpload={handleUpload}
        />
      </Sidebar>

      <MainCanvas>
        <div className="flex flex-col h-full w-full">
          <Navbar
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            documentCount={documents.length}
            onExitDemo={!user && isDemoMode ? () => setIsDemoMode(false) : undefined}
          />

          {/* Demo Sandbox Banner */}
          {!user && isDemoMode && (
            <div className="bg-gradient-to-r from-blue-600/90 via-indigo-600/90 to-blue-700/90 text-white px-4 py-2 text-xs font-bold flex items-center justify-between shadow-md shrink-0 gap-2">
              <div className="flex items-center gap-2">
                <Play className="w-3.5 h-3.5 fill-white animate-pulse" />
                <span>You are in Demo Sandbox Mode. Documents uploaded here are temporary.</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsDemoMode(false)}
                  className="px-2.5 py-1 rounded-lg bg-white/20 hover:bg-white/30 text-white font-extrabold transition-all text-[11px] cursor-pointer"
                >
                  ← Exit Demo
                </button>
                <button
                  onClick={() => setIsAuthOpen(true)}
                  className="px-3 py-1 rounded-lg bg-white text-blue-700 font-extrabold hover:bg-slate-100 transition-all text-[11px] flex items-center gap-1 cursor-pointer"
                >
                  <Lock className="w-3 h-3" />
                  <span>Sign In to Save Docs</span>
                </button>
              </div>
            </div>
          )}

          <div className="flex-1 p-4 md:p-8 overflow-hidden relative">
            {/* Custom Toast Alert */}
            <AnimatePresence>
              {toastMessage && (
                <motion.div
                  initial={{ opacity: 0, y: -15, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -15, scale: 0.95 }}
                  className="absolute top-4 right-6 z-50 px-4 py-2.5 rounded-xl bg-slate-900/90 border border-indigo-500/40 text-xs font-semibold text-indigo-200 shadow-2xl backdrop-blur-xl flex items-center gap-2.5"
                >
                  <span className="w-2 h-2 rounded-full bg-indigo-400 animate-ping" />
                  <span>{toastMessage}</span>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="h-full max-w-5xl mx-auto">
              {activeTab === "chat" ? (
                <ChatArea
                  messages={messages}
                  input={question}
                  onInputChange={setQuestion}
                  onSend={handleAsk}
                  onClearChat={() => setMessages([])}
                  loading={askLoading}
                  conversations={conversations}
                  activeConversationId={activeConversationId}
                  onSelectConversation={handleSelectConversation}
                  onNewChat={handleNewChat}
                  onDeleteConversation={handleDeleteConversation}
                />
              ) : (
                <DocumentLibrary
                  documents={documents}
                  onDeleteDoc={handleDeleteDoc}
                />
              )}
            </div>
          </div>
        </div>
      </MainCanvas>

      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </DashboardContainer>
  );
}