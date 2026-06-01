export interface PdfTextResult {
    text: string;
    pageTexts: string[];
    error?: string;
}

let pdfjsLib: any = null;
let loadPromise: Promise<any> | null = null;

async function loadPdfJs(): Promise<any> {
    if (pdfjsLib) return pdfjsLib;
    if (loadPromise) return loadPromise;

    // @ts-expect-error - pdfjs-dist/build/pdf.mjs is not a module
    loadPromise = import("pdfjs-dist/build/pdf.mjs").then((lib) => {
        lib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
        pdfjsLib = lib;
        return lib;
    });

    return loadPromise;
}

export async function extractTextFromPdf(
    source: File | Blob | ArrayBuffer
): Promise<PdfTextResult> {
    try {
        const lib = await loadPdfJs();

        const arrayBuffer =
            source instanceof ArrayBuffer
                ? source
                : await (source as File | Blob).arrayBuffer();

        if (arrayBuffer.byteLength === 0) {
            return { text: "", pageTexts: [], error: "PDF file is empty" };
        }

        const pdf = await lib.getDocument({ data: arrayBuffer }).promise;
        const pageTexts: string[] = [];

        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const content = await page.getTextContent();
            const pageText = content.items
                .map((item: any) => ("str" in item ? item.str : ""))
                .join(" ")
                .replace(/\s+/g, " ")
                .trim();
            pageTexts.push(pageText);
        }

        const text = pageTexts.join("\n\n").trim();
        return { text, pageTexts };
    } catch (err: any) {
        if (err?.name === "PasswordException" || err?.code === 1) {
            return {
                text: "",
                pageTexts: [],
                error: "PDF is password-protected",
            };
        }
        return {
            text: "",
            pageTexts: [],
            error: `Failed to extract text: ${err}`,
        };
    }
}
