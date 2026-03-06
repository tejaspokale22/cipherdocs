"use client";

import React from "react";
import { useState, useRef, useEffect, useCallback } from "react";
import { MessageSquare, Send, Sparkles, X } from "lucide-react";
import { motion } from "framer-motion";
import { sendChatMessage } from "@/app/lib/aiChatApi.js";
import { linkifyMessage } from "@/app/lib/linkifyMessage.js";

const ANIM_MS = 220;

const SAMPLE_QUESTIONS = [
  "How can I issue an original document through cipherdocs?",
  "How can I instantly verify a document using a QR code or verification link?",
  "How can I connect my wallet using MetaMask?",
  "How cipherdocs securely store documents?",
];

export default function CipherDocsAIAssistant() {
  const [open, setOpen] = useState(false);
  const [renderOverlay, setRenderOverlay] = useState(false);
  const [overlayVisible, setOverlayVisible] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const abortRef = useRef(null);
  const closeTimerRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (open && renderOverlay) {
      const id = requestAnimationFrame(() => {
        inputRef.current?.focus();
      });
      return () => cancelAnimationFrame(id);
    }
  }, [open, renderOverlay]);

  useEffect(() => {
    if (!open) return;
    setRenderOverlay(true);
    const id = requestAnimationFrame(() => setOverlayVisible(true));
    return () => cancelAnimationFrame(id);
  }, [open]);

  useEffect(() => {
    if (!renderOverlay) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [renderOverlay]);

  const closeChat = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setLoading(false);
    setOpen(false);
    setOverlayVisible(false);
    if (closeTimerRef.current) window.clearTimeout(closeTimerRef.current);
    closeTimerRef.current = window.setTimeout(() => {
      setRenderOverlay(false);
    }, ANIM_MS);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e) => {
      if (e.key === "Escape") {
        closeChat();
        return;
      }
      if (
        document.activeElement !== inputRef.current &&
        e.key.length === 1 &&
        !e.ctrlKey &&
        !e.altKey &&
        !e.metaKey
      ) {
        e.preventDefault();
        inputRef.current?.focus();
        setInput((prev) => prev + e.key);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, closeChat]);

  useEffect(() => {
    return () => {
      if (closeTimerRef.current) window.clearTimeout(closeTimerRef.current);
      abortRef.current?.abort();
    };
  }, []);

  const handleSend = async (overrideText) => {
    const text = (overrideText ?? input).trim();
    if (!text || loading) return;

    const userMsg = { role: "user", content: text };

    const updatedMessages = [...messages, userMsg];

    setMessages(updatedMessages);
    setInput("");
    setLoading(true);

    try {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      const history = updatedMessages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const data = await sendChatMessage(
        { message: text, history },
        controller.signal,
      );

      const reply =
        data?.success && typeof data.reply === "string"
          ? data.reply.trim()
          : "";

      if (reply) {
        setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
      } else {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: "Sorry, I couldn't process that." },
        ]);
      }
    } catch (err) {
      if (err?.name === "AbortError") return;

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Connection error. Please try again." },
      ]);
    } finally {
      abortRef.current = null;
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {!renderOverlay && (
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setOpen(true)}
          className="fixed bottom-4 right-4 z-40 flex h-16 w-16 cursor-pointer items-center justify-center rounded-full bg-black text-white shadow hover:bg-neutral-800"
        >
          <MessageSquare className="h-7 w-7" />
        </motion.button>
      )}

      {renderOverlay && (
        <div className="fixed inset-0 z-40 flex items-stretch justify-stretch p-0 sm:items-end sm:justify-end sm:p-4">
          <button
            onClick={closeChat}
            className="absolute inset-0"
            aria-hidden="true"
          />

          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="relative flex flex-col h-full w-full min-h-screen overflow-hidden rounded-none bg-black/90 backdrop-blur-sm sm:h-[70vh] sm:min-h-0 sm:max-h-[600px] sm:w-[95vw] sm:max-w-[420px] sm:rounded-2xl"
          >
            <div className="flex shrink-0 items-center justify-between px-4 py-3">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-neutral-800">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
                <span className="text-lg font-medium text-white">
                  cipherdocs ai assistant
                </span>
              </div>
              <button
                onClick={closeChat}
                className="cursor-pointer rounded-lg p-2 text-neutral-500 transition hover:bg-neutral-800 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-x-hidden overflow-y-auto p-4">
              {messages.length === 0 && !loading && (
                <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-6 px-1">
                  <div className="flex flex-col items-center gap-2 text-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-neutral-800/80">
                      <MessageSquare className="h-8 w-8 text-neutral-500" />
                    </div>
                    <div>
                      <p className="text-base font-medium text-white">
                        How can I help?
                      </p>
                      <p className="mt-1 text-sm text-neutral-500">
                        Choose a query below or type your own.
                      </p>
                    </div>
                  </div>
                  <div className="grid w-full max-w-[370px] grid-cols-1 gap-2 sm:grid-cols-2">
                    {SAMPLE_QUESTIONS.map((q, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => handleSend(q)}
                        className="rounded-xl border-2 border-neutral-700 bg-neutral-900/80 px-1.5 py-2 cursor-pointer text-left text-[13px] leading-snug text-neutral-300 transition hover:border-gray-400 hover:bg-neutral-800 hover:text-white"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <ChatMessage key={i} msg={msg} />
                </motion.div>
              ))}

              {loading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start"
                >
                  <div className="flex max-w-[80%] items-center gap-1 rounded-xl bg-[#303030] px-4 py-3">
                    <motion.span
                      animate={{ y: [0, -4, 0] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                      className="h-2 w-2 rounded-full bg-white"
                    />
                    <motion.span
                      animate={{ y: [0, -4, 0] }}
                      transition={{
                        duration: 0.6,
                        repeat: Infinity,
                        delay: 0.2,
                      }}
                      className="h-2 w-2 rounded-full bg-white"
                    />
                    <motion.span
                      animate={{ y: [0, -4, 0] }}
                      transition={{
                        duration: 0.6,
                        repeat: Infinity,
                        delay: 0.4,
                      }}
                      className="h-2 w-2 rounded-full bg-white"
                    />
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            <div className="flex items-center gap-2 p-4">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask anything"
                disabled={loading}
                className="flex-1 rounded-full bg-[#303030] px-4 py-2.5 text-sm text-white placeholder:text-neutral-400 focus outline-none focus:ring-1 focus:ring-gray-300"
              />

              <button
                onClick={() => handleSend()}
                disabled={!input.trim() || loading}
                className="flex cursor-pointer items-center justify-center text-white hover:text-neutral-300 disabled:cursor-not-allowed"
              >
                <Send className="h-5 w-5" />
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
}

const ChatMessage = React.memo(({ msg }) => {
  const content =
    msg.role === "assistant" ? linkifyMessage(msg.content) : msg.content;

  return (
    <div
      className={`max-w-[80%] min-w-0 rounded-xl px-4 py-2 text-sm wrap-break-word text-white ${msg.role === "user" ? "bg-[#2a2a2a]" : "bg-[#3c3c3c]"}`}
    >
      {content}
    </div>
  );
});
