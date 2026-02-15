import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import {
  Button,
} from "@/components/ui/button";
import {
  Input,
} from "@/components/ui/input";
import {
  Textarea,
} from "@/components/ui/textarea";
import {
  Badge,
} from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Settings,
  Plus,
  Building2,
  Users,
  Edit,
  Calendar,
  MapPin,
  Phone,
  Mail,
  Building,
  AlertCircle,
  CheckCircle,
  Clock,
  UserPlus,
  Trash2,
  X,
  Check,
  MoreHorizontal,
  CreditCard,
  DollarSign,
  RefreshCw,
  XCircle,
} from "lucide-react";

interface Strata {
  id: string;
  name: string;
  address: string;
  city?: string;
  province?: string;
  postalCode?: string;
  country?: string;
  phoneNumber?: string;
  email?: string;
  unitCount: number;
  corporationNumber?: string;
  incorporationDate?: string;
  managementCompany?: string;
  managementContactName?: string;
  managementContactEmail?: string;
  managementContactPhone?: string;
  status: string;
  notes?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: string;
  isActive?: boolean;
  createdAt: string;
  updatedAt: string;
}

interface UserStrataAccessWithUser {
  id: string;
  userId: string;
  strataId: string;
  role: string;
  createdAt: string;
  updatedAt: string;
  user: User | null;
}

const strataSchema = z.object({
  name: z.string().min(1, "Name is required"),
  address: z.string().min(1, "Address is required"),
  city: z.string().optional(),
  province: z.string().optional(),
  postalCode: z.string().optional(),
  country: z.string().optional(),
  phoneNumber: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  unitCount: z.number().min(1, "Unit count must be at least 1"),
  corporationNumber: z.string().optional(),
  incorporationDate: z.string().optional(),
  managementCompany: z.string().optional(),
  managementContactName: z.string().optional(),
  managementContactEmail: z.string().email().optional().or(z.literal("")),
  managementContactPhone: z.string().optional(),
  status: z.string().optional(),
  notes: z.string().optional(),
});

const userAssignmentSchema = z.object({
  userId: z.string().min(1, "User is required"),
  strataId: z.string().min(1, "Strata is required"), 
  role: z.string().min(1, "Role is required"),
});

const createUserSchema = z.object({
  email: z.string().email("Valid email is required"),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  role: z.string().optional(),
  temporaryPassword: z.string().min(6, "Password must be at least 6 characters"),
});

const editUserSchema = z.object({
  email: z.string().email("Valid email is required"),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  role: z.string().optional(),
  isActive: z.boolean().optional(),
  resetPassword: z.boolean().optional(),
  newPassword: z.string().optional(),
}).refine((data) => {
  if (data.resetPassword && !data.newPassword) {
    return false;
  }
  if (data.newPassword && data.newPassword.length < 6) {
    return false;
  }
  return true;
}, {
  message: "Password must be at least 6 characters when resetting",
  path: ["newPassword"],
});

const subscriptionSchema = z.object({
  subscriptionTier: z.enum(["trial", "free", "standard", "premium"]),
  monthlyRate: z.number().min(0),
  isFreeForever: z.boolean(),
});

