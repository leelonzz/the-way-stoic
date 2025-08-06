'use client';

import React, { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter, Download, Calendar, Clock, AlertCircle, Info, AlertTriangle, Bug } from 'lucide-react';

interface LogEntry {
  id: string;
  timestamp: Date;
  level: 'error' | 'warning' | 'info' | 'debug';
  message: string;
  source: string;
  details?: string;
}

const mockLogs: LogEntry[] = [
  {
    id: '1',
    timestamp: new Date('2024-01-20T10:30:00Z'),
    level: 'info',
    message: 'User logged in successfully',
    source: 'Authentication',
    details: 'OAuth login via Google'
  },
  {
    id: '2',
    timestamp: new Date('2024-01-20T10:25:00Z'),
    level: 'warning',
    message: 'Slow database query detected',
    source: 'Database',
    details: 'Query took 2.3s to execute'
  },
  {
    id: '3',
    timestamp: new Date('2024-01-20T10:20:00Z'),
    level: 'error',
    message: 'API rate limit exceeded',
    source: 'External API',
    details: 'Gemini API returned 429 status'
  },
  {
    id: '4',
    timestamp: new Date('2024-01-20T10:15:00Z'),
    level: 'debug',
    message: 'Cache miss for user preferences',
    source: 'Cache',
    details: 'Fetching from database instead'
  },
  {
    id: '5',
    timestamp: new Date('2024-01-20T10:10:00Z'),
    level: 'info',
    message: 'Daily quote updated',
    source: 'Scheduler',
    details: 'Marcus Aurelius quote for today'
  }
];

const getLevelIcon = (level: string) => {
  switch (level) {
    case 'error':
      return <AlertCircle className="w-4 h-4 text-red-500" />;
    case 'warning':
      return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
    case 'info':
      return <Info className="w-4 h-4 text-blue-500" />;
    case 'debug':
      return <Bug className="w-4 h-4 text-gray-500" />;
    default:
      return <Info className="w-4 h-4 text-gray-500" />;
  }
};

const getLevelBadgeColor = (level: string) => {
  switch (level) {
    case 'error':
      return 'bg-red-100 text-red-800 border-red-200';
    case 'warning':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'info':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'debug':
      return 'bg-gray-100 text-gray-800 border-gray-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

export default function LogsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [levelFilter, setLevelFilter] = useState<string>('all');
  const [logs] = useState<LogEntry[]>(mockLogs);

  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.source.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLevel = levelFilter === 'all' || log.level === levelFilter;
    return matchesSearch && matchesLevel;
  });

  return (
    <AppLayout>
      <div className="flex gap-8 h-full">
        {/* Left Side - Main Content */}
        <div className="flex-1 space-y-6">
          <div>
            <h1 className="text-3xl font-serif font-bold text-ink mb-2">Activity Logs</h1>
            <p className="text-stone">Monitor your application activities and system events</p>
          </div>

          {/* Search and Filter Controls */}
          <Card>
            <CardContent className="p-6">
              <div className="flex gap-4 items-center">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-stone w-4 h-4" />
                  <Input
                    placeholder="Search logs..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={levelFilter} onValueChange={setLevelFilter}>
                  <SelectTrigger className="w-40">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Filter by level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Levels</SelectItem>
                    <SelectItem value="error">Error</SelectItem>
                    <SelectItem value="warning">Warning</SelectItem>
                    <SelectItem value="info">Info</SelectItem>
                    <SelectItem value="debug">Debug</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" className="gap-2">
                  <Download className="w-4 h-4" />
                  Export
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Log Entries */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Recent Activity</CardTitle>
              <CardDescription>
                Showing {filteredLogs.length} of {logs.length} log entries
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="space-y-0">
                {filteredLogs.map((log, index) => (
                  <div 
                    key={log.id} 
                    className={`p-6 border-b border-stone/20 hover:bg-hero/50 transition-colors ${
                      index === filteredLogs.length - 1 ? 'border-b-0' : ''
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 mt-1">
                        {getLevelIcon(log.level)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <Badge className={`${getLevelBadgeColor(log.level)} text-xs font-medium`}>
                            {log.level.toUpperCase()}
                          </Badge>
                          <span className="text-sm text-stone font-medium">{log.source}</span>
                          <div className="flex items-center gap-1 text-xs text-stone/70">
                            <Clock className="w-3 h-3" />
                            {log.timestamp.toLocaleString()}
                          </div>
                        </div>
                        <p className="text-ink font-medium mb-1">{log.message}</p>
                        {log.details && (
                          <p className="text-sm text-stone/80">{log.details}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Side - Artistic Background */}
        <div className="w-80 relative">
          <div className="sticky top-8">
            <Card className="h-[600px] overflow-hidden border-stone/20">
              <div 
                className="w-full h-full bg-cover bg-center bg-no-repeat relative"
                style={{
                  backgroundImage: 'url(/Side.png)',
                  backgroundPosition: 'center 20%'
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                <div className="absolute bottom-6 left-6 right-6 text-white">
                  <h3 className="font-serif text-lg font-bold mb-2">The Path of Wisdom</h3>
                  <p className="text-sm opacity-90">
                    "Every new beginning comes from some other beginning's end." - Seneca
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}