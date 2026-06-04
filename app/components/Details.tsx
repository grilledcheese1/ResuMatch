import { useRef } from "react";
import { cn } from "~/lib/utils";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { reducedMotion } from "~/lib/animations";
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

const TipCard = ({ tip }: { tip: { type: "good" | "improve"; tip: string; explanation: string } }) => (
  <div className={cn(
    "flex flex-col gap-2 rounded-2xl p-4",
    tip.type === "good"
      ? "bg-green-50 border border-green-200 text-green-700"
      : "bg-yellow-50 border border-yellow-200 text-yellow-700"
  )}>
    <div className="flex flex-row gap-2 items-center">
      <img src={tip.type === "good" ? "/icons/check.svg" : "/icons/warning.svg"} alt="score" className="size-5" />
      <p className="text-xl font-semibold">{tip.tip}</p>
    </div>
    <p className="text-sm">{tip.explanation}</p>
  </div>
);

const CategoryContent = ({
  tips,
}: {
  tips: { type: "good" | "improve"; tip: string; explanation: string }[];
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (reducedMotion() || !containerRef.current) return;
    const cards = containerRef.current.children;
    if (!cards.length) return;
    gsap.fromTo(
      cards,
      { opacity: 0, y: 10 },
      { opacity: 1, y: 0, duration: 0.3, ease: "power2.out", stagger: 0.07 }
    );
  }, { scope: containerRef });

  return (
    <div ref={containerRef} className="flex flex-col gap-4 w-full">
      {tips.map((tip, index) => (
        <TipCard key={index} tip={tip} />
      ))}
    </div>
  );
};

interface DetailsProps {
  feedback: Feedback;
}

const Details = ({ feedback }: DetailsProps) => {
  return (
      <div className="flex flex-col gap-4 w-full">
        <Accordion>
          <AccordionItem id="tone-style">
            <AccordionHeader itemId="tone-style">
              <CategoryHeader title="Tone & Style" categoryScore={feedback.toneAndStyle.score} />
            </AccordionHeader>
            <AccordionContent itemId="tone-style">
              <CategoryContent tips={feedback.toneAndStyle.tips} />
            </AccordionContent>
          </AccordionItem>
          <AccordionItem id="content">
            <AccordionHeader itemId="content">
              <CategoryHeader title="Content" categoryScore={feedback.content.score} />
            </AccordionHeader>
            <AccordionContent itemId="content">
              <CategoryContent tips={feedback.content.tips} />
            </AccordionContent>
          </AccordionItem>
          <AccordionItem id="structure">
            <AccordionHeader itemId="structure">
              <CategoryHeader title="Structure" categoryScore={feedback.structure.score} />
            </AccordionHeader>
            <AccordionContent itemId="structure">
              <CategoryContent tips={feedback.structure.tips} />
            </AccordionContent>
          </AccordionItem>
          <AccordionItem id="skills">
            <AccordionHeader itemId="skills">
              <CategoryHeader title="Skills" categoryScore={feedback.skills.score} />
            </AccordionHeader>
            <AccordionContent itemId="skills">
              <CategoryContent tips={feedback.skills.tips} />
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
  );
};

export default Details;
