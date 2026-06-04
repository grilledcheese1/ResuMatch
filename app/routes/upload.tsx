import {type FormEvent, useEffect, useState} from 'react'
import React from 'react'
import Navbar from "~/components/Navbar";
import FileUploader from "~/components/FileUploader";
import {usePuterStore} from "~/lib/puter";
import {useNavigate} from "react-router";
import {convertPdfToImage} from "~/lib/pdfToImage";
import {generateUUID} from "~/lib/utils";
import {AIResponseFormat, prepareInstructions} from "../../constants";

const Upload = () => {
  const { auth, isLoading, fs, ai, kv } = usePuterStore();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusText, setStatusText] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isLoading && !auth.isAuthenticated) navigate('/auth?next=/upload');
  }, [isLoading, auth.isAuthenticated]);

  const handleAnalyze = async ({ companyName, jobTitle, jobDescription, file} : { companyName : string, jobTitle : string, jobDescription : string, file : File} ) => {
    setIsProcessing(true);
    setError('');
    setStatusText('Uploading file...');
    try {
      const uploadedFile = await fs.upload([file]);
      if(!uploadedFile) throw new Error('No file uploaded');

      setStatusText('Converting to image...');
      const imageFile = await convertPdfToImage(file);
      if(!imageFile.file) throw new Error('Failed to convert PDF to image');

      setStatusText('Uploading the image...');
      const uploadedImage = await fs.upload([imageFile.file]);
      if(!uploadedImage) throw new Error('Failed to upload image');

      setStatusText('Preparing data...');

      const uuid = generateUUID();
      const data = {
        id: uuid,
        resumePath: uploadedFile.path,
        imagePath: uploadedImage.path,
        companyName: companyName,
        jobTitle: jobTitle,
        jobDescription: jobDescription,
        feedback: '',
      }
      await kv.set(`resume:${uuid}`, JSON.stringify(data));

      setStatusText('Analyzing...');

      const feedback = await ai.feedback(
          uploadedImage.path,
          prepareInstructions({jobTitle, jobDescription}),
      )
      if(!feedback) throw new Error('Failed to analyze resume');

      const feedbackText = typeof feedback.message.content === 'string' ?
          feedback.message.content :
          feedback.message.content[0].text;

      data.feedback = JSON.parse(feedbackText);
      await kv.set(`resume:${uuid}`, JSON.stringify(data));
      setStatusText('Analysis completed, redirecting');
      navigate(`/resume/${uuid}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsProcessing(false);
    }
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget.closest('form');
    if(!form) return;
    const formData = new FormData(form);

    const companyName = formData.get('company-name') as string;
    const jobTitle = formData.get('job-title') as string;
    const jobDescription = formData.get('job-description') as string;

    if(!file) return;

    await handleAnalyze({ companyName, jobTitle, jobDescription, file});
  }

  const [file, setFile] = useState<File | null>(null)

  const handleFileSelect = (file: File | null) => {
    setFile(file)
  }

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <img src="/images/resume-scan-2.gif" className="w-[200px]" />
    </div>
  );

  return (
      <main className="bg-white !pt-0">
      <Navbar />

        <section className="main-section">
          <div className="page-heading py-16">
            <h1>Smart Feedback For Your Dream Job</h1>
              {isProcessing ? (
                  <>
                    <h2>{statusText}</h2>
                      <img src = "/images/resume-scan.gif" className = "w-full"/>
                  </>
              ) : (
                  <h2>Drop your resume for an ATS score and improvement tips</h2>
              )}
              {error && (
                  <p className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm font-medium w-full">{error}</p>
              )}
              {!isProcessing && (
                  <form id="upload-form" onSubmit={handleSubmit} className="flex flex-col gap-4 mt-8">

                    <div className="form-div">
                        <label htmlFor="company-name">Company Name</label>
                        <input type="text" name="company-name" id="company-name" placeholder="company-name"/>
                    </div>
                    <div className="form-div">
                      <label htmlFor="job-title">Job Title</label>
                      <input type="text" name="job-title" id="job-title" placeholder="Job Title"/>
                    </div>
                    <div className="form-div">
                      <label htmlFor="job-description">Job Description</label>
                      <textarea rows = {5} name="job-description" id="job-description" placeholder="Job Description"/>
                    </div>
                    <div className="form-div">
                      <label htmlFor="uploader">Upload Resume</label>
                      <FileUploader onFileSelect={handleFileSelect} />
                    </div>

                    <button className="primary-button" type="submit">
                      Analyze Resume
                    </button>
                  </form>
              )}
          </div>
        </section>
      </main>
  )
}

export default Upload