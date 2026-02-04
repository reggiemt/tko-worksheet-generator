import { NextRequest, NextResponse } from "next/server";
import { generateRWProblems, verifyRWProblems, validateRWAnswerChoices, regenerateFailedRWProblems } from "@/lib/rw-claude-client";
import { compileLaTeX } from "@/lib/latex-client";
import type { LatexResource } from "@/lib/latex-client";
import { buildRWWorksheetLatex, buildRWAnswerKeyLatex } from "@/lib/rw-latex-templates";
import type { CustomBranding } from "@/lib/latex-templates";
import {
  checkFreeRateLimit,
  incrementFreeUsage,
  checkPaidRateLimit,
  incrementPaidUsage,
  getClientIp,
} from "@/lib/rate-limit";
import { getTierForEmail } from "@/lib/subscription";
import { auth } from "@/auth";
import { generateRWRequestSchema } from "@/lib/validators";
import { getRedisClient } from "@/lib/redis";
import type { GenerateResponse, GenerateStreamEvent } from "@/lib/types";

export const maxDuration = 300;

export async function POST(request: NextRequest) {
  try {
    // 1. Parse request body
    const body = await request.json();

    // 2. Validate request
    const parseResult = generateRWRequestSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid request: ${parseResult.error.issues.map((e) => e.message).join(", ")}`,
        },
        { status: 400 }
      );
    }

    const { category, subcategory, difficulty, questionCount, modifiers } = parseResult.data;

    // 3. Check rate limit based on auth status
    const ip = getClientIp(request);

    const session = await auth();
    const userEmail = session?.user?.email || null;
    const tier = userEmail ? await getTierForEmail(userEmail) : "free";
    const userId = userEmail && tier !== "free" ? userEmail : null;

    if (userId && tier !== "free") {
      const rateLimitResult = await checkPaidRateLimit(userId, tier);
      if (!rateLimitResult.success) {
        const daysRemaining = rateLimitResult.reset
          ? Math.ceil((rateLimitResult.reset - Date.now()) / 1000 / 60 / 60 / 24)
          : 0;
        return NextResponse.json(
          {
            success: false,
            error: `You've used all your worksheets for this month. Your pool resets in ${daysRemaining} day${daysRemaining !== 1 ? "s" : ""}. Upgrade your plan for more at /pricing.`,
          },
          { status: 429 }
        );
      }
    } else {
      const rateLimitResult = await checkFreeRateLimit(ip);
      if (!rateLimitResult.success) {
        return NextResponse.json(
          {
            success: false,
            error: "You've used all 3 free worksheets! Upgrade to Starter ($5/mo) for 30 worksheets/month, or Pro ($25/mo) for 100.",
          },
          { status: 429 }
        );
      }
    }

    // 4. Verify server API key is available
    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { success: false, error: "Service temporarily unavailable. Please try again later." },
        { status: 503 }
      );
    }

    // All validation passed — start streaming response
    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        const send = (event: GenerateStreamEvent) => {
          controller.enqueue(encoder.encode(JSON.stringify(event) + "\n"));
        };

        try {
          // 5. Generate R/W problems via Claude
          send({
            type: "progress",
            step: "generating",
            message: `Generating ${questionCount} ${difficulty} R/W problems...`,
            percent: 10,
          });

          console.log(
            `Generating ${questionCount} ${difficulty} R/W problems for ${category}.${subcategory}`
          );

          let worksheet: Awaited<ReturnType<typeof generateRWProblems>> | undefined;
          const maxRetries = 2;
          const genStartTime = Date.now();
          for (let attempt = 1; attempt <= maxRetries + 1; attempt++) {
            const attemptStart = Date.now();
            try {
              worksheet = await generateRWProblems({
                category,
                subcategory,
                difficulty,
                questionCount,
                modifiers,
              });
              const attemptMs = Date.now() - attemptStart;
              console.log(`[RW-ROUTE] Generation succeeded on attempt ${attempt}/${maxRetries + 1} in ${(attemptMs / 1000).toFixed(1)}s | total: ${((Date.now() - genStartTime) / 1000).toFixed(1)}s`);
              break; // Success — exit retry loop
            } catch (genError) {
              const attemptMs = Date.now() - attemptStart;
              if (genError instanceof Error && genError.message.includes("parse") && attempt <= maxRetries) {
                console.log(`[RW-ROUTE] Generation attempt ${attempt} failed in ${(attemptMs / 1000).toFixed(1)}s: ${genError.message}. Retrying...`);
                send({
                  type: "progress",
                  step: "retrying",
                  message: `AI response had formatting issues — retrying (attempt ${attempt + 1})...`,
                  percent: 15 + attempt * 5,
                });
              } else {
                console.error(`[RW-ROUTE] Generation failed permanently on attempt ${attempt} in ${(attemptMs / 1000).toFixed(1)}s: ${genError instanceof Error ? genError.message : genError}`);
                throw genError;
              }
            }
          }
          if (!worksheet) {
            throw new Error("Failed to generate worksheet after all retry attempts");
          }

          send({
            type: "progress",
            step: "validating",
            message: "Checking answer choices...",
            percent: 30,
          });

          // 5.5a Quick structural validation
          const choiceIssues = validateRWAnswerChoices(worksheet.problems, worksheet.answers);
          if (choiceIssues.length > 0) {
            console.log(`R/W answer-choice validation issues: ${choiceIssues.join("; ")}`);
          }

          // 5.5b Blind verification
          send({
            type: "progress",
            step: "verifying",
            message: "Verifying answers are correct...",
            percent: 40,
          });

          const verification = await verifyRWProblems(worksheet.problems, worksheet.answers);
          if (!verification.passed) {
            const failedNumbers = verification.problemResults
              .filter((r) => !r.passed)
              .map((r) => r.number);
            const failCount = failedNumbers.length;
            console.log(
              `R/W Verification failed for ${failCount} problem(s): ${verification.problemResults
                .filter((r) => !r.passed)
                .map((r) => `#${r.number} (expected ${r.expectedAnswer}, got ${r.verifiedAnswer})`)
                .join(", ")}. Regenerating failed problems only…`
            );

            send({
              type: "progress",
              step: "regenerating",
              message: `Fixing ${failCount} problem${failCount > 1 ? "s" : ""} with answer issues...`,
              percent: 55,
            });

            worksheet = await regenerateFailedRWProblems(
              worksheet,
              failedNumbers,
              { category, subcategory, difficulty, questionCount, modifiers }
            );

            send({
              type: "progress",
              step: "reverifying",
              message: "Re-verifying fixed problems...",
              percent: 65,
            });

            const recheck = await verifyRWProblems(worksheet.problems, worksheet.answers);
            if (!recheck.passed) {
              const stillFailed = recheck.problemResults.filter((r) => !r.passed).length;
              console.log(
                `R/W Verification still failed for ${stillFailed} problem(s) after targeted retry. Proceeding with best effort.`
              );
            }
          }

          // 6. Look up custom branding for Enterprise/Unlimited users
          let customBranding: CustomBranding | undefined;
          let additionalResources: LatexResource[] | undefined;

          if (userEmail && (tier === "enterprise" || tier === "unlimited")) {
            const redis = getRedisClient();
            if (redis) {
              const [logoData, brandingData] = await Promise.all([
                redis.get<string>(`worksheet:logo:${userEmail.toLowerCase().trim()}`),
                redis.get<{ orgName: string; mimeType: string }>(
                  `worksheet:branding:${userEmail.toLowerCase().trim()}`
                ),
              ]);

              if (logoData || brandingData?.orgName) {
                customBranding = {
                  orgName: brandingData?.orgName || undefined,
                  logoBase64: logoData || undefined,
                  logoMimeType: brandingData?.mimeType || undefined,
                };

                if (logoData) {
                  additionalResources = [{ path: "customlogo.png", file: logoData }];
                  console.log("R/W Custom branding: logo + org name included");
                } else {
                  console.log("R/W Custom branding: org name only");
                }
              }
            }
          }

          // 7. Build LaTeX documents
          send({
            type: "progress",
            step: "building",
            message: "Building worksheet PDF...",
            percent: 75,
          });

          console.log("Building R/W LaTeX documents...");
          const worksheetLatex = buildRWWorksheetLatex(worksheet, customBranding);
          const isFree = tier === "free";
          const answerKeyLatex = isFree ? null : buildRWAnswerKeyLatex(worksheet, customBranding);

          // 8. Compile to PDF
          send({
            type: "progress",
            step: "compiling",
            message: "Compiling PDF (this may take a moment)...",
            percent: 85,
          });

          console.log("Compiling R/W LaTeX to PDF...");
          const [worksheetPdf, answerKeyPdf] = await Promise.all([
            compileLaTeX(worksheetLatex, { additionalResources }),
            answerKeyLatex
              ? compileLaTeX(answerKeyLatex, { additionalResources })
              : Promise.resolve(null),
          ]);

          // 9. Increment usage
          if (userId && tier !== "free") {
            await incrementPaidUsage(userId);
          } else {
            await incrementFreeUsage(ip);
          }

          // 9.5 Track analytics
          try {
            const redis = getRedisClient();
            if (redis && userEmail) {
              const now = new Date();
              const month = now.toISOString().slice(0, 7);
              const day = now.toISOString().slice(0, 10);
              const topicKey = `rw.${category}.${subcategory}`;

              await Promise.all([
                redis.hincrby(`worksheet:stats:${userEmail}:topics:${month}`, topicKey, 1),
                redis.hincrby(`worksheet:stats:${userEmail}:difficulty:${month}`, difficulty, 1),
                redis.incr(`worksheet:stats:${userEmail}:daily:${day}`),
              ]);

              const TTL_90_DAYS = 7776000;
              await Promise.all([
                redis.expire(`worksheet:stats:${userEmail}:topics:${month}`, TTL_90_DAYS),
                redis.expire(`worksheet:stats:${userEmail}:difficulty:${month}`, TTL_90_DAYS),
                redis.expire(`worksheet:stats:${userEmail}:daily:${day}`, TTL_90_DAYS),
              ]);
            }
          } catch (statsError) {
            console.error("R/W Analytics stats tracking error:", statsError);
          }

          // 10. For free tier, store worksheet data for email-gated unlock
          let worksheetId: string | undefined;
          if (isFree) {
            const redis = getRedisClient();
            if (redis) {
              worksheetId = crypto.randomUUID();
              await redis.set(`worksheet:temp:${worksheetId}`, JSON.stringify(worksheet), {
                ex: 3600,
              });
            }
          }

          // 11. Send complete response
          send({
            type: "progress",
            step: "done",
            message: "Done!",
            percent: 100,
          });

          console.log("R/W Generation complete!");
          const responseData: GenerateResponse = {
            success: true,
            worksheetPdf: worksheetPdf.toString("base64"),
            ...(answerKeyPdf ? { answerKeyPdf: answerKeyPdf.toString("base64") } : {}),
            ...(worksheetId ? { worksheetId } : {}),
            metadata: {
              ...worksheet.metadata,
              // Ensure metadata shape matches GeneratedWorksheet["metadata"]
            },
          };

          send({ type: "complete", data: responseData });
        } catch (error) {
          console.error("R/W Generation error:", error);

          let errorMessage = "An unexpected error occurred. Please try again.";
          if (error instanceof Error) {
            if (error.message.includes("API key") || error.message.includes("not configured")) {
              errorMessage = "Service temporarily unavailable. Please try again later.";
            } else if (error.message.includes("rate") || error.message.includes("limit")) {
              errorMessage = "Service is busy. Please try again in a few minutes.";
            } else if (error.message.includes("LaTeX")) {
              console.error("R/W LaTeX failure details:", error.message);
              const attemptInfo = error.message.includes("Errors:")
                ? ` Debug: ${error.message.substring(error.message.indexOf("Errors:"))}`
                : "";
              errorMessage =
                `PDF generation failed. The AI-generated content may have formatting issues. Please try again.${attemptInfo}`;
            } else if (error.message.includes("parse") || error.message.includes("JSON")) {
              errorMessage = "Failed to parse AI response. Please try again.";
            }
          }

          send({ type: "error", error: errorMessage });
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "application/x-ndjson",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("R/W Pre-stream error:", error);
    return NextResponse.json(
      { success: false, error: "Invalid request." },
      { status: 400 }
    );
  }
}
