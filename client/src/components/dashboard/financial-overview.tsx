import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PieChart } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { useLocation } from "wouter";

interface FinancialOverviewProps {
  strataId: string;
}

interface FinancialSummary {
  totalRevenue: number;
  monthlyRevenue: number;
  monthlyExpenses: number;
  totalExpenses: number;
  reserveFund: number;
  reserveTarget: number;
  pendingExpenses: number;
  approvedExpenses: number;
  outstandingFees: number;
}

export default function FinancialOverview({ strataId }: FinancialOverviewProps) {
  const [, setLocation] = useLocation();
  
  // Fetch actual financial data from API
  const { data: summary, isLoading } = useQuery<FinancialSummary>({
    queryKey: [`/api/financial/summary/${strataId}`],
    enabled: !!strataId,
  });

  // Calculate derived values from API data
  const monthlyRevenue = summary?.monthlyRevenue || 0;
  const netIncome = monthlyRevenue - (summary?.monthlyExpenses || 0);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <Card className="bg-white shadow-lg border border-border">
      <CardHeader className="border-b border-border">
        <CardTitle className="flex items-center">
          <PieChart className="mr-3 h-5 w-5 text-secondary" />
          Financial Overview
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        {isLoading ? (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Monthly Revenue</span>
              <Skeleton className="h-4 w-16" />
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Monthly Expenses</span>
              <Skeleton className="h-4 w-16" />
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Reserve Fund</span>
              <Skeleton className="h-4 w-16" />
            </div>
            <div className="border-t border-border pt-4">
              <div className="flex justify-between items-center">
                <span className="text-foreground font-medium">Net Income</span>
                <Skeleton className="h-4 w-16" />
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Monthly Revenue</span>
              <span className="font-semibold text-foreground">{formatCurrency(monthlyRevenue)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Monthly Expenses</span>
              <span className="font-semibold text-foreground">{formatCurrency(summary?.monthlyExpenses || 0)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Reserve Fund</span>
              <span className="font-semibold text-foreground">{formatCurrency(summary?.reserveFund || 0)}</span>
            </div>
            <div className="border-t border-border pt-4">
              <div className="flex justify-between items-center">
                <span className="text-foreground font-medium">Net Income</span>
                <span className={`font-bold ${netIncome >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(netIncome)}
                </span>
              </div>
            </div>
          </div>
        )}
        
        <div className="mt-6 pt-6 border-t border-border">
          <Button 
            className="w-full bg-primary text-white hover:bg-primary/90"
            onClick={() => setLocation('/financial')}
          >
            View Detailed Reports
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
