import { lazy, Suspense } from "react";
import { cn } from "~/lib/utils";
import { SECTION_ORDER, SECTION_LABELS } from "../../constants/resumeSections";

const ResumePDFDownloadButton = lazy(() => import('./ResumePDFDownloadButton'));

interface EduEntry {
    institutionName?: string | null;
    degree?: string | null;
    major?: string | null;
    minor?: string | null;
    location?: string | null;
    startDate?: string | null;
    graduationYear?: string | null;
}
interface ExpEntry {
    jobTitle?: string | null;
    company?: string | null;
    location?: string | null;
    dates?: string | null;
    bullets?: string[] | null;
}
interface ProjEntry {
    title?: string | null;
    techStack?: string | null;
    dates?: string | null;
    bullets?: string[] | null;
}
interface Additional {
    languages?: string | null;
    frameworks?: string | null;
    developerTools?: string | null;
    libraries?: string | null;
}

const SKELETON_WIDTHS: Record<SectionKey, string[]> = {
    education: ['w-3/4', 'w-1/2', 'w-2/3', 'w-5/12'],
    experience: ['w-full', 'w-11/12', 'w-4/5', 'w-full', 'w-3/4'],
    projects: ['w-2/3', 'w-full', 'w-5/6', 'w-1/2'],
    additional: ['w-full', 'w-5/6', 'w-3/4', 'w-1/2'],
};

function extractBullets(text: string): string[][] {
    return text.split(/\n\n+/).map(block =>
        block.split('\n')
            .filter(l => /^[-•]\s/.test(l.trim()))
            .map(l => l.replace(/^[-•]\s+/, '').trim())
    );
}

interface GeneratedResumePanelProps {
    generatedSections: Partial<Record<SectionKey, string>>;
    isGenerating: boolean;
    generatingSection: SectionKey | null;
    resumeText: string;
    imageUrl: string;
    generationComplete: boolean;
    parsedData: ParsedResumeData | null;
}

