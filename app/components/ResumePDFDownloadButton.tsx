import { usePDF } from '@react-pdf/renderer';
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
}: ResumePDFDownloadButtonProps) => {
    const [instance] = usePDF({
        document: (
            <ResumePDF
                candidateName={candidateName}
                contactLine={contactLine}
                generatedSections={generatedSections}
            />
        ),
    });

    const handleClick = () => {
        if (!instance.url) return;
        const a = document.createElement('a');
        a.href = instance.url;
        a.download = `${candidateName || 'resume'}.pdf`;
        a.click();
    };

    return (
        <button
            className="primary-button w-full text-sm font-semibold cursor-pointer"
            disabled={instance.loading}
            onClick={handleClick}
        >
            {instance.loading ? 'Preparing PDF…' : '↓ Download as PDF'}
        </button>
    );
};

export default ResumePDFDownloadButton;
