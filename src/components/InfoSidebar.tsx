import React from "react";
import {
  ExternalLink,
  Phone,
  Mail,
  MapPin,
  GraduationCap,
  Building2,
  FileCheck,
  Globe,
  Sparkles,
  BookOpen,
} from "lucide-react";
import { OFFICIAL_PORTALS } from "../data/csuData";

interface InfoSidebarProps {
  onSelectPrompt: (prompt: string) => void;
  onOpenDirectory: () => void;
}

export const InfoSidebar: React.FC<InfoSidebarProps> = ({
  onSelectPrompt,
  onOpenDirectory,
}) => {
  return (
    <aside className="w-full lg:w-80 shrink-0 space-y-4">
      {/* Official Portals Card */}
      <div className="rounded-xl border border-stone-200 bg-white p-4 shadow-2xs">
        <div className="flex items-center justify-between pb-2.5 border-b border-stone-100">
          <div className="flex items-center gap-1.5">
            <Globe className="w-4 h-4 text-amber-700" />
            <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider">
              Official University Portals
            </h3>
          </div>
          <span className="text-[10px] bg-amber-100 text-amber-800 font-semibold px-1.5 py-0.5 rounded">
            CSU Delhi
          </span>
        </div>

        <div className="mt-3 space-y-2 text-xs">
          {OFFICIAL_PORTALS.slice(0, 4).map((portal) => (
            <a
              key={portal.title}
              href={portal.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-start justify-between p-2 rounded-lg border border-stone-100 hover:border-amber-300 hover:bg-amber-50/40 transition-all"
            >
              <div>
                <span className="font-semibold text-stone-800 group-hover:text-amber-900 block text-xs">
                  {portal.title}
                </span>
                <span className="text-[11px] text-stone-500 line-clamp-1">
                  {portal.sanskritTitle}
                </span>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-stone-400 group-hover:text-amber-700 shrink-0 mt-0.5" />
            </a>
          ))}
        </div>
      </div>

      {/* Quick Academic Topics */}
      <div className="rounded-xl border border-stone-200 bg-white p-4 shadow-2xs">
        <div className="flex items-center justify-between pb-2.5 border-b border-stone-100">
          <div className="flex items-center gap-1.5">
            <GraduationCap className="w-4 h-4 text-amber-700" />
            <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider">
              Academic Inquiries
            </h3>
          </div>
          <button
            type="button"
            onClick={onOpenDirectory}
            className="text-[11px] text-amber-800 hover:underline font-medium"
          >
            All Degrees
          </button>
        </div>

        <div className="mt-3 space-y-1.5 text-xs">
          <button
            type="button"
            onClick={() =>
              onSelectPrompt(
                "What is the eligibility, duration, and admission process for Shastri (B.A. Honours) at Central Sanskrit University?"
              )
            }
            className="w-full text-left p-2 rounded-lg bg-stone-50 hover:bg-amber-50 hover:text-amber-950 text-stone-700 transition-colors border border-stone-100 flex items-center justify-between"
          >
            <span>Shastri (B.A.) via CUET</span>
            <span className="text-amber-700">&rarr;</span>
          </button>

          <button
            type="button"
            onClick={() =>
              onSelectPrompt(
                "How can I apply for Shiksha Shastri (B.Ed. in Sanskrit) through NTA CUET and what are the teaching career outcomes?"
              )
            }
            className="w-full text-left p-2 rounded-lg bg-stone-50 hover:bg-amber-50 hover:text-amber-950 text-stone-700 transition-colors border border-stone-100 flex items-center justify-between"
          >
            <span>Shiksha Shastri (B.Ed.)</span>
            <span className="text-amber-700">&rarr;</span>
          </button>

          <button
            type="button"
            onClick={() =>
              onSelectPrompt(
                "What are the traditional Shastra disciplines offered for Acharya (M.A.) across CSU campuses?"
              )
            }
            className="w-full text-left p-2 rounded-lg bg-stone-50 hover:bg-amber-50 hover:text-amber-950 text-stone-700 transition-colors border border-stone-100 flex items-center justify-between"
          >
            <span>Acharya (M.A.) Shastras</span>
            <span className="text-amber-700">&rarr;</span>
          </button>

          <button
            type="button"
            onClick={() =>
              onSelectPrompt(
                "How does Vidyanidhi (Ph.D.) entrance and fellowship scheme work at Central Sanskrit University?"
              )
            }
            className="w-full text-left p-2 rounded-lg bg-stone-50 hover:bg-amber-50 hover:text-amber-950 text-stone-700 transition-colors border border-stone-100 flex items-center justify-between"
          >
            <span>Vidyanidhi (Ph.D.) Research</span>
            <span className="text-amber-700">&rarr;</span>
          </button>
        </div>
      </div>

      

        <div className="mt-3 flex items-center justify-between gap-2">
          <span className="text-[10px] text-stone-400 font-mono">Size: 290 KB</span>
          <a
            href="/csu-mitra.apk"
            download="csu-mitra.apk"
            target="_blank"
            rel="noopener noreferrer"
            id="sidebar-apk-download-btn"
            className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 px-3 py-1.5 text-xs font-bold text-white shadow-xs hover:shadow transition-all border border-emerald-400/40"
          >
            <span>Download APK</span>
            <ExternalLink className="w-3 h-3 text-emerald-200" />
          </a>
        </div>
      </div>

      {/* University Contact & Guardrail Info */}
      <div className="rounded-xl border border-amber-200/80 bg-amber-50/50 p-4 shadow-2xs text-xs">
        <h4 className="font-bold text-amber-950 flex items-center gap-1.5">
          <Building2 className="w-3.5 h-3.5 text-amber-700" />
          <span>Central Sanskrit University HQ</span>
        </h4>
        <p className="mt-1 text-[11px] text-amber-900/80 font-serif">
          केन्द्रीय संस्कृत विश्वविद्यालय मुख्यालयः, नवदेहली
        </p>

        <div className="mt-2.5 space-y-1.5 text-[11px] text-stone-700">
          <div className="flex items-start gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-amber-700 shrink-0 mt-0.5" />
            <span>56-57, Institutional Area, Janakpuri, New Delhi - 110058</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Phone className="w-3.5 h-3.5 text-amber-700 shrink-0" />
            <span>011-28524993, 28524995</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Mail className="w-3.5 h-3.5 text-amber-700 shrink-0" />
            <span>registrar@csu.co.in</span>
          </div>
        </div>

        <div className="mt-3 pt-2.5 border-t border-amber-200/60 text-[10px] text-stone-600 leading-tight">
          ⚠️ <em>Guardrail:</em> CSU Mitra provides verified academic guidance. All exact exam dates & cutoff ranks are subject to binding notification circulars on <a href="https://sanskrit.nic.in" target="_blank" rel="noopener noreferrer" className="text-amber-800 underline">sanskrit.nic.in</a>.
        </div>
      </div>
    </aside>
  );
};
