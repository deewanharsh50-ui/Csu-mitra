import React from "react";
import { Download, Smartphone, CheckCircle, ShieldCheck, HelpCircle, X, ExternalLink, Sparkles } from "lucide-react";

interface ApkDownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ApkDownloadModal: React.FC<ApkDownloadModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-2xl bg-stone-900 border border-amber-600/40 text-stone-100 shadow-2xl p-6 sm:p-7 overflow-hidden">
        {/* Background ambient glow */}
        <div className="absolute -top-24 -right-24 w-48 h-48 rounded-full bg-amber-600/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 rounded-full bg-emerald-600/10 blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
          title="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header with Samskrit Bharat Logo */}
        <div className="flex items-center gap-4 mb-5">
          <img
            src="/icon-192.png"
            alt="Samskrit Bharat Logo"
            className="w-16 h-16 rounded-full border-2 border-amber-400/60 shadow-md object-cover bg-navy-950 shrink-0"
            loading="eager"
          />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-serif font-bold text-amber-100">
                CSU Mitra Android App
              </h2>
              <span className="rounded bg-emerald-500/20 border border-emerald-500/40 px-2 py-0.5 text-[10px] font-semibold text-emerald-300">
                100% Signed APK
              </span>
            </div>
            <p className="text-xs text-stone-300 mt-0.5">
              Central Sanskrit University Official AI Assistant • v1.0.0
            </p>
          </div>
        </div>

        {/* Direct Download Action */}
        <div className="bg-stone-950/80 rounded-xl p-4 border border-stone-800 mb-5">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div>
              <div className="text-xs text-stone-400 font-medium">फ़ाइल का नाम / File Name:</div>
              <div className="text-sm font-mono font-semibold text-amber-300">csu-mitra.apk (290 KB)</div>
            </div>
            <a
              href="/csu-mitra.apk"
              download="csu-mitra.apk"
              target="_blank"
              rel="noopener noreferrer"
              id="modal-direct-apk-download-btn"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 via-amber-600 to-orange-600 hover:from-amber-400 hover:to-orange-500 px-5 py-2.5 text-sm font-bold text-white shadow-lg hover:shadow-amber-500/20 active:scale-98 transition-all"
            >
              <Download className="w-4 h-4 animate-bounce" />
              <span>Direct Download APK</span>
            </a>
          </div>
        </div>

        {/* 4-Step Installation Guide */}
        <div className="space-y-3 mb-5">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
            <Smartphone className="w-3.5 h-3.5" />
            <span>Android फोन में इनस्टॉल कैसे करें (Install Steps):</span>
          </h3>

          <div className="grid grid-cols-1 gap-2 text-xs text-stone-300">
            <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-stone-800/60 border border-stone-700/50">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-500/20 text-amber-300 font-bold text-[11px]">
                1
              </span>
              <div>
                <strong>डाउनलोड करें:</strong> ऊपर दिए गए <strong>"Direct Download APK"</strong> बटन पर क्लिक करें। Browser में <code className="text-amber-200">csu-mitra.apk</code> डाउनलोड होना शुरू हो जाएगा।
              </div>
            </div>

            <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-stone-800/60 border border-stone-700/50">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-500/20 text-amber-300 font-bold text-[11px]">
                2
              </span>
              <div>
                <strong>चेतावनी (Security Prompt):</strong> यदि Chrome या Browser <span className="text-amber-300">"File might be harmful"</span> दिखाए, तो <strong>"Download anyway"</strong> (डाउनलोड जारी रखें) चुनें।
              </div>
            </div>

            <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-stone-800/60 border border-stone-700/50">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-500/20 text-amber-300 font-bold text-[11px]">
                3
              </span>
              <div>
                <strong>अनुमति दें (Allow Unknown Apps):</strong> फाइल पर टैप करें। यदि Settings खुले, तो <strong>"Allow from this source"</strong> (इस स्रोत से इंस्टॉल करें) को ON करें।
              </div>
            </div>

            <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-stone-800/60 border border-stone-700/50">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-[11px]">
                4
              </span>
              <div>
                <strong>इंस्टॉल पूरा हुआ:</strong> <strong>"Install"</strong> पर टैप करें। आपके फोन की होम स्क्रीन पर <strong>Samskrit Bharat</strong> के सुंदर नए लोगो के साथ CSU Mitra ऐप उपलब्ध हो जाएगा!
              </div>
            </div>
          </div>
        </div>

        {/* Security & Authenticity Guarantee */}
        <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-950/40 border border-emerald-600/30 text-emerald-200 text-xs">
          <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>
            यह APK सुरक्षित, हस्ताक्षरित (Signed) और केंद्रीय संस्कृत विश्वविद्यालय के विद्यार्थियों व शोधार्थियों के लिए तैयार किया गया है।
          </span>
        </div>
      </div>
    </div>
  );
};
