import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { SECTION_ORDER, SECTION_LABELS } from '../../constants/resumeSections';

interface EduEntry {
    institutionName?: string | null;
    degree?: string | null;
    major?: string | null;
    minor?: string | null;
    location?: string | null;
    startDate?: string | null;
    graduationYear?: string | null;
}
interface ExpEntry {
    jobTitle?: string | null;
    company?: string | null;
    location?: string | null;
    dates?: string | null;
    bullets?: string[] | null;
}
interface ProjEntry {
    title?: string | null;
    techStack?: string | null;
    dates?: string | null;
    bullets?: string[] | null;
}
interface Additional {
    languages?: string | null;
    frameworks?: string | null;
    developerTools?: string | null;
    libraries?: string | null;
}

function extractBullets(text: string): string[][] {
    return text.split(/\n\n+/).map(block =>
        block.split('\n')
            .filter(l => /^[-•]\s/.test(l.trim()))
            .map(l => l.replace(/^[-•]\s+/, '').trim())
    );
}

const styles = StyleSheet.create({
    page: {
        paddingTop: 36,
        paddingBottom: 36,
        paddingHorizontal: 40,
        fontFamily: 'Helvetica',
        backgroundColor: '#ffffff',
        color: '#000000',
    },
    name: {
        fontSize: 24,
        fontFamily: 'Helvetica-Bold',
        textAlign: 'center',
        marginBottom: 3,
    },
    contact: {
        fontSize: 9,
        textAlign: 'center',
        marginBottom: 10,
    },
    sectionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 10,
        marginBottom: 4,
    },
    sectionLabel: {
        fontSize: 11,
        fontFamily: 'Helvetica-Bold',
        letterSpacing: 1.5,
        textTransform: 'uppercase',
    },
    sectionRule: {
        flex: 1,
        borderBottomWidth: 0.75,
        borderBottomColor: '#000000',
        marginLeft: 6,
    },
    entryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 1,
    },
    entryTitle: {
        fontSize: 10,
        fontFamily: 'Helvetica-Bold',
    },
    entryRight: {
        fontSize: 9,
    },
    entrySub: {
        fontSize: 9,
        fontFamily: 'Helvetica-Oblique',
    },
    bullet: {
        fontSize: 9,
        lineHeight: 1.45,
        marginLeft: 16,
        marginBottom: 0,
    },
    skillLine: {
        fontSize: 9,
        lineHeight: 1.5,
        marginBottom: 1,
    },
    bold: {
        fontFamily: 'Helvetica-Bold',
    },
    italic: {
        fontFamily: 'Helvetica-Oblique',
    },
});

interface ResumePDFProps {
    candidateName: string;
    contactLine: string;
    generatedSections: Partial<Record<SectionKey, string>>;
    parsedData: ParsedResumeData | null;
}

const SectionHeading = ({ label }: { label: string }) => (
    <View style={styles.sectionRow}>
        <Text style={styles.sectionLabel}>{label}</Text>
        <View style={styles.sectionRule} />
    </View>
);

