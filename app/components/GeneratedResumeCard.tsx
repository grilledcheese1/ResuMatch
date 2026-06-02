import { cn } from "~/lib/utils";
import { RESUME_SECTIONS, SECTION_LABELS } from "../../constants/resumeSections";

const SECTION_ORDER: SectionKey[] = ['education', 'experience', 'projects', 'activities', 'additional'];

interface GeneratedResumeCardProps {
    generatedSections: Partial<Record<SectionKey, string>>;
    onRewriteAll: () => void;
    isRewritingAll: boolean;
    rewriteAllProgress: string;
    anyRewriteInFlight: boolean;
}

const GeneratedResumeCard = ({
    generatedSections,
    onRewriteAll,
    isRewritingAll,
    rewriteAllProgress,
    anyRewriteInFlight,
}: GeneratedResumeCardProps) => {
    const acceptedCount = SECTION_ORDER.filter((k) => generatedSections[k]).length;
    const total = SECTION_ORDER.length;

    return (
        <div className="flex flex-col gap-0 rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
            <div className="flex flex-row items-center justify-between px-5 py-4 border-b border-gray-100 bg-gray-50">
                <div className="flex flex-row items-center gap-3">
                    <h3 className="text-base font-semibold text-gray-900">Generated Resume</h3>
                    <span
                        className={cn(
                            "text-xs font-medium px-2 py-0.5 rounded-full",
                            acceptedCount === total
                                ? "bg-green-100 text-green-700"
                                : "bg-gray-100 text-gray-500"
                        )}
                    >
                        {acceptedCount} / {total} sections
                    </span>
                </div>
                <button
                    onClick={onRewriteAll}
                    disabled={isRewritingAll || anyRewriteInFlight}
                    className={cn(
                        "text-sm font-medium px-3 py-1.5 rounded-lg transition-colors",
                        isRewritingAll || anyRewriteInFlight
                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                            : "bg-black text-white hover:bg-gray-800 cursor-pointer"
                    )}
                >
                    {isRewritingAll ? rewriteAllProgress : "Rewrite Entire Resume"}
                </button>
            </div>
            <div className="flex flex-col divide-y divide-gray-100">
                {SECTION_ORDER.map((key) => {
                    const rewritten = generatedSections[key];
                    const original = RESUME_SECTIONS[key];
                    return (
                        <div key={key} className="px-5 py-4 flex flex-col gap-1">
                            <div className="flex flex-row items-center gap-2 mb-1">
                                <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                                    {SECTION_LABELS[key]}
                                </span>
                                {rewritten && (
                                    <span className="animate-in fade-in duration-500 flex items-center gap-1 text-xs text-green-600 font-medium">
                                        <img src="/icons/check.svg" alt="done" className="size-3" />
                                        Rewritten
                                    </span>
                                )}
                            </div>
                            <p
                                className={cn(
                                    "text-sm whitespace-pre-wrap leading-relaxed transition-colors duration-300",
                                    rewritten ? "text-gray-800 animate-in fade-in duration-700" : "text-gray-300"
                                )}
                            >
                                {rewritten ?? original}
                            </p>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default GeneratedResumeCard;
