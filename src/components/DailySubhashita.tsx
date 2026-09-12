import React, { useState } from "react";
import { Volume2, VolumeX, RefreshCw, Copy, Check, BookOpen } from "lucide-react";
import { SUBHASHITAS } from "../data/csuData";
import { Subhashita } from "../types";

export const DailySubhashita: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  const subhashita: Subhashita = SUBHASHITAS[currentIndex] || SUBHASHITAS[0];

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % SUBHASHITAS.length);
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  const handleRecite = () => {
    if (!("speechSynthesis" in window)) {
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const cleanText = subhashita.shlok.replace(/[।॥]/g, ".");
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = "hi-IN";
    utterance.rate = 0.85; // Scholarly measured pace
    utterance.pitch = 1.0;

    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const handleCopy = async () => {
    const textToCopy = `${subhashita.shlok}\n(${subhashita.transliteration})\n\nहिन्दी अर्थ: ${subhashita.hindi}\n\nEnglish: ${subhashita.english}\n— ${subhashita.source} (Central Sanskrit University)`;
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  return (
    <div
      id="daily-subhashita-card"
      className="relative overflow-hidden rounded-xl border border-amber-200/80 bg-gradient-to-br from-amber-50/90 via-orange-50/40 to-stone-50 p-4 sm:p-5 shadow-sm transition-all"
    >
      {/* Decorative Traditional Border Accent */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-600 via-orange-500 to-amber-700" />

      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-amber-200/50">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-600/10 text-amber-800 text-sm font-bold">
            🕉️
          </span>
          <div>
            <h2 className="text-xs font-semibold tracking-wider text-amber-900 uppercase">
              दैनिकं संस्कृत-सुभाषितम्
            </h2>
            <p className="text-[11px] text-amber-700/80">
              Daily Sanskrit Shloka • {subhashita.source}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5">
          <button
            id="recite-shlok-btn"
            type="button"
            onClick={handleRecite}
            title={isSpeaking ? "Stop recitation" : "Recite Shloka"}
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
              isSpeaking
                ? "bg-amber-600 text-white"
                : "bg-white text-stone-700 border border-stone-200 hover:bg-amber-50 hover:text-amber-900 hover:border-amber-300"
            }`}
          >
            {isSpeaking ? (
              <>
                <VolumeX className="w-3.5 h-3.5" />
                <span>विराम</span>
              </>
            ) : (
              <>
                <Volume2 className="w-3.5 h-3.5" />
                <span>उच्चारणम्</span>
              </>
            )}
          </button>

          <button
            id="copy-shlok-btn"
            type="button"
            onClick={handleCopy}
            title="Copy Shloka & Meanings"
            className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium bg-white text-stone-700 border border-stone-200 hover:bg-amber-50 hover:text-amber-900 hover:border-amber-300 transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700">प्रतिलिपिः</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>प्रतिलिपि</span>
              </>
            )}
          </button>

          <button
            id="next-shlok-btn"
            type="button"
            onClick={handleNext}
            title="Next Subhashita"
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-amber-700 text-white hover:bg-amber-800 transition-colors shadow-xs"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>नूतन-सुभाषितम्</span>
          </button>
        </div>
      </div>

      {/* Shloka Body */}
      <div className="pt-3.5">
        <div className="rounded-lg bg-white/80 p-3.5 border border-amber-100 shadow-2xs">
          <p className="whitespace-pre-line text-base sm:text-lg font-serif font-semibold text-amber-950 leading-relaxed text-center tracking-wide">
            {subhashita.shlok}
          </p>
          <p className="mt-2 text-center text-xs italic text-stone-600 font-mono">
            {subhashita.transliteration}
          </p>
        </div>

        {/* Trilingual Interpretation */}
        <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-2.5 text-xs">
          <div className="rounded-md bg-white/70 p-2.5 border border-stone-200/60">
            <span className="font-semibold text-amber-900 block mb-0.5">
              🇮🇳 हिन्दी अर्थ:
            </span>
            <p className="text-stone-700 leading-relaxed">{subhashita.hindi}</p>
          </div>
          <div className="rounded-md bg-white/70 p-2.5 border border-stone-200/60">
            <span className="font-semibold text-amber-900 block mb-0.5">
              🌐 English Meaning:
            </span>
            <p className="text-stone-700 leading-relaxed">{subhashita.english}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
