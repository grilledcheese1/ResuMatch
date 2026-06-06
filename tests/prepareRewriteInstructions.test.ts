import { describe, it, expect } from 'vitest';
import { prepareParseResumeInstructions, prepareFormatSectionInstructions } from '../constants';

describe('prepareParseResumeInstructions', () => {
    const resumeText = 'John Smith\njohn@email.com • 555-555-5555\n\nExperience\nSoftware Engineer at TechCorp\n• Built features\n• Led team projects';

    it('includes the resume text in the prompt', () => {
        const prompt = prepareParseResumeInstructions({ resumeText });
        expect(prompt).toContain('John Smith');
        expect(prompt).toContain('john@email.com');
    });

    it('truncates resume text at 8000 chars', () => {
        const longText = 'x'.repeat(9000);
        const prompt = prepareParseResumeInstructions({ resumeText: longText });
        expect(prompt).toContain('x'.repeat(8000));
        expect(prompt).not.toContain('x'.repeat(8001));
    });

    it('instructs the AI to return only JSON', () => {
        const prompt = prepareParseResumeInstructions({ resumeText });
        expect(prompt).toContain('Return ONLY a valid JSON object');
        expect(prompt).toContain('no markdown');
        expect(prompt).toContain('no backticks');
    });

    it('includes all required section keys in the schema', () => {
        const prompt = prepareParseResumeInstructions({ resumeText });
        expect(prompt).toContain('"education"');
        expect(prompt).toContain('"experience"');
        expect(prompt).toContain('"projects"');
        expect(prompt).toContain('"additional"');
        expect(prompt).toContain('"name"');
        expect(prompt).toContain('"contact"');
    });

    it('still returns a valid prompt for empty resume text', () => {
        const prompt = prepareParseResumeInstructions({ resumeText: '' });
        expect(prompt.length).toBeGreaterThan(100);
        expect(prompt).toContain('Return ONLY a valid JSON object');
    });
});

describe('prepareFormatSectionInstructions', () => {
    const base = {
        sectionKey: 'experience',
        sectionData: JSON.stringify({ entries: [{ jobTitle: 'Engineer', company: 'TechCorp', dates: '2022-2024', bullets: ['Built X'] }] }),
        resumeText: 'John Smith\nSoftware Engineer at TechCorp 2022-2024',
        template: 'Experience\n[JOB TITLE] | [Company Name]\n• Bullet point',
        jobTitle: 'Senior Frontend Engineer',
        jobDescription: 'React and TypeScript experience required.',
    };

    it('interpolates all fields into the prompt', () => {
        const prompt = prepareFormatSectionInstructions(base);
        expect(prompt).toContain(base.sectionKey);
        expect(prompt).toContain(base.jobTitle);
        expect(prompt).toContain(base.jobDescription);
        expect(prompt).toContain(base.template);
    });

    it('uses structured section data when provided', () => {
        const prompt = prepareFormatSectionInstructions(base);
        expect(prompt).toContain('Structured data extracted from the resume');
        expect(prompt).toContain('TechCorp');
        expect(prompt).not.toContain('No structured data available');
    });

    it('falls back to raw resume text when sectionData is null', () => {
        const prompt = prepareFormatSectionInstructions({ ...base, sectionData: null });
        expect(prompt).toContain('No structured data available');
        expect(prompt).toContain(base.resumeText);
        expect(prompt).not.toContain('Structured data extracted');
    });

    it('truncates resumeText fallback at 3000 chars', () => {
        const longText = 'y'.repeat(5000);
        const prompt = prepareFormatSectionInstructions({ ...base, sectionData: null, resumeText: longText });
        expect(prompt).toContain('y'.repeat(3000));
        expect(prompt).not.toContain('y'.repeat(3001));
    });

    it('still returns a valid prompt when jobTitle and jobDescription are empty', () => {
        const prompt = prepareFormatSectionInstructions({ ...base, jobTitle: '', jobDescription: '' });
        expect(prompt.length).toBeGreaterThan(100);
        expect(prompt).toContain(base.sectionKey);
    });

    it('injects atsTips as a JSON block when provided', () => {
        const tips = ['Use stronger action verbs', 'Quantify achievements with metrics'];
        const prompt = prepareFormatSectionInstructions({ ...base, atsTips: tips });
        expect(prompt).toContain('ATS improvement guidance');
        expect(prompt).toContain('Use stronger action verbs');
        expect(prompt).toContain('Quantify achievements with metrics');
    });

    it('omits ATS block entirely when atsTips is empty or undefined', () => {
        const promptEmpty = prepareFormatSectionInstructions({ ...base, atsTips: [] });
        const promptUndefined = prepareFormatSectionInstructions({ ...base });
        expect(promptEmpty).not.toContain('ATS improvement guidance');
        expect(promptUndefined).not.toContain('ATS improvement guidance');
    });
});
