import { describe, it, expect } from 'vitest';
import { RESUME_SECTIONS, CATEGORY_SECTION_MAP, type SectionKey } from '../constants/resumeSections';

const ALL_SECTION_KEYS: SectionKey[] = ['education', 'experience', 'projects', 'additional'];
const ALL_CATEGORIES = ['toneAndStyle', 'content', 'structure', 'skills', 'ATS'];

describe('RESUME_SECTIONS', () => {
    it('contains all 4 section keys', () => {
        for (const key of ALL_SECTION_KEYS) {
            expect(RESUME_SECTIONS).toHaveProperty(key);
        }
    });

    it('has no empty section values', () => {
        for (const key of ALL_SECTION_KEYS) {
            const val = RESUME_SECTIONS[key as SectionKey];
            expect(val.trim().length).toBeGreaterThan(0);
        }
    });
});

describe('CATEGORY_SECTION_MAP', () => {
    it('covers all 5 grading categories', () => {
        for (const cat of ALL_CATEGORIES) {
            expect(CATEGORY_SECTION_MAP).toHaveProperty(cat);
            expect(CATEGORY_SECTION_MAP[cat].length).toBeGreaterThan(0);
        }
    });

    it('every mapped SectionKey exists in RESUME_SECTIONS', () => {
        for (const [, keys] of Object.entries(CATEGORY_SECTION_MAP)) {
            for (const key of keys) {
                expect(ALL_SECTION_KEYS).toContain(key);
            }
        }
    });
});
