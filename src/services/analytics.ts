import mixpanel from 'mixpanel-browser';

// Initialize Mixpanel
const MIXPANEL_TOKEN = import.meta.env.VITE_MIXPANEL_PROJECT_TOKEN;

if (MIXPANEL_TOKEN) {
  mixpanel.init(MIXPANEL_TOKEN, {
    debug: import.meta.env.DEV,
    track_pageview: true,
    persistence: 'localStorage',
    ignore_dnt: false
  });
} else {
  console.warn('Mixpanel token not found. Analytics will not be tracked.');
}

// Types for events
export interface UserProperties {
  email?: string;
  role?: string;
  department?: string;
  name?: string;
  created_at?: string;
}

export interface QuizEventProperties {
  topic_id?: string;
  topic_name?: string;
  category?: string;
  difficulty?: string;
  question_count?: number;
  score?: number;
  accuracy?: number;
  time_taken?: number;
  questions_correct?: number;
  questions_incorrect?: number;
}

export interface NavigationEventProperties {
  from_page?: string;
  to_page?: string;
  user_role?: string;
}

class MixpanelService {
  private isEnabled: boolean;

  constructor() {
    this.isEnabled = !!MIXPANEL_TOKEN;
  }

  // User Management
  identify(userId: string, properties?: UserProperties) {
    if (!this.isEnabled) return;
    
    mixpanel.identify(userId);
    if (properties) {
      mixpanel.people.set(properties);
    }
  }

  setUserProperties(properties: UserProperties) {
    if (!this.isEnabled) return;
    
    mixpanel.people.set(properties);
  }

  // Authentication Events
  trackLogin(method: 'email' | 'google', userRole: string) {
    if (!this.isEnabled) return;
    
    mixpanel.track('User Login', {
      login_method: method,
      user_role: userRole,
      timestamp: new Date().toISOString()
    });
  }

  trackLogout() {
    if (!this.isEnabled) return;
    
    mixpanel.track('User Logout', {
      timestamp: new Date().toISOString()
    });
  }

  trackRegistration(userRole: string, registrationMethod: string) {
    if (!this.isEnabled) return;
    
    mixpanel.track('User Registration', {
      user_role: userRole,
      registration_method: registrationMethod,
      timestamp: new Date().toISOString()
    });
  }

  // Quiz Events
  trackQuizStarted(properties: QuizEventProperties) {
    if (!this.isEnabled) return;
    
    mixpanel.track('Quiz Started', {
      ...properties,
      timestamp: new Date().toISOString()
    });
  }

  trackQuizCompleted(properties: QuizEventProperties) {
    if (!this.isEnabled) return;
    
    mixpanel.track('Quiz Completed', {
      ...properties,
      timestamp: new Date().toISOString()
    });
  }

  trackQuizAbandoned(properties: Partial<QuizEventProperties> & { questions_answered?: number }) {
    if (!this.isEnabled) return;
    
    mixpanel.track('Quiz Abandoned', {
      ...properties,
      timestamp: new Date().toISOString()
    });
  }

  trackQuestionAnswered(properties: {
    topic_id?: string;
    question_id?: string;
    question_type?: string;
    difficulty?: string;
    is_correct?: boolean;
    time_taken?: number;
    user_answer?: string;
  }) {
    if (!this.isEnabled) return;
    
    mixpanel.track('Question Answered', {
      ...properties,
      timestamp: new Date().toISOString()
    });
  }

  // Navigation Events
  trackPageView(pageName: string, properties?: NavigationEventProperties) {
    if (!this.isEnabled) return;
    
    mixpanel.track('Page View', {
      page_name: pageName,
      ...properties,
      timestamp: new Date().toISOString()
    });
  }

  trackNavigation(properties: NavigationEventProperties) {
    if (!this.isEnabled) return;
    
    mixpanel.track('Navigation', {
      ...properties,
      timestamp: new Date().toISOString()
    });
  }

  // Admin Events
  trackTopicCreated(properties: {
    topic_id?: string;
    topic_name?: string;
    category?: string;
    created_by?: string;
  }) {
    if (!this.isEnabled) return;
    
    mixpanel.track('Topic Created', {
      ...properties,
      timestamp: new Date().toISOString()
    });
  }

  trackQuestionCreated(properties: {
    question_id?: string;
    topic_id?: string;
    question_type?: string;
    difficulty?: string;
    created_by?: string;
  }) {
    if (!this.isEnabled) return;
    
    mixpanel.track('Question Created', {
      ...properties,
      timestamp: new Date().toISOString()
    });
  }

  trackBulkImport(properties: {
    import_type?: 'csv';
    questions_imported?: number;
    topics_affected?: number;
    import_source?: string;
  }) {
    if (!this.isEnabled) return;
    
    mixpanel.track('Bulk Import', {
      ...properties,
      timestamp: new Date().toISOString()
    });
  }

  // Engagement Events
  trackLeaderboardView(properties: {
    view_type?: 'weekly' | 'all_time';
    user_rank?: number;
    total_users?: number;
  }) {
    if (!this.isEnabled) return;
    
    mixpanel.track('Leaderboard Viewed', {
      ...properties,
      timestamp: new Date().toISOString()
    });
  }

  trackDashboardView() {
    if (!this.isEnabled) return;
    
    mixpanel.track('Dashboard Viewed', {
      timestamp: new Date().toISOString()
    });
  }

  trackFeatureUsed(featureName: string, properties?: Record<string, any>) {
    if (!this.isEnabled) return;
    
    mixpanel.track('Feature Used', {
      feature_name: featureName,
      ...properties,
      timestamp: new Date().toISOString()
    });
  }

  // Performance Events
  trackPerformanceMetric(properties: {
    metric_type: 'page_load' | 'quiz_load' | 'api_response';
    duration_ms: number;
    page_name?: string;
    api_endpoint?: string;
  }) {
    if (!this.isEnabled) return;
    
    mixpanel.track('Performance Metric', {
      ...properties,
      timestamp: new Date().toISOString()
    });
  }

  // Error Events
  trackError(properties: {
    error_type: 'authentication' | 'api' | 'ui' | 'quiz';
    error_message: string;
    error_code?: string;
    page_name?: string;
    user_action?: string;
  }) {
    if (!this.isEnabled) return;
    
    mixpanel.track('Error Occurred', {
      ...properties,
      timestamp: new Date().toISOString()
    });
  }

  // Custom Events
  track(eventName: string, properties?: Record<string, any>) {
    if (!this.isEnabled) return;
    
    mixpanel.track(eventName, {
      ...properties,
      timestamp: new Date().toISOString()
    });
  }

  // Utility Methods
  reset() {
    if (!this.isEnabled) return;
    
    mixpanel.reset();
  }

  alias(newId: string) {
    if (!this.isEnabled) return;
    
    mixpanel.alias(newId);
  }

  // Time-based Events
  timeEvent(eventName: string) {
    if (!this.isEnabled) return;
    
    mixpanel.time_event(eventName);
  }

  // A/B Testing Support
  trackExperiment(experimentName: string, variant: string, properties?: Record<string, any>) {
    if (!this.isEnabled) return;
    
    mixpanel.track('Experiment Viewed', {
      experiment_name: experimentName,
      variant: variant,
      ...properties,
      timestamp: new Date().toISOString()
    });
  }
}

// Export singleton instance
export const analytics = new MixpanelService();

// Export mixpanel instance for advanced usage
export { mixpanel };

export default analytics;
