import React, { useState, useRef } from 'react';
import { CheckCircle, XCircle, Download, ArrowLeft, FileText, Clock, Target, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { useToast } from '../../hooks/use-toast';
import { Question } from '../../types';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface QuizResultsProps {
  questions: Question[];
  userAnswers: number[][];
  score: number;
  accuracy: number;
  avgTime: number;
  topicName: string;
  onReturnToDashboard: () => void;
  onRetakeQuiz: () => void;
}

interface QuestionResult {
  question: Question;
  userAnswer: number[];
  correctAnswer: number[];
  isCorrect: boolean;
  explanation?: string;
}

export function QuizResults({ 
  questions, 
  userAnswers, 
  score, 
  accuracy, 
  avgTime, 
  topicName,
  onReturnToDashboard,
  onRetakeQuiz 
}: QuizResultsProps) {
  const [showOnlyIncorrect, setShowOnlyIncorrect] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const resultsRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Process results to identify correct/incorrect answers
  const questionResults: QuestionResult[] = questions.map((question, index) => {
    const userAnswer = userAnswers[index] || [];
    const correctAnswer = question.correctAnswers || [];
    const isCorrect = userAnswer.length === correctAnswer.length && 
                     userAnswer.every(ans => correctAnswer.includes(ans));

    return {
      question,
      userAnswer,
      correctAnswer,
      isCorrect,
      explanation: question.explanation
    };
  });

  const incorrectAnswers = questionResults.filter(result => !result.isCorrect);
  const correctAnswers = questionResults.filter(result => result.isCorrect);

  const displayedResults = showOnlyIncorrect ? incorrectAnswers : questionResults;

  const getOptionText = (question: Question, optionIndex: number): string => {
    const options = [question.optionA, question.optionB, question.optionC, question.optionD];
    return options[optionIndex] || '';
  };

  const getScoreColor = (accuracy: number) => {
    if (accuracy >= 80) return 'text-green-600';
    if (accuracy >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBadgeVariant = (accuracy: number) => {
    if (accuracy >= 80) return 'default';
    if (accuracy >= 60) return 'secondary';
    return 'destructive';
  };

  const exportToPDF = async () => {
    if (!resultsRef.current) return;

    setIsGeneratingPDF(true);
    try {
      // Create a clean version for PDF
      const element = resultsRef.current;
      
      // Configure canvas options for better quality
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        scrollX: 0,
        scrollY: 0,
        width: element.scrollWidth,
        height: element.scrollHeight
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 295; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;

      let position = 0;

      // Add first page
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      // Add additional pages if content is longer
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      // Generate filename with date and topic
      const date = new Date().toISOString().split('T')[0];
      const filename = `Quiz_Results_${topicName.replace(/\s+/g, '_')}_${date}.pdf`;

      pdf.save(filename);

      toast({
        title: "PDF Exported",
        description: `Quiz results exported as ${filename}`,
        variant: "default"
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: "Export Failed",
        description: "Failed to generate PDF. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header with Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={onReturnToDashboard}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Button>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setShowOnlyIncorrect(!showOnlyIncorrect)}
            className="flex items-center gap-2"
          >
            <FileText className="h-4 w-4" />
            {showOnlyIncorrect ? 'Show All Questions' : 'Show Only Incorrect'}
          </Button>
          
          <Button
            onClick={exportToPDF}
            disabled={isGeneratingPDF}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            {isGeneratingPDF ? 'Generating PDF...' : 'Export PDF'}
          </Button>
        </div>
      </div>

      {/* Results Summary */}
      <div ref={resultsRef}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Quiz Results: {topicName}
            </CardTitle>
            <CardDescription>
              Completed on {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{score}</div>
                <div className="text-sm text-muted-foreground">Total Points</div>
              </div>
              <div className="text-center">
                <div className={`text-2xl font-bold ${getScoreColor(accuracy)}`}>
                  {accuracy.toFixed(1)}%
                </div>
                <div className="text-sm text-muted-foreground">Accuracy</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600 flex items-center justify-center gap-1">
                  <Clock className="h-4 w-4" />
                  {avgTime.toFixed(1)}s
                </div>
                <div className="text-sm text-muted-foreground">Avg Time</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {correctAnswers.length}/{questions.length}
                </div>
                <div className="text-sm text-muted-foreground">Correct</div>
              </div>
            </div>

            <Separator className="my-4" />

            <div className="flex items-center justify-between">
              <Badge variant={getScoreBadgeVariant(accuracy)} className="text-sm">
                {accuracy >= 80 ? 'Excellent!' : accuracy >= 60 ? 'Good Job!' : 'Needs Improvement'}
              </Badge>
              
              <div className="flex gap-2">
                <Button onClick={onRetakeQuiz} variant="outline" size="sm">
                  Retake Quiz
                </Button>
                <Button onClick={onReturnToDashboard} size="sm">
                  Continue Learning
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Performance Insights */}
        {incorrectAnswers.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Performance Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium text-green-600">Strengths</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Answered {correctAnswers.length} questions correctly</li>
                    <li>• Average response time: {avgTime.toFixed(1)} seconds</li>
                    {accuracy >= 60 && <li>• Good understanding of core concepts</li>}
                  </ul>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium text-orange-600">Areas for Improvement</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Review {incorrectAnswers.length} incorrect answers below</li>
                    <li>• Focus on explanations for better understanding</li>
                    <li>• Consider retaking the quiz to improve your score</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Question Results */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">
              {showOnlyIncorrect ? `Incorrect Answers (${incorrectAnswers.length})` : `All Questions (${questions.length})`}
            </h2>
            {showOnlyIncorrect && incorrectAnswers.length === 0 && (
              <Badge variant="default" className="bg-green-100 text-green-800">
                Perfect Score! 🎉
              </Badge>
            )}
          </div>

          {displayedResults.map((result, index) => (
            <Card key={index} className={`${!result.isCorrect ? 'border-red-200 bg-red-50/30' : 'border-green-200 bg-green-50/30'}`}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-base leading-relaxed">
                    Q{showOnlyIncorrect ? incorrectAnswers.indexOf(result) + 1 : index + 1}. {result.question.question}
                  </CardTitle>
                  <div className="flex items-center gap-2 ml-4">
                    {result.isCorrect ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-600" />
                    )}
                    <Badge variant={result.isCorrect ? 'default' : 'destructive'} className="text-xs">
                      {result.isCorrect ? 'Correct' : 'Incorrect'}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Answer Options */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {[0, 1, 2, 3].map((optionIndex) => {
                    const optionText = getOptionText(result.question, optionIndex);
                    if (!optionText) return null;

                    const isUserAnswer = result.userAnswer.includes(optionIndex);
                    const isCorrectAnswer = result.correctAnswer.includes(optionIndex);
                    
                    let optionClass = 'p-3 rounded-lg border text-sm ';
                    if (isCorrectAnswer) {
                      optionClass += 'bg-green-100 border-green-300 text-green-800';
                    } else if (isUserAnswer && !isCorrectAnswer) {
                      optionClass += 'bg-red-100 border-red-300 text-red-800';
                    } else {
                      optionClass += 'bg-gray-50 border-gray-200 text-gray-700';
                    }

                    return (
                      <div key={optionIndex} className={optionClass}>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">
                            {String.fromCharCode(65 + optionIndex)}.
                          </span>
                          <span className="flex-1">{optionText}</span>
                          <div className="flex items-center gap-1">
                            {isCorrectAnswer && (
                              <Badge variant="outline" className="text-xs bg-green-100 border-green-300">
                                Correct
                              </Badge>
                            )}
                            {isUserAnswer && !isCorrectAnswer && (
                              <Badge variant="outline" className="text-xs bg-red-100 border-red-300">
                                Your Answer
                              </Badge>
                            )}
                            {isUserAnswer && isCorrectAnswer && (
                              <Badge variant="outline" className="text-xs bg-green-100 border-green-300">
                                Your Answer ✓
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Explanation */}
                {result.explanation && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-medium text-blue-900 mb-2">Explanation:</h4>
                    <p className="text-blue-800 text-sm leading-relaxed">{result.explanation}</p>
                  </div>
                )}

                {/* Learning Tip for Incorrect Answers */}
                {!result.isCorrect && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <h4 className="font-medium text-amber-900 mb-2">💡 Learning Tip:</h4>
                    <p className="text-amber-800 text-sm">
                      Review this concept and try to understand why the correct answer is right. 
                      Consider the explanation above and relate it to your existing knowledge.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}

          {displayedResults.length === 0 && showOnlyIncorrect && (
            <Card>
              <CardContent className="text-center py-8">
                <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-green-800 mb-2">Perfect Score!</h3>
                <p className="text-green-600">
                  Congratulations! You answered all questions correctly. 
                  Keep up the excellent work!
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
