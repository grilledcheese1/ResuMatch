import { Link, useNavigate, useParams } from "react-router";
import { usePuterStore } from "~/lib/puter";
import { useEffect, useRef, useState } from "react";
import { extractTextFromPdf } from "~/lib/pdfToText";
import Summary from "~/components/Summary";
import ATS from "~/components/ATS";
import Details from "~/components/Details";

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
    // KV write queue — serializes concurrent accepts
    const kvQueueRef = useRef<Promise<any>>(Promise.resolve());
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

            const resumeBlob = await fs.read(data.resumePath);
            if (!resumeBlob) return;

            const pdfBlob = new Blob([resumeBlob], { type: 'application/pdf' });
            setResumeUrl(URL.createObjectURL(pdfBlob));

            const imageBlob = await fs.read(data.imagePath);
            if (imageBlob) setImageUrl(URL.createObjectURL(imageBlob));

            setFeedback(data.feedback);

            // Extract text in the background — non-blocking
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
        // Serialize KV writes; recover from any prior failure before enqueuing
        kvQueueRef.current = kvQueueRef.current
            .catch(() => undefined)
            .then(() =>
                kv.set(`resume:${id}`, JSON.stringify(updated)).catch((err) => {
                    console.error("[resume] kv.set failed:", err);
                })
            );
    };

    return (
        <main className="pt-0!">
            <nav className="resume-nav">
                <Link to="/" className="back-button">
                    <img src="/icons/back.svg" alt="Logo" className="w-2.5 h-2.5" />
                    <span className="text-gray-800 text-sm font-semibold">Back to Home</span>
                </Link>
            </nav>
            <div className="flex flex-row w-full max-lg:flex-col-reverse">
                <section className="feedback-section bg-[url('/images/bg-small.svg')] bg-cover h-screen sticky top-0 items-center justify-center">
                    {imageUrl && resumeUrl && (
                        <div className="animate-in fade-in duration-1000 gradient-border mx-sm:m-0 h-[90%] max-whl:h-fit w-fit">
                            <a href={resumeUrl} target="_blank" rel="noopener noreferrer">
                                <img src={imageUrl}
                                     className="w-full h-full object-contain rounded-2xl"
                                     title="Resume" />
                            </a>
                        </div>
                    )}
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
  return (
    <main className="!pt-0">
        <nav className="resume-nav">
            <Link to="/" className="back-button">
                <img src="/icons/back.svg" alt="Logo" className="w-2.5 h-2.5" />
                <span className="text-[#171717] text-sm font-medium">Back to Home</span>
            </Link>
        </nav>
        <div className="flex flex-row w-full max-lg:flex-col-reverse">
            <section className="feedback-section bg-[#fafafa] h-screen sticky top-0 items-center justify-center border-r border-[#dfdfdf]">
                {imageUrl && resumeUrl && (
                    <div className="animate-in fade-in duration-1000 gradient-border mx-sm:m-0 h-[90%] max-whl:h-fit w-fit">
                        <a href={resumeUrl} target="_blank" rel="noopener noreferrer">
                            <img src={imageUrl}
                                 className="w-full h-full object-contain rounded-2xl"
                                 title="Resume"/>
                        </a>
                    </div>
                )}
            </section>
            <section className="feedback-section">
                <h2 className="!text-3xl !font-medium !text-[#171717]">Resume Review</h2>
                {feedback ? (
                    <div className="flex flex-col animate-in fade-in gap-8 duration-1000">
                        <Summary feedback={feedback}/>
                        <ATS score={feedback.ATS.score || 0} suggestions={feedback.ATS.tips || []}/>
                        <Details feedback={feedback}/>
                    </div>
                ) : (
                    <img src="/images/resume-scan-2.gif" className="w-full"/>
                )}
            </section>
        </div>
    </main>
  )
}

export default Resume;
