import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  History,
  ArrowRight,
  Megaphone,
  MessageSquare,
  Wrench,
  FileText,
  DollarSign,
  Clock,
  Calendar
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";

interface RecentActivityProps {
  strataId: string;
}

interface Activity {
  id: string;
  type: 'announcement' | 'message' | 'maintenance' | 'quote' | 'expense' | 'meeting';
  title: string;
  description: string;
  createdAt: string;
  icon: string;
  link: string;
  metadata: {
    status?: string;
    priority?: string;
    category?: string;
    [key: string]: any;
  };
}

export default function RecentActivity({ strataId }: RecentActivityProps) {
  const { data: activities = [], isLoading, error } = useQuery<Activity[]>({
    queryKey: [`/api/strata/${strataId}/recent-activity`],
    enabled: !!strataId,
    staleTime: 0, // Always fetch fresh data
    gcTime: 0, // Don't cache
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
  });

  // Debug logging
  console.log('🎯 RecentActivity Component:', { strataId, activitiesCount: activities?.length, isLoading, error });

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'megaphone': return <Megaphone className="h-5 w-5" />;
      case 'message': return <MessageSquare className="h-5 w-5" />;
      case 'wrench': return <Wrench className="h-5 w-5" />;
      case 'file-text': return <FileText className="h-5 w-5" />;
      case 'dollar-sign': return <DollarSign className="h-5 w-5" />;
      case 'calendar': return <Calendar className="h-5 w-5" />;
      default: return <History className="h-5 w-5" />;
    }
  };

  const getIconColor = (type: string) => {
    switch (type) {
      case 'announcement': return 'text-blue-600 bg-blue-50';
      case 'message': return 'text-green-600 bg-green-50';
      case 'maintenance': return 'text-orange-600 bg-orange-50';
      case 'quote': return 'text-purple-600 bg-purple-50';
      case 'expense': return 'text-red-600 bg-red-50';
      case 'meeting': return 'text-indigo-600 bg-indigo-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusVariant = (status?: string): any => {
    if (!status) return 'secondary';

    switch (status.toLowerCase()) {
      case 'pending': return 'outline';
      case 'approved': return 'default';
      case 'rejected': return 'destructive';
      case 'completed': return 'default';
      case 'in_progress': return 'secondary';
      case 'open': return 'outline';
      case 'scheduled': return 'outline';
      default: return 'secondary';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return 'Just now';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 604800) {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} day${days > 1 ? 's' : ''} ago`;
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
      });
    }
  };

  if (isLoading) {
    return (
      <Card className="bg-white shadow-lg border border-border">
        <CardHeader className="border-b border-border">
          <CardTitle className="flex items-center">
            <History className="mr-3 h-5 w-5 text-secondary" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-start space-x-4 p-4 bg-muted/30 rounded-lg animate-pulse">
                <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white shadow-lg border border-border">
      <CardHeader className="border-b border-border">
        <CardTitle className="flex items-center">
          <History className="mr-3 h-5 w-5 text-secondary" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        {activities.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No recent activity to display</p>
            <p className="text-sm">Activities will appear here as they occur</p>
          </div>
        ) : (
          <div className="space-y-3">
            {activities.map((activity) => (
              <Link key={activity.id} href={activity.link}>
                <div className="flex items-start space-x-3 p-3 bg-muted/20 hover:bg-muted/40 rounded-lg transition-colors cursor-pointer group">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${getIconColor(activity.type)}`}>
                    {getIcon(activity.icon)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors line-clamp-1">
                        {activity.title}
                      </p>
                      {activity.metadata?.status && (
                        <Badge variant={getStatusVariant(activity.metadata.status)} className="text-xs flex-shrink-0">
                          {activity.metadata.status}
                        </Badge>
                      )}
                    </div>

                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {activity.description}
                    </p>

                    <div className="flex items-center gap-2 mt-2">
                      <Clock className="h-3 w-3 text-muted-foreground" />
                      <time className="text-xs text-muted-foreground">
                        {formatDate(activity.createdAt)}
                      </time>
                      {activity.metadata?.priority && activity.metadata.priority !== 'normal' && (
                        <Badge variant="outline" className="text-xs">
                          {activity.metadata.priority}
                        </Badge>
                      )}
                    </div>
                  </div>

                  <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0 mt-1" />
                </div>
              </Link>
            ))}

            {activities.length > 0 && (
              <div className="mt-4 pt-4 border-t border-border text-center">
                <p className="text-xs text-muted-foreground">
                  Showing {activities.length} most recent activit{activities.length === 1 ? 'y' : 'ies'}
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
