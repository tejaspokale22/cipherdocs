"use client";

import { useState, useRef, useEffect } from "react";
import {
  MessageSquare,
  Send,
  Loader2,
  FileText,
  Sparkles,
  X,
} from "lucide-react";
import { askQuestion, chatWithDocument } from "@/app/lib/aiEnhancedApi";
import ReactMarkdown from "react-markdown";

/**
 * Document Q&A Component
 * Ask questions about certificates using RAG
 */
export default function DocumentQA({ certificateId, mode = "question" }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setLoading(true);

    try {
      let response;

      if (mode === "chat") {
        // Chat mode with history
        const history = messages.map((m) => ({
          role: m.role,
          content: m.content,
        }));
        response = await chatWithDocument(userMessage, certificateId, history);
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: response.response,
            sources: response.sources,
          },
        ]);
      } else {
        // Question mode
        response = await askQuestion(userMessage, certificateId);
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: response.answer,
            sources: response.sources,
            confidence: response.confidence,
          },
        ]);
      }
    } catch (error) {
      console.error("Q&A error:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, I couldn't process your question. Please try again.",
          error: true,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const sampleQuestions = [
    "What is the certificate number?",
    "When was this certificate issued?",
    "Who is the recipient?",
    "What is the expiry date?",
  ];

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-full bg-black px-6 py-3 text-white shadow-lg transition-all hover:scale-105 hover:bg-gray-800"
      >
        <MessageSquare className="h-5 w-5" />
        <span className="font-medium">Ask about this certificate</span>
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex h-[600px] w-[400px] flex-col rounded-lg border border-gray-200 bg-white shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 bg-black p-4 text-white">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5" />
          <h3 className="font-semibold">Document Q&A</h3>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="rounded-full p-1 transition-colors hover:bg-white/10"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        {messages.length === 0 && (
          <div className="space-y-4">
            <div className="rounded-lg bg-gray-50 p-4">
              <p className="mb-3 text-sm text-gray-600">
                Ask me anything about this certificate:
              </p>
              <div className="space-y-2">
                {sampleQuestions.map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => setInput(q)}
                    className="w-full rounded-lg border border-gray-200 bg-white p-3 text-left text-sm text-gray-700 transition-colors hover:bg-gray-50"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] rounded-lg p-3 ${
                msg.role === "user"
                  ? "bg-black text-white"
                  : msg.error
                    ? "bg-red-50 text-red-900"
                    : "bg-gray-100 text-gray-900"
              }`}
            >
              <div className="prose prose-sm max-w-none">
                <ReactMarkdown>{msg.content}</ReactMarkdown>
              </div>

              {msg.confidence !== undefined && (
                <div className="mt-2 text-xs opacity-70">
                  Confidence: {(msg.confidence * 100).toFixed(0)}%
                </div>
              )}

              {msg.sources && msg.sources.length > 0 && (
                <div className="mt-3 space-y-1 border-t border-gray-200 pt-2">
                  <p className="text-xs font-medium opacity-70">Sources:</p>
                  {msg.sources.map((source, sidx) => (
                    <div
                      key={sidx}
                      className="rounded bg-white/50 p-2 text-xs"
                    >
                      <p className="line-clamp-2">{source.text}</p>
                      <p className="mt-1 opacity-60">
                        Relevance: {(source.score * 100).toFixed(0)}%
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="rounded-lg bg-gray-100 p-3">
              <Loader2 className="h-5 w-5 animate-spin text-gray-600" />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form
        onSubmit={handleSubmit}
        className="border-t border-gray-200 bg-gray-50 p-4"
      >
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question..."
            disabled={loading}
            className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black disabled:bg-gray-100"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="rounded-lg bg-black px-4 py-2 text-white transition-colors hover:bg-gray-800 disabled:bg-gray-300"
          >
            <Send className="h-5 w-5" />
          </button>
        </div>
      </form>
    </div>
  );
}
