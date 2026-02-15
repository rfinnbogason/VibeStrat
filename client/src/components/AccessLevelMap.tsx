import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  ROLE_DESCRIPTIONS, 
  STANDARD_ACCESS, 
  TAB_DESCRIPTIONS, 
  ALL_TABS,
  UserRole,
  NavigationTab,
  getUserAccessibleTabs,
  getAvailableSpecialAccess
} from "@shared/accessControl";
import { 
  Shield, 
  Crown, 
  FileText, 
  Users, 
  Settings, 
  Home,
  DollarSign,
  Building,
  Folder,
  Calendar,
  Wrench,
  Megaphone,
  PieChart,
  BarChart3
} from "lucide-react";

const ROLE_ICONS: Record<UserRole, any> = {
  chairperson: Crown,
  treasurer: DollarSign,
  secretary: FileText,
  council_member: Shield,
  property_manager: Settings,
  resident: Home,
  admin: Settings
};

const TAB_ICONS: Record<NavigationTab, any> = {
  dashboard: BarChart3,
  financial: DollarSign,
  quotes: FileText,
  vendors: Users,
  dwellings: Building,
  documents: Folder,
  meetings: Calendar,
  maintenance: Wrench,
  communications: Megaphone,
  reports: PieChart,
  admin: Settings
};

export function AccessLevelMap() {
  const [activeTab, setActiveTab] = useState('matrix');
  const [selectedRole, setSelectedRole] = useState<UserRole>('chairperson');

  const roles: UserRole[] = ['chairperson', 'treasurer', 'secretary', 'council_member', 'property_manager', 'resident', 'admin'];

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex space-x-4 border-b border-gray-200 mb-6">
        <button
          className={`pb-2 px-1 border-b-2 font-medium text-sm ${
            activeTab === 'matrix' 
              ? 'border-green-500 text-green-600' 
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('matrix')}
        >
          Access Matrix
        </button>
        <button
          className={`pb-2 px-1 border-b-2 font-medium text-sm ${
            activeTab === 'roles' 
              ? 'border-green-500 text-green-600' 
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('roles')}
        >
          Role Details
        </button>
      </div>

      {/* Access Matrix Tab */}
      {activeTab === 'matrix' && (
        <div className="space-y-4">
          <div className="rounded-lg border bg-white overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="font-semibold text-gray-900 w-32">Role</TableHead>
                  {ALL_TABS.map((tab) => {
                    const Icon = TAB_ICONS[tab];
                    return (
                      <TableHead key={tab} className="text-center p-2 min-w-[80px]">
                        <div className="flex flex-col items-center space-y-1">
                          <Icon className="h-4 w-4 text-gray-600" />
                          <span className="text-xs font-medium text-gray-700 capitalize">
                            {tab.replace('_', ' ')}
                          </span>
                        </div>
                      </TableHead>
                    );
                  })}
                </TableRow>
              </TableHeader>
              <TableBody>
                {roles.map((role) => {
                  const Icon = ROLE_ICONS[role];
                  const accessibleTabs = STANDARD_ACCESS[role] || [];
                  
                  return (
                    <TableRow key={role} className="hover:bg-gray-50">
                      <TableCell className="font-medium">
                        <div className="flex items-center space-x-2">
                          <Icon className="h-4 w-4 text-gray-600" />
                          <span className="capitalize text-gray-900">
                            {role.replace('_', ' ')}
                          </span>
                        </div>
                      </TableCell>
                      {ALL_TABS.map((tab) => (
                        <TableCell key={tab} className="text-center p-2">
                          {accessibleTabs.includes(tab) ? (
                            <div className="w-6 h-6 bg-green-500 rounded-full mx-auto flex items-center justify-center">
                              <span className="text-white text-xs">✓</span>
                            </div>
                          ) : (
                            <div className="w-6 h-6 bg-gray-200 rounded-full mx-auto"></div>
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Legend</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">✓</span>
                  </div>
                  <span className="text-sm text-gray-700">Standard access included</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-gray-200 rounded-full"></div>
                  <span className="text-sm text-gray-700">Not included (can be granted as special access)</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Special Access</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  Any role can be granted additional access to tabs not included in their standard permissions. 
                  Use the user management interface to assign special access on a per-user basis.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Role Details Tab */}
      {activeTab === 'roles' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Role Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Select Role</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {roles.map((role) => {
                  const Icon = ROLE_ICONS[role];
                  return (
                    <Button
                      key={role}
                      variant={selectedRole === role ? "default" : "outline"}
                      className={`w-full justify-start ${
                        selectedRole === role 
                          ? "bg-green-500 hover:bg-green-600 text-white" 
                          : "hover:bg-gray-50"
                      }`}
                      onClick={() => setSelectedRole(role)}
                    >
                      <Icon className="mr-2 h-4 w-4" />
                      <span className="capitalize">{role.replace('_', ' ')}</span>
                    </Button>
                  );
                })}
              </CardContent>
            </Card>

            {/* Role Details */}
            <div className="lg:col-span-2 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    {(() => {
                      const Icon = ROLE_ICONS[selectedRole];
                      return <Icon className="h-5 w-5 text-green-500" />;
                    })()}
                    <span className="capitalize">{selectedRole.replace('_', ' ')}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">{ROLE_DESCRIPTIONS[selectedRole]}</p>
                  
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Standard Access</h4>
                      <div className="flex flex-wrap gap-2">
                        {getUserAccessibleTabs(selectedRole).map((tab) => {
                          const Icon = TAB_ICONS[tab];
                          return (
                            <Badge key={tab} variant="secondary" className="flex items-center space-x-1">
                              <Icon className="h-3 w-3" />
                              <span className="capitalize">{tab.replace('_', ' ')}</span>
                            </Badge>
                          );
                        })}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Available for Special Access</h4>
                      <div className="flex flex-wrap gap-2">
                        {getAvailableSpecialAccess(selectedRole).map((tab) => {
                          const Icon = TAB_ICONS[tab];
                          return (
                            <Badge key={tab} variant="outline" className="flex items-center space-x-1">
                              <Icon className="h-3 w-3" />
                              <span className="capitalize">{tab.replace('_', ' ')}</span>
                            </Badge>
                          );
                        })}
                      </div>
                      {getAvailableSpecialAccess(selectedRole).length === 0 && (
                        <p className="text-sm text-gray-500 italic">This role has access to all available tabs</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Tab Descriptions */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Tab Descriptions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {ALL_TABS.map((tab) => {
                      const Icon = TAB_ICONS[tab];
                      const hasAccess = getUserAccessibleTabs(selectedRole).includes(tab);
                      return (
                        <div key={tab} className={`flex items-start space-x-3 p-3 rounded-lg border ${
                          hasAccess ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
                        }`}>
                          <Icon className={`h-4 w-4 mt-0.5 ${hasAccess ? 'text-green-600' : 'text-gray-400'}`} />
                          <div>
                            <h5 className={`font-medium capitalize ${hasAccess ? 'text-green-900' : 'text-gray-600'}`}>
                              {tab.replace('_', ' ')}
                            </h5>
                            <p className={`text-sm ${hasAccess ? 'text-green-700' : 'text-gray-500'}`}>
                              {TAB_DESCRIPTIONS[tab]}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}