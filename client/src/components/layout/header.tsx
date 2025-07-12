import { Button } from "@/components/ui/button";
import { Bell, Plus, Megaphone, Clock, CheckCircle, Menu, ExternalLink, Calendar, MapPin, User, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { type Announcement, type Meeting, type Quote } from "@shared/schema";
import { useAuth } from "@/hooks/useAuth";
import { Link, useLocation } from "wouter";
import Sidebar from "./sidebar";
import { apiRequest } from "@/lib/queryClient";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

export default function Header() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedNotification, setSelectedNotification] = useState<any>(null);
  const [showMeetingDialog, setShowMeetingDialog] = useState(false);
  const [, setLocation] = useLocation();

  // Get current strata ID
  const { data: strata } = useQuery({ queryKey: ["/api/strata"] });
  const currentStrata = Array.isArray(strata) ? strata[0] : null;

  // Fetch messages for unread count
  const { data: messages = [] } = useQuery({
    queryKey: [`/api/strata/${currentStrata?.id}/messages`],
    enabled: !!currentStrata?.id,
  });

  // Fetch Firebase notifications
  const { data: firebaseNotifications = [] } = useQuery({
    queryKey: [`/api/strata/${currentStrata?.id}/notifications`],
    enabled: !!currentStrata?.id,
  });

  // Fetch notifications data
  const { data: announcements = [] } = useQuery<Announcement[]>({
    queryKey: ["/api/strata", currentStrata?.id, "announcements"],
    enabled: !!currentStrata?.id,
  });

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
  });

  // Mutation to dismiss notifications
  const dismissNotificationMutation = useMutation({
    mutationFn: async (data: { notificationId: string; notificationType: string }) => {
      const response = await apiRequest("POST", "/api/dismissed-notifications", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/dismissed-notifications"] });
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

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast({
        title: "Signed Out",
        description: "You have been signed out successfully.",
      });
      // Redirect to landing page after sign out
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
      const response = await apiRequest("PATCH", `/api/notifications/${notificationId}/read`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/strata/${currentStrata?.id}/notifications`] });
    },
  });

  const handleNotificationClick = async (notification: any) => {
    try {
      // Handle Firebase notifications (meeting invitations)
      if (notification.isFirebaseNotification) {
        await markNotificationAsReadMutation.mutateAsync(notification.id);
        
        if (notification.type === 'meeting_invitation') {
          setSelectedNotification(notification);
          setShowMeetingDialog(true);
          return;
        }
        
        // Navigate based on notification type
        if (notification.type === 'meeting') {
          window.location.href = '/meetings';
        } else {
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
        // Navigate to community hub instead of communications page
        setLocation('/communications');
      } else if (notification.link) {
        // For other notifications, use the existing link logic
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
      .map(notification => ({
        id: notification.id,
        type: notification.type,
        title: notification.title,
        description: notification.message,
        time: new Date(notification.createdAt).toLocaleDateString(),
        icon: notification.type === 'meeting_invitation' ? Calendar : Bell,
        priority: notification.priority || 'normal',
        category: notification.type === 'meeting_invitation' ? 'Meeting Invitation' : 
                  notification.type === 'message' ? 'New Message' : 'Notification',
        link: notification.type === 'message' ? '/communications' : '/dashboard',
        isFirebaseNotification: true,
        metadata: notification.metadata,
      })),
    // Recent announcements (last 7 days)
    ...announcements
      .filter(announcement => {
        const createdDate = new Date(announcement.createdAt || '');
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return createdDate > weekAgo;
      })
      .map(announcement => ({
        id: `announcement-${announcement.id}`,
        type: 'announcement' as const,
        title: announcement.title,
        description: `${announcement.content?.substring(0, 60) || ''}...`,
        time: new Date(announcement.createdAt || '').toLocaleDateString(),
        icon: Megaphone,
        priority: announcement.priority,
        category: 'Community Announcement',
        link: '/communications',
      })),
    
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
  const notifications = allNotifications.filter(notification => !dismissedIds.includes(notification.id));

  const notificationCount = notifications.length;

  // Get current user ID from auth hook (email in our Firebase system)
  const currentUserId = user?.email || 'master-admin';

  // Calculate unread message count based on conversations
  const unreadMessageCount = (() => {
    if (!messages || !currentUserId) {
      console.log('🔍 Unread count debug: no messages or user', { messages: !!messages, currentUserId });
      return 0;
    }
    
    // Count unread messages where current user is the recipient
    let unreadCount = 0;
    (messages as any[]).forEach((message: any) => {
      // Count unread messages where current user is the recipient
      if (!message.isRead && message.recipientId === currentUserId) {
        unreadCount++;
        console.log('📬 Found unread message:', { messageId: message.id, subject: message.subject });
      }
    });
    
    console.log('📬 Total unread count:', unreadCount, 'for user:', currentUserId);
    return unreadCount;
  })();

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
                <h3 className="font-semibold">Notifications</h3>
                <p className="text-sm text-muted-foreground">
                  {notificationCount} new notifications
                </p>
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
                    window.location.href = '/meetings';
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
