import { Button } from "@/components/ui/button";
import { Bell, Plus, Clock, CheckCircle, Menu, ExternalLink, Calendar, MapPin, User, FileText, CreditCard, MessageSquare } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { type Meeting, type Quote } from "@shared/schema";
import { useAuth } from "@/hooks/useAuth";
import { Link, useLocation } from "wouter";
import Sidebar from "./sidebar";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { useStrata } from "@/lib/strata-context";

export default function Header() {
  const queryClient = useQueryClient();
  const { user, token } = useAuth();
  const { selectedStrataId } = useStrata();
  const { toast } = useToast();
  const [selectedNotification, setSelectedNotification] = useState<any>(null);
  const [showMeetingDialog, setShowMeetingDialog] = useState(false);
  const [, setLocation] = useLocation();

  // Get current strata ID
  const { data: strata } = useQuery({ queryKey: ["/api/strata"] });
  const currentStrata = Array.isArray(strata) ? strata[0] : null;

  // Fetch subscription status for trial indicator
  const { data: subscriptionData } = useQuery({
    queryKey: [`/api/stripe/subscription/${selectedStrataId}`],
    enabled: !!selectedStrataId && !!token,
    queryFn: async () => {
      const response = await fetch(`/api/stripe/subscription/${selectedStrataId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) return null;
      const data = await response.json();
      return data.subscription;
    },
  });

  const subscription = subscriptionData || null;

  // Fetch messages for unread count
  const { data: messages = [] } = useQuery({
    queryKey: [`/api/strata/${currentStrata?.id}/messages`],
    enabled: !!currentStrata?.id,
  });

  // Fetch Firebase notifications
  const { data: firebaseNotifications = [] } = useQuery({
    queryKey: [`/api/strata/${selectedStrataId}/notifications`],
    enabled: !!selectedStrataId,
    staleTime: 0, // Always refetch
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
    refetchInterval: 30000, // Poll every 30 seconds for new notifications
  });

  // Fetch notifications data
  const { data: meetings = [] } = useQuery<Meeting[]>({
    queryKey: ["/api/strata", currentStrata?.id, "meetings"],
    enabled: !!currentStrata?.id,
  });

  const { data: quotes = [] } = useQuery<Quote[]>({
    queryKey: ["/api/strata", currentStrata?.id, "quotes"],
    enabled: !!currentStrata?.id,
  });

  // Fetch dismissed notifications for current user
  const { data: dismissedNotifications = [] } = useQuery({
    queryKey: ["/api/dismissed-notifications"],
    staleTime: 0, // Always refetch to ensure we have latest dismissed state
    gcTime: 0, // Don't cache
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
  });

  // Mutation to dismiss notifications
  const dismissNotificationMutation = useMutation({
    mutationFn: async (data: { notificationId: string; notificationType: string }) => {
      console.log('Dismissing notification:', data);
      const response = await apiRequest("POST", "/api/dismissed-notifications", data);
      return response.json();
    },
    onSuccess: async (data, variables) => {
      console.log('Notification dismissed successfully:', variables);
      // Invalidate and force refetch all related queries
      await queryClient.invalidateQueries({ queryKey: ["/api/dismissed-notifications"] });
      await queryClient.refetchQueries({ queryKey: ["/api/dismissed-notifications"] });
      // Fix: Use the same query key format as the queries themselves (array format)
      queryClient.invalidateQueries({ queryKey: ["/api/strata", currentStrata?.id, "meetings"] });
      queryClient.invalidateQueries({ queryKey: ["/api/strata", currentStrata?.id, "quotes"] });
    },
    onError: (error, variables) => {
      console.error('Failed to dismiss notification:', variables, error);
      toast({
        title: "Error",
        description: "Failed to dismiss notification. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Mutation to mark message as read
  const markAsReadMutation = useMutation({
    mutationFn: async (messageId: string) => {
      return apiRequest("PATCH", `/api/messages/${messageId}/read`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/strata/${currentStrata?.id}/messages`] });
    },
  });

  const { signOut } = useAuth();

  const handleLogout = async () => {
    try {
      await signOut();
      window.location.href = "/";
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to sign out.",
        variant: "destructive",
      });
    }
  };

  // Mutation to mark Firebase notifications as read
  const markNotificationAsReadMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      console.log('Marking Firebase notification as read:', notificationId);
      const response = await apiRequest("PATCH", `/api/notifications/${notificationId}/read`);
      return response.json();
    },
    onSuccess: (data, notificationId) => {
      console.log('Firebase notification marked as read:', notificationId);
      // Force refetch to update UI immediately
      queryClient.invalidateQueries({ queryKey: [`/api/strata/${selectedStrataId}/notifications`] });
      queryClient.refetchQueries({ queryKey: [`/api/strata/${selectedStrataId}/notifications`] });
    },
    onError: (error, notificationId) => {
      console.error('Failed to mark notification as read:', notificationId, error);
      toast({
        title: "Error",
        description: "Failed to mark notification as read. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleNotificationClick = async (notification: any) => {
    try {
      console.log('🔔 Notification clicked:', {
        id: notification.id,
        type: notification.type,
        isFirebaseNotification: notification.isFirebaseNotification,
        metadata: notification.metadata,
        link: notification.link
      });

      // Handle Firebase notifications (meeting invitations, messages, etc.)
      if (notification.isFirebaseNotification) {
        await markNotificationAsReadMutation.mutateAsync(notification.id);

        if (notification.type === 'meeting_invitation') {
          console.log('📅 Opening meeting invitation dialog');
          setSelectedNotification(notification);
          setShowMeetingDialog(true);
          return;
        }

        // Navigate based on notification type with specific IDs
        if (notification.type === 'message' && notification.metadata?.messageId) {
          console.log('💬 Navigating to specific message:', notification.metadata.messageId);
          window.location.href = `/communications?messageId=${notification.metadata.messageId}`;
        } else if (notification.type === 'message') {
          console.log('💬 Navigating to messages tab');
          window.location.href = '/communications?tab=messages';
        } else if (notification.type === 'meeting') {
          console.log('📅 Navigating to meetings');
          window.location.href = '/meetings';
        } else {
          console.log('🏠 Navigating to dashboard');
          window.location.href = '/dashboard';
        }
        return;
      }

      // Handle regular notifications
      dismissNotificationMutation.mutate({
        notificationId: notification.id,
        notificationType: notification.type,
      });

      // Handle navigation based on notification type
      if (notification.type === 'message') {
        setLocation('/communications');
      } else if (notification.type === 'meeting') {
        window.location.href = '/meetings';
      } else if (notification.link) {
        window.location.href = notification.link;
      }
    } catch (error) {
      console.error('Error handling notification click:', error);
    }
  };

  // Generate notifications and filter out dismissed ones
  const allNotifications = [
    // Firebase notifications (meeting invitations, etc.)
    ...(firebaseNotifications as any[])
      .filter(notification => !notification.isRead)
      .map(notification => {
        const mapped = {
          id: notification.id,
          type: notification.type,
          title: notification.title,
          description: notification.message,
          time: new Date(notification.createdAt).toLocaleDateString(),
          icon: notification.type === 'meeting_invitation' ? Calendar :
                notification.type === 'message' ? MessageSquare : Bell,
          priority: notification.priority || 'normal',
          category: notification.type === 'meeting_invitation' ? 'Meeting Invitation' :
                    notification.type === 'message' ? 'New Message' : 'Notification',
          link: notification.type === 'message' ? '/communications' : '/dashboard',
          isFirebaseNotification: true,
          metadata: notification.metadata,
        };
        console.log('📬 Mapped Firebase notification:', mapped);
        return mapped;
      }),

    // Upcoming meetings (next 30 days)
    ...meetings
      .filter(meeting => {
        const meetingDate = new Date(meeting.scheduledAt);
        const now = new Date();
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(now.getDate() + 30);
        return meetingDate > now && meetingDate < thirtyDaysFromNow;
      })
      .map(meeting => ({
        id: `meeting-${meeting.id}`,
        type: 'meeting' as const,
        title: meeting.title,
        description: `Strata Meeting - ${new Date(meeting.scheduledAt).toLocaleDateString()} at ${new Date(meeting.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
        time: new Date(meeting.scheduledAt).toLocaleDateString(),
        icon: Clock,
        priority: 'normal',
        category: 'Upcoming Meeting',
        link: '/meetings',
      })),
    
    // Pending quotes
    ...quotes
      .filter(quote => quote.status === 'pending')
      .map(quote => ({
        id: `quote-${quote.id}`,
        type: 'quote' as const,
        title: `Quote Pending Approval`,
        description: `${quote.description} - $${parseFloat(quote.amount || '0').toLocaleString()}`,
        time: new Date(quote.createdAt || '').toLocaleDateString(),
        icon: CheckCircle,
        priority: 'high',
        category: 'Pending Approval',
        link: '/quotes',
      })),
  ].slice(0, 10); // Limit to 10 notifications

  // Filter out dismissed notifications
  const dismissedIds = (dismissedNotifications as any[])?.map((d: any) => d.notificationId) || [];

  // CRITICAL FIX: Ensure dismissed notifications stay dismissed
  const notifications = allNotifications.filter(notification => {
    const isDismissed = dismissedIds.includes(notification.id);

    // Debug: Log if a notification should be filtered
    if (isDismissed) {
      console.log('  Filtering out dismissed notification:', notification.id, notification.type);
    }

    return !isDismissed;
  });

  const notificationCount = notifications.length;

  // Debug: Log active notifications (temporary for debugging)
  console.log('🔔 NOTIFICATION DEBUG:');
  console.log('  Total notifications:', allNotifications.length);
  console.log('  Dismissed:', dismissedIds.length);
  console.log('  Active (shown):', notificationCount);
  if (notificationCount > 0) {
    const stuckDetails = notifications.map(n => ({
      id: n.id,
      type: n.type,
      title: n.title,
      isDismissed: dismissedIds.includes(n.id)
    }));
    console.log('  ⚠️ STUCK NOTIFICATIONS:');
    console.table(stuckDetails); // Use console.table for better visibility
    console.log('  Full details:', JSON.stringify(stuckDetails, null, 2));
    console.log('  Dismissed IDs:', dismissedIds);
  } else {
    console.log('  ✅ No active notifications');
  }

  // Get current user ID from auth hook (email in our Firebase system)
  const currentUserId = user?.email || 'master-admin';

  // Calculate unread message count based on conversations
  const unreadMessageCount = (() => {
    if (!messages || !currentUserId) {
      // ✅ SECURITY: Removed console logging
      return 0;
    }

    // Count unread messages where current user is the recipient
    let unreadCount = 0;
    (messages as any[]).forEach((message: any) => {
      // Count unread messages where current user is the recipient
      if (!message.isRead && message.recipientId === currentUserId) {
        unreadCount++;
        // ✅ SECURITY: Removed console logging
      }
    });

    // ✅ SECURITY: Removed console logging
    return unreadCount;
  })();

  // Calculate trial days remaining
  const getDaysRemaining = () => {
    if (!subscription?.trialEndDate) return 0;
    const endDate = new Date(subscription.trialEndDate.seconds * 1000);
    const now = new Date();
    const diffTime = endDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  const daysRemaining = getDaysRemaining();
  const isTrialActive = subscription?.status === 'trial' && daysRemaining > 0;

  return (
    <header className="bg-white border-b border-border px-4 lg:px-6 py-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          {/* Mobile Menu Button */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-auto [&>button]:hidden">
              <Sidebar />
            </SheetContent>
          </Sheet>
          
          <div className="hidden lg:block">
            <p className="text-muted-foreground text-sm">
              Welcome back! Here's what's happening with your properties.
            </p>
          </div>
          
          {/* Mobile Title */}
          <div className="lg:hidden">
            <h1 className="text-lg font-semibold text-gray-700">VibeStrat</h1>
          </div>
        </div>
        
        <div className="flex items-center space-x-2 lg:space-x-4">
          {/* Trial Status Indicator */}
          {isTrialActive && (
            <Link href="/billing">
              <Button variant="outline" size="sm" className="hidden md:flex items-center gap-2 border-blue-300 bg-blue-50 hover:bg-blue-100 text-blue-700">
                <Clock className="h-4 w-4" />
                <span className="font-semibold">{daysRemaining} days left in trial</span>
              </Button>
            </Link>
          )}
          {isTrialActive && (
            <Link href="/billing">
              <Button variant="ghost" size="icon" className="md:hidden relative">
                <CreditCard className="h-5 w-5 text-blue-600" />
                <Badge variant="default" className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs bg-blue-600">
                  {daysRemaining}
                </Badge>
              </Button>
            </Link>
          )}

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                {notificationCount > 0 && (
                  <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                    {notificationCount}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 sm:w-96 p-0 mx-4 sm:mx-0" align="end">
              <div className="p-4 border-b">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">Notifications</h3>
                    <p className="text-sm text-muted-foreground">
                      {notificationCount} new notifications
                    </p>
                  </div>
                  {notificationCount > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={async () => {
                        console.log('Clearing all notifications:', notifications.length);

                        // Dismiss all notifications with proper async handling
                        const promises = notifications.map(notification => {
                          if (notification.isFirebaseNotification) {
                            return markNotificationAsReadMutation.mutateAsync(notification.id);
                          } else {
                            return dismissNotificationMutation.mutateAsync({
                              notificationId: notification.id,
                              notificationType: notification.type,
                            });
                          }
                        });

                        try {
                          await Promise.all(promises);
                          toast({
                            title: "Success",
                            description: "All notifications cleared",
                          });
                        } catch (error) {
                          console.error('Error clearing notifications:', error);
                          toast({
                            title: "Partial Success",
                            description: "Some notifications may not have been cleared",
                            variant: "destructive",
                          });
                        }
                      }}
                      disabled={dismissNotificationMutation.isPending || markNotificationAsReadMutation.isPending}
                    >
                      {dismissNotificationMutation.isPending || markNotificationAsReadMutation.isPending ? 'Clearing...' : 'Clear All'}
                    </Button>
                  )}
                </div>
              </div>
              <ScrollArea className="h-80">
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-muted-foreground">
                    <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No new notifications</p>
                  </div>
                ) : (
                  <div className="p-2">
                    {notifications.map((notification) => {
                      const IconComponent = notification.icon;
                      return (
                        <div 
                          key={notification.id} 
                          className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors group border-b border-gray-100 last:border-b-0"
                          onClick={() => handleNotificationClick(notification)}
                        >
                          <IconComponent className={`h-4 w-4 mt-1 flex-shrink-0 ${
                            notification.priority === 'urgent' ? 'text-red-600' :
                            notification.priority === 'high' ? 'text-orange-600' : 
                            'text-blue-600'
                          }`} />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p className="font-medium text-sm text-gray-900">{notification.title}</p>
                              <ExternalLink className="h-3 w-3 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                            {notification.category && (
                              <p className="text-xs text-blue-600 mt-1 font-medium">
                                {notification.category}
                              </p>
                            )}
                            <p className="text-xs text-gray-600 mt-1">
                              {notification.description}
                            </p>
                            <p className="text-xs text-gray-400 mt-2">
                              {notification.time}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </ScrollArea>
            </PopoverContent>
          </Popover>

          <Button variant="outline" onClick={handleLogout}>
            Sign Out
          </Button>
        </div>
      </div>

      {/* Meeting Invitation Dialog */}
      <Dialog open={showMeetingDialog} onOpenChange={setShowMeetingDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              <span>Meeting Invitation</span>
            </DialogTitle>
          </DialogHeader>
          
          {selectedNotification && selectedNotification.metadata && (
            <div className="space-y-6">
              {/* Meeting Header */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-100">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {selectedNotification.metadata.meetingTitle}
                </h3>
                <p className="text-sm text-gray-600">
                  You're invited to this strata meeting
                </p>
              </div>

              {/* Meeting Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                  <Calendar className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="font-medium text-gray-900">Date & Time</p>
                    <p className="text-sm text-gray-600">
                      {new Date(selectedNotification.metadata.meetingDate).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                    <p className="text-sm text-gray-600">
                      {new Date(selectedNotification.metadata.meetingDate).toLocaleTimeString('en-US', {
                        hour: 'numeric',
                        minute: '2-digit',
                        hour12: true
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                  <MapPin className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="font-medium text-gray-900">Location</p>
                    <p className="text-sm text-gray-600">
                      {selectedNotification.metadata.location || 'To be determined'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                  <User className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="font-medium text-gray-900">Organizer</p>
                    <p className="text-sm text-gray-600">
                      {selectedNotification.metadata.organizer}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                  <FileText className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="font-medium text-gray-900">Meeting Type</p>
                    <p className="text-sm text-gray-600 capitalize">
                      {(selectedNotification.metadata.type || 'general_meeting').replace('_', ' ')}
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                <Button
                  variant="outline"
                  onClick={() => setShowMeetingDialog(false)}
                >
                  Close
                </Button>
                <Button
                  onClick={() => {
                    setShowMeetingDialog(false);
                    // Navigate to meetings page with the specific meeting ID highlighted
                    const meetingId = selectedNotification?.metadata?.meetingId;
                    if (meetingId) {
                      window.location.href = `/meetings?id=${meetingId}`;
                    } else {
                      window.location.href = '/meetings';
                    }
                  }}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  View Meeting Details
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </header>
  );
}
