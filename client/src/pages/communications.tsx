import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import type { CheckedState } from "@radix-ui/react-checkbox";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { 
  insertAnnouncementSchema, 
  insertMessageSchema,
  insertResidentDirectorySchema,
  type Announcement, 
  type Message,
  type ResidentDirectory,
  type User
} from "@shared/schema";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useStrata } from "@/lib/strata-context";
import {
  Users,
  MessageSquare,
  Plus,
  Mail,
  Phone,
  Home,
  Car,
  PawPrint,
  Shield,
  Clock,
  Send,
  Search,
  Filter,
  Megaphone,
  Calendar as CalendarIcon,
  AlertTriangle,
  CheckCircle,
  Building,
  DollarSign,
  FileText,
  Wrench,
  Pencil,
  Trash2,
  MoreVertical
} from "lucide-react";
import { z } from "zod";

// Community Hub - Main component for resident communications
export default function CommunityHub() {
  const [location] = useLocation();
  // Persist tab state in localStorage
  const [activeTab, setActiveTab] = useState(() => {
    const savedTab = localStorage.getItem('communityHubTab');
    return savedTab || "directory";
  });
  const [isMessageDialogOpen, setIsMessageDialogOpen] = useState(false);
  const [isDirectoryDialogOpen, setIsDirectoryDialogOpen] = useState(false);
  const [isAnnouncementDialogOpen, setIsAnnouncementDialogOpen] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<any>(null);
  const [deleteAnnouncementId, setDeleteAnnouncementId] = useState<string | null>(null);
  const [selectedResident, setSelectedResident] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRecipients, setSelectedRecipients] = useState<string[]>([]);
  const [isGroupChat, setIsGroupChat] = useState(false);
  const [groupChatName, setGroupChatName] = useState("");
  const [replyToMessage, setReplyToMessage] = useState<{ id: string; subject: string } | null>(null);
  const [openConversations, setOpenConversations] = useState<string[]>([]);
  const [minimizedConversations, setMinimizedConversations] = useState<string[]>([]);
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get strata context
  const { selectedStrataId, selectedStrata, isLoading: strataLoading } = useStrata();

  // Fetch data
  const { data: residentDirectory } = useQuery({
    queryKey: [`/api/strata/${selectedStrataId}/resident-directory`],
    enabled: !!selectedStrataId,
  });

  const { data: messages, isLoading: messagesLoading, error: messagesError, refetch: refetchMessages } = useQuery({
    queryKey: [`/api/strata/${selectedStrataId}/messages`],
    enabled: !!selectedStrataId,
    refetchOnWindowFocus: true,
    staleTime: 0, // Always fetch fresh data
  });

  // Trigger immediate refetch on component mount
  useEffect(() => {
    if (selectedStrataId) {
      // Invalidate cache first, then refetch
      queryClient.invalidateQueries({
        queryKey: [`/api/strata/${selectedStrataId}/messages`]
      });
      refetchMessages();
    }
  }, [selectedStrataId, refetchMessages]);

  console.log('🔍 Messages query status:', { 
    messagesLoading, 
    messagesError: messagesError?.message, 
    messagesData: messages?.length || 0,
    messagesRaw: messages,
    selectedStrataId 
  });

  const { data: announcements, refetch: refetchAnnouncements } = useQuery({
    queryKey: [`/api/strata/${selectedStrataId}/announcements`],
    enabled: !!selectedStrataId,
    refetchOnWindowFocus: true,
    staleTime: 0, // Always fetch fresh data
  });

  // Log announcements data for debugging
  console.log('📢 Announcements data:', {
    count: (announcements as any[])?.length || 0,
    data: announcements
  });

  // Fetch strata users for messaging recipients
  const { data: strataUsers } = useQuery({
    queryKey: [`/api/strata/${selectedStrataId}/users`],
    enabled: !!selectedStrataId,
  });

  // Save tab state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('communityHubTab', activeTab);

    // Refetch data when switching to specific tabs
    if (activeTab === 'announcements' && selectedStrataId) {
      queryClient.invalidateQueries({ queryKey: [`/api/strata/${selectedStrataId}/announcements`] });
      refetchAnnouncements();
    } else if (activeTab === 'messages' && selectedStrataId) {
      queryClient.invalidateQueries({ queryKey: [`/api/strata/${selectedStrataId}/messages`] });
      refetchMessages();
    }
  }, [activeTab, selectedStrataId]);

  // Check URL parameters for auto-opening dialogs or switching tabs
  useEffect(() => {
    const urlParams = new URLSearchParams(location.split('?')[1] || '');
    if (urlParams.get('action') === 'new-announcement') {
      setIsAnnouncementDialogOpen(true);
      setActiveTab("announcements"); // Switch to announcements tab
    } else if (urlParams.get('tab') === 'messages') {
      setActiveTab("messages"); // Switch to messages tab
    }
  }, [location]);

  // Check URL parameters for auto-opening specific messages
  useEffect(() => {
    const urlParams = new URLSearchParams(location.split('?')[1] || '');
    const messageId = urlParams.get('messageId');

    if (messageId && messages.length > 0) {
      // Switch to messages tab
      setActiveTab("messages");

      // Find the conversation containing this message
      const conversations = groupMessagesByConversation(messages as any[]);
      const conversation = conversations.find((conv: any) =>
        conv.messages.some((msg: any) => msg.id === messageId)
      );

      if (conversation && !openConversations.includes(conversation.id)) {
        setOpenConversations(prev => [...prev, conversation.id]);

        // Mark messages in this conversation as read
        const unreadMessages = conversation.messages
          .filter((msg: any) => !msg.isRead && msg.recipientId === user?.id)
          .map((msg: any) => msg.id);

        unreadMessages.forEach((id: string) => {
          markMessageAsReadMutation.mutate(id);
        });
      }

      // Clean up URL parameter
      window.history.replaceState({}, document.title, '/communications');
    }
  }, [location, messages, user?.id]);

  // Mutations
  const createMessageMutation = useMutation({
    mutationFn: async (messageData: any) => {
      return apiRequest("POST", `/api/strata/${selectedStrataId}/messages`, messageData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/strata/${selectedStrataId}/messages`] });
      queryClient.invalidateQueries({ queryKey: [`/api/strata/${selectedStrataId}/notifications`] });
      resetMessageForm();
      setIsMessageDialogOpen(false);
    },
    onError: (error: any) => {
      const errorMessage = error.message || "Failed to send message";
      toast({
        title: "Error",
        description: errorMessage.includes("recipient") 
          ? "Please select at least one recipient to send the message"
          : errorMessage,
        variant: "destructive",
      });
    },
  });

  const createDirectoryEntryMutation = useMutation({
    mutationFn: async (entryData: any) => {
      return apiRequest("POST", `/api/strata/${selectedStrataId}/resident-directory`, entryData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/strata/${selectedStrataId}/resident-directory`] });
      toast({
        title: "Directory entry created",
        description: "Resident information has been added to the directory.",
      });
      setIsDirectoryDialogOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create directory entry",
        variant: "destructive",
      });
    },
  });

  const createAnnouncementMutation = useMutation({
    mutationFn: async (announcementData: any) => {
      return apiRequest("POST", `/api/strata/${selectedStrataId}/announcements`, announcementData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/strata/${selectedStrataId}/announcements`] });
      queryClient.invalidateQueries({ queryKey: [`/api/strata/${selectedStrataId}/recent-activity`] });
      toast({
        title: "Announcement posted",
        description: "Your announcement has been posted to the community.",
      });
      setIsAnnouncementDialogOpen(false);
      announcementForm.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to post announcement",
        variant: "destructive",
      });
    },
  });

  const updateAnnouncementMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      return apiRequest("PATCH", `/api/announcements/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/strata/${selectedStrataId}/announcements`] });
      toast({
        title: "Announcement updated",
        description: "Your announcement has been updated.",
      });
      setIsAnnouncementDialogOpen(false);
      setSelectedAnnouncement(null);
      announcementForm.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update announcement",
        variant: "destructive",
      });
    },
  });

  const deleteAnnouncementMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/announcements/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/strata/${selectedStrataId}/announcements`] });
      toast({
        title: "Announcement deleted",
        description: "The announcement has been removed.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete announcement",
        variant: "destructive",
      });
    },
  });

  const markMessageAsReadMutation = useMutation({
    mutationFn: async (messageId: string) => {
      return apiRequest("PATCH", `/api/messages/${messageId}/read`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/strata/${selectedStrataId}/messages`] });
    },
  });

  const deleteConversationMutation = useMutation({
    mutationFn: async (conversationId: string) => {
      return apiRequest("DELETE", `/api/conversations/${conversationId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/strata/${selectedStrataId}/messages`] });
      toast({
        title: "Conversation deleted",
        description: "The conversation has been removed successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete conversation",
        variant: "destructive",
      });
    },
  });

  // Forms
  const messageForm = useForm({
    resolver: zodResolver(insertMessageSchema.omit({ strataId: true, senderId: true })),
    defaultValues: {
      recipientId: "",
      subject: "",
      content: "",
      messageType: "private",
      priority: "normal",
    },
  });

  // Watch for message type changes
  const messageType = messageForm.watch("messageType");

  // Utility functions for recipient management
  const handleRecipientToggle = (recipientId: string) => {
    setSelectedRecipients(prev => 
      prev.includes(recipientId) 
        ? prev.filter(id => id !== recipientId)
        : [...prev, recipientId]
    );
  };

  const resetMessageForm = () => {
    messageForm.reset();
    setSelectedRecipients([]);
    setIsGroupChat(false);
    setGroupChatName("");
    setReplyToMessage(null);
  };

  const directoryForm = useForm({
    resolver: zodResolver(insertResidentDirectorySchema.omit({ strataId: true })),
    defaultValues: {
      userId: user?.id || "",
      dwellingId: "",
      primaryPhone: "",
      alternateEmail: "",
      emergencyContactName: "",
      emergencyContactPhone: "",
      occupancyType: "owner",
      showInDirectory: true,
      showContactInfo: true,
      showEmergencyContact: false,
    },
  });

  const announcementForm = useForm({
    resolver: zodResolver(insertAnnouncementSchema.omit({ strataId: true, publishedBy: true })),
    defaultValues: {
      title: "",
      content: "",
      type: "general",
      priority: "normal",
      isRecurring: false,
    },
  });

  // Filter resident directory based on search
  const filteredDirectory = (residentDirectory as any[])?.filter((resident: any) =>
    resident.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    resident.userEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    resident.unitNumber?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const onSubmitMessage = (data: any) => {
    // Deduplicate recipients on client side as well for extra safety
    const uniqueRecipients = [...new Set(selectedRecipients)];
    
    const messageData = {
      ...data,
      recipientIds: messageType === "broadcast" ? [] : uniqueRecipients,
      isGroupChat: isGroupChat && uniqueRecipients.length > 1,
      groupChatName: isGroupChat ? groupChatName : null,
      parentMessageId: replyToMessage?.id || null,
    };
    
    console.log('📤 Sending message with recipients:', uniqueRecipients);
    createMessageMutation.mutate(messageData);
    // Don't reset form here - it will be reset on successful mutation in onSuccess
  };

  const onSubmitDirectoryEntry = (data: any) => {
    createDirectoryEntryMutation.mutate(data);
  };

  const onSubmitAnnouncement = (data: any) => {
    if (selectedAnnouncement) {
      // Update existing announcement
      updateAnnouncementMutation.mutate({
        id: selectedAnnouncement.id,
        data
      });
    } else {
      // Create new announcement
      createAnnouncementMutation.mutate(data);
    }
  };

  const handleEditAnnouncement = (announcement: any) => {
    setSelectedAnnouncement(announcement);
    announcementForm.reset({
      title: announcement.title,
      content: announcement.content,
      type: announcement.category || 'general',
      priority: announcement.priority || 'normal',
    });
    setIsAnnouncementDialogOpen(true);
  };

  const handleDeleteAnnouncement = (id: string) => {
    setDeleteAnnouncementId(id);
  };

  const confirmDeleteAnnouncement = () => {
    if (deleteAnnouncementId) {
      deleteAnnouncementMutation.mutate(deleteAnnouncementId);
      setDeleteAnnouncementId(null);
    }
  };

  const handleNewAnnouncement = () => {
    setSelectedAnnouncement(null);
    announcementForm.reset({
      title: '',
      content: '',
      type: 'general',
      priority: 'normal',
    });
    setIsAnnouncementDialogOpen(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Group messages into conversations
  const groupMessagesByConversation = (messages: any[]) => {
    const conversations = new Map();
    
    messages?.forEach((message: any) => {
      // Use the root conversation ID - if this is a reply, use parentMessageId's conversation
      // If no parent, use conversationId, and fallback to message id for original messages
      let convId = message.conversationId;
      
      // If this message has a parent, find the root conversation
      if (message.parentMessageId) {
        const parentMessage = messages.find(m => m.id === message.parentMessageId);
        if (parentMessage) {
          convId = parentMessage.conversationId || parentMessage.id;
        }
      }
      
      // Fallback to message id if no conversation id
      if (!convId) {
        convId = message.id;
      }
      
      if (!conversations.has(convId)) {
        // Find the original message (one without parentMessageId) for the subject
        const originalMessage = messages.find(m => 
          (m.conversationId === convId || m.id === convId) && !m.parentMessageId
        ) || message;
        
        conversations.set(convId, {
          id: convId,
          subject: originalMessage.subject,
          lastMessage: message,
          participants: new Set([message.senderId, message.recipientId].filter(Boolean)),
          messages: [],
          unreadCount: 0,
        });
      }
      
      const conversation = conversations.get(convId);
      conversation.messages.push(message);
      conversation.participants.add(message.senderId);
      if (message.recipientId) conversation.participants.add(message.recipientId);
      
      if (!message.isRead && message.recipientId === user?.id) {
        conversation.unreadCount++;
      }
      
      // Update last message if this is newer
      if (new Date(message.createdAt) > new Date(conversation.lastMessage.createdAt)) {
        conversation.lastMessage = message;
      }
    });
    
    return Array.from(conversations.values()).sort((a, b) => 
      new Date(b.lastMessage.createdAt).getTime() - new Date(a.lastMessage.createdAt).getTime()
    );
  };

  const getActivityFeedData = () => {
    const activities: any[] = [];
    
    // Add recent announcements
    (announcements as any[])?.slice(0, 3).forEach((announcement: any) => {
      activities.push({
        type: "announcement",
        title: announcement.title,
        description: announcement.content?.substring(0, 100) + "...",
        date: announcement.createdAt,
        priority: announcement.priority,
        icon: Megaphone,
      });
    });

    // Add recent messages
    (messages as any[])?.slice(0, 2).forEach((message: any) => {
      activities.push({
        type: "message",
        title: message.subject || "New Message",
        description: `From: ${message.senderName || message.senderEmail}`,
        date: message.createdAt,
        priority: message.priority,
        icon: MessageSquare,
      });
    });

    return activities.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  // Show loading while strata context is loading or no strata selected
  if (strataLoading || !selectedStrata) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6 space-y-4 lg:space-y-6">
      {/* Mobile-optimized header */}
      <div className="flex flex-col space-y-2">
        <h1 className="text-2xl lg:text-3xl font-bold">Community Hub</h1>
        <p className="text-sm lg:text-base text-muted-foreground">
          Connect with your neighbors and stay informed about community activities
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        {/* Mobile-optimized tabs with horizontal scrolling */}
        <div className="overflow-x-auto">
          <TabsList className="grid w-max grid-cols-4 lg:w-full">
            <TabsTrigger value="directory" className="flex items-center gap-1 lg:gap-2 px-3 lg:px-4 text-xs lg:text-sm">
              <Users className="h-3 w-3 lg:h-4 lg:w-4" />
              <span className="hidden sm:inline">Directory</span>
              <span className="sm:hidden">Dir</span>
            </TabsTrigger>
            <TabsTrigger value="messages" className="flex items-center gap-1 lg:gap-2 px-3 lg:px-4 text-xs lg:text-sm">
              <MessageSquare className="h-3 w-3 lg:h-4 lg:w-4" />
              <span className="hidden sm:inline">Messages</span>
              <span className="sm:hidden">Msg</span>
            </TabsTrigger>
            <TabsTrigger value="announcements" className="flex items-center gap-1 lg:gap-2 px-3 lg:px-4 text-xs lg:text-sm">
              <Megaphone className="h-3 w-3 lg:h-4 lg:w-4" />
              <span className="hidden sm:inline">Announcements</span>
              <span className="sm:hidden">News</span>
            </TabsTrigger>
            <TabsTrigger value="activity" className="flex items-center gap-1 lg:gap-2 px-3 lg:px-4 text-xs lg:text-sm">
              <Clock className="h-3 w-3 lg:h-4 lg:w-4" />
              <span className="hidden sm:inline">Activity Feed</span>
              <span className="sm:hidden">Feed</span>
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="directory" className="space-y-4">
          {/* Mobile-optimized header */}
          <div className="flex flex-col sm:flex-row gap-3 sm:justify-between sm:items-center">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search residents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 w-full"
              />
            </div>
            <Dialog open={isDirectoryDialogOpen} onOpenChange={setIsDirectoryDialogOpen}>
              <DialogTrigger asChild>
                <Button className="w-full sm:w-auto">
                  <Plus className="h-4 w-4 mr-2" />
                  <span className="sm:inline">Add Entry</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Add Directory Entry</DialogTitle>
                  <DialogDescription>
                    Add your information to the resident directory.
                  </DialogDescription>
                </DialogHeader>
                <Form {...directoryForm}>
                  <form onSubmit={directoryForm.handleSubmit(onSubmitDirectoryEntry)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={directoryForm.control}
                        name="primaryPhone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Primary Phone</FormLabel>
                            <FormControl>
                              <Input placeholder="(555) 123-4567" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={directoryForm.control}
                        name="alternateEmail"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Alternate Email</FormLabel>
                            <FormControl>
                              <Input placeholder="alternate@email.com" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={directoryForm.control}
                        name="emergencyContactName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Emergency Contact Name</FormLabel>
                            <FormControl>
                              <Input placeholder="John Doe" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={directoryForm.control}
                        name="emergencyContactPhone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Emergency Contact Phone</FormLabel>
                            <FormControl>
                              <Input placeholder="(555) 987-6543" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={directoryForm.control}
                      name="occupancyType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Occupancy Type</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select occupancy type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="owner">Owner</SelectItem>
                              <SelectItem value="tenant">Tenant</SelectItem>
                              <SelectItem value="authorized_occupant">Authorized Occupant</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" disabled={createDirectoryEntryMutation.isPending}>
                      {createDirectoryEntryMutation.isPending ? "Adding..." : "Add Entry"}
                    </Button>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {(!filteredDirectory || filteredDirectory.length === 0) ? (
              <div className="col-span-full">
                <Card className="p-12 text-center">
                  <div className="flex flex-col items-center justify-center space-y-4">
                    <div className="rounded-full bg-muted p-6">
                      <Users className="h-12 w-12 text-muted-foreground" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-xl font-semibold">
                        {searchTerm ? 'No Residents Found' : 'No Residents in Directory'}
                      </h3>
                      <p className="text-muted-foreground max-w-md">
                        {searchTerm
                          ? `No residents match your search for "${searchTerm}". Try a different search term.`
                          : 'There are no residents in the directory yet. Add your information to get started.'
                        }
                      </p>
                    </div>
                    {!searchTerm && (
                      <Button onClick={() => setIsDirectoryDialogOpen(true)} size="lg">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Your Information
                      </Button>
                    )}
                  </div>
                </Card>
              </div>
            ) : (
              filteredDirectory?.map((resident: any) => (
                <Card key={resident.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{resident.userName}</CardTitle>
                      <Badge variant={resident.occupancyType === 'owner' ? 'default' : 'secondary'}>
                        {resident.occupancyType}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Home className="h-4 w-4" />
                      Unit {resident.unitNumber}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {resident.showContactInfo && (
                      <div className="space-y-2">
                        {resident.primaryPhone && (
                          <div className="flex items-center gap-2 text-sm">
                            <Phone className="h-4 w-4" />
                            {resident.primaryPhone}
                          </div>
                        )}
                        {resident.userEmail && (
                          <div className="flex items-center gap-2 text-sm">
                            <Mail className="h-4 w-4" />
                            {resident.userEmail}
                          </div>
                        )}
                      </div>
                    )}
                    {resident.showEmergencyContact && resident.emergencyContactName && (
                      <div className="pt-2 border-t">
                        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                          <Shield className="h-4 w-4" />
                          Emergency Contact
                        </div>
                        <div className="text-sm">{resident.emergencyContactName}</div>
                        {resident.emergencyContactPhone && (
                          <div className="text-sm text-muted-foreground">{resident.emergencyContactPhone}</div>
                        )}
                      </div>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => {
                        setSelectedResident(resident);
                        messageForm.setValue("recipientId", resident.userId);
                        messageForm.setValue("messageType", "private");
                        setSelectedRecipients([resident.userId]); // Auto-select the recipient
                        setIsMessageDialogOpen(true);
                      }}
                    >
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Send Message
                    </Button>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="messages" className="space-y-4">
          {/* Mobile-optimized header */}
          <div className="flex flex-col sm:flex-row gap-3 sm:justify-between sm:items-center">
            <h2 className="text-xl lg:text-2xl font-semibold">Messages</h2>
            <Dialog open={isMessageDialogOpen} onOpenChange={setIsMessageDialogOpen}>
              <DialogTrigger asChild>
                <Button className="w-full sm:w-auto">
                  <Plus className="h-4 w-4 mr-2" />
                  New Message
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Send Message</DialogTitle>
                  <DialogDescription>
                    Send a message to a community member or broadcast to all residents.
                  </DialogDescription>
                </DialogHeader>
                <Form {...messageForm}>
                  <form onSubmit={messageForm.handleSubmit(onSubmitMessage)} className="space-y-4">
                    <FormField
                      control={messageForm.control}
                      name="messageType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Message Type</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select message type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="private">Private Message</SelectItem>
                              <SelectItem value="broadcast">Broadcast to All</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Recipient Selection for Private Messages */}
                    {messageType === "private" && (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <Label className="text-sm font-medium">Recipients</Label>
                          <div className="flex items-center space-x-2">
                            <Checkbox 
                              id="groupChat"
                              checked={isGroupChat}
                              onCheckedChange={(checked: CheckedState) => setIsGroupChat(checked === true)}
                            />
                            <Label htmlFor="groupChat" className="text-sm">Create Group Chat</Label>
                          </div>
                        </div>

                        {isGroupChat && (
                          <div>
                            <Label htmlFor="groupName" className="text-sm font-medium">Group Chat Name</Label>
                            <Input
                              id="groupName"
                              placeholder="Enter group chat name"
                              value={groupChatName}
                              onChange={(e) => setGroupChatName(e.target.value)}
                              className="mt-1"
                            />
                          </div>
                        )}

                        <div className="border rounded-lg p-3 max-h-48 overflow-y-auto">
                          <div className="space-y-2">
                            {(strataUsers as any[])?.filter(strataUser => strataUser.user.id !== user?.id).length > 0 ? (
                              (strataUsers as any[])?.filter(strataUser => strataUser.user.id !== user?.id).map((strataUser: any) => (
                                <div key={strataUser.user.id} className="flex items-center space-x-3">
                                  <Checkbox
                                    id={`recipient-${strataUser.user.id}`}
                                    checked={selectedRecipients.includes(strataUser.user.id)}
                                    onCheckedChange={() => handleRecipientToggle(strataUser.user.id)}
                                  />
                                  <Label 
                                    htmlFor={`recipient-${strataUser.user.id}`}
                                    className="flex-1 text-sm cursor-pointer"
                                  >
                                    <div className="flex items-center justify-between">
                                      <div className="flex flex-col">
                                        <span className="font-medium">
                                          {strataUser.user.firstName && strataUser.user.lastName 
                                            ? `${strataUser.user.firstName} ${strataUser.user.lastName}`
                                            : strataUser.user.email
                                          }
                                        </span>
                                        {strataUser.user.firstName && strataUser.user.lastName && (
                                          <span className="text-xs text-muted-foreground">
                                            {strataUser.user.email}
                                          </span>
                                        )}
                                      </div>
                                      <span className="text-muted-foreground text-xs">
                                        {strataUser.role.replace('_', ' ').toUpperCase()}
                                      </span>
                                    </div>
                                  </Label>
                                </div>
                              ))
                            ) : (
                              <div className="text-center py-4 text-muted-foreground">
                                <p className="text-sm">No other strata members available to message</p>
                              </div>
                            )}
                          </div>
                          {selectedRecipients.length > 0 && (
                            <div className="mt-3 pt-2 border-t">
                              <p className="text-sm text-muted-foreground">
                                {selectedRecipients.length} recipient(s) selected
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    <FormField
                      control={messageForm.control}
                      name="subject"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Subject</FormLabel>
                          <FormControl>
                            <Input placeholder="Message subject" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={messageForm.control}
                      name="content"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Message</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Type your message here..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={messageForm.control}
                      name="priority"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Priority</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select priority" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="low">Low</SelectItem>
                              <SelectItem value="normal">Normal</SelectItem>
                              <SelectItem value="high">High</SelectItem>
                              <SelectItem value="urgent">Urgent</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button 
                      type="submit" 
                      disabled={
                        createMessageMutation.isPending || 
                        (messageType === "private" && selectedRecipients.length === 0) ||
                        (isGroupChat && !groupChatName.trim())
                      }
                    >
                      <Send className="h-4 w-4 mr-2" />
                      {createMessageMutation.isPending ? "Sending..." : "Send Message"}
                    </Button>
                    
                    {messageType === "private" && selectedRecipients.length === 0 && (
                      <p className="text-sm text-muted-foreground">
                        Please select at least one recipient to send a private message.
                      </p>
                    )}
                    
                    {isGroupChat && !groupChatName.trim() && selectedRecipients.length > 1 && (
                      <p className="text-sm text-muted-foreground">
                        Please enter a group chat name.
                      </p>
                    )}
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="space-y-4">
            {(!messages || (messages as any[])?.length === 0) ? (
              <Card className="p-12 text-center">
                <div className="flex flex-col items-center justify-center space-y-4">
                  <div className="rounded-full bg-muted p-6">
                    <MessageSquare className="h-12 w-12 text-muted-foreground" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-semibold">No Messages Yet</h3>
                    <p className="text-muted-foreground max-w-md">
                      Start a conversation with your neighbors. Send a message to get started!
                    </p>
                  </div>
                  <Button onClick={() => setIsMessageDialogOpen(true)} size="lg">
                    <Plus className="h-4 w-4 mr-2" />
                    Send Your First Message
                  </Button>
                </div>
              </Card>
            ) : (
              groupMessagesByConversation(messages as any[]).map((conversation: any) => (
                <Card key={conversation.id} className="group cursor-pointer hover:shadow-lg hover:border-primary/20 transition-all duration-200"
                    onClick={() => {
                      if (!openConversations.includes(conversation.id)) {
                        setOpenConversations(prev => [...prev, conversation.id]);
                      }
                      
                      // Mark unread messages in this conversation as read
                      conversation.messages
                        .filter((msg: any) => !msg.isRead && msg.recipientId === user?.id)
                        .forEach((msg: any) => {
                          markMessageAsReadMutation.mutate(msg.id);
                        });
                    }}>
                {/* Mobile-optimized conversation card */}
                <CardContent className="p-4 lg:p-6">
                  <div className="space-y-3">
                    {/* Header with title and badges */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <h3 className="font-semibold text-base lg:text-lg text-foreground truncate pr-2">
                        {conversation.subject}
                      </h3>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {conversation.unreadCount > 0 && (
                          <Badge variant="destructive" className="rounded-full h-5 min-w-[20px] text-xs font-medium">
                            {conversation.unreadCount}
                          </Badge>
                        )}
                        <Badge variant={conversation.lastMessage.priority === 'urgent' ? 'destructive' : 
                                      conversation.lastMessage.priority === 'high' ? 'default' : 'secondary'}
                               className="text-xs font-medium">
                          {conversation.lastMessage.priority}
                        </Badge>
                      </div>
                    </div>
                    
                    {/* Sender info and message count */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                      <p className="text-sm text-muted-foreground">
                        <span className="font-medium">From:</span> {conversation.lastMessage.senderName || conversation.lastMessage.senderEmail}
                      </p>
                      {conversation.messages.length > 1 && (
                        <p className="text-sm text-muted-foreground">
                          <span className="hidden sm:inline">•</span>
                          <span className="font-medium">{conversation.messages.length}</span> messages
                        </p>
                      )}
                    </div>
                    
                    {/* Message preview */}
                    <p className="text-sm text-foreground/80 line-clamp-2 leading-relaxed">
                      {conversation.lastMessage.content}
                    </p>
                    
                    {/* Mobile-optimized footer */}
                    <div className="flex items-center justify-between pt-2">
                      <span className="text-xs lg:text-sm text-muted-foreground font-medium">
                        {formatDate(conversation.lastMessage.createdAt)}
                      </span>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteConversationMutation.mutate(conversation.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-xs px-2 py-1 h-7"
                      >
                        Delete Conversation
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="announcements" className="space-y-4">
          {/* Mobile-optimized header */}
          <div className="flex flex-col sm:flex-row gap-3 sm:justify-between sm:items-center">
            <h2 className="text-xl lg:text-2xl font-semibold">Community Announcements</h2>
            <Dialog open={isAnnouncementDialogOpen} onOpenChange={(open) => {
              setIsAnnouncementDialogOpen(open);
              if (!open) {
                setSelectedAnnouncement(null);
                announcementForm.reset();
              }
            }}>
              <DialogTrigger asChild>
                <Button className="w-full sm:w-auto" onClick={handleNewAnnouncement}>
                  <Plus className="h-4 w-4 mr-2" />
                  New Announcement
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{selectedAnnouncement ? 'Edit Announcement' : 'Create Announcement'}</DialogTitle>
                  <DialogDescription>
                    {selectedAnnouncement ? 'Update your announcement to the community.' : 'Post an announcement to the community.'}
                  </DialogDescription>
                </DialogHeader>
                <Form {...announcementForm}>
                  <form onSubmit={announcementForm.handleSubmit(onSubmitAnnouncement)} className="space-y-4">
                    <FormField
                      control={announcementForm.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Title</FormLabel>
                          <FormControl>
                            <Input placeholder="Announcement title" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={announcementForm.control}
                      name="content"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Content</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Announcement content" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={announcementForm.control}
                      name="type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Type</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="general">General</SelectItem>
                              <SelectItem value="maintenance">Maintenance</SelectItem>
                              <SelectItem value="financial">Financial</SelectItem>
                              <SelectItem value="event">Event</SelectItem>
                              <SelectItem value="emergency">Emergency</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" disabled={createAnnouncementMutation.isPending}>
                      {createAnnouncementMutation.isPending ? "Posting..." : "Post Announcement"}
                    </Button>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="space-y-4">
            {(!announcements || (announcements as any[])?.length === 0) ? (
              <Card className="p-12 text-center">
                <div className="flex flex-col items-center justify-center space-y-4">
                  <div className="rounded-full bg-muted p-6">
                    <Megaphone className="h-12 w-12 text-muted-foreground" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-semibold">No Announcements Yet</h3>
                    <p className="text-muted-foreground max-w-md">
                      There are currently no community announcements. Create one to share important information with your neighbors.
                    </p>
                  </div>
                  <Button onClick={handleNewAnnouncement} size="lg">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Announcement
                  </Button>
                </div>
              </Card>
            ) : (
              (announcements as any[])?.map((announcement: any) => (
                <Card key={announcement.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{announcement.title}</CardTitle>
                      <div className="flex items-center gap-2">
                        <Badge variant={announcement.priority === 'urgent' || announcement.category === 'emergency' ? 'destructive' : 'default'}>
                          {announcement.category || 'general'}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {formatDate(announcement.createdAt || new Date().toISOString())}
                        </span>
                        {user?.id === announcement.authorId && (
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditAnnouncement(announcement)}
                              className="h-8 w-8 p-0"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteAnnouncement(announcement.id)}
                              className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm whitespace-pre-wrap">{announcement.content}</p>
                    {announcement.authorName && (
                      <p className="text-xs text-muted-foreground mt-2">
                        Posted by {announcement.authorName}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* Delete Confirmation Dialog */}
          <AlertDialog open={!!deleteAnnouncementId} onOpenChange={(open) => !open && setDeleteAnnouncementId(null)}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Announcement</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete this announcement? This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setDeleteAnnouncementId(null)}>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={confirmDeleteAnnouncement}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          {/* Mobile-optimized header */}
          <div>
            <h2 className="text-xl lg:text-2xl font-semibold">Recent Activity</h2>
          </div>

          {/* Mobile-optimized metrics grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Residents
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{(residentDirectory as any[])?.length || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Active community members
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Recent Messages
                </CardTitle>
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{(messages as any[])?.length || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Community conversations
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Announcements
                </CardTitle>
                <Megaphone className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{(announcements as any[])?.length || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Community updates
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Activity Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                {getActivityFeedData().length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full py-12 space-y-4">
                    <div className="rounded-full bg-muted p-6">
                      <Clock className="h-12 w-12 text-muted-foreground" />
                    </div>
                    <div className="space-y-2 text-center">
                      <h3 className="text-lg font-semibold">No Recent Activity</h3>
                      <p className="text-sm text-muted-foreground max-w-sm">
                        Community activity will appear here once you start creating announcements and messages.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {getActivityFeedData().map((activity, index) => (
                      <div key={index} className="flex items-start gap-4">
                        <div className="mt-1">
                          <activity.icon className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium">{activity.title}</p>
                            <Badge variant={activity.priority === 'urgent' ? 'destructive' : 'secondary'}>
                              {activity.priority}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{activity.description}</p>
                          <p className="text-xs text-muted-foreground">{formatDate(activity.date)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Floating Chat Windows - Mobile Responsive */}
      <div className="fixed bottom-0 right-2 lg:right-4 flex gap-1 lg:gap-2 z-50 pb-safe">
        {openConversations.map((conversationId, index) => {
          const conversation = groupMessagesByConversation(messages as any[]).find(c => c.id === conversationId);
          if (!conversation) return null;
          
          const isMinimized = minimizedConversations.includes(conversationId);
          
          return (
            <ChatWindow
              key={conversationId}
              conversation={conversation}
              isMinimized={isMinimized}
              position={index}
              currentUserId={user?.id}
              onClose={() => setOpenConversations(prev => prev.filter(id => id !== conversationId))}
              onMinimize={() => {
                if (isMinimized) {
                  setMinimizedConversations(prev => prev.filter(id => id !== conversationId));
                } else {
                  setMinimizedConversations(prev => [...prev, conversationId]);
                }
              }}
              onReply={(messageId: string, subject: string) => {
                setReplyToMessage({ id: messageId, subject });
                setIsMessageDialogOpen(true);
              }}
              onMarkAsRead={(messageId: string) => {
                markMessageAsReadMutation.mutate(messageId);
              }}
              onSendMessage={(content: string) => {
                // Find all unique participants in the conversation (excluding current user)
                const allParticipants = conversation.messages
                  .flatMap((m: any) => [m.senderId, m.recipientId])
                  .filter((id: string) => id && id !== user?.id);
                
                const uniqueParticipants = Array.from(new Set(allParticipants));
                
                const messageData = {
                  content,
                  subject: conversation.subject.startsWith('Re:') ? conversation.subject : `Re: ${conversation.subject}`,
                  recipientIds: uniqueParticipants,
                  parentMessageId: conversation.lastMessage.id,
                  conversationId: conversation.id,
                  priority: "normal",
                  messageType: "private",
                };
                createMessageMutation.mutate(messageData);
              }}
              onAddParticipants={(participantIds: string[]) => {
                // Send a message to add the new participants to the conversation
                const messageData = {
                  content: `Added ${participantIds.length} new participant(s) to the conversation`,
                  subject: conversation.subject,
                  recipientIds: participantIds,
                  parentMessageId: conversation.lastMessage.id,
                  conversationId: conversation.id,
                  priority: "normal",
                  messageType: "private",
                };
                createMessageMutation.mutate(messageData);
              }}
              availableUsers={strataUsers as any[] || []}
            />
          );
        })}
      </div>
    </div>
  );
}

// ChatWindow component for messenger-style floating chat windows
interface ChatWindowProps {
  conversation: any;
  isMinimized: boolean;
  position: number;
  currentUserId: string | undefined;
  onClose: () => void;
  onMinimize: () => void;
  onReply: (messageId: string, subject: string) => void;
  onMarkAsRead: (messageId: string) => void;
  onSendMessage: (content: string) => void;
  onAddParticipants: (participantIds: string[]) => void;
  availableUsers: any[];
}

function ChatWindow({ conversation, isMinimized, position, currentUserId, onClose, onMinimize, onReply, onMarkAsRead, onSendMessage, onAddParticipants, availableUsers }: ChatWindowProps) {
  const [newMessage, setNewMessage] = useState("");
  const [showAddPeople, setShowAddPeople] = useState(false);

  if (!conversation) return null;

  // Get unique participants in the conversation
  const participants = Array.from(new Set([
    ...conversation.messages.map((m: any) => ({ id: m.senderId, name: m.senderName, email: m.senderEmail })),
    ...conversation.messages.map((m: any) => ({ id: m.recipientId, name: m.recipientName, email: m.recipientEmail }))
  ].filter(p => p.id && p.id !== currentUserId)));

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    onSendMessage(newMessage);
    setNewMessage("");
  };

  return (
    <Card 
      className={`w-72 lg:w-80 ${isMinimized ? 'h-12 lg:h-14' : 'max-h-[60vh] lg:h-[450px]'} shadow-xl border border-border/50 transition-all duration-300 bg-background flex flex-col`}
      style={{ 
        marginRight: `${position * (window.innerWidth < 1024 ? 296 : 336)}px`, // Responsive positioning
        bottom: window.innerWidth < 1024 ? '20px' : '0px' // Add bottom spacing on mobile
      }}
    >
      {/* Mobile-optimized Chat Header */}
      <div className="flex items-center justify-between p-3 lg:p-4 border-b bg-slate-800 text-white cursor-pointer flex-shrink-0"
           onClick={onMinimize}>
        <div className="flex items-center gap-2 lg:gap-3 min-w-0 flex-1">
          <div className="w-7 h-7 lg:w-9 lg:h-9 rounded-full bg-slate-600 flex items-center justify-center flex-shrink-0">
            <span className="text-xs lg:text-sm font-semibold text-white">
              {conversation.lastMessage.senderName?.charAt(0).toUpperCase() || 'U'}
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="text-xs lg:text-sm font-semibold truncate">{conversation.subject}</h4>
            <p className="text-xs opacity-90 truncate hidden lg:block">
              {participants.length > 0 ? 
                participants.map(p => p.name || p.email).slice(0, 2).join(', ') + (participants.length > 2 ? '...' : '') : 
                `${conversation.messages.length} message${conversation.messages.length !== 1 ? 's' : ''}`
              }
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setShowAddPeople(true); }} 
                  className="h-6 w-6 lg:h-7 lg:w-7 p-0 text-white hover:bg-white/20 rounded-md text-xs lg:text-sm">
            +
          </Button>
          <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); onMinimize(); }} 
                  className="h-6 w-6 lg:h-7 lg:w-7 p-0 text-white hover:bg-white/20 rounded-md text-xs lg:text-sm">
            {isMinimized ? '□' : '_'}
          </Button>
          <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); onClose(); }}
                  className="h-6 w-6 lg:h-7 lg:w-7 p-0 text-white hover:bg-white/20 rounded-md text-xs lg:text-sm">
            ×
          </Button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Chat Messages - Mobile Responsive Height */}
          <ScrollArea className="flex-1 p-3 lg:p-4 min-h-0" style={{ maxHeight: 'calc(60vh - 120px)' }}>
            <div className="space-y-4">
              {conversation.messages
                .sort((a: any, b: any) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
                .map((message: any) => {
                  const isOwnMessage = message.senderId === currentUserId;
                  return (
                    <div key={message.id} className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[75%] ${isOwnMessage ? 'bg-slate-700 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white'} 
                                     rounded-2xl px-3 py-2 text-sm shadow-sm`}>
                        <p className="text-xs font-medium mb-1 opacity-80">
                          {isOwnMessage ? 'You' : (message.senderName || message.senderEmail)}
                        </p>
                        <p className="leading-relaxed">{message.content}</p>
                        <p className={`text-xs mt-2 ${isOwnMessage ? 'text-white/60' : 'text-slate-500 dark:text-slate-400'} text-right`}>
                          {new Date(message.createdAt).toLocaleTimeString("en-US", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                          {!message.isRead && message.recipientId === currentUserId && (
                            <span className="ml-1 text-blue-400">•</span>
                          )}
                        </p>
                      </div>
                    </div>
                  );
                })}
            </div>
          </ScrollArea>

          {/* Mobile-optimized Message Input */}
          <div className="border-t bg-muted/20 p-3 lg:p-4 flex-shrink-0">
            <div className="flex gap-2 lg:gap-3 items-end">
              <Input 
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                className="flex-1 min-h-[36px] lg:min-h-[40px] bg-background border-border/50 focus:border-primary rounded-lg text-sm"
              />
              <Button 
                size="sm" 
                onClick={handleSendMessage} 
                disabled={!newMessage.trim()}
                className="h-9 w-9 lg:h-10 lg:w-10 p-0 rounded-lg flex-shrink-0"
              >
                <Send className="h-3 w-3 lg:h-4 lg:w-4" />
              </Button>
            </div>
          </div>
        </>
      )}

      {/* Add People Dialog */}
      <Dialog open={showAddPeople} onOpenChange={setShowAddPeople}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add People to Conversation</DialogTitle>
            <DialogDescription>
              Select people to add to this conversation.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 max-h-60 overflow-y-auto">
            {availableUsers
              .filter(user => 
                !conversation.messages.some((m: any) => m.senderId === user.userId || m.recipientId === user.userId) &&
                user.userId !== currentUserId
              )
              .map((user: any) => (
                <div key={user.userId} className="flex items-center space-x-3 p-2 hover:bg-muted rounded-lg cursor-pointer"
                     onClick={() => {
                       onAddParticipants([user.userId]);
                       setShowAddPeople(false);
                     }}>
                  <div className="w-8 h-8 rounded-full bg-slate-600 flex items-center justify-center">
                    <span className="text-sm font-medium text-white">
                      {(user.user?.firstName?.charAt(0) || user.user?.email?.charAt(0) || 'U').toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">
                      {user.user?.firstName && user.user?.lastName 
                        ? `${user.user.firstName} ${user.user.lastName}`
                        : user.user?.email
                      }
                    </p>
                    <p className="text-xs text-muted-foreground">{user.role}</p>
                  </div>
                </div>
              ))}
            {availableUsers.filter(user => 
              !conversation.messages.some((m: any) => m.senderId === user.userId || m.recipientId === user.userId) &&
              user.userId !== currentUserId
            ).length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                All available users are already in this conversation.
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}