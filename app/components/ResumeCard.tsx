import { Link } from "react-router";
import ScoreCircle from "~/components/ScoreCircle";
import { useEffect, useRef, useState } from "react";
import { usePuterStore } from "~/lib/puter";
import { useGSAP } from "@gsap/react";
import { reducedMotion, fadeScaleIn } from "~/lib/animations";

const ResumeCard = ({ resume: { id, companyName, jobTitle, feedback, imagePath } }: { resume: Resume }) => {
    const { fs } = usePuterStore();
    const [resumeUrl, setResumeUrl] = useState('');
    const thumbRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const loadResume = async () => {
            const blob = await fs.read(imagePath);
            if (!blob) return;
            setResumeUrl(URL.createObjectURL(blob));
        };
        loadResume();
    }, [imagePath]);

    useGSAP(() => {
        if (!resumeUrl || !thumbRef.current) return;
        if (reducedMotion()) return;
        fadeScaleIn(thumbRef.current, { delay: 0.05 });
    }, { dependencies: [resumeUrl] });

    return (
        <Link to={`/resume/${id}`} className="resume-card-effects resume-card">
            <div className="resume-card-header">
                <div className="flex flex-col gap-2">
                    {companyName && (
                        <h2 className="!text-[#171717] !text-base break-words !font-semibold">
                            {companyName}
                        </h2>
                    )}
                    {jobTitle && (
                        <h3 className="text-sm break-words text-[#707070]">
                            {jobTitle}
                        </h3>
                    )}
                    {!companyName && !jobTitle && (
                        <h2 className="!text-[#171717] !text-base !font-semibold">Resume</h2>
                    )}
                </div>
                <div className="shrink-0">
                    <ScoreCircle score={feedback.overallScore} />
                </div>
            </div>

            {resumeUrl && (
                <div ref={thumbRef} className="gradient-border">
                    <div className="w-full h-full">
                        <img
                            src={resumeUrl}
                            alt="resume"
                            className="w-full h-87.5 max-sm:h-62.5 object-cover object-top"
                        />
                    </div>
                </div>
            )}
        </Link>
    );
};

export default ResumeCard;
