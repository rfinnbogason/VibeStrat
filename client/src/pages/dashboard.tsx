import { useQuery } from "@tanstack/react-query";
import { useStrata } from "@/lib/strata-context";
import MetricsCards from "@/components/dashboard/metrics-cards";
import RecentActivity from "@/components/dashboard/recent-activity";
import QuickActions from "@/components/dashboard/quick-actions";
import PendingApprovals from "@/components/dashboard/pending-approvals";
import FinancialOverview from "@/components/dashboard/financial-overview";
import MaintenanceRequests from "@/components/dashboard/maintenance-requests";

export default function Dashboard() {
  const { selectedStrataId, selectedStrata, isLoading: strataLoading } = useStrata();

  const strataId = selectedStrataId;

  const { data: metrics, isLoading: metricsLoading } = useQuery<{
    totalProperties: number;
    outstandingFees: string;
    pendingApprovals: number;
    openMaintenance: number;
  }>({
    queryKey: [`/api/strata/${strataId}/metrics`],
    enabled: !!strataId,
  });

  if (strataLoading || metricsLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!strataId || !selectedStrata) {
    return (
      <div className="p-6">
        <div className="text-center text-gray-500">
          <p>Please select a strata organization to view the dashboard.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-6 space-y-6">
      {/* Header */}
      <div className="border-b pb-4">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">
          Overview for {selectedStrata.name}
        </p>
      </div>

      {/* Metrics Cards */}
      <MetricsCards 
        strataId={strataId}
        metrics={metrics}
      />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - 2/3 width */}
        <div className="lg:col-span-2 space-y-6">
          <FinancialOverview strataId={strataId} />
          <RecentActivity strataId={strataId} />
        </div>

        {/* Right Column - 1/3 width */}
        <div className="space-y-6">
          <QuickActions />
          <PendingApprovals strataId={strataId} />
          <MaintenanceRequests strataId={strataId} />
        </div>
      </div>
    </div>
  );
}