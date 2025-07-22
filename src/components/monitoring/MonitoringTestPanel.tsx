import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ErrorTracker, PerformanceMonitor } from '@/services/monitoring';

export function MonitoringTestPanel() {
  const handleTestError = () => {
    ErrorTracker.trackButtonClick('test-error', () => {
      throw new Error("This is a test error for Sentry!");
    });
  };

  const handleTestPerformance = () => {
    ErrorTracker.trackButtonClick('test-performance', () => {
      PerformanceMonitor.trackPageLoad('test_page');
      
      // Simulate some work
      setTimeout(() => {
        PerformanceMonitor.finishPageLoad('test_page');
        ErrorTracker.logInfo('Performance test completed', {
          test_type: 'manual',
          duration: '1000ms'
        });
      }, 1000);
    });
  };

  const handleTestApiCall = async () => {
    try {
      await ErrorTracker.trackApiCall('/api/test', 'GET', async () => {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500));
        return { success: true };
      });
      ErrorTracker.logInfo('API call test completed successfully');
    } catch (error) {
      ErrorTracker.logError('API call test failed', { error: error instanceof Error ? error.message : 'Unknown error' });
    }
  };

  const handleTestBreadcrumbs = () => {
    ErrorTracker.addBreadcrumb('User clicked test breadcrumbs', 'navigation');
    ErrorTracker.addBreadcrumb('Loading test data', 'data');
    ErrorTracker.addBreadcrumb('Test data loaded successfully', 'data', 'info');
    ErrorTracker.logInfo('Breadcrumb test completed - check Sentry for breadcrumb trail');
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🔍 Sentry Monitoring Test Panel
          <Badge variant="outline">Development Only</Badge>
        </CardTitle>
        <CardDescription>
          Test Sentry error tracking and performance monitoring. Firebase Performance has been removed to avoid initialization conflicts.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Button
            onClick={handleTestError}
            variant="destructive"
            className="w-full"
          >
            Test Error Tracking
          </Button>
          
          <Button
            onClick={handleTestPerformance}
            variant="outline"
            className="w-full"
          >
            Test Performance
          </Button>
          
          <Button
            onClick={handleTestApiCall}
            variant="secondary"
            className="w-full"
          >
            Test API Tracking
          </Button>
          
          <Button
            onClick={handleTestBreadcrumbs}
            variant="ghost"
            className="w-full"
          >
            Test Breadcrumbs
          </Button>
        </div>
        
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-semibold text-sm mb-2">What these tests do:</h4>
          <ul className="text-sm space-y-1 text-gray-600">
            <li>• <strong>Error Tracking:</strong> Sends a test error to Sentry</li>
            <li>• <strong>Performance:</strong> Creates a custom trace with Sentry spans</li>
            <li>• <strong>API Tracking:</strong> Simulates an API call with Sentry span tracking</li>
            <li>• <strong>Breadcrumbs:</strong> Adds navigation breadcrumbs for debugging context</li>
          </ul>
        </div>
        
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
          <p className="text-sm text-blue-800">
            <strong>Note:</strong> This panel is only visible in development mode. 
            Firebase Performance has been removed - using Sentry for all monitoring.
            Check your browser console and Sentry dashboard to see the results.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
