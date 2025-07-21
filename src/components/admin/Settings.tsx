import { useState, useEffect } from 'react';
import { Save, RefreshCw, Database, Shield, Users, FileText, Bell, Palette } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Switch } from '../ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Separator } from '../ui/separator';
import { Badge } from '../ui/badge';
import { useToast } from '../../hooks/use-toast';
import { useAuth } from '../../contexts/AuthContext';

interface AppSettings {
  general: {
    appName: string;
    tagline: string;
    description: string;
    supportEmail: string;
    maxUsers: number;
  };
  quiz: {
    defaultTimeLimit: number;
    passingScore: number;
    maxAttempts: number;
    randomizeQuestions: boolean;
    showCorrectAnswers: boolean;
  };
  notifications: {
    emailNotifications: boolean;
    pushNotifications: boolean;
    reminderEmails: boolean;
    digestFrequency: 'daily' | 'weekly' | 'monthly' | 'never';
  };
  security: {
    sessionTimeout: number;
    passwordPolicy: 'basic' | 'medium' | 'strict';
    twoFactorAuth: boolean;
    loginAttempts: number;
  };
  appearance: {
    theme: 'light' | 'dark' | 'auto';
    primaryColor: string;
    logoUrl: string;
    faviconUrl: string;
  };
}

export function Settings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  
  const [settings, setSettings] = useState<AppSettings>({
    general: {
      appName: 'CX Ultra Quiz',
      tagline: 'Personalised, Predictive, Proven',
      description: 'Advanced customer experience training platform powered by Ultrahuman',
      supportEmail: 'support@ultrahuman.com',
      maxUsers: 1000
    },
    quiz: {
      defaultTimeLimit: 30,
      passingScore: 70,
      maxAttempts: 3,
      randomizeQuestions: true,
      showCorrectAnswers: true
    },
    notifications: {
      emailNotifications: true,
      pushNotifications: false,
      reminderEmails: true,
      digestFrequency: 'weekly'
    },
    security: {
      sessionTimeout: 480, // 8 hours in minutes
      passwordPolicy: 'medium',
      twoFactorAuth: false,
      loginAttempts: 5
    },
    appearance: {
      theme: 'light',
      primaryColor: '#FF0000',
      logoUrl: '',
      faviconUrl: ''
    }
  });

  // Check if user has admin permissions
  const canManageSettings = user?.role === 'admin';

  if (!canManageSettings) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Shield className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Restricted</h2>
          <p className="text-gray-600">Only administrators can access system settings.</p>
        </div>
      </div>
    );
  }

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Here you would save to your backend/Firebase
      // await settingsAPI.updateSettings(settings);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Settings Saved",
        description: "All settings have been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    // Reset to default values
    setSettings({
      general: {
        appName: 'CX Ultra Quiz',
        tagline: 'Personalised, Predictive, Proven',
        description: 'Advanced customer experience training platform powered by Ultrahuman',
        supportEmail: 'support@ultrahuman.com',
        maxUsers: 1000
      },
      quiz: {
        defaultTimeLimit: 30,
        passingScore: 70,
        maxAttempts: 3,
        randomizeQuestions: true,
        showCorrectAnswers: true
      },
      notifications: {
        emailNotifications: true,
        pushNotifications: false,
        reminderEmails: true,
        digestFrequency: 'weekly'
      },
      security: {
        sessionTimeout: 480,
        passwordPolicy: 'medium',
        twoFactorAuth: false,
        loginAttempts: 5
      },
      appearance: {
        theme: 'light',
        primaryColor: '#FF0000',
        logoUrl: '',
        faviconUrl: ''
      }
    });
    
    toast({
      title: "Settings Reset",
      description: "All settings have been reset to default values.",
    });
  };

  const tabs = [
    { id: 'general', label: 'General', icon: FileText },
    { id: 'quiz', label: 'Quiz Settings', icon: Database },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'appearance', label: 'Appearance', icon: Palette }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'general':
        return (
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="appName">Application Name</Label>
                <Input
                  id="appName"
                  value={settings.general.appName}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    general: { ...prev.general, appName: e.target.value }
                  }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tagline">Tagline</Label>
                <Input
                  id="tagline"
                  value={settings.general.tagline}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    general: { ...prev.general, tagline: e.target.value }
                  }))}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={settings.general.description}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  general: { ...prev.general, description: e.target.value }
                }))}
              />
            </div>
            
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="supportEmail">Support Email</Label>
                <Input
                  id="supportEmail"
                  type="email"
                  value={settings.general.supportEmail}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    general: { ...prev.general, supportEmail: e.target.value }
                  }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxUsers">Maximum Users</Label>
                <Input
                  id="maxUsers"
                  type="number"
                  value={settings.general.maxUsers}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    general: { ...prev.general, maxUsers: parseInt(e.target.value) || 0 }
                  }))}
                />
              </div>
            </div>
          </div>
        );

      case 'quiz':
        return (
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="defaultTimeLimit">Default Time Limit (seconds)</Label>
                <Input
                  id="defaultTimeLimit"
                  type="number"
                  value={settings.quiz.defaultTimeLimit}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    quiz: { ...prev.quiz, defaultTimeLimit: parseInt(e.target.value) || 0 }
                  }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="passingScore">Passing Score (%)</Label>
                <Input
                  id="passingScore"
                  type="number"
                  min="0"
                  max="100"
                  value={settings.quiz.passingScore}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    quiz: { ...prev.quiz, passingScore: parseInt(e.target.value) || 0 }
                  }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxAttempts">Maximum Attempts</Label>
                <Input
                  id="maxAttempts"
                  type="number"
                  min="1"
                  value={settings.quiz.maxAttempts}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    quiz: { ...prev.quiz, maxAttempts: parseInt(e.target.value) || 1 }
                  }))}
                />
              </div>
            </div>
            
            <Separator />
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Randomize Question Order</Label>
                  <p className="text-sm text-gray-600">Shuffle questions for each quiz attempt</p>
                </div>
                <Switch
                  checked={settings.quiz.randomizeQuestions}
                  onCheckedChange={(checked) => setSettings(prev => ({
                    ...prev,
                    quiz: { ...prev.quiz, randomizeQuestions: checked }
                  }))}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Show Correct Answers</Label>
                  <p className="text-sm text-gray-600">Display correct answers after quiz completion</p>
                </div>
                <Switch
                  checked={settings.quiz.showCorrectAnswers}
                  onCheckedChange={(checked) => setSettings(prev => ({
                    ...prev,
                    quiz: { ...prev.quiz, showCorrectAnswers: checked }
                  }))}
                />
              </div>
            </div>
          </div>
        );

      case 'notifications':
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Email Notifications</Label>
                  <p className="text-sm text-gray-600">Send email notifications for important events</p>
                </div>
                <Switch
                  checked={settings.notifications.emailNotifications}
                  onCheckedChange={(checked) => setSettings(prev => ({
                    ...prev,
                    notifications: { ...prev.notifications, emailNotifications: checked }
                  }))}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Push Notifications</Label>
                  <p className="text-sm text-gray-600">Browser push notifications (coming soon)</p>
                </div>
                <Switch
                  checked={settings.notifications.pushNotifications}
                  onCheckedChange={(checked) => setSettings(prev => ({
                    ...prev,
                    notifications: { ...prev.notifications, pushNotifications: checked }
                  }))}
                  disabled
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Reminder Emails</Label>
                  <p className="text-sm text-gray-600">Send reminders for incomplete quizzes</p>
                </div>
                <Switch
                  checked={settings.notifications.reminderEmails}
                  onCheckedChange={(checked) => setSettings(prev => ({
                    ...prev,
                    notifications: { ...prev.notifications, reminderEmails: checked }
                  }))}
                />
              </div>
            </div>
            
            <Separator />
            
            <div className="space-y-2">
              <Label htmlFor="digestFrequency">Digest Email Frequency</Label>
              <Select
                value={settings.notifications.digestFrequency}
                onValueChange={(value: 'daily' | 'weekly' | 'monthly' | 'never') => 
                  setSettings(prev => ({
                    ...prev,
                    notifications: { ...prev.notifications, digestFrequency: value }
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="never">Never</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case 'security':
        return (
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                <Input
                  id="sessionTimeout"
                  type="number"
                  min="30"
                  max="1440"
                  value={settings.security.sessionTimeout}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    security: { ...prev.security, sessionTimeout: parseInt(e.target.value) || 30 }
                  }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="loginAttempts">Max Login Attempts</Label>
                <Input
                  id="loginAttempts"
                  type="number"
                  min="3"
                  max="10"
                  value={settings.security.loginAttempts}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    security: { ...prev.security, loginAttempts: parseInt(e.target.value) || 3 }
                  }))}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="passwordPolicy">Password Policy</Label>
              <Select
                value={settings.security.passwordPolicy}
                onValueChange={(value: 'basic' | 'medium' | 'strict') => 
                  setSettings(prev => ({
                    ...prev,
                    security: { ...prev.security, passwordPolicy: value }
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="basic">Basic (8+ characters)</SelectItem>
                  <SelectItem value="medium">Medium (8+ chars, mixed case, numbers)</SelectItem>
                  <SelectItem value="strict">Strict (12+ chars, mixed case, numbers, symbols)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Two-Factor Authentication</Label>
                <p className="text-sm text-gray-600">Require 2FA for admin accounts (coming soon)</p>
              </div>
              <Switch
                checked={settings.security.twoFactorAuth}
                onCheckedChange={(checked) => setSettings(prev => ({
                  ...prev,
                  security: { ...prev.security, twoFactorAuth: checked }
                }))}
                disabled
              />
            </div>
          </div>
        );

      case 'appearance':
        return (
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="theme">Theme</Label>
                <Select
                  value={settings.appearance.theme}
                  onValueChange={(value: 'light' | 'dark' | 'auto') => 
                    setSettings(prev => ({
                      ...prev,
                      appearance: { ...prev.appearance, theme: value }
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark (coming soon)</SelectItem>
                    <SelectItem value="auto">Auto (coming soon)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="primaryColor">Primary Color</Label>
                <Input
                  id="primaryColor"
                  type="color"
                  value={settings.appearance.primaryColor}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    appearance: { ...prev.appearance, primaryColor: e.target.value }
                  }))}
                />
              </div>
            </div>
            
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="logoUrl">Logo URL</Label>
                <Input
                  id="logoUrl"
                  type="url"
                  value={settings.appearance.logoUrl}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    appearance: { ...prev.appearance, logoUrl: e.target.value }
                  }))}
                  placeholder="https://example.com/logo.png"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="faviconUrl">Favicon URL</Label>
                <Input
                  id="faviconUrl"
                  type="url"
                  value={settings.appearance.faviconUrl}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    appearance: { ...prev.appearance, faviconUrl: e.target.value }
                  }))}
                  placeholder="https://example.com/favicon.ico"
                />
              </div>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> Theme and branding changes will be available in a future update. 
                The current Ultrahuman design system will remain active.
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-black">Settings</h1>
          <p className="text-[#46494D]">
            Configure your CX Ultra Quiz application settings
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleReset}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Reset to Defaults
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-gradient-to-r from-[#FF0000] to-[#FF4500] hover:from-[#FF4500] hover:to-[#FD9400]"
          >
            {isSaving ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Settings
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        {/* Sidebar Navigation */}
        <div className="md:col-span-1">
          <Card>
            <CardContent className="p-4">
              <nav className="space-y-1">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                        activeTab === tab.id
                          ? 'bg-[#FF0000] text-white'
                          : 'text-[#46494D] hover:bg-gray-100'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      {tab.label}
                    </button>
                  );
                })}
              </nav>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="md:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {(() => {
                  const currentTab = tabs.find(tab => tab.id === activeTab);
                  const Icon = currentTab?.icon;
                  return Icon && <Icon className="h-5 w-5" />;
                })()}
                {tabs.find(tab => tab.id === activeTab)?.label}
              </CardTitle>
              <CardDescription>
                {activeTab === 'general' && 'Basic application information and limits'}
                {activeTab === 'quiz' && 'Default quiz behavior and scoring settings'}
                {activeTab === 'notifications' && 'Email and notification preferences'}
                {activeTab === 'security' && 'Security policies and authentication settings'}
                {activeTab === 'appearance' && 'Customize the look and feel of your application'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {renderTabContent()}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