const GeneratedResumePanel = ({
    generatedSections,
    isGenerating,
    generatingSection,
    resumeText,
    imageUrl,
    generationComplete,
    parsedData,
}: GeneratedResumePanelProps) => {
    const hasSections = Object.keys(generatedSections).length > 0;

    // State 1 — Placeholder
    if (!isGenerating && !hasSections) {
        return (
            <div className="bg-white h-full overflow-y-auto flex flex-col items-center justify-start pt-12 pb-6 px-4">
                <img
                    src="/images/ResumeExample.png"
                    alt="Resume format example"
                    className="w-full max-w-sm rounded-xl border border-gray-200 shadow-sm opacity-60"
                />
                <p className="text-xs text-[#707070] text-center mt-3 leading-relaxed">
                    Your reformatted resume will appear here
                </p>
            </div>
        );
    }

    // State 2 — Generating with no sections yet
    if (isGenerating && !hasSections) {
        return (
            <div className="bg-white h-full overflow-y-auto flex flex-col items-center justify-start pt-12 pb-6 px-4">
                <div className="relative w-full max-w-sm">
                    <img
                        src={imageUrl || '/images/ResumeExample.png'}
                        alt="Resume"
                        className="w-full rounded-xl border border-gray-200 shadow-sm"
                        style={{ filter: 'blur(4px)', opacity: 0.6 }}
                    />
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                        <svg
                            className="animate-spin size-6 text-[#3ecf8e]"
                            viewBox="0 0 24 24"
                            fill="none"
                        >
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                        </svg>
                        <p className="text-sm font-semibold text-[#171717] bg-white/90 px-3 py-1 rounded-full shadow-sm">
                            {generatingSection
                                ? `Formatting ${SECTION_LABELS[generatingSection]}…`
                                : 'Parsing resume…'}
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    // State 3 — Sections available
    const candidateName = typeof parsedData?.name === 'string' && parsedData.name.trim() ? parsedData.name.trim() : null;
    const contactLine = typeof parsedData?.contact === 'string' && parsedData.contact.trim() ? parsedData.contact.trim() : null;

    const eduEntries = (parsedData?.education as { entries?: EduEntry[] } | null | undefined)?.entries ?? [];
    const expEntries = (parsedData?.experience as { entries?: ExpEntry[] } | null | undefined)?.entries ?? [];
    const projEntries = (parsedData?.projects as { entries?: ProjEntry[] } | null | undefined)?.entries ?? [];
    const add = parsedData?.additional as Additional | null | undefined;

    const expBulletBlocks = generatedSections.experience ? extractBullets(generatedSections.experience) : [];
    const projBulletBlocks = generatedSections.projects ? extractBullets(generatedSections.projects) : [];

    const renderSectionContent = (key: SectionKey, rewritten: string) => {
        if (key === 'education' && eduEntries.length > 0) {
            return (
                <div>
                    {eduEntries.map((e, i) => {
                        const degreeStr = [
                            e.degree,
                            e.major && `in ${e.major}`,
                            e.minor && `Minor in ${e.minor}`,
                        ].filter(Boolean).join(', ');
                        const dateStr = [e.startDate, e.graduationYear].filter(Boolean).join(' – ');
                        return (
                            <div key={i} className={i > 0 ? 'mt-1' : ''}>
                                <div className="flex justify-between items-baseline">
                                    <span className="text-[10px] font-bold font-serif text-black">{e.institutionName}</span>
                                    <span className="text-[9px] text-black">{e.location}</span>
                                </div>
                                <div className="flex justify-between items-baseline">
                                    <span className="text-[9px] italic text-black">{degreeStr}</span>
                                    <span className="text-[9px] italic text-black">{dateStr}</span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            );
        }

        if (key === 'experience' && expEntries.length > 0) {
            return (
                <div>
                    {expEntries.map((e, i) => {
                        const bullets = (expBulletBlocks[i]?.length ? expBulletBlocks[i] : e.bullets) ?? [];
                        return (
                            <div key={i} className={i > 0 ? 'mt-1.5' : ''}>
                                <div className="flex justify-between items-baseline">
                                    <span className="text-[10px] font-bold font-serif text-black">{e.jobTitle}</span>
                                    <span className="text-[9px] text-black">{e.dates}</span>
                                </div>
                                <div className="flex justify-between items-baseline">
                                    <span className="text-[9px] italic text-black">{e.company}</span>
                                    <span className="text-[9px] italic text-black">{e.location}</span>
                                </div>
                                {bullets.length > 0 && (
                                    <ul className="mt-0.5">
                                        {bullets.map((b, j) => (
                                            <li key={j} className="text-[9px] text-black ml-4 list-disc leading-[1.45]">{b}</li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        );
                    })}
                </div>
            );
        }

        if (key === 'projects' && projEntries.length > 0) {
            return (
                <div>
                    {projEntries.map((e, i) => {
                        const bullets = (projBulletBlocks[i]?.length ? projBulletBlocks[i] : e.bullets) ?? [];
                        return (
                            <div key={i} className={i > 0 ? 'mt-1.5' : ''}>
                                <div className="flex justify-between items-baseline">
                                    <span>
                                        <span className="text-[10px] font-bold font-serif text-black">{e.title}</span>
                                        {e.techStack && (
                                            <span className="text-[9px] italic text-black"> | {e.techStack}</span>
                                        )}
                                    </span>
                                    <span className="text-[9px] text-black">{e.dates}</span>
                                </div>
                                {bullets.length > 0 && (
                                    <ul className="mt-0.5">
                                        {bullets.map((b, j) => (
                                            <li key={j} className="text-[9px] text-black ml-4 list-disc leading-[1.45]">{b}</li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        );
                    })}
                </div>
            );
        }

        if (key === 'additional' && add) {
            const rows = [
                { label: 'Languages', value: add.languages },
                { label: 'Frameworks', value: add.frameworks },
                { label: 'Developer Tools', value: add.developerTools },
                { label: 'Libraries', value: add.libraries },
            ].filter(r => r.value);
            if (rows.length > 0) {
                return (
                    <div>
                        {rows.map((r, i) => (
                            <p key={i} className="text-[9px] text-black leading-[1.5]">
                                <span className="font-bold">{r.label}: </span>
                                {r.value}
                            </p>
                        ))}
                    </div>
                );
            }
        }

        return (
            <p className="text-[9px] text-black whitespace-pre-wrap leading-[1.45] animate-in fade-in duration-700">
                {rewritten}
            </p>
        );
    };

    return (
        <div className="bg-white overflow-y-auto h-full">
            <div className="px-6 pt-12 pb-8">
                {/* Header */}
                {candidateName && (
                    <div className="mb-2">
                        <h1 className="text-2xl font-bold text-center font-serif text-black mb-0.5">
                            {candidateName}
                        </h1>
                        {contactLine && (
                            <p className="text-[9px] text-center text-black mt-0">{contactLine}</p>
                        )}
                    </div>
                )}

                {/* Sections */}
                {SECTION_ORDER.map((key) => {
                    const rewritten = generatedSections[key];
                    const isActive = generatingSection === key && !rewritten;

                    return (
                        <div key={key}>
                            <div className="flex items-center gap-2 mt-4 mb-1">
                                <span className="text-[10px] font-bold uppercase tracking-widest font-serif whitespace-nowrap text-black">
                                    {SECTION_LABELS[key]}
                                </span>
                                <div className="flex-1 border-b border-black" />
                            </div>

                            {rewritten ? (
                                renderSectionContent(key, rewritten)
                            ) : generationComplete ? (
                                <p className="text-[9px] text-[#707070] italic">-</p>
                            ) : (
                                <div className="flex flex-col gap-1.5">
                                    {SKELETON_WIDTHS[key].map((w, i) => (
                                        <div
                                            key={i}
                                            className={cn(
                                                "h-2 rounded-full",
                                                w,
                                                isActive ? "bg-blue-200 animate-pulse" : "bg-gray-100 animate-pulse"
                                            )}
                                        />
                                    ))}
                                    {isActive && (
                                        <p className="text-[10px] text-blue-400 font-medium mt-0.5">Writing…</p>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}

                {/* Download button */}
                {generationComplete && (
                    <div className="mt-6">
                        <Suspense fallback={
                            <button disabled className="primary-button w-full text-sm opacity-50">
                                Preparing PDF…
                            </button>
                        }>
                            <ResumePDFDownloadButton
                                candidateName={candidateName ?? 'Resume'}
                                contactLine={contactLine ?? ''}
                                generatedSections={generatedSections}
                                parsedData={parsedData}
                            />
                        </Suspense>
                    </div>
                )}
            </div>
        </div>
    );
};

export default GeneratedResumePanel;
