import { Link, useNavigate, useParams } from "react-router";
import { usePuterStore } from "~/lib/puter";
import { useEffect, useCallback, useState } from "react";
import { extractTextFromPdf } from "~/lib/pdfToText";
import Summary from "~/components/Summary";
import ATS from "~/components/ATS";
import Details from "~/components/Details";
import GeneratedResumeCard from "~/components/GeneratedResumeCard";
import GeneratedResumePanel from "~/components/GeneratedResumePanel";
import { prepareFullSectionInstructions } from "../../constants";
import { SECTION_ORDER, CATEGORY_SECTION_MAP, RESUME_SECTIONS } from "../../constants/resumeSections";
import { cn } from "~/lib/utils";

export const meta = () => ([
    { title: 'ResuMatch | Review' },
    { name: 'description', content: 'Detailed overview of your resume.' },
])

const ResumePage = () => {
    const { auth, isLoading, fs, kv, ai } = usePuterStore();
    const { id } = useParams();
    const [imageUrl, setImageUrl] = useState('');
    const [resumeUrl, setResumeUrl] = useState('');
    const [feedback, setFeedback] = useState<Feedback | null>(null);
    const [resumeData, setResumeData] = useState<Resume | null>(null);
    const [resumeText, setResumeText] = useState('');
    const [generatedSections, setGeneratedSections] = useState<Partial<Record<SectionKey, string>>>({});
    const [showGenerated, setShowGenerated] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatingSection, setGeneratingSection] = useState<SectionKey | null>(null);
    const [generationComplete, setGenerationComplete] = useState(false);
    const resumeTextReady = resumeText.length > 0;
    const navigate = useNavigate();

    useEffect(() => {
        if (!isLoading && !auth.isAuthenticated) navigate(`/auth?next=/resume/${id}`);
    }, [isLoading]);

    useEffect(() => {
        const loadResume = async () => {
            const resume = await kv.get(`resume:${id}`);
            if (!resume) return;

            const data: Resume = JSON.parse(resume);
            setResumeData(data);

            if (data.generatedSections) {
                setGeneratedSections(data.generatedSections);
                const allDone = SECTION_ORDER.every((k) => !!data.generatedSections?.[k]);
                if (allDone) setGenerationComplete(true);
            }

            const resumeBlob = await fs.read(data.resumePath);
            if (!resumeBlob) return;

            const pdfBlob = new Blob([resumeBlob], { type: 'application/pdf' });
            setResumeUrl(URL.createObjectURL(pdfBlob));

            const imageBlob = await fs.read(data.imagePath);
            if (imageBlob) setImageUrl(URL.createObjectURL(imageBlob));

            setFeedback(data.feedback);

            extractTextFromPdf(pdfBlob).then((result) => {
                if (!result.error && result.text) {
                    setResumeText(result.text);
                }
            });
        };

        loadResume();
    }, [id]);

    const persistUpdate = useCallback((updated: Resume) => {
        setResumeData(updated);
        kv.set(`resume:${id}`, JSON.stringify(updated)).catch((err) => {
            console.error("[resume] kv.set failed:", err);
        });
    }, [kv, id]);

    const handleGenerateResume = useCallback(async () => {
        if (!feedback || !resumeText || !resumeData || isGenerating || generationComplete) return;

        setIsGenerating(true);
        setShowGenerated(true);

        const categories = ['toneAndStyle', 'content', 'structure', 'skills'] as const;
        type Cat = typeof categories[number];

        const categoryMap: Record<Cat, typeof feedback.toneAndStyle> = {
            toneAndStyle: feedback.toneAndStyle,
            content: feedback.content,
            structure: feedback.structure,
            skills: feedback.skills,
        };

        const accumulated: Partial<Record<SectionKey, string>> = { ...generatedSections };

        for (const sectionKey of SECTION_ORDER) {
            setGeneratingSection(sectionKey);

            // Collect all improve tips from categories that map to this section
            const improvementTips: string[] = [];
            for (const cat of categories) {
                const mappedSections = CATEGORY_SECTION_MAP[cat] ?? [];
                if (mappedSections.includes(sectionKey)) {
                    categoryMap[cat].tips
                        .filter((t) => t.type === 'improve')
                        .forEach((t) => {
                            if ('explanation' in t) {
                                improvementTips.push(`${t.tip}: ${t.explanation}`);
                            } else {
                                improvementTips.push(t.tip);
                            }
                        });
                }
            }

            const prompt = prepareFullSectionInstructions({
                resumeText,
                sectionKey,
                sectionTemplate: RESUME_SECTIONS[sectionKey],
                improvementTips,
                jobTitle: resumeData.jobTitle ?? '',
                jobDescription: resumeData.jobDescription ?? '',
            });

            try {
                const result = await ai.rewrite(prompt);
                if (result) {
                    accumulated[sectionKey] = result;
                    setGeneratedSections({ ...accumulated });
                    persistUpdate({ ...resumeData, generatedSections: { ...accumulated } });
                }
            } catch {
                // continue to next section on failure
            }
        }

        setGeneratingSection(null);
        setIsGenerating(false);
        if (Object.keys(accumulated).length > 0) {
            setGenerationComplete(true);
        }
    }, [feedback, resumeText, resumeData, isGenerating, generationComplete, generatedSections, ai, persistUpdate]);

    const showToggle = isGenerating || generationComplete || Object.keys(generatedSections).length > 0;

    return (
        <main className="pt-0!">
            <nav className="resume-nav">
                <Link to="/" className="back-button">
                    <img src="/icons/back.svg" alt="Logo" className="w-2.5 h-2.5" />
                    <span className="text-gray-800 text-sm font-semibold">Back to Home</span>
                </Link>
            </nav>
            <div className="flex flex-row w-full max-lg:flex-col-reverse">
                {/* Left panel — sticky sidebar with slider */}
                <section className="feedback-section bg-[url('/images/bg-small.svg')] bg-cover h-screen sticky top-0 overflow-hidden relative">
                    {/* Toggle tabs */}
                    {showToggle && (
                        <div className="absolute top-4 left-4 right-4 z-20 flex gap-1 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-xl p-1 shadow-sm">
                            <button
                                onClick={() => setShowGenerated(false)}
                                className={cn(
                                    "flex-1 text-xs font-semibold py-1.5 rounded-lg transition-all duration-200 cursor-pointer",
                                    !showGenerated
                                        ? "bg-[#171717] text-white shadow-sm"
                                        : "text-gray-500 hover:text-gray-800"
                                )}
                            >
                                Your Resume
                            </button>
                            <button
                                onClick={() => setShowGenerated(true)}
                                className={cn(
                                    "flex-1 text-xs font-semibold py-1.5 rounded-lg transition-all duration-200 cursor-pointer",
                                    showGenerated
                                        ? "bg-[#3ecf8e] text-[#171717] shadow-sm"
                                        : "text-gray-500 hover:text-gray-800"
                                )}
                            >
                                Generated ✦
                            </button>
                        </div>
                    )}

                    {/* Original resume view */}
                    <div className="h-full overflow-y-auto">
                        <div className={cn("flex flex-col gap-6 w-full items-center justify-start py-6", showToggle && "pt-16")}>
                            {imageUrl && resumeUrl && (
                                <div className="animate-in fade-in duration-1000 gradient-border w-full max-w-sm">
                                    <a href={resumeUrl} target="_blank" rel="noopener noreferrer">
                                        <img
                                            src={imageUrl}
                                            className="w-full h-full object-contain rounded-2xl"
                                            title="Resume"
                                        />
                                    </a>
                                </div>
                            )}
                            {feedback && (
                                <div className="animate-in fade-in duration-700 w-full max-w-sm">
                                    <GeneratedResumeCard
                                        generatedSections={generatedSections}
                                        activeSection={generatingSection}
                                        onGenerate={handleGenerateResume}
                                        isGenerating={isGenerating}
                                        generationComplete={generationComplete}
                                        resumeTextReady={resumeTextReady}
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Generated resume panel — slides in from left */}
                    <div
                        className={cn(
                            "absolute inset-0 z-10 transition-transform duration-300 ease-out",
                            showGenerated ? "translate-x-0" : "-translate-x-full"
                        )}
                        style={{ willChange: 'transform' }}
                    >
                        <GeneratedResumePanel
                            generatedSections={generatedSections}
                            isGenerating={isGenerating}
                            generatingSection={generatingSection}
                            resumeText={resumeText}
                        />
                    </div>
                </section>

                {/* Right panel — feedback */}
                <section className="feedback-section">
                    <h2 className="text-4xl text-black! font-bold">Resume Review</h2>
                    {feedback ? (
                        <div className="flex flex-col animate-in fade-in gap-8 duration-1000">
                            <Summary feedback={feedback} />
                            <ATS score={feedback.ATS.score || 0} suggestions={feedback.ATS.tips || []} />
                            <Details feedback={feedback} />
                        </div>
                    ) : (
                        <img src="/images/resume-scan-2.gif" className="w-full" />
                    )}
                </section>
            </div>
        </main>
    );
};

export default ResumePage;
