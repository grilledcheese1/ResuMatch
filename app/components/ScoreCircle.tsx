import { useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { reducedMotion, countUp } from "~/lib/animations";

const ScoreCircle = ({ score = 75 }: { score: number }) => {
    const radius = 40;
    const stroke = 8;
    const normalizedRadius = radius - stroke / 2;
    const circumference = 2 * Math.PI * normalizedRadius;
    const strokeDashoffset = circumference * (1 - score / 100);

    const progressCircleRef = useRef<SVGCircleElement>(null);
    const [displayScore, setDisplayScore] = useState(0);

    useGSAP(() => {
        if (reducedMotion()) {
            gsap.set(progressCircleRef.current, { strokeDashoffset });
            setDisplayScore(score);
            return;
        }
        gsap.set(progressCircleRef.current, { strokeDashoffset: circumference });
        gsap.to(progressCircleRef.current, {
            strokeDashoffset,
            duration: 1,
            ease: "power2.out",
        });
        countUp(score, setDisplayScore, 1);
    }, { dependencies: [score] });

    return (
        <div className="relative w-[100px] h-[100px]">
            <svg
                height="100%"
                width="100%"
                viewBox="0 0 100 100"
                className="transform -rotate-90"
            >
                <circle
                    cx="50"
                    cy="50"
                    r={normalizedRadius}
                    stroke="#dfdfdf"
                    strokeWidth={stroke}
                    fill="transparent"
                />
                <defs>
                    <linearGradient id="grad" x1="1" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#3ecf8e" />
                        <stop offset="100%" stopColor="#24b47e" />
                    </linearGradient>
                </defs>
                <circle
                    ref={progressCircleRef}
                    cx="50"
                    cy="50"
                    r={normalizedRadius}
                    stroke="url(#grad)"
                    strokeWidth={stroke}
                    fill="transparent"
                    strokeDasharray={circumference}
                    strokeLinecap="round"
                />
            </svg>

            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="font-semibold text-sm">{`${displayScore}/100`}</span>
            </div>
        </div>
    );
};

export default ScoreCircle;
