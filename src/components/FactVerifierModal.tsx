import React, { useState } from "react";
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ExternalLink,
  Copy,
  Check,
  Search,
  Sparkles,
  Building2,
  BookOpen,
  HelpCircle,
  X,
  Loader2,
} from "lucide-react";
import type { FactVerification } from "../types";

interface FactVerifierModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkMode: boolean;
  onAskInChat: (query: string) => void;
}

const PRESET_CLAIMS = [
  {
    title: "Bhopal Campus Director",
    claim: "Is Prof. Hans Dhar Jha the Director of Bhopal Campus?",
    category: "Administration",
  },
  {
    title: "CSU Vice-Chancellor",
    claim: "Who is the Vice-Chancellor of Central Sanskrit University?",
    category: "Leadership",
  },
  {
    title: "Bhopal Hostel & Fees",
    claim: "What are the hostel names and room fees in Bhopal Campus?",
    category: "Campus Facilities",
  },
  {
    title: "Central Library Name",
    claim: "What is the name of Central Library in Bhopal campus?",
    category: "Academics",
  },
  {
    title: "Result & Marksheet Verification",
    claim: "How can I verify CSU semester marksheet and exam results?",
    category: "Examinations",
  },
  {
    title: "NEP-2020 Shastri Program",
    claim: "Is Shastri a 4-year undergraduate degree under NEP-2020?",
    category: "Programs",
  },
];

