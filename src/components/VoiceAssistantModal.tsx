import { getFallbackCsuResponse } from "../utils/csuBrain";
import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  X,
  Sparkles,
  Square,
  MessageSquare,
  ChevronDown,
  Languages,
} from "lucide-react";
import { ChatMessage, LanguageMode } from "../types";

interface VoiceAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddMessagePair: (userText: string, assistantText: string) => void;
  language: LanguageMode;
  onLanguageChange: (lang: LanguageMode) => void;
}

type VoiceStatus = "idle" | "listening" | "thinking" | "speaking";

// Helper to strip markdown and links for clean speech utterance
function cleanTextForSpeech(text: string): string {
  return text
    .replace(/https?:\/\/\S+/g, "") // remove URLs
    .replace(/\[([^\]]+)\]\([^\)]+\)/g, "$1") // replace markdown links with title
    .replace(/[*_~`#>]/g, "") // remove formatting characters
    .replace(/[🏛️📌📞🌐✨🎉📖💡🔍⚠️]/g, "") // remove common emojis for smooth speech
    .replace(/\s+/g, " ")
    .trim();
}

export function VoiceAssistantModal({
  isOpen,
  onClose,
  onAddMessagePair,
  language,
  onLanguageChange,
}: VoiceAssistantModalProps) {
  const [status, setStatus] = useState<VoiceStatus>("idle");
  const [userTranscript, setUserTranscript] = useState<string>("");
  const [interimTranscript, setInterimTranscript] = useState<string>("");
  const [assistantSpokenText, setAssistantSpokenText] = useState<string>("");
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [audioLevel, setAudioLevel] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showFullTranscript, setShowFullTranscript] = useState<boolean>(false);
  const [transcriptHistory, setTranscriptHistory] = useState<
    Array<{ role: "user" | "assistant"; text: string }>
  >([]);

  const recognitionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const activeUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const isComponentMounted = useRef<boolean>(true);
  const isSpeakingRef = useRef<boolean>(false);

  // Initialize Speech Synthesis and AudioContext
  useEffect(() => {
    isComponentMounted.current = true;
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      synthRef.current = window.speechSynthesis;
    }

    return () => {
      isComponentMounted.current = false;
      stopAudioCapture();
      stopListening();
      stopSpeaking();
    };
  }, []);

  // When modal opens, start voice mode automatically
  useEffect(() => {
    if (isOpen) {
      setErrorMessage(null);
      setUserTranscript("");
      setInterimTranscript("");
      setAssistantSpokenText("नमस्ते! मैं CSU मित्र हूँ। आप विश्वविद्यालय के बारे में कुछ भी पूछ सकते हैं।");
      startAudioCapture();
      // Speak initial greeting once modal opens
      speakResponse("नमस्ते! मैं CSU मित्र हूँ। आप विश्वविद्यालय के बारे में कुछ भी पूछ सकते हैं।", true);
    } else {
      stopAudioCapture();
      stopListening();
      stopSpeaking();
    }
  }, [isOpen]);

  // Audio Context for reactive Orb wave visualization
  const startAudioCapture = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) return;
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;

      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;

      const audioCtx = new AudioContextClass();
      audioContextRef.current = audioCtx;
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 64;
      analyserRef.current = analyser;

      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const updateVolume = () => {
        if (!isComponentMounted.current) return;
        if (analyserRef.current) {
          analyserRef.current.getByteFrequencyData(dataArray);
          let sum = 0;
          for (let i = 0; i < bufferLength; i++) {
            sum += dataArray[i];
          }
          const avg = sum / bufferLength;
          // Scale from 0 to 1 with noise threshold
          const normalized = Math.min(1, Math.max(0, (avg - 10) / 100));
          setAudioLevel(normalized);
        }
        animFrameRef.current = requestAnimationFrame(updateVolume);
      };
      updateVolume();
    } catch (err: any) {
      console.warn("Audio mic capture warning:", err);
    }
  };

  const stopAudioCapture = () => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      mediaStreamRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== "closed") {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    setAudioLevel(0);
  };

  // Speech Recognition setup
  const startListening = () => {
    if (isSpeakingRef.current) {
      stopSpeaking();
    }

    const SpeechRecognitionClass =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognitionClass) {
      setErrorMessage("आपके ब्राउज़र में वॉइस रिकग्निशन समर्थित नहीं है। कृपया Chrome/Edge उपयोग करें।");
      setStatus("idle");
      return;
    }

    try {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }

      const recognition = new SpeechRecognitionClass();
      recognitionRef.current = recognition;
      recognition.continuous = false;
      recognition.interimResults = true;

      // Select speech recognition language
      if (language === "en") {
        recognition.lang = "en-IN";
      } else if (language === "sa") {
        recognition.lang = "sa-IN";
      } else {
        recognition.lang = "hi-IN";
      }

      recognition.onstart = () => {
        setStatus("listening");
        setInterimTranscript("");
        setErrorMessage(null);
      };

      recognition.onresult = (event: any) => {
        let interim = "";
        let final = "";

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            final += event.results[i][0].transcript;
          } else {
            interim += event.results[i][0].transcript;
          }
        }

        setInterimTranscript(interim);

        if (final.trim()) {
          setUserTranscript(final);
          processVoiceQuery(final.trim());
        }
      };

      recognition.onerror = (event: any) => {
        console.warn("Speech recognition error:", event.error);
        if (event.error === "no-speech") {
          // If no speech detected, stay ready
          setStatus("idle");
        } else if (event.error === "not-allowed") {
          setErrorMessage("Microphone permission denied. कृपया ब्राउज़र में माइक्रोफोन की अनुमति दें।");
          setStatus("idle");
        } else {
          setStatus("idle");
        }
      };

      recognition.onend = () => {
        if (status === "listening") {
          setStatus("idle");
        }
      };

      recognition.start();
    } catch (e: any) {
      console.warn("Failed to start speech recognition:", e);
      setStatus("idle");
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch {}
      recognitionRef.current = null;
    }
  };

  // Process user voice input through CSU API
  const processVoiceQuery = async (queryText: string) => {
    stopListening();
    setStatus("thinking");
    setInterimTranscript("");

    setTranscriptHistory((prev) => [...prev, { role: "user", text: queryText }]);

    try {
      let data: any = null;
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: controller.signal,
          body: JSON.stringify({
            messages: [{ role: "user", content: queryText }],
            language: language === "all" ? undefined : language,
          }),
        });
        clearTimeout(timeoutId);
        if (res.ok) {
          data = await res.json();
        }
      } catch (_err) {
        // Fallback below
      }

      const rawResponse =
        data?.response ||
        getFallbackCsuResponse(queryText, (language && language !== "all" ? language : "hi") as any);

      setAssistantSpokenText(rawResponse);
      setTranscriptHistory((prev) => [...prev, { role: "assistant", text: rawResponse }]);

      // Add to overall chat history so user doesn't lose it
      onAddMessagePair(queryText, rawResponse);

      // Speak answer out loud
      speakResponse(rawResponse);
    } catch (err: any) {
      const fallback = "क्षमा करें, सर्वर से संपर्क नहीं हो सका। कृपया पुनः बोलें।";
      setAssistantSpokenText(fallback);
      speakResponse(fallback);
    }
  };

  // Browser Text-to-Speech (TTS)
  const speakResponse = (fullText: string, autoListenAfter = true) => {
    if (!synthRef.current) {
      setStatus("idle");
      return;
    }

    stopSpeaking();
    const cleanText = cleanTextForSpeech(fullText);
    if (!cleanText) {
      setStatus("idle");
      return;
    }

    const utterance = new SpeechSynthesisUtterance(cleanText);
    activeUtteranceRef.current = utterance;

    // Pick best Indian Hindi / English voice
    const voices = synthRef.current.getVoices();
    const hindiVoice = voices.find(
      (v) =>
        v.lang.startsWith("hi") ||
        v.name.toLowerCase().includes("hindi") ||
        v.name.toLowerCase().includes("lekha")
    );
    const indianEnglishVoice = voices.find(
      (v) =>
        v.lang === "en-IN" ||
        v.name.toLowerCase().includes("india") ||
        v.name.toLowerCase().includes("rishi") ||
        v.name.toLowerCase().includes("veena")
    );

    if (language === "en" && indianEnglishVoice) {
      utterance.voice = indianEnglishVoice;
      utterance.lang = "en-IN";
    } else if (hindiVoice) {
      utterance.voice = hindiVoice;
      utterance.lang = "hi-IN";
    } else if (indianEnglishVoice) {
      utterance.voice = indianEnglishVoice;
      utterance.lang = "en-IN";
    }

    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    utterance.onstart = () => {
      isSpeakingRef.current = true;
      setStatus("speaking");
    };

    utterance.onend = () => {
      isSpeakingRef.current = false;
      setStatus("idle");
      activeUtteranceRef.current = null;
      // After AI finishes speaking, automatically listen to student for hands-free conversation
      if (autoListenAfter && isOpen && !isMuted) {
        setTimeout(() => {
          if (isOpen && !isSpeakingRef.current) {
            startListening();
          }
        }, 400);
      }
    };

    utterance.onerror = (e) => {
      console.warn("Speech synthesis error:", e);
      isSpeakingRef.current = false;
      setStatus("idle");
      activeUtteranceRef.current = null;
    };

    synthRef.current.speak(utterance);
  };

  const stopSpeaking = () => {
    if (synthRef.current) {
      try {
        synthRef.current.cancel();
      } catch {}
    }
    isSpeakingRef.current = false;
    activeUtteranceRef.current = null;
  };

  // Quick chips for student voice query
  const quickVoicePrompts = [
    "12 Campus ke Director",
    "Bhopal Campus Director",
    "Prak-Shastri & Acharya Courses",
    "Jaipur Campus Details",
    "Jammu Campus Director",
  ];

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        key="voice-mode-overlay"
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        transition={{ duration: 0.28, ease: "easeOut" }}
        className="fixed inset-0 z-50 flex flex-col bg-gradient-to-b from-stone-950 via-stone-900 to-black text-white select-none overflow-hidden"
      >
        {/* Ambient Warm Golden/Amber Glow Backdrop (CSU Theme) */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div
            className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[420px] sm:w-[540px] h-[420px] sm:h-[540px] rounded-full blur-3xl transition-opacity duration-700 ${
              status === "listening"
                ? "bg-amber-600/25 opacity-100"
                : status === "speaking"
                ? "bg-amber-500/30 opacity-90"
                : status === "thinking"
                ? "bg-amber-700/30 opacity-80 animate-pulse"
                : "bg-amber-800/15 opacity-50"
            }`}
          />
        </div>

        {/* Top Header Bar */}
        <header className="relative z-10 flex items-center justify-between px-4 sm:px-8 py-4 border-b border-stone-800/80 backdrop-blur-md bg-stone-950/40">
          <div className="flex items-center gap-3">
            <img
              src="/icon-192.png"
              alt="Samskrit Bharat Logo"
              className="h-9 w-9 rounded-full border border-amber-400/80 shadow-md object-cover bg-stone-900"
              loading="lazy"
            />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-semibold tracking-tight text-stone-100">
                  CSU Mitra Voice
                </h2>
                <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Live
                </span>
              </div>
              <p className="text-xs text-stone-400">
                Central Sanskrit University Voice Assistant
              </p>
            </div>
          </div>

          {/* Controls: Language Selector + Exit Button */}
          <div className="flex items-center gap-2">
            {/* Language Selector */}
            <div className="relative">
              <select
                value={language}
                onChange={(e) => onLanguageChange(e.target.value as LanguageMode)}
                className="appearance-none bg-stone-900 border border-stone-800 text-stone-200 text-xs font-medium pl-2.5 pr-7 py-1.5 rounded-full cursor-pointer hover:bg-stone-800 focus:outline-none focus:border-amber-500 transition-colors"
              >
                <option value="all">Auto (हिन्दी/Eng)</option>
                <option value="hi">हिन्दी (Hindi)</option>
                <option value="hinglish">Hinglish</option>
                <option value="en">English</option>
                <option value="sa">संस्कृतम् (Sanskrit)</option>
              </select>
              <ChevronDown className="w-3 h-3 text-stone-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Close Button to return to text chat */}
            <button
              type="button"
              id="close-voice-assistant-btn"
              onClick={onClose}
              className="p-2 rounded-full bg-stone-900 hover:bg-stone-800 text-stone-300 hover:text-white border border-stone-800 transition-all shadow-sm"
              title="Exit Voice Mode"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Center: Dynamic Hypnotic Voice Orb (ChatGPT style) */}
        <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 max-w-xl mx-auto w-full">
          {/* Status Badge */}
          <div className="mb-8">
            <motion.div
              key={status}
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-stone-900/90 border border-stone-800 text-xs font-medium shadow-inner"
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  status === "listening"
                    ? "bg-emerald-400 animate-ping"
                    : status === "speaking"
                    ? "bg-amber-400 animate-pulse"
                    : status === "thinking"
                    ? "bg-amber-500 animate-spin"
                    : "bg-stone-500"
                }`}
              />
              <span className="text-stone-300">
                {status === "listening"
                  ? "Listening to your voice..."
                  : status === "thinking"
                  ? "CSU Mitra is thinking..."
                  : status === "speaking"
                  ? "CSU Mitra speaking..."
                  : "Tap Orb to speak"}
              </span>
            </motion.div>
          </div>

          {/* Animated Glowing Orb Container */}
          <div className="relative flex items-center justify-center my-4">
            {/* Outer Ripple Wave Rings when Speaking or Listening */}
            {(status === "listening" || status === "speaking") && (
              <>
                <motion.div
                  animate={{
                    scale: [1, 1.35 + audioLevel * 0.4, 1],
                    opacity: [0.35, 0.05, 0.35],
                  }}
                  transition={{
                    repeat: Infinity,
                    duration: status === "listening" ? 2 : 1.4,
                    ease: "easeInOut",
                  }}
                  className="absolute w-60 h-60 sm:w-72 sm:h-72 rounded-full border border-amber-500/30 bg-amber-500/5 pointer-events-none"
                />
                <motion.div
                  animate={{
                    scale: [1, 1.6 + audioLevel * 0.5, 1],
                    opacity: [0.2, 0.02, 0.2],
                  }}
                  transition={{
                    repeat: Infinity,
                    duration: status === "listening" ? 2.5 : 1.8,
                    ease: "easeInOut",
                    delay: 0.3,
                  }}
                  className="absolute w-60 h-60 sm:w-72 sm:h-72 rounded-full border border-amber-600/20 pointer-events-none"
                />
              </>
            )}

            {/* Core Interactive Glowing Orb */}
            <motion.button
              type="button"
              id="voice-orb-interactive-btn"
              onClick={() => {
                if (status === "speaking") {
                  stopSpeaking();
                } else if (status === "listening") {
                  stopListening();
                  setStatus("idle");
                } else {
                  startListening();
                }
              }}
              whileTap={{ scale: 0.95 }}
              animate={
                status === "listening"
                  ? {
                      scale: 1 + audioLevel * 0.28,
                      boxShadow: `0 0 ${40 + audioLevel * 50}px rgba(217, 119, 6, 0.7)`,
                    }
                  : status === "speaking"
                  ? {
                      scale: [1, 1.08, 1, 1.05, 1],
                      boxShadow: "0 0 50px rgba(245, 158, 11, 0.75)",
                    }
                  : status === "thinking"
                  ? {
                      rotate: 360,
                      scale: [1, 0.94, 1.04, 1],
                      boxShadow: "0 0 35px rgba(217, 119, 6, 0.5)",
                    }
                  : {
                      scale: [1, 1.02, 1],
                      boxShadow: "0 0 25px rgba(180, 83, 9, 0.35)",
                    }
              }
              transition={
                status === "thinking"
                  ? { repeat: Infinity, duration: 3, ease: "linear" }
                  : status === "speaking"
                  ? { repeat: Infinity, duration: 1.8, ease: "easeInOut" }
                  : { duration: 0.15 }
              }
              className="relative w-44 h-44 sm:w-52 sm:h-52 rounded-full flex items-center justify-center cursor-pointer transition-all focus:outline-none focus:ring-4 focus:ring-amber-500/30 overflow-hidden"
              style={{
                background:
                  status === "listening"
                    ? "radial-gradient(circle at 35% 35%, #fbbf24 0%, #d97706 45%, #92400e 85%, #451a03 100%)"
                    : status === "speaking"
                    ? "radial-gradient(circle at 30% 30%, #fde68a 0%, #f59e0b 40%, #b45309 80%, #78350f 100%)"
                    : status === "thinking"
                    ? "radial-gradient(circle at 50% 50%, #f59e0b 0%, #b45309 50%, #451a03 100%)"
                    : "radial-gradient(circle at 40% 40%, #d97706 0%, #92400e 55%, #451a03 95%)",
              }}
              title={
                status === "speaking"
                  ? "Click to interrupt/stop voice"
                  : status === "listening"
                  ? "Click to finish speaking"
                  : "Click to speak"
              }
            >
              {/* Inner Organic Glass Glow & Shimmer */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-white/30 pointer-events-none rounded-full" />

              {/* Center State Icon */}
              <div className="relative z-10 text-white flex flex-col items-center">
                {status === "listening" ? (
                  <Mic className="w-10 h-10 text-white drop-shadow-md animate-pulse" />
                ) : status === "speaking" ? (
                  <Volume2 className="w-10 h-10 text-white drop-shadow-md" />
                ) : status === "thinking" ? (
                  <Sparkles className="w-10 h-10 text-amber-200 drop-shadow-md animate-spin" />
                ) : (
                  <div className="flex flex-col items-center gap-1">
                    <Mic className="w-9 h-9 text-amber-100/90" />
                    <span className="text-[11px] font-medium tracking-wide text-amber-100/80">
                      Tap to Talk
                    </span>
                  </div>
                )}
              </div>
            </motion.button>
          </div>

          {/* Real-time Subtitles / Spoken Response Area */}
          <div className="w-full text-center mt-6 min-h-[90px] px-2 flex flex-col items-center justify-center">
            {interimTranscript && (
              <p className="text-sm text-amber-300 font-medium italic animate-pulse">
                "{interimTranscript}"
              </p>
            )}

            {!interimTranscript && status === "listening" && (
              <p className="text-sm text-stone-400 font-light">
                बोलिए, मैं सुन रहा हूँ... (Speak your question)
              </p>
            )}

            {status === "thinking" && (
              <p className="text-sm text-amber-300/80 font-medium">
                उत्तर खोज रहा हूँ...
              </p>
            )}

            {status === "speaking" && assistantSpokenText && (
              <p className="text-sm sm:text-base text-stone-100 font-medium leading-relaxed max-w-lg line-clamp-3">
                "{assistantSpokenText}"
              </p>
            )}

            {status === "idle" && !assistantSpokenText && (
              <p className="text-sm text-stone-400">
                ऑर्ब पर टैप करके केन्द्रीय संस्कृत विश्वविद्यालय के बारे में कुछ भी पूछें।
              </p>
            )}

            {errorMessage && (
              <p className="text-xs text-rose-400 mt-2 bg-rose-950/40 px-3 py-1 rounded-full border border-rose-800/60">
                {errorMessage}
              </p>
            )}
          </div>

          {/* Quick Suggested Voice Prompts */}
          <div className="mt-4 flex flex-wrap justify-center gap-2 max-w-md">
            {quickVoicePrompts.slice(0, 3).map((prompt, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setUserTranscript(prompt);
                  processVoiceQuery(prompt);
                }}
                className="px-3 py-1 rounded-full text-xs bg-stone-900/80 hover:bg-amber-900/40 hover:text-amber-200 border border-stone-800 text-stone-300 transition-colors"
              >
                {prompt}
              </button>
            ))}
          </div>
        </main>

        {/* Live Transcript Drawer (Collapsible) */}
        {showFullTranscript && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="relative z-10 max-h-48 overflow-y-auto px-4 py-3 bg-stone-950/90 border-t border-stone-800 text-xs text-stone-300 max-w-2xl mx-auto w-full space-y-2 rounded-t-2xl shadow-2xl"
          >
            <div className="flex items-center justify-between pb-1 border-b border-stone-800">
              <span className="font-semibold text-stone-200">Conversation Transcript</span>
              <button
                type="button"
                onClick={() => setShowFullTranscript(false)}
                className="text-stone-400 hover:text-white"
              >
                Hide
              </button>
            </div>
            {transcriptHistory.length === 0 ? (
              <p className="text-stone-500 italic">No turns yet in this voice session.</p>
            ) : (
              transcriptHistory.map((item, i) => (
                <div
                  key={i}
                  className={`p-2 rounded-lg ${
                    item.role === "user"
                      ? "bg-amber-950/30 text-amber-200 border border-amber-900/30"
                      : "bg-stone-900/80 text-stone-200 border border-stone-800"
                  }`}
                >
                  <span className="font-bold mr-1">
                    {item.role === "user" ? "You:" : "CSU Mitra:"}
                  </span>
                  <span>{item.text}</span>
                </div>
              ))
            )}
          </motion.div>
        )}

        {/* Bottom Voice Control Dock (ChatGPT style) */}
        <footer className="relative z-10 py-5 px-6 border-t border-stone-800/80 bg-stone-950/80 backdrop-blur-md">
          <div className="max-w-md mx-auto flex items-center justify-between">
            {/* View Transcript Toggle */}
            <button
              type="button"
              id="voice-transcript-toggle-btn"
              onClick={() => setShowFullTranscript(!showFullTranscript)}
              className="p-3 rounded-full bg-stone-900 hover:bg-stone-800 text-stone-300 hover:text-white border border-stone-800 transition-colors"
              title="Show / Hide Conversation Transcript"
            >
              <MessageSquare className="w-5 h-5" />
            </button>

            {/* Center: Main Push-to-Talk / Interrupt Action */}
            <div className="flex items-center gap-3">
              {status === "speaking" ? (
                <button
                  type="button"
                  id="voice-interrupt-btn"
                  onClick={stopSpeaking}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-amber-600 hover:bg-amber-500 text-white font-medium text-xs shadow-lg transition-all"
                  title="Interrupt CSU Mitra and speak"
                >
                  <Square className="w-4 h-4 fill-white" />
                  <span>Interrupt</span>
                </button>
              ) : status === "listening" ? (
                <button
                  type="button"
                  id="voice-stop-listen-btn"
                  onClick={() => {
                    stopListening();
                    setStatus("idle");
                  }}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-rose-600 hover:bg-rose-500 text-white font-medium text-xs shadow-lg transition-all animate-pulse"
                  title="Stop listening"
                >
                  <Square className="w-4 h-4 fill-white" />
                  <span>Done Speaking</span>
                </button>
              ) : (
                <button
                  type="button"
                  id="voice-start-listen-btn"
                  onClick={startListening}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-medium text-xs shadow-lg transition-all"
                  title="Start speaking"
                >
                  <Mic className="w-4 h-4" />
                  <span>Tap to Speak</span>
                </button>
              )}
            </div>

            {/* Mute/Sound Toggle or Exit */}
            <button
              type="button"
              id="voice-mute-toggle-btn"
              onClick={() => {
                if (isSpeakingRef.current) {
                  stopSpeaking();
                }
                setIsMuted(!isMuted);
              }}
              className={`p-3 rounded-full border transition-colors ${
                isMuted
                  ? "bg-rose-950/80 border-rose-800 text-rose-300"
                  : "bg-stone-900 hover:bg-stone-800 border-stone-800 text-stone-300 hover:text-white"
              }`}
              title={isMuted ? "Unmute Voice" : "Mute Voice"}
            >
              {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </button>
          </div>
        </footer>
      </motion.div>
    </AnimatePresence>
  );
}
