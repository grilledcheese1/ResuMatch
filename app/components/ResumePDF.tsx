import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { SECTION_ORDER, SECTION_LABELS } from '../../constants/resumeSections';

const styles = StyleSheet.create({
    page: {
        paddingTop: 40,
        paddingBottom: 40,
        paddingHorizontal: 48,
        fontFamily: 'Helvetica',
        backgroundColor: '#ffffff',
        color: '#000000',
    },
    header: {
        marginBottom: 10,
        alignItems: 'center',
    },
    name: {
        fontSize: 18,
        fontFamily: 'Helvetica-Bold',
        textAlign: 'center',
        marginBottom: 3,
    },
    contact: {
        fontSize: 9,
        color: '#444444',
        textAlign: 'center',
        marginBottom: 8,
    },
    headerDivider: {
        borderBottomWidth: 1,
        borderBottomColor: '#000000',
        marginBottom: 10,
    },
    section: {
        marginBottom: 10,
    },
    sectionLabel: {
        fontSize: 10,
        fontFamily: 'Helvetica-Bold',
        textTransform: 'uppercase',
        marginBottom: 2,
        letterSpacing: 0.5,
    },
    sectionDivider: {
        borderBottomWidth: 0.5,
        borderBottomColor: '#000000',
        marginBottom: 4,
    },
    sectionContent: {
        fontSize: 9,
        lineHeight: 1.6,
        color: '#000000',
    },
});

interface ResumePDFProps {
    candidateName: string;
    contactLine: string;
    generatedSections: Partial<Record<SectionKey, string>>;
}

const ResumePDF = ({ candidateName, contactLine, generatedSections }: ResumePDFProps) => (
    <Document>
        <Page size="A4" style={styles.page}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.name}>{candidateName}</Text>
                {contactLine ? <Text style={styles.contact}>{contactLine}</Text> : null}
            </View>
            <View style={styles.headerDivider} />

            {/* Sections */}
            {SECTION_ORDER.map((key) => {
                const content = generatedSections[key];
                if (!content) return null;
                return (
                    <View key={key} style={styles.section}>
                        <Text style={styles.sectionLabel}>{SECTION_LABELS[key]}</Text>
                        <View style={styles.sectionDivider} />
                        <Text style={styles.sectionContent}>{content}</Text>
                    </View>
                );
            })}
        </Page>
    </Document>
);

export default ResumePDF;
