"use client";

import { useState, useEffect } from "react";
import { CategorySelector } from "./category-selector";
import { DifficultySelector } from "./difficulty-selector";
import { QuestionCountSelector } from "./question-count-selector";
import { ScreenshotUpload, type AnalysisResult } from "./screenshot-upload";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Loader2, Download, AlertCircle, Camera, BookOpen, Lock, Mail, CheckCircle } from "lucide-react";
import type { Difficulty, QuestionCount, GenerateResponse, ProblemModifiers } from "@/lib/types";
import { DEFAULT_MODIFIERS } from "@/lib/types";
import { getSubcategoryName } from "@/lib/categories";
import { ProblemModifiersSelector } from "./problem-modifiers";

type TabMode = "screenshot" | "manual";

interface UsageData {
  tier: string;
  used: number;
  limit: number;
  remaining: number;
  period: string;
  authenticated: boolean;
  email: string | null;
}

export function WorksheetForm() {
  const [tab, setTab] = useState<TabMode>("screenshot");
  const [category, setCategory] = useState("");
  const [subcategory, setSubcategory] = useState("");
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const [questionCount, setQuestionCount] = useState<QuestionCount>(10);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GenerateResponse | null>(null);
  const [modifiers, setModifiers] = useState<ProblemModifiers>({ ...DEFAULT_MODIFIERS });
  const [screenshotDetected, setScreenshotDetected] = useState(false);
  const [usageRefreshKey, setUsageRefreshKey] = useState(0);
  const [limitReached, setLimitReached] = useState(false);

  // Email unlock state
  const [unlockEmail, setUnlockEmail] = useState("");
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [unlockError, setUnlockError] = useState<string | null>(null);
  const [unlockSuccess, setUnlockSuccess] = useState(false);

  // Multi-screenshot state
  const [multiTopics, setMultiTopics] = useState<{ category: string; subcategory: string }[]>([]);
  const [multiEnabled, setMultiEnabled] = useState(false);
  const [maxScreenshots, setMaxScreenshots] = useState(1);
  const [userTier, setUserTier] = useState<string>("free");

  // Fetch user tier to determine multi-screenshot eligibility & track limits
  useEffect(() => {
    fetch("/api/usage")
      .then((r) => r.json())
      .then((data: UsageData) => {
        const tier = data.tier || "free";
        setUserTier(tier);
        const paidTiers = ["starter", "pro", "enterprise", "unlimited"];
        setMultiEnabled(data.authenticated && paidTiers.includes(tier));
        const screenshotLimits: Record<string, number> = {
          free: 1,
          starter: 3,
          pro: 10,
          enterprise: 10,
          unlimited: 10,
        };
        setMaxScreenshots(data.authenticated ? (screenshotLimits[tier] ?? 1) : 1);
        if (data.remaining <= 0) {
          setLimitReached(true);
        }
      })
      .catch(() => {});
  }, [usageRefreshKey]);

  const isFormValid = category && subcategory;

  const handleCategoryChange = (value: string) => {
    setCategory(value);
    setSubcategory("");
  };

  const handleAnalysisComplete = (analysis: AnalysisResult) => {
    setCategory(analysis.category);
    setSubcategory(analysis.subcategory);
    setDifficulty(analysis.difficulty);
    setScreenshotDetected(true);
    setError(null);
    setResult(null);
  };

  const handleMultiAnalysisComplete = (results: AnalysisResult[]) => {
    if (results.length === 0) {
      setMultiTopics([]);
      setScreenshotDetected(false);
      return;
    }
    // Collect unique topic pairs
    const topics = results.map((r) => ({
      category: r.category,
      subcategory: r.subcategory,
    }));
    setMultiTopics(topics);
    setScreenshotDetected(true);
    setError(null);
    setResult(null);

    // Use the first result's difficulty as default
    if (results.length > 0) {
      setDifficulty(results[0].difficulty);
    }
  };

  const handleUnlockAnswerKey = async () => {
    if (!unlockEmail.trim() || !result?.worksheetId) return;

    setIsUnlocking(true);
    setUnlockError(null);

    try {
      const response = await fetch("/api/unlock-answer-key", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: unlockEmail.trim(),
          worksheetId: result.worksheetId,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        if (data.error === "already_used") {
          setUnlockError("already_used");
        } else if (data.error === "expired") {
          setUnlockError("expired");
        } else {
          setUnlockError(data.message || data.error || "Something went wrong. Please try again.");
        }
        return;
      }

      // If email was sent, just show success message
      if (data.delivered === "email") {
        setUnlockSuccess(true);
        return;
      }

      // Graceful degradation: if email failed, backend returned PDF directly
      if (data.delivered === "direct" && data.answerKeyPdf) {
        setResult((prev) =>
          prev ? { ...prev, answerKeyPdf: data.answerKeyPdf } : prev
        );
        setUnlockSuccess(true);
        return;
      }

      setUnlockSuccess(true);
    } catch {
      setUnlockError("Network error. Please check your connection and try again.");
    } finally {
      setIsUnlocking(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;

    setIsGenerating(true);
    setError(null);
    setResult(null);
    setUnlockEmail("");
    setUnlockError(null);
    setUnlockSuccess(false);

    try {
      // Build request body
      const body: Record<string, unknown> = {
        category,
        subcategory,
        difficulty,
        questionCount,
        modifiers,
      };

      // If multi-screenshot detected, include topics array
      if (multiTopics.length > 1) {
        body.topics = multiTopics;
      }

      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      // Handle non-JSON responses (e.g. Vercel timeout/crash returns plain text)
      const contentType = response.headers.get("content-type") || "";
      if (!contentType.includes("application/json")) {
        const text = await response.text();
        throw new Error(
          response.status === 504 || text.toLowerCase().includes("timeout")
            ? "Generation timed out — try fewer questions or an easier difficulty."
            : "Server error — please try again."
        );
      }

      const data: GenerateResponse = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Generation failed");
      }

      setResult(data);
      // Refresh usage counter after successful generation
      setUsageRefreshKey((k) => k + 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadPdf = (base64: string, filename: string) => {
    const link = document.createElement("a");
    link.href = `data:application/pdf;base64,${base64}`;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadWorksheet = () => {
    if (result?.worksheetPdf) {
      const topicName =
        multiTopics.length > 1
          ? "Mixed_Topics"
          : getSubcategoryName(category, subcategory).replace(/\s+/g, "_");
      downloadPdf(result.worksheetPdf, `SAT_${topicName}_${difficulty}_worksheet.pdf`);
    }
  };

  const handleDownloadAnswerKey = () => {
    if (result?.answerKeyPdf) {
      const topicName =
        multiTopics.length > 1
          ? "Mixed_Topics"
          : getSubcategoryName(category, subcategory).replace(/\s+/g, "_");
      downloadPdf(result.answerKeyPdf, `SAT_${topicName}_${difficulty}_answers.pdf`);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto border-[#1a365d]/20 shadow-lg">
      <CardContent className="pt-6">
        {/* Tab Switcher */}
        <div className="flex rounded-lg bg-muted p-1 mb-6">
          <button
            type="button"
            onClick={() => setTab("screenshot")}
            className={`
              flex-1 flex items-center justify-center gap-2 rounded-md px-4 py-2.5 text-sm font-medium transition-all
              ${tab === "screenshot"
                ? "bg-white text-[#1a365d] shadow-sm dark:bg-card"
                : "text-muted-foreground hover:text-foreground"
              }
            `}
          >
            <Camera className="h-4 w-4" />
            Upload Screenshot
          </button>
          <button
            type="button"
            onClick={() => setTab("manual")}
            className={`
              flex-1 flex items-center justify-center gap-2 rounded-md px-4 py-2.5 text-sm font-medium transition-all
              ${tab === "manual"
                ? "bg-white text-[#1a365d] shadow-sm dark:bg-card"
                : "text-muted-foreground hover:text-foreground"
              }
            `}
          >
            <BookOpen className="h-4 w-4" />
            Choose Topic
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Screenshot Tab */}
          {tab === "screenshot" && (
            <div className="space-y-6">
              <ScreenshotUpload
                onAnalysisComplete={handleAnalysisComplete}
                onMultiAnalysisComplete={handleMultiAnalysisComplete}
                multiEnabled={multiEnabled}
                maxScreenshots={maxScreenshots}
              />

              {screenshotDetected && category && subcategory && (
                <div className="space-y-4 p-4 rounded-lg bg-[#1a365d]/5 border border-[#1a365d]/10">
                  {multiTopics.length > 1 ? (
                    <>
                      <p className="text-sm font-medium text-[#1a365d]">
                        🎯 {multiTopics.length} topics detected — generating a mixed-topic worksheet:
                      </p>
                      <ul className="space-y-1 text-sm text-muted-foreground ml-4">
                        {multiTopics.map((t, i) => (
                          <li key={i} className="flex items-center gap-2">
                            <span className="text-[#1a365d] font-medium">•</span>
                            {getSubcategoryName(t.category, t.subcategory)}
                          </li>
                        ))}
                      </ul>
                      <DifficultySelector value={difficulty} onChange={setDifficulty} />
                    </>
                  ) : (
                    <>
                      <p className="text-sm font-medium text-[#1a365d]">
                        Detected topic — adjust if needed:
                      </p>
                      <CategorySelector
                        category={category}
                        subcategory={subcategory}
                        onCategoryChange={handleCategoryChange}
                        onSubcategoryChange={setSubcategory}
                      />
                      <DifficultySelector value={difficulty} onChange={setDifficulty} />
                    </>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Manual Tab */}
          {tab === "manual" && (
            <div className="space-y-6">
              <CategorySelector
                category={category}
                subcategory={subcategory}
                onCategoryChange={handleCategoryChange}
                onSubcategoryChange={setSubcategory}
              />
              <DifficultySelector value={difficulty} onChange={setDifficulty} />
            </div>
          )}

          {/* Shared: Question Count */}
          {(tab === "manual" || screenshotDetected) && (
            <QuestionCountSelector value={questionCount} onChange={setQuestionCount} />
          )}

          {/* Problem Modifiers */}
          {(tab === "manual" || screenshotDetected) && (
            <ProblemModifiersSelector
              value={modifiers}
              onChange={setModifiers}
              disabled={userTier === "free"}
            />
          )}

          {/* Error Display */}
          {error && (
            <div className="flex items-start gap-2 p-4 rounded-lg bg-[#e53e3e]/10 text-[#e53e3e]">
              <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
              <div className="text-sm">{error}</div>
            </div>
          )}

          {/* Success / Download */}
          {result && (
            <div className="space-y-3 p-4 rounded-lg bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900">
              <p className="text-sm font-medium text-green-800 dark:text-green-200">
                ✅ Worksheet generated successfully!
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleDownloadWorksheet}
                  className="gap-2"
                >
                  <Download className="h-4 w-4" />
                  Download Worksheet
                </Button>
                {result?.answerKeyPdf ? (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleDownloadAnswerKey}
                    className="gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Download Answer Key
                  </Button>
                ) : null}
              </div>

              {/* Email unlock for free users */}
              {unlockSuccess && !result.answerKeyPdf && (
                <div className="space-y-2 p-3 rounded-md bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 shrink-0 mt-0.5" />
                    <p className="text-sm font-medium">
                      Answer key sent to {unlockEmail}! Check your inbox.
                    </p>
                  </div>
                  <p className="text-xs text-green-700 dark:text-green-300 ml-6">
                    Didn&apos;t receive it? Check your spam folder.
                  </p>
                </div>
              )}

              {!result.answerKeyPdf && result.worksheetId && !unlockSuccess && (
                <div className="space-y-3 p-4 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900">
                  {unlockError === "already_used" ? (
                    <div className="text-sm text-blue-800 dark:text-blue-200">
                      <p className="font-medium">You&apos;ve already used your free answer key this month.</p>
                      <a
                        href="/pricing"
                        className="inline-flex items-center gap-1 mt-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 font-medium underline"
                      >
                        Upgrade for unlimited answer keys →
                      </a>
                    </div>
                  ) : unlockError === "expired" ? (
                    <div className="text-sm text-amber-700 dark:text-amber-300">
                      <p className="font-medium">This worksheet has expired.</p>
                      <p>Generate a new worksheet to unlock the answer key.</p>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        <h4 className="text-sm font-semibold text-blue-800 dark:text-blue-200">
                          Unlock Answer Key
                        </h4>
                      </div>
                      <p className="text-sm text-blue-700 dark:text-blue-300">
                        Enter your email and we&apos;ll send the answer key (1 free/month)
                      </p>
                      <div className="flex gap-2">
                        <input
                          type="email"
                          placeholder="you@example.com"
                          value={unlockEmail}
                          onChange={(e) => {
                            setUnlockEmail(e.target.value);
                            setUnlockError(null);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              handleUnlockAnswerKey();
                            }
                          }}
                          disabled={isUnlocking}
                          className="flex-1 rounded-md border border-blue-200 dark:border-blue-700 bg-white dark:bg-blue-950 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                        />
                        <Button
                          type="button"
                          size="sm"
                          onClick={handleUnlockAnswerKey}
                          disabled={isUnlocking || !unlockEmail.trim()}
                          className="bg-blue-600 hover:bg-blue-700 text-white gap-1.5"
                        >
                          {isUnlocking ? (
                            <>
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              Sending...
                            </>
                          ) : (
                            <>
                              <Mail className="h-3.5 w-3.5" />
                              Send to Email
                            </>
                          )}
                        </Button>
                      </div>
                      {unlockError && unlockError !== "already_used" && unlockError !== "expired" && (
                        <p className="text-sm text-red-600 dark:text-red-400">{unlockError}</p>
                      )}
                      <a
                        href="/pricing"
                        className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400"
                      >
                        Or upgrade for unlimited answer keys →
                      </a>
                    </>
                  )}
                </div>
              )}

              {!result.answerKeyPdf && !result.worksheetId && !unlockSuccess && (
                <a
                  href="/pricing"
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md border border-amber-200 bg-amber-50 text-amber-700 text-sm font-medium hover:bg-amber-100 transition-colors"
                >
                  <Lock className="h-3.5 w-3.5" />
                  Answer keys on paid plans
                </a>
              )}
            </div>
          )}

          {/* Generate Button */}
          <Button
            type="submit"
            disabled={!isFormValid || isGenerating || limitReached}
            className="w-full bg-[#1a365d] hover:bg-[#1a365d]/90 text-white"
            size="lg"
          >
            {limitReached ? (
              "Upgrade to Generate More"
            ) : isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating your worksheet...
              </>
            ) : multiTopics.length > 1 ? (
              "Generate Mixed-Topic Worksheet"
            ) : (
              "Generate Worksheet"
            )}
          </Button>

          <p className="text-xs text-center text-muted-foreground">
            Powered by AI with verified answers •{" "}
            <a href="/pricing" className="underline hover:text-[#1a365d]">View plans</a>
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
