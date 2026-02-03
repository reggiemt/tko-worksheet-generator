"use client";

import { useState, useRef, useCallback } from "react";
import { Button } from "./ui/button";
import { Upload, Camera, X, Loader2, CheckCircle2 } from "lucide-react";
import type { AnalyzeResponse, Difficulty } from "@/lib/types";

interface ScreenshotUploadProps {
  onAnalysisComplete: (result: {
    category: string;
    subcategory: string;
    difficulty: Difficulty;
    description: string;
  }) => void;
}

export function ScreenshotUpload({ onAnalysisComplete }: ScreenshotUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

  const processFile = useCallback(async (file: File) => {
    // Validate file type
    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/heic"];
    if (!validTypes.includes(file.type) && !file.name.toLowerCase().endsWith(".heic")) {
      setError("Please upload a JPG, PNG, or WebP image.");
      return;
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      setError("Image is too large. Maximum size is 10MB.");
      return;
    }

    setError(null);
    setAnalysisResult(null);

    // Read file as base64
    const reader = new FileReader();
    reader.onload = async (e) => {
      const dataUrl = e.target?.result as string;
      setPreview(dataUrl);

      // Send to analyze endpoint
      setIsAnalyzing(true);
      try {
        const response = await fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ image: dataUrl }),
        });

        const data: AnalyzeResponse = await response.json();

        if (!data.success) {
          throw new Error(data.error || "Analysis failed");
        }

        setAnalysisResult(data.description || "Topic detected successfully");
        onAnalysisComplete({
          category: data.category!,
          subcategory: data.subcategory!,
          difficulty: data.difficulty!,
          description: data.description!,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to analyze screenshot");
      } finally {
        setIsAnalyzing(false);
      }
    };
    reader.readAsDataURL(file);
  }, [onAnalysisComplete]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  }, [processFile]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  }, [processFile]);

  const clearPreview = () => {
    setPreview(null);
    setError(null);
    setAnalysisResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-4">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,.heic"
        onChange={handleFileSelect}
        className="hidden"
      />

      {!preview ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`
            relative cursor-pointer rounded-xl border-2 border-dashed p-8
            transition-all duration-200 text-center
            ${isDragOver
              ? "border-[#e53e3e] bg-[#e53e3e]/5 scale-[1.02]"
              : "border-[#1a365d]/30 hover:border-[#1a365d]/60 hover:bg-[#1a365d]/5"
            }
          `}
        >
          <div className="flex flex-col items-center gap-3">
            <div className="rounded-full bg-[#1a365d]/10 p-4">
              <Camera className="h-8 w-8 text-[#1a365d]" />
            </div>
            <div>
              <p className="text-lg font-semibold text-[#1a365d]">
                Drop your screenshot here
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                or click to upload • JPG, PNG, WebP up to 10MB
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-2 gap-2 border-[#1a365d]/30 text-[#1a365d] hover:bg-[#1a365d]/10"
              onClick={(e) => {
                e.stopPropagation();
                fileInputRef.current?.click();
              }}
            >
              <Upload className="h-4 w-4" />
              Choose File
            </Button>
          </div>
        </div>
      ) : (
        <div className="relative rounded-xl border overflow-hidden">
          <div className="relative bg-muted/30 p-4">
            <div className="flex items-start gap-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={preview}
                alt="Uploaded screenshot"
                className="h-32 w-auto rounded-lg object-contain border shadow-sm"
              />
              <div className="flex-1 min-w-0">
                {isAnalyzing && (
                  <div className="flex items-center gap-2 text-[#1a365d]">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span className="font-medium">Analyzing your problem...</span>
                  </div>
                )}
                {analysisResult && !isAnalyzing && (
                  <div className="flex items-start gap-2 text-green-700">
                    <CheckCircle2 className="h-5 w-5 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium">Topic detected!</p>
                      <p className="text-sm text-muted-foreground mt-1">{analysisResult}</p>
                    </div>
                  </div>
                )}
                {error && !isAnalyzing && (
                  <p className="text-sm text-[#e53e3e]">{error}</p>
                )}
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={clearPreview}
                className="shrink-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      <p className="text-xs text-center text-muted-foreground">
        📸 Snap a photo of any SAT math problem — we&apos;ll detect the topic and generate similar practice questions
      </p>
    </div>
  );
}