export const FactVerifierModal: React.FC<FactVerifierModalProps> = ({
  isOpen,
  onClose,
  isDarkMode,
  onAskInChat,
}) => {
  const [claim, setClaim] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [result, setResult] = useState<FactVerification | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleVerify = async (textToVerify?: string) => {
    const query = (textToVerify !== undefined ? textToVerify : claim).trim();
    if (!query) return;

    if (textToVerify) {
      setClaim(textToVerify);
    }

    setIsVerifying(true);
    setError(null);

    try {
      const res = await fetch("/api/verify-fact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ claim: query }),
      });

      if (!res.ok) {
        throw new Error(`Verification service returned status ${res.status}`);
      }

      const data = await res.json();
      setResult(data);
    } catch (err: any) {
      setError("तथ्य सत्यापन में त्रुटि हुई। कृपया पुनः प्रयास करें। / Verification error occurred.");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleCopyCitation = () => {
    if (!result) return;
    const text = `[CSU Mitra Fact Verification]
Status: ${result.verdict} (${result.confidence}% Confidence)
Statement: ${result.summary}
Sources: ${result.officialSources.map((s) => `${s.title} (${s.url})`).join(", ")}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className={`w-full max-w-2xl max-h-[90vh] rounded-2xl flex flex-col shadow-2xl overflow-hidden border transition-colors ${
          isDarkMode
            ? "bg-stone-900 border-stone-800 text-stone-100"
            : "bg-white border-stone-200 text-stone-900"
        }`}
      >
        {/* Modal Header */}
        <div
          className={`px-5 py-4 border-b flex items-center justify-between shrink-0 ${
            isDarkMode ? "border-stone-800 bg-stone-950/40" : "border-stone-100 bg-stone-50"
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600/10 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base tracking-tight">CSU Fact Verifier</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wide bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                  आधिकारिक सत्यापन
                </span>
              </div>
              <p
                className={`text-xs ${
                  isDarkMode ? "text-stone-400" : "text-stone-500"
                }`}
              >
                Cross-reference claims directly against Central Sanskrit University official records
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className={`p-1.5 rounded-lg transition-colors ${
              isDarkMode
                ? "hover:bg-stone-800 text-stone-400 hover:text-stone-200"
                : "hover:bg-stone-200/70 text-stone-500 hover:text-stone-800"
            }`}
            title="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Search / Claim Input */}
          <div className="space-y-2">
            <label
              htmlFor="fact-claim-input"
              className={`block text-xs font-semibold uppercase tracking-wider ${
                isDarkMode ? "text-stone-300" : "text-stone-700"
              }`}
            >
              Verify Any Claim or Query / किसी भी दावे या प्रश्न की जांच करें:
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search
                  className={`absolute left-3.5 top-3 w-4 h-4 ${
                    isDarkMode ? "text-stone-500" : "text-stone-400"
                  }`}
                />
                <input
                  id="fact-claim-input"
                  type="text"
                  value={claim}
                  onChange={(e) => setClaim(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !isVerifying) {
                      handleVerify();
                    }
                  }}
                  placeholder="e.g. Is Prof. Hans Dhar Jha director of Bhopal campus? or Hostel fees..."
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm focus:outline-none transition-colors ${
                    isDarkMode
                      ? "bg-stone-950 border-stone-800 text-stone-100 placeholder-stone-500 focus:border-emerald-600"
                      : "bg-stone-50 border-stone-200 text-stone-900 placeholder-stone-400 focus:border-emerald-500 focus:bg-white"
                  }`}
                />
              </div>
              <button
                type="button"
                onClick={() => handleVerify()}
                disabled={isVerifying || !claim.trim()}
                className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold inline-flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-2xs shrink-0"
              >
                {isVerifying ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Checking...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Verify Fact</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Preset Student Claims */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span
                className={`text-[11px] font-semibold uppercase tracking-wider ${
                  isDarkMode ? "text-stone-400" : "text-stone-500"
                }`}
              >
                Popular Verified Claims & Student Inquiries:
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {PRESET_CLAIMS.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleVerify(item.claim)}
                  disabled={isVerifying}
                  className={`text-left p-2.5 rounded-xl border text-xs transition-all flex flex-col justify-between ${
                    isDarkMode
                      ? "bg-stone-950/60 border-stone-800/80 hover:border-emerald-800 hover:bg-stone-900"
                      : "bg-stone-50 border-stone-200/80 hover:border-emerald-300 hover:bg-emerald-50/40"
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="font-semibold text-stone-800 dark:text-stone-200 truncate">
                      {item.title}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-stone-200/60 dark:bg-stone-800 text-stone-600 dark:text-stone-400 shrink-0">
                      {item.category}
                    </span>
                  </div>
                  <span className="text-stone-500 dark:text-stone-400 line-clamp-1">
                    {item.claim}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Verification Result Card */}
          {result && (
            <div
              className={`p-4 sm:p-5 rounded-2xl border transition-all space-y-4 animate-in fade-in duration-200 ${
                result.status === "VERIFIED"
                  ? isDarkMode
                    ? "bg-emerald-950/20 border-emerald-900/60 text-stone-100"
                    : "bg-emerald-50/80 border-emerald-200 text-stone-900"
                  : result.status === "INCORRECT"
                  ? isDarkMode
                    ? "bg-red-950/20 border-red-900/60 text-stone-100"
                    : "bg-red-50/80 border-red-200 text-stone-900"
                  : isDarkMode
                  ? "bg-amber-950/20 border-amber-900/60 text-stone-100"
                  : "bg-amber-50/80 border-amber-200 text-stone-900"
              }`}
            >
              {/* Verdict Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  {result.status === "VERIFIED" && (
                    <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                  )}
                  {result.status === "INCORRECT" && (
                    <div className="w-8 h-8 rounded-lg bg-red-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
                      <XCircle className="w-5 h-5" />
                    </div>
                  )}
                  {result.status !== "VERIFIED" && result.status !== "INCORRECT" && (
                    <div className="w-8 h-8 rounded-lg bg-amber-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
                      <AlertTriangle className="w-5 h-5" />
                    </div>
                  )}
                  <div>
                    <h4 className="font-bold text-sm tracking-tight">{result.verdict}</h4>
                    <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                      Confidence: {result.confidence}% Match with Official CSU Records
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleCopyCitation}
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border text-xs font-medium transition-colors ${
                    isDarkMode
                      ? "bg-stone-900 border-stone-700 text-stone-300 hover:bg-stone-800"
                      : "bg-white border-stone-200 text-stone-700 hover:bg-stone-100"
                  }`}
                  title="Copy verification report"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                      <span className="text-emerald-500">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-stone-500" />
                      <span>Copy Citation</span>
                    </>
                  )}
                </button>
              </div>

              {/* Factual Statement / Ground Truth */}
              <div
                className={`p-3.5 rounded-xl text-xs sm:text-sm leading-relaxed border ${
                  isDarkMode
                    ? "bg-stone-950/80 border-stone-800/80 text-stone-200"
                    : "bg-white border-stone-200/80 text-stone-800"
                }`}
              >
                {result.summary}
              </div>

              {/* Key Fact Points */}
              {result.keyPoints && result.keyPoints.length > 0 && (
                <div className="space-y-1.5">
                  <span
                    className={`text-[11px] font-bold uppercase tracking-wider block ${
                      isDarkMode ? "text-stone-400" : "text-stone-600"
                    }`}
                  >
                    Verified Key Points / सत्यापित तथ्य बिंदु:
                  </span>
                  <div className="space-y-1">
                    {result.keyPoints.map((pt, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-2 text-xs text-stone-700 dark:text-stone-300"
                      >
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                        <span>{pt}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Official University Sources */}
              {result.officialSources && result.officialSources.length > 0 && (
                <div className="space-y-1.5 pt-1">
                  <span
                    className={`text-[11px] font-bold uppercase tracking-wider block ${
                      isDarkMode ? "text-stone-400" : "text-stone-600"
                    }`}
                  >
                    Verified Portals & Direct Links / आधिकारिक स्रोत:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {result.officialSources.map((src, i) => (
                      <a
                        key={i}
                        href={src.url}
                        target="_blank"
                        rel="noreferrer noopener"
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all hover:scale-[1.02] shadow-2xs ${
                          isDarkMode
                            ? "bg-stone-900 border-emerald-900 text-emerald-300 hover:bg-stone-800 hover:border-emerald-700"
                            : "bg-white border-emerald-200 text-emerald-800 hover:bg-emerald-50 hover:border-emerald-300"
                        }`}
                      >
                        <ExternalLink className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        <span>{src.title}</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Action: Ask CSU Mitra in Chat */}
              <div
                className={`pt-3 border-t flex items-center justify-between ${
                  isDarkMode ? "border-stone-800" : "border-stone-200/80"
                }`}
              >
                <span
                  className={`text-[11px] ${
                    isDarkMode ? "text-stone-400" : "text-stone-500"
                  }`}
                >
                  Verified against Central Sanskrit Universities Act 2020
                </span>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onAskInChat(`Kripya is verified information ke aage aur detail samjhao: "${claim}"`);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold transition-colors shadow-2xs"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Ask CSU Mitra in Chat</span>
                </button>
              </div>
            </div>
          )}

          {error && (
            <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
