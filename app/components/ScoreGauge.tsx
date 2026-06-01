import { useEffect, useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { reducedMotion, drawArc, countUp } from "~/lib/animations";

const ScoreGauge = ({ score = 75 }: { score: number }) => {
    const [pathLength, setPathLength] = useState(0);
    const [displayScore, setDisplayScore] = useState(0);
    const pathRef = useRef<SVGPathElement>(null);

    useEffect(() => {
        if (pathRef.current) {
            setPathLength(pathRef.current.getTotalLength());
        }
    }, []);

    useGSAP(() => {
        if (!pathLength) return;
        if (reducedMotion()) {
            gsap.set(pathRef.current, { strokeDashoffset: pathLength * (1 - score / 100) });
            setDisplayScore(score);
            return;
        }
        drawArc(pathRef.current!, pathLength, score);
        countUp(score, setDisplayScore, 1);
    }, { dependencies: [pathLength, score] });

    return (
        <div className="flex flex-col items-center">
            <div className="relative w-40 h-20">
                <svg viewBox="0 0 100 50" className="w-full h-full">
                    <defs>
                        <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#3ecf8e" />
                            <stop offset="100%" stopColor="#24b47e" />
                        </linearGradient>
                    </defs>

                    <path
                        d="M10,50 A40,40 0 0,1 90,50"
                        fill="none"
                        stroke="#dfdfdf"
                        strokeWidth="10"
                        strokeLinecap="round"
                    />

                    <path
                        ref={pathRef}
                        d="M10,50 A40,40 0 0,1 90,50"
                        fill="none"
                        stroke="url(#gaugeGradient)"
                        strokeWidth="10"
                        strokeLinecap="round"
                        strokeDasharray={pathLength}
                    />
                </svg>

                <div className="absolute inset-0 flex flex-col items-center justify-center pt-2">
                    <div className="text-xl font-semibold pt-4">{displayScore}/100</div>
                </div>
            </div>
        </div>
    );
};

export default ScoreGauge;