// Component for displaying user's strata assignments
function UserStrataAssignments({ userId }: { userId: string }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { data: userAssignments, isLoading } = useQuery<any[]>({
    queryKey: [`/api/get-user-assignments/${userId}`],
    retry: false,
  });

  const unassignUserMutation = useMutation({
    mutationFn: async (assignmentId: string) => {
      await apiRequest('DELETE', `/api/admin/user-strata-access/${assignmentId}`);
    },
    onSuccess: () => {
      toast({ title: "Success", description: "User unassigned from strata successfully" });
      queryClient.invalidateQueries({ queryKey: [`/api/admin/users/${userId}/strata-assignments`] });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  if (isLoading) {
    return <div className="text-sm text-muted-foreground">Loading...</div>;
  }

  if (!userAssignments?.length) {
    return <div className="text-sm text-muted-foreground">No assignments</div>;
  }

  return (
    <div className="space-y-1">
      {userAssignments.map((assignment: any) => (
        <div key={assignment.id} className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            {assignment.strata?.name || 'Unknown Strata'}
          </Badge>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => unassignUserMutation.mutate(assignment.id)}
            disabled={unassignUserMutation.isPending}
            className="h-6 w-6 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      ))}
    </div>
  );
}

// Pending Registrations Section Component
function PendingRegistrationsSection() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Local state for approval dialog
  const [showApprovalDialog, setShowApprovalDialog] = useState(false);
  const [selectedRegistrationForApproval, setSelectedRegistrationForApproval] = useState<any>(null);
  
  // Subscription form for approval
  const subscriptionForm = useForm<z.infer<typeof subscriptionSchema>>({
    resolver: zodResolver(subscriptionSchema),
    defaultValues: {
      subscriptionTier: "trial",
      monthlyRate: 0,
      isFreeForever: false,
    },
  });
  
  // Query for pending registrations
  const { data: pendingRegistrations = [], isLoading: loadingRegistrations } = useQuery<any[]>({
    queryKey: ['/api/admin/pending-registrations'],
  });

  // Approve registration mutation
  const approveMutation = useMutation({
    mutationFn: async (data: { registrationId: string; subscriptionData: z.infer<typeof subscriptionSchema> }) => {
      await apiRequest("POST", `/api/admin/pending-registrations/${data.registrationId}/approve`, data.subscriptionData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/pending-registrations'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/strata'] });
      setShowApprovalDialog(false);
      toast({
        title: "Registration Approved",
        description: "The strata registration has been approved with subscription settings.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to approve registration",
        variant: "destructive",
      });
    },
  });

  // Reject registration mutation
  const rejectMutation = useMutation({
    mutationFn: async (registrationId: string) => {
      await apiRequest("POST", `/api/admin/pending-registrations/${registrationId}/reject`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/pending-registrations'] });
      toast({
        title: "Registration Rejected",
        description: "The strata registration has been rejected.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to reject registration",
        variant: "destructive",
      });
    },
  });

  // Handler functions for approval with subscription
  const handleApproveWithSubscription = (registration: any) => {
    setSelectedRegistrationForApproval(registration);
    // Set default subscription based on unit count
    const monthlyRate = registration.unitCount <= 100 ? 49 : 79;
    const tier = registration.unitCount <= 100 ? 'standard' : 'premium';
    subscriptionForm.reset({
      subscriptionTier: tier,
      monthlyRate: monthlyRate,
      isFreeForever: false,
    });
    setShowApprovalDialog(true);
  };

  const onApprovalSubmit = (data: z.infer<typeof subscriptionSchema>) => {
    if (!selectedRegistrationForApproval) return;
    approveMutation.mutate({
      registrationId: selectedRegistrationForApproval.id,
      subscriptionData: data,
    });
  };

  if (loadingRegistrations) {
    return <div className="text-center py-8">Loading pending registrations...</div>;
  }

  if (!pendingRegistrations || pendingRegistrations.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <Building className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No Pending Registrations</h3>
          <p className="text-muted-foreground">
            All strata registration requests have been processed.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {pendingRegistrations.map((registration: any) => (
        <Card key={registration.id}>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-lg">{registration.strataName}</CardTitle>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                  <MapPin className="h-4 w-4" />
                  {registration.address}, {registration.city}, {registration.province}
                </div>
              </div>
              <Badge variant="outline">
                {new Date(registration.createdAt).toLocaleDateString()}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
              <div className="space-y-3">
                <div>
                  <h4 className="font-medium text-xs lg:text-sm text-muted-foreground">Contact Information</h4>
                  <div className="mt-1 text-xs lg:text-sm space-y-1">
                    <p><strong>Name:</strong> {registration.adminFirstName} {registration.adminLastName}</p>
                    <p><strong>Email:</strong> <span className="break-all">{registration.adminEmail}</span></p>
                    <p><strong>Phone:</strong> {registration.adminPhone}</p>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-xs lg:text-sm text-muted-foreground">Organization Details</h4>
                  <div className="mt-1 text-xs lg:text-sm space-y-1">
                    <p><strong>Units:</strong> {registration.unitCount}</p>
                    <p><strong>Management:</strong> {registration.managementType === 'self_managed' ? 'Self-Managed' : 'Professionally Managed'}</p>
                    {registration.managementCompany && (
                      <p><strong>Company:</strong> {registration.managementCompany}</p>
                    )}
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-xs lg:text-sm text-muted-foreground">Pricing</h4>
                  <div className="mt-1 text-xs lg:text-sm space-y-1">
                    <p><strong>Monthly Rate:</strong> ${registration.unitCount <= 100 ? '49' : '79'}</p>
                    <p><strong>Tier:</strong> {registration.unitCount <= 100 ? 'Standard (≤100 units)' : 'Premium (>100 units)'}</p>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <h4 className="font-medium text-xs lg:text-sm text-muted-foreground">Description</h4>
                  <p className="mt-1 text-xs lg:text-sm">{registration.description}</p>
                </div>
                {registration.specialRequirements && (
                  <div>
                    <h4 className="font-medium text-xs lg:text-sm text-muted-foreground">Special Requirements</h4>
                    <p className="mt-1 text-xs lg:text-sm">{registration.specialRequirements}</p>
                  </div>
                )}
                <div>
                  <h4 className="font-medium text-xs lg:text-sm text-muted-foreground">Complete Address</h4>
                  <p className="mt-1 text-xs lg:text-sm">{registration.address}<br/>{registration.city}, {registration.province} {registration.postalCode}</p>
                </div>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row sm:justify-end gap-2 mt-4 lg:mt-6 pt-3 lg:pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => rejectMutation.mutate(registration.id)}
                disabled={rejectMutation.isPending || approveMutation.isPending}
                className="text-red-600 hover:text-red-700 text-sm h-8 lg:h-9"
              >
                <X className="h-3 w-3 lg:h-4 lg:w-4 mr-2" />
                {rejectMutation.isPending ? "Rejecting..." : "Reject"}
              </Button>
              <Button
                onClick={() => handleApproveWithSubscription(registration)}
                disabled={approveMutation.isPending || rejectMutation.isPending}
                className="bg-green-600 hover:bg-green-700 text-white text-sm h-8 lg:h-9"
              >
                <Check className="h-3 w-3 lg:h-4 lg:w-4 mr-2" />
                {approveMutation.isPending ? "Approving..." : "Approve"}
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
      
      {/* Approval with Subscription Dialog */}
      <Dialog open={showApprovalDialog} onOpenChange={setShowApprovalDialog}>
        <DialogContent className="max-w-md mx-4 lg:mx-auto">
          <DialogHeader>
            <DialogTitle className="text-lg lg:text-xl">Approve Registration</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground">
              Setting subscription for: <strong>{selectedRegistrationForApproval?.name}</strong>
            </div>
            
            <Form {...subscriptionForm}>
              <form onSubmit={subscriptionForm.handleSubmit(onApprovalSubmit)} className="space-y-4">
                <FormField
                  control={subscriptionForm.control}
                  name="subscriptionTier"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Subscription Tier</FormLabel>
                      <Select onValueChange={(value) => {
                        field.onChange(value);
                        const rate = value === 'standard' ? 49 :
                                     value === 'premium' ? 79 : 0;
                        subscriptionForm.setValue('monthlyRate', rate);
                        subscriptionForm.setValue('isFreeForever', value === 'free');
                      }} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select subscription tier" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="trial">Trial (30 days)</SelectItem>
                          <SelectItem value="free">Free</SelectItem>
                          <SelectItem value="standard">Standard (≤100 units)</SelectItem>
                          <SelectItem value="premium">Premium (100+ units)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={subscriptionForm.control}
                  name="monthlyRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Monthly Rate ($)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={subscriptionForm.control}
                  name="isFreeForever"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Free Forever</FormLabel>
                        <div className="text-sm text-muted-foreground">
                          Override with permanent free access
                        </div>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={(checked) => {
                            field.onChange(checked);
                            if (checked) {
                              subscriptionForm.setValue('monthlyRate', 0);
                            }
                          }}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowApprovalDialog(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={approveMutation.isPending}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    {approveMutation.isPending ? "Approving..." : "Approve & Create"}
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function AssignedUsersTable({ strataId }: { strataId: string }) {
  const { data: strataUsers, isLoading } = useQuery<any[]>({
    queryKey: [`/api/admin/strata/${strataId}/users`],
    retry: false,
    refetchOnMount: true,
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const removeUserAccessMutation = useMutation({
    mutationFn: async (accessId: string) => {
      const response = await fetch(`/api/admin/user-access/${accessId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to remove user access');
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Success", description: "User access removed successfully" });
      queryClient.invalidateQueries({ queryKey: [`/api/admin/strata/${strataId}/users`] });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to remove user access", variant: "destructive" });
    },
  });

  const getRoleDisplayName = (role: string) => {
    const roleMap: { [key: string]: string } = {
      'chairperson': 'Chairperson',
      'treasurer': 'Treasurer',
      'secretary': 'Secretary',
      'council_member': 'Council Member',
      'property_manager': 'Property Manager',
      'resident': 'Resident',
      'admin': 'Admin'
    };
    return roleMap[role] || role;
  };

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900 mx-auto mb-2"></div>
        <p className="text-sm text-muted-foreground">Loading users...</p>
      </div>
    );
  }

  if (!strataUsers?.length) {
    return (
      <div className="text-center py-8">
        <Users className="h-8 w-8 mx-auto mb-2 text-muted-foreground opacity-50" />
        <p className="text-sm text-muted-foreground">No users assigned to this strata</p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>User</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Role</TableHead>
          <TableHead>Assigned Date</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {strataUsers.map((access) => (
          <TableRow key={access.id}>
            <TableCell>
              {access.user?.firstName || access.user?.lastName 
                ? `${access.user.firstName || ''} ${access.user.lastName || ''}`.trim()
                : 'N/A'
              }
            </TableCell>
            <TableCell>{access.user?.email || 'N/A'}</TableCell>
            <TableCell>
              <Badge variant="secondary">{getRoleDisplayName(access.role)}</Badge>
            </TableCell>
            <TableCell>{new Date(access.createdAt).toLocaleDateString()}</TableCell>
            <TableCell>
              <Button
                variant="outline"
                size="sm"
                onClick={() => removeUserAccessMutation.mutate(access.id)}
                disabled={removeUserAccessMutation.isPending}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

// Subscription Management Section Component
function SubscriptionManagementSection() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedStrata, setSelectedStrata] = useState<Strata | null>(null);
  const [showExtendTrialDialog, setShowExtendTrialDialog] = useState(false);
  const [showRefundDialog, setShowRefundDialog] = useState(false);
  const [showChangeSubscriptionDialog, setShowChangeSubscriptionDialog] = useState(false);
  const [daysToExtend, setDaysToExtend] = useState(30);

  // Fetch all stratas with subscription info
  const { data: allStrata, isLoading } = useQuery<Strata[]>({
    queryKey: ["/api/admin/strata"],
    retry: false,
  });

  // Extend Trial Mutation
  const extendTrialMutation = useMutation({
    mutationFn: async ({ strataId, days }: { strataId: string; days: number }) => {
      const response = await apiRequest("PATCH", `/api/admin/strata/${strataId}/subscription`, {
        subscriptionTier: "trial",
        extendDays: days
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Trial Extended",
        description: `Trial period has been extended by ${daysToExtend} days.`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/strata"] });
      setShowExtendTrialDialog(false);
      setSelectedStrata(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to extend trial",
        variant: "destructive",
      });
    },
  });

  // Update Subscription Mutation
  const updateSubscriptionMutation = useMutation({
    mutationFn: async ({ strataId, data }: { strataId: string; data: any }) => {
      const response = await apiRequest("PATCH", `/api/admin/strata/${strataId}/subscription`, data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Subscription Updated",
        description: "Subscription has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/strata"] });
      setShowChangeSubscriptionDialog(false);
      setSelectedStrata(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update subscription",
        variant: "destructive",
      });
    },
  });

  // Calculate days remaining for trial
  const getDaysRemaining = (trialEndDate: any) => {
    if (!trialEndDate) return 0;
    const endDate = trialEndDate.toDate ? trialEndDate.toDate() : new Date(trialEndDate);
    const now = new Date();
    const diffTime = endDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  // Get status badge color
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'trial': return 'default';
      case 'active': return 'default';
      case 'free': return 'secondary';
      case 'cancelled': return 'destructive';
      case 'expired': return 'destructive';
      default: return 'secondary';
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
        <p className="text-muted-foreground">Loading subscription data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Subscription Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Subscriptions</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Strata Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Tier</TableHead>
                <TableHead>Monthly Rate</TableHead>
                <TableHead>Trial End / Next Billing</TableHead>
                <TableHead>Days Remaining</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {allStrata?.map((strata) => {
                const subscription = (strata as any).subscription || {};
                const daysRemaining = subscription.status === 'trial' ? getDaysRemaining(subscription.trialEndDate) : null;

                return (
                  <TableRow key={strata.id}>
                    <TableCell className="font-medium">
                      <div>
                        <div>{strata.name}</div>
                        <div className="text-xs text-muted-foreground">{strata.id}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(subscription.status)}>
                        {subscription.status || 'N/A'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {subscription.tier || 'N/A'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      ${subscription.monthlyRate || 0}/mo
                    </TableCell>
                    <TableCell>
                      {subscription.status === 'trial' && subscription.trialEndDate ? (
                        <span className="text-sm">
                          {new Date(subscription.trialEndDate.toDate ? subscription.trialEndDate.toDate() : subscription.trialEndDate).toLocaleDateString()}
                        </span>
                      ) : subscription.nextPaymentDate ? (
                        <span className="text-sm">
                          {new Date(subscription.nextPaymentDate.toDate ? subscription.nextPaymentDate.toDate() : subscription.nextPaymentDate).toLocaleDateString()}
                        </span>
                      ) : (
                        <span className="text-sm text-muted-foreground">N/A</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {daysRemaining !== null ? (
                        <Badge variant={daysRemaining <= 3 ? "destructive" : daysRemaining <= 7 ? "default" : "secondary"}>
                          {daysRemaining} days
                        </Badge>
                      ) : subscription.isFreeForever ? (
                        <Badge variant="secondary">Free Forever</Badge>
                      ) : (
                        <span className="text-sm text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedStrata(strata);
                              setShowExtendTrialDialog(true);
                            }}
                          >
                            <Clock className="h-4 w-4 mr-2" />
                            Extend Trial
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedStrata(strata);
                              setShowChangeSubscriptionDialog(true);
                            }}
                          >
                            <CreditCard className="h-4 w-4 mr-2" />
                            Change Subscription
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedStrata(strata);
                              setShowRefundDialog(true);
                            }}
                          >
                            <DollarSign className="h-4 w-4 mr-2" />
                            Issue Refund
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              updateSubscriptionMutation.mutate({
                                strataId: strata.id,
                                data: {
                                  isFreeForever: true,
                                  subscriptionTier: "free",
                                  monthlyRate: 0
                                }
                              });
                            }}
                            className="text-green-600"
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Set Free Forever
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

          {!allStrata?.length && (
            <div className="text-center py-12">
              <Building2 className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground">No stratas found</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Extend Trial Dialog */}
      <Dialog open={showExtendTrialDialog} onOpenChange={setShowExtendTrialDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Extend Trial Period</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-2">
                Extending trial for: <strong>{selectedStrata?.name}</strong>
              </p>
            </div>
            <div>
              <label className="text-sm font-medium">Days to Extend (1-365)</label>
              <Input
                type="number"
                min="1"
                max="365"
                value={daysToExtend}
                onChange={(e) => {
                  const value = parseInt(e.target.value) || 30;
                  // ✅ INPUT VALIDATION: Limit to 1-365 days
                  setDaysToExtend(Math.min(Math.max(value, 1), 365));
                }}
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Maximum 365 days (1 year)
              </p>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setShowExtendTrialDialog(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  if (selectedStrata && daysToExtend >= 1 && daysToExtend <= 365) {
                    extendTrialMutation.mutate({
                      strataId: selectedStrata.id,
                      days: daysToExtend
                    });
                  } else {
                    toast({
                      title: "Invalid Input",
                      description: "Days must be between 1 and 365",
                      variant: "destructive"
                    });
                  }
                }}
                disabled={extendTrialMutation.isPending || daysToExtend < 1 || daysToExtend > 365}
              >
                {extendTrialMutation.isPending ? "Extending..." : "Extend Trial"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Change Subscription Dialog */}
      <Dialog open={showChangeSubscriptionDialog} onOpenChange={setShowChangeSubscriptionDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Subscription</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-4">
                Managing subscription for: <strong>{selectedStrata?.name}</strong>
              </p>
            </div>

            <div className="grid gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  if (selectedStrata) {
                    updateSubscriptionMutation.mutate({
                      strataId: selectedStrata.id,
                      data: {
                        subscriptionTier: "trial"
                      }
                    });
                  }
                }}
              >
                <Clock className="h-4 w-4 mr-2" />
                Reset to Trial (30 days)
              </Button>

              <Button
                variant="outline"
                onClick={() => {
                  if (selectedStrata) {
                    updateSubscriptionMutation.mutate({
                      strataId: selectedStrata.id,
                      data: {
                        subscriptionTier: "standard",
                        monthlyRate: 49,
                        isFreeForever: false
                      }
                    });
                  }
                }}
              >
                <CreditCard className="h-4 w-4 mr-2" />
                Set to Paid ($49/mo)
              </Button>

              <Button
                variant="outline"
                onClick={() => {
                  if (selectedStrata) {
                    updateSubscriptionMutation.mutate({
                      strataId: selectedStrata.id,
                      data: {
                        subscriptionTier: "free",
                        monthlyRate: 0,
                        isFreeForever: true
                      }
                    });
                  }
                }}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Set to Free Forever
              </Button>

              <Button
                variant="outline"
                className="text-red-600 hover:text-red-700"
                onClick={() => {
                  if (selectedStrata) {
                    updateSubscriptionMutation.mutate({
                      strataId: selectedStrata.id,
                      data: {
                        subscriptionTier: "cancelled",
                        subscriptionStatus: "cancelled"
                      }
                    });
                  }
                }}
              >
                <XCircle className="h-4 w-4 mr-2" />
                Cancel Subscription
              </Button>
            </div>

            <div className="flex justify-end">
              <Button
                variant="outline"
                onClick={() => setShowChangeSubscriptionDialog(false)}
              >
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Refund Dialog */}
      <Dialog open={showRefundDialog} onOpenChange={setShowRefundDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Issue Refund</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-4">
                Issue refund for: <strong>{selectedStrata?.name}</strong>
              </p>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-yellow-900">Refund Note</p>
                  <p className="text-sm text-yellow-700 mt-1">
                    Refunds should be processed through your Stripe Dashboard. This action will only update the subscription status in the system.
                  </p>
                </div>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Refund Amount</label>
              <Input
                type="number"
                placeholder="Amount in CAD"
                className="mt-1"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Reason</label>
              <Textarea
                placeholder="Reason for refund..."
                className="mt-1"
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setShowRefundDialog(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  toast({
                    title: "Refund Noted",
                    description: "Please process the actual refund through Stripe Dashboard.",
                  });
                  setShowRefundDialog(false);
                }}
              >
                Mark as Refunded
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function Admin() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showCreateStrata, setShowCreateStrata] = useState(false);
  const [showEditStrata, setShowEditStrata] = useState(false);
  const [selectedStrata, setSelectedStrata] = useState<Strata | null>(null);
  const [showAssignUser, setShowAssignUser] = useState(false);
  const [selectedStrataForUserAssignment, setSelectedStrataForUserAssignment] = useState<Strata | null>(null);
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [showEditUser, setShowEditUser] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedUserForRole, setSelectedUserForRole] = useState<any | null>(null);
  const [showSubscriptionDialog, setShowSubscriptionDialog] = useState(false);
  const [selectedStrataForSubscription, setSelectedStrataForSubscription] = useState<Strata | null>(null);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [strataToDelete, setStrataToDelete] = useState<Strata | null>(null);
  const [showApprovalDialog, setShowApprovalDialog] = useState(false);
  const [selectedRegistrationForApproval, setSelectedRegistrationForApproval] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<"strata" | "users" | "registrations" | "subscriptions">("strata");

  // Check if user is master admin
  if (!isAuthenticated || user?.email !== 'rfinnbogason@gmail.com') {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="text-center py-12">
            <AlertCircle className="h-12 w-12 mx-auto mb-4 text-red-500" />
            <h3 className="text-xl font-semibold mb-2">Access Denied</h3>
            <p className="text-muted-foreground">
              You don't have permission to access the admin panel.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Fetch all strata
  const { data: allStrata, isLoading: strataLoading } = useQuery<Strata[]>({
    queryKey: ["/api/admin/strata"],
    retry: false,
  });

  // Fetch all users
  const { data: allUsers, isLoading: usersLoading } = useQuery<User[]>({
    queryKey: ["/api/admin/users"],
    retry: false,
  });

  // Fetch user assignments for selected strata
  const { data: strataUsers, isLoading: strataUsersLoading } = useQuery<any[]>({
    queryKey: [`/api/admin/strata/${selectedStrataForUserAssignment?.id}/users`],
    enabled: !!selectedStrataForUserAssignment?.id,
    retry: false,
    refetchOnMount: true,
  });

  const strataForm = useForm<z.infer<typeof strataSchema>>({
    resolver: zodResolver(strataSchema),
    defaultValues: {
      name: "",
      address: "",
      city: "",
      province: "",
      postalCode: "",
      country: "Canada",
      phoneNumber: "",
      email: "",
      unitCount: 1,
      corporationNumber: "",
      managementCompany: "",
      managementContactName: "",
      managementContactEmail: "",
      managementContactPhone: "",
      status: "active",
      notes: "",
    },
  });

  const userAssignmentForm = useForm<z.infer<typeof userAssignmentSchema>>({
    resolver: zodResolver(userAssignmentSchema),
    defaultValues: {
      userId: "",
      strataId: "",
      role: "resident",
    },
    mode: 'onChange',
  });

  const createUserForm = useForm<z.infer<typeof createUserSchema>>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      email: "",
      firstName: "",
      lastName: "",
      role: "resident",
      temporaryPassword: "",
    },
  });

  const editUserForm = useForm<z.infer<typeof editUserSchema>>({
    resolver: zodResolver(editUserSchema),
    defaultValues: {
      email: "",
      firstName: "",
      lastName: "",
      role: "resident",
      isActive: true,
      resetPassword: false,
      newPassword: "",
    },
  });

  const subscriptionForm = useForm<z.infer<typeof subscriptionSchema>>({
    resolver: zodResolver(subscriptionSchema),
    defaultValues: {
      subscriptionTier: "trial",
      monthlyRate: 0,
      isFreeForever: false,
    },
  });

  const createStrataMutation = useMutation({
    mutationFn: async (data: z.infer<typeof strataSchema>) => {
      const response = await fetch('/api/admin/strata', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to create strata');
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Strata created successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/strata"] });
      queryClient.invalidateQueries({ queryKey: ["/api/strata"] }); // Update sidebar dropdown
      setShowCreateStrata(false);
      strataForm.reset();
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create strata", variant: "destructive" });
    },
  });

  const updateStrataMutation = useMutation({
    mutationFn: async (data: z.infer<typeof strataSchema>) => {
      if (!selectedStrata) throw new Error('No strata selected');
      const response = await fetch(`/api/admin/strata/${selectedStrata.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to update strata');
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Strata updated successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/strata"] });
      queryClient.invalidateQueries({ queryKey: ["/api/strata"] }); // Update sidebar dropdown
      setShowEditStrata(false);
      setSelectedStrata(null);
      strataForm.reset();
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update strata", variant: "destructive" });
    },
  });

  const assignUserMutation = useMutation({
    mutationFn: async (data: z.infer<typeof userAssignmentSchema>) => {
      console.log('🔥 MUTATION EXECUTING - Assigning user with data:', data);
      console.log('📡 Making API request to:', `/api/admin/strata/${data.strataId}/users`);
      
      try {
        const response = await apiRequest('POST', `/api/assign-user-to-strata`, data);
        console.log('✅ API request successful:', response);
        return response;
      } catch (error) {
        console.error('❌ API request failed:', error);
        throw error;
      }
    },
    onSuccess: () => {
      console.log('🎉 Assignment successful! Updating UI...');
      toast({ title: "Success", description: "User assigned to strata successfully" });
      // Invalidate all relevant query keys to ensure fresh data
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/strata"] });
      // Invalidate specific user assignments
      if (selectedUserForRole?.id) {
        queryClient.invalidateQueries({ queryKey: [`/api/get-user-assignments/${selectedUserForRole.id}`] });
      }
      // Invalidate all query keys that might contain user data
      queryClient.invalidateQueries({ queryKey: ["/api/admin"] });
      setShowAssignUser(false);
      userAssignmentForm.reset();
      setSelectedUserForRole(null);
    },
    onError: (error: Error) => {
      console.error('💥 Assignment error:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      toast({ title: "Error", description: error.message || "Failed to assign user", variant: "destructive" });
    },
  });

  const removeUserAccessMutation = useMutation({
    mutationFn: async (accessId: string) => {
      await apiRequest('DELETE', `/api/admin/user-access/${accessId}`);
    },
    onSuccess: () => {
      toast({ title: "Success", description: "User access removed successfully" });
      queryClient.invalidateQueries({ queryKey: [`/api/admin/strata/${selectedStrataForUserAssignment?.id}/users`] });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to remove user access", variant: "destructive" });
    },
  });

  const createUserMutation = useMutation({
    mutationFn: async (data: z.infer<typeof createUserSchema>) => {
      return apiRequest('POST', '/api/admin/users', data);
    },
    onSuccess: () => {
      toast({ title: "Success", description: "User created successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      setShowCreateUser(false);
      createUserForm.reset();
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const editUserMutation = useMutation({
    mutationFn: async (data: z.infer<typeof editUserSchema>) => {
      if (!selectedUser) throw new Error('No user selected');
      const response = await fetch(`/api/admin/users/${selectedUser.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update user');
      }
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Success", description: "User updated successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      setShowEditUser(false);
      setSelectedUser(null);
      editUserForm.reset();
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      return apiRequest('DELETE', `/api/admin/users/${userId}`, {});
    },
    onSuccess: () => {
      toast({ title: "Success", description: "User deleted successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });


  const updateSubscriptionMutation = useMutation({
    mutationFn: async (data: { strataId: string; subscriptionData: z.infer<typeof subscriptionSchema> }) => {
      const response = await fetch(`/api/admin/strata/${data.strataId}/subscription`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data.subscriptionData),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update subscription');
      }
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Subscription updated successfully" });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/strata'] });
      setShowSubscriptionDialog(false);
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const deleteStrataMutation = useMutation({
    mutationFn: async (strataId: string) => {
      return apiRequest('DELETE', `/api/admin/strata/${strataId}`, {});
    },
    onSuccess: () => {
      toast({ 
        title: "Success", 
        description: "Strata organization and all associated data deleted successfully" 
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/strata'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      queryClient.invalidateQueries({ queryKey: ['/api/strata'] }); // Update sidebar dropdown
      setShowDeleteConfirmation(false);
      setStrataToDelete(null);
    },
    onError: (error: Error) => {
      toast({ 
        title: "Error", 
        description: error.message || "Failed to delete strata organization", 
        variant: "destructive" 
      });
    },
  });

  const handleDeleteStrata = (strata: Strata) => {
    setStrataToDelete(strata);
    setShowDeleteConfirmation(true);
  };

  const confirmDeleteStrata = () => {
    if (strataToDelete) {
      deleteStrataMutation.mutate(strataToDelete.id);
    }
  };

  const handleEditStrata = (strata: Strata) => {
    setSelectedStrata(strata);
    strataForm.reset({
      name: strata.name,
      address: strata.address,
      city: strata.city || "",
      province: strata.province || "",
      postalCode: strata.postalCode || "",
      country: strata.country || "Canada",
      phoneNumber: strata.phoneNumber || "",
      email: strata.email || "",
      unitCount: strata.unitCount,
      corporationNumber: strata.corporationNumber || "",
      managementCompany: strata.managementCompany || "",
      managementContactName: strata.managementContactName || "",
      managementContactEmail: strata.managementContactEmail || "",
      managementContactPhone: strata.managementContactPhone || "",
      status: strata.status,
      notes: strata.notes || "",
    });
    setShowEditStrata(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-yellow-100 text-yellow-800';
      case 'archived': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="h-4 w-4" />;
      case 'inactive': return <Clock className="h-4 w-4" />;
      case 'archived': return <AlertCircle className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  const handleAssignUserToStrata = (strata: Strata) => {
    setSelectedStrataForUserAssignment(strata);
    userAssignmentForm.setValue('strataId', strata.id);
    setShowAssignUser(true);
  };

  const getRoleDisplayName = (role: string) => {
    const roleMap: { [key: string]: string } = {
      'chairperson': 'Chairperson',
      'treasurer': 'Treasurer',
      'secretary': 'Secretary',
      'council_member': 'Council Member',
      'property_manager': 'Property Manager',
      'resident': 'Resident',
      'admin': 'Admin'
    };
    return roleMap[role] || role;
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    editUserForm.reset({
      email: user.email || "",
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      role: user.role || "resident",
      isActive: user.isActive ?? true,
      resetPassword: false,
      newPassword: "",
    });
    setShowEditUser(true);
  };

  const handleDeleteUser = (user: User) => {
    if (window.confirm(`Are you sure you want to delete user: ${user.email}?`)) {
      deleteUserMutation.mutate(user.id);
    }
  };

  const handleManageSubscription = (strata: Strata) => {
    setSelectedStrataForSubscription(strata);
    // Initialize form with current subscription data
    const monthlyRate = (strata as any).subscriptionTier === 'standard' ? 49 :
                       (strata as any).subscriptionTier === 'premium' ? 79 : 0;
    subscriptionForm.reset({
      subscriptionTier: (strata as any).subscriptionTier || 'trial',
      monthlyRate: (strata as any).monthlyRate || monthlyRate,
      isFreeForever: (strata as any).isFreeForever || false,
    });
    setShowSubscriptionDialog(true);
  };

  const onSubscriptionSubmit = (data: z.infer<typeof subscriptionSchema>) => {
    if (!selectedStrataForSubscription) return;
    updateSubscriptionMutation.mutate({
      strataId: selectedStrataForSubscription.id,
      subscriptionData: data,
    });
  };

  return (
    <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-4 lg:py-8">
      <div className="mb-6 lg:mb-8">
        <div className="flex items-center gap-2 mb-2 lg:mb-4">
          <Settings className="h-5 w-5 lg:h-6 lg:w-6" />
          <h1 className="text-xl lg:text-2xl font-bold">System Administration</h1>
        </div>
        <p className="text-sm lg:text-base text-muted-foreground">
          Manage all strata organizations and users in the system
        </p>
      </div>

      {/* Tab Navigation - Mobile Optimized */}
      <div className="mb-6">
        <div className="flex gap-2 overflow-x-auto pb-2 lg:pb-0 scrollbar-none">
          <Button
            variant={activeTab === "strata" ? "default" : "outline"}
            onClick={() => setActiveTab("strata")}
            className="flex items-center gap-2 whitespace-nowrap text-xs lg:text-sm px-3 lg:px-4 py-2 h-8 lg:h-10"
          >
            <Building2 className="h-3 w-3 lg:h-4 lg:w-4" />
            <span className="hidden sm:inline">Strata Organizations</span>
            <span className="sm:hidden">Strata</span>
          </Button>
          <Button
            variant={activeTab === "users" ? "default" : "outline"}
            onClick={() => setActiveTab("users")}
            className="flex items-center gap-2 whitespace-nowrap text-xs lg:text-sm px-3 lg:px-4 py-2 h-8 lg:h-10"
          >
            <Users className="h-3 w-3 lg:h-4 lg:w-4" />
            Users
          </Button>
          <Button
            variant={activeTab === "registrations" ? "default" : "outline"}
            onClick={() => setActiveTab("registrations")}
            className="flex items-center gap-2 whitespace-nowrap text-xs lg:text-sm px-3 lg:px-4 py-2 h-8 lg:h-10"
          >
            <Building className="h-3 w-3 lg:h-4 lg:w-4" />
            <span className="hidden sm:inline">Pending Registrations</span>
            <span className="sm:hidden">Pending</span>
          </Button>
          <Button
            variant={activeTab === "subscriptions" ? "default" : "outline"}
            onClick={() => setActiveTab("subscriptions")}
            className="flex items-center gap-2 whitespace-nowrap text-xs lg:text-sm px-3 lg:px-4 py-2 h-8 lg:h-10"
          >
            <CreditCard className="h-3 w-3 lg:h-4 lg:w-4" />
            <span className="hidden sm:inline">Subscriptions & Billing</span>
            <span className="sm:hidden">Billing</span>
          </Button>
        </div>
      </div>

      {/* Strata Management Tab */}
      {activeTab === "strata" && (
        <div className="space-y-4 lg:space-y-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
            <h2 className="text-lg lg:text-xl font-semibold">Strata Organizations</h2>
            <Button onClick={() => setShowCreateStrata(true)} className="w-full sm:w-auto text-sm">
              <Plus className="h-3 w-3 lg:h-4 lg:w-4 mr-2" />
              <span className="hidden sm:inline">Create New Strata</span>
              <span className="sm:hidden">Create Strata</span>
            </Button>
          </div>

          {strataLoading ? (
            <Card>
              <CardContent className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading strata...</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {allStrata?.map((strata) => (
                <Card key={strata.id}>
                  <CardContent className="p-4 lg:p-6">
                    {/* Mobile-optimized header */}
                    <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-3 lg:gap-4 mb-4">
                      <div className="flex-1">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-3">
                          <h3 className="text-base lg:text-lg font-semibold">{strata.name}</h3>
                          <Badge className={`flex items-center gap-1 w-fit ${getStatusColor(strata.status)}`}>
                            {getStatusIcon(strata.status)}
                            <span className="text-xs">{strata.status}</span>
                          </Badge>
                        </div>
                        
                        {/* Responsive info grid */}
                        <div className="space-y-2 text-xs lg:text-sm text-muted-foreground">
                          <div className="flex items-start gap-2">
                            <MapPin className="h-3 w-3 lg:h-4 lg:w-4 mt-0.5 flex-shrink-0" />
                            <span className="break-words">
                              {strata.address}
                              {strata.city && strata.province && (
                                <span>, {strata.city}, {strata.province}</span>
                              )}
                            </span>
                          </div>
                          
                          <div className="flex flex-wrap gap-x-4 gap-y-1">
                            {strata.email && (
                              <div className="flex items-center gap-1">
                                <Mail className="h-3 w-3 lg:h-4 lg:w-4" />
                                <span className="truncate max-w-[150px] lg:max-w-none">{strata.email}</span>
                              </div>
                            )}
                            {strata.phoneNumber && (
                              <div className="flex items-center gap-1">
                                <Phone className="h-3 w-3 lg:h-4 lg:w-4" />
                                <span>{strata.phoneNumber}</span>
                              </div>
                            )}
                          </div>
                          
                          <div className="flex flex-wrap gap-x-4 gap-y-1">
                            <div className="flex items-center gap-1">
                              <Building className="h-3 w-3 lg:h-4 lg:w-4" />
                              <span>{strata.unitCount} units</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3 lg:h-4 lg:w-4" />
                              <span>{formatDate(strata.createdAt)}</span>
                            </div>
                          </div>
                          
                          {/* Subscription info */}
                          <div className="flex flex-wrap items-center gap-2 mt-3 pt-2 border-t border-gray-100">
                            <Badge variant={(strata as any).subscriptionStatus === 'trial' ? 'secondary' : (strata as any).subscriptionStatus === 'active' ? 'default' : (strata as any).isFreeForever ? 'outline' : 'destructive'}>
                              <span className="text-xs">
                                {(strata as any).isFreeForever ? 'Free Forever' : (strata as any).subscriptionStatus || 'Not Set'}
                              </span>
                            </Badge>
                            <span className="text-xs">
                              ${(strata as any).monthlyRate || 0}/month ({(strata as any).subscriptionTier || 'trial'})
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Mobile-optimized buttons */}
                      <div className="flex flex-row lg:flex-col gap-2 w-full lg:w-auto">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleEditStrata(strata)}
                          className="flex-1 lg:flex-none text-xs lg:text-sm h-8 lg:h-9"
                        >
                          <Edit className="h-3 w-3 lg:h-4 lg:w-4 mr-1 lg:mr-2" />
                          Edit
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleManageSubscription(strata)}
                          className="flex-1 lg:flex-none text-xs lg:text-sm h-8 lg:h-9"
                        >
                          <Calendar className="h-3 w-3 lg:h-4 lg:w-4 mr-1 lg:mr-2" />
                          <span className="hidden sm:inline">Subscription</span>
                          <span className="sm:hidden">Sub</span>
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDeleteStrata(strata)}
                          className="flex-1 lg:flex-none text-xs lg:text-sm h-8 lg:h-9 text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
                        >
                          <Trash2 className="h-3 w-3 lg:h-4 lg:w-4 mr-1 lg:mr-2" />
                          <span className="hidden sm:inline">Delete</span>
                          <span className="sm:hidden">Del</span>
                        </Button>
                      </div>
                    </div>
                    
                    {strata.managementCompany && (
                      <div className="border-t pt-3 lg:pt-4 mt-3 lg:mt-4">
                        <h4 className="font-medium text-xs lg:text-sm mb-2">Management</h4>
                        <div className="text-xs lg:text-sm text-muted-foreground space-y-1">
                          <p><strong>Company:</strong> {strata.managementCompany}</p>
                          {strata.managementContactName && (
                            <p><strong>Contact:</strong> {strata.managementContactName}</p>
                          )}
                          {strata.managementContactEmail && (
                            <p><strong>Email:</strong> <span className="break-all">{strata.managementContactEmail}</span></p>
                          )}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
              
              {allStrata?.length === 0 && (
                <Card>
                  <CardContent className="text-center py-12">
                    <Building2 className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                    <h3 className="text-lg font-semibold mb-2">No Strata Organizations</h3>
                    <p className="text-muted-foreground mb-4">
                      Get started by creating your first strata organization.
                    </p>
                    <Button onClick={() => setShowCreateStrata(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Create First Strata
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>
      )}

      {/* Users Management Tab */}
      {activeTab === "users" && (
        <div className="space-y-4 lg:space-y-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
            <h2 className="text-lg lg:text-xl font-semibold">System Users</h2>
            <Button onClick={() => setShowCreateUser(true)} className="w-full sm:w-auto text-sm">
              <Plus className="h-3 w-3 lg:h-4 lg:w-4 mr-2" />
              Create User
            </Button>
          </div>

          {usersLoading ? (
            <Card>
              <CardContent className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading users...</p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table className="min-w-[760px] text-xs">
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[120px]">User</TableHead>
                        <TableHead className="w-[160px]">Email</TableHead>
                        <TableHead className="w-[90px]">Role</TableHead>
                        <TableHead className="w-[120px]">Strata</TableHead>
                        <TableHead className="w-[70px]">Status</TableHead>
                        <TableHead className="w-[80px]">Joined</TableHead>
                        <TableHead className="w-[120px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {allUsers?.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell className="w-[120px]">
                            <div>
                              <p className="font-medium text-xs truncate">
                                {user.firstName || user.lastName 
                                  ? `${user.firstName || ''} ${user.lastName || ''}`.trim()
                                  : 'No name set'
                                }
                              </p>
                              <p className="text-xs text-muted-foreground truncate">ID: {user.id.split('-')[0]}...</p>
                            </div>
                          </TableCell>
                          <TableCell className="w-[160px]">
                            <span className="text-xs truncate block" title={user.email}>{user.email}</span>
                          </TableCell>
                          <TableCell className="w-[90px]">
                            <Badge variant="secondary" className="text-xs">{user.role}</Badge>
                          </TableCell>
                          <TableCell className="w-[120px]">
                            <UserStrataAssignments userId={user.id} />
                          </TableCell>
                          <TableCell className="w-[70px]">
                            <Badge variant={user.isActive ? "default" : "destructive"} className="text-xs">
                              {user.isActive ? "Active" : "Inactive"}
                            </Badge>
                          </TableCell>
                          <TableCell className="w-[80px]">
                            <span className="text-xs">{formatDate(user.createdAt)}</span>
                          </TableCell>
                          <TableCell className="w-[120px]">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm" className="h-6 w-6 p-0">
                                  <MoreHorizontal className="h-3 w-3" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-40">
                                <DropdownMenuItem onClick={() => handleEditUser(user)}>
                                  <Edit className="mr-2 h-3 w-3" />
                                  Edit User
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => {
                                  setSelectedUserForRole({ id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName, role: user.role } as any);
                                  // Set a default strata if none selected or pick the first available strata
                                  const defaultStrata = allStrata?.[0];
                                  if (defaultStrata) {
                                    setSelectedStrataForUserAssignment(defaultStrata);
                                    userAssignmentForm.setValue('strataId', defaultStrata.id);
                                  }
                                  userAssignmentForm.setValue('userId', user.id);
                                  userAssignmentForm.setValue('role', user.role);
                                  setShowAssignUser(true);
                                }}>
                                  <UserPlus className="mr-2 h-3 w-3" />
                                  Assign to Strata
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem 
                                  onClick={() => handleDeleteUser(user)}
                                  className="text-red-600 focus:text-red-600"
                                >
                                  <Trash2 className="mr-2 h-3 w-3" />
                                  Delete User
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                
                {allUsers?.length === 0 && (
                  <div className="text-center py-12">
                    <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                    <h3 className="text-lg font-semibold mb-2">No Users Found</h3>
                    <p className="text-muted-foreground">
                      Users will appear here as they register for the system.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      )}



      {/* Pending Registrations Tab */}
      {activeTab === "registrations" && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Pending Strata Registrations</h2>
            <Badge variant="secondary">
              Requires Approval
            </Badge>
          </div>

          <PendingRegistrationsSection />
        </div>
      )}

      {/* Subscriptions & Billing Tab */}
      {activeTab === "subscriptions" && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Subscription Management & Billing</h2>
            <Badge variant="secondary">
              Master Admin Control
            </Badge>
          </div>

          <SubscriptionManagementSection />
        </div>
      )}

      {/* Create Strata Dialog */}
      <Dialog open={showCreateStrata} onOpenChange={setShowCreateStrata}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Strata Organization</DialogTitle>
          </DialogHeader>
          <Form {...strataForm}>
            <form onSubmit={strataForm.handleSubmit((data) => createStrataMutation.mutate(data))} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={strataForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem className="col-span-2">
                      <FormLabel>Organization Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Sunset Gardens Strata" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={strataForm.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem className="col-span-2">
                      <FormLabel>Address</FormLabel>
                      <FormControl>
                        <Input placeholder="123 Main Street" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={strataForm.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City</FormLabel>
                      <FormControl>
                        <Input placeholder="Vancouver" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={strataForm.control}
                  name="province"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Province</FormLabel>
                      <FormControl>
                        <Input placeholder="BC" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={strataForm.control}
                  name="postalCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Postal Code</FormLabel>
                      <FormControl>
                        <Input placeholder="V6K 2P4" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={strataForm.control}
                  name="unitCount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Number of Units</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="1"
                          {...field} 
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={strataForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="contact@strata.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={strataForm.control}
                  name="phoneNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input placeholder="(604) 555-0123" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={strataForm.control}
                  name="corporationNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Corporation Number</FormLabel>
                      <FormControl>
                        <Input placeholder="BCS12345" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={strataForm.control}
                  name="managementCompany"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Management Company</FormLabel>
                      <FormControl>
                        <Input placeholder="ABC Property Management" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={strataForm.control}
                  name="managementContactName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Management Contact</FormLabel>
                      <FormControl>
                        <Input placeholder="John Smith" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={strataForm.control}
                  name="managementContactEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Management Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="manager@company.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={strataForm.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                          <SelectItem value="archived">Archived</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={strataForm.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Additional notes about this strata organization..."
                        className="min-h-[80px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => setShowCreateStrata(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createStrataMutation.isPending}>
                  {createStrataMutation.isPending ? "Creating..." : "Create Strata"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Edit Strata Dialog */}
      <Dialog open={showEditStrata} onOpenChange={setShowEditStrata}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Strata Organization</DialogTitle>
          </DialogHeader>
          <Form {...strataForm}>
            <form onSubmit={strataForm.handleSubmit((data) => updateStrataMutation.mutate(data))} className="space-y-4">
              {/* Same form fields as create dialog */}
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={strataForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem className="col-span-2">
                      <FormLabel>Organization Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Sunset Gardens Strata" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={strataForm.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem className="col-span-2">
                      <FormLabel>Address</FormLabel>
                      <FormControl>
                        <Input placeholder="123 Main Street" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={strataForm.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City</FormLabel>
                      <FormControl>
                        <Input placeholder="Vancouver" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={strataForm.control}
                  name="province"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Province</FormLabel>
                      <FormControl>
                        <Input placeholder="BC" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={strataForm.control}
                  name="postalCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Postal Code</FormLabel>
                      <FormControl>
                        <Input placeholder="V6K 2P4" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={strataForm.control}
                  name="unitCount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Number of Units</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="1"
                          {...field} 
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={strataForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="contact@strata.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={strataForm.control}
                  name="phoneNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input placeholder="(604) 555-0123" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={strataForm.control}
                  name="corporationNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Corporation Number</FormLabel>
                      <FormControl>
                        <Input placeholder="BCS12345" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={strataForm.control}
                  name="managementCompany"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Management Company</FormLabel>
                      <FormControl>
                        <Input placeholder="ABC Property Management" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={strataForm.control}
                  name="managementContactName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Management Contact</FormLabel>
                      <FormControl>
                        <Input placeholder="John Smith" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={strataForm.control}
                  name="managementContactEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Management Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="manager@company.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={strataForm.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                          <SelectItem value="archived">Archived</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={strataForm.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Additional notes about this strata organization..."
                        className="min-h-[80px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => setShowEditStrata(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={updateStrataMutation.isPending}>
                  {updateStrataMutation.isPending ? "Updating..." : "Update Strata"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Assign User Dialog */}
      <Dialog open={showAssignUser} onOpenChange={setShowAssignUser}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Assign User to Strata</DialogTitle>
          </DialogHeader>
          <Form {...userAssignmentForm}>
            <form onSubmit={async (e) => {
              e.preventDefault();
              console.log('🚀 Form submitted via onSubmit event!');
              
              const formData = userAssignmentForm.getValues();
              console.log('Form values:', formData);
              console.log('Form errors:', userAssignmentForm.formState.errors);
              console.log('Is form valid:', userAssignmentForm.formState.isValid);
              
              // Manual validation
              if (!formData.userId || !formData.strataId || !formData.role) {
                console.error('❌ Missing required fields:', formData);
                return;
              }
              
              console.log('✅ All fields valid, executing mutation...');
              assignUserMutation.mutate(formData);
            }} className="space-y-4">
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium mb-2">Strata Organization:</p>
                  <p className="text-sm text-muted-foreground">{selectedStrataForUserAssignment?.name}</p>
                </div>
                
                <FormField
                  control={userAssignmentForm.control}
                  name="strataId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Strata Organization</FormLabel>
                      <Select onValueChange={(value) => {
                        field.onChange(value);
                        const strata = allStrata?.find(s => s.id === value);
                        if (strata) setSelectedStrataForUserAssignment(strata);
                      }} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select strata organization" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {allStrata?.map((strata) => (
                            <SelectItem key={strata.id} value={strata.id}>
                              {strata.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={userAssignmentForm.control}
                  name="userId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Select User</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Choose a user to assign" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {allUsers?.map((user) => (
                            <SelectItem key={user.id} value={user.id}>
                              {user.email} 
                              {(user.firstName || user.lastName) && 
                                ` (${user.firstName || ''} ${user.lastName || ''}`.trim() + ')'
                              }
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={userAssignmentForm.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Role</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select user role" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="resident">Resident</SelectItem>
                          <SelectItem value="council_member">Council Member</SelectItem>
                          <SelectItem value="secretary">Secretary</SelectItem>
                          <SelectItem value="treasurer">Treasurer</SelectItem>
                          <SelectItem value="chairperson">Chairperson</SelectItem>
                          <SelectItem value="property_manager">Property Manager</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="flex gap-2 justify-end">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setShowAssignUser(false);
                    userAssignmentForm.reset();
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={assignUserMutation.isPending}>
                  {assignUserMutation.isPending ? "Assigning..." : "Assign User"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Create User Dialog */}
      <Dialog open={showCreateUser} onOpenChange={setShowCreateUser}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create New User</DialogTitle>
          </DialogHeader>
          <Form {...createUserForm}>
            <form onSubmit={createUserForm.handleSubmit((data) => createUserMutation.mutate(data))} className="space-y-4">
              <div className="space-y-4">
                <FormField
                  control={createUserForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address</FormLabel>
                      <FormControl>
                        <Input placeholder="user@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={createUserForm.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name</FormLabel>
                        <FormControl>
                          <Input placeholder="John" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={createUserForm.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={createUserForm.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Default Role</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select default role" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="resident">Resident</SelectItem>
                          <SelectItem value="council_member">Council Member</SelectItem>
                          <SelectItem value="secretary">Secretary</SelectItem>
                          <SelectItem value="treasurer">Treasurer</SelectItem>
                          <SelectItem value="chairperson">Chairperson</SelectItem>
                          <SelectItem value="property_manager">Property Manager</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={createUserForm.control}
                  name="temporaryPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Temporary Password</FormLabel>
                      <FormControl>
                        <Input 
                          type="password" 
                          placeholder="Temporary password (min 6 characters)" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                      <p className="text-sm text-muted-foreground">
                        User will be prompted to change this password on first login.
                      </p>
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="flex gap-2 justify-end">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setShowCreateUser(false);
                    createUserForm.reset();
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={createUserMutation.isPending}>
                  {createUserMutation.isPending ? "Creating..." : "Create User"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={showEditUser} onOpenChange={setShowEditUser}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
          </DialogHeader>
          <Form {...editUserForm}>
            <form onSubmit={editUserForm.handleSubmit((data) => editUserMutation.mutate(data))} className="space-y-4">
              <div className="space-y-4">
                <FormField
                  control={editUserForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address</FormLabel>
                      <FormControl>
                        <Input placeholder="user@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={editUserForm.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name</FormLabel>
                        <FormControl>
                          <Input placeholder="John" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={editUserForm.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={editUserForm.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Role</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select role" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="resident">Resident</SelectItem>
                          <SelectItem value="council_member">Council Member</SelectItem>
                          <SelectItem value="secretary">Secretary</SelectItem>
                          <SelectItem value="treasurer">Treasurer</SelectItem>
                          <SelectItem value="chairperson">Chairperson</SelectItem>
                          <SelectItem value="property_manager">Property Manager</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={editUserForm.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                      <div className="space-y-0.5">
                        <FormLabel>Account Status</FormLabel>
                        <p className="text-sm text-muted-foreground">
                          Active users can log in and access the system
                        </p>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={editUserForm.control}
                  name="resetPassword"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                      <div className="space-y-0.5">
                        <FormLabel>Reset Password</FormLabel>
                        <p className="text-sm text-muted-foreground">
                          Set a new temporary password for this user
                        </p>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                {editUserForm.watch("resetPassword") && (
                  <FormField
                    control={editUserForm.control}
                    name="newPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>New Temporary Password</FormLabel>
                        <FormControl>
                          <Input 
                            type="password" 
                            placeholder="New temporary password (min 6 characters)" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                        <p className="text-sm text-muted-foreground">
                          User will be prompted to change this password on next login.
                        </p>
                      </FormItem>
                    )}
                  />
                )}
              </div>
              
              <div className="flex gap-2 justify-end">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setShowEditUser(false);
                    setSelectedUser(null);
                    editUserForm.reset();
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={editUserMutation.isPending}>
                  {editUserMutation.isPending ? "Updating..." : "Update User"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Assign User to Strata Dialog */}
      <Dialog open={showAssignUser} onOpenChange={setShowAssignUser}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Assign User to Strata</DialogTitle>
          </DialogHeader>
          <Form {...userAssignmentForm}>
            <form onSubmit={userAssignmentForm.handleSubmit((data) => {
              const submissionData = {
                ...data,
                userId: selectedUserForRole?.id || data.userId
              };
              console.log('Form submission data:', submissionData);
              console.log('Form errors:', userAssignmentForm.formState.errors);
              assignUserMutation.mutate(submissionData);
            })} className="space-y-4">
              <div className="space-y-4">
                {selectedUserForRole && (
                  <div>
                    <p className="text-sm font-medium mb-2">Selected User:</p>
                    <p className="text-sm text-muted-foreground">
                      {selectedUserForRole.firstName || selectedUserForRole.lastName 
                        ? `${selectedUserForRole.firstName || ''} ${selectedUserForRole.lastName || ''}`.trim() 
                        : selectedUserForRole.email}
                    </p>
                  </div>
                )}
                
                <FormField
                  control={userAssignmentForm.control}
                  name="strataId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Strata Organization</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Choose a strata organization" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {allStrata?.map((strata) => (
                            <SelectItem key={strata.id} value={strata.id}>
                              {strata.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={userAssignmentForm.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Role</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select role" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="resident">Resident</SelectItem>
                          <SelectItem value="council_member">Council Member</SelectItem>
                          <SelectItem value="secretary">Secretary</SelectItem>
                          <SelectItem value="treasurer">Treasurer</SelectItem>
                          <SelectItem value="chairperson">Chairperson</SelectItem>
                          <SelectItem value="property_manager">Property Manager</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="flex gap-2 justify-end">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setShowAssignUser(false);
                    setSelectedUserForRole(null);
                    userAssignmentForm.reset();
                  }}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={assignUserMutation.isPending}
                  onClick={(e) => {
                    console.log('Assign User button clicked!');
                    console.log('Form values:', userAssignmentForm.getValues());
                    console.log('Form errors:', userAssignmentForm.formState.errors);
                    console.log('Is form valid:', userAssignmentForm.formState.isValid);
                  }}
                >
                  {assignUserMutation.isPending ? "Assigning..." : "Assign User"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Subscription Management Dialog */}
      <Dialog open={showSubscriptionDialog} onOpenChange={setShowSubscriptionDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Manage Subscription</DialogTitle>
          </DialogHeader>
          
          <Form {...subscriptionForm}>
            <form onSubmit={subscriptionForm.handleSubmit(onSubscriptionSubmit)} className="space-y-4">
              <FormField
                control={subscriptionForm.control}
                name="subscriptionTier"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subscription Tier</FormLabel>
                    <Select onValueChange={(value) => {
                      field.onChange(value);
                      // Auto-set monthly rate based on tier
                      const rate = value === 'standard' ? 49 :
                                   value === 'premium' ? 79 : 0;
                      subscriptionForm.setValue('monthlyRate', rate);
                      subscriptionForm.setValue('isFreeForever', value === 'free');
                    }} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select subscription tier" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="trial">Trial (30 days)</SelectItem>
                        <SelectItem value="free">Free</SelectItem>
                        <SelectItem value="standard">Standard (≤100 units)</SelectItem>
                        <SelectItem value="premium">Premium (100+ units)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={subscriptionForm.control}
                name="monthlyRate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Monthly Rate ($)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={subscriptionForm.control}
                name="isFreeForever"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Free Forever</FormLabel>
                      <div className="text-sm text-muted-foreground">
                        Override subscription with permanent free access
                      </div>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={(checked) => {
                          field.onChange(checked);
                          if (checked) {
                            subscriptionForm.setValue('monthlyRate', 0);
                          }
                        }}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowSubscriptionDialog(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={updateSubscriptionMutation.isPending}
                  className="flex-1"
                >
                  {updateSubscriptionMutation.isPending ? "Updating..." : "Update"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* Delete Strata Confirmation Dialog */}
      <Dialog open={showDeleteConfirmation} onOpenChange={setShowDeleteConfirmation}>
        <DialogContent className="max-w-md mx-4 lg:mx-auto">
          <DialogHeader>
            <DialogTitle className="text-lg lg:text-xl text-red-600">Delete Strata Organization</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-red-800 mb-2">Warning: This action cannot be undone</h4>
                  <p className="text-sm text-red-700">
                    This will permanently delete <strong>{strataToDelete?.name}</strong> and all associated data including:
                  </p>
                  <ul className="text-sm text-red-700 mt-2 space-y-1 ml-4">
                    <li>• All user accounts associated only with this strata</li>
                    <li>• All financial records and expenses</li>
                    <li>• All documents and meetings</li>
                    <li>• All vendor information and quotes</li>
                    <li>• All units and maintenance requests</li>
                    <li>• All messages and notifications</li>
                  </ul>
                </div>
              </div>
            </div>
            
            <div className="text-sm text-muted-foreground">
              Users who are assigned to other strata organizations will not be deleted.
            </div>
            
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowDeleteConfirmation(false)}
                className="flex-1"
                disabled={deleteStrataMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                onClick={confirmDeleteStrata}
                disabled={deleteStrataMutation.isPending}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white"
              >
                {deleteStrataMutation.isPending ? "Deleting..." : "Delete Permanently"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
