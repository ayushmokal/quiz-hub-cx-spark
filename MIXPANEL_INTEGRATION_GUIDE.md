# Mixpanel Analytics Integration Guide

This document outlines the Mixpanel analytics integration implemented in the Quiz Hub CX Spark application.

## Overview

Mixpanel has been integrated to track user behavior, quiz performance, and platform engagement across the entire application. The integration provides comprehensive insights into how users interact with the platform.

## Configuration

### Environment Variables

Add the following environment variable to your `.env` file:

```env
VITE_MIXPANEL_PROJECT_TOKEN=c0cee500afba02113c9e4b86d1da7de7
```

### Installation

Mixpanel is installed via npm:

```bash
npm install mixpanel-browser
```

## Analytics Service

The analytics functionality is centralized in `/src/services/analytics.ts` which provides a comprehensive service layer for tracking various events.

### Key Features

- **Automatic User Identification**: Users are automatically identified upon authentication
- **Error Handling**: Graceful fallback when Mixpanel is not configured
- **Type Safety**: Full TypeScript support with proper event interfaces
- **Comprehensive Event Tracking**: Covers all major user interactions

## Tracked Events

### Authentication Events

| Event | Properties | Triggered When |
|-------|------------|----------------|
| `User Login` | `login_method`, `user_role` | User successfully logs in |
| `User Logout` | - | User logs out |
| `User Registration` | `user_role`, `registration_method` | New user is created |

### Quiz Events

| Event | Properties | Triggered When |
|-------|------------|----------------|
| `Quiz Started` | `topic_id`, `topic_name`, `category`, `question_count` | User starts a quiz |
| `Quiz Completed` | `score`, `accuracy`, `time_taken`, `questions_correct`, `questions_incorrect` | User completes a quiz |
| `Quiz Abandoned` | `questions_answered`, `question_count` | User exits quiz before completion |
| `Question Answered` | `question_id`, `is_correct`, `time_taken`, `difficulty` | User answers a question |

### Navigation Events

| Event | Properties | Triggered When |
|-------|------------|----------------|
| `Page View` | `page_name`, `user_role` | User navigates to a page |
| `Navigation` | `from_page`, `to_page`, `user_role` | User navigates between pages |
| `Dashboard Viewed` | - | User views dashboard |
| `Leaderboard Viewed` | `view_type`, `total_users` | User views leaderboard |

### Engagement Events

| Event | Properties | Triggered When |
|-------|------------|----------------|
| `Feature Used` | `feature_name` | User interacts with specific features |
| `Performance Metric` | `metric_type`, `duration_ms` | Performance metrics are recorded |
| `Error Occurred` | `error_type`, `error_message` | Errors occur in the application |

### Admin Events

| Event | Properties | Triggered When |
|-------|------------|----------------|
| `Topic Created` | `topic_id`, `topic_name`, `category` | Admin creates a new topic |
| `Question Created` | `question_id`, `topic_id`, `difficulty` | Admin creates a new question |
| `Bulk Import` | `questions_imported`, `topics_affected` | Admin performs bulk CSV import |

## User Properties

The following user properties are automatically set when a user is identified:

```typescript
{
  email: string;
  role: 'agent' | 'coach' | 'admin';
  department?: string;
  name: string;
  created_at: string;
}
```

## Implementation Examples

### Basic Event Tracking

```typescript
import { analytics } from '../services/analytics';

// Track a simple event
analytics.track('Custom Event', {
  property1: 'value1',
  property2: 'value2'
});
```

### Quiz Performance Tracking

```typescript
// Track quiz completion
analytics.trackQuizCompleted({
  topic_id: 'topic-123',
  topic_name: 'Customer Support Basics',
  category: 'training',
  score: 85,
  accuracy: 87.5,
  time_taken: 450,
  questions_correct: 7,
  questions_incorrect: 1
});
```

### User Authentication Tracking

```typescript
// Track user login
analytics.trackLogin('email', 'agent');

// Set user properties
analytics.setUserProperties({
  email: 'user@ultrahuman.com',
  role: 'agent',
  department: 'customer-support'
});
```

### Error Tracking

```typescript
// Track errors
analytics.trackError({
  error_type: 'api',
  error_message: 'Failed to load quiz questions',
  page_name: 'quiz-selection',
  user_action: 'start_quiz'
});
```

## Integration Points

### Authentication Context
- User identification on login
- Property updates on profile changes
- Session cleanup on logout

### Quiz Engine
- Quiz start/completion tracking
- Individual question tracking
- Abandonment detection
- Performance metrics

### Dashboard
- Page view tracking
- Feature interaction tracking
- KPI visualization events

### Navigation
- Route change tracking
- User flow analysis
- Feature discovery patterns

### Admin Functions
- Content creation tracking
- User management events
- System configuration changes

## Analytics Dashboard

### Key Metrics to Monitor

1. **User Engagement**
   - Daily/Weekly active users
   - Session duration
   - Feature adoption rates
   - Page view patterns

2. **Quiz Performance**
   - Completion rates by topic
   - Average scores and accuracy
   - Time spent per question
   - Difficulty analysis

3. **Learning Effectiveness**
   - Knowledge retention rates
   - Improvement over time
   - Common mistake patterns
   - Topic effectiveness

4. **Platform Health**
   - Error rates by type
   - Performance metrics
   - User satisfaction indicators
   - Feature usage distribution

### Recommended Mixpanel Reports

1. **User Funnel**: Registration → First Quiz → Quiz Completion
2. **Retention Cohorts**: Weekly/Monthly user retention
3. **Feature Adoption**: New feature usage over time
4. **Performance Dashboard**: Quiz scores and completion rates
5. **Error Monitoring**: Error frequency and impact analysis

## Privacy and Compliance

- No personally identifiable information (PII) is tracked beyond email and name
- User consent is implied through platform usage
- Data retention follows Mixpanel's standard policies
- All tracking can be disabled by removing the project token

## Debugging

### Development Mode
- Debug mode is automatically enabled in development
- Console logs show all tracked events
- Mixpanel debugger can be used for real-time validation

### Production Verification
```javascript
// Check if Mixpanel is properly initialized
console.log('Mixpanel initialized:', !!window.mixpanel);

// Verify events are being sent
mixpanel.track('Test Event', { test: true });
```

## Future Enhancements

1. **A/B Testing**: Implement feature flags and experiment tracking
2. **Advanced Segmentation**: User behavior clustering and analysis
3. **Real-time Dashboards**: Live performance monitoring
4. **Predictive Analytics**: ML-based insights and recommendations
5. **Custom Event Properties**: Domain-specific tracking parameters

## Troubleshooting

### Common Issues

1. **Events not appearing in Mixpanel**
   - Verify project token is correct
   - Check network connectivity
   - Ensure events are properly formatted

2. **Development vs Production data**
   - Use different project tokens for different environments
   - Filter development data in Mixpanel reports

3. **Performance impact**
   - Mixpanel events are sent asynchronously
   - No impact on UI rendering or user experience
   - Failed events don't affect application functionality

## Support

For questions or issues with the Mixpanel integration:

1. Check the [Mixpanel Documentation](https://docs.mixpanel.com/)
2. Review the analytics service implementation
3. Contact the development team for platform-specific questions

---

**Last Updated**: July 22, 2025  
**Integration Version**: 1.0  
**Mixpanel Project**: c0cee500afba02113c9e4b86d1da7de7
