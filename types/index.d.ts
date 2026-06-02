type SectionKey = 'education' | 'experience' | 'projects' | 'activities' | 'additional';

interface RewrittenSection {
    id: string;
    tipText: string;
    category: "toneAndStyle" | "content" | "structure" | "skills";
    originalSnippet: string;
    rewrittenText: string;
    acceptedAt: number;
    sectionKey?: SectionKey;
}

interface RewriteSession {
    inProgress: boolean;
    tipId: string;
    streamedText: string;
    error?: string;
}

interface Job {
    title: string;
    description: string;
    location: string;
    requiredSkills: string[];
}

interface Resume {
    id: string;
    companyName?: string;
    jobTitle?: string;
    jobDescription?: string;
    imagePath: string;
    resumePath: string;
    feedback: Feedback;
    rewrites?: RewrittenSection[];
    generatedSections?: Partial<Record<SectionKey, string>>;
}

interface Feedback {
    overallScore: number;
    ATS: {
        score: number;
        tips: {
            type: "good" | "improve";
            tip: string;
        }[];
    };
    toneAndStyle: {
        score: number;
        tips: {
            type: "good" | "improve";
            tip: string;
            explanation: string;
        }[];
    };
    content: {
        score: number;
        tips: {
            type: "good" | "improve";
            tip: string;
            explanation: string;
        }[];
    };
    structure: {
        score: number;
        tips: {
            type: "good" | "improve";
            tip: string;
            explanation: string;
        }[];
    };
    skills: {
        score: number;
        tips: {
            type: "good" | "improve";
            tip: string;
            explanation: string;
        }[];
    };
}
