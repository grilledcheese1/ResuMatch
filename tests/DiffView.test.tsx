import { describe, it, expect } from 'vitest';

// Re-implement the LCS diff logic here to test it in isolation
// (mirrors the algorithm in DiffView.tsx exactly)
type DiffOp = { type: "same" | "delete" | "insert"; word: string };

function computeDiff(original: string, rewritten: string): DiffOp[] {
    const a = original.split(/\s+/).filter(Boolean);
    const b = rewritten.split(/\s+/).filter(Boolean);
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
    let i = 0, j = 0;
    while (i < m || j < n) {
        if (i < m && j < n && a[i] === b[j]) {
            ops.push({ type: "same", word: a[i] }); i++; j++;
        } else if (j < n && (i >= m || dp[i][j + 1] >= dp[i + 1][j])) {
            ops.push({ type: "insert", word: b[j] }); j++;
        } else {
            ops.push({ type: "delete", word: a[i] }); i++;
        }
    }
    return ops;
}

describe('DiffView — computeDiff algorithm', () => {
    it('produces no deletes or inserts for identical strings', () => {
        const ops = computeDiff('hello world', 'hello world');
        expect(ops.every((o) => o.type === 'same')).toBe(true);
    });

    it('marks the changed word as delete + insert for single-word change', () => {
        const ops = computeDiff('I managed projects', 'I led projects');
        const deleted = ops.filter((o) => o.type === 'delete');
        const inserted = ops.filter((o) => o.type === 'insert');
        expect(deleted).toHaveLength(1);
        expect(deleted[0].word).toBe('managed');
        expect(inserted).toHaveLength(1);
        expect(inserted[0].word).toBe('led');
    });

    it('marks all words as deleted when rewritten is empty', () => {
        const ops = computeDiff('some content here', '');
        expect(ops.every((o) => o.type === 'delete')).toBe(true);
        expect(ops).toHaveLength(3);
    });

    it('marks all words as inserted when original is empty', () => {
        const ops = computeDiff('', 'brand new content');
        expect(ops.every((o) => o.type === 'insert')).toBe(true);
        expect(ops).toHaveLength(3);
    });

    it('handles full replacement correctly', () => {
        const ops = computeDiff('foo bar', 'baz qux');
        expect(ops.filter((o) => o.type === 'delete')).toHaveLength(2);
        expect(ops.filter((o) => o.type === 'insert')).toHaveLength(2);
        expect(ops.filter((o) => o.type === 'same')).toHaveLength(0);
    });

    it('handles both empty strings with no ops', () => {
        const ops = computeDiff('', '');
        expect(ops).toHaveLength(0);
    });
});
