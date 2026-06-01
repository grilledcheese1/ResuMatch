import { useCallback, useRef, useState } from "react";
import { cn, findRelevantSnippet } from "~/lib/utils";
import { usePuterStore } from "~/lib/puter";
import { prepareRewriteInstructions } from "../../constants";
import { generateUUID } from "~/lib/utils";
import RewriteButton from "./RewriteButton";
import RewritePanel from "./RewritePanel";
import {
  Accordion,
  AccordionContent,
  AccordionHeader,
  AccordionItem,
} from "./Accordion";

const ScoreBadge = ({ score }: { score: number }) => {
  return (
      <div
          className={cn(
              "flex flex-row gap-1 items-center px-2 py-0.5 rounded-[96px]",
              score > 69
                  ? "bg-badge-green"
                  : score > 39
                      ? "bg-badge-yellow"
                      : "bg-badge-red"
          )}
      >
        <img
            src={score > 69 ? "/icons/check.svg" : "/icons/warning.svg"}
            alt="score"
            className="size-4"
        />
        <p
            className={cn(
                "text-sm font-medium",
                score > 69
                    ? "text-badge-green-text"
                    : score > 39
                        ? "text-badge-yellow-text"
                        : "text-badge-red-text"
            )}
        >
          {score}/100
        </p>
      </div>
  );
};

const CategoryHeader = ({
                          title,
                          categoryScore,
                        }: {
  title: string;
  categoryScore: number;
}) => {
  return (
      <div className="flex flex-row gap-4 items-center py-2">
        <p className="text-lg font-semibold text-[#171717]">{title}</p>
        <ScoreBadge score={categoryScore} />
      </div>
  );
};

interface TipWithRewrite {
  tip: { type: "good" | "improve"; tip: string; explanation: string };
  tipId: string;
  category: "toneAndStyle" | "content" | "structure" | "skills";
  resumeText: string;
  jobTitle: string;
  jobDescription: string;
  session: RewriteSession | undefined;
  onStartRewrite: (tipId: string) => void;
  onAccept: (tipId: string, rewritten: string, tipText: string, originalSnippet: string) => void;
  onDismiss: (tipId: string) => void;
  textReady: boolean;
}

const TipCard = ({
  tip,
  tipId,
  category,
  resumeText,
  jobTitle,
  jobDescription,
  session,
  onStartRewrite,
  onAccept,
  onDismiss,
  textReady,
}: TipWithRewrite) => {
  return (
      <div
          className={cn(
              "flex flex-col gap-2 rounded-2xl p-4",
              tip.type === "good"
                  ? "bg-green-50 border border-green-200 text-green-700"
                  : "bg-yellow-50 border border-yellow-200 text-yellow-700"
          )}
      >
        <div className="flex flex-row gap-2 items-center justify-between">
          <div className="flex flex-row gap-2 items-center">
            <img
                src={tip.type === "good" ? "/icons/check.svg" : "/icons/warning.svg"}
                alt="score"
                className="size-5"
            />
            <p className="text-xl font-semibold">{tip.tip}</p>
          </div>
          {tip.type === "improve" && (
              <RewriteButton
                  onRewrite={() => onStartRewrite(tipId)}
                  isLoading={!!session?.inProgress}
                  disabled={!textReady}
                  disabledReason="Resume text is loading — try again in a moment"
              />
          )}
        </div>
        <p>{tip.explanation}</p>
        {session && (
            <RewritePanel
                session={session}
                originalSnippet={findRelevantSnippet(resumeText, tip.tip + ' ' + tip.explanation)}
                onAccept={(text) => onAccept(tipId, text, tip.tip, findRelevantSnippet(resumeText, tip.tip + ' ' + tip.explanation))}
                onDismiss={() => onDismiss(tipId)}
            />
        )}
      </div>
  );
};

const CategoryContent = ({
  tips,
  category,
  resumeText,
  jobTitle,
  jobDescription,
  sessions,
  onStartRewrite,
  onAccept,
  onDismiss,
  textReady,
}: {
  tips: { type: "good" | "improve"; tip: string; explanation: string }[];
  category: "toneAndStyle" | "content" | "structure" | "skills";
  resumeText: string;
  jobTitle: string;
  jobDescription: string;
  sessions: Map<string, RewriteSession>;
  onStartRewrite: (tipId: string) => void;
  onAccept: (tipId: string, rewritten: string, tipText: string, originalSnippet: string) => void;
  onDismiss: (tipId: string) => void;
  textReady: boolean;
}) => {
  return (
      <div className="flex flex-col gap-4 items-center w-full">
        <div className="bg-[#fafafa] w-full rounded-[8px] px-5 py-4 grid grid-cols-2 gap-4">
          {tips.map((tip, index) => (
              <div className="flex flex-row gap-2 items-center" key={index}>
                <img
                    src={tip.type === "good" ? "/icons/check.svg" : "/icons/warning.svg"}
                    alt="score"
                    className="size-5"
                />
                <p className="text-sm text-gray-500">{tip.explanation}</p>
                <p className="text-base text-[#707070]">{tip.tip}</p>
              </div>
          ))}
        </div>
        <div className="flex flex-col gap-4 w-full">
          {tips.map((tip, index) => {
            const tipId = `${category}-${index}`;
            return (
                <TipCard
                    key={tipId}
                    tip={tip}
                    tipId={tipId}
                    category={category}
                    resumeText={resumeText}
                    jobTitle={jobTitle}
                    jobDescription={jobDescription}
                    session={sessions.get(tipId)}
                    onStartRewrite={onStartRewrite}
                    onAccept={onAccept}
                    onDismiss={onDismiss}
                    textReady={textReady}
                />
            );
          })}
        </div>
      </div>
  );
};

