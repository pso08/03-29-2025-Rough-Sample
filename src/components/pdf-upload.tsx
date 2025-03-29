"use client";

/**
 * PDF Upload Component
 * 
 * This component provides a UI for uploading PDF files containing AWS DevOps exam questions.
 * It handles file selection, validation, upload, and displays processing status.
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { PDF_ROUTES } from '@/lib/api-routes';
import { useRouter } from 'next/navigation';

enum UploadStatus {
  IDLE = 'idle',
  UPLOADING = 'uploading',
  PROCESSING = 'processing',
  SUCCESS = 'success',
  ERROR = 'error'
}

export default function PdfUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<UploadStatus>(UploadStatus.IDLE);
  const [message, setMessage] = useState<string>('');
  const [jobId, setJobId] = useState<string>('');
  const [progress, setProgress] = useState<number>(0);
  const router = useRouter();

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    
    if (!selectedFile) {
      setFile(null);
      return;
    }
    
    // Validate file type
    if (!selectedFile.name.toLowerCase().endsWith('.pdf')) {
      setStatus(UploadStatus.ERROR);
      setMessage('Please select a PDF file.');
      setFile(null);
      return;
    }
    
    setFile(selectedFile);
    setStatus(UploadStatus.IDLE);
    setMessage('');
  };

  // Handle file upload
  const handleUpload = async () => {
    if (!file) {
      setStatus(UploadStatus.ERROR);
      setMessage('Please select a file to upload.');
      return;
    }
    
    try {
      setStatus(UploadStatus.UPLOADING);
      setProgress(10);
      
      // Create form data
      const formData = new FormData();
      formData.append('file', file);
      
      // Upload the file
      const response = await fetch(PDF_ROUTES.UPLOAD, {
        method: 'POST',
        body: formData
      });
      
      setProgress(50);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to upload PDF');
      }
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to upload PDF');
      }
      
      // Set job ID for status checking
      setJobId(data.jobId);
      setStatus(UploadStatus.PROCESSING);
      setMessage(data.message);
      
      // Start polling for job status
      pollJobStatus(data.jobId);
      
    } catch (error) {
      setStatus(UploadStatus.ERROR);
      setMessage(error.message || 'An error occurred during upload.');
      setProgress(0);
    }
  };

  // Poll for job status
  const pollJobStatus = async (id: string) => {
    try {
      const response = await fetch(PDF_ROUTES.PARSE_STATUS(id));
      
      if (!response.ok) {
        throw new Error('Failed to check job status');
      }
      
      const data = await response.json();
      
      // Update progress based on status
      switch (data.status) {
        case 'pending':
          setProgress(50);
          break;
        case 'processing':
          setProgress(75);
          break;
        case 'completed':
          setProgress(100);
          setStatus(UploadStatus.SUCCESS);
          setMessage(`Successfully processed ${data.data.questionCount} questions.`);
          // Redirect to questions page after a delay
          setTimeout(() => {
            router.push('/questions');
          }, 3000);
          return;
        case 'failed':
          setStatus(UploadStatus.ERROR);
          setMessage(`Processing failed: ${data.data.error}`);
          return;
      }
      
      // Continue polling if not completed or failed
      setTimeout(() => pollJobStatus(id), 2000);
      
    } catch (error) {
      setStatus(UploadStatus.ERROR);
      setMessage(error.message || 'Failed to check processing status.');
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Upload AWS DevOps Exam Questions</CardTitle>
        <CardDescription>
          Upload a PDF file containing AWS DevOps Professional certification exam questions.
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          <Input
            type="file"
            accept=".pdf"
            onChange={handleFileChange}
            disabled={status === UploadStatus.UPLOADING || status === UploadStatus.PROCESSING}
          />
          
          {file && (
            <div className="text-sm">
              Selected file: <span className="font-medium">{file.name}</span> ({(file.size / 1024 / 1024).toFixed(2)} MB)
            </div>
          )}
          
          {(status === UploadStatus.UPLOADING || status === UploadStatus.PROCESSING) && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>
                  {status === UploadStatus.UPLOADING ? 'Uploading...' : 'Processing...'}
                </span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="w-full" />
            </div>
          )}
          
          {(status === UploadStatus.SUCCESS || status === UploadStatus.ERROR) && (
            <Alert variant={status === UploadStatus.SUCCESS ? "default" : "destructive"}>
              <AlertTitle>
                {status === UploadStatus.SUCCESS ? 'Success' : 'Error'}
              </AlertTitle>
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          )}
        </div>
      </CardContent>
      
      <CardFooter>
        <Button 
          onClick={handleUpload}
          disabled={!file || status === UploadStatus.UPLOADING || status === UploadStatus.PROCESSING}
          className="w-full"
        >
          {status === UploadStatus.UPLOADING ? 'Uploading...' : 
           status === UploadStatus.PROCESSING ? 'Processing...' : 'Upload PDF'}
        </Button>
      </CardFooter>
    </Card>
  );
}
