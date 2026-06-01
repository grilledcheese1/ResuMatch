import { lazy, Suspense } from "react";

type DiffOp = { type: "same" | "delete" | "insert"; word: string };

function computeDiff(original: string, rewritten: string): DiffOp[] {
    const a = original.split(/\s+/).filter(Boolean);
    const b = rewritten.split(/\s+/).filter(Boolean);

    // LCS table
    const m = a.length;
    const n = b.length;
    const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));

    for (let i = m - 1; i >= 0; i--) {
        for (let j = n - 1; j >= 0; j--) {
            if (a[i] === b[j]) {
                dp[i][j] = 1 + dp[i + 1][j + 1];
            } else {
                dp[i][j] = Math.max(dp[i + 1][j], dp[i][j + 1]);
            }
        }
    }

    const ops: DiffOp[] = [];
    let i = 0;
    let j = 0;
    while (i < m || j < n) {
        if (i < m && j < n && a[i] === b[j]) {
            ops.push({ type: "same", word: a[i] });
            i++;
            j++;
        } else if (j < n && (i >= m || dp[i][j + 1] >= dp[i + 1][j])) {
            ops.push({ type: "insert", word: b[j] });
            j++;
        } else {
            ops.push({ type: "delete", word: a[i] });
            i++;
        }
    }
    return ops;
}

interface DiffViewProps {
    original: string;
    rewritten: string;
}

const DiffView = ({ original, rewritten }: DiffViewProps) => {
    const ops = computeDiff(original, rewritten);

    return (
        <div className="flex flex-col gap-3 text-sm">
            <div className="flex flex-row gap-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                <span className="flex-1 text-center">Before</span>
                <span className="flex-1 text-center">After</span>
            </div>
            <div className="flex flex-row gap-3">
                {/* Before panel */}
                <div className="flex-1 bg-red-50 border border-red-200 rounded-xl p-3 leading-relaxed">
                    {ops.map((op, i) =>
                        op.type === "insert" ? null : (
                            <span
                                key={i}
                                className={
                                    op.type === "delete"
                                        ? "line-through text-red-600 bg-red-100 rounded px-0.5 mx-0.5"
                                        : "text-gray-700 mx-0.5"
                                }
                            >
                                {op.word}{" "}
                            </span>
                        )
                    )}
                </div>
                {/* After panel */}
                <div className="flex-1 bg-green-50 border border-green-200 rounded-xl p-3 leading-relaxed">
                    {ops.map((op, i) =>
                        op.type === "delete" ? null : (
                            <span
                                key={i}
                                className={
                                    op.type === "insert"
                                        ? "text-green-700 bg-green-100 rounded px-0.5 mx-0.5 font-medium"
                                        : "text-gray-700 mx-0.5"
                                }
                            >
                                {op.word}{" "}
                            </span>
                        )
                    )}
                </div>
            </div>
        </div>
    );
};

export default DiffView;
