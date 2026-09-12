export type LanguageMode = "all" | "sa" | "hi" | "en" | "hinglish";

export interface FactVerification {
  status: "VERIFIED" | "INCORRECT" | "PARTIAL" | "OFFICIAL_RECORD";
  confidence: number;
  verdict: string;
  summary: string;
  officialSources: Array<{ title: string; url: string; note?: string }>;
  keyPoints: string[];
  lastVerifiedAt: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  image?: string;
  mimeType?: string;
  fileName?: string;
  fileSize?: string;
  fileType?: "image" | "file";
  model?: string;
  isError?: boolean;
  searchedWeb?: boolean;
  sources?: Array<{ title: string; url: string; snippet?: string }>;
  factVerification?: FactVerification;
}

export interface Subhashita {
  id: number;
  shlok: string;
  transliteration: string;
  hindi: string;
  english: string;
  source: string;
}

export interface Campus {
  id: string;
  name: string;
  sanskritName: string;
  director?: string;
  address?: string;
  city: string;
  state: string;
  specialties: string[];
  hostelAvailable: boolean;
  contact: string;
  portalUrl: string;
}

export interface ProgramInfo {
  level: string;
  name: string;
  sanskritName: string;
  duration: string;
  eligibility: string;
  admissionMode: string;
  description: string;
}

export interface PortalLink {
  title: string;
  sanskritTitle: string;
  url: string;
  description: string;
  category: "admissions" | "examinations" | "distance" | "general";
  isPrimary?: boolean;
}
