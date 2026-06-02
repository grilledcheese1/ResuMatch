import { cn } from "~/lib/utils";

interface RewriteButtonProps {
    onRewrite: () => void;
    isLoading: boolean;
    disabled?: boolean;
    disabledReason?: string;
}

const RewriteButton = ({ onRewrite, isLoading, disabled, disabledReason }: RewriteButtonProps) => {
    const isDisabled = isLoading || disabled;

    return (
        <button
            onClick={onRewrite}
            disabled={isDisabled}
            title={disabled && disabledReason ? disabledReason : undefined}
            className={cn(
                "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200",
                isDisabled
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-black text-white hover:bg-gray-800 cursor-pointer"
            )}
        >
            {isLoading ? (
                <>
                    <svg className="animate-spin size-3.5" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    Rewriting…
                </>
            ) : (
                <>
                    <svg className="size-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M2 11.5L11.5 2l2.5 2.5L4.5 14H2v-2.5z" strokeLinejoin="round" />
                        <path d="M9 4l3 3" />
                    </svg>
                    Rewrite with AI
                </>
            )}
        </button>
    );
};

export default RewriteButton;
