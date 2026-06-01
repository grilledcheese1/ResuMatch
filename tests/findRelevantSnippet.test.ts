import { describe, it, expect } from 'vitest';
import { findRelevantSnippet } from '../app/lib/utils';

const RESUME = `John Doe — Software Engineer
Experience: 5 years building scalable web applications with React and TypeScript.
Led performance optimization initiatives reducing load time by 40%.
Proficient in Node.js, GraphQL, and cloud infrastructure on AWS.
Education: B.S. Computer Science, State University 2019.
Skills: TypeScript, React, Node.js, GraphQL, AWS, Docker, Kubernetes.`;

describe('findRelevantSnippet', () => {
    it('returns a window centered around a keyword match', () => {
        const snippet = findRelevantSnippet(RESUME, 'performance optimization', 200);
        expect(snippet).toContain('performance optimization');
    });

    it('falls back to first N chars when no keyword matches', () => {
        const snippet = findRelevantSnippet(RESUME, 'quantum blockchain metaverse', 200);
        expect(snippet).toBe(RESUME.slice(0, 200).trim());
    });

    it('returns empty string for empty resumeText', () => {
        expect(findRelevantSnippet('', 'anything')).toBe('');
    });

    it('filters stop words and prefers longer specific keywords', () => {
        // "with" and "your" are stop words; "typescript" is the meaningful term
        const snippet = findRelevantSnippet(RESUME, 'with your typescript', 200);
        expect(snippet).toContain('TypeScript');
    });

    it('window does not exceed text bounds', () => {
        const short = 'Hello world';
        const snippet = findRelevantSnippet(short, 'hello', 600);
        expect(snippet.length).toBeLessThanOrEqual(short.length);
    });

    it('falls back to first N chars when all query words are stop words', () => {
        const snippet = findRelevantSnippet(RESUME, 'with your that this', 100);
        expect(snippet).toBe(RESUME.slice(0, 100).trim());
    });
});
