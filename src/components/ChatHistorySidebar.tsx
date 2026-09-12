import React, { useState, useMemo } from "react";
import {
  PanelLeftClose,
  SquarePen,
  MessageSquare,
  Trash2,
  Search,
  Check,
  X,
  Sparkles,
  Moon,
  Sun,
} from "lucide-react";
import { ChatMessage } from "../types";

export interface ChatSession {
  id: string;
  title: string;
  updatedAt: number;
  messages: ChatMessage[];
}

interface ChatHistorySidebarProps {
  isOpen: boolean;
  onClose: () => void;
  sessions: ChatSession[];
  currentSessionId: string;
  onSelectSession: (id: string) => void;
  onNewChat: () => void;
  onDeleteSession: (id: string) => void;
  onClearAllSessions: () => void;
  firebaseStatus: "connected" | "connecting" | "idle";
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}

export const ChatHistorySidebar: React.FC<ChatHistorySidebarProps> = ({
  isOpen,
  onClose,
  sessions,
  currentSessionId,
  onSelectSession,
  onNewChat,
  onDeleteSession,
  onClearAllSessions,
  firebaseStatus,
  isDarkMode,
  onToggleDarkMode,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [sessionToDelete, setSessionToDelete] = useState<string | null>(null);

  // Filtered chats based on search
  const filteredSessions = useMemo(() => {
    if (!searchQuery.trim()) return sessions;
    const q = searchQuery.toLowerCase();
    return sessions.filter((s) => s.title.toLowerCase().includes(q));
  }, [sessions, searchQuery]);

  // Group chats by date (Today, Previous 7 Days, Older)
  const groupedSessions = useMemo(() => {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const sevenDaysAgo = startOfToday - 7 * 24 * 60 * 60 * 1000;

    const today: ChatSession[] = [];
    const pastSevenDays: ChatSession[] = [];
    const older: ChatSession[] = [];

    filteredSessions.forEach((s) => {
      const time = s.updatedAt;
      if (time >= startOfToday) {
        today.push(s);
      } else if (time >= sevenDaysAgo) {
        pastSevenDays.push(s);
      } else {
        older.push(s);
      }
    });

    return [
      { label: "Today", items: today },
      { label: "Previous 7 Days", items: pastSevenDays },
      { label: "Older", items: older },
    ].filter((group) => group.items.length > 0);
  }, [filteredSessions]);

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-xs md:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-50 flex flex-col w-72 bg-stone-900 border-r border-stone-800 text-stone-200 transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full md:hidden"
        }`}
      >
        {/* Header: New Chat & Close Buttons */}
        <div className="shrink-0 p-3 border-b border-stone-800 flex flex-col gap-2.5 bg-stone-950/40">
          <div className="flex items-center justify-between">
            <button
              type="button"
              id="new-chat-btn"
              onClick={() => {
                onNewChat();
                if (window.innerWidth < 768) onClose();
              }}
              className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-amber-700 hover:bg-amber-600 text-white font-medium text-xs shadow-sm transition-all border border-amber-600/50"
            >
              <SquarePen className="w-3.5 h-3.5" />
              <span>New Conversation</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2 ml-2 text-stone-400 hover:text-white rounded-lg hover:bg-stone-800 transition-colors"
              title="Close history sidebar"
            >
              <PanelLeftClose className="w-4 h-4" />
            </button>
          </div>

          {/* Dark Mode / Light Mode Switch */}
          <div className="flex items-center justify-between px-2.5 py-1.5 rounded-xl bg-stone-800/60 border border-stone-700/60 text-xs">
            <div className="flex items-center gap-2 text-stone-300">
              {isDarkMode ? (
                <Moon className="w-3.5 h-3.5 text-amber-400" />
              ) : (
                <Sun className="w-3.5 h-3.5 text-amber-500" />
              )}
              <span className="font-medium text-[11px]">
                {isDarkMode ? "Dark Theme" : "Light Theme"}
              </span>
            </div>
            <button
              type="button"
              id="dark-mode-slider-switch"
              role="switch"
              aria-checked={isDarkMode}
              onClick={onToggleDarkMode}
              title={isDarkMode ? "Turn off Dark Mode" : "Turn on Dark Mode"}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-amber-500/40 ${
                isDarkMode ? "bg-amber-600" : "bg-stone-700"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                  isDarkMode ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {/* Search Box */}
          {sessions.length > 2 && (
            <div className="relative mt-1">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-stone-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search history..."
                className="w-full pl-8 pr-7 py-1.5 bg-stone-800/80 border border-stone-700 rounded-lg text-xs text-stone-200 placeholder-stone-500 focus:outline-hidden focus:border-amber-500 transition-colors"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-stone-400 hover:text-white"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          )}
        </div>

        {/* Chat History List */}
        <div className="flex-1 overflow-y-auto px-2 py-3 space-y-4 text-xs">
          {filteredSessions.length === 0 ? (
            <div className="text-center py-10 px-4 text-stone-500 space-y-2">
              <MessageSquare className="w-8 h-8 mx-auto opacity-30" />
              <p className="text-xs">
                {searchQuery ? "No matching chats found." : "No saved chats yet."}
              </p>
              <p className="text-[11px] text-stone-600">
                Messages are automatically saved to your history.
              </p>
            </div>
          ) : (
            groupedSessions.map((group) => (
              <div key={group.label} className="space-y-1">
                <div className="px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-stone-400 font-sans">
                  {group.label}
                </div>
                <div className="space-y-0.5">
                  {group.items.map((session) => {
                    const isActive = session.id === currentSessionId;
                    const isDeleting = sessionToDelete === session.id;

                    return (
                      <div
                        key={session.id}
                        onClick={() => {
                          onSelectSession(session.id);
                          if (window.innerWidth < 768) onClose();
                        }}
                        className={`group relative flex items-center justify-between gap-2 px-3 py-2 rounded-xl text-left cursor-pointer transition-colors ${
                          isActive
                            ? "bg-stone-800 text-white font-medium shadow-2xs border-l-2 border-amber-500"
                            : "text-stone-300 hover:bg-stone-800/60 hover:text-white"
                        }`}
                      >
                        <div className="flex items-center gap-2.5 overflow-hidden flex-1">
                          <MessageSquare className={`w-3.5 h-3.5 shrink-0 ${isActive ? "text-amber-400" : "text-stone-500"}`} />
                          <span className="truncate text-xs">
                            {session.title || "Chat Session"}
                          </span>
                        </div>

                        {/* Action buttons (Delete confirmation or Delete icon) */}
                        <div
                          className="shrink-0 flex items-center"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {isDeleting ? (
                            <div className="flex items-center gap-1 bg-stone-950 p-0.5 rounded-lg border border-red-500/40">
                              <button
                                type="button"
                                title="Confirm delete"
                                onClick={() => {
                                  onDeleteSession(session.id);
                                  setSessionToDelete(null);
                                }}
                                className="p-1 text-red-400 hover:text-red-300 hover:bg-red-950/80 rounded"
                              >
                                <Check className="w-3 h-3" />
                              </button>
                              <button
                                type="button"
                                title="Cancel"
                                onClick={() => setSessionToDelete(null)}
                                className="p-1 text-stone-400 hover:text-stone-200 hover:bg-stone-800 rounded"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              title="Delete chat"
                              onClick={() => setSessionToDelete(session.id)}
                              className="p-1 rounded text-stone-500 hover:text-red-400 hover:bg-stone-800 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer: Cloud sync and clear all */}
        <div className="shrink-0 p-3 border-t border-stone-800 bg-stone-950/60 flex flex-col gap-2">
          <div className="flex items-center justify-between text-[11px] text-stone-400 pt-1">
            <div className="flex items-center gap-1.5">
              <span
                className={`w-2 h-2 rounded-full ${
                  firebaseStatus === "connected"
                    ? "bg-emerald-500 animate-pulse"
                    : "bg-amber-500"
                }`}
              />
              <span className="font-medium text-stone-300">
                {firebaseStatus === "connected" ? "Cloud Synced" : "Local History"}
              </span>
            </div>
            {sessions.length > 0 && (
              <button
                type="button"
                onClick={onClearAllSessions}
                className="text-stone-400 hover:text-red-400 transition-colors text-[10px]"
              >
                Clear All
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};
