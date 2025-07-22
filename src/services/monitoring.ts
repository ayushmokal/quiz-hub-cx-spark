import { getPerformance, trace } from 'firebase/performance';
import * as Sentry from '@sentry/react';
import app from '../lib/firebase';

// Initialize Firebase Performance
const performance = getPerformance(app);

// Initialize Sentry
Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN || "https://2a6d650b5d7f45f1fe5f36299ad5dc18@o4509709733593088.ingest.us.sentry.io/4509709734707200",
  sendDefaultPii: true,
  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration(),
    Sentry.consoleLoggingIntegration({ levels: ["log", "error", "warn"] }),
  ],
  // Tracing
  tracesSampleRate: import.meta.env.MODE === 'development' ? 1.0 : 0.1,
  tracePropagationTargets: ["localhost", /^https:\/\/.*\.vercel\.app\/api/],
  // Session Replay
  replaysSessionSampleRate: import.meta.env.MODE === 'development' ? 1.0 : 0.1,
  replaysOnErrorSampleRate: 1.0,
  environment: import.meta.env.MODE,
  _experiments: {
    enableLogs: true,
  },
  beforeSend(event) {
    // Don't filter development errors - we want to see them in Sentry
    return event;
  },
});

// Performance monitoring utilities
export class PerformanceMonitor {
  private static traces: Map<string, any> = new Map();

  static startTrace(traceName: string): void {
    const traceInstance = trace(performance, traceName);
    traceInstance.start();
    this.traces.set(traceName, traceInstance);
  }

  static stopTrace(traceName: string): void {
    const traceInstance = this.traces.get(traceName);
    if (traceInstance) {
      traceInstance.stop();
      this.traces.delete(traceName);
    }
  }

  static addTraceAttribute(traceName: string, attribute: string, value: string): void {
    const traceInstance = this.traces.get(traceName);
    if (traceInstance) {
      traceInstance.putAttribute(attribute, value);
    }
  }

  static addTraceMetric(traceName: string, metricName: string, value: number): void {
    const traceInstance = this.traces.get(traceName);
    if (traceInstance) {
      traceInstance.putMetric(metricName, value);
    }
  }

  // Quiz-specific performance tracking
  static trackQuizPerformance(quizId: string, action: string): void {
    const traceName = `quiz_${action}_${quizId}`;
    this.startTrace(traceName);
    this.addTraceAttribute(traceName, 'quiz_id', quizId);
    this.addTraceAttribute(traceName, 'action', action);
  }

  static finishQuizPerformance(quizId: string, action: string, metrics?: { [key: string]: number }): void {
    const traceName = `quiz_${action}_${quizId}`;
    
    if (metrics) {
      Object.entries(metrics).forEach(([key, value]) => {
        this.addTraceMetric(traceName, key, value);
      });
    }
    
    this.stopTrace(traceName);
  }

  // Page load performance
  static trackPageLoad(pageName: string): void {
    this.startTrace(`page_load_${pageName}`);
    this.addTraceAttribute(`page_load_${pageName}`, 'page', pageName);
  }

  static finishPageLoad(pageName: string): void {
    this.stopTrace(`page_load_${pageName}`);
  }

  // Component render performance
  static trackComponentRender(componentName: string): void {
    this.startTrace(`render_${componentName}`);
    this.addTraceAttribute(`render_${componentName}`, 'component', componentName);
  }

  static finishComponentRender(componentName: string): void {
    this.stopTrace(`render_${componentName}`);
  }
}

// Error tracking utilities
export class ErrorTracker {
  static captureException(error: Error, context?: { [key: string]: any }): void {
    Sentry.withScope((scope) => {
      if (context) {
        Object.entries(context).forEach(([key, value]) => {
          scope.setContext(key, value);
        });
      }
      Sentry.captureException(error);
    });
  }

