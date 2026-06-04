import React, { useRef } from 'react';
import { SCORE_STRONG_THRESHOLD, SCORE_MODERATE_THRESHOLD } from '~/lib/utils';
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { reducedMotion, scrollFadeIn } from "~/lib/animations";

interface Suggestion {
  type: "good" | "improve";
  tip: string;
}

interface ATSProps {
  score: number;
  suggestions: Suggestion[];
}

const ATS: React.FC<ATSProps> = ({ score, suggestions }) => {
  const atsRef = useRef<HTMLDivElement>(null);

  const iconSrc = score >= SCORE_STRONG_THRESHOLD
    ? '/icons/ats-good.svg'
    : score >= SCORE_MODERATE_THRESHOLD
      ? '/icons/ats-warning.svg'
      : '/icons/ats-bad.svg';

  const subtitle = score >= SCORE_STRONG_THRESHOLD
    ? 'Great Job!'
    : score >= SCORE_MODERATE_THRESHOLD
      ? 'Good Start'
      : 'Needs Improvement';

  useGSAP(() => {
    if (reducedMotion() || !atsRef.current) return;

    const headerRow = atsRef.current.querySelector(".flex.items-center.gap-4");
    if (headerRow) {
      gsap.fromTo(
        headerRow,
        { opacity: 0, x: -12 },
        { opacity: 1, x: 0, duration: 0.35, ease: "power2.out" }
      );
    }

    const suggestions = atsRef.current.querySelectorAll(".space-y-3 > div");
    if (suggestions.length) scrollFadeIn(suggestions, atsRef.current);
  }, { scope: atsRef });

  return (
    <div ref={atsRef} className="bg-white border border-[#dfdfdf] rounded-[12px] w-full p-6">
      <div className="flex items-center gap-4 mb-6">
        <img src={iconSrc} alt="ATS Score Icon" className="w-12 h-12" />
        <div>
          <h2 className="!text-xl !font-semibold !text-[#171717]">ATS Score — {score}/100</h2>
        </div>
      </div>

      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-2">{subtitle}</h3>
        <p className="text-[#707070] mb-4">
          This score represents how well your resume is likely to perform in Applicant Tracking Systems used by employers.
        </p>

        <div className="space-y-3">
          {suggestions.map((suggestion, index) => (
            <div key={index} className="flex items-start gap-3">
              <img
                src={suggestion.type === "good" ? "/icons/check.svg" : "/icons/warning.svg"}
                alt={suggestion.type === "good" ? "Check" : "Warning"}
                className="w-5 h-5 mt-1"
              />
              <p className={suggestion.type === "good" ? "text-green-700" : "text-amber-700"}>
                {suggestion.tip}
              </p>
            </div>
          ))}
        </div>
      </div>

      <p className="text-[#707070] italic">
        Keep refining your resume to improve your chances of getting past ATS filters and into the hands of recruiters.
      </p>
    </div>
  );
};

export default ATS;
