import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
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
  Badge,
} from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  Settings,
  Plus,
  Users,
  Edit,
  UserPlus,
  Trash2,
  Crown,
  Shield,
  Building,
  MapPin,
  BarChart,
  DollarSign,
  Home,
  FileText,
  Calendar,
  MessageSquare,
  Wrench,
  Check,
  X,
  Eye,
  AlertCircle,
} from "lucide-react";

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
  canPostAnnouncements: boolean;
  createdAt: string;
  updatedAt: string;
  user: User | null;
}

const userSchema = z.object({
  email: z.string().email("Invalid email address"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  role: z.enum(["chairperson", "treasurer", "secretary", "council_member", "property_manager", "resident"]),
  temporaryPassword: z.string().min(6, "Password must be at least 6 characters"),
});

const roleAssignmentSchema = z.object({
  role: z.enum(["chairperson", "treasurer", "secretary", "council_member", "property_manager", "resident"]),
  canPostAnnouncements: z.boolean().default(false),
});

const editUserSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  role: z.enum(["chairperson", "treasurer", "secretary", "council_member", "property_manager", "resident"]),
  isActive: z.boolean().default(true),
  newPassword: z.string().optional(),
});

// Property Manager Strata List Component
function PropertyManagerStrataList() {
  const { data: allStrata } = useQuery<any[]>({
    queryKey: ['/api/strata'],
  });

  if (!allStrata || allStrata.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <Building className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No Properties Found</h3>
          <p className="text-muted-foreground">
            You are not currently assigned to manage any strata properties.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {allStrata.map((strata: any) => (
        <Card key={strata.id} className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  {strata.name}
                </CardTitle>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                  <MapPin className="h-4 w-4" />
                  {strata.city}, {strata.province}
                </div>
              </div>
              <Badge variant="outline">
                {strata.unitCount} units
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium">Address</p>
                <p className="text-sm text-muted-foreground">{strata.address}</p>
              </div>
              {strata.managementCompany && (
                <div>
                  <p className="text-sm font-medium">Management Company</p>
                  <p className="text-sm text-muted-foreground">{strata.managementCompany}</p>
                </div>
              )}
              <div className="flex justify-between items-center pt-2">
                <Badge variant={strata.status === 'active' ? 'default' : 'secondary'}>
                  {strata.status}
                </Badge>
                <Button size="sm" asChild>
                  <a href={`/?strata=${strata.id}`}>
                    Switch to Property
                  </a>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default function StrataAdmin() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [activeTab, setActiveTab] = useState<"users" | "roles" | "strata">("users");
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [showEditUser, setShowEditUser] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showRoleAssignment, setShowRoleAssignment] = useState(false);
  const [selectedUserForRole, setSelectedUserForRole] = useState<UserStrataAccessWithUser | null>(null);

  // Get user's strata ID (assuming user has access to only one strata for now)
  const { data: userStrata } = useQuery<any[]>({
    queryKey: ['/api/strata'],
  });

  const strataId = Array.isArray(userStrata) && userStrata.length > 0 ? userStrata[0]?.id : undefined;

  // Check if user has admin permissions (chairperson, property_manager, etc.)
  const hasAdminPermissions = user && ['chairperson', 'property_manager', 'treasurer', 'secretary'].includes(user.role);

  // Forms
  const userForm = useForm<z.infer<typeof userSchema>>({
    resolver: zodResolver(userSchema),
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
      firstName: "",
      lastName: "",
      email: "",
      role: "resident",
      isActive: true,
      newPassword: "",
    },
  });

  const roleForm = useForm<z.infer<typeof roleAssignmentSchema>>({
    resolver: zodResolver(roleAssignmentSchema),
    defaultValues: {
      role: "resident",
      canPostAnnouncements: false,
    },
  });

  // Queries
  const { data: strataUsers, isLoading: loadingUsers } = useQuery<UserStrataAccessWithUser[]>({
    queryKey: [`/api/strata/${strataId}/users`],
    enabled: !!strataId,
  });

  // Mutations
  const createUserMutation = useMutation({
    mutationFn: async (userData: z.infer<typeof userSchema>) => {
      await apiRequest('POST', '/api/strata-admin/users', {
        ...userData,
        strataId,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/strata/${strataId}/users`] });
      setShowCreateUser(false);
      userForm.reset();
      toast({
        title: "User Created",
        description: "New user has been created successfully with temporary password.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create user",
        variant: "destructive",
      });
    },
  });

  const editUserMutation = useMutation({
    mutationFn: async (userData: z.infer<typeof editUserSchema>) => {
      await apiRequest('PATCH', `/api/strata-admin/users/${selectedUser?.id}`, userData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/strata/${strataId}/users`] });
      setShowEditUser(false);
      setSelectedUser(null);
      editUserForm.reset();
      toast({
        title: "User Updated",
        description: "User information has been updated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update user",
        variant: "destructive",
      });
    },
  });

  const updateRoleMutation = useMutation({
    mutationFn: async (roleData: z.infer<typeof roleAssignmentSchema>) => {
      const endpoint = `/api/strata-admin/role/${selectedUserForRole?.id}`;
      console.log('Making PATCH request to:', endpoint);
      console.log('With data:', roleData);
      await apiRequest('PATCH', endpoint, roleData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/strata/${strataId}/users`] });
      setShowRoleAssignment(false);
      setSelectedUserForRole(null);
      roleForm.reset();
      toast({
        title: "Role Updated",
        description: "User role has been updated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update role",
        variant: "destructive",
      });
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      await apiRequest('DELETE', `/api/strata-admin/users/${userId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/strata/${strataId}/users`] });
      toast({
        title: "User Removed",
        description: "User has been removed from the strata.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to remove user",
        variant: "destructive",
      });
    },
  });

  // Event handlers
  const handleEditUser = (userAccess: UserStrataAccessWithUser) => {
    if (userAccess.user) {
      setSelectedUser(userAccess.user);
      editUserForm.reset({
        firstName: userAccess.user.firstName || "",
        lastName: userAccess.user.lastName || "",
        email: userAccess.user.email,
        role: userAccess.role as any,
        isActive: userAccess.user.isActive ?? true,
        newPassword: "",
      });
      setShowEditUser(true);
    }
  };

  const handleEditRole = (userAccess: UserStrataAccessWithUser) => {
    setSelectedUserForRole(userAccess);
    roleForm.reset({
      role: userAccess.role as any,
      canPostAnnouncements: userAccess.canPostAnnouncements,
    });
    setShowRoleAssignment(true);
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'chairperson':
        return <Crown className="h-4 w-4" />;
      case 'treasurer':
      case 'secretary':
      case 'council_member':
        return <Shield className="h-4 w-4" />;
      case 'property_manager':
        return <Settings className="h-4 w-4" />;
      default:
        return <Users className="h-4 w-4" />;
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'chairperson':
        return 'default';
      case 'treasurer':
      case 'secretary':
      case 'council_member':
        return 'secondary';
      case 'property_manager':
        return 'outline';
      default:
        return 'outline';
    }
  };

  if (!isAuthenticated || !hasAdminPermissions) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <Settings className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Access Denied</h3>
              <p className="text-muted-foreground">
                You need admin permissions to access this page.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!strataId) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <Settings className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No Strata Access</h3>
              <p className="text-muted-foreground">
                You are not assigned to any strata organization.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Strata Administration</h1>
          <p className="text-muted-foreground">Manage users and roles for your strata organization</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-2">
        <Button
          variant={activeTab === "users" ? "default" : "outline"}
          onClick={() => setActiveTab("users")}
          className="flex items-center gap-2"
        >
          <Users className="h-4 w-4" />
          User Management
        </Button>
        <Button
          variant={activeTab === "roles" ? "default" : "outline"}
          onClick={() => setActiveTab("roles")}
          className="flex items-center gap-2"
        >
          <Shield className="h-4 w-4" />
          Role Assignments
        </Button>
        {user?.role === 'property_manager' && (
          <Button
            variant={activeTab === "strata" ? "default" : "outline"}
            onClick={() => setActiveTab("strata")}
            className="flex items-center gap-2"
          >
            <Building className="h-4 w-4" />
            Manage Properties
          </Button>
        )}
      </div>

      {/* User Management Tab */}
      {activeTab === "users" && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">User Management</h2>
            <Button onClick={() => setShowCreateUser(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add New User
            </Button>
          </div>

          <Card>
            <CardContent>
              {loadingUsers ? (
                <div className="text-center py-8">Loading users...</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {strataUsers?.map((userAccess) => (
                      <TableRow key={userAccess.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getRoleIcon(userAccess.role)}
                            {userAccess.user?.firstName} {userAccess.user?.lastName}
                          </div>
                        </TableCell>
                        <TableCell>{userAccess.user?.email}</TableCell>
                        <TableCell>
                          <Badge variant={getRoleBadgeVariant(userAccess.role)}>
                            {userAccess.role.replace('_', ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={userAccess.user?.isActive ? "default" : "destructive"}>
                            {userAccess.user?.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditUser(userAccess)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditRole(userAccess)}
                            >
                              <UserPlus className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => deleteUserMutation.mutate(userAccess.userId)}
                              disabled={deleteUserMutation.isPending}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Role Assignments Tab */}
      {activeTab === "roles" && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Role Assignments</h2>
            <div className="text-sm text-muted-foreground">
              Manage user permissions and roles
            </div>
          </div>

          {/* Role Definitions */}
          <Card>
            <CardHeader>
              <CardTitle>Role Definitions & Permissions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Crown className="h-5 w-5 text-yellow-600" />
                    <h3 className="font-semibold">Chairperson</h3>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">Highest authority in strata management</p>
                  <ul className="text-xs space-y-1">
                    <li>• Full access to all modules</li>
                    <li>• Approve major expenses</li>
                    <li>• Manage user roles</li>
                    <li>• Post announcements</li>
                    <li>• Schedule meetings</li>
                  </ul>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="h-5 w-5 text-green-600" />
                    <h3 className="font-semibold">Treasurer</h3>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">Financial oversight and management</p>
                  <ul className="text-xs space-y-1">
                    <li>• Manage finances & budgets</li>
                    <li>• Track expenses & income</li>
                    <li>• Generate financial reports</li>
                    <li>• Approve vendor payments</li>
                    <li>• Manage fund allocations</li>
                  </ul>
                </div>

                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="h-5 w-5 text-blue-600" />
                    <h3 className="font-semibold">Secretary</h3>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">Documentation and communication</p>
                  <ul className="text-xs space-y-1">
                    <li>• Manage meeting minutes</li>
                    <li>• Handle correspondence</li>
                    <li>• Post announcements</li>
                    <li>• Manage documents</li>
                    <li>• Coordinate communications</li>
                  </ul>
                </div>

                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="h-5 w-5 text-purple-600" />
                    <h3 className="font-semibold">Council Member</h3>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">General strata council duties</p>
                  <ul className="text-xs space-y-1">
                    <li>• Participate in decisions</li>
                    <li>• Review maintenance requests</li>
                    <li>• Access reports & documents</li>
                    <li>• Attend council meetings</li>
                    <li>• Represent owner interests</li>
                  </ul>
                </div>

                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Settings className="h-5 w-5 text-orange-600" />
                    <h3 className="font-semibold">Property Manager</h3>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">Professional management services</p>
                  <ul className="text-xs space-y-1">
                    <li>• Manage multiple properties</li>
                    <li>• Coordinate maintenance</li>
                    <li>• Vendor management</li>
                    <li>• Financial oversight</li>
                    <li>• Daily operations</li>
                  </ul>
                </div>

                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="h-5 w-5 text-gray-600" />
                    <h3 className="font-semibold">Resident</h3>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">Property owner or tenant</p>
                  <ul className="text-xs space-y-1">
                    <li>• View announcements</li>
                    <li>• Submit maintenance requests</li>
                    <li>• Access documents</li>
                    <li>• View meeting schedules</li>
                    <li>• Contact strata council</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Current Role Assignments */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Current Role Assignments</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {strataUsers?.map((userAccess) => (
                <Card key={userAccess.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg flex items-center gap-2">
                          {getRoleIcon(userAccess.role)}
                          {userAccess.user?.firstName} {userAccess.user?.lastName}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">{userAccess.user?.email}</p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditRole(userAccess)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Role:</span>
                        <Badge variant={getRoleBadgeVariant(userAccess.role)}>
                          {userAccess.role.replace('_', ' ')}
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Announcements:</span>
                        <Badge variant={userAccess.canPostAnnouncements ? "default" : "outline"}>
                          {userAccess.canPostAnnouncements ? "Can Post" : "Cannot Post"}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Visual Permissions Matrix */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Visual Permissions & Tab Access
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Manage what each user can see and access in the application
              </p>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3 font-medium">User</th>
                      <th className="text-center p-3 font-medium">
                        <div className="flex flex-col items-center gap-1">
                          <BarChart className="h-4 w-4" />
                          <span className="text-xs">Dashboard</span>
                        </div>
                      </th>
                      <th className="text-center p-3 font-medium">
                        <div className="flex flex-col items-center gap-1">
                          <DollarSign className="h-4 w-4" />
                          <span className="text-xs">Financial</span>
                        </div>
                      </th>
                      <th className="text-center p-3 font-medium">
                        <div className="flex flex-col items-center gap-1">
                          <Home className="h-4 w-4" />
                          <span className="text-xs">Dwellings</span>
                        </div>
                      </th>
                      <th className="text-center p-3 font-medium">
                        <div className="flex flex-col items-center gap-1">
                          <Users className="h-4 w-4" />
                          <span className="text-xs">Vendors</span>
                        </div>
                      </th>
                      <th className="text-center p-3 font-medium">
                        <div className="flex flex-col items-center gap-1">
                          <FileText className="h-4 w-4" />
                          <span className="text-xs">Quotes</span>
                        </div>
                      </th>
                      <th className="text-center p-3 font-medium">
                        <div className="flex flex-col items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span className="text-xs">Meetings</span>
                        </div>
                      </th>
                      <th className="text-center p-3 font-medium">
                        <div className="flex flex-col items-center gap-1">
                          <MessageSquare className="h-4 w-4" />
                          <span className="text-xs">Community</span>
                        </div>
                      </th>
                      <th className="text-center p-3 font-medium">
                        <div className="flex flex-col items-center gap-1">
                          <Wrench className="h-4 w-4" />
                          <span className="text-xs">Maintenance</span>
                        </div>
                      </th>
                      <th className="text-center p-3 font-medium">
                        <div className="flex flex-col items-center gap-1">
                          <Shield className="h-4 w-4" />
                          <span className="text-xs">Admin</span>
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {strataUsers?.map((userAccess) => {
                      const hasFullAccess = ['chairperson', 'property_manager'].includes(userAccess.role);
                      const hasFinancialAccess = ['chairperson', 'treasurer', 'property_manager'].includes(userAccess.role);
                      const hasAdminAccess = ['chairperson', 'property_manager'].includes(userAccess.role);
                      const hasMeetingAccess = ['chairperson', 'secretary', 'council_member', 'property_manager'].includes(userAccess.role);
                      
                      return (
                        <tr key={userAccess.id} className="border-b hover:bg-muted/50">
                          <td className="p-3">
                            <div className="flex items-center gap-2">
                              {getRoleIcon(userAccess.role)}
                              <div>
                                <div className="font-medium text-sm">
                                  {userAccess.user?.firstName} {userAccess.user?.lastName}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {userAccess.user?.email}
                                </div>
                              </div>
                            </div>
                          </td>
                          
                          {/* Dashboard Access */}
                          <td className="text-center p-3">
                            <div className="flex justify-center">
                              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                                <Check className="h-4 w-4 text-green-600" />
                              </div>
                            </div>
                          </td>
                          
                          {/* Financial Access */}
                          <td className="text-center p-3">
                            <div className="flex justify-center">
                              {hasFinancialAccess ? (
                                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                                  <Check className="h-4 w-4 text-green-600" />
                                </div>
                              ) : (
                                <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                                  <X className="h-4 w-4 text-red-600" />
                                </div>
                              )}
                            </div>
                          </td>
                          
                          {/* Dwellings Access */}
                          <td className="text-center p-3">
                            <div className="flex justify-center">
                              {hasFullAccess ? (
                                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                                  <Check className="h-4 w-4 text-green-600" />
                                </div>
                              ) : (
                                <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center">
                                  <Eye className="h-4 w-4 text-yellow-600" />
                                </div>
                              )}
                            </div>
                          </td>
                          
                          {/* Vendors Access */}
                          <td className="text-center p-3">
                            <div className="flex justify-center">
                              {hasFullAccess ? (
                                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                                  <Check className="h-4 w-4 text-green-600" />
                                </div>
                              ) : (
                                <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center">
                                  <Eye className="h-4 w-4 text-yellow-600" />
                                </div>
                              )}
                            </div>
                          </td>
                          
                          {/* Quotes Access */}
                          <td className="text-center p-3">
                            <div className="flex justify-center">
                              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                                <Check className="h-4 w-4 text-green-600" />
                              </div>
                            </div>
                          </td>
                          
                          {/* Meetings Access */}
                          <td className="text-center p-3">
                            <div className="flex justify-center">
                              {hasMeetingAccess ? (
                                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                                  <Check className="h-4 w-4 text-green-600" />
                                </div>
                              ) : (
                                <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center">
                                  <Eye className="h-4 w-4 text-yellow-600" />
                                </div>
                              )}
                            </div>
                          </td>
                          
                          {/* Community Access */}
                          <td className="text-center p-3">
                            <div className="flex justify-center">
                              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                                <Check className="h-4 w-4 text-green-600" />
                              </div>
                            </div>
                          </td>
                          
                          {/* Maintenance Access */}
                          <td className="text-center p-3">
                            <div className="flex justify-center">
                              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                                <Check className="h-4 w-4 text-green-600" />
                              </div>
                            </div>
                          </td>
                          
                          {/* Admin Access */}
                          <td className="text-center p-3">
                            <div className="flex justify-center">
                              {hasAdminAccess ? (
                                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                                  <Check className="h-4 w-4 text-green-600" />
                                </div>
                              ) : (
                                <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                                  <X className="h-4 w-4 text-red-600" />
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              
              {/* Legend */}
              <div className="mt-4 flex flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
                    <Check className="h-3 w-3 text-green-600" />
                  </div>
                  <span>Full Access</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-yellow-100 flex items-center justify-center">
                    <Eye className="h-3 w-3 text-yellow-600" />
                  </div>
                  <span>View Only</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center">
                    <X className="h-3 w-3 text-red-600" />
                  </div>
                  <span>No Access</span>
                </div>
              </div>
              
              <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-blue-900 dark:text-blue-100">Permission Notes:</p>
                    <ul className="mt-1 text-blue-800 dark:text-blue-200 space-y-1">
                      <li>• Chairpersons and Property Managers have full access to all areas</li>
                      <li>• Treasurers have full financial access but limited admin rights</li>
                      <li>• Secretaries can manage meetings and communications</li>
                      <li>• Council Members can participate in meetings and view most content</li>
                      <li>• Residents have basic access to community features and maintenance requests</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Property Manager Strata Management Tab */}
      {activeTab === "strata" && user?.role === 'property_manager' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Manage Properties</h2>
            <div className="text-sm text-muted-foreground">
              Switch between different strata organizations you manage
            </div>
          </div>

          <PropertyManagerStrataList />
        </div>
      )}

      {/* Create User Dialog */}
      <Dialog open={showCreateUser} onOpenChange={setShowCreateUser}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
          </DialogHeader>
          <Form {...userForm}>
            <form onSubmit={userForm.handleSubmit((data) => createUserMutation.mutate(data))} className="space-y-4">
              <FormField
                control={userForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="user@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={userForm.control}
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
                  control={userForm.control}
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
                control={userForm.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="chairperson">Chairperson</SelectItem>
                        <SelectItem value="treasurer">Treasurer</SelectItem>
                        <SelectItem value="secretary">Secretary</SelectItem>
                        <SelectItem value="council_member">Council Member</SelectItem>
                        <SelectItem value="property_manager">Property Manager</SelectItem>
                        <SelectItem value="resident">Resident</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={userForm.control}
                name="temporaryPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Temporary Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Min 6 characters" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setShowCreateUser(false)}>
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
              <FormField
                control={editUserForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
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
                name="newPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Password (optional)</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Leave blank to keep current" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end gap-2">
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

      {/* Role Assignment Dialog */}
      <Dialog open={showRoleAssignment} onOpenChange={setShowRoleAssignment}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Update Role & Permissions</DialogTitle>
          </DialogHeader>
          <Form {...roleForm}>
            <form onSubmit={roleForm.handleSubmit((data) => updateRoleMutation.mutate(data))} className="space-y-4">
              <FormField
                control={roleForm.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="chairperson">Chairperson</SelectItem>
                        <SelectItem value="treasurer">Treasurer</SelectItem>
                        <SelectItem value="secretary">Secretary</SelectItem>
                        <SelectItem value="council_member">Council Member</SelectItem>
                        <SelectItem value="property_manager">Property Manager</SelectItem>
                        <SelectItem value="resident">Resident</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={roleForm.control}
                name="canPostAnnouncements"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">
                        Can Post Announcements
                      </FormLabel>
                      <div className="text-sm text-muted-foreground">
                        Allow this user to post announcements to the community
                      </div>
                    </div>
                    <FormControl>
                      <input
                        type="checkbox"
                        checked={field.value}
                        onChange={field.onChange}
                        className="w-4 h-4"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <div className="flex justify-end gap-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setShowRoleAssignment(false);
                    setSelectedUserForRole(null);
                    roleForm.reset();
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={updateRoleMutation.isPending}>
                  {updateRoleMutation.isPending ? "Updating..." : "Update Role"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}