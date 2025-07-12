import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { History, ArrowRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface RecentActivityProps {
  strataId: string;
}

export default function RecentActivity({ strataId }: RecentActivityProps) {
  const { data: quotes = [] } = useQuery({
    queryKey: [`/api/strata/${strataId}/quotes`],
    enabled: !!strataId,
  });

  const { data: expenses = [] } = useQuery({
    queryKey: [`/api/strata/${strataId}/expenses`],
    enabled: !!strataId,
  });

  // Combine and sort recent activities
  const activities = [
    ...quotes.slice(0, 2).map((quote: any) => ({
      id: quote.id,
      type: 'quote',
      title: `New quote received: ${quote.description}`,
      subtitle: `${quote.amount} | ${new Date(quote.createdAt).toLocaleString()}`,
      status: quote.status,
    })),
    ...expenses.slice(0, 2).map((expense: any) => ({
      id: expense.id,
      type: 'expense',
      title: `Expense submitted: ${expense.description}`,
      subtitle: `${expense.amount} | ${new Date(expense.createdAt).toLocaleString()}`,
      status: expense.status,
    })),
  ].sort((a, b) => new Date(b.subtitle.split(' | ')[1]).getTime() - new Date(a.subtitle.split(' | ')[1]).getTime());

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'pending': return 'status-pending';
      case 'approved': return 'status-approved';
      case 'rejected': return 'status-rejected';
      default: return 'status-pending';
    }
  };

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
          <div className="space-y-4">
            {activities.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-4 p-4 bg-muted/30 rounded-lg">
                <div className="w-2 h-2 bg-secondary rounded-full mt-2"></div>
                <div className="flex-1">
                  <p className="text-foreground font-medium">{activity.title}</p>
                  <p className="text-muted-foreground text-sm">{activity.subtitle}</p>
                </div>
                <Badge className={getStatusVariant(activity.status)}>
                  {activity.status}
                </Badge>
              </div>
            ))}
            
            <div className="mt-4 text-center">
              <Button variant="ghost" className="text-secondary hover:text-primary">
                View All Activity <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
