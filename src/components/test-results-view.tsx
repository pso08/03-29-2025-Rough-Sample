"use client";

/**
 * Test Results Component
 * 
 * This component displays the results of a completed test,
 * including overall score, domain-specific performance, and time taken.
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { TestResults, Domain } from '@/lib/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, CheckCircle, XCircle, Clock, Award } from 'lucide-react';

interface TestResultsViewProps {
  results: TestResults;
  onRetake: () => void;
  onClose: () => void;
}

export default function TestResultsView({
  results,
  onRetake,
  onClose
}: TestResultsViewProps) {
  const [activeTab, setActiveTab] = useState('overview');
  
  // Calculate overall score percentage
  const scorePercentage = Math.round((results.correctAnswers / results.totalQuestions) * 100);
  
  // Format time as HH:MM:SS
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Determine pass/fail status (AWS passing score is typically around 72-75%)
  const isPassing = scorePercentage >= 72;
  
  // Get domain-specific scores
  const getDomainScore = (domain: Domain) => {
    const domainResult = results.domainResults.find(d => d.domain === domain);
    if (!domainResult || domainResult.totalQuestions === 0) return 0;
    return Math.round((domainResult.correctAnswers / domainResult.totalQuestions) * 100);
  };
  
  return (
    <div className="w-full max-w-4xl mx-auto">
      <Card className="bg-slate-800 border-slate-700 text-white">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Test Results</CardTitle>
              <CardDescription className="text-slate-300">
                AWS DevOps Professional Practice Test
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {isPassing ? (
                <div className="flex items-center text-green-500">
                  <Award className="h-6 w-6 mr-2" />
                  <span className="font-bold text-xl">PASS</span>
                </div>
              ) : (
                <div className="flex items-center text-red-500">
                  <XCircle className="h-6 w-6 mr-2" />
                  <span className="font-bold text-xl">FAIL</span>
                </div>
              )}
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-3 mb-6 bg-slate-700">
              <TabsTrigger value="overview" className="flex items-center gap-2 data-[state=active]:bg-slate-600">
                <Award className="h-4 w-4" />
                <span>Overview</span>
              </TabsTrigger>
              <TabsTrigger value="domains" className="flex items-center gap-2 data-[state=active]:bg-slate-600">
                <BarChart className="h-4 w-4" />
                <span>Domain Analysis</span>
              </TabsTrigger>
              <TabsTrigger value="details" className="flex items-center gap-2 data-[state=active]:bg-slate-600">
                <CheckCircle className="h-4 w-4" />
                <span>Question Details</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview">
              <div className="space-y-6">
                <div className="text-center">
                  <div className="text-5xl font-bold mb-2">{scorePercentage}%</div>
                  <div className="text-slate-400">Overall Score</div>
                </div>
                
                <Progress value={scorePercentage} className="h-4 bg-slate-700" />
                
                <div className="grid grid-cols-2 gap-4 mt-6">
                  <div className="bg-slate-700/50 rounded-lg p-4 text-center">
                    <div className="flex justify-center items-center mb-2">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                      <span className="text-xl font-semibold">{results.correctAnswers}</span>
                    </div>
                    <div className="text-sm text-slate-400">Correct Answers</div>
                  </div>
                  
                  <div className="bg-slate-700/50 rounded-lg p-4 text-center">
                    <div className="flex justify-center items-center mb-2">
                      <XCircle className="h-5 w-5 text-red-500 mr-2" />
                      <span className="text-xl font-semibold">{results.incorrectAnswers}</span>
                    </div>
                    <div className="text-sm text-slate-400">Incorrect Answers</div>
                  </div>
                  
                  <div className="bg-slate-700/50 rounded-lg p-4 text-center">
                    <div className="flex justify-center items-center mb-2">
                      <Clock className="h-5 w-5 text-blue-500 mr-2" />
                      <span className="text-xl font-semibold">{formatTime(results.timeTaken)}</span>
                    </div>
                    <div className="text-sm text-slate-400">Time Taken</div>
                  </div>
                  
                  <div className="bg-slate-700/50 rounded-lg p-4 text-center">
                    <div className="text-xl font-semibold mb-2">{results.skippedQuestions}</div>
                    <div className="text-sm text-slate-400">Skipped Questions</div>
                  </div>
                </div>
                
                <div className="mt-6 bg-slate-700/30 p-4 rounded-lg border border-slate-600">
                  <h3 className="text-lg font-semibold mb-2">Passing Score Information</h3>
                  <p className="text-sm text-slate-300">
                    The AWS Certified DevOps Engineer - Professional exam typically requires a score of 
                    approximately 72-75% to pass. Your score of {scorePercentage}% is 
                    {isPassing ? ' above ' : ' below '} 
                    the typical passing threshold.
                  </p>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="domains">
              <div className="space-y-6">
                <h3 className="text-lg font-semibold mb-4">Domain Performance</h3>
                
                <div className="space-y-4">
                  {Object.values(Domain).map(domain => {
                    const domainResult = results.domainResults.find(d => d.domain === domain);
                    const score = getDomainScore(domain);
                    const isWeakArea = score < 70;
                    
                    return (
                      <div key={domain} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <div className="text-sm font-medium">{domain}</div>
                          <div className="text-sm font-medium">{score}%</div>
                        </div>
                        <Progress value={score} className={isWeakArea ? "h-2 bg-red-900/30" : "h-2 bg-slate-700"} />
                        <div className="flex justify-between text-xs text-slate-400">
                          <div>
                            {domainResult?.correctAnswers || 0} of {domainResult?.totalQuestions || 0} correct
                          </div>
                          {isWeakArea && (
                            <div className="text-red-400 font-medium">Needs improvement</div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                <div className="mt-6 p-4 bg-slate-700/30 rounded-lg border border-slate-600">
                  <h4 className="font-semibold mb-2">Recommended Focus Areas</h4>
                  <ul className="list-disc pl-5 space-y-1">
                    {Object.values(Domain).filter(domain => getDomainScore(domain) < 70).map(domain => (
                      <li key={domain} className="text-sm text-slate-300">
                        {domain} - {getDomainScore(domain)}%
                      </li>
                    ))}
                    {Object.values(Domain).filter(domain => getDomainScore(domain) < 70).length === 0 && (
                      <li className="text-sm text-green-400">
                        Great job! You performed well across all domains.
                      </li>
                    )}
                  </ul>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="details">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold mb-2">Question Details</h3>
                
                <div className="overflow-auto max-h-96 border border-slate-600 rounded-lg">
                  <table className="min-w-full divide-y divide-slate-600">
                    <thead className="bg-slate-700">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                          #
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                          Domain
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                          Result
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-600">
                      {results.questionResults.map((result, index) => (
                        <tr key={result.questionId}>
                          <td className="px-4 py-2 whitespace-nowrap text-sm">
                            {index + 1}
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm">
                            {result.domain}
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap">
                            {result.isCorrect ? (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-900/30 text-green-400">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Correct
                              </span>
                            ) : result.selectedAnswers.length > 0 ? (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-900/30 text-red-400">
                                <XCircle className="h-3 w-3 mr-1" />
                                Incorrect
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-700 text-slate-300">
                                Skipped
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
        
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={onClose} className="border-slate-600 text-white hover:bg-slate-700">
            Return to Dashboard
          </Button>
          <Button onClick={onRetake} className="bg-blue-600 hover:bg-blue-700">
            Retake Test
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
