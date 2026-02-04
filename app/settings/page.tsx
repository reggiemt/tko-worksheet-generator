"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  Upload,
  Trash2,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Crown,
  Lock,
  Building2,
  ImageIcon,
} from "lucide-react";

interface BrandingState {
  hasLogo: boolean;
  logoBase64: string | null;
  orgName: string | null;
  mimeType: string | null;
}

interface TierInfo {
  tier: string;
  used: number;
  limit: number;
  remaining: number;
  authenticated: boolean;
  email: string | null;
}

const TIER_LABELS: Record<string, string> = {
  free: "Free",
  starter: "Starter",
  pro: "Pro",
  enterprise: "Enterprise",
  unlimited: "Unlimited",
};

const TIER_COLORS: Record<string, string> = {
  free: "bg-slate-100 text-slate-700",
  starter: "bg-blue-100 text-blue-700",
  pro: "bg-purple-100 text-purple-700",
  enterprise: "bg-amber-100 text-amber-700",
  unlimited: "bg-emerald-100 text-emerald-700",
};

export default function SettingsPage() {
  const [tierInfo, setTierInfo] = useState<TierInfo | null>(null);
  const [branding, setBranding] = useState<BrandingState | null>(null);
  const [orgName, setOrgName] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isSavingName, setIsSavingName] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const canUpload = tierInfo?.tier === "enterprise" || tierInfo?.tier === "unlimited";

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usageRes, logoRes] = await Promise.all([
          fetch("/api/usage"),
          fetch("/api/settings/logo"),
        ]);

        if (usageRes.ok) {
          const usageData = await usageRes.json();
          if (!usageData.authenticated) {
            window.location.href = "/signin";
            return;
          }
          setTierInfo(usageData);
        } else {
          window.location.href = "/signin";
          return;
        }

        if (logoRes.ok) {
          const logoData = await logoRes.json();
          setBranding(logoData);
          setOrgName(logoData.orgName || "");
        }
      } catch {
        // If we can't fetch, redirect to signin
        window.location.href = "/signin";
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const showFeedback = useCallback((type: "success" | "error", message: string) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 5000);
  }, []);

  const handleFileUpload = useCallback(
    async (file: File) => {
      if (!canUpload) return;

      // Validate file type
      if (!["image/png", "image/jpeg", "image/jpg"].includes(file.type)) {
        showFeedback("error", "Only PNG and JPEG images are allowed.");
        return;
      }

      // Validate file size (500KB)
      if (file.size > 500 * 1024) {
        showFeedback("error", `Logo must be under 500KB. Your file is ${Math.round(file.size / 1024)}KB.`);
        return;
      }

      setIsUploading(true);
      setFeedback(null);

      try {
        // Convert to base64
        const base64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            const result = reader.result as string;
            // Strip the data:image/...;base64, prefix
            const base64Data = result.split(",")[1];
            resolve(base64Data);
          };
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });

        const response = await fetch("/api/settings/logo", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            logoBase64: base64,
            mimeType: file.type,
            orgName: orgName || undefined,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          showFeedback("error", data.error || "Upload failed.");
          return;
        }

        // Refresh branding state
        setBranding({
          hasLogo: true,
          logoBase64: base64,
          orgName: orgName || null,
          mimeType: file.type,
        });
        showFeedback("success", "Logo uploaded successfully! It will appear on your next generated worksheet.");
      } catch {
        showFeedback("error", "Upload failed. Please try again.");
      } finally {
        setIsUploading(false);
      }
    },
    [canUpload, orgName, showFeedback]
  );

  const handleSaveOrgName = async () => {
    if (!canUpload) return;
    setIsSavingName(true);
    setFeedback(null);

    try {
      const response = await fetch("/api/settings/logo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orgName }),
      });

      const data = await response.json();

      if (!response.ok) {
        showFeedback("error", data.error || "Failed to save.");
        return;
      }

      setBranding((prev) => prev ? { ...prev, orgName } : null);
      showFeedback("success", "Organization name saved!");
    } catch {
      showFeedback("error", "Failed to save. Please try again.");
    } finally {
      setIsSavingName(false);
    }
  };

  const handleDeleteLogo = async () => {
    setIsDeleting(true);
    setFeedback(null);

    try {
      const response = await fetch("/api/settings/logo", {
        method: "DELETE",
      });

      if (!response.ok) {
        showFeedback("error", "Failed to remove branding.");
        return;
      }

      setBranding({ hasLogo: false, logoBase64: null, orgName: null, mimeType: null });
      setOrgName("");
      showFeedback("success", "Custom branding removed. Default TKO Prep branding will be used.");
    } catch {
      showFeedback("error", "Failed to remove branding. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (canUpload) setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (!canUpload) return;
    if (e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileUpload(e.target.files[0]);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#f0f4f8] to-white flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#1a365d]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f0f4f8] to-white">
      {/* Navigation */}
      <nav className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image
              src="/tko-logo.png"
              alt="TKO Prep"
              width={36}
              height={44}
              className="h-9 w-auto"
            />
            <div className="flex flex-col">
              <span className="text-lg font-bold text-[#1a365d] leading-tight">
                TKO Prep
              </span>
              <span className="text-[10px] text-slate-500 leading-tight -mt-0.5">
                Account Settings
              </span>
            </div>
          </div>
          <Link
            href="/"
            className="flex items-center gap-1.5 text-sm text-[#1a365d] hover:text-[#e53e3e] transition-colors font-medium"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Generator
          </Link>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <h1 className="text-2xl font-bold text-[#1a365d] mb-6">Account Settings</h1>

        {/* Feedback Banner */}
        {feedback && (
          <div
            className={`mb-6 rounded-lg p-4 flex items-center gap-3 ${
              feedback.type === "success"
                ? "bg-green-50 text-green-800 border border-green-200"
                : "bg-red-50 text-red-800 border border-red-200"
            }`}
          >
            {feedback.type === "success" ? (
              <CheckCircle2 className="h-5 w-5 shrink-0" />
            ) : (
              <AlertCircle className="h-5 w-5 shrink-0" />
            )}
            <p className="text-sm">{feedback.message}</p>
          </div>
        )}

        {/* Plan Info */}
        <section className="bg-white rounded-xl border border-slate-200 p-6 mb-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Crown className="h-5 w-5 text-amber-500" />
            <h2 className="text-lg font-semibold text-[#1a365d]">Your Plan</h2>
          </div>

          <div className="flex items-center gap-3 mb-3">
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                TIER_COLORS[tierInfo?.tier || "free"] || TIER_COLORS.free
              }`}
            >
              {TIER_LABELS[tierInfo?.tier || "free"] || "Free"}
            </span>
            {tierInfo?.email && (
              <span className="text-sm text-slate-500">{tierInfo.email}</span>
            )}
          </div>

          <div className="text-sm text-slate-600">
            <p>
              <strong>{tierInfo?.used || 0}</strong> of{" "}
              <strong>{tierInfo?.limit || 5}</strong> worksheets used this month
              {" · "}
              <strong>{tierInfo?.remaining || 0}</strong> remaining
            </p>
          </div>

          {tierInfo?.tier !== "enterprise" && tierInfo?.tier !== "unlimited" && (
            <Link
              href="/pricing"
              className="inline-flex items-center gap-2 mt-4 text-sm text-[#e53e3e] hover:text-[#c53030] font-medium transition-colors"
            >
              Upgrade your plan →
            </Link>
          )}
        </section>

        {/* Custom Branding */}
        <section className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <Building2 className="h-5 w-5 text-[#1a365d]" />
            <h2 className="text-lg font-semibold text-[#1a365d]">Custom Branding</h2>
          </div>
          <p className="text-sm text-slate-500 mb-6">
            Your logo and organization name appear on generated worksheet PDFs instead of the TKO Prep branding.
          </p>

          {!canUpload ? (
            // Locked state for non-Enterprise users
            <div className="rounded-xl border-2 border-dashed border-slate-200 p-8 text-center opacity-60">
              <Lock className="h-10 w-10 text-slate-400 mx-auto mb-3" />
              <p className="text-slate-600 font-medium mb-1">
                Available on Enterprise Plan
              </p>
              <p className="text-sm text-slate-400 mb-4">
                Upload your school or company logo to appear on all generated worksheets.
              </p>
              <Link
                href="/pricing"
                className="inline-flex items-center gap-2 text-sm bg-[#1a365d] text-white px-4 py-2 rounded-lg hover:bg-[#1a365d]/90 transition-colors font-medium"
              >
                <Crown className="h-4 w-4" />
                Upgrade to Enterprise — $99/mo
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Organization Name */}
              <div>
                <label
                  htmlFor="orgName"
                  className="block text-sm font-medium text-[#1a365d] mb-2"
                >
                  Organization Name
                </label>
                <div className="flex gap-2">
                  <input
                    id="orgName"
                    type="text"
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                    placeholder="e.g., Springfield Prep Academy"
                    maxLength={100}
                    className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a365d]/20 focus:border-[#1a365d]"
                  />
                  <button
                    onClick={handleSaveOrgName}
                    disabled={isSavingName}
                    className="px-4 py-2 rounded-lg bg-[#1a365d] text-white text-sm font-medium hover:bg-[#1a365d]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSavingName ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      "Save"
                    )}
                  </button>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Appears in the PDF header above the worksheet title.
                </p>
              </div>

              {/* Logo Upload */}
              <div>
                <label className="block text-sm font-medium text-[#1a365d] mb-2">
                  Logo
                </label>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg"
                  onChange={handleFileSelect}
                  className="hidden"
                />

                {branding?.hasLogo && branding.logoBase64 ? (
                  // Show current logo preview
                  <div className="rounded-xl border border-slate-200 p-4">
                    <div className="flex items-start gap-4">
                      <div className="bg-slate-50 rounded-lg p-3 border">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={`data:${branding.mimeType || "image/png"};base64,${branding.logoBase64}`}
                          alt="Custom logo"
                          className="h-16 w-auto max-w-[200px] object-contain"
                        />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-green-700 flex items-center gap-1.5">
                          <CheckCircle2 className="h-4 w-4" />
                          Custom logo active
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                          This logo will appear on all your generated worksheets.
                        </p>
                        <div className="flex gap-2 mt-3">
                          <button
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isUploading}
                            className="text-xs px-3 py-1.5 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-50 transition-colors font-medium"
                          >
                            Replace
                          </button>
                          <button
                            onClick={handleDeleteLogo}
                            disabled={isDeleting}
                            className="text-xs px-3 py-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition-colors font-medium flex items-center gap-1"
                          >
                            {isDeleting ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <Trash2 className="h-3 w-3" />
                            )}
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  // Upload area
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => !isUploading && fileInputRef.current?.click()}
                    className={`
                      relative cursor-pointer rounded-xl border-2 border-dashed p-8
                      transition-all duration-200 text-center
                      ${isUploading ? "pointer-events-none opacity-60" : ""}
                      ${
                        isDragOver
                          ? "border-[#e53e3e] bg-[#e53e3e]/5 scale-[1.02]"
                          : "border-[#1a365d]/30 hover:border-[#1a365d]/60 hover:bg-[#1a365d]/5"
                      }
                    `}
                  >
                    <div className="flex flex-col items-center gap-3">
                      {isUploading ? (
                        <>
                          <Loader2 className="h-8 w-8 animate-spin text-[#1a365d]" />
                          <p className="text-sm font-medium text-[#1a365d]">
                            Uploading logo...
                          </p>
                        </>
                      ) : (
                        <>
                          <div className="rounded-full bg-[#1a365d]/10 p-4">
                            <ImageIcon className="h-8 w-8 text-[#1a365d]" />
                          </div>
                          <div>
                            <p className="text-base font-semibold text-[#1a365d]">
                              Drop your logo here
                            </p>
                            <p className="text-sm text-slate-500 mt-1">
                              or click to upload · PNG, JPEG · max 500KB
                            </p>
                          </div>
                          <button
                            type="button"
                            className="mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-[#1a365d]/30 text-[#1a365d] text-sm font-medium hover:bg-[#1a365d]/10 transition-colors"
                            onClick={(e) => {
                              e.stopPropagation();
                              fileInputRef.current?.click();
                            }}
                          >
                            <Upload className="h-4 w-4" />
                            Choose File
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                )}

                <p className="text-xs text-slate-400 mt-2">
                  💡 For best results, use a transparent PNG with your logo on a white or light background.
                  Recommended size: 300×100px or similar landscape aspect ratio.
                </p>
              </div>

              {/* Preview */}
              {(branding?.hasLogo || orgName) && (
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-medium text-slate-500 mb-3 uppercase tracking-wider">
                    PDF Header Preview
                  </p>
                  <div className="bg-white rounded-lg p-4 border text-center">
                    {branding?.hasLogo && branding.logoBase64 && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={`data:${branding.mimeType || "image/png"};base64,${branding.logoBase64}`}
                        alt="Logo preview"
                        className="h-10 w-auto mx-auto mb-2 object-contain"
                      />
                    )}
                    {orgName && (
                      <p className="text-lg font-bold text-[#1a365d]">{orgName}</p>
                    )}
                    <p className="text-xl font-bold text-[#1a365d] mt-1">
                      SAT Math Practice
                    </p>
                    <p className="text-sm text-slate-500">
                      Topic Name — Medium
                    </p>
                    <p className="text-xs text-slate-400 mt-1">10 Questions</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
