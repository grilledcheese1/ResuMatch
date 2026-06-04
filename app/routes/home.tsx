import type { Route } from "./+types/home";
import Navbar from "~/components/Navbar";
import ResumeCard from "~/components/ResumeCard";
import { usePuterStore } from "~/lib/puter";
import { Link, useNavigate } from "react-router";
import { useEffect, useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import { reducedMotion, fadeSlideIn, staggerCards, scaleIn } from "~/lib/animations";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "ResuMatch" },
    { name: "description", content: "Smart feedback for your dream job!" },
  ];
}

export default function Home() {
  const { auth, isLoading, kv } = usePuterStore();
  const navigate = useNavigate();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loadingResumes, setLoadingResumes] = useState(false);

  const headingRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    if (isLoading) return;
    if (!auth.isAuthenticated) {
      navigate('/auth?next=/');
      return;
    }
    const loadResumes = async () => {
      setLoadingResumes(true);
      const items = (await kv.list('resume:*', true)) as KVItem[];
      const parsedResumes = items?.map((resume) => JSON.parse(resume.value) as Resume);
      setResumes(parsedResumes || []);
      setLoadingResumes(false);
    };
    loadResumes();
  }, [isLoading, auth.isAuthenticated]);

  // Heading entrance
  useGSAP(() => {
    if (reducedMotion() || !headingRef.current) return;
    const targets = headingRef.current.querySelectorAll("h1, h2");
    if (targets.length) fadeSlideIn(targets, { stagger: 0.1 });
  }, { scope: headingRef });

  // Card grid stagger (fires when resumes load)
  useGSAP(() => {
    if (reducedMotion() || resumes.length === 0 || !gridRef.current) return;
    const cards = gridRef.current.querySelectorAll(".resume-card");
    if (cards.length) staggerCards(cards);
  }, { dependencies: [resumes] });

  // Empty-state CTA entrance
  useGSAP(() => {
    if (reducedMotion() || loadingResumes || resumes.length > 0 || !ctaRef.current) return;
    scaleIn(ctaRef.current, { delay: 0.2 });
  }, { dependencies: [loadingResumes, resumes] });

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <img src="/images/resume-scan-2.gif" className="w-[200px]" />
    </div>
  );

  return <main className="bg-white !pt-0">
    <Navbar />

    <section className="main-section">
      <div ref={headingRef} className="page-heading py-16">
        <h1>Track your Applications & Resume Ratings</h1>
        {!loadingResumes && resumes?.length == 0 ? (
            <h2>No resumes found. Upload your first resume to get feedback.</h2>
        ): (
            <h2>Review your submissions and check AI-powered feedback.</h2>
        )}
      </div>
      {loadingResumes && (
          <div className="flex flex-col items-center justify-center py-12">
            <img src="/images/resume-scan-2.gif" className="w-[200px]"/>
          </div>
      )}
      {!loadingResumes && resumes?.length == 0 && (
          <div className="flex flex-col items-center justify-center mt-10 gap-4">
            <Link ref={ctaRef} to="/upload" className="primary-button w-fit text-xl font-semibold">
              Upload Resume
            </Link>
          </div>
      )}
    </section>

    {!loadingResumes && resumes.length > 0 && (
      <div ref={gridRef} className="resumes-section">
        {resumes.map((resume) => (
          <ResumeCard key={resume.id} resume={resume} />
        ))}
      </div>
    )}
  </main>;
}
