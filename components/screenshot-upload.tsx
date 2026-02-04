"use client";

import { useState, useRef, useCallback } from "react";
import { Button } from "./ui/button";
import { Upload, Camera, X, Loader2, CheckCircle2, Plus, Lock } from "lucide-react";
import type { AnalyzeResponse, Difficulty } from "@/lib/types";

export interface AnalysisResult {
  category: string;
  subcategory: string;
  difficulty: Difficulty;
  description: string;
}

interface ScreenshotEntry {
  id: string;
  preview: string;
  isAnalyzing: boolean;
  error: string | null;
  result: AnalysisResult | null;
}

interface ScreenshotUploadProps {
  onAnalysisComplete: (result: AnalysisResult) => void;
  onMultiAnalysisComplete?: (results: AnalysisResult[]) => void;
  multiEnabled?: boolean;
  maxScreenshots?: number;
}

export function ScreenshotUpload({
  onAnalysisComplete,
  onMultiAnalysisComplete,
  multiEnabled = false,
  maxScreenshots,
}: ScreenshotUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [entries, setEntries] = useState<ScreenshotEntry[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  const MAX_SCREENSHOTS = maxScreenshots || (multiEnabled ? 3 : 1);

  const analyzeImage = useCallback(
    async (dataUrl: string, entryId: string) => {
      setEntries((prev) =>
        prev.map((e) =>
          e.id === entryId ? { ...e, isAnalyzing: true, error: null } : e
        )
      );

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

        const result: AnalysisResult = {
          category: data.category!,
          subcategory: data.subcategory!,
          difficulty: data.difficulty!,
          description: data.description!,
        };

        setEntries((prev) => {
          const updated = prev.map((e) =>
            e.id === entryId
              ? { ...e, isAnalyzing: false, result, error: null }
              : e
          );

          // If single mode, call the original callback
          if (!multiEnabled) {
            onAnalysisComplete(result);
          } else {
            // In multi mode, collect all completed results and call multi callback
            const allResults = updated
              .filter((e) => e.result !== null)
              .map((e) => e.result!);
            onMultiAnalysisComplete?.(allResults);
            // Also call single with the first result for category/subcategory defaults
            if (allResults.length > 0) {
              onAnalysisComplete(allResults[0]);
            }
          }

          return updated;
        });
      } catch (err) {
        setEntries((prev) =>
          prev.map((e) =>
            e.id === entryId
              ? {
                  ...e,
                  isAnalyzing: false,
                  error:
                    err instanceof Error
                      ? err.message
                      : "Failed to analyze screenshot",
                }
              : e
          )
        );
      }
    },
    [multiEnabled, onAnalysisComplete, onMultiAnalysisComplete]
  );

  const processFile = useCallback(
    async (file: File) => {
      // Validate file type
      const validTypes = [
        "image/jpeg",
        "image/png",
        "image/webp",
        "image/heic",
      ];
      if (
        !validTypes.includes(file.type) &&
        !file.name.toLowerCase().endsWith(".heic")
      ) {
        return;
      }

      // Validate file size
      if (file.size > MAX_FILE_SIZE) {
        return;
      }

      // Check max count
      if (entries.length >= MAX_SCREENSHOTS) {
        return;
      }

      const reader = new FileReader();
      reader.onload = async (e) => {
        const dataUrl = e.target?.result as string;
        const entryId = `${Date.now()}-${Math.random().toString(36).slice(2)}`;

        const newEntry: ScreenshotEntry = {
          id: entryId,
          preview: dataUrl,
          isAnalyzing: false,
          error: null,
          result: null,
        };

        setEntries((prev) => {
          // If single mode, replace; if multi, append
          if (!multiEnabled) {
            return [newEntry];
          }
          if (prev.length >= MAX_SCREENSHOTS) return prev;
          return [...prev, newEntry];
        });

        // Start analysis
        analyzeImage(dataUrl, entryId);
      };
      reader.readAsDataURL(file);
    },
    [entries.length, MAX_SCREENSHOTS, multiEnabled, analyzeImage]
  );

  const processFiles = useCallback(
    (files: FileList) => {
      const remaining = MAX_SCREENSHOTS - entries.length;
      const toProcess = Array.from(files).slice(0, remaining);
      toProcess.forEach((file) => processFile(file));
    },
    [MAX_SCREENSHOTS, entries.length, processFile]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      if (e.dataTransfer.files.length > 0) {
        processFiles(e.dataTransfer.files);
      }
    },
    [processFiles]
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        processFiles(e.target.files);
      }
      // Reset so re-selecting same file works
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    },
    [processFiles]
  );

  const removeEntry = useCallback(
    (entryId: string) => {
      setEntries((prev) => {
        const updated = prev.filter((e) => e.id !== entryId);
        // Re-notify parent of remaining results
        if (multiEnabled && onMultiAnalysisComplete) {
          const allResults = updated
            .filter((e) => e.result !== null)
            .map((e) => e.result!);
          onMultiAnalysisComplete(allResults);
          if (allResults.length > 0) {
            onAnalysisComplete(allResults[0]);
          }
        }
        return updated;
      });
    },
    [multiEnabled, onAnalysisComplete, onMultiAnalysisComplete]
  );

  const clearAll = () => {
    setEntries([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const hasEntries = entries.length > 0;
  const canAddMore = multiEnabled && entries.length < MAX_SCREENSHOTS;

  return (
    <div className="space-y-4">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,.heic"
        multiple={multiEnabled}
        onChange={handleFileSelect}
        className="hidden"
      />

      {!hasEntries ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`
            relative cursor-pointer rounded-xl border-2 border-dashed p-8
            transition-all duration-200 text-center
            ${
              isDragOver
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
                Drop your screenshot{multiEnabled ? "(s)" : ""} here
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                or click to upload • JPG, PNG, WebP up to 10MB
                {multiEnabled && " • Up to 3 screenshots"}
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
              Choose File{multiEnabled ? "s" : ""}
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {entries.map((entry) => (
            <div
              key={entry.id}
              className="relative rounded-xl border overflow-hidden"
            >
              <div className="relative bg-muted/30 p-4">
                <div className="flex items-start gap-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={entry.preview}
                    alt="Uploaded screenshot"
                    className="h-24 w-auto rounded-lg object-contain border shadow-sm"
                  />
                  <div className="flex-1 min-w-0">
                    {entry.isAnalyzing && (
                      <div className="flex items-center gap-2 text-[#1a365d]">
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <span className="font-medium">
                          Analyzing your problem...
                        </span>
                      </div>
                    )}
                    {entry.result && !entry.isAnalyzing && (
                      <div className="flex items-start gap-2 text-green-700">
                        <CheckCircle2 className="h-5 w-5 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-medium">Topic detected!</p>
                          <p className="text-sm text-muted-foreground mt-1">
                            {entry.result.description}
                          </p>
                        </div>
                      </div>
                    )}
                    {entry.error && !entry.isAnalyzing && (
                      <p className="text-sm text-[#e53e3e]">{entry.error}</p>
                    )}
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => removeEntry(entry.id)}
                    className="shrink-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}

          {/* Add more button (multi mode only) */}
          {canAddMore && (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[#1a365d]/20 p-4 text-sm text-[#1a365d]/60 hover:border-[#1a365d]/40 hover:text-[#1a365d] hover:bg-[#1a365d]/5 transition-all"
            >
              <Plus className="h-4 w-4" />
              Add another screenshot ({entries.length}/{MAX_SCREENSHOTS})
            </button>
          )}

          {/* Multi-screenshot badge for non-multi users */}
          {!multiEnabled && entries.length > 0 && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 rounded-lg px-3 py-2">
              <Lock className="h-3 w-3" />
              <span>
                Upload multiple screenshots with a{" "}
                <a href="/pricing" className="text-[#1a365d] underline">
                  paid plan
                </a>
              </span>
            </div>
          )}

          {/* Clear all */}
          {entries.length > 1 && (
            <button
              type="button"
              onClick={clearAll}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Clear all screenshots
            </button>
          )}
        </div>
      )}

      <p className="text-xs text-center text-muted-foreground">
        📸 Snap a photo of any SAT math problem — we&apos;ll detect the topic
        and generate similar practice questions
        {multiEnabled && (
          <>
            <br />
            💡 Upload up to 3 screenshots to generate a mixed-topic worksheet
          </>
        )}
      </p>
    </div>
  );
}
