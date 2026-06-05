export type SectionKey = 'education' | 'experience' | 'projects' | 'additional';

export const SECTION_LABELS: Record<SectionKey, string> = {
    education: 'Education',
    experience: 'Experience',
    projects: 'Projects',
    additional: 'Additional',
};

export const RESUME_SECTIONS: Record<SectionKey, string> = {
    education: `[INSTITUTION NAME] [Location]
[Degree] in [Major], Minor in [Minor] [Start Date] – [End Date]

[SECOND INSTITUTION NAME] [Location]
[Degree] in [Major] [Start Date] – [End Date]`,

    experience: `[JOB TITLE] [Start Date] – [End Date]
[Company Name] [Location]
- Specific achievement or responsibility with measurable outcome.
- Specific achievement or responsibility with measurable outcome.
- Specific achievement or responsibility with measurable outcome.`,

    projects: `[Project Title] | [Tech Stack] | [Dates]
- What was built and the core technical approach.
- A specific implementation detail or integration.
- Outcome, scale, or impact (downloads, users, performance).`,

    additional: `Languages: [list]
Frameworks: [list]
Developer Tools: [list]
Libraries: [list]`,
};

export const CATEGORY_SECTION_MAP: Record<string, SectionKey[]> = {
    toneAndStyle: ['experience', 'projects'],
    content:      ['experience', 'projects', 'additional'],
    structure:    ['education', 'experience', 'projects', 'additional'],
    skills:       ['additional', 'experience'],
    ATS:          ['experience', 'additional'],
};

export const SECTION_ORDER: SectionKey[] = ['education', 'experience', 'projects', 'additional'];
