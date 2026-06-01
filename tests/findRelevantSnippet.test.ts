import { describe, it, expect } from 'vitest';
import { findRelevantSnippet } from '../app/lib/utils';

const RESUME = `John Smith | john@email.com | LinkedIn
SUMMARY
Experienced software engineer with expertise in TypeScript and React.
EXPERIENCE
Senior Frontend Engineer at Acme Corp (2021-Present)
Led migration from Angular to React, improving page load by 40%.
Managed team of 5 engineers and delivered quarterly OKRs.
SKILLS
TypeScript, React, Node.js, GraphQL, PostgreSQL
EDUCATION
B.S. Computer Science, State University, 2018`;

describe('findRelevantSnippet', () => {
    it('returns a window centered around a matched keyword', () => {
        const snippet = findRelevantSnippet(RESUME, 'TypeScript React skills section');
        expect(snippet).toContain('TypeScript');
    });

    it('falls back to first windowSize chars when no keyword matches', () => {
        const snippet = findRelevantSnippet(RESUME, 'xyz123 nonexistent term', 100);
        expect(snippet).toBe(RESUME.slice(0, 100).trim());
    });

    it('returns empty string for empty resumeText', () => {
        expect(findRelevantSnippet('', 'anything')).toBe('');
    });

    it('filters stop words and prefers longer specific keywords', () => {
        // "with" is a stop word — should not match; "migration" should
        const snippet = findRelevantSnippet(RESUME, 'with Angular migration improvements');
        expect(snippet.toLowerCase()).toContain('migration');
    });

    it('does not exceed resume text bounds', () => {
        const snippet = findRelevantSnippet(RESUME, 'education university', 600);
        expect(snippet.length).toBeLessThanOrEqual(RESUME.length);
    });

    it('handles a query made entirely of stop words by falling back', () => {
        const snippet = findRelevantSnippet(RESUME, 'with that this from', 50);
        expect(snippet).toBe(RESUME.slice(0, 50).trim());
    });
});
