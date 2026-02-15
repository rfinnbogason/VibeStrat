import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { useStrata } from '@/lib/strata-context';
import { useAuth } from '@/hooks/useAuth';
import {
  Wrench,
  Search,
  Filter,
  Plus,
  AlertCircle,
  Clock,
  CheckCircle,
  XCircle,
  Calendar,
  DollarSign,
  User,
  MapPin,
} from 'lucide-react';
import { SuggestRepairModal } from '@/components/repair-requests/suggest-repair-modal';

const statusColors: Record<string, string> = {
  suggested: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-green-100 text-green-800',
  planned: 'bg-blue-100 text-blue-800',
  scheduled: 'bg-indigo-100 text-indigo-800',
  'in-progress': 'bg-purple-100 text-purple-800',
  completed: 'bg-gray-100 text-gray-800',
  rejected: 'bg-red-100 text-red-800',
};

const severityColors: Record<string, string> = {
  low: 'bg-gray-100 text-gray-700',
  medium: 'bg-yellow-100 text-yellow-700',
  high: 'bg-orange-100 text-orange-700',
  emergency: 'bg-red-100 text-red-700',
};

const areaLabels: Record<string, string> = {
  'common-areas': 'Common Areas',
  'exterior': 'Exterior/Building',
  'unit-specific': 'Unit-Specific',
  'parking': 'Parking',
  'landscaping': 'Landscaping',
  'utilities-hvac': 'Utilities/HVAC',
  'roof-structure': 'Roof/Structure',
  'other': 'Other',
};

