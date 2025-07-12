import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import {
  FileText,
  Download,
  Mail,
  DollarSign,
  Users,
  Building,
  Plus,
  Trash2,
  RefreshCw,
  PieChart
} from "lucide-react";

// Report generation form schema
const reportSchema = z.object({
  reportType: z.enum(['financial', 'meeting-minutes', 'communications', 'maintenance', 'home-sale-package']),
  title: z.string().min(1, "Title is required"),
  format: z.enum(['pdf', 'excel', 'html']).default('pdf'),
  dateRangeStart: z.string().optional(),
  dateRangeEnd: z.string().optional(),
  emailTo: z.string().optional(),
});

type Report = {
  id: string;
  reportType: string;
  title: string;
  dateRange?: { start: string; end: string };
  format: string;
  status: string;
  generatedBy: string;
  generatedAt: string;
  downloadUrl?: string;
  emailedTo?: string[];
};

const reportTypeInfo = {
  'financial': {
    icon: DollarSign,
    label: 'Financial Report',
    description: 'Income, expenses, fund balances, and financial summaries',
    color: 'text-green-600'
  },
  'meeting-minutes': {
    icon: Users,
    label: 'Meeting Minutes',
    description: 'All meeting records and minutes for specified period',
    color: 'text-blue-600'
  },
  'communications': {
    icon: Mail,
    label: 'Communications Report',
    description: 'Announcements, messages, and community communications',
    color: 'text-purple-600'
  },
  'maintenance': {
    icon: Building,
    label: 'Maintenance Report',
    description: 'Maintenance requests, projects, and vendor activities',
    color: 'text-orange-600'
  },
  'home-sale-package': {
    icon: FileText,
    label: 'Home Sale Package',
    description: 'Complete documentation package required for property sales',
    color: 'text-indigo-600'
  }
};

