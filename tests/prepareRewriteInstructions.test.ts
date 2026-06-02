import { describe, it, expect } from 'vitest';
import { prepareFullSectionInstructions } from '../constants';

describe('prepareFullSectionInstructions', () => {
    const base = {
        resumeText: 'Software Engineer with 5 years experience in TypeScript and React.',
        sectionKey: 'experience',
        sectionTemplate: 'Experience\n[JOB TITLE] | [Company Name]\n• Bullet point',
        improvementTips: ['Strengthen impact verbs', 'Add quantifiable achievements'],
        jobTitle: 'Senior Frontend Engineer',
        jobDescription: 'Looking for someone experienced in React and performance optimization.',
    };

    it('interpolates all fields into the prompt', () => {
        const prompt = prepareFullSectionInstructions(base);
        expect(prompt).toContain(base.sectionKey);
        expect(prompt).toContain(base.jobTitle);
        expect(prompt).toContain(base.jobDescription);
        expect(prompt).toContain(base.resumeText);
        expect(prompt).toContain(base.sectionTemplate);
    });

    it('includes improvement tips when provided', () => {
        const prompt = prepareFullSectionInstructions(base);
        expect(prompt).toContain('Strengthen impact verbs');
        expect(prompt).toContain('Add quantifiable achievements');
        expect(prompt).toContain('Apply these improvements');
    });

    it('uses maintain message when no tips provided', () => {
        const prompt = prepareFullSectionInstructions({ ...base, improvementTips: [] });
        expect(prompt).toContain('Maintain and strengthen the existing content.');
        expect(prompt).not.toContain('Apply these improvements');
    });

    it('truncates resume text at 4000 chars', () => {
        const longText = 'x'.repeat(6000);
        const prompt = prepareFullSectionInstructions({ ...base, resumeText: longText });
        expect(prompt).toContain('x'.repeat(4000));
        expect(prompt).not.toContain('x'.repeat(4001));
    });

    it('still returns a valid prompt when jobDescription is empty', () => {
        const prompt = prepareFullSectionInstructions({ ...base, jobDescription: '' });
        expect(prompt.length).toBeGreaterThan(50);
        expect(prompt).toContain(base.sectionKey);
    });

    it('still returns a valid prompt when jobTitle is empty', () => {
        const prompt = prepareFullSectionInstructions({ ...base, jobTitle: '' });
        expect(prompt.length).toBeGreaterThan(50);
    });
});
