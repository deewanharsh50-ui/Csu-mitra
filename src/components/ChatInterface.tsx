import { getFallbackCsuResponse } from "../utils/csuBrain";
import React, { useState, useRef, useEffect } from "react";
import Markdown from "react-markdown";
import {
  Send,
  Image as ImageIcon,
  X,
  Volume2,
  VolumeX,
  Copy,
  Check,
  RotateCcw,
  Sparkles,
  AlertCircle,
  FileText,
  Paperclip,
  Database,
  Clock,
  ChevronRight,
  MessageSquare,
  Download,
  Share2,
  PanelLeft,
  SquarePen,
  Plus,
  GraduationCap,
  Building2,
  Languages,
  Mic,
} from "lucide-react";
import { VoiceAssistantModal } from "./VoiceAssistantModal";

// 3 ChatGPT-style AI actions for CSU Mitra
const AI_QUICK_ACTIONS = [
  {
    icon: Languages,
    title: "Sanskrit translation & grammar",
    query: "कृपया संस्कृत अनुवाद एवं व्याकरण संबंधी मुख्य नियमों की जानकारी दें।",
  },
  {
    icon: GraduationCap,
    title: "Admissions & course details",
    query: "केन्द्रीय संस्कृत विश्वविद्यालय (CSU) के पाठ्यक्रमों, शास्त्री-आचार्य एवं प्रवेश प्रक्रिया की पूरी जानकारी दें।",
  },
  {
    icon: Building2,
    title: "Campuses & university help",
    query: "विश्वविद्यालय के सभी परिसरों, संपर्क सूत्रों एवं परीक्षा संबंधी सहायता प्रदान करें।",
  },
];
import { ChatMessage, LanguageMode } from "../types";
import {
  initUserAuth,
  persistConversation,
  fetchUserConversations,
  fetchConversationMessages,
  deleteConversationFromFirestore,
  StoredConversation,
} from "../lib/firebase";
import { ChatHistorySidebar, ChatSession } from "./ChatHistorySidebar";

