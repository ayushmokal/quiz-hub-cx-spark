import { useState, useEffect } from 'react';
import { History, User, Clock, Filter } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../hooks/use-toast';
import { auditAPI } from '../../services/api';
import { AuditLog } from '../../types';

export function AuditLogViewer() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterTable, setFilterTable] = useState<string>('all');

  // Check user permissions
  const canViewAuditLogs = user?.role === 'admin' || user?.role === 'coach';

  useEffect(() => {
    if (!canViewAuditLogs) return;
    loadAuditLogs();
  }, [canViewAuditLogs, filterTable]);

  const loadAuditLogs = async () => {
    try {
      setIsLoading(true);
      const logs = await auditAPI.getAuditLogs(
        filterTable === 'all' ? undefined : filterTable,
        undefined,
        100
      );
      setAuditLogs(logs);
    } catch (error) {
      console.error('Error loading audit logs:', error);
      toast({
        title: "Error Loading Audit Logs",
        description: "Failed to load audit logs. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'CREATE': return 'text-[hsl(var(--success))]';
      case 'UPDATE': return 'text-[hsl(var(--warning))]';
      case 'DELETE': return 'text-destructive';
      default: return 'text-muted-foreground';
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'CREATE': return '➕';
      case 'UPDATE': return '✏️';
      case 'DELETE': return '🗑️';
      default: return '📝';
    }
  };

  const formatChangeDetails = (log: AuditLog) => {
    if (log.action === 'CREATE') {
      if (log.tableName === 'topics') {
        return `Created topic "${log.newValues?.display_name}"`;
      } else if (log.tableName === 'questions') {
        return `Created question in topic`;
      }
    } else if (log.action === 'UPDATE') {
      if (log.tableName === 'topics') {
        const oldName = log.oldValues?.display_name;
        const newName = log.newValues?.display_name;
        if (oldName !== newName) {
          return `Renamed topic from "${oldName}" to "${newName}"`;
        }
        return `Updated topic "${newName}"`;
      } else if (log.tableName === 'questions') {
        return `Updated question`;
      }
    } else if (log.action === 'DELETE') {
      if (log.tableName === 'topics') {
        return `Deleted topic "${log.oldValues?.display_name}"`;
      } else if (log.tableName === 'questions') {
        return `Deleted question`;
      }
    }
    return `${log.action.toLowerCase()} ${log.tableName.slice(0, -1)}`;
  };

  const getChangedFields = (log: AuditLog): string[] => {
    if (!log.oldValues || !log.newValues) return [];
    
    const changes: string[] = [];
    const oldValues = log.oldValues;
    const newValues = log.newValues;
    
    Object.keys(newValues).forEach(key => {
      if (oldValues[key] !== newValues[key] && key !== 'updated_at') {
        changes.push(key);
      }
    });
    
    return changes;
  };

  if (!canViewAuditLogs) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🔒</div>
        <h3 className="text-lg font-semibold text-foreground mb-2">Access Denied</h3>
        <p className="text-muted-foreground">
          Only admins and coaches can view audit logs.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading audit logs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Audit Log</h1>
          <p className="text-muted-foreground">
            Track all changes to topics and questions with user attribution
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={filterTable} onValueChange={setFilterTable}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Tables</SelectItem>
              <SelectItem value="topics">Topics Only</SelectItem>
              <SelectItem value="questions">Questions Only</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={loadAuditLogs} size="sm">
            <History className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Audit Logs */}
      <div className="space-y-4">
        {auditLogs.map((log) => (
          <Card key={log.id} className="quiz-card">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                {/* Action Icon */}
                <div className={`text-2xl mt-1 ${getActionColor(log.action)}`}>
                  {getActionIcon(log.action)}
                </div>

                {/* Main Content */}
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className={getActionColor(log.action)}>
                        {log.action}
                      </Badge>
                      <Badge variant="outline">
                        {log.tableName}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      {formatDate(log.changedAt)}
                    </div>
                  </div>

                  <h3 className="font-semibold text-foreground mb-1">
                    {formatChangeDetails(log)}
                  </h3>

                  {/* Changed Fields */}
                  {log.action === 'UPDATE' && (
                    <div className="mb-3">
                      <p className="text-sm text-muted-foreground">
                        Changed fields: {getChangedFields(log).join(', ') || 'Various fields'}
                      </p>
                    </div>
                  )}

                  {/* User Info */}
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className="text-xs">
                        {log.user?.name?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm text-muted-foreground">
                      {log.user?.name || 'Unknown User'} ({log.user?.email || 'unknown@email.com'})
                    </span>
                  </div>
                </div>
              </div>

              {/* Detailed Changes (Expandable) */}
              {(log.oldValues || log.newValues) && (
                <details className="mt-4 text-xs">
                  <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                    View detailed changes
                  </summary>
                  <div className="mt-2 p-3 bg-muted/30 rounded-lg space-y-2">
                    {log.oldValues && (
                      <div>
                        <strong>Old Values:</strong>
                        <pre className="text-xs bg-muted p-2 rounded mt-1 overflow-x-auto">
                          {JSON.stringify(log.oldValues, null, 2)}
                        </pre>
                      </div>
                    )}
                    {log.newValues && (
                      <div>
                        <strong>New Values:</strong>
                        <pre className="text-xs bg-muted p-2 rounded mt-1 overflow-x-auto">
                          {JSON.stringify(log.newValues, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                </details>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {auditLogs.length === 0 && (
        <Card className="quiz-card">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="text-6xl mb-4">📋</div>
            <h3 className="text-lg font-semibold text-foreground mb-2">No Audit Logs</h3>
            <p className="text-muted-foreground text-center">
              {filterTable === 'all' 
                ? 'No changes have been recorded yet.' 
                : `No ${filterTable} changes have been recorded yet.`
              }
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 