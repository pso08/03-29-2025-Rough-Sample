import Link from 'next/link';
import { Button } from '../src/components/ui/button';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white">
      <div className="container mx-auto px-4 py-16">
        <header className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            AWS Certified DevOps Engineer Professional
          </h1>
          <p className="text-xl md:text-2xl text-slate-300 max-w-3xl mx-auto">
            Prepare for your certification with our comprehensive quiz application featuring 350+ exam questions with detailed explanations
          </p>
        </header>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
          <div className="bg-slate-800/50 p-8 rounded-lg border border-slate-700 shadow-xl">
            <h2 className="text-2xl font-bold mb-4">Practice Quiz</h2>
            <p className="text-slate-300 mb-6">
              Test your knowledge with our interactive quiz featuring real exam-style questions. Track your progress and identify areas for improvement.
            </p>
            <Link href="/quiz" className="block">
              <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                Start Quiz
              </Button>
            </Link>
          </div>

          <div className="bg-slate-800/50 p-8 rounded-lg border border-slate-700 shadow-xl">
            <h2 className="text-2xl font-bold mb-4">Flashcards</h2>
            <p className="text-slate-300 mb-6">
              Study with interactive flashcards to memorize key concepts and test your knowledge. Flip cards to reveal answers and explanations.
            </p>
            <Link href="/flashcards" className="block">
              <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white">
                Study Flashcards
              </Button>
            </Link>
          </div>

          <div className="bg-slate-800/50 p-8 rounded-lg border border-slate-700 shadow-xl">
            <h2 className="text-2xl font-bold mb-4">Full Exam Simulation</h2>
            <p className="text-slate-300 mb-6">
              Take a timed, full-length practice exam that simulates the actual AWS DevOps Professional certification test with domain-specific scoring.
            </p>
            <Link href="/test" className="block">
              <Button className="w-full bg-amber-600 hover:bg-amber-700 text-white">
                Start Test Mode
              </Button>
            </Link>
          </div>

          <div className="bg-slate-800/50 p-8 rounded-lg border border-slate-700 shadow-xl">
            <h2 className="text-2xl font-bold mb-4">Study Materials</h2>
            <p className="text-slate-300 mb-6">
              Access our collection of study materials, including sample questions, explanations, and reference guides to help you prepare for the exam.
            </p>
            <Link href="/download" className="block">
              <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white">
                Download Resources
              </Button>
            </Link>
          </div>
        </div>

        <div className="mt-16 bg-slate-800/50 p-8 rounded-lg border border-slate-700 shadow-xl max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold mb-4">Key Exam Topics</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="flex items-start">
              <div className="bg-blue-600 p-2 rounded-full mr-3 mt-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold">SDLC Automation</h3>
                <p className="text-slate-300">CI/CD pipelines, infrastructure as code, and automated testing</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="bg-blue-600 p-2 rounded-full mr-3 mt-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold">Configuration Management</h3>
                <p className="text-slate-300">Managing and deploying application configurations</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="bg-blue-600 p-2 rounded-full mr-3 mt-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold">Monitoring & Logging</h3>
                <p className="text-slate-300">Implementing monitoring solutions and analyzing logs</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="bg-blue-600 p-2 rounded-full mr-3 mt-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold">High Availability & Disaster Recovery</h3>
                <p className="text-slate-300">Designing resilient architectures and recovery strategies</p>
              </div>
            </div>
          </div>
        </div>

        <footer className="mt-16 text-center text-slate-400">
          <p>© 2025 AWS DevOps Quiz App. All rights reserved.</p>
          <p className="mt-2">
            <Link href="/about" className="underline hover:text-white">About</Link> • 
            <Link href="/contact" className="underline hover:text-white ml-3">Contact</Link> • 
            <Link href="/privacy" className="underline hover:text-white ml-3">Privacy Policy</Link>
          </p>
        </footer>
      </div>
    </div>
  );
}
