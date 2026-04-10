"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import { DashboardContainer, Sidebar, MainCanvas } from "@/components/ui/Layout";
import { UploadCard } from "@/components/ui/UploadCard";
import { ChatArea } from "@/components/ui/ChatArea";
import { History } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
  sources?: string[];
}

export default function Home() {
  // Upload state
  const [text, setText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [uploadLoading, setUploadLoading] = useState(false);

  // Chat state
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [askLoading, setAskLoading] = useState(false);

  const userId = "user1"; // temporary

  //  Upload document
  const handleUpload = async (rawText: string, selectedFile: File | null) => {
    if (!rawText && !selectedFile) return alert("Please provide text or select a file");

    try {
      setUploadLoading(true);

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
          source: "Manual Entry",
        });
      }

      alert("Document indexed successfully!");
      setText("");
      setFile(null);
    } catch (error) {
      console.error(error);
      alert("Upload failed. Check backend connection.");
    } finally {
      setUploadLoading(false);
    }
  };

  //  Ask question
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
          sources: res.data.sources 
        },
      ]);
    } catch (error) {
      console.error(error);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Sorry, I encountered an error connecting to the RAG system." },
      ]);
    } finally {
      setAskLoading(false);
    }
  };

  return (
    <DashboardContainer>
      <Sidebar>
        <div className="space-y-8">
          <UploadCard
            value={text}
            onChange={setText}
            selectedFile={file}
            onFileSelect={setFile}
            loading={uploadLoading}
            onUpload={handleUpload}
          />


        </div>
      </Sidebar>

      <MainCanvas>
        <ChatArea
          messages={messages}
          input={question}
          onInputChange={setQuestion}
          onSend={handleAsk}
          loading={askLoading}
        />
      </MainCanvas>
    </DashboardContainer>
  );  
}