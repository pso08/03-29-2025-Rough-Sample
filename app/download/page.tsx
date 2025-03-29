'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { FileDown } from 'lucide-react';

export default function DownloadSample() {
  return (
    <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-4">
      <Card className="w-full max-w-3xl bg-slate-800 border-slate-700 text-white">
        <CardHeader>
          <CardTitle className="text-2xl">Study Materials</CardTitle>
          <CardDescription className="text-slate-300">
            Download resources to help you prepare for the AWS Certified DevOps Engineer Professional exam
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="bg-slate-700/50 p-6 rounded-lg border border-slate-600">
            <h3 className="text-xl font-semibold mb-3">AWS Certified DevOps Engineer Professional Sample</h3>
            <p className="text-slate-300 mb-4">
              This comprehensive PDF contains sample questions and detailed explanations to help you prepare for the AWS DevOps Professional certification exam.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link 
                href="/AWSCertifiedDevOpsEngineer-Sample.pdf"
                download
                className="w-full"
              >
                <Button className="w-full bg-blue-600 hover:bg-blue-700">
                  <FileDown className="mr-2 h-4 w-4" />
                  Download PDF
                </Button>
              </Link>
            </div>
          </div>
          
          <div className="bg-slate-700/50 p-6 rounded-lg border border-slate-600">
            <h3 className="text-xl font-semibold mb-3">Additional Resources</h3>
            <p className="text-slate-300 mb-4">
              Explore our other study materials to enhance your AWS DevOps knowledge.
            </p>
            <ul className="space-y-2 text-slate-300">
              <li>• Practice with our interactive quiz and test sections</li>
              <li>• Review flashcards to reinforce key concepts</li>
              <li>• Join our community forums for discussion and support</li>
            </ul>
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-center">
          <Link href="/">
            <Button variant="outline" className="border-slate-600 text-white hover:bg-slate-700">
              Back to Home
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
