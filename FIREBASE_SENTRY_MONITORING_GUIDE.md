# Firebase Performance & Sentry Monitoring Integration Guide

## Overview

This guide covers the implementation of comprehensive monitoring for Quiz Hub CX Spark using Firebase Performance Monitoring and Sentry error tracking. The integration provides real-time performance insights, error tracking, and user monitoring to ensure optimal application performance.

## 🚀 Quick Start

### Environment Variables

Add the following to your `.env` file:

```env
# Sentry Configuration
VITE_SENTRY_DSN=https://2a6d650b5d7f45f1fe5f36299ad5dc18@o4509709733593088.ingest.us.sentry.io/4509709734707200

# Firebase Configuration (already exists)
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
# ... other Firebase config
```

### Installation

The following packages are already installed:

```bash
npm install firebase @sentry/react @sentry/tracing
```

## 📊 Performance Monitoring

### Firebase Performance Features

1. **Automatic Metrics Collection**
   - Page load times
   - Network request performance
   - App startup time
   - First contentful paint (FCP)
   - Largest contentful paint (LCP)

2. **Custom Traces**
   - Quiz completion performance
   - Authentication flow timing
   - Component render performance
   - Database operation timing

### Custom Performance Tracking

```typescript
import { PerformanceMonitor } from './services/monitoring';

// Start tracking a custom operation
PerformanceMonitor.startTrace('quiz_loading');
PerformanceMonitor.addTraceAttribute('quiz_loading', 'quiz_id', 'quiz123');

// Add metrics during the operation
PerformanceMonitor.addTraceMetric('quiz_loading', 'question_count', 10);

// Stop tracking when complete
PerformanceMonitor.stopTrace('quiz_loading');
```

### Quiz-Specific Performance Tracking

```typescript
// Track quiz performance
PerformanceMonitor.trackQuizPerformance('quiz_id', 'start');

// Finish with metrics
PerformanceMonitor.finishQuizPerformance('quiz_id', 'completion', {
  score: 85,
  time_taken: 120,
  questions_answered: 10,
  accuracy_rate: 0.85
});
```

## 🐛 Error Tracking & Monitoring

### Sentry Features

1. **Error Tracking**
   - JavaScript errors
   - Unhandled promise rejections
   - React component errors
   - Authentication errors
   - Database errors

2. **Performance Monitoring**
   - React component render times
   - Database query performance
   - API request monitoring
   - User interaction tracking

3. **User Context**
   - User identification
   - Breadcrumb trail
   - Custom context data

### Error Tracking Usage

```typescript
import { ErrorTracker } from './services/monitoring';

// Capture exceptions
try {
  // Some operation
} catch (error) {
  ErrorTracker.captureException(error, {
    quiz: { id: 'quiz123' },
    user_action: 'answer_question'
  });
}

// Capture messages
ErrorTracker.captureMessage('Quiz loading slowly', 'warning', {
  performance: { loadTime: 5000 }
});

// Track specific error types
ErrorTracker.trackQuizError(error, 'quiz123', 5);
ErrorTracker.trackAuthError(error, 'login');
ErrorTracker.trackDatabaseError(error, 'query', 'questions');
```

## 🏗️ Architecture

### Service Structure

```
src/services/monitoring.ts
├── PerformanceMonitor class
│   ├── Custom trace management
│   ├── Quiz-specific tracking
│   ├── Page load monitoring
│   └── Component render tracking
├── ErrorTracker class
│   ├── Exception capturing
│   ├── Message logging
│   ├── User context management
│   └── Breadcrumb tracking
└── React integration
    ├── SentryErrorBoundary
    └── withSentryProfiling
```

### Integration Points

1. **App.tsx**: Global error boundary and app initialization tracking
2. **AuthContext.tsx**: Authentication performance and error tracking
3. **QuizEngine.tsx**: Quiz-specific performance and error monitoring
4. **All Components**: Automatic React performance monitoring

## 📈 Monitoring Dashboard

### Firebase Performance Console

Access Firebase Performance data at:
`https://console.firebase.google.com/project/YOUR_PROJECT/performance`

