import { describe, it, expect } from 'vitest';
import { prepareRewriteInstructions } from '../constants';

describe('prepareRewriteInstructions', () => {
    const base = {
        resumeText: 'Software Engineer with 5 years experience in TypeScript and React.',
        tip: 'Strengthen impact verbs in the experience section',
        category: 'content',
        jobTitle: 'Senior Frontend Engineer',
        jobDescription: 'Looking for someone experienced in React and performance optimization.',
    };

    it('interpolates all fields into the prompt', () => {
        const prompt = prepareRewriteInstructions(base);
        expect(prompt).toContain(base.tip);
        expect(prompt).toContain(base.category);
        expect(prompt).toContain(base.jobTitle);
        expect(prompt).toContain(base.jobDescription);
        expect(prompt).toContain(base.resumeText);
    });

    it('truncates resume text at 3000 chars', () => {
        const longText = 'x'.repeat(5000);
        const prompt = prepareRewriteInstructions({ ...base, resumeText: longText });
        // The truncated slice should appear, not the full string
        expect(prompt).toContain('x'.repeat(3000));
        expect(prompt).not.toContain('x'.repeat(3001));
    });

    it('still returns a valid prompt when jobDescription is empty', () => {
        const prompt = prepareRewriteInstructions({ ...base, jobDescription: '' });
        expect(prompt.length).toBeGreaterThan(50);
        expect(prompt).toContain(base.tip);
    });

    it('still returns a valid prompt when jobTitle is empty', () => {
        const prompt = prepareRewriteInstructions({ ...base, jobTitle: '' });
        expect(prompt.length).toBeGreaterThan(50);
    });
});
