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
import { useStrata } from "@/lib/strata-context";
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
  format: z.enum(['pdf', 'json', 'excel', 'html']).default('pdf'),
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
  const { selectedStrataId, selectedStrata, isLoading: strataLoading } = useStrata();
  const [showGenerateDialog, setShowGenerateDialog] = useState(false);
  const [selectedReportType, setSelectedReportType] = useState<string>('');
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [selectedReport, setSelectedReport] = useState<any>(null);

  // Fetch reports
  const { data: reports = [], isLoading: reportsLoading } = useQuery<Report[]>({
    queryKey: [`/api/strata/${selectedStrataId}/reports`],
    enabled: !!selectedStrataId,
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
      const response = await apiRequest('POST', `/api/strata/${selectedStrataId}/reports`, {
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
      queryClient.invalidateQueries({ queryKey: [`/api/strata/${selectedStrataId}/reports`] });
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
      queryClient.invalidateQueries({ queryKey: [`/api/strata/${selectedStrataId}/reports`] });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to delete report", variant: "destructive" });
    },
  });

  // Download report handler
  const handleDownloadReport = async (report: Report) => {
    try {
      console.log('Attempting to download report:', report.id);
      console.log('Report data:', report);

      const response = await apiRequest('GET', `/api/reports/${report.id}/download`);

      console.log('Download response status:', response.status);
      console.log('Download response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Download failed:', response.status, errorText);
        throw new Error(`Download failed: ${response.status} - ${errorText}`);
      }

      // Get the blob from the response
      const blob = await response.blob();
      console.log('Blob size:', blob.size, 'bytes');
      console.log('Blob type:', blob.type);

      // Create a download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;

      // Generate filename - all reports download as PDF
      const filename = `${report.title.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
      link.download = filename;

      console.log('Downloading as:', filename);

      // Trigger download
      document.body.appendChild(link);
      link.click();

      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast({ title: "Success", description: "Report downloaded successfully" });
    } catch (error: any) {
      console.error('Download error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to download report. Please try again.",
        variant: "destructive"
      });
    }
  };

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

  if (strataLoading || reportsLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-10 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-40 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!selectedStrata || !selectedStrataId) {
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
                          <SelectItem value="pdf">PDF Document (Available Now)</SelectItem>
                          <SelectItem value="json">JSON Data</SelectItem>
                          <SelectItem value="excel">Excel Spreadsheet (Coming Soon)</SelectItem>
                          <SelectItem value="html">Web Page (Coming Soon)</SelectItem>
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
                      <TableRow
                        key={report.id}
                        className={report.status === 'completed' ? 'cursor-pointer hover:bg-muted/50 transition-colors' : ''}
                        onClick={() => {
                          if (report.status === 'completed') {
                            setSelectedReport(report);
                            setShowViewDialog(true);
                          }
                        }}
                      >
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <IconComponent className={`h-4 w-4 ${typeInfo?.color || 'text-gray-600'}`} />
                            <div>
                              <div className="font-medium flex items-center gap-2">
                                {report.title}
                                {report.status === 'completed' && (
                                  <span className="text-xs text-blue-600 font-normal flex items-center gap-1">
                                    <FileText className="h-3 w-3" />
                                    Click to view details
                                  </span>
                                )}
                              </div>
                              <div className="text-sm text-muted-foreground capitalize">
                                {report.format} format
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
                              {(() => {
                                try {
                                  const start = report.dateRange.start;
                                  const end = report.dateRange.end;
                                  const startDate = start?.toDate ? start.toDate() : new Date(start);
                                  const endDate = end?.toDate ? end.toDate() : new Date(end);
                                  return `${format(startDate, 'MMM d')} - ${format(endDate, 'MMM d, yyyy')}`;
                                } catch (error) {
                                  return 'Invalid date range';
                                }
                              })()}
                            </div>
                          ) : (
                            <span className="text-muted-foreground">All time</span>
                          )}
                        </TableCell>
                        <TableCell>{getStatusBadge(report.status)}</TableCell>
                        <TableCell className="hidden sm:table-cell">
                          <div className="text-sm text-muted-foreground">
                            {(() => {
                              try {
                                const date = report.generatedAt;
                                if (!date) return 'N/A';

                                // Handle Firestore Timestamp
                                if (date?.toDate) {
                                  return format(date.toDate(), 'MMM d, yyyy');
                                }
                                // Handle Date object or string
                                return format(new Date(date), 'MMM d, yyyy');
                              } catch (error) {
                                console.error('Error formatting date:', error);
                                return 'Invalid date';
                              }
                            })()}
                          </div>
                        </TableCell>
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center gap-1">
                            {report.status === 'completed' && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDownloadReport(report);
                                }}
                                title="Download report"
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteReportMutation.mutate(report.id);
                              }}
                              disabled={deleteReportMutation.isPending}
                              title="Delete report"
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
                        <SelectItem value="pdf">PDF (Available Now)</SelectItem>
                        <SelectItem value="json">JSON</SelectItem>
                        <SelectItem value="excel">Excel (Coming Soon)</SelectItem>
                        <SelectItem value="html">HTML (Coming Soon)</SelectItem>
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
              Generated on {selectedReport && (() => {
                try {
                  const date = selectedReport.generatedAt;
                  const dateObj = date?.toDate ? date.toDate() : new Date(date);
                  return format(dateObj, 'MMM d, yyyy');
                } catch (error) {
                  return 'Unknown date';
                }
              })()}
            </DialogDescription>
          </DialogHeader>
          
          <div className="mt-4">
            {selectedReport?.content ? (
              <div className="space-y-6">
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
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Description</TableHead>
                              <TableHead>Category</TableHead>
                              <TableHead className="text-right">Amount</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {selectedReport.content.expenses.slice(0, 10).map((expense: any, index: number) => (
                              <TableRow key={expense.id || index}>
                                <TableCell>{expense.description || 'N/A'}</TableCell>
                                <TableCell className="capitalize">{expense.category || 'N/A'}</TableCell>
                                <TableCell className="text-right font-medium">
                                  ${parseFloat(expense.amount || 0).toLocaleString()}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      ) : (
                        <p className="text-muted-foreground">No expenses in this period</p>
                      )}
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2">Fund Information</h4>
                      {selectedReport.content.funds?.length > 0 ? (
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Fund Name</TableHead>
                              <TableHead>Type</TableHead>
                              <TableHead className="text-right">Balance</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {selectedReport.content.funds.map((fund: any, index: number) => (
                              <TableRow key={fund.id || index}>
                                <TableCell>{fund.name || 'N/A'}</TableCell>
                                <TableCell className="capitalize">{fund.type || 'N/A'}</TableCell>
                                <TableCell className="text-right font-medium text-blue-600">
                                  ${parseFloat(fund.balance || 0).toLocaleString()}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      ) : (
                        <p className="text-muted-foreground">No funds configured</p>
                      )}
                    </div>
                  </div>
                )}

                {selectedReport.reportType === 'meeting-minutes' && selectedReport.content.meetings && (
                  <div className="space-y-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="text-sm text-muted-foreground">Total Meetings</div>
                      <div className="text-3xl font-bold text-blue-600">
                        {selectedReport.content.meetings.length}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2">Meeting Records</h4>
                      {selectedReport.content.meetings.length > 0 ? (
                        <div className="space-y-3">
                          {selectedReport.content.meetings.map((meeting: any, index: number) => (
                            <Card key={meeting.id || index}>
                              <CardContent className="p-4">
                                <div className="flex justify-between items-start mb-2">
                                  <h5 className="font-semibold">{meeting.title || 'Untitled Meeting'}</h5>
                                  <Badge>{meeting.type || 'general'}</Badge>
                                </div>
                                <div className="text-sm text-muted-foreground space-y-1">
                                  <div>Date: {meeting.date ? format(new Date(meeting.date), 'MMM d, yyyy') : 'N/A'}</div>
                                  {meeting.location && <div>Location: {meeting.location}</div>}
                                  {meeting.attendees && <div>Attendees: {meeting.attendees.length}</div>}
                                  {meeting.status && <div className="capitalize">Status: {meeting.status}</div>}
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      ) : (
                        <p className="text-muted-foreground">No meetings in this period</p>
                      )}
                    </div>
                  </div>
                )}

                {selectedReport.reportType === 'home-sale-package' && (
                  <div className="space-y-4">
                    {selectedReport.content.documents && (
                      <div>
                        <h4 className="font-semibold mb-2">Documents</h4>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Document Name</TableHead>
                              <TableHead>Category</TableHead>
                              <TableHead>Status</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {selectedReport.content.documents.map((doc: any, index: number) => (
                              <TableRow key={doc.id || index}>
                                <TableCell>{doc.title || doc.name || 'Untitled'}</TableCell>
                                <TableCell className="capitalize">{doc.category || 'General'}</TableCell>
                                <TableCell>
                                  <Badge variant={doc.status === 'approved' ? 'default' : 'outline'}>
                                    {doc.status || 'Pending'}
                                  </Badge>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    )}

                    {selectedReport.content.bylaws && (
                      <div>
                        <h4 className="font-semibold mb-2">Bylaws</h4>
                        <p className="text-sm text-muted-foreground">
                          {selectedReport.content.bylaws.length} bylaw document(s) included
                        </p>
                      </div>
                    )}

                    {selectedReport.content.financialStatements && (
                      <div>
                        <h4 className="font-semibold mb-2">Financial Statements</h4>
                        <p className="text-sm text-muted-foreground">
                          Financial statements for the requested period included
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Generic report view for other types */}
                {!['financial', 'meeting-minutes', 'home-sale-package'].includes(selectedReport.reportType) && (
                  <div className="space-y-4">
                    <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg">
                      <div className="flex items-start gap-2">
                        <FileText className="h-5 w-5 text-amber-600 mt-0.5" />
                        <div>
                          <h4 className="font-semibold text-amber-900 mb-1">Report Data Preview</h4>
                          <p className="text-sm text-amber-700">
                            This report contains structured data. PDF generation is not yet implemented for this report type.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Display summary if available */}
                    {selectedReport.content.summary && (
                      <Card>
                        <CardHeader>
                          <CardTitle>Summary</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          {Object.entries(selectedReport.content.summary).map(([key, value]: [string, any]) => (
                            <div key={key} className="flex justify-between items-center">
                              <span className="text-sm text-muted-foreground capitalize">
                                {key.replace(/([A-Z])/g, ' $1').trim()}:
                              </span>
                              <span className="font-medium">{value}</span>
                            </div>
                          ))}
                        </CardContent>
                      </Card>
                    )}

                    {/* Display documents if available */}
                    {selectedReport.content.documents && Array.isArray(selectedReport.content.documents) && (
                      <div>
                        <h4 className="font-semibold mb-2">Documents ({selectedReport.content.documents.length})</h4>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Name</TableHead>
                              <TableHead>Details</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {selectedReport.content.documents.map((doc: any, index: number) => (
                              <TableRow key={index}>
                                <TableCell>{doc.name || doc.title || `Document ${index + 1}`}</TableCell>
                                <TableCell className="text-sm text-muted-foreground">
                                  {doc.category || doc.type || 'N/A'}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    )}

                    {/* Display other report data */}
                    {Object.keys(selectedReport.content).filter(key =>
                      !['summary', 'documents', 'generatedDate'].includes(key)
                    ).map(key => (
                      <div key={key}>
                        <h4 className="font-semibold mb-2 capitalize">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </h4>
                        {typeof selectedReport.content[key] === 'object' ? (
                          <pre className="text-xs bg-muted p-3 rounded overflow-auto max-h-60">
                            {JSON.stringify(selectedReport.content[key], null, 2)}
                          </pre>
                        ) : (
                          <p className="text-sm">{selectedReport.content[key]}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground mb-2">Report content not available</p>
                <p className="text-xs text-muted-foreground">The report may still be generating or failed to generate</p>
              </div>
            )}
          </div>
          
          <div className="flex justify-end gap-2 mt-4">
            {selectedReport?.status === 'completed' && (
              <Button
                variant="outline"
                onClick={() => handleDownloadReport(selectedReport)}
              >
                <Download className="h-4 w-4 mr-2" />
                Download
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