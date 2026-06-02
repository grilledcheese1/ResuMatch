import { Link, useNavigate, useParams } from "react-router";
import { usePuterStore } from "~/lib/puter";
import { useEffect, useRef, useState } from "react";
import { extractTextFromPdf } from "~/lib/pdfToText";
import Summary from "~/components/Summary";
import ATS from "~/components/ATS";
import Details from "~/components/Details";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { reducedMotion, fadeScaleIn, fadeSlideIn } from "~/lib/animations";

export const meta = () => ([
    { title: 'ResuMatch | Review' },
    { name: 'description', content: 'Detailed overview of your resume.' },
])

const Resume = () => {
    const { auth, isLoading, fs, kv } = usePuterStore();
    const { id } = useParams();
    const [imageUrl, setImageUrl] = useState('');
    const [resumeUrl, setResumeUrl] = useState('');
    const [feedback, setFeedback] = useState<Feedback | null>(null);
    const [resumeData, setResumeData] = useState<Resume | null>(null);
    const [resumeText, setResumeText] = useState('');
    const [showReview, setShowReview] = useState(false);
    const [panelOpen, setPanelOpen] = useState(true);
    const kvQueueRef = useRef<Promise<any>>(Promise.resolve());
    const navigate = useNavigate();

    const backBtnRef = useRef<HTMLAnchorElement>(null);
    const imageWrapRef = useRef<HTMLDivElement>(null);
    const rightSectionRef = useRef<HTMLElement>(null);
    const ctaRef = useRef<HTMLDivElement>(null);
    const leftSectionRef = useRef<HTMLElement>(null);
    const originalWidthRef = useRef<number>(0);
    const panelTweenRef = useRef<gsap.core.Tween | null>(null);
    const revealedRef = useRef(false);

    useEffect(() => {
        if (!isLoading && !auth.isAuthenticated) navigate(`/auth?next=/resume/${id}`);
    }, [isLoading]);

    useEffect(() => {
        const loadResume = async () => {
            const resume = await kv.get(`resume:${id}`);
            if (!resume) return;

            const data: Resume = JSON.parse(resume);
            setResumeData(data);

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

    const handleRewriteAccepted = (rewrite: RewrittenSection) => {
        if (!resumeData) return;
        const updated: Resume = {
            ...resumeData,
            rewrites: [...(resumeData.rewrites ?? []), rewrite],
        };
        setResumeData(updated);
        kvQueueRef.current = kvQueueRef.current
            .catch(() => undefined)
            .then(() =>
                kv.set(`resume:${id}`, JSON.stringify(updated)).catch((err) => {
                    console.error("[resume] kv.set failed:", err);
                })
            );
    };

    const handleShowReview = () => {
        if (reducedMotion() || !ctaRef.current) {
            setShowReview(true);
            return;
        }
        gsap.to(ctaRef.current, {
            opacity: 0,
            y: -16,
            scale: 0.97,
            duration: 0.28,
            ease: 'power2.in',
            onComplete: () => setShowReview(true),
        });
    };

    const togglePanel = () => {
        const el = leftSectionRef.current;
        if (!el) return;
        if (reducedMotion()) {
            if (panelOpen) {
                gsap.set(el, { flex: 'none', width: 0 });
            } else {
                gsap.set(el, { clearProps: 'width,flex' });
            }
            setPanelOpen(prev => !prev);
            return;
        }
        panelTweenRef.current?.kill();
        if (panelOpen) {
            const w = el.offsetWidth;
            if (w > 0) originalWidthRef.current = w;
            gsap.set(el, { flex: 'none', width: w });
            panelTweenRef.current = gsap.to(el, {
                width: 0,
                duration: 0.5,
                ease: 'power2.inOut',
            });
            setPanelOpen(false);
        } else {
            panelTweenRef.current = gsap.to(el, {
                width: originalWidthRef.current,
                duration: 0.5,
                ease: 'power2.inOut',
                onComplete: () => gsap.set(el, { clearProps: 'width,flex' }),
            });
            setPanelOpen(true);
        }
    };

    // Back button slide-in
    useGSAP(() => {
        if (reducedMotion() || !backBtnRef.current) return;
        gsap.fromTo(
            backBtnRef.current,
            { opacity: 0, x: -10 },
            { opacity: 1, x: 0, duration: 0.3, ease: 'power2.out' }
        );
    });

    // Resume image fade + scale
    useGSAP(() => {
        if (reducedMotion() || !imageUrl || !imageWrapRef.current) return;
        fadeScaleIn(imageWrapRef.current, { duration: 0.6 });
    }, { dependencies: [imageUrl] });

    // Right column h2 entrance
    useGSAP(() => {
        if (reducedMotion() || !rightSectionRef.current) return;
        const h2 = rightSectionRef.current.querySelector('h2');
        if (h2) fadeSlideIn(h2);
    }, { scope: rightSectionRef });

    // CTA card entrance when feedback loads
    useGSAP(() => {
        if (!feedback || showReview || !ctaRef.current || reducedMotion()) return;
        gsap.fromTo(
            ctaRef.current,
            { opacity: 0, y: 28, scale: 0.97 },
            { opacity: 1, y: 0, scale: 1, duration: 0.45, ease: 'power2.out' }
        );
    }, { dependencies: [feedback] });

    // Panel cards: dramatic reveal on first show, subtle re-fade on panel toggle
    useGSAP(() => {
        if (!showReview || !rightSectionRef.current) return;
        const panels = rightSectionRef.current.querySelectorAll("[data-animate='panel']");
        if (!panels.length) return;
        if (reducedMotion()) {
            gsap.set(panels, { opacity: 1, y: 0, scale: 1 });
            return;
        }
        if (!revealedRef.current) {
            gsap.fromTo(
                panels,
                { opacity: 0, y: 36, scale: 0.97 },
                { opacity: 1, y: 0, scale: 1, duration: 0.5, ease: 'power2.out', stagger: 0.14 }
            );
            revealedRef.current = true;
        } else {
            gsap.fromTo(
                panels,
                { opacity: 0.65, y: 8 },
                { opacity: 1, y: 0, duration: 0.3, ease: 'power2.out', stagger: 0.07 }
            );
        }
    }, { dependencies: [showReview, panelOpen] });

    const categoryScores = feedback ? [
        { label: 'Tone & Style', score: feedback.toneAndStyle.score },
        { label: 'Content',      score: feedback.content.score },
        { label: 'Structure',    score: feedback.structure.score },
        { label: 'Skills',       score: feedback.skills.score },
    ] : [];

    // Grid when panel is hidden, flex-col when visible
    const reviewLayout = !panelOpen
        ? 'grid grid-cols-2 gap-x-6 gap-y-8 items-start'
        : 'flex flex-col gap-8';

    return (
        <main className="pt-0!">
            <nav className="resume-nav">
                <Link ref={backBtnRef} to="/" className="back-button">
                    <img src="/icons/back.svg" alt="Logo" className="w-2.5 h-2.5" />
                    <span className="text-gray-800 text-sm font-semibold">Back to Home</span>
                </Link>

                {imageUrl && (
                    <button
                        onClick={togglePanel}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-[#171717] bg-white border border-[#dfdfdf] rounded-[6px] hover:border-[#c7c7c7] hover:bg-[#fafafa] transition-all duration-200 cursor-pointer shadow-sm"
                        aria-label={panelOpen ? 'Hide resume preview' : 'Show resume preview'}
                    >
                        {/* Sidebar panel icon — mirrors on close */}
                        <svg
                            width="16" height="16" viewBox="0 0 16 16" fill="none"
                            style={{ transform: panelOpen ? 'none' : 'scaleX(-1)', transition: 'transform 0.3s ease' }}
                        >
                            <rect x="1.5" y="1.5" width="13" height="13" rx="2" stroke="currentColor" strokeWidth="1.4"/>
                            <line x1="5.5" y1="1.5" x2="5.5" y2="14.5" stroke="currentColor" strokeWidth="1.4"/>
                        </svg>
                        <span>{panelOpen ? 'Hide Preview' : 'Show Preview'}</span>
                    </button>
                )}
            </nav>

            <div className="flex flex-row w-full max-lg:flex-col-reverse">
                {/* Left: Resume preview — GSAP animates width to 0 on hide */}
                <section
                    ref={leftSectionRef}
                    className="feedback-section bg-[url('/images/bg-small.svg')] bg-cover h-screen sticky top-0 items-center justify-center"
                    style={{ flexShrink: 0, overflow: 'hidden' }}
                >
                    {imageUrl && resumeUrl && (
                        <div ref={imageWrapRef} className="gradient-border mx-sm:m-0 h-[90%] max-whl:h-fit w-fit">
                            <a href={resumeUrl} target="_blank" rel="noopener noreferrer">
                                <img
                                    src={imageUrl}
                                    className="w-full h-full object-contain rounded-2xl"
                                    title="Resume"
                                    alt="Resume preview"
                                />
                            </a>
                        </div>
                    )}
                </section>

                {/* Right: Review section — flex:1 fills freed space as left panel slides out */}
                <section
                    ref={rightSectionRef}
                    className="feedback-section"
                    style={{ flex: '1 1 0', minWidth: 0 }}
                >
                    <h2 className="text-4xl text-black! font-bold">Resume Review</h2>

                    {!feedback ? (
                        /* Still analyzing */
                        <img src="/images/resume-scan-2.gif" className="w-full" alt="Analyzing resume..." />

                    ) : !showReview ? (
                        /* Analysis ready — show CTA card */
                        <div ref={ctaRef} className="flex flex-col w-full" style={{ opacity: 0 }}>
                            <div className="bg-white rounded-[16px] border border-[#dfdfdf] shadow-sm p-8 flex flex-col items-center gap-6 text-center">
                                <div className="w-14 h-14 rounded-full bg-green-50 border border-green-200 flex items-center justify-center flex-shrink-0">
                                    <img src="/icons/check.svg" alt="" className="w-7 h-7" />
                                </div>

                                <div className="flex flex-col gap-1.5">
                                    <h3 className="text-xl font-semibold text-[#171717]">Analysis Complete</h3>
                                    <p className="text-sm text-[#707070] leading-relaxed max-w-xs mx-auto">
                                        Your resume has been scored against the job description
                                    </p>
                                </div>

                                <div className="flex flex-col items-center gap-1 py-2">
                                    <span className="text-[80px] font-bold text-[#171717] leading-none tabular-nums">
                                        {feedback.ATS.score}
                                    </span>
                                    <span className="text-xs font-semibold text-[#707070] uppercase tracking-widest mt-1">
                                        ATS Score / 100
                                    </span>
                                </div>

                                {/* Category scores preview grid */}
                                <div className="grid grid-cols-2 gap-3 w-full">
                                    {categoryScores.map(({ label, score }) => (
                                        <div
                                            key={label}
                                            className="flex items-center justify-between bg-[#fafafa] border border-[#efefef] rounded-[8px] px-3 py-2.5"
                                        >
                                            <span className="text-sm text-[#707070] truncate pr-2">{label}</span>
                                            <span className={`text-sm font-semibold tabular-nums flex-shrink-0 ${score > 69 ? 'text-green-600' : score > 39 ? 'text-amber-600' : 'text-red-600'}`}>
                                                {score}/100
                                            </span>
                                        </div>
                                    ))}
                                </div>

                                <button
                                    onClick={handleShowReview}
                                    className="primary-button w-full"
                                >
                                    View Full Review
                                </button>
                            </div>
                        </div>

                    ) : (
                        /* Full review — grid when panel hidden, stack when visible */
                        <div className={reviewLayout}>
                            <div data-animate="panel" style={{ opacity: 0 }}>
                                <Summary feedback={feedback} />
                            </div>
                            <div data-animate="panel" style={{ opacity: 0 }}>
                                <ATS score={feedback.ATS.score || 0} suggestions={feedback.ATS.tips || []} />
                            </div>
                            <div
                                data-animate="panel"
                                className={!panelOpen ? 'col-span-2' : ''}
                                style={{ opacity: 0 }}
                            >
                                <Details
                                    feedback={feedback}
                                    resumeText={resumeText}
                                    jobTitle={resumeData?.jobTitle ?? ''}
                                    jobDescription={resumeData?.jobDescription ?? ''}
                                    resumeId={id ?? ''}
                                    onRewriteAccepted={handleRewriteAccepted}
                                />
                            </div>
                        </div>
                    )}
                </section>
            </div>
        </main>
    );
};

export default Resume;
