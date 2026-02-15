import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useStrata } from "@/lib/strata-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { 
  FileText, 
  Plus, 
  Search, 
  Filter,
  Calendar,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  Edit,
  Trash2,
  Users,
  Building,
  AlertTriangle,
  History,
  Archive,
  Upload,
  FileImage,
  Loader2,
  Sparkles
} from "lucide-react";

// Quote form schema
const quoteFormSchema = z.object({
  projectTitle: z.string().min(1, "Project title is required"),
  projectType: z.string().min(1, "Project type is required"),
  description: z.string().min(1, "Description is required"),
  scope: z.string().optional(),
  amount: z.string().min(1, "Amount is required"),
  priority: z.string().default("normal"),
  
  // Vendor information
  vendorName: z.string().min(1, "Vendor name is required"),
  vendorEmail: z.string().email("Valid email is required"),
  vendorPhone: z.string().min(1, "Phone number is required"),
  vendorAddress: z.string().optional(),
  vendorWebsite: z.string().optional(),
  vendorLicense: z.string().optional(),
  vendorInsurance: z.boolean().default(false),
  
  // Timeline
  validUntil: z.string().optional(),
  startDate: z.string().optional(),
  estimatedCompletion: z.string().optional(),
  
  // Terms
  warranty: z.string().optional(),
  paymentTerms: z.string().optional(),
  notes: z.string().optional(),
});

type QuoteFormData = z.infer<typeof quoteFormSchema>;

interface Quote {
  id: string;
  projectTitle: string;
  projectType: string;
  description: string;
  scope?: string;
  amount: string;
  vendorName?: string;
  vendorEmail?: string;
  vendorPhone?: string;
  status: string;
  priority: string;
  submittedAt: string;
  validUntil?: string;
  startDate?: string;
  estimatedCompletion?: string;
  warranty?: string;
  paymentTerms?: string;
  notes?: string;
  convertedToVendor: boolean;
  requesterId: string;
}

