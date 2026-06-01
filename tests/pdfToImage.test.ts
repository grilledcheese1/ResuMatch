import { describe, it, expect, vi, beforeEach } from 'vitest';
import { convertPdfToImage } from '../app/lib/pdfToImage';

// Minimal valid 1-page PDF as bytes
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

function makeFile(content: string | Uint8Array, name = 'resume.pdf', type = 'application/pdf'): File {
    const bytes = typeof content === 'string' ? new TextEncoder().encode(content) : content;
    return new File([bytes], name, { type });
}

// pdfjs-dist requires a real DOM + worker — mock it for unit tests
vi.mock('pdfjs-dist/build/pdf.mjs', () => ({
    GlobalWorkerOptions: { workerSrc: '' },
    getDocument: vi.fn(),
}));

describe('convertPdfToImage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('returns file and imageUrl for a valid PDF', async () => {
        const { getDocument } = await import('pdfjs-dist/build/pdf.mjs');
        const mockRender = vi.fn().mockReturnValue({ promise: Promise.resolve() });
        const mockGetPage = vi.fn().mockResolvedValue({
            getViewport: () => ({ width: 100, height: 100 }),
            render: mockRender,
        });
        vi.mocked(getDocument).mockReturnValue({
            promise: Promise.resolve({ numPages: 1, getPage: mockGetPage }),
        } as any);

        // jsdom canvas.toBlob is a no-op — patch it to return a blob
        HTMLCanvasElement.prototype.toBlob = function (cb) {
            cb(new Blob(['fake-image'], { type: 'image/png' }));
        };

        const result = await convertPdfToImage(makeFile(VALID_PDF_BYTES));
        expect(result.file).not.toBeNull();
        expect(result.imageUrl).not.toBe('');
        expect(result.error).toBeUndefined();
    });

    it('returns error when file is 0 bytes (empty file)', async () => {
        const { getDocument } = await import('pdfjs-dist/build/pdf.mjs');
        vi.mocked(getDocument).mockReturnValue({
            promise: Promise.reject(new Error('Invalid PDF structure')),
        } as any);

        const result = await convertPdfToImage(makeFile(new Uint8Array(0)));
        expect(result.file).toBeNull();
        expect(result.error).toMatch(/Failed to convert PDF/);
    });

    it('returns error when non-PDF bytes are passed', async () => {
        const { getDocument } = await import('pdfjs-dist/build/pdf.mjs');
        vi.mocked(getDocument).mockReturnValue({
            promise: Promise.reject(new Error('Invalid PDF structure')),
        } as any);

        const pngHeader = new Uint8Array([0x89, 0x50, 0x4e, 0x47]);
        const result = await convertPdfToImage(makeFile(pngHeader, 'fake.pdf'));
        expect(result.file).toBeNull();
        expect(result.error).toMatch(/Failed to convert PDF/);
    });

    it('returns error when canvas toBlob returns null (canvas too large)', async () => {
        const { getDocument } = await import('pdfjs-dist/build/pdf.mjs');
        const mockRender = vi.fn().mockReturnValue({ promise: Promise.resolve() });
        vi.mocked(getDocument).mockReturnValue({
            promise: Promise.resolve({
                numPages: 1,
                getPage: vi.fn().mockResolvedValue({
                    getViewport: () => ({ width: 99999, height: 99999 }),
                    render: mockRender,
                }),
            }),
        } as any);

        // Simulate browser refusing to create blob (canvas too large)
        HTMLCanvasElement.prototype.toBlob = function (cb) { cb(null); };

        const result = await convertPdfToImage(makeFile(VALID_PDF_BYTES));
        expect(result.file).toBeNull();
        expect(result.error).toBe('Failed to create image blob');
    });

    it('returns error for a password-protected PDF', async () => {
        const { getDocument } = await import('pdfjs-dist/build/pdf.mjs');
        vi.mocked(getDocument).mockReturnValue({
            promise: Promise.reject(new Error('PasswordException: Incorrect password')),
        } as any);

        const result = await convertPdfToImage(makeFile(VALID_PDF_BYTES, 'protected.pdf'));
        expect(result.file).toBeNull();
        expect(result.error).toMatch(/Failed to convert PDF/);
    });
});
