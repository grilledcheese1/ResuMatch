import { lazy, Suspense } from "react";

const DiffView = lazy(() => import("./DiffView"));

interface RewritePanelProps {
    session: RewriteSession;
    originalSnippet: string;
    onAccept: (text: string) => void;
    onDismiss: () => void;
}

const StreamingSkeleton = () => (
    <div className="flex flex-col gap-2 animate-pulse">
        <div className="h-3 bg-purple-100 rounded w-full" />
        <div className="h-3 bg-purple-100 rounded w-5/6" />
        <div className="h-3 bg-purple-100 rounded w-4/6" />
    </div>
);

const RewritePanel = ({ session, originalSnippet, onAccept, onDismiss }: RewritePanelProps) => {
    const isDone = !session.inProgress && !session.error && session.streamedText;

    return (
        <div className="mt-3 border border-purple-200 rounded-xl bg-white shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2.5 bg-purple-50 border-b border-purple-200">
                <div className="flex items-center gap-2">
                    <svg className="size-4 text-purple-600" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M2 11.5L11.5 2l2.5 2.5L4.5 14H2v-2.5z" strokeLinejoin="round" />
                        <path d="M9 4l3 3" />
                    </svg>
                    <span className="text-sm font-semibold text-purple-800">AI Rewrite</span>
                    {session.inProgress && (
                        <span className="text-xs text-purple-500 animate-pulse">Generating…</span>
                    )}
                </div>
                <button
                    onClick={onDismiss}
                    className="text-purple-400 hover:text-purple-600 transition-colors cursor-pointer"
                    aria-label="Dismiss"
                >
                    <svg className="size-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M4 4l8 8M12 4l-8 8" />
                    </svg>
                </button>
            </div>

            <div className="p-4 flex flex-col gap-4">
                {session.error ? (
                    <p className="text-sm text-red-600">{session.error}</p>
                ) : session.inProgress ? (
                    <div className="flex flex-col gap-2">
                        {session.streamedText ? (
                            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                                {session.streamedText}
                                <span className="inline-block w-0.5 h-4 bg-purple-500 ml-0.5 animate-pulse align-middle" />
                            </p>
                        ) : (
                            <StreamingSkeleton />
                        )}
                    </div>
                ) : isDone ? (
                    <Suspense fallback={<StreamingSkeleton />}>
                        <DiffView original={originalSnippet} rewritten={session.streamedText} />
                    </Suspense>
                ) : null}

                {isDone && (
                    <div className="flex flex-row gap-2 justify-end">
                        <button
                            onClick={onDismiss}
                            className="px-4 py-1.5 rounded-lg text-sm font-medium text-gray-600 border border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer"
                        >
                            Dismiss
                        </button>
                        <button
                            onClick={() => onAccept(session.streamedText)}
                            className="px-4 py-1.5 rounded-lg text-sm font-semibold text-white bg-purple-600 hover:bg-purple-700 transition-colors cursor-pointer"
                        >
                            Accept Rewrite
                        </button>
                    </div>
                )}

                <p className="text-xs text-gray-400">AI credits will be used for each rewrite.</p>
            </div>
        </div>
    );
};

export default RewritePanel;