export default function Quotes() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showNewQuote, setShowNewQuote] = useState(false);
  const [selectedTab, setSelectedTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);
  const [showQuoteDetails, setShowQuoteDetails] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [customReason, setCustomReason] = useState("");
  
  // AI document analysis state
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadedDocumentData, setUploadedDocumentData] = useState<any>(null);

  // Get strata context
  const { selectedStrataId, selectedStrata, isLoading: strataLoading } = useStrata();

  const form = useForm<QuoteFormData>({
    resolver: zodResolver(quoteFormSchema),
    defaultValues: {
      projectTitle: "",
      projectType: "",
      description: "",
      scope: "",
      amount: "",
      priority: "normal",
      vendorName: "",
      vendorEmail: "",
      vendorPhone: "",
      vendorAddress: "",
      vendorWebsite: "",
      vendorLicense: "",
      vendorInsurance: false,
      validUntil: "",
      startDate: "",
      estimatedCompletion: "",
      warranty: "",
      paymentTerms: "",
      notes: "",
    },
  });

  // Document analysis function
  const analyzeDocument = async (file: File) => {
    // Check file size (limit to 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      toast({
        title: "File Too Large",
        description: "Please upload a file smaller than 10MB.",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const base64Data = reader.result as string;
          const response = await apiRequest('POST', '/api/quotes/analyze-document', {
            fileData: base64Data,
            mimeType: file.type
          });
          
          const extractedData = await response.json();

          console.log('🎯 Extracted data from AI:', extractedData);

          // Map backend field names to form field names
          const fieldMapping: Record<string, string> = {
            'hasLiabilityInsurance': 'vendorInsurance',
            'licenseNumber': 'vendorLicense',
          };

          // Pre-populate form with extracted data
          Object.entries(extractedData).forEach(([key, value]) => {
            // Map field name if needed
            const formFieldName = fieldMapping[key] || key;

            if (value !== null && value !== undefined && form.getValues()[formFieldName as keyof QuoteFormData] !== undefined) {
              console.log(`✅ Setting field ${formFieldName} = ${value}`);
              form.setValue(formFieldName as keyof QuoteFormData, value as any);
            }
          });

          // Store document data for later upload
          const reader2 = new FileReader();
          reader2.onload = () => {
            setUploadedDocumentData({
              fileUrl: reader2.result as string,
              fileName: file.name,
              fileSize: file.size,
              mimeType: file.type,
            });
          };
          reader2.readAsDataURL(file);
          
          toast({
            title: "Document Analyzed",
            description: "Quote information has been extracted and the document will be saved to the project folder.",
          });
        } catch (error) {
          console.error("Analysis error:", error);
          let errorMessage = "Could not extract information from the document. Please fill out the form manually.";
          
          if (error instanceof Error) {
            if (error.message.includes("413")) {
              errorMessage = "File is too large for processing. Please use a smaller file or fill out the form manually.";
            } else if (error.message.includes("quota exceeded")) {
              errorMessage = "AI analysis is temporarily unavailable due to quota limits. Please fill out the form manually.";
            } else if (error.message.includes("PDF analysis requires conversion")) {
              errorMessage = "PDF files need to be converted to images first. Please take a screenshot of your PDF or save it as JPG/PNG and upload that instead.";
            } else if (error.message.includes("OpenAI")) {
              errorMessage = "AI analysis service is currently unavailable. Please fill out the form manually.";
            }
          }
          
          toast({
            title: "Analysis Failed",
            description: errorMessage,
            variant: "destructive",
          });
        } finally {
          setIsAnalyzing(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (error) {
      setIsAnalyzing(false);
      toast({
        title: "Upload Failed",
        description: "Could not read the document file.",
        variant: "destructive",
      });
    }
  };

  // Handle file drop
  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    const file = files[0];
    if (file) {
      setUploadedFile(file);
      analyzeDocument(file);
    }
  };

  // Handle file input change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      analyzeDocument(file);
    }
  };

  // Fetch quotes
  const { data: quotes = [], isLoading } = useQuery<Quote[]>({
    queryKey: [`/api/strata/${selectedStrataId}/quotes`],
    enabled: !!selectedStrataId,
  });

  // Create quote mutation
  const createQuoteMutation = useMutation({
    mutationFn: async (data: QuoteFormData) => {
      await apiRequest('POST', `/api/strata/${selectedStrataId}/quotes`, {
        ...data,
        strataId: selectedStrataId,
        requesterId: user?.id,
        quoteDocument: uploadedDocumentData,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/strata/${selectedStrataId}/quotes`] });
      setShowNewQuote(false);
      form.reset();
      setUploadedFile(null);
      setUploadedDocumentData(null);
      toast({
        title: "Quote Request Submitted",
        description: uploadedFile 
          ? "The quote request and document have been submitted. A project folder has been created automatically."
          : "The quote request has been submitted successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to submit quote request. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Approve quote mutation
  const approveQuoteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest('PATCH', `/api/quotes/${id}`, {
        status: "approved",
        approvedBy: user?.id,
        approvedAt: new Date().toISOString(),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/strata/${selectedStrataId}/quotes`] });
      setShowQuoteDetails(false);
      toast({
        title: "Quote Approved",
        description: "Quote has been approved successfully.",
      });
    },
  });

  // Reject quote mutation
  const rejectQuoteMutation = useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason: string }) => {
      await apiRequest('PATCH', `/api/quotes/${id}`, {
        status: "rejected",
        rejectedBy: user?.id,
        rejectedAt: new Date().toISOString(),
        rejectionReason: reason,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/strata/${selectedStrataId}/quotes`] });
      setShowQuoteDetails(false);
      setShowRejectDialog(false);
      setRejectionReason("");
      setCustomReason("");
      toast({
        title: "Quote Rejected",
        description: "Quote has been rejected.",
      });
    },
  });

  const handleRejectSubmit = () => {
    if (!selectedQuote) return;
    
    const finalReason = rejectionReason === "other" ? customReason : rejectionReason;
    if (!finalReason.trim()) {
      toast({
        title: "Error",
        description: "Please provide a reason for rejection.",
        variant: "destructive",
      });
      return;
    }
    
    rejectQuoteMutation.mutate({ id: selectedQuote.id, reason: finalReason });
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      submitted: { variant: "secondary" as const, icon: Clock, color: "text-blue-600" },
      under_review: { variant: "outline" as const, icon: Eye, color: "text-yellow-600" },
      approved: { variant: "default" as const, icon: CheckCircle, color: "text-green-600" },
      rejected: { variant: "destructive" as const, icon: XCircle, color: "text-red-600" },
      expired: { variant: "secondary" as const, icon: AlertTriangle, color: "text-gray-600" },
    };
    
    const config = variants[status as keyof typeof variants] || variants.submitted;
    const Icon = config.icon;
    
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {status.replace('_', ' ').toUpperCase()}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const colors = {
      low: "bg-green-100 text-green-800",
      normal: "bg-blue-100 text-blue-800",
      high: "bg-orange-100 text-orange-800",
      urgent: "bg-red-100 text-red-800",
    };
    
    return (
      <Badge className={colors[priority as keyof typeof colors] || colors.normal}>
        {priority.toUpperCase()}
      </Badge>
    );
  };

  const filteredQuotes = (quotes as Quote[]).filter((quote: Quote) => {
    const matchesSearch = quote.projectTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         quote.vendorName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         quote.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === "all" || quote.status === filterStatus;
    
    const matchesTab = selectedTab === "all" || 
                      (selectedTab === "pending" && ["submitted", "under_review"].includes(quote.status)) ||
                      (selectedTab === "approved" && quote.status === "approved") ||
                      (selectedTab === "rejected" && quote.status === "rejected") ||
                      (selectedTab === "expired" && quote.status === "expired");
    
    return matchesSearch && matchesFilter && matchesTab;
  });

  const getTabCounts = () => {
    const quotesArray = quotes as Quote[];
    return {
      all: quotesArray.length,
      pending: quotesArray.filter((q: Quote) => ["submitted", "under_review"].includes(q.status)).length,
      approved: quotesArray.filter((q: Quote) => q.status === "approved").length,
      rejected: quotesArray.filter((q: Quote) => q.status === "rejected").length,
      expired: quotesArray.filter((q: Quote) => q.status === "expired").length,
    };
  };

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

  const tabCounts = getTabCounts();

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Quotes & Approvals</h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">
            Manage vendor quotes and approval workflows
          </p>
        </div>
        <Dialog open={showNewQuote} onOpenChange={setShowNewQuote}>
          <DialogTrigger asChild>
            <Button className="bg-secondary hover:bg-secondary/90 w-full sm:w-auto text-sm sm:text-base">
              <Plus className="mr-2 h-4 w-4" />
              Request Quote
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Request New Quote</DialogTitle>
              <DialogDescription>
                Submit a quote request from a vendor for project approval and tracking.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit((data) => createQuoteMutation.mutate(data))} className="space-y-6">
                {/* AI Document Upload Section */}
                <div className="border-2 border-dashed border-primary/30 rounded-lg p-6 bg-primary/5">
                  <div className="text-center space-y-4">
                    <div className="flex items-center justify-center gap-2 text-primary">
                      <Sparkles className="h-5 w-5" />
                      <h3 className="text-lg font-semibold">Load Quote Here</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Upload your quote document (PDF, JPG, PNG) under 10MB and AI will automatically extract and pre-populate the form information
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Supports PDF files (auto-converted) and image formats. Multiple conversion methods ensure reliable processing.
                    </p>
                    
                    {!isAnalyzing && !uploadedFile && (
                      <div
                        onDrop={handleFileDrop}
                        onDragOver={(e) => e.preventDefault()}
                        className="border-2 border-dashed border-gray-300 rounded-lg p-8 cursor-pointer hover:border-primary/50 transition-colors"
                      >
                        <div className="flex flex-col items-center gap-3">
                          <Upload className="h-8 w-8 text-gray-400" />
                          <div className="text-center">
                            <p className="text-sm font-medium">Drop your quote document here</p>
                            <p className="text-xs text-muted-foreground">or click to browse files</p>
                          </div>
                          <input
                            type="file"
                            accept="image/*,.pdf"
                            onChange={handleFileChange}
                            className="hidden"
                            id="quote-file-upload"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => document.getElementById('quote-file-upload')?.click()}
                          >
                            <FileImage className="mr-2 h-4 w-4" />
                            Browse Files
                          </Button>
                        </div>
                      </div>
                    )}
                    
                    {isAnalyzing && (
                      <div className="flex flex-col items-center gap-3 py-8">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        <p className="text-sm font-medium">Analyzing document with AI...</p>
                        <p className="text-xs text-muted-foreground">Extracting quote information</p>
                      </div>
                    )}
                    
                    {uploadedFile && !isAnalyzing && (
                      <div className="flex items-center justify-center gap-3 py-4">
                        <FileText className="h-5 w-5 text-green-600" />
                        <span className="text-sm font-medium text-green-700">
                          {uploadedFile.name} analyzed successfully
                        </span>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setUploadedFile(null);
                            form.reset();
                          }}
                        >
                          Upload New
                        </Button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Project Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Project Information</h3>
                    
                    <FormField
                      control={form.control}
                      name="projectTitle"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Project Title</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Elevator Maintenance" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="projectType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Project Type</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select project type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="maintenance">Regular Maintenance</SelectItem>
                              <SelectItem value="repair">Repair Work</SelectItem>
                              <SelectItem value="renovation">Renovation</SelectItem>
                              <SelectItem value="emergency">Emergency Service</SelectItem>
                              <SelectItem value="inspection">Inspection</SelectItem>
                              <SelectItem value="landscaping">Landscaping</SelectItem>
                              <SelectItem value="cleaning">Cleaning Services</SelectItem>
                              <SelectItem value="security">Security Services</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="priority"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Priority</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select priority" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="low">Low</SelectItem>
                              <SelectItem value="normal">Normal</SelectItem>
                              <SelectItem value="high">High</SelectItem>
                              <SelectItem value="urgent">Urgent</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Describe the work needed..." 
                              className="min-h-[100px]"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="scope"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Detailed Scope (Optional)</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Detailed scope of work, materials, specifications..." 
                              className="min-h-[100px]"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Vendor Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Vendor Information</h3>
                    
                    <FormField
                      control={form.control}
                      name="vendorName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Vendor/Company Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Company name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="vendorEmail"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Contact Email</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="vendor@company.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="vendorPhone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone Number</FormLabel>
                          <FormControl>
                            <Input placeholder="(555) 123-4567" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="vendorAddress"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Address (Optional)</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Business address..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="vendorWebsite"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Website (Optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="https://company.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="vendorLicense"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>License Number (Optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="License or certification number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="vendorInsurance"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Vendor has liability insurance</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Additional Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Quote Details</h3>
                    
                    <FormField
                      control={form.control}
                      name="amount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Estimated Amount</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              step="0.01" 
                              placeholder="0.00" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="validUntil"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Quote Valid Until (Optional)</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="warranty"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Warranty (Optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., 1 year parts and labor" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Timeline</h3>
                    
                    <FormField
                      control={form.control}
                      name="startDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Proposed Start Date (Optional)</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="estimatedCompletion"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Estimated Completion (Optional)</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="paymentTerms"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Payment Terms (Optional)</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Payment schedule, terms..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Quote Document Upload Section */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    <Label className="text-base font-medium">Quote Document</Label>
                    <Badge variant="secondary" className="text-xs">Optional</Badge>
                  </div>
                  
                  {!uploadedFile ? (
                    <div
                      className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center cursor-pointer hover:border-muted-foreground/50 transition-colors"
                      onDrop={handleFileDrop}
                      onDragOver={(e) => e.preventDefault()}
                      onClick={() => document.getElementById('quote-file-input')?.click()}
                    >
                      <div className="flex flex-col items-center gap-4">
                        <div className="p-3 rounded-full bg-muted">
                          <Upload className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="font-medium">Upload Quote Document</p>
                          <p className="text-sm text-muted-foreground mt-1">
                            Drag and drop or click to upload PDF, image, or document
                          </p>
                          <p className="text-xs text-muted-foreground mt-2">
                            AI will analyze the document and fill out form fields automatically
                          </p>
                        </div>
                      </div>
                      <input
                        id="quote-file-input"
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png,.webp,.gif,.doc,.docx,.txt"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </div>
                  ) : (
                    <div className="border rounded-lg p-4 bg-muted/50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <FileImage className="h-8 w-8 text-blue-600" />
                          <div>
                            <p className="font-medium">{uploadedFile.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {isAnalyzing && (
                            <div className="flex items-center gap-2 text-blue-600">
                              <Loader2 className="h-4 w-4 animate-spin" />
                              <span className="text-sm">Analyzing...</span>
                            </div>
                          )}
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setUploadedFile(null);
                              setUploadedDocumentData(null);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      {uploadedDocumentData && (
                        <div className="mt-3 p-3 bg-green-50 dark:bg-green-950/20 rounded-md">
                          <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
                            <Sparkles className="h-4 w-4" />
                            <span className="text-sm font-medium">Document will be saved to project folder</span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Additional Notes (Optional)</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Any additional information, special requirements..." 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end space-x-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setShowNewQuote(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={createQuoteMutation.isPending}
                  >
                    {createQuoteMutation.isPending ? "Submitting..." : "Submit Quote Request"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search quotes by project, vendor, or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-48">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="submitted">Submitted</SelectItem>
                <SelectItem value="under_review">Under Review</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Quotes Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <div className="w-full overflow-x-auto">
          <TabsList className="flex w-max min-w-full md:grid md:grid-cols-5 md:w-full">
            <TabsTrigger value="all" className="flex items-center gap-1 md:gap-2 text-xs md:text-sm whitespace-nowrap px-2 md:px-3">
              <FileText className="h-3 w-3 md:h-4 md:w-4" />
              <span className="hidden sm:inline">All</span> ({tabCounts.all})
            </TabsTrigger>
            <TabsTrigger value="pending" className="flex items-center gap-1 md:gap-2 text-xs md:text-sm whitespace-nowrap px-2 md:px-3">
              <Clock className="h-3 w-3 md:h-4 md:w-4" />
              <span className="hidden sm:inline">Pending</span> ({tabCounts.pending})
            </TabsTrigger>
            <TabsTrigger value="approved" className="flex items-center gap-1 md:gap-2 text-xs md:text-sm whitespace-nowrap px-2 md:px-3">
              <CheckCircle className="h-3 w-3 md:h-4 md:w-4" />
              <span className="hidden sm:inline">Approved</span> ({tabCounts.approved})
            </TabsTrigger>
            <TabsTrigger value="rejected" className="flex items-center gap-1 md:gap-2 text-xs md:text-sm whitespace-nowrap px-2 md:px-3">
              <XCircle className="h-3 w-3 md:h-4 md:w-4" />
              <span className="hidden sm:inline">Rejected</span> ({tabCounts.rejected})
            </TabsTrigger>
            <TabsTrigger value="expired" className="flex items-center gap-1 md:gap-2 text-xs md:text-sm whitespace-nowrap px-2 md:px-3">
              <Archive className="h-3 w-3 md:h-4 md:w-4" />
              <span className="hidden sm:inline">Expired</span> ({tabCounts.expired})
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value={selectedTab} className="mt-6">
          {isLoading ? (
            <Card>
              <CardContent className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="mt-4 text-muted-foreground">Loading quotes...</p>
              </CardContent>
            </Card>
          ) : filteredQuotes.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <FileText className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-xl font-semibold mb-2">No Quotes Found</h3>
                <p className="text-muted-foreground mb-4">
                  {selectedTab === "all" 
                    ? "No quotes have been submitted yet. Start by requesting your first quote."
                    : `No ${selectedTab} quotes found. Try adjusting your filters.`
                  }
                </p>
                {selectedTab === "all" && (
                  <Button onClick={() => setShowNewQuote(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Request Your First Quote
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {filteredQuotes.map((quote: Quote) => (
                <Card key={quote.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardContent className="p-4 md:p-6">
                    <div className="space-y-3">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
                        <div className="flex-1">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                            <h3 className="text-base md:text-lg font-semibold">{quote.projectTitle}</h3>
                            {getPriorityBadge(quote.priority)}
                          </div>
                          <p className="text-muted-foreground mb-3 text-sm md:text-base">{quote.description}</p>
                        </div>
                        <div className="flex items-center gap-2 self-start">
                          {getStatusBadge(quote.status)}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedQuote(quote);
                              setShowQuoteDetails(true);
                            }}
                            className="text-xs md:text-sm"
                          >
                            <Eye className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                            View
                          </Button>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4 text-xs md:text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Building className="h-3 w-3 md:h-4 md:w-4 flex-shrink-0" />
                          <span className="truncate">{quote.vendorName}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-3 w-3 md:h-4 md:w-4 flex-shrink-0" />
                          <span className="font-medium">${parseFloat(quote.amount || '0').toLocaleString()}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3 md:h-4 md:w-4 flex-shrink-0" />
                          <span>{new Date(quote.submittedAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    
                    {quote.convertedToVendor && (
                      <div className="flex items-center gap-2 mt-3 p-2 bg-green-50 rounded-lg">
                        <Users className="h-4 w-4 text-green-600" />
                        <span className="text-sm text-green-700">Converted to Approved Vendor</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Quote Details Dialog */}
      <Dialog open={showQuoteDetails} onOpenChange={setShowQuoteDetails}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Quote Details</DialogTitle>
            <DialogDescription>
              Review vendor quote information and manage approval status.
            </DialogDescription>
          </DialogHeader>
          {selectedQuote && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Project Information</h3>
                  <div className="space-y-3">
                    <div>
                      <Label className="text-sm font-medium">Project Title</Label>
                      <p className="text-sm text-muted-foreground">{selectedQuote.projectTitle}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Type</Label>
                      <p className="text-sm text-muted-foreground">{selectedQuote.projectType}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Description</Label>
                      <p className="text-sm text-muted-foreground">{selectedQuote.description}</p>
                    </div>
                    {selectedQuote.scope && (
                      <div>
                        <Label className="text-sm font-medium">Scope</Label>
                        <p className="text-sm text-muted-foreground">{selectedQuote.scope}</p>
                      </div>
                    )}
                    <div>
                      <Label className="text-sm font-medium">Amount</Label>
                      <p className="text-lg font-semibold">${parseFloat(selectedQuote.amount || '0').toLocaleString()}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Label className="text-sm font-medium">Status</Label>
                      {getStatusBadge(selectedQuote.status)}
                    </div>
                    <div className="flex items-center gap-2">
                      <Label className="text-sm font-medium">Priority</Label>
                      {getPriorityBadge(selectedQuote.priority)}
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4">Vendor Information</h3>
                  <div className="space-y-3">
                    <div>
                      <Label className="text-sm font-medium">Company</Label>
                      <p className="text-sm text-muted-foreground">{selectedQuote.vendorName}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Email</Label>
                      <p className="text-sm text-muted-foreground">{selectedQuote.vendorEmail}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Phone</Label>
                      <p className="text-sm text-muted-foreground">{selectedQuote.vendorPhone}</p>
                    </div>
                    {selectedQuote.warranty && (
                      <div>
                        <Label className="text-sm font-medium">Warranty</Label>
                        <p className="text-sm text-muted-foreground">{selectedQuote.warranty}</p>
                      </div>
                    )}
                    {selectedQuote.paymentTerms && (
                      <div>
                        <Label className="text-sm font-medium">Payment Terms</Label>
                        <p className="text-sm text-muted-foreground">{selectedQuote.paymentTerms}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {selectedQuote.notes && (
                <div>
                  <Label className="text-sm font-medium">Notes</Label>
                  <p className="text-sm text-muted-foreground mt-1">{selectedQuote.notes}</p>
                </div>
              )}

              {/* Project Documents Section */}
              <div className="pt-4 border-t">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-lg font-semibold">Project Documents</h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      // Navigate to Documents page with the project folder
                      window.open(`/documents?folder=${selectedQuote.id}`, '_blank');
                    }}
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    View Folder
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  A dedicated project folder has been created for this quote: <strong>"{selectedQuote.projectTitle}"</strong>
                </p>
              </div>

              <div className="flex justify-between space-x-3 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => {
                    window.open(`/documents?folder=${selectedQuote.id}`, '_blank');
                  }}
                >
                  <FileText className="mr-2 h-4 w-4" />
                  Open Documents
                </Button>
                
                {selectedQuote.status === "submitted" && (
                  <div className="flex space-x-3">
                    <Button
                      variant="outline"
                      onClick={() => setShowRejectDialog(true)}
                    >
                      <XCircle className="mr-2 h-4 w-4" />
                      Reject
                    </Button>
                    <Button
                      onClick={() => approveQuoteMutation.mutate(selectedQuote.id)}
                      disabled={approveQuoteMutation.isPending}
                    >
                      <CheckCircle className="mr-2 h-4 w-4" />
                      {approveQuoteMutation.isPending ? "Approving..." : "Approve"}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Rejection Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Reject Quote</DialogTitle>
            <DialogDescription>
              Please select a reason for rejecting this quote.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-3">
              <Label className="text-sm font-medium">Reason for Rejection</Label>
              <div className="space-y-2">
                {[
                  { value: "price_too_high", label: "Price too high" },
                  { value: "insufficient_credentials", label: "Insufficient credentials/licensing" },
                  { value: "scope_unclear", label: "Scope of work unclear" },
                  { value: "timeline_unacceptable", label: "Timeline unacceptable" },
                  { value: "no_insurance", label: "No liability insurance" },
                  { value: "better_quote_received", label: "Better quote received from another vendor" },
                  { value: "project_cancelled", label: "Project cancelled" },
                  { value: "vendor_unresponsive", label: "Vendor unresponsive" },
                  { value: "other", label: "Other (specify below)" },
                ].map((reason) => (
                  <div key={reason.value} className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id={reason.value}
                      name="rejectionReason"
                      value={reason.value}
                      checked={rejectionReason === reason.value}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      className="h-4 w-4 text-primary focus:ring-primary border-gray-300"
                    />
                    <Label htmlFor={reason.value} className="text-sm">
                      {reason.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {rejectionReason === "other" && (
              <div className="space-y-2">
                <Label htmlFor="customReason" className="text-sm font-medium">
                  Custom Reason
                </Label>
                <Textarea
                  id="customReason"
                  placeholder="Please specify the reason for rejection..."
                  value={customReason}
                  onChange={(e) => setCustomReason(e.target.value)}
                  className="min-h-[80px]"
                />
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              variant="outline"
              onClick={() => {
                setShowRejectDialog(false);
                setRejectionReason("");
                setCustomReason("");
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleRejectSubmit}
              disabled={!rejectionReason || (rejectionReason === "other" && !customReason.trim()) || rejectQuoteMutation.isPending}
            >
              {rejectQuoteMutation.isPending ? "Rejecting..." : "Reject Quote"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
