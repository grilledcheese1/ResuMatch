import { PDFDownloadLink } from '@react-pdf/renderer';
import ResumePDF from './ResumePDF';

interface ResumePDFDownloadButtonProps {
    candidateName: string;
    contactLine: string;
    generatedSections: Partial<Record<SectionKey, string>>;
}

const ResumePDFDownloadButton = ({
    candidateName,
    contactLine,
    generatedSections,
}: ResumePDFDownloadButtonProps) => (
    <PDFDownloadLink
        document={
            <ResumePDF
                candidateName={candidateName}
                contactLine={contactLine}
                generatedSections={generatedSections}
            />
        }
        fileName={`${candidateName || 'resume'}.pdf`}
    >
        {({ loading }) => (
            <button
                className="primary-button w-full text-sm font-semibold cursor-pointer"
                disabled={loading}
            >
                {loading ? 'Preparing PDF…' : '↓ Download as PDF'}
            </button>
        )}
    </PDFDownloadLink>
);

export default ResumePDFDownloadButton;
