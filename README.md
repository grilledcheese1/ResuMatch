# ResuMatch

AI-powered resume analyzer and formatter.

## About

ResuMatch lets you upload a PDF resume, receive an ATS score with structured feedback
across tone, content, structure, and skills, then generate a reformatted version of your
resume matched to a specific job description.

The generation pipeline runs in two phases. Phase 1 uses an LLM to parse raw PDF text
into a structured JSON object, extracting education entries, experience entries, projects,
and technical skills. Phase 2 iterates over each resume section and runs a per-section
LLM rewrite using the parsed data and the target job description as context. ATS feedback
from the initial scoring pass is injected into each section prompt to guide improvements.

The rendered output uses a hybrid approach: structured metadata (job titles, company names,
dates, institution names) comes from the Phase 1 JSON parse, while rewritten bullet content
comes from Phase 2 LLM output. The final layout follows the Jake Ryan resume template.
Download is handled entirely client-side via @react-pdf/renderer.

## Features

- PDF upload with ATS scoring and category feedback (tone, content, structure, skills)
- Two-phase generation pipeline: structured parse then per-section LLM rewrite
- Hybrid rendering: structured metadata from JSON parse, rewritten bullets from LLM output
- Jake Ryan-style resume layout with inline section rules, two-column entry rows
- Downloadable PDF output via @react-pdf/renderer
- Incremental generation with per-section KV persistence (survives page reload)

## Tech Stack

| | |
|---|---|
| React Router v7 | TypeScript |
| Tailwind CSS | Puter.js (auth, filesystem, KV, AI proxy) |
| @react-pdf/renderer | GSAP |

## Acknowledgements

Originally scaffolded from [JavaScript Mastery's tutorial](https://www.youtube.com/@javascriptmastery),
extended with a typed JSON parse pipeline, hybrid structured rendering, ATS feedback
injection, and Jake Ryan template support.
