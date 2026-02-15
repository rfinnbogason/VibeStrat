import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Calendar, Receipt, Megaphone, Zap, Wrench } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { SuggestRepairModal } from "@/components/repair-requests/suggest-repair-modal";

export default function QuickActions() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [showRepairModal, setShowRepairModal] = useState(false);
  
  // Get selected strata from localStorage (same as dashboard)
  const selectedStrata = localStorage.getItem('selectedStrata');

  // Fetch upcoming meetings
  const { data: meetings = [] } = useQuery({
    queryKey: [`/api/strata/${selectedStrata}/meetings`],
    enabled: !!selectedStrata,
  });

  // Filter for upcoming meetings (next 30 days)
  const upcomingEvents = meetings
    .filter((meeting: any) => {
      const meetingDate = new Date(meeting.scheduledAt);
      const now = new Date();
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(now.getDate() + 30);
      return meetingDate > now && meetingDate < thirtyDaysFromNow && meeting.status === 'scheduled';
    })
    .slice(0, 3) // Limit to 3 most recent
    .map((meeting: any, index: number) => ({
      id: meeting.id,
      title: meeting.title,
      date: new Date(meeting.scheduledAt).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      }),
      color: index % 2 === 0 ? "bg-accent" : "bg-secondary",
    }));

  const handleQuickAction = (action: string) => {
    if (action === "Request Quote") {
      setLocation("/quotes");
      return;
    }
    
    if (action === "Schedule Meeting") {
      setLocation("/meetings?action=schedule");
      return;
    }
    
    if (action === "Add Expense") {
      setLocation("/financial?action=add-expense");
      return;
    }
    
    if (action === "Send Announcement") {
      setLocation("/communications?action=new-announcement");
      return;
    }
    
    toast({
      title: "Quick Action",
      description: `${action} functionality coming soon!`,
    });
  };

  return (
    <Card className="bg-white shadow-lg border border-border">
      <CardHeader className="border-b border-border">
        <CardTitle className="flex items-center">
          <Zap className="mr-3 h-5 w-5 text-accent" />
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-4">
        <Button 
          className="w-full bg-secondary text-white hover:bg-secondary/90"
          onClick={() => handleQuickAction("Request Quote")}
        >
          <FileText className="mr-2 h-4 w-4" />
          Request Quote
        </Button>
        
        <Button 
          className="w-full bg-primary text-white hover:bg-primary/90"
          onClick={() => handleQuickAction("Schedule Meeting")}
        >
          <Calendar className="mr-2 h-4 w-4" />
          Schedule Meeting
        </Button>
        
        <Button 
          variant="outline" 
          className="w-full border-border hover:bg-muted"
          onClick={() => handleQuickAction("Add Expense")}
        >
          <Receipt className="mr-2 h-4 w-4" />
          Add Expense
        </Button>
        
        <Button
          variant="outline"
          className="w-full border-border hover:bg-muted"
          onClick={() => handleQuickAction("Send Announcement")}
        >
          <Megaphone className="mr-2 h-4 w-4" />
          Send Announcement
        </Button>

        <Button
          className="w-full bg-orange-600 text-white hover:bg-orange-700"
          onClick={() => setShowRepairModal(true)}
        >
          <Wrench className="mr-2 h-4 w-4" />
          Suggest a Repair
        </Button>

        {/* Upcoming Events */}
        <div className="border-t border-border pt-6">
          <h4 className="font-semibold text-foreground mb-4 flex items-center">
            <Calendar className="mr-2 h-4 w-4 text-secondary" />
            Upcoming Events
          </h4>
          <div className="space-y-3">
            {upcomingEvents.length > 0 ? (
              upcomingEvents.map((event: any) => (
                <div key={event.id} className="flex items-center space-x-3">
                  <div className={`w-3 h-3 ${event.color} rounded-full`}></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">{event.title}</p>
                    <p className="text-xs text-muted-foreground">{event.date}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-4">
                <p className="text-sm text-muted-foreground">No upcoming events scheduled</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-2"
                  onClick={() => setLocation("/meetings?action=schedule")}
                >
                  Schedule Meeting
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardContent>

      {/* Repair Request Modal */}
      {selectedStrata && (
        <SuggestRepairModal
          open={showRepairModal}
          onOpenChange={setShowRepairModal}
          strataId={selectedStrata}
        />
      )}
    </Card>
  );
}