Key metrics to monitor:
- **Page Load Performance**: Initial load times
- **Custom Traces**: Quiz completion, authentication flows
- **Network Requests**: API response times
- **App Startup Time**: Time to interactive

### Sentry Dashboard

Access Sentry data at your Sentry project dashboard.

Key features:
- **Issues**: Error frequency and trends
- **Performance**: Transaction performance monitoring
- **Releases**: Error tracking per deployment
- **Alerts**: Configurable error rate alerts

## 🧪 Testing & Verification

### Development Testing Panel

In development mode, a monitoring test panel is available in the Dashboard to verify the integration:

**Location**: Dashboard → Bottom of page (development only)

**Available Tests**:
1. **Test Error Tracking**: Generates a test error to verify Sentry error capture
2. **Test Performance**: Creates a custom Firebase Performance trace
3. **Test API Tracking**: Simulates an API call with Sentry span tracking
4. **Test Breadcrumbs**: Adds navigation breadcrumbs for debugging context

### Manual Testing

```typescript
// Test error tracking
try {
  throw new Error("Test error for Sentry");
} catch (error) {
  ErrorTracker.captureException(error, {
    test: true,
    component: "manual_test"
  });
}

// Test performance monitoring
PerformanceMonitor.trackQuizPerformance("test_quiz", "manual_test");
setTimeout(() => {
  PerformanceMonitor.finishQuizPerformance("test_quiz", "manual_test", {
    duration: 1000,
    success: true
  });
}, 1000);

// Test API tracking
await ErrorTracker.trackApiCall("/api/test", "GET", async () => {
  // Your API call here
  return fetch("/api/test");
});
```

### Verification Steps

1. **Sentry Dashboard**: Check https://sentry.io for errors and performance data
2. **Firebase Console**: Visit Firebase Performance tab for custom traces
3. **Browser DevTools**: Check Network tab for Sentry requests
4. **Console Logs**: Verify debug information in development mode

## 🔧 Configuration

### Performance Monitoring Configuration

```typescript
// Firebase Performance automatically initialized
const performance = getPerformance(app);

// Custom trace configuration
class PerformanceMonitor {
  // Trace management with automatic cleanup
  private static traces: Map<string, any> = new Map();
  
  // Quiz-specific performance tracking
  static trackQuizPerformance(quizId: string, action: string): void {
    const traceName = `quiz_${action}_${quizId}`;
    this.startTrace(traceName);
  }
}
```

### Sentry Configuration

```typescript
Sentry.init({
  dsn: "https://2a6d650b5d7f45f1fe5f36299ad5dc18@o4509709733593088.ingest.us.sentry.io/4509709734707200",
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
});
```

## 🎯 Best Practices

### Performance Monitoring

1. **Use Meaningful Trace Names**
   ```typescript
   // Good
   PerformanceMonitor.startTrace('quiz_loading_customer_ops');
   
   // Avoid
   PerformanceMonitor.startTrace('operation');
   ```

2. **Add Relevant Attributes**
   ```typescript
   PerformanceMonitor.addTraceAttribute('quiz_loading', 'difficulty', 'advanced');
   PerformanceMonitor.addTraceAttribute('quiz_loading', 'category', 'customer_operations');
   ```

3. **Track Business Metrics**
   ```typescript
   PerformanceMonitor.addTraceMetric('quiz_completion', 'score', 85);
   PerformanceMonitor.addTraceMetric('quiz_completion', 'time_per_question', 12);
   ```

### Error Tracking

1. **Provide Context**
   ```typescript
   ErrorTracker.captureException(error, {
     quiz: {
       id: quizId,
       question_index: currentQuestion,
       difficulty: 'advanced'
     },
     user: {
       role: 'agent',
       department: 'customer_operations'
     }
   });
   ```

2. **Use Breadcrumbs**
   ```typescript
   ErrorTracker.addBreadcrumb('Quiz started', 'navigation');
   ErrorTracker.addBreadcrumb('Question answered', 'user_action');
   ErrorTracker.addBreadcrumb('Quiz completed', 'navigation');
   ```

3. **Set User Context**
   ```typescript
   // After successful login
   ErrorTracker.setUser({
     id: user.id,
     email: user.email,
     username: user.name
   });
   ```

