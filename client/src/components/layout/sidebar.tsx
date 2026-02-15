import { Link, useLocation } from "wouter";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useStrata } from "@/lib/strata-context";
import { useQuery } from "@tanstack/react-query";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import type { Strata } from "@shared/schema";
import {
  Building,
  BarChart3,
  DollarSign,
  FileText,
  Users,
  Folder,
  Calendar,
  Wrench,
  ClipboardList,
  Megaphone,
  PieChart,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Shield,
  Settings,
  Bell,
  CreditCard
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import logoSvg from "@/assets/logo.jpg";
import { getUserAccessibleTabs } from "@shared/accessControl";
import type { UserRole } from "@shared/accessControl";
import { UserSettingsDialog } from "@/components/settings/user-settings-dialog";
import { NotificationSettingsDialog } from "@/components/settings/notification-settings-dialog";

const navigation = [
  { name: "Dashboard", href: "/", icon: BarChart3 },
  { name: "Financial", href: "/financial", icon: DollarSign },
  { name: "Quotes & Approvals", href: "/quotes", icon: FileText },
  { name: "Vendors", href: "/vendors", icon: Users },
  { name: "Dwellings", href: "/dwellings", icon: Building },
  { name: "Documents", href: "/documents", icon: Folder },
  { name: "Meetings", href: "/meetings", icon: Calendar },
  { name: "Maintenance", href: "/maintenance", icon: Wrench },
  { name: "Repair Requests", href: "/repair-requests", icon: ClipboardList },
  { name: "Community Hub", href: "/communications", icon: Megaphone },
  { name: "Reports", href: "/reports", icon: PieChart },
  { name: "Billing", href: "/billing", icon: CreditCard },
  { name: "Admin", href: "/strata-admin", icon: Shield },
  { name: "Master Admin", href: "/admin", icon: Settings },
];

export default function Sidebar() {
  const [location] = useLocation();
  const { user } = useAuth();
  const { selectedStrataId, availableStrata, setSelectedStrata } = useStrata();
  const { toast } = useToast();
  const [showProfileDetails, setShowProfileDetails] = useState(false);
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);
  const [showNotificationsDialog, setShowNotificationsDialog] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      toast({
        title: "Signed Out",
        description: "You have been signed out successfully.",
      });
      // Redirect to landing page after sign out
      window.location.href = "/";
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to sign out.",
        variant: "destructive",
      });
    }
  };

  // Close profile details when sidebar collapses
  useEffect(() => {
    if (isCollapsed) {
      setShowProfileDetails(false);
    }
  }, [isCollapsed]);

  // Use context for strata management
  const strataList = availableStrata;

  // Fetch user's role for the selected strata
  const { data: userRoleData, refetch: refetchUserRole } = useQuery<{ role: UserRole }>({
    queryKey: [`/api/strata/${selectedStrataId}/user-role`],
    enabled: !!user && !!selectedStrataId,
    staleTime: 0, // Always refetch
    gcTime: 0, // Don't cache (React Query v5 syntax)
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
    refetchInterval: 5000, // Refresh every 5 seconds to catch updates
  });

  // Force refetch when user or strata changes
  useEffect(() => {
    if (user && selectedStrataId) {
      refetchUserRole();
    }
  }, [user?.email, selectedStrataId, refetchUserRole]);

  // Helper function to get user's role for the selected strata
  const getUserRole = (): UserRole => {
    if (!user) return 'resident';
    
    // Special case for master admin (rfinnbogason@gmail.com)
    if (user.email === 'rfinnbogason@gmail.com') {
      return 'master_admin';
    }

    // ✅ SECURITY: Removed user role logging

    // Return fetched role or default to resident
    return userRoleData?.role || 'resident';
  };

  // Helper function to format role for display
  const formatRole = (role: UserRole): string => {
    return role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const currentRole = getUserRole();
  const accessibleTabs = getUserAccessibleTabs(currentRole);
  
  // Filter navigation based on user's accessible tabs
  const filteredNavigation = navigation.filter(item => {
    const tabName = item.href === '/' ? 'dashboard' : 
                   item.href === '/strata-admin' ? 'admin' :
                   item.href === '/admin' ? 'master_admin' :
                   item.href.substring(1);
    return accessibleTabs.includes(tabName as any);
  });

  return (
    <aside className={`${isCollapsed ? 'w-12' : 'w-64'} bg-sidebar-background text-sidebar-foreground flex-shrink-0 flex flex-col h-full transition-all duration-300 relative`}>
      {/* Header */}
      <div className={`p-4 m-4 bg-white border border-gray-200 rounded-lg ${isCollapsed ? 'mx-1 p-2' : ''} relative`}>
        {isCollapsed ? (
          <div className="flex justify-center">
            <img src={logoSvg} alt="Logo" className="h-8 w-8 object-contain" />
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <div className="flex items-center flex-1">
              <img src={logoSvg} alt="Logo" className="h-12 w-auto object-contain" />
            </div>
            {/* Collapse Toggle Button - Integrated into header */}
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md border border-gray-300 hover:border-gray-400"
              onClick={() => setIsCollapsed(!isCollapsed)}
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
          </div>
        )}
        {/* Collapse button for collapsed state */}
        {isCollapsed && (
          <Button
            variant="ghost"
            size="sm"
            className="absolute -right-2 top-1/2 -translate-y-1/2 h-6 w-6 p-0 bg-white border border-gray-200 rounded-full shadow-sm hover:bg-gray-50 text-gray-500"
            onClick={() => setIsCollapsed(!isCollapsed)}
          >
            <ChevronRight className="h-3 w-3" />
          </Button>
        )}
      </div>
      {/* Strata Selector */}
      {!isCollapsed && (
        <div className="px-4 mb-4">
          <Select value={selectedStrataId || ""} onValueChange={setSelectedStrata}>
            <SelectTrigger className="w-full bg-white border-gray-200 text-gray-700 hover:bg-gray-50">
              <SelectValue placeholder="Select a strata..." />
            </SelectTrigger>
            <SelectContent>
              {(strataList as Strata[]).map((strata) => (
                <SelectItem key={strata.id} value={strata.id}>
                  {strata.name} ({strata.unitCount} units)
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
      {/* Navigation */}
      <div className="flex-1 overflow-y-auto">
        <nav className={`${isCollapsed ? 'p-1' : 'p-4'}`}>
          <ul className={`${isCollapsed ? 'space-y-1 flex flex-col items-center' : 'space-y-1'}`}>
            {filteredNavigation
              .filter((item) => {
                // Only show Master Admin option for rfinnbogason@gmail.com
                if (item.name === "Master Admin") {
                  return user?.email === 'rfinnbogason@gmail.com';
                }
                // Only show Admin for users with admin permissions (strata-level admin)
                if (item.name === "Admin") {
                  return ['chairperson', 'property_manager', 'treasurer', 'secretary'].includes(currentRole);
                }
                return true;
              })
              .map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.name}>
                  <Link href={item.href} className={`flex items-center ${isCollapsed ? 'justify-center w-8 h-8' : 'px-4 py-3'} rounded-lg border transition-colors ${
                    location === item.href 
                      ? "bg-green-500 text-white border-green-500" 
                      : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                  }`} title={isCollapsed ? item.name : undefined}>
                    <Icon className={`${isCollapsed ? '' : 'mr-3'} h-4 w-4 flex-shrink-0`} />
                    {!isCollapsed && <span>{item.name}</span>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
      {/* User Profile Footer */}
      <div className="border-t border-sidebar-border p-0">
        <Button
          variant="ghost"
          className={`w-full inline-flex items-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 hover:text-accent-foreground ${isCollapsed ? 'p-2 justify-center' : 'p-3 justify-start'} h-auto bg-transparent hover:bg-gray-50 text-gray-700 rounded-none border-0`}
          onClick={() => setShowProfileDetails(!showProfileDetails)}
        >
          {isCollapsed ? (
            <Avatar className="h-8 w-8">
              <AvatarImage 
                src={user?.photoURL || ""} 
                alt={user?.displayName || user?.email || "User"}
                className="object-cover"
              />
              <AvatarFallback className="bg-green-500 text-white text-xs">
                {user?.displayName?.[0] || user?.email?.[0] || "U"}
              </AvatarFallback>
            </Avatar>
          ) : (
            <div className="flex items-center space-x-3 w-full">
              <Avatar className="h-10 w-10">
                <AvatarImage 
                  src={user?.photoURL || ""} 
                  alt={user?.displayName || user?.email || "User"}
                  className="object-cover"
                />
                <AvatarFallback className="bg-green-500 text-white">
                  {user?.displayName?.[0] || user?.email?.[0] || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0 text-left">
                <p className="text-sm font-medium text-gray-700 truncate">
                  {user?.displayName || user?.email || "User"}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {formatRole(currentRole)}
                </p>
              </div>
              {showProfileDetails ? (
                <ChevronDown className="h-4 w-4 text-gray-500" />
              ) : (
                <ChevronUp className="h-4 w-4 text-gray-500" />
              )}
            </div>
          )}
        </Button>

        {/* Expanded Profile Details */}
        {showProfileDetails && !isCollapsed && (
          <div className="px-3 pb-3 border-t border-gray-100">
            <div className="mt-3 space-y-2">
              {/* Quick Settings */}
              <div className="space-y-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start text-xs text-gray-600 hover:text-gray-700 hover:bg-gray-50 h-8"
                  onClick={() => setShowSettingsDialog(true)}
                >
                  <Settings className="h-3 w-3 mr-2" />
                  Account Settings
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start text-xs text-gray-600 hover:text-gray-700 hover:bg-gray-50 h-8"
                  onClick={() => setShowNotificationsDialog(true)}
                >
                  <Bell className="h-3 w-3 mr-2" />
                  Notification Settings
                </Button>
              </div>

              {/* User Info Compact */}
              <div className="bg-gray-50 rounded-lg p-2 text-xs text-gray-600 space-y-1">
                <div className="flex justify-between">
                  <span>Role:</span>
                  <span className="text-gray-700 font-medium">{formatRole(currentRole)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Strata:</span>
                  <span className="text-gray-700 font-medium truncate ml-2">
                    {strataList.find(s => s.id === (selectedStrataId || strataList[0]?.id))?.name || 'None'}
                  </span>
                </div>
              </div>

              {/* Logout Button */}
              <Button
                variant="outline"
                size="sm"
                className="w-full mt-2 bg-white border-gray-200 text-gray-700 hover:bg-gray-50 h-8"
                onClick={handleSignOut}
              >
                <LogOut className="h-3 w-3 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        )}
      </div>
      
      {/* Settings Dialogs */}
      <UserSettingsDialog
        isOpen={showSettingsDialog}
        onClose={() => setShowSettingsDialog(false)}
      />
      <NotificationSettingsDialog
        isOpen={showNotificationsDialog}
        onClose={() => setShowNotificationsDialog(false)}
      />
    </aside>
  );
}
