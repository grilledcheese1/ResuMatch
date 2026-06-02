import { cn } from "~/lib/utils";
import { SECTION_ORDER, SECTION_LABELS } from "../../constants/resumeSections";

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
}

const GeneratedResumePanel = ({
    generatedSections,
    isGenerating,
    generatingSection,
    resumeText,
}: GeneratedResumePanelProps) => {
    const lines = resumeText.split('\n').map(l => l.trim()).filter(Boolean);
    const candidateName = lines[0] ?? 'Your Resume';
    const contactLine = lines[1] ?? '';

    return (
        <div className="bg-white overflow-y-auto h-full">
            <div className="px-6 pt-12 pb-8">
                {/* Header */}
                <div className="mb-4">
                    <h1 className="font-heading text-2xl font-bold text-[#171717] leading-tight">
                        {candidateName}
                    </h1>
                    {contactLine && (
                        <p className="text-xs text-[#707070] mt-0.5">{contactLine}</p>
                    )}
                    <div className="border-b border-gray-200 mt-3" />
                </div>

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
            </div>
        </div>
    );
};

export default GeneratedResumePanel;
