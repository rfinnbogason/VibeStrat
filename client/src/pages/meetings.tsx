import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Calendar, 
  Plus, 
  Play, 
  Pause, 
  Square, 
  Mic, 
  FileText, 
  Users, 
  Clock,
  Download,
  Edit,
  Trash2,
  Volume2,
  VolumeX
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useStrata } from "@/lib/strata-context";
import { useLocation } from "wouter";
import type { Meeting } from "@shared/schema";

// Helper function to format datetime for datetime-local input
// Converts from UTC to local timezone for display
const formatDateTimeLocal = (dateString: string | undefined) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  // Format: YYYY-MM-DDTHH:mm
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

export default function Meetings() {
  const [isMeetingDialogOpen, setIsMeetingDialogOpen] = useState(false);
  const [editingMeeting, setEditingMeeting] = useState<Meeting | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
  const [isMinutesDialogOpen, setIsMinutesDialogOpen] = useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [meetingToDelete, setMeetingToDelete] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Get strata context
  const { selectedStrataId, selectedStrata, isLoading: strataLoading } = useStrata();
  const [location] = useLocation();

  // Fetch meetings and filter out problematic old meeting
  const { data: rawMeetings = [], isLoading: meetingsLoading } = useQuery<Meeting[]>({
    queryKey: [`/api/strata/${selectedStrataId}/meetings`],
    enabled: !!selectedStrataId,
  });

  // Check for URL parameter to auto-open schedule dialog or specific meeting
  useEffect(() => {
    const urlParams = new URLSearchParams(location.split('?')[1] || '');

    // Check if we should open the schedule dialog
    if (urlParams.get('action') === 'schedule') {
      setIsMeetingDialogOpen(true);
      setEditingMeeting(null);
      // Clean up URL parameter
      window.history.replaceState({}, document.title, '/meetings');
    }

    // Check if we should open a specific meeting
    const meetingId = urlParams.get('id');
    if (meetingId && rawMeetings.length > 0) {
      const meeting = rawMeetings.find(m => m.id === meetingId);
      if (meeting) {
        setSelectedMeeting(meeting);
        setIsMinutesDialogOpen(true);
        // Clean up URL parameter
        window.history.replaceState({}, document.title, '/meetings');
      }
    }
  }, [location, rawMeetings]);

  // Filter out the specific old meeting that doesn't exist in Firebase
  const meetings = rawMeetings.filter(meeting => meeting.id !== 'NYMz1ZhyBdpqrMk7Ipep');

  // Fetch strata users for invitees selection
  const { data: strataUsers = [] } = useQuery({
    queryKey: [`/api/strata/${selectedStrataId}/users`],
    enabled: !!selectedStrataId,
  });

  // Create meeting mutation
  const createMeetingMutation = useMutation({
    mutationFn: async (meetingData: any) => {
      const response = await apiRequest("POST", `/api/strata/${selectedStrataId}/meetings`, meetingData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/strata/${selectedStrataId}/meetings`] });
      queryClient.invalidateQueries({ queryKey: [`/api/strata/${selectedStrataId}/notifications`] });
      queryClient.invalidateQueries({ queryKey: [`/api/strata/${selectedStrataId}/recent-activity`] });
      setIsMeetingDialogOpen(false);
      setEditingMeeting(null);
      toast({ title: "Success", description: "Meeting created successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create meeting", variant: "destructive" });
    },
  });

  // Update meeting mutation
  const updateMeetingMutation = useMutation({
    mutationFn: async (meetingData: any) => {
      const response = await apiRequest("PATCH", `/api/meetings/${editingMeeting?.id}`, meetingData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/strata/${selectedStrata}/meetings`] });
      setIsMeetingDialogOpen(false);
      setIsMinutesDialogOpen(false);
      setEditingMeeting(null);
      toast({ title: "Success", description: "Meeting updated successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update meeting", variant: "destructive" });
    },
  });

  // Update minutes mutation
  const updateMinutesMutation = useMutation({
    mutationFn: async ({ id, minutes }: { id: string; minutes: string }) => {
      const response = await apiRequest("PATCH", `/api/meetings/${id}`, {
        minutes,
        status: 'completed' // Auto-set status to completed when minutes are added
      });
      return response.json();
    },
    onSuccess: (updatedMeeting) => {
      queryClient.invalidateQueries({ queryKey: [`/api/strata/${selectedStrataId}/meetings`] });
      // Update the selected meeting with the saved data
      if (selectedMeeting) {
        setSelectedMeeting({
          ...selectedMeeting,
          minutes: updatedMeeting.minutes,
          status: updatedMeeting.status
        });
      }
      toast({ title: "Success", description: "Meeting minutes saved successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to save meeting minutes", variant: "destructive" });
    },
  });

  // Delete meeting mutation
  const deleteMeetingMutation = useMutation({
    mutationFn: async (meetingId: string) => {
      const response = await apiRequest("DELETE", `/api/meetings/${meetingId}`);
      return response.json();
    },
    onSuccess: () => {
      // Invalidate and refetch meetings list
      queryClient.invalidateQueries({ queryKey: [`/api/strata/${selectedStrataId}/meetings`] });
      toast({ title: "Success", description: "Meeting deleted successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to delete meeting", variant: "destructive" });
    },
  });

  // Audio upload and transcription mutation
  const uploadAudioMutation = useMutation({
    mutationFn: async ({ meetingId, audioBlob }: { meetingId: string; audioBlob: Blob }) => {
      console.log('🎙️ Starting audio upload for meeting:', meetingId);
      console.log('📊 Audio blob size:', audioBlob.size);
      
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.wav');
      
      // Use apiRequest for proper authentication
      const response = await apiRequest("POST", `/api/meetings/${meetingId}/upload-audio`, formData);
      
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [`/api/strata/${selectedStrata}/meetings`] });
      toast({ 
        title: "Audio Transcribed", 
        description: "Audio uploaded and transcribed successfully. Generating meeting minutes..." 
      });
      
      // Automatically generate minutes after successful transcription
      if (selectedMeeting?.id) {
        generateMinutesMutation.mutate(selectedMeeting.id);
      }
    },
    onError: (error: any) => {
      console.error('Upload error:', error);
      toast({ 
        title: "Transcription Failed", 
        description: error.message || "Failed to transcribe audio", 
        variant: "destructive" 
      });
    },
  });

  // Generate meeting minutes mutation
  const generateMinutesMutation = useMutation({
    mutationFn: async (meetingId: string) => {
      const response = await apiRequest("POST", `/api/meetings/${meetingId}/generate-minutes`);
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [`/api/strata/${selectedStrataId}/meetings`] });
      toast({ 
        title: "Minutes Generated", 
        description: "AI-powered meeting minutes have been created and are ready for review." 
      });
    },
    onError: (error: any) => {
      console.error('Minutes generation error:', error);
      toast({ 
        title: "Minutes Generation Failed", 
        description: "Failed to generate meeting minutes", 
        variant: "destructive" 
      });
    },
  });

  // Recording functions
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

      toast({ title: "Recording started", description: "Audio recording is now active" });
    } catch (error) {
      toast({ title: "Error", description: "Could not access microphone", variant: "destructive" });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        uploadRecording(audioBlob);
      };

      toast({ title: "Recording stopped", description: "Processing audio..." });
    }
  };

  const uploadRecording = async (audioBlob: Blob) => {
    if (!selectedMeeting?.id) {
      toast({ title: "Error", description: "No meeting selected for recording", variant: "destructive" });
      return;
    }

    // Use the new mutation to upload audio and automatically transcribe
    uploadAudioMutation.mutate({ 
      meetingId: selectedMeeting.id, 
      audioBlob 
    });
  };

  const handleMeetingSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const meetingDateString = formData.get("meetingDate") as string;
    const title = formData.get("title") as string;
    const chairperson = formData.get("chairperson") as string;

    // Validate required fields
    if (!title || title.trim().length === 0) {
      toast({
        title: "Validation Error",
        description: "Meeting title is required",
        variant: "destructive"
      });
      return;
    }

    if (!meetingDateString) {
      toast({
        title: "Validation Error",
        description: "Meeting date and time is required",
        variant: "destructive"
      });
      return;
    }

    // Validate date is not in the past (only for new meetings)
    if (!editingMeeting) {
      const meetingDate = new Date(meetingDateString);
      const now = new Date();
      if (meetingDate < now) {
        toast({
          title: "Validation Error",
          description: "Meeting date cannot be in the past",
          variant: "destructive"
        });
        return;
      }
    }

    // Collect selected invitees
    const selectedInvitees = formData.getAll("invitees") as string[];

    const meetingData = {
      title: title.trim(),
      description: formData.get("description"),
      meetingType: formData.get("meetingType"),
      meetingDate: new Date(meetingDateString).toISOString(),
      location: formData.get("location"),
      chairperson: chairperson?.trim() || null,
      agenda: formData.get("agenda"),
      scheduledAt: new Date(meetingDateString).toISOString(),
      status: "scheduled",
      invitees: selectedInvitees, // Include selected invitees
    };

    if (editingMeeting) {
      updateMeetingMutation.mutate(meetingData);
    } else {
      createMeetingMutation.mutate(meetingData);
    }
  };

  const handleEditMeeting = (meeting: Meeting) => {
    setEditingMeeting(meeting);
    setIsMeetingDialogOpen(true);
  };

  const handleDeleteMeeting = (meetingId: string) => {
    setMeetingToDelete(meetingId);
  };

  const confirmDeleteMeeting = () => {
    if (meetingToDelete) {
      deleteMeetingMutation.mutate(meetingToDelete);
      setMeetingToDelete(null);
    }
  };

  const openMinutesDialog = (meeting: Meeting) => {
    setSelectedMeeting(meeting);
    setIsMinutesDialogOpen(true);
  };

  const generateMinutes = async (meetingId: string) => {
    setIsTranscribing(true);
    try {
      await generateMinutesMutation.mutateAsync(meetingId);
    } finally {
      setIsTranscribing(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-green-500";
      case "in_progress": return "bg-blue-500";
      case "scheduled": return "bg-yellow-500";
      case "cancelled": return "bg-red-500";
      default: return "bg-gray-500";
    }
  };

  // Show loading while strata context is loading or no strata selected
  if (strataLoading || !selectedStrata) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (meetingsLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Meeting Management</h1>
          <p className="text-muted-foreground mt-1">
            Schedule meetings, record audio, and manage minutes
          </p>
        </div>
        <Dialog open={isMeetingDialogOpen} onOpenChange={setIsMeetingDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              className="bg-green-500 hover:bg-green-600 text-white"
              onClick={() => {
                setEditingMeeting(null);
                setIsMeetingDialogOpen(true);
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              Schedule Meeting
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingMeeting ? "Edit Meeting" : "Schedule New Meeting"}</DialogTitle>
              <DialogDescription>
                {editingMeeting ? "Update meeting details" : "Create a new meeting for the strata"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleMeetingSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Meeting Title</Label>
                  <Input 
                    id="title" 
                    name="title" 
                    defaultValue={editingMeeting?.title}
                    placeholder="e.g., Monthly Board Meeting"
                    required 
                  />
                </div>
                <div>
                  <Label htmlFor="meetingType">Meeting Type</Label>
                  <Select name="meetingType" defaultValue={editingMeeting?.meetingType || "board"}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select meeting type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="board">Board Meeting</SelectItem>
                      <SelectItem value="annual">Annual General Meeting</SelectItem>
                      <SelectItem value="special">Special Meeting</SelectItem>
                      <SelectItem value="committee">Committee Meeting</SelectItem>
                      <SelectItem value="emergency">Emergency Meeting</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea 
                  id="description" 
                  name="description" 
                  defaultValue={editingMeeting?.description}
                  placeholder="Meeting description and purpose"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="meetingDate">Date & Time</Label>
                  <Input
                    id="meetingDate"
                    name="meetingDate"
                    type="datetime-local"
                    defaultValue={formatDateTimeLocal(editingMeeting?.meetingDate || editingMeeting?.scheduledAt)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input 
                    id="location" 
                    name="location" 
                    defaultValue={editingMeeting?.location}
                    placeholder="Meeting location or virtual link"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="chairperson">Chairperson</Label>
                <Input 
                  id="chairperson" 
                  name="chairperson" 
                  defaultValue={editingMeeting?.chairperson}
                  placeholder="Meeting chairperson name"
                />
              </div>

              <div>
                <Label htmlFor="agenda">Agenda</Label>
                <Textarea 
                  id="agenda" 
                  name="agenda" 
                  defaultValue={editingMeeting?.agenda}
                  placeholder="Meeting agenda items"
                  rows={4}
                />
              </div>

              <div>
                <Label htmlFor="invitees">Meeting Invitees</Label>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Select residents to invite to this meeting</p>
                  <div className="grid grid-cols-1 gap-2 max-h-32 overflow-y-auto border rounded p-2">
                    {strataUsers.map((userAccess: any) => (
                      <div key={userAccess.id} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={`invitee-${userAccess.userId}`}
                          name="invitees"
                          value={userAccess.userId}
                          className="h-4 w-4 rounded border-gray-300"
                        />
                        <Label 
                          htmlFor={`invitee-${userAccess.userId}`}
                          className="text-sm font-normal cursor-pointer flex-1"
                        >
                          <div className="flex items-center justify-between">
                            <span>
                              {userAccess.user?.firstName && userAccess.user?.lastName 
                                ? `${userAccess.user.firstName} ${userAccess.user.lastName}` 
                                : userAccess.user?.email || 'Unknown User'}
                            </span>
                            <Badge variant="outline" className="text-xs">
                              {userAccess.role}
                            </Badge>
                          </div>
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <Button type="submit" disabled={createMeetingMutation.isPending || updateMeetingMutation.isPending}>
                {(createMeetingMutation.isPending || updateMeetingMutation.isPending) ? "Saving..." : 
                 editingMeeting ? "Update Meeting" : "Schedule Meeting"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Meeting Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Meetings</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{meetings.length}</div>
            <p className="text-xs text-muted-foreground">All scheduled meetings</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {meetings.filter(m => new Date(m.meetingDate) > new Date() && m.status === 'scheduled').length}
            </div>
            <p className="text-xs text-muted-foreground">Scheduled meetings</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {meetings.filter(m => m.status === 'completed' || (m.minutes && m.minutes.length > 0)).length}
            </div>
            <p className="text-xs text-muted-foreground">With minutes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recordings</CardTitle>
            <Volume2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {meetings.filter(m => m.audioUrl).length}
            </div>
            <p className="text-xs text-muted-foreground">Audio recordings</p>
          </CardContent>
        </Card>
      </div>

      {/* Recording Controls */}
      {selectedMeeting && (
        <Card>
          <CardHeader>
            <CardTitle>Audio Recording - {selectedMeeting.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4">
              {!isRecording ? (
                <Button onClick={startRecording} className="bg-red-500 hover:bg-red-600 text-white">
                  <Mic className="mr-2 h-4 w-4" />
                  Start Recording
                </Button>
              ) : (
                <Button onClick={stopRecording} variant="destructive">
                  <Square className="mr-2 h-4 w-4" />
                  Stop Recording
                </Button>
              )}
              
              {isRecording && (
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                  <span className="font-mono text-lg">{formatTime(recordingTime)}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Meetings Table */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <CardTitle>Meetings Schedule</CardTitle>
              {isRecording && (
                <div className="flex items-center space-x-2 text-red-600">
                  <div className="w-3 h-3 bg-red-600 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium">Recording: {formatTime(recordingTime)}</span>
                </div>
              )}
              {(uploadAudioMutation.isPending || generateMinutesMutation.isPending) && (
                <div className="flex items-center space-x-2 text-blue-600">
                  <div className="w-3 h-3 bg-blue-600 rounded-full animate-spin border-2 border-transparent border-t-blue-600"></div>
                  <span className="text-sm font-medium">
                    {uploadAudioMutation.isPending ? "Transcribing Audio..." : "Generating Minutes..."}
                  </span>
                </div>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {/* Desktop Table View */}
          <div className="hidden lg:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Meeting</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Chairperson</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {meetings.map((meeting) => (
                  <TableRow key={meeting.id}>
                    <TableCell>
                      <div>
                        <div
                          className="font-medium text-blue-600 hover:text-blue-800 cursor-pointer hover:underline"
                          onClick={() => {
                            setSelectedMeeting(meeting);
                            setIsDetailsDialogOpen(true);
                          }}
                        >
                          {meeting.title}
                        </div>
                        {meeting.description && (
                          <div className="text-sm text-muted-foreground">{meeting.description}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {meeting.meetingType?.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{new Date(meeting.meetingDate).toLocaleDateString()}</div>
                        <div className="text-muted-foreground">
                          {new Date(meeting.meetingDate).toLocaleTimeString()}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={`${getStatusColor(meeting.status)} text-white capitalize`}>
                        {meeting.status.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>{meeting.chairperson || 'TBD'}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditMeeting(meeting)}
                          className="text-blue-600 border-blue-600 hover:bg-blue-50"
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedMeeting(meeting);
                            if (isRecording && selectedMeeting?.id === meeting.id) {
                              stopRecording();
                            } else {
                              startRecording();
                            }
                          }}
                          className={`${isRecording && selectedMeeting?.id === meeting.id 
                            ? 'text-red-600 border-red-600 hover:bg-red-50' 
                            : 'text-green-600 border-green-600 hover:bg-green-50'}`}
                          title={isRecording && selectedMeeting?.id === meeting.id ? "Stop Recording" : "Start Recording"}
                          disabled={uploadAudioMutation.isPending || generateMinutesMutation.isPending}
                        >
                          {isRecording && selectedMeeting?.id === meeting.id ? (
                            <Square className="h-3 w-3" />
                          ) : (
                            <Mic className="h-3 w-3" />
                          )}
                        </Button>

                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openMinutesDialog(meeting)}
                          className="text-purple-600 border-purple-600 hover:bg-purple-50"
                          title="View Minutes"
                        >
                          <FileText className="h-3 w-3" />
                        </Button>

                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteMeeting(meeting.id)}
                          className="text-red-600 border-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Mobile Card View */}
          <div className="lg:hidden space-y-4 p-4">
            {meetings.map((meeting) => (
              <Card key={meeting.id} className="border border-gray-200">
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3
                          className="font-medium text-base text-blue-600 hover:text-blue-800 cursor-pointer hover:underline"
                          onClick={() => {
                            setSelectedMeeting(meeting);
                            setIsDetailsDialogOpen(true);
                          }}
                        >
                          {meeting.title}
                        </h3>
                        {meeting.description && (
                          <p className="text-sm text-muted-foreground mt-1">{meeting.description}</p>
                        )}
                      </div>
                      <Badge className={`${getStatusColor(meeting.status)} text-white capitalize ml-2 shrink-0`}>
                        {meeting.status.replace('_', ' ')}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-muted-foreground">Type:</span>
                        <div className="mt-1">
                          <Badge variant="outline" className="capitalize">
                            {meeting.meetingType?.replace('_', ' ')}
                          </Badge>
                        </div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Chairperson:</span>
                        <div className="mt-1 font-medium">{meeting.chairperson || 'TBD'}</div>
                      </div>
                    </div>

                    <div>
                      <span className="text-muted-foreground text-sm">Date & Time:</span>
                      <div className="mt-1">
                        <div className="font-medium">{new Date(meeting.meetingDate).toLocaleDateString()}</div>
                        <div className="text-sm text-muted-foreground">
                          {new Date(meeting.meetingDate).toLocaleTimeString()}
                        </div>
                      </div>
                    </div>

                    {/* Mobile Action Buttons */}
                    <div className="flex flex-wrap gap-2 pt-2 border-t">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEditMeeting(meeting)}
                        className="text-blue-600 border-blue-600 hover:bg-blue-50 flex-1 min-w-[80px]"
                      >
                        <Edit className="h-3 w-3 mr-1" />
                        Edit
                      </Button>
                      
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedMeeting(meeting);
                          if (isRecording && selectedMeeting?.id === meeting.id) {
                            stopRecording();
                          } else {
                            startRecording();
                          }
                        }}
                        className={`${isRecording && selectedMeeting?.id === meeting.id 
                          ? 'text-red-600 border-red-600 hover:bg-red-50' 
                          : 'text-green-600 border-green-600 hover:bg-green-50'} flex-1 min-w-[80px]`}
                        disabled={uploadAudioMutation.isPending || generateMinutesMutation.isPending}
                      >
                        {isRecording && selectedMeeting?.id === meeting.id ? (
                          <>
                            <Square className="h-3 w-3 mr-1" />
                            Stop
                          </>
                        ) : (
                          <>
                            <Mic className="h-3 w-3 mr-1" />
                            Record
                          </>
                        )}
                      </Button>

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openMinutesDialog(meeting)}
                        className="text-purple-600 border-purple-600 hover:bg-purple-50 flex-1 min-w-[80px]"
                      >
                        <FileText className="h-3 w-3 mr-1" />
                        Minutes
                      </Button>

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteMeeting(meeting.id)}
                        className="text-red-600 border-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Minutes Dialog */}
      <Dialog open={isMinutesDialogOpen} onOpenChange={setIsMinutesDialogOpen}>
        <DialogContent className="max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="text-lg md:text-xl">Meeting Minutes - {selectedMeeting?.title}</DialogTitle>
            <DialogDescription>
              View and manage meeting minutes and transcriptions
            </DialogDescription>
          </DialogHeader>
          
          {selectedMeeting && (
            <div className="space-y-4 overflow-y-auto max-h-[calc(90vh-120px)] pr-2">
              {selectedMeeting.audioUrl && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Audio Recording</h4>
                  <audio controls className="w-full">
                    <source src={selectedMeeting.audioUrl} type="audio/wav" />
                    Your browser does not support the audio element.
                  </audio>
                  
                  {!selectedMeeting.minutes && (
                    <Button
                      onClick={() => generateMinutes(selectedMeeting.id)}
                      disabled={isTranscribing}
                      className="mt-2"
                    >
                      {isTranscribing ? "Generating..." : "Generate Minutes with AI"}
                    </Button>
                  )}
                </div>
              )}

              {selectedMeeting.transcription && (
                <div>
                  <h4 className="font-medium mb-2">Transcription</h4>
                  <div className="bg-gray-50 p-4 rounded-lg max-h-60 overflow-y-auto">
                    <p className="text-sm whitespace-pre-wrap">{selectedMeeting.transcription}</p>
                  </div>
                </div>
              )}

              <div>
                <h4 className="font-medium mb-2">Meeting Minutes</h4>
                <Textarea
                  value={selectedMeeting.minutes || ''}
                  onChange={(e) => setSelectedMeeting({...selectedMeeting, minutes: e.target.value})}
                  rows={8}
                  className="min-h-[200px] max-h-[300px] resize-y"
                  placeholder="Meeting minutes will be generated here or you can type them manually..."
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-2 sm:space-x-2 sticky bottom-0 bg-white pt-4 border-t">
                <Button
                  onClick={() => updateMinutesMutation.mutate({ 
                    id: selectedMeeting.id, 
                    minutes: selectedMeeting.minutes || '' 
                  })}
                  disabled={updateMinutesMutation.isPending}
                >
                  {updateMinutesMutation.isPending ? "Saving..." : "Save Minutes"}
                </Button>
                
                {selectedMeeting.minutes && (
                  <Button variant="outline">
                    <Download className="mr-2 h-4 w-4" />
                    Export PDF
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Meeting Details Dialog */}
      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg md:text-xl">{selectedMeeting?.title}</DialogTitle>
            <DialogDescription>
              Meeting Details and Information
            </DialogDescription>
          </DialogHeader>

          {selectedMeeting && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Meeting Type</Label>
                  <p className="mt-1 capitalize">{selectedMeeting.meetingType?.replace('_', ' ')}</p>
                </div>

                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Status</Label>
                  <div className="mt-1">
                    <Badge className={`${getStatusColor(selectedMeeting.status)} text-white capitalize`}>
                      {selectedMeeting.status.replace('_', ' ')}
                    </Badge>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Date & Time</Label>
                  <p className="mt-1">
                    {new Date(selectedMeeting.scheduledAt || selectedMeeting.meetingDate || '').toLocaleString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>

                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Chairperson</Label>
                  <p className="mt-1">{selectedMeeting.chairperson || 'Not assigned'}</p>
                </div>

                <div className="md:col-span-2">
                  <Label className="text-sm font-medium text-muted-foreground">Location</Label>
                  <p className="mt-1">{selectedMeeting.location || 'Not specified'}</p>
                </div>
              </div>

              {selectedMeeting.description && (
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Description</Label>
                  <p className="mt-1 text-sm">{selectedMeeting.description}</p>
                </div>
              )}

              {selectedMeeting.agenda && (
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Agenda</Label>
                  <p className="mt-1 text-sm whitespace-pre-wrap">{selectedMeeting.agenda}</p>
                </div>
              )}

              {selectedMeeting.minutes && (
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Minutes</Label>
                  <div className="mt-1 p-3 bg-gray-50 rounded-md text-sm whitespace-pre-wrap">
                    {selectedMeeting.minutes}
                  </div>
                </div>
              )}

              {selectedMeeting.audioUrl && (
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Audio Recording</Label>
                  <audio controls className="w-full mt-2">
                    <source src={selectedMeeting.audioUrl} type="audio/wav" />
                    Your browser does not support the audio element.
                  </audio>
                </div>
              )}

              <div className="flex gap-2 pt-4 border-t">
                <Button
                  onClick={() => {
                    setIsDetailsDialogOpen(false);
                    setEditingMeeting(selectedMeeting);
                    setIsMeetingDialogOpen(true);
                  }}
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Meeting
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsDetailsDialogOpen(false);
                    setIsMinutesDialogOpen(true);
                  }}
                >
                  <FileText className="mr-2 h-4 w-4" />
                  {selectedMeeting.minutes ? 'View Minutes' : 'Add Minutes'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!meetingToDelete} onOpenChange={() => setMeetingToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Meeting</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this meeting? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteMeeting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}