export default function RepairRequests() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { selectedStrataId, selectedStrata } = useStrata();
  const { user } = useAuth();
  const [showSuggestModal, setShowSuggestModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [areaFilter, setAreaFilter] = useState('all');

  // Fetch user's role for the selected strata
  const { data: userRoleData } = useQuery<{ role: string }>({
    queryKey: [`/api/strata/${selectedStrataId}/user-role`],
    enabled: !!user && !!selectedStrataId,
  });

  // Fetch statistics
  const { data: stats } = useQuery({
    queryKey: [`/api/strata/${selectedStrataId}/repair-requests/stats`],
    enabled: !!selectedStrataId,
  });

  // Fetch repair requests
  const { data: requests = [], isLoading } = useQuery({
    queryKey: [`/api/strata/${selectedStrataId}/repair-requests`, statusFilter, severityFilter, areaFilter],
    queryFn: async () => {
      let url = `/api/strata/${selectedStrataId}/repair-requests?`;
      if (statusFilter !== 'all') url += `status=${statusFilter}&`;
      if (severityFilter !== 'all') url += `severity=${severityFilter}&`;
      if (areaFilter !== 'all') url += `area=${areaFilter}&`;

      const response = await apiRequest('GET', url);
      return response.json();
    },
    enabled: !!selectedStrataId,
  });

  // Update status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status, reason }: { id: string; status: string; reason?: string }) => {
      const response = await apiRequest('PATCH', `/api/repair-requests/${id}`, {
        status,
        statusChangeReason: reason,
      });
      return response.json();
    },
    onSuccess: () => {
      toast({ title: 'Success', description: 'Request status updated' });
      queryClient.invalidateQueries({ queryKey: [`/api/strata/${selectedStrataId}/repair-requests`] });
      queryClient.invalidateQueries({ queryKey: [`/api/strata/${selectedStrataId}/repair-requests/stats`] });
      setSelectedRequest(null);
      setShowDetailModal(false);
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to update status', variant: 'destructive' });
    },
  });

  // Filter requests by search query
  const filteredRequests = requests.filter((req: any) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      req.title?.toLowerCase().includes(query) ||
      req.description?.toLowerCase().includes(query) ||
      req.submittedBy?.name?.toLowerCase().includes(query) ||
      areaLabels[req.area]?.toLowerCase().includes(query)
    );
  });

  const userRole = userRoleData?.role;
  const canApprove = userRole === 'chairperson' || userRole === 'property_manager' || userRole === 'master_admin';

  if (!selectedStrataId || !selectedStrata) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="text-center py-12">
            <Wrench className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">No Strata Selected</h3>
            <p className="text-muted-foreground">Please select a strata to view repair requests.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Repair Requests</h1>
          <p className="text-muted-foreground mt-1">Manage repair suggestions for {selectedStrata.name}</p>
        </div>
        <Button onClick={() => setShowSuggestModal(true)} className="bg-orange-600 hover:bg-orange-700">
          <Plus className="h-4 w-4 mr-2" />
          Suggest Repair
        </Button>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{stats.total || 0}</div>
              <p className="text-xs text-muted-foreground">Total Requests</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-yellow-600">{stats.suggested || 0}</div>
              <p className="text-xs text-muted-foreground">Suggested</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-green-600">{stats.approved || 0}</div>
              <p className="text-xs text-muted-foreground">Approved</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-blue-600">{stats.scheduled || 0}</div>
              <p className="text-xs text-muted-foreground">Scheduled</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filters & Search</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search requests..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="suggested">Suggested</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="planned">Planned</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
            <Select value={severityFilter} onValueChange={setSeverityFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Severity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Severity</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="emergency">Emergency</SelectItem>
              </SelectContent>
            </Select>
            <Select value={areaFilter} onValueChange={setAreaFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Area" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Areas</SelectItem>
                {Object.entries(areaLabels).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Requests Table */}
      <Card>
        <CardHeader>
          <CardTitle>Repair Requests</CardTitle>
          <CardDescription>
            {filteredRequests.length} {filteredRequests.length === 1 ? 'request' : 'requests'} found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Loading...</p>
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="text-center py-8">
              <Wrench className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No Repair Requests</h3>
              <p className="text-muted-foreground mb-4">No repair requests match your filters</p>
              <Button onClick={() => setShowSuggestModal(true)} className="bg-orange-600 hover:bg-orange-700">
                <Plus className="h-4 w-4 mr-2" />
                Suggest a Repair
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Submitted</TableHead>
                    <TableHead>Area</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Est. Cost</TableHead>
                    <TableHead>Severity</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Submitted By</TableHead>
                    <TableHead>Days Ago</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRequests.map((request: any) => {
                    const daysAgo = Math.floor(
                      (Date.now() - new Date(request.createdAt).getTime()) / (1000 * 60 * 60 * 24)
                    );

                    return (
                      <TableRow
                        key={request.id}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => {
                          setSelectedRequest(request);
                          setShowDetailModal(true);
                        }}
                      >
                        <TableCell>
                          {format(new Date(request.createdAt), 'MMM d')}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{areaLabels[request.area]}</Badge>
                        </TableCell>
                        <TableCell className="max-w-xs truncate">{request.title}</TableCell>
                        <TableCell className="text-right">${request.estimatedCost?.toLocaleString() || 0}</TableCell>
                        <TableCell>
                          <Badge className={severityColors[request.severity]}>
                            {request.severity}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={statusColors[request.status]}>
                            {request.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{request.submittedBy?.name || 'Unknown'}</TableCell>
                        <TableCell>{daysAgo}</TableCell>
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setSelectedRequest(request);
                              setShowDetailModal(true);
                            }}
                          >
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Suggest Repair Modal */}
      <SuggestRepairModal open={showSuggestModal} onOpenChange={setShowSuggestModal} strataId={selectedStrataId} />

      {/* Detail Modal */}
      {selectedRequest && (
        <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Wrench className="h-5 w-5 text-orange-600" />
                {selectedRequest.title}
              </DialogTitle>
              <DialogDescription>
                Submitted {format(new Date(selectedRequest.createdAt), 'MMMM d, yyyy')} by{' '}
                {selectedRequest.submittedBy?.name}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              {/* Status and Severity */}
              <div className="flex gap-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Status</p>
                  <Badge className={statusColors[selectedRequest.status]}>{selectedRequest.status}</Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Severity</p>
                  <Badge className={severityColors[selectedRequest.severity]}>{selectedRequest.severity}</Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Area</p>
                  <Badge variant="outline">{areaLabels[selectedRequest.area]}</Badge>
                </div>
              </div>

              {/* Description */}
              <div>
                <p className="text-sm font-semibold mb-2">Description</p>
                <p className="text-sm">{selectedRequest.description}</p>
              </div>

              {/* Cost */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Estimated Cost</p>
                  <p className="text-lg font-semibold">${selectedRequest.estimatedCost?.toLocaleString() || 0}</p>
                </div>
                {selectedRequest.actualCost && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Actual Cost</p>
                    <p className="text-lg font-semibold">${selectedRequest.actualCost.toLocaleString()}</p>
                  </div>
                )}
              </div>

              {/* Cost Justification */}
              {selectedRequest.costJustification && (
                <div>
                  <p className="text-sm font-semibold mb-2">Cost Justification</p>
                  <p className="text-sm text-muted-foreground">{selectedRequest.costJustification}</p>
                </div>
              )}

              {/* Contact Info */}
              <div>
                <p className="text-sm font-semibold mb-2">Contact Information</p>
                <div className="space-y-1 text-sm">
                  <p>
                    <User className="inline h-4 w-4 mr-2" />
                    {selectedRequest.submittedBy?.name}
                  </p>
                  <p>
                    <span className="inline-block w-4 mr-2">📧</span>
                    {selectedRequest.submittedBy?.email}
                  </p>
                  {selectedRequest.submittedBy?.phone && (
                    <p>
                      <span className="inline-block w-4 mr-2">📞</span>
                      {selectedRequest.submittedBy.phone}
                    </p>
                  )}
                  {selectedRequest.submittedBy?.unitNumber && (
                    <p>
                      <MapPin className="inline h-4 w-4 mr-2" />
                      Unit {selectedRequest.submittedBy.unitNumber}
                    </p>
                  )}
                  {selectedRequest.bestTimeToContact && (
                    <p>
                      <Clock className="inline h-4 w-4 mr-2" />
                      Best time: {selectedRequest.bestTimeToContact}
                    </p>
                  )}
                </div>
              </div>

              {/* Additional Notes */}
              {selectedRequest.additionalNotes && (
                <div>
                  <p className="text-sm font-semibold mb-2">Additional Notes</p>
                  <p className="text-sm text-muted-foreground">{selectedRequest.additionalNotes}</p>
                </div>
              )}

              {/* Admin Actions */}
              {canApprove && (
                <div className="border-t pt-4">
                  <p className="text-sm font-semibold mb-3">Admin Actions</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedRequest.status === 'suggested' && (
                      <>
                        <Button
                          size="sm"
                          onClick={() => updateStatusMutation.mutate({ id: selectedRequest.id, status: 'approved' })}
                          disabled={updateStatusMutation.isPending}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => updateStatusMutation.mutate({ id: selectedRequest.id, status: 'rejected' })}
                          disabled={updateStatusMutation.isPending}
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Reject
                        </Button>
                      </>
                    )}
                    {selectedRequest.status === 'approved' && (
                      <Button
                        size="sm"
                        onClick={() => updateStatusMutation.mutate({ id: selectedRequest.id, status: 'planned' })}
                        disabled={updateStatusMutation.isPending}
                      >
                        Mark as Planned
                      </Button>
                    )}
                    {selectedRequest.status === 'planned' && (
                      <Button
                        size="sm"
                        onClick={() => updateStatusMutation.mutate({ id: selectedRequest.id, status: 'scheduled' })}
                        disabled={updateStatusMutation.isPending}
                      >
                        <Calendar className="h-4 w-4 mr-2" />
                        Mark as Scheduled
                      </Button>
                    )}
                    {selectedRequest.status === 'scheduled' && (
                      <Button
                        size="sm"
                        onClick={() => updateStatusMutation.mutate({ id: selectedRequest.id, status: 'in-progress' })}
                        disabled={updateStatusMutation.isPending}
                      >
                        Start Work
                      </Button>
                    )}
                    {selectedRequest.status === 'in-progress' && (
                      <Button
                        size="sm"
                        onClick={() => updateStatusMutation.mutate({ id: selectedRequest.id, status: 'completed' })}
                        disabled={updateStatusMutation.isPending}
                        className="bg-gray-600 hover:bg-gray-700"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Mark Complete
                      </Button>
                    )}
                  </div>
                </div>
              )}

              {/* Close Button */}
              <div className="flex justify-end pt-4">
                <Button onClick={() => setShowDetailModal(false)}>Close</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
