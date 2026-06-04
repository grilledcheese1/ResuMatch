import React, { useRef } from 'react';
import ScoreGauge from './ScoreGauge';
import ScoreBadge from "~/components/ScoreBadge";
import { useGSAP } from "@gsap/react";
import { reducedMotion, fadeSlideIn, scrollFadeIn } from "~/lib/animations";

const Category = ({ title, score }: { title: string; score: number }) => {
    const textColor = score > 70 ? 'text-green-600'
        : score > 49 ? 'text-yellow-600'
        : 'text-red-600';
    return (
        <div className="resume-summary">
            <div className="category">
                <div className="flex flex-row gap-2 items-center justify-center">
                    <p className="text-base font-medium text-[#171717]">{title}</p>
                    <ScoreBadge score={score} />
                </div>
                <p className="text-2xl">
                    <span className={textColor}>{score}</span>
                </p>
            </div>
        </div>
    );
};

const Summary = ({ feedback }: { feedback: Feedback }) => {
    const summaryRef = useRef<HTMLDivElement>(null);

    useGSAP(() => {
        if (reducedMotion() || !summaryRef.current) return;

        const headerRow = summaryRef.current.firstElementChild;
        if (headerRow) fadeSlideIn(headerRow as HTMLElement);

        const rows = summaryRef.current.querySelectorAll(".resume-summary");
        if (rows.length) scrollFadeIn(rows, summaryRef.current);
    }, { scope: summaryRef });

    return (
        <div ref={summaryRef} className="bg-white rounded-[12px] border border-[#dfdfdf] w-full">
            <div className="flex flex-row items-center p-5 gap-5">
                <div className="flex-shrink-0">
                    <ScoreGauge score={feedback.overallScore} />
                </div>
                <div className="flex flex-col gap-1.5 min-w-0 flex-1">
                    <h2 className="!text-lg !font-semibold !text-[#171717] leading-snug">Your Resume Score</h2>
                    <p className="text-sm text-[#707070] leading-relaxed">
                        Calculated from tone, content, structure, and skills.
                    </p>
                </div>
            </div>

            <Category title="Tone & Style" score={feedback.toneAndStyle.score} />
            <Category title="Content" score={feedback.content.score} />
            <Category title="Structure" score={feedback.structure.score} />
            <Category title="Skills" score={feedback.skills.score} />
        </div>
    );
};

export default Summary;