export const ChatInterface: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome-1",
      role: "assistant",
      content: "Hey! I am CSU Mitra, how can I assist you? 🙏",
      timestamp: new Date(),
    },
  ]);

  const [input, setInput] = useState<string>("");
  const [language, setLanguage] = useState<LanguageMode>("all");
  const [showAttachMenu, setShowAttachMenu] = useState<boolean>(false);
  const [selectedAttachment, setSelectedAttachment] = useState<{
    dataUrl: string;
    name: string;
    size: string;
    type: "image" | "file";
    mimeType: string;
  } | null>(null);
  const [previewModalImage, setPreviewModalImage] = useState<{ url: string; name: string } | null>(null);
  const [isSending, setIsSending] = useState<boolean>(false);
  const [speakingMsgId, setSpeakingMsgId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // ChatGPT History Sidebar & Sessions state
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      return window.innerWidth >= 1024;
    }
    return false;
  });

  // Dark mode state with persistence
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem("csu_mitra_dark_mode");
      if (saved !== null) {
        return saved === "true";
      }
      if (typeof window !== "undefined" && window.matchMedia) {
        return window.matchMedia("(prefers-color-scheme: dark)").matches;
      }
    } catch {
      // ignore
    }
    return false;
  });

  const handleToggleDarkMode = () => {
    setIsDarkMode((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("csu_mitra_dark_mode", String(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  const [sessions, setSessions] = useState<ChatSession[]>(() => {
    try {
      const saved = localStorage.getItem("csu_chat_sessions_v2");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // ignore
    }
    return [];
  });

  // Firebase integration states
  const [userId, setUserId] = useState<string | null>(null);
  const [conversationId, setConversationId] = useState<string>(() => `csu-${Date.now()}`);
  const [firebaseStatus, setFirebaseStatus] = useState<"connected" | "connecting" | "idle">("connecting");
  const [pastSessions, setPastSessions] = useState<StoredConversation[]>([]);
  const [showHistoryModal, setShowHistoryModal] = useState<boolean>(false);
  const [isVoiceModeOpen, setIsVoiceModeOpen] = useState<boolean>(false);

  const photoInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Initialize Firebase Auth & test connection
  useEffect(() => {
    initUserAuth()
      .then((user) => {
        setUserId(user.uid);
        setFirebaseStatus("connected");
        // Load past conversations from Firestore & merge into sessions
        fetchUserConversations(user.uid)
          .then((cloudSessions) => {
            setPastSessions(cloudSessions);
            setSessions((prev) => {
              const map = new Map<string, ChatSession>();
              prev.forEach((s) => map.set(s.id, s));
              cloudSessions.forEach((cs) => {
                if (!map.has(cs.id)) {
                  map.set(cs.id, {
                    id: cs.id,
                    title: cs.title || "Chat Session",
                    updatedAt: new Date(cs.updatedAt).getTime(),
                    messages: [],
                  });
                }
              });
              const merged = Array.from(map.values()).sort((a, b) => b.updatedAt - a.updatedAt);
              localStorage.setItem("csu_chat_sessions_v2", JSON.stringify(merged));
              return merged;
            });
          })
          .catch(() => {});
      })
      .catch((err) => {
        console.warn("Firebase Auth error:", err);
        setFirebaseStatus("idle");
      });
  }, []);

  // Scroll to bottom whenever messages update
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isSending]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, forcedType?: "image" | "file") => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isImg = forcedType === "image" || file.type.startsWith("image/");
    const formattedSize =
      file.size > 1024 * 1024
        ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
        : `${Math.max(1, Math.round(file.size / 1024))} KB`;

    const reader = new FileReader();
    reader.onload = (event) => {
      setSelectedAttachment({
        dataUrl: event.target?.result as string,
        name: file.name,
        size: formattedSize,
        type: isImg ? "image" : "file",
        mimeType: file.type || (isImg ? "image/jpeg" : "application/pdf"),
      });
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleClearAttachment = () => {
    setSelectedAttachment(null);
    if (photoInputRef.current) photoInputRef.current.value = "";
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleAddVoiceMessagePair = (userText: string, assistantText: string) => {
    const userMsg: ChatMessage = {
      id: `user-voice-${Date.now()}`,
      role: "user",
      content: userText,
      timestamp: new Date(),
    };
    const assistantMsg: ChatMessage = {
      id: `assistant-voice-${Date.now() + 1}`,
      role: "assistant",
      content: assistantText,
      timestamp: new Date(),
    };

    setMessages((prev) => {
      const updated = [...prev, userMsg, assistantMsg];
      setSessions((prevSessions) => {
        const existing = prevSessions.find((s) => s.id === conversationId);
        const title = existing ? existing.title : userText.slice(0, 42);
        const updatedSession: ChatSession = {
          id: conversationId,
          title,
          updatedAt: Date.now(),
          messages: updated,
        };
        const newSessionList = [
          updatedSession,
          ...prevSessions.filter((s) => s.id !== conversationId),
        ];
        localStorage.setItem("csu_chat_sessions_v2", JSON.stringify(newSessionList));
        return newSessionList;
      });

      if (userId) {
        persistConversation(
          userId,
          conversationId,
          userText.slice(0, 42),
          [userMsg, assistantMsg]
        ).catch(() => {});
      }
      return updated;
    });
  };

  const handleSendMessage = async (customText?: string) => {
    const textToSend = (customText ?? input).trim();
    if (!textToSend && !selectedAttachment) return;

    const activeAttachment = selectedAttachment;
    handleClearAttachment();

    // If user attached a photo or file without typing, provide clear query text
    const effectiveContent =
      textToSend ||
      (activeAttachment?.type === "image"
        ? (language === "sa"
            ? "कृपया एतस्य संलग्न-चित्रस्य अवलोकनं कृत्वा विवरणं ददातु।"
            : language === "en"
            ? "Please review this attached photo/document and provide details."
            : "कृपया इस संलग्न फोटो/दस्तावेज को देखकर संबंधित जानकारी दें।")
        : (language === "sa"
            ? `कृपया संलग्न-सञ्चिकायाः (${activeAttachment?.name || "दस्तावेज"}) विवरणं ददातु।`
            : language === "en"
            ? `Please review this attached file (${activeAttachment?.name || "document"}) and provide details.`
            : `कृपया इस संलग्न फाइल (${activeAttachment?.name || "दस्तावेज"}) का विवरण बताएं।`));

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: effectiveContent,
      timestamp: new Date(),
      image: activeAttachment?.dataUrl,
      mimeType: activeAttachment?.mimeType,
      fileName: activeAttachment?.name,
      fileSize: activeAttachment?.size,
      fileType: activeAttachment?.type,
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setIsSending(true);

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    try {
      const payloadMessages = newMessages.map((m) => ({
        role: m.role,
        content: m.content,
        imageBase64: m.image,
        mimeType: m.mimeType,
        fileName: m.fileName,
        fileSize: m.fileSize,
        fileType: m.fileType,
      }));

      let data: any = null;
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 12000);
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: controller.signal,
          body: JSON.stringify({
            messages: payloadMessages,
            imageBase64: activeAttachment?.type === "image" ? activeAttachment.dataUrl : undefined,
            fileBase64: activeAttachment?.type === "file" ? activeAttachment.dataUrl : undefined,
            mimeType: activeAttachment?.mimeType,
            fileName: activeAttachment?.name,
            language: language === "all" ? undefined : language,
          }),
        });
        clearTimeout(timeoutId);
        if (res.ok) {
          data = await res.json();
        }
      } catch (_netErr) {
        // Fallback directly to client-side embedded CSU engine
      }

      if (!data || !data.response) {
        const lastUser = payloadMessages[payloadMessages.length - 1]?.content || "";
        const offlineReply = getFallbackCsuResponse(
          lastUser,
          (language && language !== "all" ? language : "hi") as any,
          activeAttachment?.name
        );
        data = {
          response: offlineReply,
          model: "csu-mitra-embedded-ai",
          offline: true,
        };
      }
      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content:
          data.response ||
          "सर्वर से कोई उत्तर प्राप्त नहीं हुआ। कृपया पुनः प्रयास करें। (No response from server.)",
        timestamp: new Date(),
        searchedWeb: data.searchedWeb,
        sources: data.sources,
        factVerification: data.factVerification,
      };

      const finalMessages = [...newMessages, assistantMessage];
      setMessages(finalMessages);

      // ChatGPT style automatic title & session persistence
      const firstUserMsg = finalMessages.find((m) => m.role === "user");
      const dynamicTitle =
        firstUserMsg?.content.slice(0, 42).replace(/\n/g, " ") || "Chat with CSU Mitra";

      setSessions((prev) => {
        const existing = prev.find((s) => s.id === conversationId);
        const title = existing ? existing.title : dynamicTitle;
        const updatedSession: ChatSession = {
          id: conversationId,
          title,
          updatedAt: Date.now(),
          messages: finalMessages,
        };
        const updated = [updatedSession, ...prev.filter((s) => s.id !== conversationId)];
        localStorage.setItem("csu_chat_sessions_v2", JSON.stringify(updated));
        return updated;
      });

      // Persist to Firebase Firestore
      if (userId) {
        persistConversation(userId, conversationId, dynamicTitle, [userMessage, assistantMessage])
          .then(() => {
            // Refresh list of sessions
            fetchUserConversations(userId).then(setPastSessions).catch(() => {});
          })
          .catch((e) => console.warn("Firestore save warning:", e));
      }
    } catch (err: any) {
      const fallbackMsg: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: `⚠️ संजाल-त्रुटिः (Connection or API error): ${err.message || "Unable to reach server"}.
        
कृपया आधिकारिक जालस्थान पर सीधे जानकारी देखें: [sanskrit.nic.in](https://sanskrit.nic.in) अथवा पुनः प्रयास करें।`,
        timestamp: new Date(),
        isError: true,
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSpeak = (id: string, text: string) => {
    if (!("speechSynthesis" in window)) return;

    if (speakingMsgId === id) {
      window.speechSynthesis.cancel();
      setSpeakingMsgId(null);
      return;
    }

    window.speechSynthesis.cancel();
    const cleanText = text.replace(/[*_#`[\]()]/g, "").trim();
    const utterance = new SpeechSynthesisUtterance(cleanText);

    const hasDevanagari = /[\u0900-\u097F]/.test(cleanText);
    utterance.lang = hasDevanagari ? "hi-IN" : "en-IN";
    utterance.rate = 0.92;

    utterance.onend = () => setSpeakingMsgId(null);
    utterance.onerror = () => setSpeakingMsgId(null);

    setSpeakingMsgId(id);
    window.speechSynthesis.speak(utterance);
  };

  const handleCopy = async (id: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      // ignore
    }
  };

  // Switch to an existing chat session from history
  const handleSelectSession = async (sessionId: string) => {
    if (sessionId === conversationId) return;
    setConversationId(sessionId);

    const found = sessions.find((s) => s.id === sessionId);
    if (found && found.messages && found.messages.length > 0) {
      setMessages(
        found.messages.map((m) => ({
          ...m,
          timestamp: new Date(m.timestamp),
        }))
      );
    } else {
      try {
        const cloudMsgs = await fetchConversationMessages(sessionId);
        if (cloudMsgs && cloudMsgs.length > 0) {
          const loaded: ChatMessage[] = cloudMsgs.map((m) => ({
            id: m.id,
            role: m.role,
            content: m.content,
            timestamp: new Date(m.timestamp),
          }));
          setMessages(loaded);
          setSessions((prev) => {
            const updated = prev.map((s) =>
              s.id === sessionId ? { ...s, messages: loaded } : s
            );
            localStorage.setItem("csu_chat_sessions_v2", JSON.stringify(updated));
            return updated;
          });
        }
      } catch (err) {
        console.warn("Could not load cloud conversation:", err);
      }
    }
  };

  // Start fresh chat (+ New Chat)
  const handleNewChat = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setSpeakingMsgId(null);
    }
    const newConvId = `csu-${Date.now()}`;
    setConversationId(newConvId);
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        role: "assistant",
        content: "Hey! I am CSU Mitra, how can I assist you? 🙏",
        timestamp: new Date(),
      },
    ]);
    setInput("");
    handleClearAttachment();
  };

  // Delete a single chat session
  const handleDeleteSession = async (sessionId: string) => {
    setSessions((prev) => {
      const updated = prev.filter((s) => s.id !== sessionId);
      localStorage.setItem("csu_chat_sessions_v2", JSON.stringify(updated));
      return updated;
    });
    deleteConversationFromFirestore(sessionId).catch(() => {});
    if (sessionId === conversationId) {
      handleNewChat();
    }
  };

  // Wipe all chats
  const handleClearAllSessions = () => {
    setSessions([]);
    localStorage.removeItem("csu_chat_sessions_v2");
    handleNewChat();
  };

  const handleClearHistory = () => {
    handleNewChat();
  };

  return (
    <div
      id="csu-chatbot-container"
      className={`flex h-screen w-screen overflow-hidden font-sans transition-colors duration-200 ${
        isDarkMode ? "dark bg-stone-950 text-stone-100" : "bg-stone-50 text-stone-900"
      }`}
    >
      {/* ChatGPT-style History Sidebar */}
      <ChatHistorySidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        sessions={sessions}
        currentSessionId={conversationId}
        onSelectSession={handleSelectSession}
        onNewChat={handleNewChat}
        onDeleteSession={handleDeleteSession}
        onClearAllSessions={handleClearAllSessions}
        firebaseStatus={firebaseStatus}
        isDarkMode={isDarkMode}
        onToggleDarkMode={handleToggleDarkMode}
      />

      {/* Main Chat Interface */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden relative">
        {/* Clean Plain Top Navigation Bar */}
        <header
          className={`shrink-0 h-14 border-b px-3 sm:px-6 flex items-center justify-between shadow-2xs z-10 transition-colors ${
            isDarkMode
              ? "bg-stone-900 border-stone-800 text-stone-100"
              : "bg-white border-stone-200/80 text-stone-900"
          }`}
        >
          <div className="flex items-center gap-3">
            {/* Sidebar Toggle Button (ChatGPT style) */}
            <button
              type="button"
              id="toggle-sidebar-btn"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className={`p-2 rounded-xl transition-colors ${
                isDarkMode
                  ? "text-stone-300 hover:bg-stone-800 hover:text-white"
                  : "text-stone-600 hover:bg-stone-100 hover:text-stone-900"
              }`}
              title={isSidebarOpen ? "Close chat history sidebar" : "Open chat history sidebar"}
            >
              <PanelLeft className={`w-5 h-5 ${isDarkMode ? "text-stone-300" : "text-stone-700"}`} />
            </button>

            {/* CSU Mitra Title with Samskrit Bharat Logo */}
            <div className="flex items-center gap-2">
              <img
                src="/icon-192.png"
                alt="Samskrit Bharat Logo"
                className="h-6 w-6 rounded-full border border-amber-400/70 shadow-xs object-cover"
                loading="eager"
              />
              <h1
                className={`text-base font-semibold tracking-tight ${
                  isDarkMode ? "text-stone-100" : "text-stone-800"
                }`}
              >
                CSU Mitra
              </h1>
            </div>
          </div>
        </header>

      {/* Main Chat Messages Stream */}
      <main
        className={`flex-1 overflow-y-auto px-3 sm:px-6 py-4 sm:py-6 transition-colors ${
          isDarkMode ? "bg-stone-950" : "bg-stone-50"
        }`}
      >
        <div className="max-w-3xl mx-auto w-full space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${
                msg.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              {/* Assistant Avatar */}
              {msg.role === "assistant" && (
                <img
                  src="/icon-192.png"
                  alt="Samskrit Bharat"
                  className="shrink-0 h-8 w-8 rounded-full border border-amber-400/60 shadow-xs object-cover mt-1 bg-stone-900"
                  loading="lazy"
                />
              )}

              <div
                className={`flex flex-col max-w-[88%] sm:max-w-[82%] ${
                  msg.role === "user" ? "items-end" : "items-start"
                }`}
              >
                <div
                  className={`rounded-2xl px-4 py-3 text-xs sm:text-sm leading-relaxed shadow-2xs ${
                    msg.role === "user"
                      ? "bg-amber-800 text-white rounded-tr-xs"
                      : msg.isError
                      ? isDarkMode
                        ? "bg-red-950/60 text-red-200 border border-red-800/80 rounded-tl-xs"
                        : "bg-red-50 text-red-900 border border-red-200 rounded-tl-xs"
                      : isDarkMode
                      ? "bg-stone-900 text-stone-100 border border-stone-800 rounded-tl-xs"
                      : "bg-white text-stone-800 border border-stone-200/90 rounded-tl-xs"
                  }`}
                >
                  {/* Photo or File Attachment inside Message */}
                  {msg.image && (
                    <div
                      className={`mb-2.5 overflow-hidden rounded-xl border shadow-2xs ${
                        isDarkMode ? "border-stone-800" : "border-stone-200/90"
                      }`}
                    >
                      {msg.fileType === "file" || (!msg.mimeType?.startsWith("image/") && msg.mimeType) ? (
                        <div
                          className={`p-3 rounded-xl flex items-center justify-between gap-3 ${
                            msg.role === "user"
                              ? "bg-amber-900/60 text-white border border-amber-700/50"
                              : isDarkMode
                              ? "bg-stone-950 text-stone-100 border border-stone-800"
                              : "bg-stone-50 text-stone-900 border border-stone-200"
                          }`}
                        >
                          <div className="flex items-center gap-2.5 overflow-hidden">
                            <div
                              className={`h-10 w-10 shrink-0 rounded-lg flex items-center justify-center font-bold text-xs ${
                                msg.role === "user"
                                  ? "bg-amber-700 text-amber-100"
                                  : isDarkMode
                                  ? "bg-amber-950 text-amber-400 border border-amber-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {msg.fileName?.endsWith(".pdf") ? "PDF" : "FILE"}
                            </div>
                            <div className="overflow-hidden">
                              <p className="text-xs font-semibold truncate">
                                {msg.fileName || "Uploaded File"}
                              </p>
                              <p
                                className={`text-[10px] ${
                                  msg.role === "user"
                                    ? "text-amber-200"
                                    : isDarkMode
                                    ? "text-stone-400"
                                    : "text-stone-500"
                                }`}
                              >
                                {msg.fileSize || "Document"} • Attached for Review
                              </p>
                            </div>
                          </div>
                          <a
                            href={msg.image}
                            download={msg.fileName || "csu-document"}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors ${
                              msg.role === "user"
                                ? "bg-amber-100 text-amber-950 hover:bg-white"
                                : isDarkMode
                                ? "bg-amber-700 text-white hover:bg-amber-600"
                                : "bg-stone-900 text-white hover:bg-stone-800"
                            }`}
                            title="Open or Download file"
                          >
                            <Download className="w-3 h-3" />
                            <span>Download</span>
                          </a>
                        </div>
                      ) : (
                        <div className="overflow-hidden bg-black/5 rounded-xl">
                          <button
                            type="button"
                            onClick={() =>
                              setPreviewModalImage({
                                url: msg.image!,
                                name: msg.fileName || "Attached Photo",
                              })
                            }
                            className="relative group block w-full text-left cursor-zoom-in"
                            title="Click to view full photo"
                          >
                            <img
                              src={msg.image}
                              alt={msg.fileName || "User Photo"}
                              className="max-h-64 w-auto object-contain mx-auto transition-transform group-hover:scale-[1.01]"
                            />
                            <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-semibold gap-1.5">
                              <span>🔍 Click to Zoom</span>
                            </div>
                          </button>
                          <div
                            className={`px-2.5 py-1.5 flex items-center justify-between text-[11px] border-t ${
                              msg.role === "user"
                                ? "bg-amber-900/40 text-amber-100 border-amber-700/50"
                                : isDarkMode
                                ? "bg-stone-950 text-stone-300 border-stone-800"
                                : "bg-stone-50 text-stone-600 border-stone-200"
                            }`}
                          >
                            <span className="truncate font-medium flex items-center gap-1">
                              <ImageIcon className="w-3 h-3" />
                              {msg.fileName || "Attached Photo"}
                            </span>
                            {msg.fileSize && (
                              <span className="text-[10px] opacity-75 shrink-0 ml-2">
                                {msg.fileSize}
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Formatted Markdown Content */}
                  <div
                    className={`prose prose-sm max-w-none break-words ${
                      msg.role === "user"
                        ? "text-white [&_a]:text-amber-200 [&_a]:underline"
                        : isDarkMode
                        ? "text-stone-200 [&_a]:text-amber-400 [&_a]:underline hover:[&_a]:text-amber-300 [&_ul]:list-disc [&_ul]:pl-4 [&_ol]:list-decimal [&_ol]:pl-4 [&_li]:my-0.5 [&_p]:my-1.5 [&_h3]:font-serif [&_h3]:font-bold [&_h3]:text-stone-100 [&_h3]:mt-2"
                        : "text-stone-800 [&_a]:text-amber-700 [&_a]:underline hover:[&_a]:text-amber-900 [&_ul]:list-disc [&_ul]:pl-4 [&_ol]:list-decimal [&_ol]:pl-4 [&_li]:my-0.5 [&_p]:my-1.5 [&_h3]:font-serif [&_h3]:font-bold [&_h3]:text-stone-900 [&_h3]:mt-2"
                    }`}
                  >
                    <Markdown>{msg.content}</Markdown>
                  </div>

                  {/* Retry Query Button if Error */}
                  {msg.isError && (
                    <div
                      className={`mt-3 pt-2 border-t flex items-center justify-between ${
                        isDarkMode ? "border-red-900/60" : "border-red-200"
                      }`}
                    >
                      <span
                        className={`text-[11px] font-medium ${
                          isDarkMode ? "text-red-300" : "text-red-700"
                        }`}
                      >
                        पुनः प्रयास करें / Please try again
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          const lastUser = [...messages].reverse().find((m) => m.role === "user");
                          if (lastUser) {
                            handleSendMessage(lastUser.content);
                          }
                        }}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-red-600 text-white text-[11px] font-semibold hover:bg-red-700 transition-colors shadow-2xs"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Retry</span>
                      </button>
                    </div>
                  )}

                  {/* Assistant Message Actions (TTS, Copy, Timestamp) */}
                  {msg.role === "assistant" && !msg.isError && (
                    <div
                      className={`mt-3 pt-2 flex items-center justify-between gap-3 text-[10px] border-t ${
                        isDarkMode
                          ? "border-stone-800 text-stone-400"
                          : "border-stone-100 text-stone-400"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleSpeak(msg.id, msg.content)}
                          className={`flex items-center gap-1 px-1.5 py-0.5 rounded transition-colors ${
                            speakingMsgId === msg.id
                              ? isDarkMode
                                ? "bg-amber-950 text-amber-300 font-semibold"
                                : "bg-amber-100 text-amber-900 font-semibold"
                              : isDarkMode
                              ? "hover:text-stone-200 hover:bg-stone-800"
                              : "hover:text-stone-700 hover:bg-stone-100"
                          }`}
                          title="Text to speech (Sanskrit / Hindi / English)"
                        >
                          {speakingMsgId === msg.id ? (
                            <>
                              <VolumeX className="w-3 h-3" />
                              <span>Stop Audio</span>
                            </>
                          ) : (
                            <>
                              <Volume2 className="w-3 h-3" />
                              <span>Listen</span>
                            </>
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleCopy(msg.id, msg.content)}
                          className={`flex items-center gap-1 px-1.5 py-0.5 rounded transition-colors ${
                            isDarkMode
                              ? "hover:text-stone-200 hover:bg-stone-800"
                              : "hover:text-stone-700 hover:bg-stone-100"
                          }`}
                          title="Copy message text"
                        >
                          {copiedId === msg.id ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-500" />
                              <span className="text-emerald-500 font-medium">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Copy</span>
                            </>
                          )}
                        </button>
                      </div>

                      <span className={isDarkMode ? "text-stone-500" : "text-stone-400"}>
                        {new Date(msg.timestamp).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* Typing Animation Indicator */}
          {isSending && (
            <div className="flex gap-3 items-start py-2">
              <img
                src="/icon-192.png"
                alt="Samskrit Bharat"
                className="shrink-0 h-8 w-8 rounded-full border border-amber-400/60 shadow-xs object-cover mt-1 bg-stone-900"
                loading="lazy"
              />
              <div
                className={`rounded-2xl rounded-tl-xs px-4 py-3 flex items-center gap-1.5 shadow-2xs border ${
                  isDarkMode
                    ? "bg-stone-900 border-stone-800"
                    : "bg-white border-stone-200/90"
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full animate-bounce ${
                    isDarkMode ? "bg-amber-500" : "bg-amber-700"
                  }`}
                />
                <span
                  className={`w-2 h-2 rounded-full animate-bounce [animation-delay:150ms] ${
                    isDarkMode ? "bg-amber-500" : "bg-amber-700"
                  }`}
                />
                <span
                  className={`w-2 h-2 rounded-full animate-bounce [animation-delay:300ms] ${
                    isDarkMode ? "bg-amber-500" : "bg-amber-700"
                  }`}
                />
              </div>
            </div>
          )}

          {/* End of message stream */}
          <div ref={chatBottomRef} />
        </div>
      </main>

      {/* Docked Bottom Chat Input Bar */}
      <footer
        className={`shrink-0 border-t p-3 sm:p-4 transition-colors ${
          isDarkMode
            ? "bg-stone-900 border-stone-800"
            : "bg-white border-stone-200/90"
        }`}
      >
        <div className="max-w-3xl mx-auto w-full">
          {/* Plain 3 AI Action Prompts (No separate columns or cards) */}
          {messages.length <= 1 && (
            <div className="mb-3 px-2 space-y-1.5">
              {AI_QUICK_ACTIONS.map((action, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSendMessage(action.query)}
                  className={`flex items-center gap-2 text-xs sm:text-sm font-normal transition-colors py-0.5 cursor-pointer text-left group ${
                    isDarkMode
                      ? "text-stone-400 hover:text-stone-100"
                      : "text-stone-600 hover:text-stone-950"
                  }`}
                >
                  <span
                    className={`font-bold ${
                      isDarkMode
                        ? "text-stone-500 group-hover:text-amber-400"
                        : "text-stone-400 group-hover:text-amber-800"
                    }`}
                  >
                    •
                  </span>
                  <span className="group-hover:underline underline-offset-2">{action.title}</span>
                </button>
              ))}
            </div>
          )}

          {/* Selected Document / Photo Preview Card */}
          {selectedAttachment && (
            <div
              className={`mb-2 p-2.5 rounded-xl border flex items-center justify-between text-xs shadow-2xs ${
                isDarkMode
                  ? "bg-stone-950 border-amber-600/50"
                  : "bg-amber-50/95 border-amber-300"
              }`}
            >
              <div className="flex items-center gap-2.5 overflow-hidden">
                {selectedAttachment.type === "image" ? (
                  <img
                    src={selectedAttachment.dataUrl}
                    alt="Preview"
                    onClick={() =>
                      setPreviewModalImage({
                        url: selectedAttachment.dataUrl,
                        name: selectedAttachment.name,
                      })
                    }
                    className="h-11 w-11 object-cover rounded-lg border border-amber-500/50 shrink-0 cursor-zoom-in"
                  />
                ) : (
                  <div
                    className={`h-11 w-11 shrink-0 rounded-lg flex items-center justify-center font-bold text-xs border ${
                      isDarkMode
                        ? "bg-amber-950 text-amber-400 border-amber-800"
                        : "bg-red-100 text-red-800 border-red-200"
                    }`}
                  >
                    {selectedAttachment.name.endsWith(".pdf") ? "PDF" : "FILE"}
                  </div>
                )}
                <div className="overflow-hidden">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                        isDarkMode
                          ? "bg-amber-900/60 text-amber-300"
                          : "text-amber-900 bg-amber-200/70"
                      }`}
                    >
                      {selectedAttachment.type === "image" ? "📷 Photo" : "📄 File / Document"}
                    </span>
                    <span
                      className={`text-[10px] font-mono ${
                        isDarkMode ? "text-stone-400" : "text-stone-500"
                      }`}
                    >
                      {selectedAttachment.size}
                    </span>
                  </div>
                  <p
                    className={`font-semibold truncate text-xs mt-0.5 ${
                      isDarkMode ? "text-stone-100" : "text-stone-900"
                    }`}
                  >
                    {selectedAttachment.name}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleClearAttachment}
                className={`p-1.5 rounded-lg transition-colors ml-2 ${
                  isDarkMode
                    ? "text-stone-400 hover:text-red-400 hover:bg-stone-800"
                    : "text-stone-400 hover:text-red-700 hover:bg-red-50"
                }`}
                title="Remove attached item"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Backdrop for Attach Menu */}
          {showAttachMenu && (
            <div
              className="fixed inset-0 z-20"
              onClick={() => setShowAttachMenu(false)}
            />
          )}

          {/* ChatGPT-style Input Box Container */}
          <div
            className={`relative flex items-center gap-2 rounded-full py-1 px-2 border transition-all shadow-xs ${
              isDarkMode
                ? "bg-stone-950 border-stone-800 text-stone-100 focus-within:bg-stone-900 focus-within:border-stone-700 focus-within:ring-2 focus-within:ring-stone-600/20"
                : "bg-stone-100/90 border-stone-200/90 text-stone-900 focus-within:bg-white focus-within:border-stone-400 focus-within:ring-2 focus-within:ring-stone-400/10"
            }`}
          >
            {/* Hidden Inputs for Photo and Document */}
            <input
              ref={photoInputRef}
              type="file"
              accept="image/*"
              onChange={(e) => handleFileSelect(e, "image")}
              className="sr-only"
              id="csu-photo-input"
            />
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.doc,.docx,.txt,.csv,application/pdf,text/plain"
              onChange={(e) => handleFileSelect(e, "file")}
              className="sr-only"
              id="csu-document-input"
            />

            {/* "+" Attach Button (ChatGPT style) */}
            <div className="relative z-30">
              <button
                type="button"
                id="attach-toggle-btn"
                onClick={() => setShowAttachMenu(!showAttachMenu)}
                title="Attach photo or document"
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-colors ${
                  isDarkMode
                    ? "text-stone-400 hover:text-stone-100 hover:bg-stone-800"
                    : "text-stone-600 hover:text-stone-950 hover:bg-stone-200/80"
                }`}
              >
                <Plus className={`w-5 h-5 transition-transform duration-150 ${showAttachMenu ? "rotate-45" : ""}`} />
              </button>

              {/* Attach Dropdown Menu */}
              {showAttachMenu && (
                <div
                  className={`absolute bottom-11 left-0 z-40 w-52 rounded-2xl p-1.5 shadow-xl border space-y-0.5 ${
                    isDarkMode
                      ? "bg-stone-900 border-stone-800 text-stone-200"
                      : "bg-white border-stone-200 text-stone-700"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => {
                      setShowAttachMenu(false);
                      photoInputRef.current?.click();
                    }}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-colors text-left ${
                      isDarkMode
                        ? "text-stone-200 hover:bg-stone-800 hover:text-white"
                        : "text-stone-700 hover:bg-stone-100 hover:text-stone-900"
                    }`}
                  >
                    <ImageIcon className="w-4 h-4 text-amber-500" />
                    <span>Upload photo / image</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAttachMenu(false);
                      fileInputRef.current?.click();
                    }}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-colors text-left ${
                      isDarkMode
                        ? "text-stone-200 hover:bg-stone-800 hover:text-white"
                        : "text-stone-700 hover:bg-stone-100 hover:text-stone-900"
                    }`}
                  >
                    <Paperclip className="w-4 h-4 text-amber-500" />
                    <span>Attach document / PDF</span>
                  </button>
                </div>
              )}
            </div>

            {/* Query Textarea with Clean "Ask anything..." Placeholder */}
            <textarea
              ref={textareaRef}
              id="chatbot-query-textarea"
              rows={1}
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                e.target.style.height = "auto";
                e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
              }}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything..."
              className={`flex-1 max-h-32 resize-none bg-transparent py-2 px-1 text-sm focus:outline-none ${
                isDarkMode
                  ? "text-stone-100 placeholder:text-stone-500"
                  : "text-stone-900 placeholder:text-stone-400"
              }`}
            />

            {/* Voice Assistant Button (ChatGPT style Voice Mode) */}
            <button
              id="chatbot-voice-mode-button"
              type="button"
              onClick={() => setIsVoiceModeOpen(true)}
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-all shadow-xs ${
                isDarkMode
                  ? "bg-stone-800 hover:bg-stone-700 text-amber-400 hover:text-amber-300 border border-stone-700/80"
                  : "bg-stone-100 hover:bg-amber-100/70 text-stone-600 hover:text-amber-800 border border-stone-200"
              }`}
              title="Voice Assistant Mode"
            >
              <Mic className="w-4 h-4" />
            </button>

            {/* Send Button */}
            <button
              id="chatbot-send-button"
              type="button"
              disabled={isSending || (!input.trim() && !selectedAttachment)}
              onClick={() => handleSendMessage()}
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-all shadow-xs ${
                input.trim() || selectedAttachment
                  ? "bg-amber-600 hover:bg-amber-500 text-white"
                  : isDarkMode
                  ? "bg-stone-800 text-stone-600 cursor-not-allowed"
                  : "bg-stone-200 text-stone-400 cursor-not-allowed"
              }`}
              title="Send query"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </footer>

      {showHistoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-xl border border-stone-200">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-amber-700" />
                <h3 className="text-sm font-bold text-stone-900">
                  Firebase Saved Sessions
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowHistoryModal(false)}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-3 max-h-64 overflow-y-auto space-y-2">
              {pastSessions.map((session) => (
                <div
                  key={session.id}
                  className="p-2.5 rounded-xl border border-stone-200 bg-stone-50/50 hover:bg-amber-50/60 hover:border-amber-300 transition-colors flex items-center justify-between gap-2"
                >
                  <div className="overflow-hidden">
                    <p className="text-xs font-medium text-stone-800 truncate">
                      {session.title}
                    </p>
                    <p className="text-[10px] text-stone-400">
                      {new Date(session.updatedAt).toLocaleDateString()} •{" "}
                      {new Date(session.updatedAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                    Synced
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-3 border-t border-stone-100 flex justify-end">
              <button
                type="button"
                onClick={() => setShowHistoryModal(false)}
                className="px-4 py-1.5 rounded-lg bg-stone-900 text-white text-xs font-semibold hover:bg-stone-800 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Photo Lightbox / Zoom Modal */}
      {previewModalImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 animate-in fade-in duration-150"
          onClick={() => setPreviewModalImage(null)}
        >
          <div
            className="relative max-w-4xl max-h-[90vh] bg-stone-950 rounded-2xl overflow-hidden shadow-2xl border border-stone-800 flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-3 bg-stone-900/90 border-b border-stone-800 flex items-center justify-between text-white text-xs">
              <span className="font-semibold truncate max-w-xs sm:max-w-md flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-amber-400" />
                {previewModalImage.name}
              </span>
              <div className="flex items-center gap-2">
                <a
                  href={previewModalImage.url}
                  download={previewModalImage.name}
                  className="p-1 rounded-md text-stone-300 hover:text-white hover:bg-stone-800 transition-colors"
                  title="Download photo"
                >
                  <Download className="w-4 h-4" />
                </a>
                <button
                  type="button"
                  onClick={() => setPreviewModalImage(null)}
                  className="p-1 rounded-md text-stone-300 hover:text-white hover:bg-stone-800 transition-colors"
                  title="Close preview"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="overflow-auto p-2 flex items-center justify-center bg-black/50">
              <img
                src={previewModalImage.url}
                alt={previewModalImage.name}
                className="max-h-[75vh] w-auto object-contain rounded-lg"
              />
            </div>
          </div>
        </div>
      )}

      {/* ChatGPT-style Dedicated Fullscreen Voice Assistant Mode */}
      <VoiceAssistantModal
        isOpen={isVoiceModeOpen}
        onClose={() => setIsVoiceModeOpen(false)}
        onAddMessagePair={handleAddVoiceMessagePair}
        language={language}
        onLanguageChange={setLanguage}
      />
      </div>
    </div>
  );
};
