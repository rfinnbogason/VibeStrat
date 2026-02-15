// Role-based access control definitions for the Strata Management Platform

export type UserRole = 
  | 'chairperson'
  | 'treasurer' 
  | 'secretary'
  | 'council_member'
  | 'property_manager'
  | 'resident'
  | 'admin'
  | 'master_admin';

export type NavigationTab =
  | 'dashboard'
  | 'financial'
  | 'quotes'
  | 'vendors'
  | 'dwellings'
  | 'documents'
  | 'meetings'
  | 'maintenance'
  | 'repair-requests'
  | 'communications'
  | 'reports'
  | 'billing'
  | 'admin'
  | 'master_admin';

// Standard access levels for each role
export const ROLE_DESCRIPTIONS: Record<UserRole, string> = {
  chairperson: "Leads the strata council, oversees all operations, and has full decision-making authority",
  treasurer: "Manages finances, budgets, fee collection, and financial reporting for the strata",
  secretary: "Handles meeting minutes, correspondence, records management, and administrative tasks",
  council_member: "Elected member who participates in council decisions and represents resident interests",
  property_manager: "Professional manager responsible for day-to-day operations and vendor coordination",
  resident: "Unit owner or tenant with limited access to view information and submit requests",
  admin: "System administrator with full access to all features and user management",
  master_admin: "Platform administrator with system-wide access to all strata organizations and global controls"
};

// Standard access permissions for each role
export const STANDARD_ACCESS: Record<UserRole, NavigationTab[]> = {
  chairperson: [
    'dashboard',
    'financial',
    'quotes',
    'vendors',
    'dwellings',
    'documents',
    'meetings',
    'maintenance',
    'repair-requests',
    'communications',
    'reports',
    'billing',
    'admin'
  ],
  treasurer: [
    'dashboard',
    'financial',
    'quotes',
    'vendors',
    'dwellings',
    'documents',
    'meetings',
    'reports',
    'billing'
  ],
  secretary: [
    'dashboard',
    'documents',
    'meetings',
    'communications',
    'dwellings',
    'reports',
    'billing'
  ],
  council_member: [
    'dashboard',
    'financial',
    'quotes',
    'documents',
    'meetings',
    'maintenance',
    'repair-requests',
    'communications',
    'reports',
    'billing'
  ],
  property_manager: [
    'dashboard',
    'financial',
    'quotes',
    'vendors',
    'dwellings',
    'documents',
    'meetings',
    'maintenance',
    'repair-requests',
    'communications',
    'reports',
    'billing'
  ],
  resident: [
    'dashboard',
    'documents',
    'meetings',
    'maintenance',
    'repair-requests',
    'communications',
    'billing'
  ],
  admin: [
    'dashboard',
    'financial',
    'quotes',
    'vendors',
    'dwellings',
    'documents',
    'meetings',
    'maintenance',
    'repair-requests',
    'communications',
    'reports',
    'billing',
    'admin'
  ],
  master_admin: [
    'dashboard',
    'financial',
    'quotes',
    'vendors',
    'dwellings',
    'documents',
    'meetings',
    'maintenance',
    'repair-requests',
    'communications',
    'reports',
    'billing',
    'admin',
    'master_admin'
  ]
};

// All available tabs for special access assignment
export const ALL_TABS: NavigationTab[] = [
  'dashboard',
  'financial',
  'quotes',
  'vendors',
  'dwellings',
  'documents',
  'meetings',
  'maintenance',
  'repair-requests',
  'communications',
  'reports',
  'billing',
  'admin',
  'master_admin'
];

// Tab descriptions for the access management interface
export const TAB_DESCRIPTIONS: Record<NavigationTab, string> = {
  dashboard: "Overview of key metrics, pending items, and strata status",
  financial: "Budget management, expenses, fee collection, and financial reports",
  quotes: "Vendor quote requests, approvals, and procurement management",
  vendors: "Contractor directory, ratings, and vendor relationship management",
  dwellings: "Unit information, owner details, and property specifications",
  documents: "File storage, bylaws, meeting minutes, and document management",
  meetings: "Meeting scheduling, agendas, minutes, and audio recordings",
  maintenance: "Repair requests, work orders, and maintenance tracking",
  "repair-requests": "Resident repair suggestions with admin approval workflow",
  communications: "Announcements, polls, discussions, and resident notifications",
  reports: "Financial reports, analytics, and compliance documentation",
  billing: "Subscription management, payment methods, and billing information",
  admin: "User management, role assignments, and system administration",
  master_admin: "System-wide platform administration with access to all strata organizations"
};

/**
 * Get the tabs a user should have access to based on their role and any special permissions
 */
export function getUserAccessibleTabs(
  role: UserRole, 
  specialAccess: NavigationTab[] = []
): NavigationTab[] {
  const standardTabs = STANDARD_ACCESS[role] || [];
  const combined = standardTabs.concat(specialAccess);
  const unique = combined.filter((tab, index) => combined.indexOf(tab) === index);
  return unique.sort((a, b) => {
    const aIndex = ALL_TABS.indexOf(a);
    const bIndex = ALL_TABS.indexOf(b);
    return aIndex - bIndex;
  });
}

/**
 * Check if a user has access to a specific tab
 */
export function hasTabAccess(
  role: UserRole,
  tab: NavigationTab,
  specialAccess: NavigationTab[] = []
): boolean {
  const accessibleTabs = getUserAccessibleTabs(role, specialAccess);
  return accessibleTabs.includes(tab);
}

/**
 * Get tabs that are available for special access (not in standard access for the role)
 */
export function getAvailableSpecialAccess(role: UserRole): NavigationTab[] {
  const standardTabs = STANDARD_ACCESS[role] || [];
  return ALL_TABS.filter(tab => !standardTabs.includes(tab));
}