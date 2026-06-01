import {type ClassValue, clsx} from "clsx";
import {twMerge} from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export function formatSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];

    // Determine the appropriate unit by calculating the log
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    // Format with 2 decimal places and round
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export const generateUUID = () => crypto.randomUUID();

export const SCORE_STRONG_THRESHOLD = 70;
export const SCORE_MODERATE_THRESHOLD = 50;

const STOP_WORDS = new Set([
    'with','your','that','this','from','have','more','will','what',
    'when','which','their','about','should','would','could','there',
    'these','those','being','make','some','into','than','then','also',
]);

export function findRelevantSnippet(resumeText: string, query: string, windowSize = 600): string {
    if (!resumeText) return '';

    const words = query
        .toLowerCase()
        .replace(/[^a-z\s]/g, ' ')
        .split(/\s+/)
        .filter(w => w.length > 3 && !STOP_WORDS.has(w))
        .sort((a, b) => b.length - a.length); // prefer longer, more specific words

    if (!words.length) return resumeText.slice(0, windowSize);

    const lower = resumeText.toLowerCase();
    let bestIdx = -1;

    for (const word of words) {
        const idx = lower.indexOf(word);
        if (idx !== -1) {
            bestIdx = idx;
            break; // first match on longest word wins
        }
    }

    if (bestIdx === -1) return resumeText.slice(0, windowSize);

    const start = Math.max(0, bestIdx - Math.floor(windowSize / 3));
    const end = Math.min(resumeText.length, start + windowSize);
    return resumeText.slice(start, end).trim();
}