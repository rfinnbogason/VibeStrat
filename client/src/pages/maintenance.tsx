import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  Plus, 
  Wrench, 
  Calendar, 
  DollarSign, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Construction,
  Building,
  Home,
  Fence,
  Palette,
  Droplets,
  Zap,
  Car,
  Trees,
  Shield,
  Trash2,
  Edit,
  Eye
} from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useStrata } from "@/lib/strata-context";

interface MaintenanceProject {
  id: string;
  title: string;
  description?: string;
  category: string;
  priority: string;
  status: string;
  estimatedCost: number;
  actualCost?: number;
  scheduledDate?: string;
  completedDate?: string;
  nextServiceDate?: string;
  contractor?: string;
  warranty?: string;
  notes?: string;
  strataId: string;
  createdAt: string;
  updatedAt: string;
}

const PROJECT_CATEGORIES = [
  { value: "roofing", label: "Roofing", icon: Building },
  { value: "concrete", label: "Concrete", icon: Construction },
  { value: "fencing", label: "Fencing", icon: Fence },
  { value: "painting", label: "Painting", icon: Palette },
  { value: "plumbing", label: "Plumbing", icon: Droplets },
  { value: "electrical", label: "Electrical", icon: Zap },
  { value: "hvac", label: "HVAC", icon: Home },
  { value: "parking", label: "Parking/Paving", icon: Car },
  { value: "landscaping", label: "Landscaping", icon: Trees },
  { value: "security", label: "Security", icon: Shield },
  { value: "waste", label: "Waste Management", icon: Trash2 },
  { value: "other", label: "Other", icon: Wrench }
];

const PRIORITY_COLORS = {
  low: "bg-green-100 text-green-800 border-green-200",
  medium: "bg-yellow-100 text-yellow-800 border-yellow-200", 
  high: "bg-orange-100 text-orange-800 border-orange-200",
  critical: "bg-red-100 text-red-800 border-red-200"
};

const STATUS_COLORS = {
  planned: "bg-blue-100 text-blue-800 border-blue-200",
  scheduled: "bg-purple-100 text-purple-800 border-purple-200",
  "in-progress": "bg-yellow-100 text-yellow-800 border-yellow-200",
  completed: "bg-green-100 text-green-800 border-green-200",
  cancelled: "bg-gray-100 text-gray-800 border-gray-200",
  overdue: "bg-red-100 text-red-800 border-red-200"
};

