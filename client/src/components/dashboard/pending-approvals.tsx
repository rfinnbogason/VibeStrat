import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CheckCircle, XCircle, Eye, ClipboardList } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface PendingApprovalsProps {
  strataId: string;
}

export default function PendingApprovals({ strataId }: PendingApprovalsProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: approvals = [], isLoading } = useQuery({
    queryKey: [`/api/strata/${strataId}/pending-approvals`],
    enabled: !!strataId,
  });

  const approveMutation = useMutation({
    mutationFn: async ({ id, type }: { id: string; type: string }) => {
      const endpoint = type === 'quote' ? `/api/quotes/${id}` : `/api/expenses/${id}`;
      await apiRequest("PATCH", endpoint, { status: "approved" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/strata/${strataId}/pending-approvals`] });
      queryClient.invalidateQueries({ queryKey: [`/api/strata/${strataId}/metrics`] });
      toast({
        title: "Approved",
        description: "Item has been approved successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to approve item. Please try again.",
        variant: "destructive",
      });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async ({ id, type }: { id: string; type: string }) => {
      const endpoint = type === 'quote' ? `/api/quotes/${id}` : `/api/expenses/${id}`;
      await apiRequest("PATCH", endpoint, { status: "rejected" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/strata/${strataId}/pending-approvals`] });
      queryClient.invalidateQueries({ queryKey: [`/api/strata/${strataId}/metrics`] });
      toast({
        title: "Rejected",
        description: "Item has been rejected.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to reject item. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleApprove = (id: string, type: string) => {
    approveMutation.mutate({ id, type });
  };

  const handleReject = (id: string, type: string) => {
    rejectMutation.mutate({ id, type });
  };

  const getTypeVariant = (type: string) => {
    return type === 'quote' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800';
  };

  if (isLoading) {
    return (
      <Card className="bg-white shadow-lg border border-border">
        <CardHeader>
          <CardTitle>Pending Approvals</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-200 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white shadow-lg border border-border">
      <CardHeader className="border-b border-border flex flex-row items-center justify-between">
        <CardTitle className="flex items-center">
          <ClipboardList className="mr-3 h-5 w-5 text-accent" />
          Pending Approvals
        </CardTitle>
        <Button variant="ghost" className="text-secondary hover:text-primary">
          View All
        </Button>
      </CardHeader>
      <CardContent className="p-0">
        {approvals.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <CheckCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No pending approvals</p>
            <p className="text-sm">All items are up to date</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead>Type</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {approvals.map((approval: any) => (
                  <TableRow key={approval.id} className="hover:bg-muted/30">
                    <TableCell>
                      <Badge className={getTypeVariant(approval.vendorId ? 'quote' : 'expense')}>
                        {approval.vendorId ? 'Quote' : 'Expense'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm font-medium text-foreground">{approval.description}</div>
                      {approval.vendorId && (
                        <div className="text-sm text-muted-foreground">Vendor Quote</div>
                      )}
                    </TableCell>
                    <TableCell className="font-medium">${approval.amount}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {new Date(approval.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-secondary hover:text-primary"
                          onClick={() => handleApprove(approval.id, approval.vendorId ? 'quote' : 'expense')}
                          disabled={approveMutation.isPending || rejectMutation.isPending}
                        >
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-destructive hover:text-destructive/80"
                          onClick={() => handleReject(approval.id, approval.vendorId ? 'quote' : 'expense')}
                          disabled={approveMutation.isPending || rejectMutation.isPending}
                        >
                          <XCircle className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-muted-foreground hover:text-foreground"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
