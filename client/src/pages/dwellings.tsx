import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Building, Plus, Edit, FileText, Users, Home, Trash2 } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useStrata } from "@/lib/strata-context";

export default function Dwellings() {
  const [isDwellingDialogOpen, setIsDwellingDialogOpen] = useState(false);
  const [editingDwelling, setEditingDwelling] = useState<any>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [unitToDelete, setUnitToDelete] = useState<any>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Get strata context
  const { selectedStrataId, selectedStrata, isLoading: strataLoading } = useStrata();

  // Fetch strata units
  const { data: units = [], isLoading: unitsLoading } = useQuery({
    queryKey: [`/api/strata/${selectedStrataId}/units`],
    enabled: !!selectedStrataId,
  });

  // Fetch fee structure to get available tiers
  const { data: feeData } = useQuery({
    queryKey: [`/api/financial/fees/${selectedStrataId}`],
    enabled: !!selectedStrataId,
  });

  const feeTiers = feeData?.feeStructure?.tiers || [];

  // Create unit mutation
  const createUnitMutation = useMutation({
    mutationFn: async (unitData: any) => {
      const response = await apiRequest("POST", `/api/strata/${selectedStrataId}/units`, unitData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/strata/${selectedStrataId}/units`] });
      setIsDwellingDialogOpen(false);
      toast({ title: "Success", description: "Unit created successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create unit", variant: "destructive" });
    },
  });

  // Update unit mutation
  const updateUnitMutation = useMutation({
    mutationFn: async (unitData: any) => {
      const response = await apiRequest("PATCH", `/api/units/${editingDwelling.id}`, unitData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/strata/${selectedStrataId}/units`] });
      setIsDwellingDialogOpen(false);
      setEditingDwelling(null);
      toast({ title: "Success", description: "Unit updated successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update unit", variant: "destructive" });
    },
  });

  // Delete unit mutation
  const deleteUnitMutation = useMutation({
    mutationFn: async (unitId: string) => {
      const response = await apiRequest("DELETE", `/api/units/${unitId}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/strata/${selectedStrataId}/units`] });
      toast({ title: "Success", description: "Unit deleted successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to delete unit", variant: "destructive" });
    },
  });

  const handleDwellingSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const unitData = {
      unitNumber: formData.get("unitNumber"),
      unitType: formData.get("unitType"),
      feeTierId: formData.get("feeTierId"),
      ownerName: formData.get("ownerName"),
      ownerEmail: formData.get("ownerEmail"),
      ownerPhone: formData.get("ownerPhone"),
      squareFootage: parseFloat(formData.get("squareFootage") as string || "0"),
      parkingSpaces: parseInt(formData.get("parkingSpaces") as string || "0"),
    };

    if (editingDwelling) {
      updateUnitMutation.mutate(unitData);
    } else {
      createUnitMutation.mutate(unitData);
    }
  };

  const handleEditDwelling = (unit: any) => {
    setEditingDwelling(unit);
    setIsDwellingDialogOpen(true);
  };

  const handleDeleteDwelling = (unit: any) => {
    setUnitToDelete(unit);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (unitToDelete) {
      deleteUnitMutation.mutate(unitToDelete.id);
      setDeleteDialogOpen(false);
      setUnitToDelete(null);
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

  if (unitsLoading) {
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
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Dwelling Management</h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">
            Manage individual units, owners, and property details
          </p>
        </div>
        <Dialog open={isDwellingDialogOpen} onOpenChange={setIsDwellingDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-green-500 hover:bg-green-600 text-white w-full sm:w-auto text-sm sm:text-base" onClick={() => setEditingDwelling(null)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Unit
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingDwelling ? "Edit Unit" : "Add New Unit"}</DialogTitle>
              <DialogDescription>
                {editingDwelling ? "Update unit details and owner information" : "Add a new unit to the strata"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleDwellingSubmit} className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="unitNumber">Unit Number</Label>
                  <Input 
                    id="unitNumber" 
                    name="unitNumber" 
                    defaultValue={editingDwelling?.unitNumber} 
                    required 
                  />
                </div>
                <div>
                  <Label htmlFor="unitType">Unit Type</Label>
                  <Select name="unitType" defaultValue={editingDwelling?.unitType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select unit type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="studio">Studio</SelectItem>
                      <SelectItem value="one_bedroom">One Bedroom</SelectItem>
                      <SelectItem value="two_bedroom">Two Bedroom</SelectItem>
                      <SelectItem value="three_bedroom">Three Bedroom</SelectItem>
                      <SelectItem value="penthouse">Penthouse</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="feeTierId">Fee Tier</Label>
                  {feeTiers.length === 0 ? (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-3 border border-amber-200 bg-amber-50 rounded-md">
                        <div className="flex items-center gap-2 text-sm text-amber-800">
                          <span className="font-medium">No fee tiers set up yet</span>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Please <a href="/financial" className="text-green-600 hover:text-green-700 font-medium underline">set up fee tiers</a> in the Financial page first before adding units.
                      </p>
                    </div>
                  ) : (
                    <Select name="feeTierId" defaultValue={editingDwelling?.feeTierId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select fee tier" />
                      </SelectTrigger>
                      <SelectContent>
                        {feeTiers.map((tier: any) => (
                          <SelectItem key={tier.id} value={tier.id}>
                            {tier.name} - ${tier.amount}/month
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
              </div>
              
              <div className="space-y-4">
                <h4 className="font-medium">Owner Information</h4>
                <div>
                  <Label htmlFor="ownerName">Owner Name</Label>
                  <Input 
                    id="ownerName" 
                    name="ownerName" 
                    defaultValue={editingDwelling?.ownerName}
                    required 
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="ownerEmail">Email</Label>
                    <Input 
                      id="ownerEmail" 
                      name="ownerEmail" 
                      type="email"
                      defaultValue={editingDwelling?.ownerEmail}
                    />
                  </div>
                  <div>
                    <Label htmlFor="ownerPhone">Phone</Label>
                    <Input 
                      id="ownerPhone" 
                      name="ownerPhone" 
                      defaultValue={editingDwelling?.ownerPhone}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium">Unit Details</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="squareFootage">Square Footage</Label>
                    <Input 
                      id="squareFootage" 
                      name="squareFootage" 
                      type="number"
                      defaultValue={editingDwelling?.squareFootage}
                    />
                  </div>
                  <div>
                    <Label htmlFor="parkingSpaces">Parking Spaces</Label>
                    <Input 
                      id="parkingSpaces" 
                      name="parkingSpaces" 
                      type="number"
                      defaultValue={editingDwelling?.parkingSpaces}
                    />
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                disabled={createUnitMutation.isPending || updateUnitMutation.isPending || feeTiers.length === 0}
              >
                {editingDwelling
                  ? (updateUnitMutation.isPending ? "Updating..." : "Update Unit")
                  : (createUnitMutation.isPending ? "Creating..." : "Create Unit")
                }
              </Button>
              {feeTiers.length === 0 && (
                <p className="text-xs text-amber-600 font-medium">
                  Set up fee tiers before adding units
                </p>
              )}
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Units</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{units.length}</div>
            <p className="text-xs text-muted-foreground">Active dwelling units</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Occupied Units</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {units.filter((unit: any) => unit.ownerName).length}
            </div>
            <p className="text-xs text-muted-foreground">Units with registered owners</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Size</CardTitle>
            <Home className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {units.length > 0 
                ? Math.round(units.reduce((sum: number, unit: any) => sum + (unit.squareFootage || 0), 0) / units.length)
                : 0
              }
            </div>
            <p className="text-xs text-muted-foreground">Square feet per unit</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Parking Spaces</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {units.reduce((sum: number, unit: any) => sum + (unit.parkingSpaces || 0), 0)}
            </div>
            <p className="text-xs text-muted-foreground">Total parking spaces</p>
          </CardContent>
        </Card>
      </div>

      {/* Units Directory */}
      <Card>
        <CardHeader>
          <CardTitle>Unit Directory</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Desktop Table View - Optimized for no horizontal scroll */}
          <div className="hidden md:block overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-20">Unit</TableHead>
                  <TableHead className="w-32">Owner</TableHead>
                  <TableHead className="w-44">Contact</TableHead>
                  <TableHead className="w-24">Size</TableHead>
                  <TableHead className="w-20">Parking</TableHead>
                  <TableHead className="w-36">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {units.map((unit: any) => (
                  <TableRow key={unit.id}>
                    <TableCell className="font-medium text-sm">#{unit.unitNumber}</TableCell>
                    <TableCell className="text-sm">
                      <div>
                        <div className="font-medium">{unit.ownerName || 'N/A'}</div>
                        {unit.feeTierId ? (
                          <div className="text-xs text-muted-foreground">
                            {feeTiers.find((tier: any) => tier.id === unit.feeTierId)?.name || 'Unknown'}
                          </div>
                        ) : (
                          <Badge variant="secondary" className="text-xs">Unassigned</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-xs">
                      {unit.ownerEmail || unit.ownerPhone ? (
                        <div>
                          {unit.ownerEmail && <div className="truncate max-w-32">{unit.ownerEmail}</div>}
                          {unit.ownerPhone && <div>{unit.ownerPhone}</div>}
                        </div>
                      ) : 'N/A'}
                    </TableCell>
                    <TableCell className="text-xs">
                      {unit.squareFootage ? `${unit.squareFootage} sq ft` : 'N/A'}
                    </TableCell>
                    <TableCell className="text-xs">{unit.parkingSpaces || 0} spaces</TableCell>
                    <TableCell>
                      <div className="flex space-x-1">
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-blue-600 border-blue-600 hover:bg-blue-50 p-2"
                          onClick={() => handleEditDwelling(unit)}
                          title="Edit Unit"
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-green-600 border-green-600 hover:bg-green-50 p-2"
                          title="Documents"
                        >
                          <FileText className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600 border-red-600 hover:bg-red-50 p-2"
                          onClick={() => handleDeleteDwelling(unit)}
                          disabled={deleteUnitMutation.isPending}
                          title="Delete Unit"
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
          <div className="md:hidden space-y-4">
            {units.map((unit: any) => (
              <Card key={unit.id} className="border border-gray-200">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-lg">Unit {unit.unitNumber}</h3>
                      <Badge variant="outline" className="capitalize text-xs">
                        {unit.unitType?.replace('_', ' ')}
                      </Badge>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-blue-600 border-blue-600 hover:bg-blue-50 p-2"
                        onClick={() => handleEditDwelling(unit)}
                        title="Edit Unit"
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-green-600 border-green-600 hover:bg-green-50 p-2"
                        title="Documents"
                      >
                        <FileText className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600 border-red-600 hover:bg-red-50 p-2"
                        onClick={() => handleDeleteDwelling(unit)}
                        disabled={deleteUnitMutation.isPending}
                        title="Delete Unit"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Fee Tier:</span>
                      <div className="text-right">
                        {unit.feeTierId ? (
                          <div>
                            <div className="font-medium">
                              {feeTiers.find((tier: any) => tier.id === unit.feeTierId)?.name || 'Unknown'}
                            </div>
                            <div className="text-muted-foreground text-xs">
                              ${feeTiers.find((tier: any) => tier.id === unit.feeTierId)?.amount || 0}/month
                            </div>
                          </div>
                        ) : (
                          <Badge variant="secondary" className="text-xs">Unassigned</Badge>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Owner:</span>
                      <span className="font-medium">{unit.ownerName || 'N/A'}</span>
                    </div>
                    
                    {(unit.ownerEmail || unit.ownerPhone) && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Contact:</span>
                        <div className="text-right text-xs">
                          {unit.ownerEmail && <div>{unit.ownerEmail}</div>}
                          {unit.ownerPhone && <div>{unit.ownerPhone}</div>}
                        </div>
                      </div>
                    )}
                    
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Size:</span>
                      <span>{unit.squareFootage ? `${unit.squareFootage} sq ft` : 'N/A'}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Parking:</span>
                      <span>{unit.parkingSpaces || 0} spaces</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Unit</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete Unit {unitToDelete?.unitNumber}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700 text-white"
              disabled={deleteUnitMutation.isPending}
            >
              {deleteUnitMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}