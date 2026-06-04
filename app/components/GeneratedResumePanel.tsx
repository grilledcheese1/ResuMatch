import { lazy, Suspense } from "react";
import { cn } from "~/lib/utils";
import { SECTION_ORDER, SECTION_LABELS } from "../../constants/resumeSections";

const ResumePDFDownloadButton = lazy(() => import('./ResumePDFDownloadButton'));

const SKELETON_WIDTHS: Record<SectionKey, string[]> = {
    education: ['w-3/4', 'w-1/2', 'w-2/3', 'w-5/12'],
    experience: ['w-full', 'w-11/12', 'w-4/5', 'w-full', 'w-3/4'],
    projects: ['w-2/3', 'w-full', 'w-5/6', 'w-1/2'],
    activities: ['w-3/4', 'w-full', 'w-2/3'],
    additional: ['w-full', 'w-5/6', 'w-3/4', 'w-1/2'],
};

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

    // State 3 — Sections available (may still be generating later sections)
    const candidateName = typeof parsedData?.name === 'string' && parsedData.name.trim() ? parsedData.name.trim() : null;
    const contactLine = typeof parsedData?.contact === 'string' && parsedData.contact.trim() ? parsedData.contact.trim() : null;

    return (
        <div className="bg-white overflow-y-auto h-full">
            <div className="px-6 pt-12 pb-8">
                {/* Header — only rendered when parsedData provides clean fields */}
                {candidateName && (
                    <div className="mb-4">
                        <h1 className="font-heading text-2xl font-bold text-[#171717] leading-tight">
                            {candidateName}
                        </h1>
                        {contactLine && (
                            <p className="text-xs text-[#707070] mt-0.5">{contactLine}</p>
                        )}
                        <div className="border-b border-gray-200 mt-3" />
                    </div>
                )}

                {/* Sections */}
                {SECTION_ORDER.map((key) => {
                    const rewritten = generatedSections[key];
                    const isActive = generatingSection === key && !rewritten;

                    return (
                        <div key={key} className="mt-4">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-[#3ecf8e] mb-1">
                                {SECTION_LABELS[key]}
                            </p>
                            <div className="border-b border-gray-100 mb-2" />
                            {rewritten ? (
                                <p className="text-[11px] text-[#171717] whitespace-pre-wrap leading-relaxed animate-in fade-in duration-700">
                                    {rewritten}
                                </p>
                            ) : generationComplete ? (
                                <p className="text-[11px] text-[#707070] italic">
                                    No content was generated for this section.
                                </p>
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

                {/* Download button — shown only when all sections are complete */}
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
                            />
                        </Suspense>
                    </div>
                )}
            </div>
        </div>
    );
};

export default GeneratedResumePanel;
