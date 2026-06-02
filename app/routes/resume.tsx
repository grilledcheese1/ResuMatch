import { Link, useNavigate, useParams } from "react-router";
import { usePuterStore } from "~/lib/puter";
import { useEffect, useRef, useState, useCallback } from "react";
import { extractTextFromPdf } from "~/lib/pdfToText";
import Summary from "~/components/Summary";
import ATS from "~/components/ATS";
import Details from "~/components/Details";
import GeneratedResumeCard from "~/components/GeneratedResumeCard";
import { CATEGORY_SECTION_MAP } from "../../constants/resumeSections";

export const meta = () => ([
    { title: 'ResuMatch | Review' },
    { name: 'description', content: 'Detailed overview of your resume.' },
])

const ResumePage = () => {
    const { auth, isLoading, fs, kv } = usePuterStore();
    const { id } = useParams();
    const [imageUrl, setImageUrl] = useState('');
    const [resumeUrl, setResumeUrl] = useState('');
    const [feedback, setFeedback] = useState<Feedback | null>(null);
    const [resumeData, setResumeData] = useState<Resume | null>(null);
    const [resumeText, setResumeText] = useState('');
    const [generatedSections, setGeneratedSections] = useState<Partial<Record<SectionKey, string>>>({});
    const [isRewritingAll, setIsRewritingAll] = useState(false);
    const [rewriteAllProgress, setRewriteAllProgress] = useState('');
    const [rewriteAllDone, setRewriteAllDone] = useState(false);
    const [activeSection, setActiveSection] = useState<SectionKey | null>(null);
    // KV write queue — serializes concurrent accepts
    const kvQueueRef = useRef<Promise<any>>(Promise.resolve());
    // Imperative bridge to Details.handleStartRewrite
    const triggerRewriteRef = useRef<((tipId: string) => Promise<void>) | null>(null);
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
        kvQueueRef.current = kvQueueRef.current
            .catch(() => undefined)
            .then(() =>
                kv.set(`resume:${id}`, JSON.stringify(updated)).catch((err) => {
                    console.error("[resume] kv.set failed:", err);
                })
            );
    }, [kv, id]);

    const handleRewriteAccepted = useCallback((rewrite: RewrittenSection) => {
        if (!resumeData) return;

        const nextGenerated = rewrite.sectionKey
            ? { ...generatedSections, [rewrite.sectionKey]: rewrite.rewrittenText }
            : generatedSections;

        if (rewrite.sectionKey) setGeneratedSections(nextGenerated);

        const updated: Resume = {
            ...resumeData,
            rewrites: [...(resumeData.rewrites ?? []), rewrite],
            generatedSections: nextGenerated,
        };
        persistUpdate(updated);
    }, [resumeData, generatedSections, persistUpdate]);

    const handleRewriteAll = useCallback(async () => {
        if (!feedback || isRewritingAll || rewriteAllDone) return;
        if (!triggerRewriteRef.current) return;

        const categories = ['toneAndStyle', 'content', 'structure', 'skills'] as const;
        type Cat = typeof categories[number];
        const categoryMap: Record<Cat, typeof feedback.toneAndStyle> = {
            toneAndStyle: feedback.toneAndStyle,
            content: feedback.content,
            structure: feedback.structure,
            skills: feedback.skills,
        };

        const improveTips: { tipId: string; category: Cat }[] = [];
        for (const cat of categories) {
            categoryMap[cat].tips.forEach((tip, index) => {
                if (tip.type === 'improve') {
                    improveTips.push({ tipId: `${cat}-${index}`, category: cat });
                }
            });
        }

        if (!improveTips.length) return;

        setIsRewritingAll(true);

        for (let i = 0; i < improveTips.length; i++) {
            const { tipId, category } = improveTips[i];
            const sectionKey = CATEGORY_SECTION_MAP[category]?.[0] as SectionKey | undefined;
            const sectionLabel = sectionKey
                ? sectionKey.charAt(0).toUpperCase() + sectionKey.slice(1)
                : category;

            setActiveSection(sectionKey ?? null);
            setRewriteAllProgress(`Rewriting ${sectionLabel}… (${i + 1}/${improveTips.length})`);

            try {
                await triggerRewriteRef.current(tipId);
            } catch {
                // continue to next tip on failure
            }
        }

        setActiveSection(null);
        setIsRewritingAll(false);
        setRewriteAllProgress('');
        setRewriteAllDone(true);
    }, [feedback, isRewritingAll, rewriteAllDone]);

    const rewriteLocked = isRewritingAll || rewriteAllDone;

    return (
        <main className="pt-0!">
            <nav className="resume-nav">
                <Link to="/" className="back-button">
                    <img src="/icons/back.svg" alt="Logo" className="w-2.5 h-2.5" />
                    <span className="text-gray-800 text-sm font-semibold">Back to Home</span>
                </Link>
            </nav>
            <div className="flex flex-row w-full max-lg:flex-col-reverse">
                <section className="feedback-section bg-[url('/images/bg-small.svg')] bg-cover h-screen sticky top-0 overflow-y-auto">
                    <div className="flex flex-col gap-6 w-full items-center justify-start py-6">
                        {imageUrl && resumeUrl && (
                            <div className="animate-in fade-in duration-1000 gradient-border w-full max-w-sm">
                                <a href={resumeUrl} target="_blank" rel="noopener noreferrer">
                                    <img src={imageUrl}
                                         className="w-full h-full object-contain rounded-2xl"
                                         title="Resume" />
                                </a>
                            </div>
                        )}
                        {feedback && (
                            <div className="animate-in fade-in duration-700 w-full max-w-sm">
                                <GeneratedResumeCard
                                    generatedSections={generatedSections}
                                    activeSection={activeSection}
                                    onRewriteAll={handleRewriteAll}
                                    isRewritingAll={isRewritingAll}
                                    rewriteAllProgress={rewriteAllProgress}
                                    anyRewriteInFlight={false}
                                    rewriteAllDone={rewriteAllDone}
                                />
                            </div>
                        )}
                    </div>
                </section>
                <section className="feedback-section">
                    <h2 className="text-4xl text-black! font-bold">Resume Review</h2>
                    {feedback ? (
                        <div className="flex flex-col animate-in fade-in gap-8 duration-1000">
                            <Summary feedback={feedback} />
                            <ATS score={feedback.ATS.score || 0} suggestions={feedback.ATS.tips || []} />
                            <Details
                                feedback={feedback}
                                resumeText={resumeText}
                                jobTitle={resumeData?.jobTitle ?? ''}
                                jobDescription={resumeData?.jobDescription ?? ''}
                                resumeId={id ?? ''}
                                onRewriteAccepted={handleRewriteAccepted}
                                rewriteLocked={rewriteLocked}
                                triggerRewriteRef={triggerRewriteRef}
                            />
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
