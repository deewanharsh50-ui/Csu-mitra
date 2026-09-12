import React, { useState } from "react";
import { MessageSquareText, FileCode, Building2, ExternalLink, Sparkles, Smartphone, Download } from "lucide-react";

interface HeaderProps {
  activeTab: "chat" | "script" | "directory";
  onTabChange: (tab: "chat" | "script" | "directory") => void;
  onOpenDirectory: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onTabChange,
  onOpenDirectory,
}) => {
  
  return (
    <>
      <header className="sticky top-0 z-40 border-b border-amber-900/20 bg-stone-900 text-white shadow-md">
        {/* Top University Branding Banner */}
        <div className="mx-auto max-w-7xl px-4 py-2.5 sm:px-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div className="flex items-center gap-3">
              {/* Samskrit Bharat Official Logo Badge */}
              <img
                src="/icon-192.png"
                alt="Samskrit Bharat Logo"
                className="h-11 w-11 shrink-0 rounded-full border-2 border-amber-400/80 shadow-md object-cover bg-stone-950 transition-transform hover:scale-105"
                loading="eager"
              />

              <div>
                <div className="flex items-center gap-2">
                  <h1 className="font-serif text-sm sm:text-base font-bold tracking-wide text-amber-100">
                    केन्द्रीय संस्कृत विश्वविद्यालयः
                  </h1>
                  <span className="hidden sm:inline-block rounded bg-amber-500/20 px-1.5 py-0.5 text-[10px] font-medium text-amber-300 border border-amber-500/30">
                    संसद्-अधिनियम-स्थापितः
                  </span>
                </div>
                <p className="text-[11px] text-stone-300 font-sans">
                  Central Sanskrit University, Delhi • <span className="text-amber-400 font-serif">"संस्कृतं सर्वकारि च"</span>
                </p>
              </div>
            </div>

            {/* Right Links & Direct APK Download Button */}
            <div className="flex items-center gap-2 self-end sm:self-auto text-xs flex-wrap">
              {/* Direct APK Download Button with Modal Guidance */}
              

              <a
                href="https://sanskrit.nic.in"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 rounded-lg bg-stone-800 px-2.5 py-1.5 text-[11px] text-stone-200 hover:bg-stone-700 hover:text-white transition-colors border border-stone-700"
              >
                <span>sanskrit.nic.in</span>
                <ExternalLink className="w-3 h-3 text-amber-400" />
              </a>

              <a
                href="https://sanskritadm.samarth.edu.in"
                target="_blank"
                rel="noopener noreferrer"
                className="hidden md:inline-flex items-center gap-1 rounded-lg bg-amber-900/60 px-2.5 py-1.5 text-[11px] text-amber-200 hover:bg-amber-900 transition-colors border border-amber-700/50"
              >
                <span>Samarth Portal</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>

      {/* Navigation Sub-Tabs */}
      <div className="border-t border-stone-800 bg-stone-950/60 px-4 sm:px-6">
        <div className="mx-auto max-w-7xl flex items-center justify-between">
          <nav className="flex space-x-1 sm:space-x-3 py-1.5 text-xs">
            <button
              id="tab-chat-btn"
              type="button"
              onClick={() => onTabChange("chat")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
                activeTab === "chat"
                  ? "bg-amber-700 text-white shadow-xs"
                  : "text-stone-300 hover:text-white hover:bg-stone-800"
              }`}
            >
              <MessageSquareText className="w-3.5 h-3.5" />
              <span>CSU Mitra Helpdesk (AI)</span>
            </button>

            <button
              id="tab-script-btn"
              type="button"
              onClick={() => onTabChange("script")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
                activeTab === "script"
                  ? "bg-amber-700 text-white shadow-xs"
                  : "text-stone-300 hover:text-white hover:bg-stone-800"
              }`}
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>Python Gradio Script (`app.py`)</span>
            </button>

            <button
              id="tab-directory-btn"
              type="button"
              onClick={onOpenDirectory}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium text-stone-300 hover:text-white hover:bg-stone-800 transition-all"
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Campuses & Programs</span>
            </button>
          </nav>
        </div>
      </div>
    </header>

    
  </>
  );
};