export default function Maintenance() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isProjectDialogOpen, setIsProjectDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<MaintenanceProject | null>(null);
  const [selectedProject, setSelectedProject] = useState<MaintenanceProject | null>(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);

  // Get strata context
  const { selectedStrataId, selectedStrata, isLoading: strataLoading } = useStrata();

  // Fetch maintenance projects
  const { data: projects = [], isLoading } = useQuery({
    queryKey: [`/api/strata/${selectedStrataId}/maintenance`],
    enabled: !!selectedStrata,
  });

  // Create project mutation
  const createProjectMutation = useMutation({
    mutationFn: async (projectData: any) => {
      const response = await apiRequest("POST", `/api/strata/${selectedStrataId}/maintenance`, projectData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/strata/${selectedStrataId}/maintenance`] });
      setIsProjectDialogOpen(false);
      setEditingProject(null);
      toast({ title: "Success", description: "Maintenance project created successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create maintenance project", variant: "destructive" });
    },
  });

  // Update project mutation
  const updateProjectMutation = useMutation({
    mutationFn: async (projectData: any) => {
      const response = await apiRequest("PATCH", `/api/maintenance/${editingProject?.id}`, projectData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/strata/${selectedStrataId}/maintenance`] });
      setIsProjectDialogOpen(false);
      setIsDetailsDialogOpen(false);
      setEditingProject(null);
      toast({ title: "Success", description: "Maintenance project updated successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update maintenance project", variant: "destructive" });
    },
  });

  const handleProjectSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const projectData = {
      title: formData.get("title"),
      description: formData.get("description"),
      category: formData.get("category"),
      priority: formData.get("priority"),
      status: formData.get("status"),
      estimatedCost: parseFloat(formData.get("estimatedCost") as string) || 0,
      actualCost: formData.get("actualCost") ? parseFloat(formData.get("actualCost") as string) : undefined,
      scheduledDate: formData.get("scheduledDate") ? new Date(formData.get("scheduledDate") as string).toISOString() : undefined,
      completedDate: formData.get("completedDate") ? new Date(formData.get("completedDate") as string).toISOString() : undefined,
      nextServiceDate: formData.get("nextServiceDate") ? new Date(formData.get("nextServiceDate") as string).toISOString() : undefined,
      contractor: formData.get("contractor"),
      warranty: formData.get("warranty"),
      notes: formData.get("notes"),
    };

    if (editingProject) {
      updateProjectMutation.mutate(projectData);
    } else {
      createProjectMutation.mutate(projectData);
    }
  };

  // Calculate project statistics
  const totalProjects = projects.length;
  const completedProjects = projects.filter((p: MaintenanceProject) => p.status === 'completed').length;
  const inProgressProjects = projects.filter((p: MaintenanceProject) => p.status === 'in-progress').length;
  const upcomingProjects = projects.filter((p: MaintenanceProject) => {
    if (!p.scheduledDate) return false;
    const scheduledDate = new Date(p.scheduledDate);
    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + (30 * 24 * 60 * 60 * 1000));
    return scheduledDate > now && scheduledDate <= thirtyDaysFromNow;
  }).length;

  const totalEstimatedCost = projects.reduce((sum: number, p: MaintenanceProject) => sum + (p.estimatedCost || 0), 0);
  const totalActualCost = projects.reduce((sum: number, p: MaintenanceProject) => sum + (p.actualCost || 0), 0);

  // Filter projects by status for tabs
  const activeProjects = projects.filter((p: MaintenanceProject) => 
    ['planned', 'scheduled', 'in-progress'].includes(p.status)
  );
  const completedProjectsList = projects.filter((p: MaintenanceProject) => p.status === 'completed');
  const upcomingProjectsList = projects.filter((p: MaintenanceProject) => {
    if (!p.nextServiceDate) return false;
    const nextServiceDate = new Date(p.nextServiceDate);
    const now = new Date();
    const oneYearFromNow = new Date(now.getTime() + (365 * 24 * 60 * 60 * 1000));
    return nextServiceDate > now && nextServiceDate <= oneYearFromNow;
  });

  // Show loading while strata context is loading or no strata selected
  if (strataLoading || !selectedStrata) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Maintenance Projects</h1>
          <p className="text-muted-foreground mt-1">
            Track large maintenance projects, historical work, and future scheduling
          </p>
        </div>
        <Dialog open={isProjectDialogOpen} onOpenChange={setIsProjectDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              className="bg-green-500 hover:bg-green-600 text-white"
              onClick={() => {
                setEditingProject(null);
                setIsProjectDialogOpen(true);
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              New Project
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingProject ? "Edit Project" : "New Maintenance Project"}</DialogTitle>
              <DialogDescription>
                {editingProject ? "Update project details" : "Create a new maintenance project for tracking"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleProjectSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Project Title</Label>
                  <Input 
                    id="title" 
                    name="title"
                    defaultValue={editingProject?.title}
                    placeholder="e.g., Roof Replacement - Building A"
                    required 
                  />
                </div>
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select name="category" defaultValue={editingProject?.category || "other"}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {PROJECT_CATEGORIES.map(cat => (
                        <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea 
                  id="description" 
                  name="description" 
                  defaultValue={editingProject?.description}
                  placeholder="Detailed project description, scope of work, materials needed..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="priority">Priority</Label>
                  <Select name="priority" defaultValue={editingProject?.priority || "medium"}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select name="status" defaultValue={editingProject?.status || "planned"}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="planned">Planned</SelectItem>
                      <SelectItem value="scheduled">Scheduled</SelectItem>
                      <SelectItem value="in-progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="estimatedCost">Estimated Cost ($)</Label>
                  <Input 
                    id="estimatedCost" 
                    name="estimatedCost" 
                    type="number"
                    step="0.01"
                    defaultValue={editingProject?.estimatedCost}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <Label htmlFor="actualCost">Actual Cost ($)</Label>
                  <Input 
                    id="actualCost" 
                    name="actualCost" 
                    type="number"
                    step="0.01"
                    defaultValue={editingProject?.actualCost}
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="scheduledDate">Scheduled Date</Label>
                  <Input 
                    id="scheduledDate" 
                    name="scheduledDate" 
                    type="date"
                    defaultValue={editingProject?.scheduledDate ? 
                      new Date(editingProject.scheduledDate).toISOString().split('T')[0] : ''}
                  />
                </div>
                <div>
                  <Label htmlFor="completedDate">Completed Date</Label>
                  <Input 
                    id="completedDate" 
                    name="completedDate" 
                    type="date"
                    defaultValue={editingProject?.completedDate ? 
                      new Date(editingProject.completedDate).toISOString().split('T')[0] : ''}
                  />
                </div>
                <div>
                  <Label htmlFor="nextServiceDate">Next Service Due</Label>
                  <Input 
                    id="nextServiceDate" 
                    name="nextServiceDate" 
                    type="date"
                    defaultValue={editingProject?.nextServiceDate ? 
                      new Date(editingProject.nextServiceDate).toISOString().split('T')[0] : ''}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="contractor">Contractor</Label>
                  <Input 
                    id="contractor" 
                    name="contractor" 
                    defaultValue={editingProject?.contractor}
                    placeholder="Contractor name or company"
                  />
                </div>
                <div>
                  <Label htmlFor="warranty">Warranty Period</Label>
                  <Input 
                    id="warranty" 
                    name="warranty" 
                    defaultValue={editingProject?.warranty}
                    placeholder="e.g., 5 years, 10 years"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea 
                  id="notes" 
                  name="notes" 
                  defaultValue={editingProject?.notes}
                  placeholder="Additional notes, special considerations, contact information..."
                  rows={3}
                />
              </div>

              <Button type="submit" disabled={createProjectMutation.isPending || updateProjectMutation.isPending}>
                {(createProjectMutation.isPending || updateProjectMutation.isPending) ? "Saving..." : 
                 editingProject ? "Update Project" : "Create Project"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
            <Construction className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProjects}</div>
            <p className="text-xs text-muted-foreground">
              All maintenance projects
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inProgressProjects}</div>
            <p className="text-xs text-muted-foreground">
              Currently active projects
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Due</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upcomingProjects}</div>
            <p className="text-xs text-muted-foreground">
              Next 30 days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Budget Overview</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalEstimatedCost.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Estimated: ${totalEstimatedCost.toLocaleString()} | Actual: ${totalActualCost.toLocaleString()}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Project Tabs */}
      <Tabs defaultValue="active" className="space-y-4">
        <TabsList>
          <TabsTrigger value="active">Active Projects ({activeProjects.length})</TabsTrigger>
          <TabsTrigger value="completed">Completed ({completedProjectsList.length})</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming Service ({upcomingProjectsList.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="active">
          <Card>
            <CardHeader>
              <CardTitle>Active Maintenance Projects</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Project</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Scheduled</TableHead>
                    <TableHead>Cost</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activeProjects.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        No active projects found
                      </TableCell>
                    </TableRow>
                  ) : (
                    activeProjects.map((project: MaintenanceProject) => {
                      const CategoryIcon = PROJECT_CATEGORIES.find(cat => cat.value === project.category)?.icon || Wrench;
                      return (
                        <TableRow key={project.id}>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <CategoryIcon className="h-4 w-4 text-muted-foreground" />
                              <div>
                                <div className="font-medium">{project.title}</div>
                                {project.description && (
                                  <div className="text-sm text-muted-foreground truncate max-w-xs">
                                    {project.description}
                                  </div>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {PROJECT_CATEGORIES.find(cat => cat.value === project.category)?.label || project.category}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={PRIORITY_COLORS[project.priority as keyof typeof PRIORITY_COLORS]}>
                              {project.priority}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={STATUS_COLORS[project.status as keyof typeof STATUS_COLORS]}>
                              {project.status.replace('-', ' ')}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {project.scheduledDate ? 
                              new Date(project.scheduledDate).toLocaleDateString() : 
                              <span className="text-muted-foreground">Not scheduled</span>
                            }
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <div>Est: ${project.estimatedCost?.toLocaleString() || '0'}</div>
                              {project.actualCost && (
                                <div className="text-muted-foreground">Act: ${project.actualCost.toLocaleString()}</div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setSelectedProject(project);
                                  setIsDetailsDialogOpen(true);
                                }}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setEditingProject(project);
                                  setIsProjectDialogOpen(true);
                                }}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="completed">
          <Card>
            <CardHeader>
              <CardTitle>Completed Projects</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Project</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Completed</TableHead>
                    <TableHead>Cost</TableHead>
                    <TableHead>Contractor</TableHead>
                    <TableHead>Warranty</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {completedProjectsList.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        No completed projects found
                      </TableCell>
                    </TableRow>
                  ) : (
                    completedProjectsList.map((project: MaintenanceProject) => {
                      const CategoryIcon = PROJECT_CATEGORIES.find(cat => cat.value === project.category)?.icon || Wrench;
                      return (
                        <TableRow key={project.id}>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <CategoryIcon className="h-4 w-4 text-muted-foreground" />
                              <div>
                                <div className="font-medium">{project.title}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {PROJECT_CATEGORIES.find(cat => cat.value === project.category)?.label || project.category}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {project.completedDate ? 
                              new Date(project.completedDate).toLocaleDateString() : 
                              <span className="text-muted-foreground">Not recorded</span>
                            }
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              {project.actualCost ? (
                                <div className="font-medium">${project.actualCost.toLocaleString()}</div>
                              ) : (
                                <div>${project.estimatedCost?.toLocaleString() || '0'}</div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            {project.contractor || <span className="text-muted-foreground">Not recorded</span>}
                          </TableCell>
                          <TableCell>
                            {project.warranty || <span className="text-muted-foreground">No warranty</span>}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedProject(project);
                                setIsDetailsDialogOpen(true);
                              }}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="upcoming">
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Service Due</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Project</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Last Completed</TableHead>
                    <TableHead>Next Service Due</TableHead>
                    <TableHead>Days Until Due</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {upcomingProjectsList.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        No upcoming service dates found
                      </TableCell>
                    </TableRow>
                  ) : (
                    upcomingProjectsList.map((project: MaintenanceProject) => {
                      const CategoryIcon = PROJECT_CATEGORIES.find(cat => cat.value === project.category)?.icon || Wrench;
                      const daysUntilDue = project.nextServiceDate ? 
                        Math.ceil((new Date(project.nextServiceDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : 0;
                      
                      return (
                        <TableRow key={project.id}>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <CategoryIcon className="h-4 w-4 text-muted-foreground" />
                              <div>
                                <div className="font-medium">{project.title}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {PROJECT_CATEGORIES.find(cat => cat.value === project.category)?.label || project.category}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {project.completedDate ? 
                              new Date(project.completedDate).toLocaleDateString() : 
                              <span className="text-muted-foreground">Not recorded</span>
                            }
                          </TableCell>
                          <TableCell>
                            {project.nextServiceDate ? 
                              new Date(project.nextServiceDate).toLocaleDateString() : 
                              <span className="text-muted-foreground">Not set</span>
                            }
                          </TableCell>
                          <TableCell>
                            <Badge className={daysUntilDue <= 30 ? "bg-red-100 text-red-800 border-red-200" : 
                                             daysUntilDue <= 90 ? "bg-yellow-100 text-yellow-800 border-yellow-200" : 
                                             "bg-green-100 text-green-800 border-green-200"}>
                              {daysUntilDue} days
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedProject(project);
                                setIsDetailsDialogOpen(true);
                              }}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Project Details Dialog */}
      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Project Details</DialogTitle>
          </DialogHeader>
          {selectedProject && (
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                {(() => {
                  const CategoryIcon = PROJECT_CATEGORIES.find(cat => cat.value === selectedProject.category)?.icon || Wrench;
                  return <CategoryIcon className="h-5 w-5 text-muted-foreground" />;
                })()}
                <h3 className="text-lg font-semibold">{selectedProject.title}</h3>
              </div>
              
              {selectedProject.description && (
                <div>
                  <Label className="text-sm font-medium">Description</Label>
                  <p className="text-sm text-muted-foreground mt-1">{selectedProject.description}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Category</Label>
                  <Badge variant="outline" className="mt-1">
                    {PROJECT_CATEGORIES.find(cat => cat.value === selectedProject.category)?.label || selectedProject.category}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium">Priority</Label>
                  <Badge className={`mt-1 ${PRIORITY_COLORS[selectedProject.priority as keyof typeof PRIORITY_COLORS]}`}>
                    {selectedProject.priority}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Status</Label>
                  <Badge className={`mt-1 ${STATUS_COLORS[selectedProject.status as keyof typeof STATUS_COLORS]}`}>
                    {selectedProject.status.replace('-', ' ')}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium">Cost</Label>
                  <div className="text-sm mt-1">
                    <div>Estimated: ${selectedProject.estimatedCost?.toLocaleString() || '0'}</div>
                    {selectedProject.actualCost && (
                      <div>Actual: ${selectedProject.actualCost.toLocaleString()}</div>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label className="text-sm font-medium">Scheduled</Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    {selectedProject.scheduledDate ? 
                      new Date(selectedProject.scheduledDate).toLocaleDateString() : 
                      'Not scheduled'
                    }
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Completed</Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    {selectedProject.completedDate ? 
                      new Date(selectedProject.completedDate).toLocaleDateString() : 
                      'Not completed'
                    }
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Next Service</Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    {selectedProject.nextServiceDate ? 
                      new Date(selectedProject.nextServiceDate).toLocaleDateString() : 
                      'Not set'
                    }
                  </p>
                </div>
              </div>

              {selectedProject.contractor && (
                <div>
                  <Label className="text-sm font-medium">Contractor</Label>
                  <p className="text-sm text-muted-foreground mt-1">{selectedProject.contractor}</p>
                </div>
              )}

              {selectedProject.warranty && (
                <div>
                  <Label className="text-sm font-medium">Warranty</Label>
                  <p className="text-sm text-muted-foreground mt-1">{selectedProject.warranty}</p>
                </div>
              )}

              {selectedProject.notes && (
                <div>
                  <Label className="text-sm font-medium">Notes</Label>
                  <p className="text-sm text-muted-foreground mt-1">{selectedProject.notes}</p>
                </div>
              )}

              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setEditingProject(selectedProject);
                    setIsDetailsDialogOpen(false);
                    setIsProjectDialogOpen(true);
                  }}
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Project
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
