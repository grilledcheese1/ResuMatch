export type SectionKey = 'education' | 'experience' | 'projects' | 'activities' | 'additional';

export const SECTION_LABELS: Record<SectionKey, string> = {
    education: 'Education',
    experience: 'Experience',
    projects: 'University Projects',
    activities: 'Activities',
    additional: 'Additional',
};

export const RESUME_SECTIONS: Record<SectionKey, string> = {
    education: `[UNIVERSITY/COLLEGE NAME] — Bachelor of Science in [Major] | [Location] | [Year of Graduation]
GPA: [Your GPA, if above 3.0]
Relevant coursework: [List any specific courses relevant to the job]

[YOUR HIGH SCHOOL NAME] | [City, State] | [Year of Graduation]
Include any honors, awards, or extracurricular activities if applicable. If you have pursued any specialized coursework or achieved notable academic accomplishments during high school.`,

    experience: `[JOB TITLE] | [Company Name] | [Location] | [Dates of Employment]
• Spearheaded [specific project or initiative], resulting in [quantifiable achievement].
• Collaborated with cross-functional teams to [accomplishment or task].
• Implemented [strategy or process improvement], leading to [positive outcome].
• Managed [specific responsibility or duty], ensuring [desired outcome].

[JOB TITLE] | [Company Name] | [Location] | [Dates of Employment]
• Spearheaded [specific project or initiative], resulting in [quantifiable achievement].
• Collaborated with cross-functional teams to [accomplishment or task].
• Implemented [strategy or process improvement], leading to [positive outcome].
• Managed [specific responsibility or duty], ensuring [desired outcome].`,

    projects: `[PROJECT TITLE] | [Dates]
Description: Brief overview of the project and its objectives.
Role: Your specific role or contribution to the project.
Technologies Used: Any tools, software, or programming languages utilized.
Outcome: Results achieved or lessons learned from the project.`,

    activities: `[ACTIVITY NAME] | [Dates]
Description/Role: Brief overview of the activity and your role.
Skills Developed: Any skills or qualities honed through participation.
Achievements: Any notable achievements or leadership roles within the activity.`,

    additional: `Language Skills: [List any languages you speak fluently or proficiently.]
Technical Skills: [List any relevant technical skills or software proficiencies.]
Volunteer Experience: [Briefly mention any volunteer work you've done, highlighting skills or experiences gained.]
Interests/Hobbies: [Include any interests or hobbies that demonstrate relevant skills or qualities, or provide insight into your personality.]`,
};

export const CATEGORY_SECTION_MAP: Record<string, SectionKey[]> = {
    toneAndStyle: ['experience', 'projects', 'activities'],
    content:      ['experience', 'projects', 'additional'],
    structure:    ['education', 'experience', 'projects', 'activities', 'additional'],
    skills:       ['additional', 'experience'],
    ATS:          ['experience', 'additional'],
};

export const SECTION_ORDER: SectionKey[] = ['education', 'experience', 'projects', 'activities', 'additional'];
