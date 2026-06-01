export interface PdfConversionResult {
    imageUrl: string;
    file: File | null;
    error?: string;
}

let pdfjsLib: any = null;
let isLoading = false;
let loadPromise: Promise<any> | null = null;

async function loadPdfJs(): Promise<any> {
    if (pdfjsLib) return pdfjsLib;
    if (loadPromise) return loadPromise;

    isLoading = true;
    // @ts-expect-error - pdfjs-dist/build/pdf.mjs is not a module
    loadPromise = import("pdfjs-dist/build/pdf.mjs").then((lib) => {
        // Set the worker source to use local file
        lib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
        pdfjsLib = lib;
        isLoading = false;
        return lib;
    });

    return loadPromise;
}

export async function convertPdfToImage(
    file: File
): Promise<PdfConversionResult> {
    try {
        console.log('[pdf] loading pdfjs...');
        const lib = await loadPdfJs();
        console.log('[pdf] pdfjs loaded, parsing arrayBuffer...');

        const arrayBuffer = await file.arrayBuffer();
        console.log('[pdf] arrayBuffer size:', arrayBuffer.byteLength, 'bytes');

        const pdf = await lib.getDocument({ data: arrayBuffer }).promise;
        console.log('[pdf] document loaded, pages:', pdf.numPages);

        const page = await pdf.getPage(1);
        const viewport = page.getViewport({ scale: 4 });
        console.log('[pdf] viewport:', viewport.width, 'x', viewport.height);

        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");
        console.log('[pdf] canvas context:', context ? 'ok' : 'NULL — canvas unsupported');

        canvas.width = viewport.width;
        canvas.height = viewport.height;

        if (context) {
            context.imageSmoothingEnabled = true;
            context.imageSmoothingQuality = "high";
        }

        await page.render({ canvasContext: context!, viewport }).promise;
        console.log('[pdf] render complete, calling toBlob...');

        return new Promise((resolve) => {
            canvas.toBlob(
                (blob) => {
                    if (blob) {
                        console.log('[pdf] blob created, size:', blob.size, 'bytes');
                        const originalName = file.name.replace(/\.pdf$/i, "");
                        const imageFile = new File([blob], `${originalName}.png`, {
                            type: "image/png",
                        });

                        resolve({
                            imageUrl: URL.createObjectURL(blob),
                            file: imageFile,
                        });
                    } else {
                        console.error('[pdf] toBlob returned null — canvas may be too large or unsupported');
                        resolve({
                            imageUrl: "",
                            file: null,
                            error: "Failed to create image blob",
                        });
                    }
                },
                "image/png",
                1.0
            ); // Set quality to maximum (1.0)
        });
    } catch (err) {
        console.error('[pdf] conversion threw:', err);
        return {
            imageUrl: "",
            file: null,
            error: `Failed to convert PDF: ${err}`,
        };
    }
}