const ResumePDF = ({ candidateName, contactLine, generatedSections, parsedData }: ResumePDFProps) => {
    const edu = (parsedData?.education as { entries?: EduEntry[] } | null | undefined)?.entries ?? [];
    const exp = (parsedData?.experience as { entries?: ExpEntry[] } | null | undefined)?.entries ?? [];
    const proj = (parsedData?.projects as { entries?: ProjEntry[] } | null | undefined)?.entries ?? [];
    const add = parsedData?.additional as Additional | null | undefined;

    const expBullets = generatedSections.experience ? extractBullets(generatedSections.experience) : [];
    const projBullets = generatedSections.projects ? extractBullets(generatedSections.projects) : [];

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {/* Header */}
                <Text style={styles.name}>{candidateName}</Text>
                {contactLine ? <Text style={styles.contact}>{contactLine}</Text> : null}

                {SECTION_ORDER.map((key) => {
                    const content = generatedSections[key];

                    if (key === 'education') {
                        if (!edu.length && !content) return null;
                        return (
                            <View key={key}>
                                <SectionHeading label={SECTION_LABELS[key]} />
                                {edu.length > 0 ? edu.map((e, i) => {
                                    const degreeStr = [
                                        e.degree,
                                        e.major && `in ${e.major}`,
                                        e.minor && `Minor in ${e.minor}`,
                                    ].filter(Boolean).join(', ');
                                    const dateStr = [e.startDate, e.graduationYear].filter(Boolean).join(' – ');
                                    return (
                                        <View key={i} style={{ marginTop: i > 0 ? 4 : 0 }}>
                                            <View style={styles.entryRow}>
                                                <Text style={styles.entryTitle}>{e.institutionName ?? ''}</Text>
                                                <Text style={styles.entryRight}>{e.location ?? ''}</Text>
                                            </View>
                                            <View style={styles.entryRow}>
                                                <Text style={styles.entrySub}>{degreeStr}</Text>
                                                <Text style={styles.entrySub}>{dateStr}</Text>
                                            </View>
                                        </View>
                                    );
                                }) : <Text style={{ fontSize: 9, lineHeight: 1.45 }}>{content}</Text>}
                            </View>
                        );
                    }

                    if (key === 'experience') {
                        if (!exp.length && !content) return null;
                        return (
                            <View key={key}>
                                <SectionHeading label={SECTION_LABELS[key]} />
                                {exp.length > 0 ? exp.map((e, i) => {
                                    const bullets = (expBullets[i]?.length ? expBullets[i] : e.bullets) ?? [];
                                    return (
                                        <View key={i} style={{ marginTop: i > 0 ? 6 : 0 }}>
                                            <View style={styles.entryRow}>
                                                <Text style={styles.entryTitle}>{e.jobTitle ?? ''}</Text>
                                                <Text style={styles.entryRight}>{e.dates ?? ''}</Text>
                                            </View>
                                            <View style={styles.entryRow}>
                                                <Text style={styles.entrySub}>{e.company ?? ''}</Text>
                                                <Text style={styles.entrySub}>{e.location ?? ''}</Text>
                                            </View>
                                            {bullets.map((b, j) => (
                                                <Text key={j} style={styles.bullet}>• {b}</Text>
                                            ))}
                                        </View>
                                    );
                                }) : <Text style={{ fontSize: 9, lineHeight: 1.45 }}>{content}</Text>}
                            </View>
                        );
                    }

                    if (key === 'projects') {
                        if (!proj.length && !content) return null;
                        return (
                            <View key={key}>
                                <SectionHeading label={SECTION_LABELS[key]} />
                                {proj.length > 0 ? proj.map((e, i) => {
                                    const bullets = (projBullets[i]?.length ? projBullets[i] : e.bullets) ?? [];
                                    return (
                                        <View key={i} style={{ marginTop: i > 0 ? 6 : 0 }}>
                                            <View style={styles.entryRow}>
                                                <Text>
                                                    <Text style={styles.bold}>{e.title ?? ''}</Text>
                                                    <Text style={styles.italic}>{e.techStack ? ` | ${e.techStack}` : ''}</Text>
                                                </Text>
                                                <Text style={styles.entryRight}>{e.dates ?? ''}</Text>
                                            </View>
                                            {bullets.map((b, j) => (
                                                <Text key={j} style={styles.bullet}>• {b}</Text>
                                            ))}
                                        </View>
                                    );
                                }) : <Text style={{ fontSize: 9, lineHeight: 1.45 }}>{content}</Text>}
                            </View>
                        );
                    }

                    if (key === 'additional') {
                        if (!add && !content) return null;
                        const rows = [
                            { label: 'Languages', value: add?.languages },
                            { label: 'Frameworks', value: add?.frameworks },
                            { label: 'Developer Tools', value: add?.developerTools },
                            { label: 'Libraries', value: add?.libraries },
                        ].filter(r => r.value);
                        return (
                            <View key={key}>
                                <SectionHeading label={SECTION_LABELS[key]} />
                                {rows.length > 0 ? rows.map((r, i) => (
                                    <Text key={i} style={styles.skillLine}>
                                        <Text style={styles.bold}>{r.label}: </Text>
                                        <Text>{r.value}</Text>
                                    </Text>
                                )) : <Text style={{ fontSize: 9, lineHeight: 1.45 }}>{content}</Text>}
                            </View>
                        );
                    }

                    return null;
                })}
            </Page>
        </Document>
    );
};

export default ResumePDF;
