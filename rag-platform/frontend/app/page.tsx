"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { DashboardContainer, Sidebar, MainCanvas } from "@/components/ui/Layout";
import { Navbar } from "@/components/ui/Navbar";
import { UploadCard } from "@/components/ui/UploadCard";
import { ChatArea } from "@/components/ui/ChatArea";
import { DocumentLibrary, IndexedDoc } from "@/components/ui/DocumentLibrary";
import { motion, AnimatePresence } from "framer-motion";

interface Message {
  role: "user" | "assistant";
  content: string;
  sources?: string[];
}

export default function Home() {
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
  const [askLoading, setAskLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const userId = "user1";

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const fetchDocuments = async () => {
    try {
      const res = await api.get(`/documents?userId=${userId}`);
      if (res.data && Array.isArray(res.data)) {
        setDocuments(res.data);
      }
    } catch (err) {
      console.error("Failed to fetch documents from database:", err);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

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
        formData.append("userId", userId);
        formData.append("source", selectedFile.name);

        await api.post("/upload", formData);
      } else {
        await api.post("/upload", {
          text: rawText,
          userId,
          source: sourceName,
        });
      }

      await fetchDocuments();
      showToast("Document indexed and vectorized successfully!");
      setText("");
      setFile(null);
    } catch (error) {
      console.error(error);
      showToast("Upload failed. Ensure backend API server is online.");
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
        userId,
      });

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: res.data.answer,
          sources: res.data.sources,
        },
      ]);
    } catch (error) {
      console.error(error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, I encountered an error connecting to the RAG backend server. Please verify vector database state.",
        },
      ]);
    } finally {
      setAskLoading(false);
    }
  };

  const handleDeleteDoc = async (id: string) => {
    const docToDelete = documents.find((d) => d.id === id);
    if (!docToDelete) return;

    try {
      await api.delete("/documents", {
        data: { source: docToDelete.name, userId },
      });
      await fetchDocuments();
      showToast("Document removed from database");
    } catch (err) {
      console.error(err);
      showToast("Failed to delete document from database");
    }
  };

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
          />

          <div className="flex-1 p-4 md:p-8 overflow-hidden relative">
            {/* Custom Toast Alert */}
            <AnimatePresence>
              {toastMessage && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="absolute top-4 right-8 z-50 px-4 py-2.5 rounded-xl glass-card border border-blue-500/30 text-xs font-semibold text-blue-200 shadow-2xl flex items-center gap-2"
                >
                  <div className="w-2 h-2 rounded-full bg-blue-400 animate-ping" />
                  {toastMessage}
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
    </DashboardContainer>
  );
}