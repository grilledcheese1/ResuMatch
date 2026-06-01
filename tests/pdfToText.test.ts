import { describe, it, expect, vi, beforeEach } from 'vitest';
import { extractTextFromPdf } from '../app/lib/pdfToText';

function makeFile(content: string | Uint8Array, name = 'resume.pdf', type = 'application/pdf'): File {
    const bytes = typeof content === 'string' ? new TextEncoder().encode(content) : content;
    return new File([bytes as unknown as BlobPart], name, { type });
}

const VALID_PDF_BYTES = `%PDF-1.4
1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj
2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj
3 0 obj<</Type/Page/MediaBox[0 0 612 792]/Parent 2 0 R>>endobj
xref
0 4
0000000000 65535 f
0000000009 00000 n
0000000058 00000 n
0000000115 00000 n
trailer<</Size 4/Root 1 0 R>>
startxref
190
%%EOF`;

vi.mock('pdfjs-dist/build/pdf.mjs', () => ({
    GlobalWorkerOptions: { workerSrc: '' },
    getDocument: vi.fn(),
}));

describe('extractTextFromPdf', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('returns joined text from a multi-page PDF', async () => {
        // @ts-expect-error - no types for pdfjs mjs build
    const { getDocument } = await import('pdfjs-dist/build/pdf.mjs');

        const makePage = (text: string) => ({
            getTextContent: vi.fn().mockResolvedValue({
                items: [{ str: text }],
            }),
        });

        vi.mocked(getDocument).mockReturnValue({
            promise: Promise.resolve({
                numPages: 2,
                getPage: vi.fn()
                    .mockResolvedValueOnce(makePage('Software Engineer'))
                    .mockResolvedValueOnce(makePage('React TypeScript Node')),
            }),
        } as any);

        const result = await extractTextFromPdf(makeFile(VALID_PDF_BYTES));
        expect(result.error).toBeUndefined();
        expect(result.pageTexts).toHaveLength(2);
        expect(result.text).toContain('Software Engineer');
        expect(result.text).toContain('React TypeScript Node');
    });

    it('returns error (not throw) for empty file', async () => {
        const result = await extractTextFromPdf(makeFile(new Uint8Array(0)));
        expect(result.text).toBe('');
        expect(result.pageTexts).toHaveLength(0);
        expect(result.error).toMatch(/empty/i);
    });

    it('propagates password-protected PDF error', async () => {
        // @ts-expect-error - no types for pdfjs mjs build
    const { getDocument } = await import('pdfjs-dist/build/pdf.mjs');
        const pwError = new Error('PasswordException');
        (pwError as any).name = 'PasswordException';
        vi.mocked(getDocument).mockReturnValue({
            promise: Promise.reject(pwError),
        } as any);

        const result = await extractTextFromPdf(makeFile(VALID_PDF_BYTES, 'locked.pdf'));
        expect(result.text).toBe('');
        expect(result.error).toMatch(/password/i);
    });

    it('normalizes excessive whitespace in extracted text', async () => {
        // @ts-expect-error - no types for pdfjs mjs build
    const { getDocument } = await import('pdfjs-dist/build/pdf.mjs');
        vi.mocked(getDocument).mockReturnValue({
            promise: Promise.resolve({
                numPages: 1,
                getPage: vi.fn().mockResolvedValue({
                    getTextContent: vi.fn().mockResolvedValue({
                        items: [
                            { str: 'Hello   ' },
                            { str: '   World' },
                        ],
                    }),
                }),
            }),
        } as any);

        const result = await extractTextFromPdf(makeFile(VALID_PDF_BYTES));
        expect(result.text).toBe('Hello World');
        expect(result.text).not.toMatch(/\s{2,}/);
    });

    it('returns empty string (not crash) when page has no text items', async () => {
        // @ts-expect-error - no types for pdfjs mjs build
    const { getDocument } = await import('pdfjs-dist/build/pdf.mjs');
        vi.mocked(getDocument).mockReturnValue({
            promise: Promise.resolve({
                numPages: 1,
                getPage: vi.fn().mockResolvedValue({
                    getTextContent: vi.fn().mockResolvedValue({ items: [] }),
                }),
            }),
        } as any);

        const result = await extractTextFromPdf(makeFile(VALID_PDF_BYTES));
        expect(result.error).toBeUndefined();
        expect(result.text).toBe('');
        expect(result.pageTexts).toEqual(['']);
    });

    it('clears loadPromise after import failure so a retry succeeds', async () => {
        // @ts-expect-error - no types for pdfjs mjs build
        const { getDocument } = await import('pdfjs-dist/build/pdf.mjs');

        // First call: simulate import-level failure then a successful retry
        vi.mocked(getDocument)
            .mockReturnValueOnce({ promise: Promise.reject(new Error('load failed')) } as any)
            .mockReturnValueOnce({
                promise: Promise.resolve({
                    numPages: 1,
                    getPage: vi.fn().mockResolvedValue({
                        getTextContent: vi.fn().mockResolvedValue({
                            items: [{ str: 'Retry succeeded' }],
                        }),
                    }),
                }),
            } as any);

        const first = await extractTextFromPdf(makeFile(VALID_PDF_BYTES));
        expect(first.error).toBeTruthy();

        const second = await extractTextFromPdf(makeFile(VALID_PDF_BYTES));
        expect(second.error).toBeUndefined();
        expect(second.text).toContain('Retry succeeded');
    });
});