  static captureMessage(message: string, level: 'info' | 'warning' | 'error' = 'info', context?: { [key: string]: any }): void {
    Sentry.withScope((scope) => {
      if (context) {
        Object.entries(context).forEach(([key, value]) => {
          scope.setContext(key, value);
        });
      }
      Sentry.captureMessage(message, level);
    });
  }

  static setUser(user: { id: string; email?: string; username?: string }): void {
    Sentry.setUser(user);
  }

  static addBreadcrumb(message: string, category: string, level: 'info' | 'warning' | 'error' = 'info'): void {
    Sentry.addBreadcrumb({
      message,
      category,
      level,
      timestamp: Date.now(),
    });
  }

  // Enhanced logging methods using console (captured by Sentry integration)
  static logTrace(message: string, data?: Record<string, any>): void {
    if (import.meta.env.MODE === 'development') {
      console.log(`[TRACE] ${message}`, data);
    }
  }

  static logDebug(message: string, data?: Record<string, any>): void {
    if (import.meta.env.MODE === 'development') {
      console.log(`[DEBUG] ${message}`, data);
    }
  }

  static logInfo(message: string, data?: Record<string, any>): void {
    console.log(`[INFO] ${message}`, data);
  }

  static logWarn(message: string, data?: Record<string, any>): void {
    console.warn(`[WARN] ${message}`, data);
  }

  static logError(message: string, data?: Record<string, any>): void {
    console.error(`[ERROR] ${message}`, data);
  }

  // Span tracking for custom operations
  static executeWithSpan<T>(operation: string, name: string, callback: () => T, attributes?: Record<string, any>): T {
    return Sentry.startSpan(
      {
        op: operation,
        name: name,
        attributes: attributes || {},
      },
      (span) => {
        // Add additional attributes if provided
        if (attributes) {
          Object.entries(attributes).forEach(([key, value]) => {
            span.setAttribute(key, String(value));
          });
        }
        return callback();
      }
    );
  }

  // Quiz-specific error tracking
  static trackQuizError(error: Error, quizId: string, questionIndex?: number): void {
    this.addBreadcrumb(`Quiz error in ${quizId}`, 'quiz', 'error');
    this.captureException(error, {
      quiz: {
        id: quizId,
        questionIndex,
      },
    });
  }

  static trackAuthError(error: Error, action: string): void {
    this.addBreadcrumb(`Auth error during ${action}`, 'auth', 'error');
    this.captureException(error, {
      auth: {
        action,
      },
    });
  }

  static trackDatabaseError(error: Error, operation: string, collection?: string): void {
    this.addBreadcrumb(`Database error during ${operation}`, 'database', 'error');
    this.captureException(error, {
      database: {
        operation,
        collection,
      },
    });
  }

  // Performance tracking with spans
  static trackButtonClick(buttonName: string, callback: () => void): void {
    this.executeWithSpan("ui.click", `Button Click: ${buttonName}`, callback, {
      button_name: buttonName,
      user_action: "click"
    });
  }

  static async trackApiCall<T>(url: string, method: string, callback: () => Promise<T>): Promise<T> {
    return Sentry.startSpan(
      {
        op: "http.client",
        name: `${method} ${url}`,
      },
      async (span) => {
        span.setAttribute("http.method", method);
        span.setAttribute("http.url", url);
        
        try {
          const result = await callback();
          span.setAttribute("http.status_code", "200");
          return result;
        } catch (error) {
          span.setAttribute("http.status_code", "error");
          this.captureException(error instanceof Error ? error : new Error(String(error)), {
            api: { url, method }
          });
          throw error;
        }
      }
    );
  }
}

// React Error Boundary for Sentry
export const SentryErrorBoundary = Sentry.ErrorBoundary;

// Performance profiler for React components
export const withSentryProfiling = Sentry.withProfiler;

export default {
  PerformanceMonitor,
  ErrorTracker,
  SentryErrorBoundary,
  withSentryProfiling,
};
