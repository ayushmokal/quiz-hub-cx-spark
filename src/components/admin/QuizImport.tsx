import { useState, useRef, useEffect } from 'react';
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle, Download, X, RefreshCw } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Progress } from '../ui/progress';
import { Alert, AlertDescription } from '../ui/alert';
import { Badge } from '../ui/badge';
import { useToast } from '../../hooks/use-toast';
import { categoriesAPI, topicsAPI, questionsAPI } from '../../services/firebase-api';
import type { Category, Topic, Question } from '../../types';

interface ImportResult {
  success: number;
  failed: number;
  errors: string[];
  newTopics: string[];
  newCategories: string[];
}

interface QuizRow {
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: string;
  explanation?: string;
  topic: string;
  category: string;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
}

export function QuizImport() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [previewData, setPreviewData] = useState<QuizRow[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [defaultCategory, setDefaultCategory] = useState('');
  const [defaultTopic, setDefaultTopic] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reset state on component mount to clear any stale values
  useEffect(() => {
    setDefaultCategory('');
    setDefaultTopic('');
  }, []);
  const { toast } = useToast();

  useEffect(() => {
    loadCategoriesAndTopics();
  }, []);

  const loadCategoriesAndTopics = async () => {
    try {
      const [categoriesData, topicsData] = await Promise.all([
        categoriesAPI.getAllCategories(),
        topicsAPI.getAllTopics()
      ]);
      setCategories(categoriesData);
      setTopics(topicsData);
    } catch (error) {
      console.error('Error loading categories and topics:', error);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const allowedTypes = [
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];

    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Invalid File Type",
        description: "Please select a CSV or Excel file.",
        variant: "destructive"
      });
      return;
    }

    setSelectedFile(file);
    setImportResult(null);
    setShowPreview(false);
  };

  const parseCSV = (content: string): QuizRow[] => {
    const lines = content.split('\n').filter(line => line.trim());
    
    // Better CSV parsing that handles quoted fields
    const parseCSVLine = (line: string): string[] => {
      const result = [];
      let current = '';
      let inQuotes = false;
      
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          result.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      
      result.push(current.trim());
      return result;
    };
    
    const headers = parseCSVLine(lines[0]).map(h => h.toLowerCase().replace(/"/g, ''));
    
    return lines.slice(1).map((line, index) => {
      const values = parseCSVLine(line).map(v => v.replace(/^"|"$/g, ''));
      const row: any = {};
      
      headers.forEach((header, i) => {
        row[header] = values[i] || '';
      });

      // Map common header variations
      return {
        question: row.question || row.text || row.q || '',
        option_a: row.option_a || row.a || row['option a'] || '',
        option_b: row.option_b || row.b || row['option b'] || '',
        option_c: row.option_c || row.c || row['option c'] || '',
        option_d: row.option_d || row.d || row['option d'] || '',
        correct_answer: row.correct_answer || row.answer || row.correct || '',
        explanation: row.explanation || row.notes || '',
        topic: row.topic || row.subject || '',
        category: row.category || row.type || '',
        difficulty: row.difficulty || row.level || 'intermediate'
      };
    }).filter(row => row.question && row.option_a && row.correct_answer);
  };

  const handlePreview = async () => {
    if (!selectedFile) return;

    try {
      const content = await selectedFile.text();
      const data = parseCSV(content);
      
      if (data.length === 0) {
        toast({
          title: "No Valid Data",
          description: "No valid quiz questions found in the file. Please check the format.",
          variant: "destructive"
        });
        return;
      }

      setPreviewData(data);
      setShowPreview(true);
    } catch (error) {
      toast({
        title: "File Parse Error",
        description: "Failed to parse the file. Please check the format.",
        variant: "destructive"
      });
    }
  };

  const validateQuestionData = (data: QuizRow[]) => {
    const validationErrors: string[] = [];
    
    // Get unique topics and categories from the data
    const uniqueTopics = [...new Set(data.map(row => row.topic).filter(Boolean))];
    const uniqueCategories = [...new Set(data.map(row => row.category).filter(Boolean))];
    
    // Debug logging
    console.log('🔍 Validation Debug:');
    console.log('Available categories:', categories.map(c => ({ id: c.id, name: c.name })));
    console.log('Available topics:', topics.map(t => ({ id: t.id, name: t.displayName, categoryId: t.categoryId, categoryName: t.categoryName })));
    console.log('Required categories from CSV:', uniqueCategories);
    console.log('Required topics from CSV:', uniqueTopics);
    
    // Check if all categories exist
    for (const categoryName of uniqueCategories) {
      const existingCategory = categories.find(c => c.name.toLowerCase() === categoryName.toLowerCase());
      console.log(`Checking category "${categoryName}": ${existingCategory ? 'EXISTS' : 'NOT FOUND'}`);
      if (existingCategory) {
        console.log('Found category:', existingCategory);
      }
      if (!existingCategory) {
        validationErrors.push(`Category "${categoryName}" does not exist. Please create it first.`);
      }
    }

    // Check if all topics exist
    for (const topicName of uniqueTopics) {
      const existingTopic = topics.find(t => t.displayName.toLowerCase() === topicName.toLowerCase());
      console.log(`Checking topic "${topicName}": ${existingTopic ? 'EXISTS' : 'NOT FOUND'}`);
      if (existingTopic) {
        console.log('Found topic:', existingTopic);
      }
      if (!existingTopic) {
        validationErrors.push(`Topic "${topicName}" does not exist. Please create it first.`);
      }
    }
    
    console.log('Validation errors:', validationErrors);
    return validationErrors;
  };

  const handleImport = async () => {
    if (!selectedFile || previewData.length === 0) return;

    // Validate that all topics and categories exist
    const validationErrors = validateQuestionData(previewData);
    if (validationErrors.length > 0) {
      toast({
        title: "Validation Failed",
        description: "Some topics or categories don't exist. Please create them first.",
        variant: "destructive"
      });
      setImportResult({
        success: 0,
        failed: previewData.length,
        errors: validationErrors,
        newTopics: [],
        newCategories: []
      });
      return;
    }

    setIsImporting(true);
    setImportProgress(0);
    
    try {
      const result: ImportResult = {
        success: 0,
        failed: 0,
        errors: [],
        newTopics: [],
        newCategories: []
      };

      // Import questions
      for (let i = 0; i < previewData.length; i++) {
        const row = previewData[i];
        setImportProgress((i / previewData.length) * 100);

        try {
          // Find topic and category IDs
          const topic = topics.find(t => t.displayName.toLowerCase() === row.topic.toLowerCase());
          const category = categories.find(c => c.name.toLowerCase() === row.category.toLowerCase());

          if (!topic || !category) {
            result.errors.push(`Row ${i + 1}: Topic or category not found`);
            result.failed++;
            continue;
          }

          // Validate question data
          if (!row.question || !row.option_a || !row.option_b || !row.correct_answer) {
            result.errors.push(`Row ${i + 1}: Missing required fields`);
            result.failed++;
            continue;
          }

          // Map difficulty values
          const difficultyMap: { [key: string]: 'beginner' | 'intermediate' | 'advanced' } = {
            'easy': 'beginner',
            'medium': 'intermediate', 
            'hard': 'advanced',
            'beginner': 'beginner',
            'intermediate': 'intermediate',
            'advanced': 'advanced'
          };

          const difficulty = difficultyMap[row.difficulty?.toLowerCase() || ''] || 'intermediate';

          // Find correct answer index
          const options = [row.option_a, row.option_b, row.option_c, row.option_d].filter(Boolean);
          const correctAnswerIndex = options.findIndex(option => 
            option.toLowerCase().trim() === row.correct_answer.toLowerCase().trim()
          );

          if (correctAnswerIndex === -1) {
            result.errors.push(`Row ${i + 1}: Correct answer not found in options`);
            result.failed++;
            continue;
          }

          // Create question
          const questionData: Omit<Question, 'id'> = {
            topicId: topic.id,
            type: 'multiple-choice',
            content: row.question,
            options: options,
            correctAnswers: [correctAnswerIndex],
            explanation: row.explanation || '',
            difficulty: difficulty,
            timeLimit: 60 // Default 60 seconds
          };

          await questionsAPI.createQuestion(questionData);
          result.success++;
        } catch (error: any) {
          result.errors.push(`Row ${i + 1}: ${error.message || 'Import failed'}`);
          result.failed++;
        }
      }

      setImportProgress(100);
      setImportResult(result);
      
      toast({
        title: "Import Complete",
        description: `Successfully imported ${result.success} questions. ${result.failed} failed.`,
        variant: result.failed > 0 ? "destructive" : "default"
      });

    } catch (error: any) {
      toast({
        title: "Import Failed",
        description: error.message || "Failed to import quiz questions.",
        variant: "destructive"
      });
    } finally {
      setIsImporting(false);
    }
  };

  const downloadTemplate = () => {
    const template = `question,option_a,option_b,option_c,option_d,correct_answer,explanation,topic,category,difficulty
"What is Customer Experience?","The overall experience a customer has with a company","A marketing strategy","A sales technique","A product feature","The overall experience a customer has with a company","Customer Experience encompasses all interactions between a customer and a company throughout the customer journey.","Customer Experience Basics","CX Fundamentals","Easy"
"What does NPS stand for?","Net Promoter Score","New Product Sales","Network Performance Score","National Payment System","Net Promoter Score","NPS measures customer loyalty and satisfaction based on likelihood to recommend.","Metrics and KPIs","CX Fundamentals","Medium"`;

    const blob = new Blob([template], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'quiz-import-template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Bulk Quiz Import</h2>
          <p className="text-muted-foreground">Import quiz questions from CSV or Excel files</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={loadCategoriesAndTopics}
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh Topics
          </Button>
          <Button
            variant="outline"
            onClick={downloadTemplate}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Download Template
          </Button>
        </div>
      </div>

      {/* Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload Quiz File
          </CardTitle>
          <CardDescription>
            Select a CSV or Excel file containing quiz questions. Use the template for proper formatting.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* File Upload */}
          <div className="space-y-2">
            <Label htmlFor="quizFile">Quiz File</Label>
            <div className="flex items-center gap-4">
              <Input
                ref={fileInputRef}
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={handleFileSelect}
                className="flex-1"
              />
              {selectedFile && (
                <Button
                  variant="outline"
                  onClick={handlePreview}
                  className="flex items-center gap-2"
                >
                  <FileSpreadsheet className="h-4 w-4" />
                  Preview
                </Button>
              )}
            </div>
          </div>

          {/* Important Notice */}
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Important:</strong> Make sure all categories and topics mentioned in your CSV file already exist in the system. 
              The import will fail if any category or topic is missing.
            </AlertDescription>
          </Alert>

          {selectedFile && (
            <Alert>
              <FileSpreadsheet className="h-4 w-4" />
              <AlertDescription>
                File selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Preview Section */}
      {showPreview && previewData.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Preview Data ({previewData.length} questions)</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowPreview(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Review the questions before importing. All topics and categories must already exist.
                </p>
                <Button
                  onClick={handleImport}
                  disabled={isImporting}
                  className="flex items-center gap-2"
                >
                  <Upload className="h-4 w-4" />
                  {isImporting ? 'Importing...' : 'Import Questions'}
                </Button>
              </div>
              
              {isImporting && (
                <div className="space-y-2">
                  <Progress value={importProgress} className="w-full" />
                  <p className="text-sm text-muted-foreground text-center">
                    Importing questions... {Math.round(importProgress)}%
                  </p>
                </div>
              )}

              <div className="max-h-96 overflow-y-auto border rounded-lg">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50 sticky top-0">
                    <tr>
                      <th className="text-left p-2 border-b">#</th>
                      <th className="text-left p-2 border-b">Question</th>
                      <th className="text-left p-2 border-b">Options</th>
                      <th className="text-left p-2 border-b">Answer</th>
                      <th className="text-left p-2 border-b">Topic</th>
                      <th className="text-left p-2 border-b">Category</th>
                    </tr>
                  </thead>
                  <tbody>
                    {previewData.slice(0, 10).map((row, index) => (
                      <tr key={index} className="border-b">
                        <td className="p-2">{index + 1}</td>
                        <td className="p-2 max-w-xs truncate">{row.question}</td>
                        <td className="p-2">
                          <div className="text-xs space-y-1">
                            <div>A: {row.option_a}</div>
                            <div>B: {row.option_b}</div>
                            {row.option_c && <div>C: {row.option_c}</div>}
                            {row.option_d && <div>D: {row.option_d}</div>}
                          </div>
                        </td>
                        <td className="p-2">{row.correct_answer}</td>
                        <td className="p-2">
                          <Badge variant="outline">{row.topic}</Badge>
                        </td>
                        <td className="p-2">
                          <Badge variant="secondary">{row.category}</Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {previewData.length > 10 && (
                  <div className="p-2 text-center text-sm text-muted-foreground bg-muted/30">
                    ... and {previewData.length - 10} more questions
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Import Results */}
      {importResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {importResult.failed === 0 ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <AlertCircle className="h-5 w-5 text-yellow-500" />
              )}
              Import Results
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="text-2xl font-bold text-green-600">{importResult.success}</div>
                <div className="text-sm text-green-700">Success</div>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
                <div className="text-2xl font-bold text-red-600">{importResult.failed}</div>
                <div className="text-sm text-red-700">Failed</div>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="text-2xl font-bold text-blue-600">{importResult.newTopics.length}</div>
                <div className="text-sm text-blue-700">New Topics</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
                <div className="text-2xl font-bold text-purple-600">{importResult.newCategories.length}</div>
                <div className="text-sm text-purple-700">New Categories</div>
              </div>
            </div>

            {importResult.newTopics.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">New Topics Created:</h4>
                <div className="flex flex-wrap gap-2">
                  {importResult.newTopics.map((topic, index) => (
                    <Badge key={index} variant="outline">{topic}</Badge>
                  ))}
                </div>
              </div>
            )}

            {importResult.newCategories.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">New Categories Created:</h4>
                <div className="flex flex-wrap gap-2">
                  {importResult.newCategories.map((category, index) => (
                    <Badge key={index} variant="secondary">{category}</Badge>
                  ))}
                </div>
              </div>
            )}

            {importResult.errors.length > 0 && (
              <div>
                <h4 className="font-medium mb-2 text-red-600">Errors:</h4>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-h-48 overflow-y-auto">
                  {importResult.errors.map((error, index) => (
                    <div key={index} className="text-sm text-red-700 mb-1">
                      {error}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Format Guide */}
      <Card>
        <CardHeader>
          <CardTitle>File Format Guide</CardTitle>
          <CardDescription>
            Your CSV/Excel file should include the following columns:
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-medium mb-2">Required Columns:</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• <code>question</code> - The question text</li>
                <li>• <code>option_a</code> - First option</li>
                <li>• <code>option_b</code> - Second option</li>
                <li>• <code>correct_answer</code> - The correct answer text</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Optional Columns:</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• <code>option_c</code> - Third option</li>
                <li>• <code>option_d</code> - Fourth option</li>
                <li>• <code>explanation</code> - Answer explanation</li>
                <li>• <code>topic</code> - Question topic</li>
                <li>• <code>category</code> - Question category</li>
                <li>• <code>difficulty</code> - Easy, Medium, or Hard</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
