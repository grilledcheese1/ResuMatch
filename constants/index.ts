export const resumes: Resume[] = [
    {
        id: "1",
        companyName: "Google",
        jobTitle: "Frontend Developer",
        imagePath: "/images/resume_01.png",
        resumePath: "/resumes/resume-1.pdf",
        feedback: {
            overallScore: 85,
            ATS: {
                score: 90,
                tips: [],
            },
            toneAndStyle: {
                score: 90,
                tips: [],
            },
            content: {
                score: 90,
                tips: [],
            },
            structure: {
                score: 90,
                tips: [],
            },
            skills: {
                score: 90,
                tips: [],
            },
        },
    },
    {
        id: "2",
        companyName: "Microsoft",
        jobTitle: "Cloud Engineer",
        imagePath: "/images/resume_02.png",
        resumePath: "/resumes/resume-2.pdf",
        feedback: {
            overallScore: 55,
            ATS: {
                score: 90,
                tips: [],
            },
            toneAndStyle: {
                score: 90,
                tips: [],
            },
            content: {
                score: 90,
                tips: [],
            },
            structure: {
                score: 90,
                tips: [],
            },
            skills: {
                score: 90,
                tips: [],
            },
        },
    },
    {
        id: "3",
        companyName: "Apple",
        jobTitle: "iOS Developer",
        imagePath: "/images/resume_03.png",
        resumePath: "/resumes/resume-3.pdf",
        feedback: {
            overallScore: 75,
            ATS: {
                score: 90,
                tips: [],
            },
            toneAndStyle: {
                score: 90,
                tips: [],
            },
            content: {
                score: 90,
                tips: [],
            },
            structure: {
                score: 90,
                tips: [],
            },
            skills: {
                score: 90,
                tips: [],
            },
        },
    },
];

export const AIResponseFormat = `
      interface Feedback {
      overallScore: number; //max 100
      ATS: {
        score: number; //rate based on ATS suitability
        tips: {
          type: "good" | "improve";
          tip: string; //give 3-4 tips
        }[];
      };
      toneAndStyle: {
        score: number; //max 100
        tips: {
          type: "good" | "improve";
          tip: string; //make it a short "title" for the actual explanation
          explanation: string; //explain in detail here
        }[]; //give 3-4 tips
      };
      content: {
        score: number; //max 100
        tips: {
          type: "good" | "improve";
          tip: string; //make it a short "title" for the actual explanation
          explanation: string; //explain in detail here
        }[]; //give 3-4 tips
      };
      structure: {
        score: number; //max 100
        tips: {
          type: "good" | "improve";
          tip: string; //make it a short "title" for the actual explanation
          explanation: string; //explain in detail here
        }[]; //give 3-4 tips
      };
      skills: {
        score: number; //max 100
        tips: {
          type: "good" | "improve";
          tip: string; //make it a short "title" for the actual explanation
          explanation: string; //explain in detail here
        }[]; //give 3-4 tips
      };
    }`;

export const prepareParseResumeInstructions = ({
    resumeText,
}: {
    resumeText: string;
}) =>
    `You are a resume data extractor. Parse the following resume text into a structured JSON object. Extract every detail faithfully — do not summarize, condense, or omit any specific technology names, metrics, or implementation details.

Resume text:
---
${resumeText.slice(0, 8000)}
---

Return ONLY a valid JSON object (no markdown, no backticks, no explanation) with this exact structure:

{
  "name": "Full name of the candidate",
  "contact": "Single contact line: address, phone, email, and any profile URLs",
  "education": {
    "entries": [
      {
        "institutionName": "...",
        "degree": "...",
        "major": "...",
        "minor": "...",
        "location": "...",
        "startDate": "...",
        "graduationYear": "...",
        "gpa": "...",
        "coursework": "...",
        "honors": "..."
      }
    ]
  },
  "experience": {
    "entries": [
      {
        "jobTitle": "...",
        "company": "...",
        "location": "...",
        "dates": "...",
        "bullets": ["Preserve each bullet point exactly as written, including all specific technologies, metrics, and tool names mentioned"]
      }
    ]
  },
  "projects": {
    "entries": [
      {
        "title": "...",
        "techStack": "...",
        "dates": "...",
        "bullets": ["Each distinct implementation detail as its own bullet — never merge multiple technical layers into one sentence"]
      }
    ]
  },
  "additional": {
    "languages": "...",
    "frameworks": "...",
    "developerTools": "...",
    "libraries": "..."
  }
}

Critical rules:
- For projects[].techStack: extract the inline tech stack exactly as listed next to the project title — do not infer from bullets.
- For projects[].bullets: each bullet is its own array entry; never merge.
- For education[].entries: if multiple institutions are present, create a separate entry for each.
- For additional: split into Languages, Frameworks, Developer Tools, Libraries subcategories exactly as labeled; null if absent.
- Activities field has been removed — do not include it.
- For experience[].bullets: copy bullet text verbatim — do not paraphrase or shorten.
- If a field is absent from the resume, use null. Return only the JSON.`;

export const prepareFormatSectionInstructions = ({
    sectionKey,
    sectionData,
    resumeText,
    template,
    jobTitle,
    jobDescription,
}: {
    sectionKey: string;
    sectionData: string | null;
    resumeText: string;
    template: string;
    jobTitle: string;
    jobDescription: string;
}) => {
    const dataBlock = sectionData
        ? `Structured data extracted from the resume for this section:\n${sectionData}`
        : `No structured data available — use the raw resume text below:\n${resumeText.slice(0, 3000)}`;

    return `You are an expert resume writer.
Format the "${sectionKey}" section of a professional resume.

Job the candidate is applying for:
- Title: ${jobTitle}
- Description: ${jobDescription}

${dataBlock}

Section template to follow (structure reference only — do not copy placeholder text into output):
---
${template}
---

Rules:
- Output ONLY the section content — no headings, no markdown backticks, no preamble
- Fill placeholders only when the data exists in the candidate\'s information above; do not invent or fabricate missing fields — omit any line whose data is unavailable
- Use • for bullet points
- Plain text only, no bold/italic markdown
- Match the template structure for fields that are present; omit fields entirely when data is absent
- Keep the section concise and appropriate for a one-page resume
- NEVER output explanatory text about missing data — if a section has no content, output a single dash "-" and nothing else
- For the projects section specifically: the title line must follow the format "[Project Title] | [Tech Stack] | [Dates]" — never put tech stack on its own line or inside bullets`;
};

export const prepareInstructions = ({
                                        jobTitle,
                                        jobDescription,
                                    }: {
    jobTitle: string;
    jobDescription: string;
}) =>
    `You are an expert in ATS (Applicant Tracking System) and resume analysis.
  Please analyze and rate this resume and suggest how to improve it.
  The rating can be low if the resume is bad.
  Be thorough and detailed. Don't be afraid to point out any mistakes or areas for improvement.
  If there is a lot to improve, don't hesitate to give low scores. This is to help the user to improve their resume.
  If available, use the job description for the job user is applying to to give more detailed feedback.
  If provided, take the job description into consideration.
  The job title is: ${jobTitle}
  The job description is: ${jobDescription}
  Provide the feedback using the following format: ${AIResponseFormat}
  Return the analysis as a JSON object, without any other text and without the backticks.
  Do not include any other text or comments.`;