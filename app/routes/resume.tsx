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
    const kvQueueRef = useRef<Promise<any>>(Promise.resolve());
    const navigate = useNavigate();

    const backBtnRef = useRef<HTMLAnchorElement>(null);
    const imageWrapRef = useRef<HTMLDivElement>(null);
    const rightSectionRef = useRef<HTMLElement>(null);

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

    // Back button slide-in
    useGSAP(() => {
        if (reducedMotion() || !backBtnRef.current) return;
        gsap.fromTo(
            backBtnRef.current,
            { opacity: 0, x: -10 },
            { opacity: 1, x: 0, duration: 0.3, ease: "power2.out" }
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
        const h2 = rightSectionRef.current.querySelector("h2");
        if (h2) fadeSlideIn(h2);
    }, { scope: rightSectionRef });

    // Feedback panels stagger-in when feedback loads
    useGSAP(() => {
        if (reducedMotion() || !feedback || !rightSectionRef.current) return;
        const panels = rightSectionRef.current.querySelectorAll("[data-animate='panel']");
        if (!panels.length) return;
        gsap.fromTo(
            panels,
            { opacity: 0, y: 24 },
            { opacity: 1, y: 0, duration: 0.45, ease: "power2.out", stagger: 0.12 }
        );
    }, { dependencies: [feedback] });

    return (
        <main className="pt-0!">
            <nav className="resume-nav">
                <Link ref={backBtnRef} to="/" className="back-button">
                    <img src="/icons/back.svg" alt="Logo" className="w-2.5 h-2.5" />
                    <span className="text-gray-800 text-sm font-semibold">Back to Home</span>
                </Link>
            </nav>
            <div className="flex flex-row w-full max-lg:flex-col-reverse">
                <section className="feedback-section bg-[url('/images/bg-small.svg')] bg-cover h-screen sticky top-0 items-center justify-center">
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
                <section ref={rightSectionRef} className="feedback-section">
                    <h2 className="text-4xl text-black! font-bold">Resume Review</h2>
                    {feedback ? (
                        <div className="flex flex-col gap-8">
                            <div data-animate="panel">
                                <Summary feedback={feedback} />
                            </div>
                            <div data-animate="panel">
                                <ATS score={feedback.ATS.score || 0} suggestions={feedback.ATS.tips || []} />
                            </div>
                            <div data-animate="panel">
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
                    ) : (
                        <img src="/images/resume-scan-2.gif" className="w-full" alt="Analyzing resume..." />
                    )}
                </section>
            </div>
        </main>
    );
};

export default Resume;
