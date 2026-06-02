import { cn } from "~/lib/utils";
import { SECTION_ORDER, SECTION_LABELS } from "../../constants/resumeSections";

const SKELETON_WIDTHS: Record<SectionKey, string[]> = {
    education: ['w-3/4', 'w-1/2', 'w-2/3', 'w-5/12'],
    experience: ['w-full', 'w-11/12', 'w-4/5', 'w-full', 'w-3/4'],
    projects: ['w-2/3', 'w-full', 'w-5/6', 'w-1/2'],
    activities: ['w-3/4', 'w-full', 'w-2/3'],
    additional: ['w-full', 'w-5/6', 'w-3/4', 'w-1/2'],
};

interface GeneratedResumeCardProps {
    generatedSections: Partial<Record<SectionKey, string>>;
    activeSection: SectionKey | null;
    onGenerate: () => void;
    isGenerating: boolean;
    generationComplete: boolean;
}

const GeneratedResumeCard = ({
    generatedSections,
    activeSection,
    onGenerate,
    isGenerating,
    generationComplete,
}: GeneratedResumeCardProps) => {
    const acceptedCount = SECTION_ORDER.filter((k) => generatedSections[k]).length;
    const total = SECTION_ORDER.length;
    const buttonDisabled = isGenerating || generationComplete;

    return (
        <div className="flex flex-col rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden w-full">
            <div className="flex flex-row items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50">
                <div className="flex flex-row items-center gap-2">
                    <h3 className="text-sm font-semibold text-gray-900">Generated Resume</h3>
                    <span
                        className={cn(
                            "text-xs font-medium px-2 py-0.5 rounded-full",
                            acceptedCount === total
                                ? "bg-green-100 text-green-700"
                                : "bg-gray-100 text-gray-500"
                        )}
                    >
                        {acceptedCount} / {total}
                    </span>
                </div>
                <button
                    onClick={onGenerate}
                    disabled={buttonDisabled}
                    className={cn(
                        "text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors",
                        buttonDisabled
                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                            : "bg-black text-white hover:bg-gray-800 cursor-pointer"
                    )}
                >
                    {isGenerating
                        ? `Generating… (${acceptedCount}/5)`
                        : generationComplete
                            ? "Resume Generated"
                            : "Generate Resume"}
                </button>
            </div>

            <div className="flex flex-col divide-y divide-gray-100">
                {SECTION_ORDER.map((key) => {
                    const rewritten = generatedSections[key];
                    const isActive = activeSection === key;
                    const skeletons = SKELETON_WIDTHS[key];

                    return (
                        <div key={key} className="px-4 py-3 flex flex-col gap-2">
                            <div className="flex flex-row items-center gap-2">
                                <span className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">
                                    {SECTION_LABELS[key]}
                                </span>
                                {rewritten && (
                                    <span className="animate-in fade-in duration-500 flex items-center gap-1 text-[10px] text-green-600 font-medium">
                                        <img src="/icons/check.svg" alt="done" className="size-3" />
                                        Done
                                    </span>
                                )}
                                {isActive && !rewritten && (
                                    <span className="flex items-center gap-1 text-[10px] text-blue-500 font-medium">
                                        <svg className="animate-spin size-2.5" viewBox="0 0 24 24" fill="none">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                                        </svg>
                                        Writing…
                                    </span>
                                )}
                            </div>

                            {rewritten ? (
                                <p className="text-xs text-gray-800 whitespace-pre-wrap leading-relaxed animate-in fade-in duration-700">
                                    {rewritten}
                                </p>
                            ) : (
                                <div className="flex flex-col gap-1.5">
                                    {skeletons.map((w, i) => (
                                        <div
                                            key={i}
                                            className={cn(
                                                "h-2 rounded-full",
                                                w,
                                                isActive
                                                    ? "bg-blue-200 animate-pulse"
                                                    : "bg-gray-200 animate-pulse"
                                            )}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default GeneratedResumeCard;
