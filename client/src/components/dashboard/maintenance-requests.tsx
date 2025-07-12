import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Wrench, ExternalLink, ArrowRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface MaintenanceRequestsProps {
  strataId: string;
}

export default function MaintenanceRequests({ strataId }: MaintenanceRequestsProps) {
  const { data: requests = [], isLoading } = useQuery({
    queryKey: [`/api/strata/${strataId}/maintenance`],
    enabled: !!strataId,
  });

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'submitted': return 'status-pending';
      case 'in_progress': return 'status-pending';
      case 'completed': return 'status-approved';
      default: return 'status-pending';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'submitted': return 'Submitted';
      case 'in_progress': return 'In Progress';
      case 'completed': return 'Completed';
      default: return status;
    }
  };

  if (isLoading) {
    return (
      <Card className="bg-white shadow-lg border border-border">
        <CardHeader>
          <CardTitle>Recent Maintenance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="border border-border rounded-lg p-4">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const recentRequests = requests.slice(0, 3);

  return (
    <Card className="bg-white shadow-lg border border-border">
      <CardHeader className="border-b border-border">
        <CardTitle className="flex items-center">
          <Wrench className="mr-3 h-5 w-5 text-accent" />
          Recent Maintenance
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-4">
        {recentRequests.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Wrench className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No maintenance requests</p>
            <p className="text-sm">New requests will appear here</p>
          </div>
        ) : (
          <>
            {recentRequests.map((request: any) => (
              <div key={request.id} className="border border-border rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h4 className="font-medium text-foreground">{request.title}</h4>
                    <p className="text-sm text-muted-foreground mt-1">{request.description}</p>
                    <div className="flex items-center mt-2 space-x-4">
                      <span className="text-xs text-muted-foreground">
                        Submitted: {new Date(request.createdAt).toLocaleDateString()}
                      </span>
                      <Badge className={getStatusVariant(request.status)}>
                        {getStatusLabel(request.status)}
                      </Badge>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" className="text-primary hover:text-secondary">
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
            
            <div className="text-center pt-4">
              <Button variant="ghost" className="text-secondary hover:text-primary">
                View All Requests <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