## 🚨 Alert Configuration

### Recommended Sentry Alerts

1. **High Error Rate**: >5% error rate in 5 minutes
2. **New Issues**: Alert on first occurrence of new errors
3. **Performance Degradation**: P95 response time >2 seconds
4. **Authentication Failures**: >10% auth failure rate

### Firebase Performance Alerts

1. **Slow Traces**: Custom traces >3 seconds
2. **High Network Latency**: API requests >2 seconds
3. **Poor Page Performance**: LCP >2.5 seconds

## 🔍 Debugging & Troubleshooting

### Common Issues

1. **Sentry Not Capturing Errors**
   - Check DSN configuration
   - Verify environment filtering
   - Ensure error boundary is properly wrapped

2. **Firebase Performance Not Showing Data**
   - Verify Firebase project configuration
   - Check app initialization
   - Ensure traces are properly started and stopped

3. **High Performance Overhead**
   - Reduce trace sample rate
   - Optimize trace attribute usage
   - Remove unnecessary custom traces

### Debug Mode

Enable debug logging:

```typescript
// Development environment
if (import.meta.env.MODE === 'development') {
  console.log('Performance trace started:', traceName);
  console.log('Error captured:', error.message);
}
```

## 📊 Metrics & KPIs

### Performance KPIs

- **Quiz Load Time**: <2 seconds
- **Authentication Time**: <1 second  
- **Database Query Time**: <500ms
- **Page Load Time**: <3 seconds
- **First Contentful Paint**: <1.5 seconds

### Error Rate KPIs

- **Overall Error Rate**: <1%
- **Authentication Error Rate**: <0.5%
- **Quiz Completion Rate**: >95%
- **Database Error Rate**: <0.1%

### User Experience KPIs

- **Quiz Abandonment Rate**: <10%
- **Question Response Time**: <30 seconds average
- **Session Duration**: Track average session length
- **Retry Rate**: Track quiz retry frequency

## 🔄 Maintenance

### Regular Tasks

1. **Weekly Review**
   - Check error trends
   - Review performance metrics
   - Update alert thresholds

2. **Monthly Analysis**
   - Performance trend analysis
   - User experience metrics review
   - Infrastructure optimization

3. **Quarterly Planning**
   - Set new performance targets
   - Review monitoring strategy
   - Plan infrastructure improvements

### Data Retention

- **Sentry**: 90 days (configurable)
- **Firebase Performance**: 30 days default
- **Custom Metrics**: Export for long-term storage

## 🔗 Resources

- [Firebase Performance Documentation](https://firebase.google.com/docs/perf-mon)
- [Sentry React Documentation](https://docs.sentry.io/platforms/javascript/guides/react/)
- [Web Vitals Guide](https://web.dev/vitals/)
- [React Performance Best Practices](https://react.dev/learn/render-and-commit)

## 📝 Implementation Checklist

- [x] Install required packages (@sentry/react, @sentry/tracing)
- [x] Configure Firebase Performance with existing Firebase setup
- [x] Configure Sentry error tracking with production DSN
- [x] Implement PerformanceMonitor class with custom traces
- [x] Implement ErrorTracker class with comprehensive error handling
- [x] Add error boundary to App.tsx with fallback UI
- [x] Integrate monitoring in AuthContext (login/logout tracking)
- [x] Integrate monitoring in QuizEngine (quiz performance tracking)
- [x] Add development testing panel with verification buttons
- [x] Configure Session Replay for user interaction recording
- [x] Set up console logging integration for automatic log capture
- [x] Configure environment-specific sampling rates
- [ ] Set up monitoring dashboards and alerts
- [ ] Configure Sentry release tracking for deployments
- [ ] Test error tracking in staging environment
- [ ] Validate performance metrics with real usage
- [ ] Train team on monitoring tools and best practices
- [ ] Set up automated alerting for critical errors
- [ ] Document incident response procedures

---

*This monitoring setup provides comprehensive visibility into Quiz Hub CX Spark performance and reliability. Regular monitoring and optimization based on these metrics will ensure optimal user experience.*