interface DetailsProps {
  feedback: Feedback;
  resumeText: string;
  jobTitle: string;
  jobDescription: string;
  resumeId: string;
  onRewriteAccepted?: (rewrite: RewrittenSection) => void;
}

const Details = ({
  feedback,
  resumeText,
  jobTitle,
  jobDescription,
  resumeId,
  onRewriteAccepted,
}: DetailsProps) => {
  const { ai } = usePuterStore();
  const [sessions, setSessions] = useState<Map<string, RewriteSession>>(new Map());
  // rAF ref to batch streaming state updates
  const rafRef = useRef<number | null>(null);
  const pendingChunks = useRef<Map<string, string>>(new Map());

  const textReady = resumeText.length > 50;

  const flushPending = useCallback(() => {
    rafRef.current = null;
    setSessions((prev) => {
      const next = new Map(prev);
      pendingChunks.current.forEach((text, tipId) => {
        const existing = next.get(tipId);
        if (existing) {
          next.set(tipId, { ...existing, streamedText: existing.streamedText + text });
        }
      });
      pendingChunks.current.clear();
      return next;
    });
  }, []);

  const handleStartRewrite = useCallback(async (tipId: string) => {
    const parts = tipId.split("-");
    const index = parseInt(parts[parts.length - 1], 10);
    const category = parts.slice(0, -1).join("-") as RewrittenSection["category"];

    const categoryMap: Record<string, typeof feedback.toneAndStyle> = {
      toneAndStyle: feedback.toneAndStyle,
      content: feedback.content,
      structure: feedback.structure,
      skills: feedback.skills,
    };
    const tipObj = categoryMap[category]?.tips[index];
    if (!tipObj || tipObj.type !== "improve") return;

    setSessions((prev) => {
      const next = new Map(prev);
      next.set(tipId, { inProgress: true, tipId, streamedText: "", error: undefined });
      return next;
    });

    const prompt = prepareRewriteInstructions({
      resumeText,
      tip: tipObj.tip + ": " + tipObj.explanation,
      category,
      jobTitle,
      jobDescription,
    });

    try {
      const result = await ai.rewrite(prompt, (chunk) => {
        pendingChunks.current.set(
          tipId,
          (pendingChunks.current.get(tipId) ?? "") + chunk
        );
        if (!rafRef.current) {
          rafRef.current = requestAnimationFrame(flushPending);
        }
      });

      setSessions((prev) => {
        const next = new Map(prev);
        const existing = next.get(tipId);
        if (!existing) return next;
        next.set(tipId, {
          inProgress: false,
          tipId,
          streamedText: result ?? existing.streamedText,
        });
        return next;
      });
    } catch (err) {
      setSessions((prev) => {
        const next = new Map(prev);
        if (!next.has(tipId)) return next;
        next.set(tipId, {
          inProgress: false,
          tipId,
          streamedText: "",
          error: "Rewrite failed. Please try again.",
        });
        return next;
      });
    }
  }, [ai, resumeText, jobTitle, jobDescription, feedback, flushPending]);

  const handleAccept = useCallback(async (tipId: string, rewrittenText: string, tipText: string, originalSnippet: string) => {
    const parts = tipId.split("-");
    const category = parts.slice(0, -1).join("-") as RewrittenSection["category"];

    const newRewrite: RewrittenSection = {
      id: generateUUID(),
      tipText,
      category,
      originalSnippet,
      rewrittenText,
      acceptedAt: Date.now(),
    };

    onRewriteAccepted?.(newRewrite);

    setSessions((prev) => {
      const next = new Map(prev);
      next.delete(tipId);
      return next;
    });
  }, [onRewriteAccepted]);

  const handleDismiss = useCallback((tipId: string) => {
    setSessions((prev) => {
      const next = new Map(prev);
      next.delete(tipId);
      return next;
    });
  }, []);

  const sharedProps = {
    resumeText,
    jobTitle,
    jobDescription,
    sessions,
    onStartRewrite: handleStartRewrite,
    onAccept: handleAccept,
    onDismiss: handleDismiss,
    textReady,
  };

  return (
      <div className="flex flex-col gap-4 w-full">
        <Accordion>
          <AccordionItem id="tone-style">
            <AccordionHeader itemId="tone-style">
              <CategoryHeader title="Tone & Style" categoryScore={feedback.toneAndStyle.score} />
            </AccordionHeader>
            <AccordionContent itemId="tone-style">
              <CategoryContent tips={feedback.toneAndStyle.tips} category="toneAndStyle" {...sharedProps} />
            </AccordionContent>
          </AccordionItem>
          <AccordionItem id="content">
            <AccordionHeader itemId="content">
              <CategoryHeader title="Content" categoryScore={feedback.content.score} />
            </AccordionHeader>
            <AccordionContent itemId="content">
              <CategoryContent tips={feedback.content.tips} category="content" {...sharedProps} />
            </AccordionContent>
          </AccordionItem>
          <AccordionItem id="structure">
            <AccordionHeader itemId="structure">
              <CategoryHeader title="Structure" categoryScore={feedback.structure.score} />
            </AccordionHeader>
            <AccordionContent itemId="structure">
              <CategoryContent tips={feedback.structure.tips} category="structure" {...sharedProps} />
            </AccordionContent>
          </AccordionItem>
          <AccordionItem id="skills">
            <AccordionHeader itemId="skills">
              <CategoryHeader title="Skills" categoryScore={feedback.skills.score} />
            </AccordionHeader>
            <AccordionContent itemId="skills">
              <CategoryContent tips={feedback.skills.tips} category="skills" {...sharedProps} />
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
  );
};

export default Details;
