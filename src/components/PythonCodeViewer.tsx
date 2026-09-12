import React, { useState, useEffect } from "react";
import { Copy, Check, Download, Terminal, CheckCircle2, FileCode, ExternalLink } from "lucide-react";

interface PythonCodeViewerProps {
  onClose?: () => void;
}

export const PythonCodeViewer: React.FC<PythonCodeViewerProps> = () => {
  const [code, setCode] = useState<string>("");
  const [copied, setCopied] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    fetch("/api/python-script")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.code) {
          setCode(data.code);
        } else {
          setCode(getFallbackScript());
        }
      })
      .catch(() => {
        setCode(getFallbackScript());
      })
      .finally(() => setIsLoading(false));
  }, []);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // fallback
    }
  };

  const handleDownload = () => {
    const blob = new Blob([code], { type: "text/x-python;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "app.py";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div id="python-script-container" className="space-y-4">
      {/* Overview Card */}
      <div className="rounded-xl border border-stone-200 bg-white p-4 sm:p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-md bg-amber-100 text-amber-800 text-xs font-bold">
                <FileCode className="w-4 h-4" />
              </span>
              <h3 className="text-base font-semibold text-stone-900">
                Official Gradio + Hugging Face InferenceClient Script (`app.py`)
              </h3>
            </div>
            <p className="mt-1 text-xs text-stone-600">
              Deploy CSU Mitra on Hugging Face Spaces, Google Colab, or any local GPU/CPU machine with Trilingual & Multimodal Vision support.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              id="copy-python-code-btn"
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-stone-900 text-white hover:bg-stone-800 transition-colors shadow-xs"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Copied to Clipboard!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Python Script</span>
                </>
              )}
            </button>

            <button
              id="download-python-code-btn"
              type="button"
              onClick={handleDownload}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-700 text-white hover:bg-amber-800 transition-colors shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download app.py</span>
            </button>
          </div>
        </div>

        {/* Requirements and Quick Run Instructions */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="rounded-lg bg-stone-50 p-3 border border-stone-200/70">
            <div className="flex items-center gap-1.5 font-semibold text-stone-800 mb-1">
              <Terminal className="w-3.5 h-3.5 text-amber-700" />
              <span>1. Install Dependencies</span>
            </div>
            <code className="block bg-stone-900 text-amber-300 p-2 rounded text-[11px] font-mono select-all">
              pip install gradio huggingface_hub pillow
            </code>
          </div>

          <div className="rounded-lg bg-stone-50 p-3 border border-stone-200/70">
            <div className="flex items-center gap-1.5 font-semibold text-stone-800 mb-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>2. Set HF Token (Optional)</span>
            </div>
            <code className="block bg-stone-900 text-stone-200 p-2 rounded text-[11px] font-mono select-all">
              export HF_TOKEN="hf_your_token"
            </code>
          </div>

          <div className="rounded-lg bg-stone-50 p-3 border border-stone-200/70">
            <div className="flex items-center gap-1.5 font-semibold text-stone-800 mb-1">
              <Terminal className="w-3.5 h-3.5 text-amber-700" />
              <span>3. Launch CSU Mitra</span>
            </div>
            <code className="block bg-stone-900 text-emerald-400 p-2 rounded text-[11px] font-mono select-all">
              python app.py
            </code>
          </div>
        </div>
      </div>

      {/* Code Display Window */}
      <div className="relative rounded-xl border border-stone-800 bg-stone-950 overflow-hidden shadow-md">
        {/* Terminal Header Bar */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-stone-900 border-b border-stone-800 text-xs text-stone-400">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-red-500/80" />
            <span className="h-3 w-3 rounded-full bg-yellow-500/80" />
            <span className="h-3 w-3 rounded-full bg-green-500/80" />
            <span className="ml-2 font-mono text-stone-300 font-medium">app.py — Gradio + HF InferenceClient</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[11px] text-stone-500">Python 3.9+</span>
            <button
              type="button"
              onClick={handleCopy}
              className="text-stone-300 hover:text-white transition-colors"
              title="Copy code"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Code Body */}
        {isLoading ? (
          <div className="p-8 text-center text-stone-400 text-xs font-mono">
            Loading Python script...
          </div>
        ) : (
          <pre className="p-4 overflow-x-auto text-xs font-mono text-stone-200 leading-relaxed max-h-[600px] scrollbar-thin scrollbar-thumb-stone-800">
            <code>{code}</code>
          </pre>
        )}
      </div>
    </div>
  );
};

function getFallbackScript(): string {
  return `#!/usr/bin/env python3
# pip install gradio huggingface_hub pillow
import os, random, base64
from io import BytesIO
from typing import List, Optional, Generator
from PIL import Image
import gradio as gr
from huggingface_hub import InferenceClient

DEFAULT_VISION_MODEL = "Qwen/Qwen2.5-VL-7B-Instruct"

# (Refer to app.py in root directory for full code)
print("CSU Mitra Gradio ready.")`;
}
