import React, { useState } from "react";
import { X, Building2, GraduationCap, Globe, ExternalLink, Phone, ShieldCheck, Sparkles } from "lucide-react";
import { CSU_CAMPUSES, CSU_PROGRAMS, OFFICIAL_PORTALS } from "../data/csuData";

interface DirectoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPrompt?: (prompt: string) => void;
}

export const DirectoryModal: React.FC<DirectoryModalProps> = ({ isOpen, onClose, onSelectPrompt }) => {
  const [activeTab, setActiveTab] = useState<"campuses" | "programs" | "portals">("campuses");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 backdrop-blur-xs p-3 sm:p-6 overflow-y-auto">
      <div
        id="csu-directory-modal"
        className="relative w-full max-w-4xl rounded-2xl bg-white shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-amber-800 to-amber-950 text-white">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 text-amber-200">
              🏛️
            </span>
            <div>
              <h3 className="text-base font-bold tracking-wide">
                Central Sanskrit University Official Directory
              </h3>
              <p className="text-xs text-amber-200/90 font-serif">
                केन्द्रीय संस्कृत विश्वविद्यालय निर्देशिका (परिसराः, पाठ्यक्रमाः, जालस्थानानि)
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-amber-200 hover:bg-white/10 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-stone-200 bg-stone-50/80 px-5 pt-2 gap-2">
          <button
            type="button"
            onClick={() => setActiveTab("campuses")}
            className={`flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-semibold rounded-t-lg transition-all border-b-2 ${
              activeTab === "campuses"
                ? "border-amber-700 text-amber-900 bg-white shadow-2xs"
                : "border-transparent text-stone-600 hover:text-stone-900"
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Campuses ({CSU_CAMPUSES.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("programs")}
            className={`flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-semibold rounded-t-lg transition-all border-b-2 ${
              activeTab === "programs"
                ? "border-amber-700 text-amber-900 bg-white shadow-2xs"
                : "border-transparent text-stone-600 hover:text-stone-900"
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Degrees & Programs ({CSU_PROGRAMS.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("portals")}
            className={`flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-semibold rounded-t-lg transition-all border-b-2 ${
              activeTab === "portals"
                ? "border-amber-700 text-amber-900 bg-white shadow-2xs"
                : "border-transparent text-stone-600 hover:text-stone-900"
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Official Portals</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="p-5 overflow-y-auto space-y-4">
          {activeTab === "campuses" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {CSU_CAMPUSES.map((campus) => (
                <div
                  key={campus.id}
                  className="rounded-xl border border-stone-200 bg-stone-50/50 p-3.5 hover:border-amber-300 hover:bg-amber-50/20 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="text-sm font-bold text-stone-900">
                          {campus.name}
                        </h4>
                        <p className="text-xs font-serif text-amber-800 font-medium">
                          {campus.sanskritName}
                        </p>
                      </div>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                          campus.hostelAvailable
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-stone-200 text-stone-700"
                        }`}
                      >
                        {campus.hostelAvailable ? "Hostel Avail." : "Non-Res"}
                      </span>
                    </div>

                    <p className="mt-1 text-xs text-stone-600 font-medium">
                      📍 {campus.city}, {campus.state}
                    </p>

                    <div className="mt-2.5 flex flex-wrap gap-1">
                      {campus.specialties.map((spec) => (
                        <span
                          key={spec}
                          className="text-[10px] bg-white border border-stone-200 text-stone-700 px-1.5 py-0.5 rounded"
                        >
                          {spec}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-stone-200/60 flex items-center justify-between text-xs text-stone-600">
                    <span className="flex items-center gap-1 font-mono text-[11px]">
                      <Phone className="w-3 h-3 text-stone-400" />
                      {campus.contact}
                    </span>
                    {onSelectPrompt && (
                      <button
                        type="button"
                        onClick={() => {
                          onSelectPrompt(
                            `Tell me about the academic courses, faculty, and hostel admissions at Central Sanskrit University's ${campus.name} in ${campus.city}.`
                          );
                          onClose();
                        }}
                        className="text-amber-800 hover:text-amber-950 font-medium text-xs flex items-center gap-0.5"
                      >
                        Ask Mitra &rarr;
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === "programs" && (
            <div className="space-y-3">
              {CSU_PROGRAMS.map((prog) => (
                <div
                  key={prog.name}
                  className="rounded-xl border border-stone-200 bg-stone-50/50 p-4 hover:border-amber-300 transition-all"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-2 border-b border-stone-200/60">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-100 text-amber-900">
                          {prog.level}
                        </span>
                        <h4 className="text-sm font-bold text-stone-900">
                          {prog.name}
                        </h4>
                      </div>
                      <p className="text-xs font-serif text-amber-800 mt-0.5">
                        {prog.sanskritName} • Duration: {prog.duration}
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="text-[11px] font-medium text-stone-500 block">
                        Admission via:
                      </span>
                      <span className="text-xs font-semibold text-amber-900">
                        {prog.admissionMode}
                      </span>
                    </div>
                  </div>

                  <p className="mt-2.5 text-xs text-stone-700 leading-relaxed">
                    {prog.description}
                  </p>

                  <div className="mt-2 text-xs text-stone-600 bg-white p-2 rounded border border-stone-200/70 flex items-center justify-between">
                    <span>
                      <strong className="text-stone-800">Eligibility:</strong> {prog.eligibility}
                    </span>
                    {onSelectPrompt && (
                      <button
                        type="button"
                        onClick={() => {
                          onSelectPrompt(
                            `What is the syllabus, admission criteria, and career prospects for ${prog.name} (${prog.sanskritName}) at CSU?`
                          );
                          onClose();
                        }}
                        className="text-amber-800 hover:text-amber-950 font-medium text-xs whitespace-nowrap ml-2"
                      >
                        Ask Details &rarr;
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === "portals" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {OFFICIAL_PORTALS.map((portal) => (
                <div
                  key={portal.title}
                  className="rounded-xl border border-stone-200 bg-stone-50/50 p-4 hover:border-amber-300 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-sm font-bold text-stone-900">
                        {portal.title}
                      </h4>
                      {portal.isPrimary && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900">
                          Official
                        </span>
                      )}
                    </div>
                    <p className="text-xs font-serif text-amber-800">
                      {portal.sanskritTitle}
                    </p>
                    <p className="mt-2 text-xs text-stone-600 leading-relaxed">
                      {portal.description}
                    </p>
                  </div>

                  <div className="mt-4 pt-2.5 border-t border-stone-200/60">
                    <a
                      href={portal.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-800 hover:text-amber-950 hover:underline"
                    >
                      <span>Visit Portal</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
