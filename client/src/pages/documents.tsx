import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { isUnauthorizedError } from "@/lib/authUtils";
import { 
  Folder, 
  Upload, 
  Search, 
  MoreHorizontal, 
  FileText, 
  Download, 
  Eye,
  Trash2,
  FolderPlus,
  ChevronRight,
  Home,
  Calendar,
  FileIcon,
  X
} from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

interface DocumentFolder {
  id: string;
  name: string;
  description?: string;
  parentFolderId?: string;
  path: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

interface Document {
  id: string;
  title: string;
  description?: string;
  type: string;
  fileName: string;
  fileUrl: string;
  fileSize?: number;
  mimeType?: string;
  version: string;
  tags?: string[];
  folderId?: string;
  uploadedBy: string;
  createdAt: string;
  updatedAt: string;
}

const folderSchema = z.object({
  name: z.string().min(1, "Folder name is required"),
  description: z.string().optional(),
  parentFolderId: z.string().optional(),
});

const documentSchema = z.object({
  title: z.string().min(1, "Document title is required"),
  description: z.string().optional(),
  type: z.string().min(1, "Document type is required"),
  tags: z.string().optional(),
  folderId: z.string().optional(),
});

export default function Documents() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [folderPath, setFolderPath] = useState<DocumentFolder[]>([]);
  const [showCreateFolder, setShowCreateFolder] = useState(false);
  const [showUploadDocument, setShowUploadDocument] = useState(false);
  const [folders, setFolders] = useState<DocumentFolder[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [searchResults, setSearchResults] = useState<{folders: DocumentFolder[], documents: Document[]}>({folders: [], documents: []});
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  // Get current strata
  const { data: strata = [] } = useQuery({ 
    queryKey: ["/api/strata"],
    enabled: isAuthenticated 
  });
  const currentStrata = Array.isArray(strata) && strata.length > 0 ? strata[0] : null;

  // Forms
  const folderForm = useForm<z.infer<typeof folderSchema>>({
    resolver: zodResolver(folderSchema),
    defaultValues: { name: "", description: "", parentFolderId: currentFolderId || undefined },
  });

  const documentForm = useForm<z.infer<typeof documentSchema>>({
    resolver: zodResolver(documentSchema),
    defaultValues: { 
      title: "", 
      description: "", 
      type: "",
      tags: "",
      folderId: currentFolderId || undefined 
    },
  });

  // Fetch functions
  const fetchFolders = async () => {
    if (!currentStrata?.id) return;
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (currentFolderId) params.set("parent", currentFolderId);
      const response = await apiRequest("GET", `/api/strata/${currentStrata.id}/document-folders?${params}`);
      const data = await response.json();
      setFolders(data || []);
    } catch (error) {
      console.error("Error fetching folders:", error);
      setFolders([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchDocuments = async () => {
    if (!currentStrata?.id) return;
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (currentFolderId) params.set("folder", currentFolderId);
      if (searchTerm) params.set("search", searchTerm);
      const response = await apiRequest("GET", `/api/strata/${currentStrata.id}/documents?${params}`);
      const data = await response.json();
      setDocuments(data || []);
    } catch (error) {
      console.error("Error fetching documents:", error);
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  };

  const searchContent = async () => {
    if (!currentStrata?.id || !searchTerm) {
      setSearchResults({folders: [], documents: []});
      return;
    }
    try {
      const response = await fetch(`/api/strata/${currentStrata.id}/search?q=${encodeURIComponent(searchTerm)}`);
      if (response.ok) {
        const data = await response.json();
        setSearchResults(data);
      }
    } catch (error) {
      console.error("Error searching:", error);
    }
  };

  // Mutations
  const createFolderMutation = useMutation({
    mutationFn: async (data: z.infer<typeof folderSchema>) => {
      return await apiRequest("POST", `/api/strata/${currentStrata?.id}/document-folders`, {
        ...data, 
        parentFolderId: currentFolderId
      });
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Folder created successfully" });
      fetchFolders();
      setShowCreateFolder(false);
      folderForm.reset();
    },
    onError: (error) => {
      if (error.message.includes("401")) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => window.location.href = "/api/login", 500);
        return;
      }
      toast({ title: "Error", description: "Failed to create folder", variant: "destructive" });
    },
  });

  const createDocumentMutation = useMutation({
    mutationFn: async (data: z.infer<typeof documentSchema>) => {
      if (!selectedFile) throw new Error("No file selected");
      
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('title', data.title);
      formData.append('type', data.type);
      if (data.description) formData.append('description', data.description);
      if (data.tags) formData.append('tags', data.tags);
      if (currentFolderId) formData.append('folderId', currentFolderId);
      
      // EMERGENCY ROUTE - BYPASS MIDDLEWARE ISSUES
      console.log('🚨 Using emergency upload route');
      const response = await apiRequest("POST", `/api/emergency-upload/${currentStrata?.id}`, formData);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create document");
      }
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Document uploaded successfully" });
      fetchDocuments();
      setShowUploadDocument(false);
      setSelectedFile(null);
      documentForm.reset();
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => window.location.href = "/api/login", 500);
        return;
      }
      toast({ title: "Error", description: "Failed to upload document", variant: "destructive" });
    },
  });

  const deleteFolderMutation = useMutation({
    mutationFn: async (folderId: string) => {
      const response = await apiRequest("DELETE", `/api/document-folders/${folderId}`);
      if (!response.ok) throw new Error("Failed to delete folder");
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Folder deleted successfully" });
      fetchFolders();
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => window.location.href = "/api/login", 500);
        return;
      }
      toast({ title: "Error", description: "Failed to delete folder", variant: "destructive" });
    },
  });

  const deleteDocumentMutation = useMutation({
    mutationFn: async (documentId: string) => {
      const response = await apiRequest("DELETE", `/api/documents/${documentId}`);
      if (!response.ok) throw new Error("Failed to delete document");
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Document deleted successfully" });
      fetchDocuments();
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => window.location.href = "/api/login", 500);
        return;
      }
      toast({ title: "Error", description: "Failed to delete document", variant: "destructive" });
    },
  });

  // Effects
  useEffect(() => {
    if (currentStrata?.id) {
      fetchFolders();
      fetchDocuments();
    }
  }, [currentStrata?.id, currentFolderId]);

  useEffect(() => {
    if (searchTerm) {
      searchContent();
    } else {
      setSearchResults({folders: [], documents: []});
    }
  }, [searchTerm, currentStrata?.id]);

  // Navigation helpers
  const navigateToFolder = (folder: DocumentFolder) => {
    setCurrentFolderId(folder.id);
    
    // Build folder path
    const newPath = [...folderPath];
    const existingIndex = newPath.findIndex(f => f.id === folder.id);
    if (existingIndex >= 0) {
      setFolderPath(newPath.slice(0, existingIndex + 1));
    } else {
      newPath.push(folder);
      setFolderPath(newPath);
    }
  };

  const navigateToRoot = () => {
    setCurrentFolderId(null);
    setFolderPath([]);
  };

  const navigateToPath = (pathIndex: number) => {
    if (pathIndex === -1) {
      navigateToRoot();
    } else {
      const folder = folderPath[pathIndex];
      setCurrentFolderId(folder.id);
      setFolderPath(folderPath.slice(0, pathIndex + 1));
    }
  };

  // Auto-redirect unauthorized users
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => window.location.href = "/api/login", 500);
    }
  }, [isAuthenticated, isLoading, toast]);

  if (isLoading || !isAuthenticated) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading document library...</p>
        </div>
      </div>
    );
  }

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "Unknown size";
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + " " + sizes[i];
  };

  const getFileIcon = (mimeType?: string) => {
    if (!mimeType) return FileIcon;
    if (mimeType.includes("pdf")) return FileText;
    if (mimeType.includes("image")) return Eye;
    if (mimeType.includes("video")) return Eye;
    return FileIcon;
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Document Library</h1>
          <p className="text-muted-foreground mt-1">
            Secure storage and management of important documents
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog open={showCreateFolder} onOpenChange={setShowCreateFolder}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <FolderPlus className="mr-2 h-4 w-4" />
                New Folder
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Folder</DialogTitle>
              </DialogHeader>
              <Form {...folderForm}>
                <form onSubmit={folderForm.handleSubmit((data) => createFolderMutation.mutate(data))} className="space-y-4">
                  <FormField
                    control={folderForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Folder Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter folder name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={folderForm.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description (Optional)</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Enter folder description" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex gap-2 justify-end">
                    <Button type="button" variant="outline" onClick={() => setShowCreateFolder(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={createFolderMutation.isPending}>
                      {createFolderMutation.isPending ? "Creating..." : "Create Folder"}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>

          <Dialog open={showUploadDocument} onOpenChange={setShowUploadDocument}>
            <DialogTrigger asChild>
              <Button className="bg-secondary hover:bg-secondary/90">
                <Upload className="mr-2 h-4 w-4" />
                Upload Document
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Upload Document</DialogTitle>
              </DialogHeader>
              <Form {...documentForm}>
                <form onSubmit={documentForm.handleSubmit((data) => {
                  if (!selectedFile) {
                    toast({ title: "Error", description: "Please select a file to upload", variant: "destructive" });
                    return;
                  }
                  createDocumentMutation.mutate(data);
                })} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={documentForm.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Document Title</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter document title" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={documentForm.control}
                      name="type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Document Type</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="financial">Financial</SelectItem>
                              <SelectItem value="legal">Legal</SelectItem>
                              <SelectItem value="maintenance">Maintenance</SelectItem>
                              <SelectItem value="meeting">Meeting</SelectItem>
                              <SelectItem value="policy">Policy</SelectItem>
                              <SelectItem value="insurance">Insurance</SelectItem>
                              <SelectItem value="contract">Contract</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={documentForm.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description (Optional)</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Enter document description" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {/* File Upload */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Choose File
                      </label>
                      <div 
                        className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors"
                        onDragOver={(e) => {
                          e.preventDefault();
                          e.currentTarget.classList.add('border-blue-400', 'bg-blue-50');
                        }}
                        onDragLeave={(e) => {
                          e.preventDefault();
                          e.currentTarget.classList.remove('border-blue-400', 'bg-blue-50');
                        }}
                        onDrop={(e) => {
                          e.preventDefault();
                          e.currentTarget.classList.remove('border-blue-400', 'bg-blue-50');
                          const file = e.dataTransfer.files?.[0];
                          if (file) {
                            // Validate file size (10MB limit)
                            if (file.size > 10 * 1024 * 1024) {
                              toast({ title: "Error", description: "File size must be less than 10MB", variant: "destructive" });
                              return;
                            }
                            setSelectedFile(file);
                            // Auto-fill title if empty
                            if (!documentForm.getValues('title')) {
                              documentForm.setValue('title', file.name.split('.')[0]);
                            }
                          }
                        }}
                      >
                        <input
                          type="file"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              // Validate file size (10MB limit)
                              if (file.size > 10 * 1024 * 1024) {
                                toast({ title: "Error", description: "File size must be less than 10MB", variant: "destructive" });
                                return;
                              }
                              setSelectedFile(file);
                              // Auto-fill title if empty
                              if (!documentForm.getValues('title')) {
                                documentForm.setValue('title', file.name.split('.')[0]);
                              }
                            }
                          }}
                          className="hidden"
                          id="file-upload"
                          accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg,.gif,.xls,.xlsx,.csv"
                        />
                        <label htmlFor="file-upload" className="cursor-pointer block">
                          <Upload className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                          {selectedFile ? (
                            <div className="space-y-2">
                              <p className="text-sm font-medium text-green-600">
                                {selectedFile.name}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {formatFileSize(selectedFile.size)} • {selectedFile.type}
                              </p>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={(e) => {
                                  e.preventDefault();
                                  setSelectedFile(null);
                                }}
                                className="mt-2"
                              >
                                <X className="h-4 w-4 mr-1" />
                                Remove
                              </Button>
                            </div>
                          ) : (
                            <div>
                              <p className="text-sm font-medium">Click to upload or drag and drop</p>
                              <p className="text-xs text-muted-foreground">
                                PDF, DOC, TXT, images, or spreadsheets up to 10MB
                              </p>
                            </div>
                          )}
                        </label>
                      </div>
                    </div>
                  </div>
                  <FormField
                    control={documentForm.control}
                    name="tags"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tags (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="budget, 2024, financial (comma separated)" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex gap-2 justify-end">
                    <Button type="button" variant="outline" onClick={() => {
                      setShowUploadDocument(false);
                      setSelectedFile(null);
                      documentForm.reset();
                    }}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={createDocumentMutation.isPending || !selectedFile}>
                      {createDocumentMutation.isPending ? "Uploading..." : "Upload Document"}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Search and Navigation */}
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search documents and folders..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
          {searchTerm && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
              onClick={() => setSearchTerm("")}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Breadcrumb Navigation */}
        {!searchTerm && (
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Button
              variant="ghost"
              size="sm"
              onClick={navigateToRoot}
              className="p-1 h-auto"
            >
              <Home className="h-4 w-4" />
            </Button>
            {folderPath.map((folder, index) => (
              <div key={folder.id} className="flex items-center space-x-2">
                <ChevronRight className="h-4 w-4" />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigateToPath(index)}
                  className="p-1 h-auto"
                >
                  {folder.name}
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="grid gap-6">
        {searchTerm ? (
          // Search Results
          <div className="space-y-6">
            {searchResults.folders.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Folder className="h-5 w-5" />
                    Folders ({searchResults.folders.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3">
                    {searchResults.folders.map((folder) => (
                      <div
                        key={folder.id}
                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                        onClick={() => navigateToFolder(folder)}
                      >
                        <div className="flex items-center gap-3">
                          <Folder className="h-5 w-5 text-blue-500" />
                          <div>
                            <p className="font-medium">{folder.name}</p>
                            <p className="text-sm text-muted-foreground">{folder.path}</p>
                          </div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" onClick={(e) => e.stopPropagation()}>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem onClick={(e) => {
                              e.stopPropagation();
                              navigateToFolder(folder);
                            }}>
                              <Eye className="mr-2 h-4 w-4" />
                              Open
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteFolderMutation.mutate(folder.id);
                              }}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {searchResults.documents.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Documents ({searchResults.documents.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3">
                    {searchResults.documents.map((document) => {
                      const FileIconComponent = getFileIcon(document.mimeType);
                      return (
                        <div
                          key={document.id}
                          className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <FileIconComponent className="h-5 w-5 text-gray-500" />
                            <div className="flex-1">
                              <p className="font-medium">{document.title}</p>
                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <span>{document.fileName}</span>
                                <span>{formatFileSize(document.fileSize)}</span>
                                <span>v{document.version}</span>
                                <span className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  {new Date(document.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                              {document.tags && document.tags.length > 0 && (
                                <div className="flex gap-1 mt-1">
                                  {document.tags.map((tag) => (
                                    <Badge key={tag} variant="secondary" className="text-xs">
                                      {tag}
                                    </Badge>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <DropdownMenuItem onClick={() => window.open(document.fileUrl, '_blank')}>
                                <Eye className="mr-2 h-4 w-4" />
                                View
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => window.open(document.fileUrl, '_blank')}>
                                <Download className="mr-2 h-4 w-4" />
                                Download
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-destructive"
                                onClick={() => deleteDocumentMutation.mutate(document.id)}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            {searchResults.folders.length === 0 && searchResults.documents.length === 0 && (
              <Card>
                <CardContent className="text-center py-8">
                  <Search className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <h3 className="text-lg font-semibold mb-2">No results found</h3>
                  <p className="text-muted-foreground">
                    Try adjusting your search terms or browse folders directly.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        ) : (
          // Regular folder/document view
          <div className="grid gap-6">
            {/* Folders */}
            {folders.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Folder className="h-5 w-5" />
                    Folders ({folders.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {folders.map((folder) => (
                      <div
                        key={folder.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors group"
                        onClick={() => navigateToFolder(folder)}
                      >
                        <div className="flex items-center gap-3 flex-1">
                          <Folder className="h-6 w-6 text-blue-500" />
                          <div className="flex-1">
                            <p className="font-medium truncate">{folder.name}</p>
                            {folder.description && (
                              <p className="text-sm text-muted-foreground truncate">{folder.description}</p>
                            )}
                          </div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem onClick={(e) => {
                              e.stopPropagation();
                              navigateToFolder(folder);
                            }}>
                              <Eye className="mr-2 h-4 w-4" />
                              Open
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteFolderMutation.mutate(folder.id);
                              }}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Documents */}
            {documents.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Documents ({documents.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {documents.map((document) => {
                      const FileIconComponent = getFileIcon(document.mimeType);
                      return (
                        <div
                          key={document.id}
                          className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors group"
                        >
                          <div className="flex items-center gap-3 flex-1">
                            <FileIconComponent className="h-6 w-6 text-gray-500" />
                            <div className="flex-1">
                              <p className="font-medium">{document.title}</p>
                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <span>{document.fileName}</span>
                                <span>{formatFileSize(document.fileSize)}</span>
                                <span>v{document.version}</span>
                                <span className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  {new Date(document.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                              {document.tags && document.tags.length > 0 && (
                                <div className="flex gap-1 mt-2">
                                  {document.tags.map((tag) => (
                                    <Badge key={tag} variant="secondary" className="text-xs">
                                      {tag}
                                    </Badge>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                className="opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <DropdownMenuItem onClick={() => window.open(document.fileUrl, '_blank')}>
                                <Eye className="mr-2 h-4 w-4" />
                                View
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => window.open(document.fileUrl, '_blank')}>
                                <Download className="mr-2 h-4 w-4" />
                                Download
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-destructive"
                                onClick={() => deleteDocumentMutation.mutate(document.id)}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Empty State */}
            {folders.length === 0 && documents.length === 0 && !loading && (
              <Card>
                <CardContent className="text-center py-12">
                  <Folder className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <h3 className="text-xl font-semibold mb-2">
                    {currentFolderId ? "This folder is empty" : "No documents yet"}
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    {currentFolderId 
                      ? "Create folders or upload documents to organize your files here."
                      : "Get started by creating folders to organize your documents or upload your first document."
                    }
                  </p>
                  <div className="flex gap-3 justify-center">
                    <Button 
                      variant="outline" 
                      onClick={() => setShowCreateFolder(true)}
                    >
                      <FolderPlus className="mr-2 h-4 w-4" />
                      Create Folder
                    </Button>
                    <Button 
                      onClick={() => setShowUploadDocument(true)}
                      className="bg-secondary hover:bg-secondary/90"
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      Upload Document
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Loading State */}
            {loading && (
              <Card>
                <CardContent className="text-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Loading...</p>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}