export default function Reports() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showGenerateDialog, setShowGenerateDialog] = useState(false);
  const [selectedReportType, setSelectedReportType] = useState<string>('');
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [selectedStrata, setSelectedStrata] = useState<any>(null);

  // Get strata list
  const { data: strataList } = useQuery<any[]>({
    queryKey: ["/api/strata"],
  });

  useEffect(() => {
    if (strataList && Array.isArray(strataList) && strataList.length > 0) {
      const savedStrata = localStorage.getItem('currentStrata');
      if (savedStrata) {
        try {
          setSelectedStrata(JSON.parse(savedStrata));
        } catch {
          setSelectedStrata(strataList[0]);
        }
      } else {
        setSelectedStrata(strataList[0]);
      }
    }
  }, [strataList]);

  // Fetch reports
  const { data: reports = [], isLoading: reportsLoading } = useQuery<Report[]>({
    queryKey: [`/api/strata/${selectedStrata?.id}/reports`],
    enabled: !!selectedStrata?.id,
  });

  const form = useForm<z.infer<typeof reportSchema>>({
    resolver: zodResolver(reportSchema),
    defaultValues: {
      reportType: 'financial',
      title: '',
      format: 'pdf',
      dateRangeStart: '',
      dateRangeEnd: '',
      emailTo: '',
    },
  });

  // Form submission handler
  const onSubmit = (data: z.infer<typeof reportSchema>) => {
    generateReportMutation.mutate(data);
  };

  // Generate report mutation
  const generateReportMutation = useMutation({
    mutationFn: async (data: z.infer<typeof reportSchema>) => {
      const response = await apiRequest('POST', `/api/strata/${selectedStrata?.id}/reports`, {
        ...data,
        dateRange: data.dateRangeStart && data.dateRangeEnd ? {
          start: data.dateRangeStart,
          end: data.dateRangeEnd
        } : undefined,
      });
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Report generation started" });
      queryClient.invalidateQueries({ queryKey: [`/api/strata/${selectedStrata?.id}/reports`] });
      setShowGenerateDialog(false);
      form.reset();
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to generate report", variant: "destructive" });
    },
  });

  // Delete report mutation
  const deleteReportMutation = useMutation({
    mutationFn: async (reportId: string) => {
      const response = await apiRequest('DELETE', `/api/reports/${reportId}`);
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Report deleted successfully" });
      queryClient.invalidateQueries({ queryKey: [`/api/strata/${selectedStrata?.id}/reports`] });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to delete report", variant: "destructive" });
    },
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
      case 'generating':
        return <Badge className="bg-blue-100 text-blue-800">Generating</Badge>;
      case 'failed':
        return <Badge className="bg-red-100 text-red-800">Failed</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">Pending</Badge>;
    }
  };

  if (!selectedStrata) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="text-center py-12">
            <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">No Strata Selected</h3>
            <p className="text-muted-foreground">
              Please select a strata to view and generate reports.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Reports</h1>
          <p className="text-muted-foreground mt-1">
            Generate and manage strata reports for {selectedStrata.name}
          </p>
        </div>
        <Dialog open={showGenerateDialog} onOpenChange={setShowGenerateDialog}>
          <DialogTrigger asChild>
            <Button className="w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              Generate Report
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Generate New Report</DialogTitle>
              <DialogDescription>
                Select the type of report you want to generate
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit((data) => generateReportMutation.mutate(data))} className="space-y-4">
                <FormField
                  control={form.control}
                  name="reportType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Report Type</FormLabel>
                      <Select onValueChange={(value) => {
                        field.onChange(value);
                        setSelectedReportType(value);
                        const typeInfo = reportTypeInfo[value as keyof typeof reportTypeInfo];
                        if (typeInfo) {
                          form.setValue('title', typeInfo.label + ' - ' + format(new Date(), 'MMM yyyy'));
                        }
                      }} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select report type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.entries(reportTypeInfo).map(([key, info]) => (
                            <SelectItem key={key} value={key}>
                              {info.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Report Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter report title" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {selectedReportType !== 'home-sale-package' && (
                  <>
                    <FormField
                      control={form.control}
                      name="dateRangeStart"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Start Date (Optional)</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="dateRangeEnd"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>End Date (Optional)</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </>
                )}

                <FormField
                  control={form.control}
                  name="format"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Format</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="pdf">PDF Document</SelectItem>
                          <SelectItem value="excel">Excel Spreadsheet</SelectItem>
                          <SelectItem value="html">Web Page</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="emailTo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email To (Optional)</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter email addresses separated by commas" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex gap-2 pt-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setShowGenerateDialog(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={generateReportMutation.isPending}
                    className="flex-1"
                  >
                    {generateReportMutation.isPending ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <FileText className="h-4 w-4 mr-2" />
                        Generate
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Quick Access Report Types */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.entries(reportTypeInfo).map(([key, info]) => {
          const IconComponent = info.icon;
          return (
            <Card key={key} className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => {
                    form.setValue('reportType', key as any);
                    form.setValue('title', info.label + ' - ' + format(new Date(), 'MMM yyyy'));
                    setSelectedReportType(key);
                    setShowGenerateDialog(true);
                  }}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <IconComponent className={`h-8 w-8 ${info.color}`} />
                  <div>
                    <h3 className="font-semibold">{info.label}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{info.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Reports Table */}
      <Card>
        <CardHeader>
          <CardTitle>Generated Reports</CardTitle>
          <CardDescription>
            View and manage your previously generated reports
          </CardDescription>
        </CardHeader>
        <CardContent>
          {reportsLoading ? (
            <div className="text-center py-8">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">Loading reports...</p>
            </div>
          ) : reports && Array.isArray(reports) && reports.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Report</TableHead>
                    <TableHead className="hidden sm:table-cell">Type</TableHead>
                    <TableHead className="hidden md:table-cell">Date Range</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="hidden sm:table-cell">Generated</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reports.map((report: Report) => {
                    const typeInfo = reportTypeInfo[report.reportType as keyof typeof reportTypeInfo];
                    const IconComponent = typeInfo?.icon || FileText;
                    
                    return (
                      <TableRow key={report.id} className={report.status === 'completed' ? 'cursor-pointer hover:bg-muted/50' : ''}>
                        <TableCell onClick={() => {
                          if (report.status === 'completed') {
                            setSelectedReport(report);
                            setShowViewDialog(true);
                          }
                        }}>
                          <div className="flex items-center gap-2">
                            <IconComponent className={`h-4 w-4 ${typeInfo?.color || 'text-gray-600'}`} />
                            <div>
                              <div className="font-medium">{report.title}</div>
                              <div className="text-sm text-muted-foreground capitalize">
                                {report.format} format
                                {report.status === 'completed' && <span className="ml-2 text-blue-600">• Click to view</span>}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          <Badge variant="outline">{typeInfo?.label || report.reportType}</Badge>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {report.dateRange ? (
                            <div className="text-sm">
                              {format(new Date(report.dateRange.start), 'MMM d')} - {format(new Date(report.dateRange.end), 'MMM d, yyyy')}
                            </div>
                          ) : (
                            <span className="text-muted-foreground">All time</span>
                          )}
                        </TableCell>
                        <TableCell>{getStatusBadge(report.status)}</TableCell>
                        <TableCell className="hidden sm:table-cell">
                          <div className="text-sm text-muted-foreground">
                            {format(new Date(report.generatedAt), 'MMM d, yyyy')}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            {report.status === 'completed' && report.downloadUrl && (
                              <Button size="sm" variant="ghost" asChild>
                                <a href={report.downloadUrl} download>
                                  <Download className="h-4 w-4" />
                                </a>
                              </Button>
                            )}
                            <Button 
                              size="sm" 
                              variant="ghost"
                              onClick={() => deleteReportMutation.mutate(report.id)}
                              disabled={deleteReportMutation.isPending}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8">
              <PieChart className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No Reports Generated</h3>
              <p className="text-muted-foreground mb-4">
                Generate your first report to get started
              </p>
              <Button onClick={() => setShowGenerateDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Generate Report
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Generate Report Dialog */}
      <Dialog open={showGenerateDialog} onOpenChange={setShowGenerateDialog}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Generate Report</DialogTitle>
            <DialogDescription>
              Create a new report for your strata community
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Report Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Financial Report - July 2025" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="dateRangeStart"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="dateRangeEnd"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>End Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="format"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Format</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select format" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="pdf">PDF</SelectItem>
                        <SelectItem value="excel">Excel</SelectItem>
                        <SelectItem value="html">HTML</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="emailTo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email To (Optional)</FormLabel>
                    <FormControl>
                      <Input 
                        type="email" 
                        placeholder="recipient@example.com" 
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      Leave empty to only generate the report without emailing
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setShowGenerateDialog(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={generateReportMutation.isPending}>
                  {generateReportMutation.isPending ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <FileText className="h-4 w-4 mr-2" />
                      Generate Report
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* View Report Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedReport?.title}</DialogTitle>
            <DialogDescription>
              Generated on {selectedReport && format(new Date(selectedReport.generatedAt), 'MMM d, yyyy')}
            </DialogDescription>
          </DialogHeader>
          
          <div className="mt-4">
            {selectedReport?.content ? (
              <div className="space-y-4">
                {selectedReport.reportType === 'financial' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Card>
                        <CardContent className="p-4">
                          <div className="text-sm text-muted-foreground">Monthly Income</div>
                          <div className="text-2xl font-bold text-green-600">
                            ${selectedReport.content.monthlyIncome?.toLocaleString() || '0'}
                          </div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4">
                          <div className="text-sm text-muted-foreground">Total Expenses</div>
                          <div className="text-2xl font-bold text-red-600">
                            ${selectedReport.content.totalExpenses?.toLocaleString() || '0'}
                          </div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4">
                          <div className="text-sm text-muted-foreground">Fund Balance</div>
                          <div className="text-2xl font-bold text-blue-600">
                            ${selectedReport.content.funds?.reduce((sum: number, fund: any) => sum + parseFloat(fund.balance || 0), 0).toLocaleString() || '0'}
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2">Recent Expenses</h4>
                      {selectedReport.content.expenses?.length > 0 ? (
                        <div className="space-y-2">
                          {selectedReport.content.expenses.slice(0, 5).map((expense: any) => (
                            <div key={expense.id} className="flex justify-between items-center p-2 bg-muted rounded">
                              <span>{expense.description}</span>
                              <span className="font-medium">${parseFloat(expense.amount).toLocaleString()}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-muted-foreground">No expenses in this period</p>
                      )}
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2">Fund Information</h4>
                      {selectedReport.content.funds?.length > 0 ? (
                        <div className="space-y-2">
                          {selectedReport.content.funds.map((fund: any) => (
                            <div key={fund.id} className="flex justify-between items-center p-2 bg-muted rounded">
                              <span>{fund.name} ({fund.type})</span>
                              <span className="font-medium">${parseFloat(fund.balance).toLocaleString()}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-muted-foreground">No funds configured</p>
                      )}
                    </div>
                  </div>
                )}
                
                {selectedReport.reportType !== 'financial' && (
                  <div className="p-4 bg-muted rounded">
                    <pre className="whitespace-pre-wrap text-sm">
                      {JSON.stringify(selectedReport.content, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Report content not available</p>
              </div>
            )}
          </div>
          
          <div className="flex justify-end gap-2 mt-4">
            {selectedReport?.downloadUrl && (
              <Button variant="outline" asChild>
                <a href={selectedReport.downloadUrl} download>
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </a>
              </Button>
            )}
            <Button onClick={() => setShowViewDialog(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}