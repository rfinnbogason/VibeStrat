import { Card, CardContent } from "@/components/ui/card";
import { Building, DollarSign, Clock, Wrench } from "lucide-react";

interface MetricsCardsProps {
  metrics?: {
    totalProperties: number;
    outstandingFees: string;
    pendingApprovals: number;
    openMaintenance: number;
  };
}

export default function MetricsCards({ metrics }: MetricsCardsProps) {
  const defaultMetrics = {
    totalProperties: 0,
    outstandingFees: "$0",
    pendingApprovals: 0,
    openMaintenance: 0,
  };

  const data = metrics || defaultMetrics;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
      <Card className="metric-card text-white card-hover shadow-lg">
        <CardContent className="p-4 sm:p-5 lg:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-300 text-xs sm:text-sm">Total Properties</p>
              <p className="text-2xl sm:text-3xl font-bold mt-1 sm:mt-2">{data.totalProperties}</p>
            </div>
            <Building className="h-6 w-6 sm:h-8 sm:w-8 text-secondary" />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white shadow-lg card-hover border border-border">
        <CardContent className="p-4 sm:p-5 lg:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-xs sm:text-sm">Outstanding Fees</p>
              <p className="text-2xl sm:text-3xl font-bold text-foreground mt-1 sm:mt-2">{data.outstandingFees}</p>
            </div>
            <DollarSign className="h-6 w-6 sm:h-8 sm:w-8 text-accent" />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white shadow-lg card-hover border border-border">
        <CardContent className="p-4 sm:p-5 lg:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-xs sm:text-sm">Pending Approvals</p>
              <p className="text-2xl sm:text-3xl font-bold text-foreground mt-1 sm:mt-2">{data.pendingApprovals}</p>
            </div>
            <Clock className="h-6 w-6 sm:h-8 sm:w-8 text-accent" />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white shadow-lg card-hover border border-border">
        <CardContent className="p-4 sm:p-5 lg:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-xs sm:text-sm">Open Maintenance</p>
              <p className="text-2xl sm:text-3xl font-bold text-foreground mt-1 sm:mt-2">{data.openMaintenance}</p>
            </div>
            <Wrench className="h-6 w-6 sm:h-8 sm:w-8 text-secondary" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
