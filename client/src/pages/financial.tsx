import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useStrata } from "@/lib/strata-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { DollarSign, TrendingUp, Calendar, Download, Plus, AlertCircle, CheckCircle, Clock, Edit, Trash2, Repeat, Mail, Bell } from "lucide-react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

// Form schema for creating payment reminders
const reminderFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  reminderType: z.string().min(1, "Reminder type is required"),
  unitId: z.string().optional(),
  amount: z.number().min(0).optional(),
  dueDate: z.string().optional(),
  reminderTime: z.string().default("09:00"),
  isRecurring: z.boolean().default(false),
  recurringPattern: z.string().optional(),
  recurringInterval: z.number().min(1).default(1),
  recurringEndDate: z.string().optional(),
  
  // Advanced recurring options
  monthlyType: z.string().optional(), // 'date', 'day', 'last_day'
  monthlyDate: z.number().min(1).max(31).optional(), // Day of month
  monthlyWeekday: z.string().optional(), // 'monday', 'tuesday', etc.
  monthlyWeekPosition: z.string().optional(), // 'first', 'second', 'third', 'fourth', 'last'
  weeklyDays: z.array(z.string()).optional(), // Array of weekday names
  yearlyMonth: z.number().min(1).max(12).optional(), // Month for yearly patterns
  
  priority: z.string().default("normal"),
  autoSend: z.boolean().default(false),
  emailTemplate: z.string().optional(),
});

type ReminderFormData = z.infer<typeof reminderFormSchema>;

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

interface FeeTier {
  id: string;
  name: string;
  amount: number;
}

interface FeeStructure {
  tiers: FeeTier[];
}

interface FeeData {
  strataId: string;
  feeStructure: FeeStructure;
  lastUpdated: string;
}

interface PaymentReminder {
  id: string;
  strataId: string;
  unitId?: string;
  title: string;
  description?: string;
  reminderType: string;
  amount?: number;
  dueDate?: string;
  reminderTime: string;
  isRecurring: boolean;
  recurringPattern?: string;
  recurringInterval?: number;
  recurringEndDate?: string;
  nextReminderDate?: string;
  lastSentDate?: string;
  remindersSentCount: number;
  status: string;
  priority: string;
  autoSend: boolean;
  emailTemplate?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

interface Expense {
  id: string;
  title: string;
  description: string;
  amount: string;
  category: string;
  status: string;
  createdAt: string;
}

interface Fund {
  id: string;
  name: string;
  type: string;
  balance: string;
  target?: string;
  interestRate?: string;
  compoundingFrequency?: string;
  institution?: string;
  accountNumber?: string;
  maturityDate?: string;
  autoRenewal?: boolean;
  notes?: string;
  createdAt: string;
}

interface FundTransaction {
  id: string;
  fundId: string;
  type: string;
  amount: string;
  description?: string;
  transactionDate: string;
  createdAt: string;
}

export default function Financial() {
  const [location] = useLocation();
  const { selectedStrataId, selectedStrata: currentStrata, isLoading: strataLoading } = useStrata();
  const selectedStrata = selectedStrataId;
  const [isExpenseDialogOpen, setIsExpenseDialogOpen] = useState(false);
  const [isRecurringExpense, setIsRecurringExpense] = useState(false);
  const [editingExpense, setEditingExpense] = useState<any>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editFormData, setEditFormData] = useState<any>({});
  const [isFeeDialogOpen, setIsFeeDialogOpen] = useState(false);
  const [isDwellingDialogOpen, setIsDwellingDialogOpen] = useState(false);
  const [editingDwelling, setEditingDwelling] = useState<any>(null);
  const [feeTiers, setFeeTiers] = useState<FeeTier[]>([]);
  const [isFundDialogOpen, setIsFundDialogOpen] = useState(false);
  const [editingFund, setEditingFund] = useState<Fund | null>(null);
  const [isTransactionDialogOpen, setIsTransactionDialogOpen] = useState(false);
  const [selectedFund, setSelectedFund] = useState<Fund | null>(null);
  const [isReminderDialogOpen, setIsReminderDialogOpen] = useState(false);
  const [editingReminder, setEditingReminder] = useState<PaymentReminder | null>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Reminder form
  const reminderForm = useForm<ReminderFormData>({
    resolver: zodResolver(reminderFormSchema),
    defaultValues: {
      title: "",
      description: "",
      reminderType: "",
      unitId: "all",
      amount: undefined,
      dueDate: "",
      reminderTime: "09:00",
      isRecurring: false,
      recurringPattern: "",
      recurringInterval: 1,
      recurringEndDate: "",
      
      // Advanced recurring defaults
      monthlyType: "date",
      monthlyDate: 1,
      monthlyWeekday: "monday",
      monthlyWeekPosition: "first",
      weeklyDays: [],
      yearlyMonth: 1,
      
      priority: "normal",
      autoSend: false,
      emailTemplate: "",
    },
  });

  // Function to get fee amount for a unit based on its tier
  const getUnitFeeAmount = (unitId: string) => {
    if (!units || !feeTiers) return 0;
    const unit = units.find((u: any) => u.id === unitId);
    if (!unit || !unit.feeTierId) return 0;
    
    const tier = feeTiers.find(t => t.id === unit.feeTierId);
    return tier ? tier.amount : 0;
  };

  // Watch for changes in reminder type and unit to auto-populate amount
  const selectedReminderType = reminderForm.watch("reminderType");
  const selectedUnitId = reminderForm.watch("unitId");

  // Function to format advanced recurring patterns
  const formatRecurringPattern = (reminder: any) => {
    if (!reminder.isRecurring) return "One-time";
    
    let pattern = `Every ${reminder.recurringInterval} ${reminder.recurringPattern}`;
    
    if (reminder.recurringPattern === "weekly" && reminder.weeklyDays?.length > 0) {
      const days = reminder.weeklyDays.map((day: string) => day.slice(0, 3).toUpperCase()).join(", ");
      pattern += ` on ${days}`;
    } else if (reminder.recurringPattern === "monthly") {
      if (reminder.monthlyType === "last_day") {
        pattern += " on last day";
      } else if (reminder.monthlyType === "date" && reminder.monthlyDate) {
        pattern += ` on ${reminder.monthlyDate}${getOrdinalSuffix(reminder.monthlyDate)}`;
      } else if (reminder.monthlyType === "day" && reminder.monthlyWeekPosition && reminder.monthlyWeekday) {
        pattern += ` on ${reminder.monthlyWeekPosition} ${reminder.monthlyWeekday}`;
      }
    } else if (reminder.recurringPattern === "yearly" && reminder.yearlyMonth) {
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      pattern += ` in ${months[reminder.yearlyMonth - 1]}`;
    }
    
    return pattern;
  };

  // Helper function for ordinal suffixes
  const getOrdinalSuffix = (num: number) => {
    const j = num % 10;
    const k = num % 100;
    if (j === 1 && k !== 11) return "st";
    if (j === 2 && k !== 12) return "nd";
    if (j === 3 && k !== 13) return "rd";
    return "th";
  };

  // This will be moved after the data queries

  // Fetch financial summary
  const { data: summary, isLoading: summaryLoading } = useQuery<FinancialSummary>({
    queryKey: [`/api/financial/summary/${selectedStrata}`],
    enabled: !!selectedStrata,
  });

  // Fetch expenses
  const { data: expenses = [], isLoading: expensesLoading } = useQuery<Expense[]>({
    queryKey: [`/api/strata/${selectedStrata}/expenses`],
    enabled: !!selectedStrata,
  });

  // Fetch fee structure
  const { data: feeData, isLoading: feesLoading } = useQuery<FeeData>({
    queryKey: [`/api/financial/fees/${selectedStrata}`],
    enabled: !!selectedStrata,
  });

  // Initialize fee tiers from fetched data
  useEffect(() => {
    if (feeData?.feeStructure) {
      if (feeData.feeStructure.tiers) {
        setFeeTiers(feeData.feeStructure.tiers);
      } else {
        // Convert legacy format to new tier format
        const legacyFees = feeData.feeStructure as any;
        const convertedTiers: FeeTier[] = [];
        if (legacyFees.studio !== undefined) {
          convertedTiers.push({ id: 'studio', name: 'Studio Units', amount: legacyFees.studio });
        }
        if (legacyFees.one_bedroom !== undefined) {
          convertedTiers.push({ id: 'one_bedroom', name: 'One Bedroom', amount: legacyFees.one_bedroom });
        }
        if (legacyFees.two_bedroom !== undefined) {
          convertedTiers.push({ id: 'two_bedroom', name: 'Two Bedroom', amount: legacyFees.two_bedroom });
        }
        setFeeTiers(convertedTiers);
      }
    } else {
      // Default tiers for new strata
      setFeeTiers([
        { id: 'studio', name: 'Studio Units', amount: 0 },
        { id: 'one_bedroom', name: 'One Bedroom', amount: 0 },
        { id: 'two_bedroom', name: 'Two Bedroom', amount: 0 }
      ]);
    }
  }, [feeData]);

  // Check URL parameters for auto-opening dialogs
  useEffect(() => {
    const urlParams = new URLSearchParams(location.split('?')[1] || '');
    if (urlParams.get('action') === 'add-expense') {
      setIsExpenseDialogOpen(true);
    }
  }, [location]);

  // Helper functions for fee tier management
  const addFeeTier = () => {
    const newTier: FeeTier = {
      id: `tier_${Date.now()}`,
      name: 'New Tier',
      amount: 0
    };
    setFeeTiers([...feeTiers, newTier]);
  };

  const updateFeeTier = (id: string, updates: Partial<FeeTier>) => {
    setFeeTiers(feeTiers.map(tier => 
      tier.id === id ? { ...tier, ...updates } : tier
    ));
  };

  const removeFeeTier = (id: string) => {
    if (feeTiers.length > 1) {
      setFeeTiers(feeTiers.filter(tier => tier.id !== id));
    }
  };

  // Fetch payment reminders
  const { data: reminders = [], isLoading: remindersLoading } = useQuery<PaymentReminder[]>({
    queryKey: [`/api/financial/reminders/${selectedStrata}`],
    enabled: !!selectedStrata,
  });

  // Fetch strata units
  const { data: units = [], isLoading: unitsLoading } = useQuery<any[]>({
    queryKey: [`/api/strata/${selectedStrata}/units`],
    enabled: !!selectedStrata,
  });

  // Fetch funds
  const { data: funds = [], isLoading: fundsLoading } = useQuery<Fund[]>({
    queryKey: [`/api/strata/${selectedStrata}/funds`],
    enabled: !!selectedStrata,
  });

  // Auto-populate amount when monthly strata fee is selected
  useEffect(() => {
    if (selectedReminderType === "monthly_strata_fee") {
      if (selectedUnitId && selectedUnitId !== "all") {
        const amount = getUnitFeeAmount(selectedUnitId);
        reminderForm.setValue("amount", amount);
      } else {
        // For "all units", we'll leave amount empty since units may have different fees
        reminderForm.setValue("amount", undefined);
      }
      
      // Auto-set title and default to recurring monthly
      reminderForm.setValue("title", "Monthly Strata Fee");
      reminderForm.setValue("isRecurring", true);
      reminderForm.setValue("recurringPattern", "monthly");
      reminderForm.setValue("recurringInterval", 1);
    }
  }, [selectedReminderType, selectedUnitId, feeTiers, units, reminderForm]);

  // Create expense mutation
  const createExpenseMutation = useMutation({
    mutationFn: async (expenseData: any) => {
      const response = await apiRequest("POST", `/api/strata/${selectedStrata}/expenses`, expenseData);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        throw new Error(errorData.message || 'Failed to create expense');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/strata/${selectedStrata}/expenses`] });
      queryClient.invalidateQueries({ queryKey: [`/api/financial/summary/${selectedStrata}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/strata/${selectedStrata}/recent-activity`] });
      setIsExpenseDialogOpen(false);
      toast({ title: "Success", description: "Expense created successfully" });
    },
    onError: (error: any) => {
      console.error('Expense creation error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create expense. Please try again.",
        variant: "destructive"
      });
    },
  });

  // Update expense status mutation
  const updateExpenseMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const response = await apiRequest("PATCH", `/api/expenses/${id}`, { status });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/strata/${selectedStrata}/expenses`] });
      queryClient.invalidateQueries({ queryKey: [`/api/financial/summary/${selectedStrata}`] });
      toast({ title: "Success", description: "Expense status updated" });
    },
  });

  // Update fees mutation
  const updateFeesMutation = useMutation({
    mutationFn: async (feeStructure: any) => {
      const response = await apiRequest("POST", "/api/financial/fees", { strataId: selectedStrata, feeStructure });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/financial/fees/${selectedStrata}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/financial/summary/${selectedStrata}`] });
      setIsFeeDialogOpen(false);
      toast({ title: "Success", description: "Fee structure updated" });
    },
  });

  // Delete expense mutation
  const deleteExpenseMutation = useMutation({
    mutationFn: async (expenseId: string) => {
      const response = await apiRequest("DELETE", `/api/expenses/${expenseId}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/strata/${selectedStrata}/expenses`] });
      queryClient.invalidateQueries({ queryKey: [`/api/strata/${selectedStrata}/metrics`] });
      toast({ title: "Success", description: "Expense deleted" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to delete expense", variant: "destructive" });
    },
  });

  // Edit expense mutation
  const editExpenseMutation = useMutation({
    mutationFn: async (expenseData: any) => {
      const response = await apiRequest("PATCH", `/api/expenses/${editingExpense.id}`, expenseData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/strata/${selectedStrata}/expenses`] });
      queryClient.invalidateQueries({ queryKey: [`/api/strata/${selectedStrata}/metrics`] });
      setIsEditDialogOpen(false);
      setEditingExpense(null);
      toast({ title: "Success", description: "Expense updated" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update expense", variant: "destructive" });
    },
  });

  // Create unit mutation
  const createUnitMutation = useMutation({
    mutationFn: async (unitData: any) => {
      const response = await apiRequest("POST", `/api/strata/${selectedStrata}/units`, unitData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/strata/${selectedStrata}/units`] });
      setIsDwellingDialogOpen(false);
      toast({ title: "Success", description: "Unit created successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create unit", variant: "destructive" });
    },
  });

  // Update unit mutation
  const updateUnitMutation = useMutation({
    mutationFn: async (unitData: any) => {
      const response = await apiRequest("PATCH", `/api/units/${editingDwelling.id}`, unitData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/strata/${selectedStrata}/units`] });
      setIsDwellingDialogOpen(false);
      setEditingDwelling(null);
      toast({ title: "Success", description: "Unit updated successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update unit", variant: "destructive" });
    },
  });

  // Fund mutations
  const createFundMutation = useMutation({
    mutationFn: async (fundData: any) => {
      const response = await apiRequest("POST", `/api/strata/${selectedStrata}/funds`, fundData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/strata/${selectedStrata}/funds`] });
      setIsFundDialogOpen(false);
      setEditingFund(null);
      toast({ title: "Success", description: "Fund created successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create fund", variant: "destructive" });
    },
  });

  const updateFundMutation = useMutation({
    mutationFn: async (fundData: any) => {
      const response = await apiRequest("PATCH", `/api/funds/${editingFund?.id}`, fundData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/strata/${selectedStrata}/funds`] });
      setIsFundDialogOpen(false);
      setEditingFund(null);
      toast({ title: "Success", description: "Fund updated successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update fund", variant: "destructive" });
    },
  });

  const deleteFundMutation = useMutation({
    mutationFn: async (fundId: string) => {
      const response = await apiRequest("DELETE", `/api/funds/${fundId}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/strata/${selectedStrata}/funds`] });
      toast({ title: "Success", description: "Fund deleted successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to delete fund", variant: "destructive" });
    },
  });

  const createTransactionMutation = useMutation({
    mutationFn: async (transactionData: any) => {
      const response = await apiRequest("POST", `/api/funds/${selectedFund?.id}/transactions`, transactionData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/strata/${selectedStrata}/funds`] });
      setIsTransactionDialogOpen(false);
      setSelectedFund(null);
      toast({ title: "Success", description: "Transaction recorded successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to record transaction", variant: "destructive" });
    },
  });

  // Reminder mutations
  const createReminderMutation = useMutation({
    mutationFn: async (reminderData: ReminderFormData) => {
      // Handle "all" units case
      const processedData = {
        ...reminderData,
        strataId: selectedStrata,
        unitId: reminderData.unitId === "all" ? undefined : reminderData.unitId,
      };
      const response = await apiRequest("POST", "/api/financial/reminders", processedData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/financial/reminders/${selectedStrata}`] });
      setIsReminderDialogOpen(false);
      reminderForm.reset();
      toast({ title: "Success", description: "Reminder created successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create reminder", variant: "destructive" });
    },
  });

  const updateReminderMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<ReminderFormData> }) => {
      // Handle "all" units case
      const processedData = {
        ...data,
        unitId: data.unitId === "all" ? undefined : data.unitId,
      };
      const response = await apiRequest("PUT", `/api/financial/reminders/${id}`, processedData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/financial/reminders/${selectedStrata}`] });
      setIsReminderDialogOpen(false);
      setEditingReminder(null);
      reminderForm.reset();
      toast({ title: "Success", description: "Reminder updated successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update reminder", variant: "destructive" });
    },
  });

  const deleteReminderMutation = useMutation({
    mutationFn: async (reminderId: string) => {
      const response = await apiRequest("DELETE", `/api/financial/reminders/${reminderId}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/financial/reminders/${selectedStrata}`] });
      toast({ title: "Success", description: "Reminder deleted successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to delete reminder", variant: "destructive" });
    },
  });

  const handleExpenseSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const isRecurring = formData.get("chargeType") === "recurring";
    const expenseData = {
      description: formData.get("description"),
      amount: formData.get("amount"), // Keep as string for decimal type
      category: formData.get("category"),
      expenseDate: formData.get("expenseDate"), // Schema will convert to Date
      isRecurring,
      recurringFrequency: isRecurring ? formData.get("frequency") : null,
      status: "pending",
    };

    createExpenseMutation.mutate(expenseData, {
      onSuccess: () => {
        e.currentTarget.reset(); // Reset form after successful submission
        setIsRecurringExpense(false); // Reset recurring state
      }
    });
  }

  const handleEditExpenseSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const isRecurring = editFormData.chargeType === "recurring";
    
    // Use form state values for all controlled inputs
    const expenseData: any = {
      description: editFormData.description,
      amount: editFormData.amount,
      category: editFormData.category,
      isRecurring,
      recurringFrequency: isRecurring ? editFormData.frequency : null,
    };
    
    // Only include expenseDate if it's provided and valid
    if (editFormData.expenseDate && editFormData.expenseDate.trim()) {
      expenseData.expenseDate = new Date(editFormData.expenseDate).toISOString();
    }
    
    console.log("Sending expense data:", expenseData);
    editExpenseMutation.mutate(expenseData);
  }

  const handleEditExpense = (expense: any) => {
    setEditingExpense(expense);
    setIsRecurringExpense(expense.isRecurring);
    setEditFormData({
      description: expense.description,
      amount: expense.amount,
      category: expense.category,
      chargeType: expense.isRecurring ? "recurring" : "one-time",
      frequency: expense.recurringFrequency || "",
      expenseDate: expense.expenseDate ? (() => {
        try {
          // Handle different date formats (string, Date object, or Firestore Timestamp)
          const date = expense.expenseDate;
          if (typeof date === 'string' && date.includes('T')) {
            // Already ISO string, just extract date part
            return date.split('T')[0];
          } else if (typeof date === 'string') {
            // Date string without time
            return date;
          } else if (date instanceof Date) {
            // Date object
            return date.toISOString().split('T')[0];
          } else if (date?.toDate) {
            // Firestore Timestamp
            return date.toDate().toISOString().split('T')[0];
          } else {
            // Try converting to Date
            return new Date(date).toISOString().split('T')[0];
          }
        } catch (error) {
          console.error('Error parsing expenseDate:', error);
          return '';
        }
      })() : ''
    });
    setIsEditDialogOpen(true);
  }

  const handleDeleteExpense = (expenseId: string) => {
    if (confirm("Are you sure you want to delete this expense?")) {
      deleteExpenseMutation.mutate(expenseId);
    }
  };

  const handleFeeSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const feeStructure = {
      tiers: feeTiers
    };
    updateFeesMutation.mutate(feeStructure);
  };

  const handleDwellingSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const unitData = {
      unitNumber: formData.get("unitNumber"),
      unitType: formData.get("unitType"),
      feeTierId: formData.get("feeTierId"),
      ownerName: formData.get("ownerName"),
      ownerEmail: formData.get("ownerEmail"),
      ownerPhone: formData.get("ownerPhone"),
      squareFootage: parseFloat(formData.get("squareFootage") as string || "0"),
      parkingSpaces: parseInt(formData.get("parkingSpaces") as string || "0"),
    };

    if (editingDwelling) {
      updateUnitMutation.mutate(unitData);
    } else {
      createUnitMutation.mutate(unitData);
    }
  };

  const handleEditDwelling = (unit: any) => {
    setEditingDwelling(unit);
    setIsDwellingDialogOpen(true);
  };

  // Fund handler functions
  const handleFundSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const fundData = {
      name: formData.get("name"),
      type: formData.get("type"),
      balance: formData.get("balance"),
      target: formData.get("target") || null,
      interestRate: formData.get("interestRate") || null,
      compoundingFrequency: formData.get("compoundingFrequency") || "monthly",
      institution: formData.get("institution") || null,
      accountNumber: formData.get("accountNumber") || null,
      notes: formData.get("notes") || null,
    };

    if (editingFund) {
      updateFundMutation.mutate(fundData);
    } else {
      createFundMutation.mutate(fundData);
    }
  };

  const handleEditFund = (fund: Fund) => {
    setEditingFund(fund);
    setIsFundDialogOpen(true);
  };

  const handleDeleteFund = (fundId: string) => {
    if (window.confirm("Are you sure you want to delete this fund?")) {
      deleteFundMutation.mutate(fundId);
    }
  };

  const handleTransactionSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const transactionData = {
      type: formData.get("type"),
      amount: formData.get("amount"),
      description: formData.get("description") || null,
      transactionDate: formData.get("transactionDate"),
    };

    createTransactionMutation.mutate(transactionData);
  };

  const openTransactionDialog = (fund: Fund) => {
    setSelectedFund(fund);
    setIsTransactionDialogOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved": return "bg-green-500";
      case "rejected": return "bg-red-500";
      case "pending": return "bg-yellow-500";
      default: return "bg-gray-500";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved": return <CheckCircle className="h-4 w-4" />;
      case "rejected": return <AlertCircle className="h-4 w-4" />;
      case "pending": return <Clock className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const handleExportReport = () => {
    try {
      // Prepare CSV content
      let csvContent = "Financial Report\n";
      csvContent += `Generated: ${new Date().toLocaleString()}\n\n`;

      // Summary Section
      csvContent += "=== FINANCIAL SUMMARY ===\n";
      csvContent += `Total Revenue,${summary?.totalRevenue || 0}\n`;
      csvContent += `Total Expenses,${summary?.totalExpenses || 0}\n`;
      csvContent += `Net Income,${(summary?.totalRevenue || 0) - (summary?.totalExpenses || 0)}\n`;
      csvContent += `Outstanding Fees,${summary?.outstandingFees || 0}\n\n`;

      // Funds Section
      csvContent += "=== FUNDS ===\n";
      csvContent += "Fund Name,Type,Balance,Target,Interest Rate\n";
      funds.forEach(fund => {
        csvContent += `"${fund.name}","${fund.type}",${fund.balance || 0},${fund.target || 0},${fund.interestRate || 0}%\n`;
      });
      csvContent += "\n";

      // Expenses Section
      csvContent += "=== EXPENSES ===\n";
      csvContent += "Description,Category,Amount,Date,Status,Type\n";
      expenses.forEach(expense => {
        const date = expense.expenseDate ? new Date(expense.expenseDate).toLocaleDateString() : 'N/A';
        const type = expense.isRecurring ? `Recurring (${expense.recurringFrequency})` : 'One-time';
        csvContent += `"${expense.description}","${expense.category}",${expense.amount},"${date}","${expense.status}","${type}"\n`;
      });

      // Create blob and download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `financial-report-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({ title: "Success", description: "Financial report exported successfully" });
    } catch (error) {
      console.error('Export error:', error);
      toast({ title: "Error", description: "Failed to export report", variant: "destructive" });
    }
  };

  // Show loading while strata context is loading or no strata selected
  if (strataLoading || !selectedStrata) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Show loading while financial data is loading
  if (summaryLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Financial Management</h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">
            Manage strata fees, expenses, and budgets
          </p>
        </div>
        <Button
          onClick={handleExportReport}
          className="bg-green-500 hover:bg-green-600 text-white w-full sm:w-auto text-sm sm:text-base"
        >
          <Download className="mr-2 h-4 w-4" />
          Export Report
        </Button>
      </div>

      {/* Financial Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${summary?.totalRevenue?.toLocaleString() || "0"}</div>
            <p className="text-xs text-muted-foreground">Annual projected</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Expenses</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${summary?.monthlyExpenses?.toLocaleString() || "0"}</div>
            <p className="text-xs text-muted-foreground">{summary?.pendingExpenses || 0} pending approval</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reserve Fund</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${fundsLoading ? "..." : funds.find(f => f.type === 'reserve')?.balance ?
                parseFloat(funds.find(f => f.type === 'reserve')!.balance).toLocaleString() : "0"}
            </div>
            <p className="text-xs text-muted-foreground">
              Target: ${funds.find(f => f.type === 'reserve')?.target ?
                parseFloat(funds.find(f => f.type === 'reserve')!.target!).toLocaleString() : "0"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Outstanding Fees</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">${summary?.outstandingFees?.toLocaleString() || "0"}</div>
            <p className="text-xs text-muted-foreground">{reminders.length} overdue payments</p>
          </CardContent>
        </Card>
      </div>


      {/* Tabs for different financial sections */}
      <Tabs defaultValue="expenses" className="space-y-4">
        <div className="overflow-x-auto -mx-3 px-3 sm:mx-0 sm:px-0">
          <TabsList className="w-full justify-start min-w-max sm:min-w-full">
            <TabsTrigger value="expenses" className="text-xs sm:text-sm">Expenses</TabsTrigger>
            <TabsTrigger value="fees" className="text-xs sm:text-sm">Fee Structure</TabsTrigger>
            <TabsTrigger value="reminders" className="text-xs sm:text-sm">Reminders</TabsTrigger>
            <TabsTrigger value="dwellings" className="text-xs sm:text-sm">Dwellings</TabsTrigger>
            <TabsTrigger value="funds" className="text-xs sm:text-sm">Funds</TabsTrigger>
          </TabsList>
        </div>

        {/* Expenses Tab */}
        <TabsContent value="expenses" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Expense Management</h3>
            <Dialog open={isExpenseDialogOpen} onOpenChange={setIsExpenseDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-green-500 hover:bg-green-600 text-white">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Expense
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Expense</DialogTitle>
                  <DialogDescription>Create a new expense record for the strata</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleExpenseSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="description">
                      Title <span className="text-red-500">*</span>
                    </Label>
                    <Input id="description" name="description" placeholder="Enter expense title" required />
                  </div>
                  <div>
                    <Label htmlFor="amount">
                      Amount ($) <span className="text-red-500">*</span>
                    </Label>
                    <Input id="amount" name="amount" type="number" step="0.01" min="0" placeholder="0.00" required />
                  </div>
                  <div>
                    <Label htmlFor="category">
                      Category <span className="text-red-500">*</span>
                    </Label>
                    <Select name="category" required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="maintenance">Maintenance</SelectItem>
                        <SelectItem value="utilities">Utilities</SelectItem>
                        <SelectItem value="insurance">Insurance</SelectItem>
                        <SelectItem value="landscaping">Landscaping</SelectItem>
                        <SelectItem value="administrative">Administrative</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="expenseDate">
                      Expense Date <span className="text-red-500">*</span>
                    </Label>
                    <Input id="expenseDate" name="expenseDate" type="date" required />
                  </div>
                  <div>
                    <Label htmlFor="chargeType">
                      Charge Type <span className="text-red-500">*</span>
                    </Label>
                    <Select name="chargeType" onValueChange={(value) => setIsRecurringExpense(value === "recurring")} required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select charge type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="one-time">One-time</SelectItem>
                        <SelectItem value="recurring">Recurring</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {isRecurringExpense && (
                    <div>
                      <Label htmlFor="frequency">Recurring Frequency</Label>
                      <Select name="frequency">
                        <SelectTrigger>
                          <SelectValue placeholder="Select frequency" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                          <SelectItem value="annually">Annually</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  <Button type="submit" disabled={createExpenseMutation.isPending}>
                    {createExpenseMutation.isPending ? "Creating..." : "Create Expense"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>

            {/* Edit Expense Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Edit Expense</DialogTitle>
                  <DialogDescription>Update the expense details</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleEditExpenseSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="editDescription">Title</Label>
                    <Input 
                      id="editDescription" 
                      name="description" 
                      value={editFormData?.description || ""} 
                      onChange={(e) => setEditFormData({...editFormData, description: e.target.value})}
                      required 
                    />
                  </div>
                  <div>
                    <Label htmlFor="editAmount">Amount ($)</Label>
                    <Input 
                      id="editAmount" 
                      name="amount" 
                      type="number" 
                      step="0.01" 
                      value={editFormData?.amount || ""} 
                      onChange={(e) => setEditFormData({...editFormData, amount: e.target.value})}
                      required 
                    />
                  </div>
                  <div>
                    <Label htmlFor="editCategory">Category</Label>
                    <Select 
                      name="category" 
                      value={editFormData?.category || ""} 
                      onValueChange={(value) => setEditFormData({...editFormData, category: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="maintenance">Maintenance</SelectItem>
                        <SelectItem value="utilities">Utilities</SelectItem>
                        <SelectItem value="insurance">Insurance</SelectItem>
                        <SelectItem value="landscaping">Landscaping</SelectItem>
                        <SelectItem value="administrative">Administrative</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="editExpenseDate">Expense Date</Label>
                    <Input 
                      id="editExpenseDate" 
                      name="expenseDate" 
                      type="date" 
                      value={editFormData?.expenseDate || ""} 
                      onChange={(e) => setEditFormData({...editFormData, expenseDate: e.target.value})}
                      required 
                    />
                  </div>
                  <div>
                    <Label htmlFor="editChargeType">Charge Type</Label>
                    <Select 
                      name="chargeType" 
                      onValueChange={(value) => {
                        setIsRecurringExpense(value === "recurring");
                        setEditFormData({...editFormData, chargeType: value});
                      }} 
                      value={editFormData?.chargeType || "one-time"}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select charge type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="one-time">One-time</SelectItem>
                        <SelectItem value="recurring">Recurring</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {isRecurringExpense && (
                    <div>
                      <Label htmlFor="editFrequency">Recurring Frequency</Label>
                      <Select 
                        name="frequency" 
                        value={editFormData?.frequency || ""} 
                        onValueChange={(value) => setEditFormData({...editFormData, frequency: value})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select frequency" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                          <SelectItem value="annually">Annually</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  <Button type="submit" disabled={editExpenseMutation.isPending}>
                    {editExpenseMutation.isPending ? "Updating..." : "Update Expense"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardContent className="p-0">
              {/* Desktop Table View */}
              <div className="hidden lg:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Expense Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {expenses.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="h-24 text-center">
                          <div className="flex flex-col items-center justify-center text-muted-foreground">
                            <p>No expenses found</p>
                            <p className="text-sm mt-1">Create your first expense to get started</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      expenses.map((expense: any) => (
                        <TableRow key={expense.id}>
                        <TableCell className="font-medium">{expense.description}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{expense.category}</Badge>
                        </TableCell>
                        <TableCell>${expense.amount.toLocaleString()}</TableCell>
                        <TableCell>
                          <Badge variant={expense.isRecurring ? "default" : "secondary"}>
                            {expense.isRecurring ? `Recurring (${expense.recurringFrequency || 'N/A'})` : "One-time"}
                          </Badge>
                        </TableCell>
                        <TableCell>{new Date(expense.expenseDate || expense.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Badge className={`${getStatusColor(expense.status)} text-white`}>
                            {getStatusIcon(expense.status)}
                            <span className="ml-1 capitalize">{expense.status}</span>
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-blue-600 border-blue-600 hover:bg-blue-50"
                              onClick={() => handleEditExpense(expense)}
                            >
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-red-600 border-red-600 hover:bg-red-50"
                              onClick={() => handleDeleteExpense(expense.id)}
                            >
                              Delete
                            </Button>
                            {expense.status === "pending" && (
                              <>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-green-600 border-green-600 hover:bg-green-50"
                                  onClick={() => updateExpenseMutation.mutate({ id: expense.id, status: "approved" })}
                                >
                                  Approve
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-red-600 border-red-600 hover:bg-red-50"
                                  onClick={() => updateExpenseMutation.mutate({ id: expense.id, status: "rejected" })}
                                >
                                  Reject
                                </Button>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile Card View */}
              <div className="lg:hidden space-y-4 p-4">
                {expenses.length === 0 ? (
                  <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                      <p>No expenses found</p>
                      <p className="text-sm mt-1">Create your first expense to get started</p>
                    </CardContent>
                  </Card>
                ) : (
                  expenses.map((expense: any) => (
                  <Card key={expense.id} className="border border-gray-200">
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h3 className="font-medium text-base">{expense.description}</h3>
                            <p className="text-sm text-muted-foreground mt-1">
                              {new Date(expense.expenseDate || expense.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <Badge className={`${getStatusColor(expense.status)} text-white ml-2 shrink-0`}>
                            {getStatusIcon(expense.status)}
                            <span className="ml-1 capitalize">{expense.status}</span>
                          </Badge>
                        </div>

                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div>
                            <span className="text-muted-foreground">Category:</span>
                            <div className="mt-1">
                              <Badge variant="outline">{expense.category}</Badge>
                            </div>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Amount:</span>
                            <div className="mt-1 font-medium text-lg">${expense.amount.toLocaleString()}</div>
                          </div>
                        </div>

                        <div>
                          <span className="text-muted-foreground text-sm">Type:</span>
                          <div className="mt-1">
                            <Badge variant={expense.isRecurring ? "default" : "secondary"}>
                              {expense.isRecurring ? `Recurring (${expense.recurringFrequency || 'N/A'})` : "One-time"}
                            </Badge>
                          </div>
                        </div>

                        {/* Mobile Action Buttons */}
                        <div className="flex flex-wrap gap-2 pt-2 border-t">
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-blue-600 border-blue-600 hover:bg-blue-50 flex-1 min-w-[80px]"
                            onClick={() => handleEditExpense(expense)}
                          >
                            <Edit className="h-3 w-3 mr-1" />
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600 border-red-600 hover:bg-red-50 flex-1 min-w-[80px]"
                            onClick={() => handleDeleteExpense(expense.id)}
                          >
                            <Trash2 className="h-3 w-3 mr-1" />
                            Delete
                          </Button>
                          {expense.status === "pending" && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-green-600 border-green-600 hover:bg-green-50 flex-1 min-w-[80px]"
                                onClick={() => updateExpenseMutation.mutate({ id: expense.id, status: "approved" })}
                              >
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-red-600 border-red-600 hover:bg-red-50"
                                onClick={() => updateExpenseMutation.mutate({ id: expense.id, status: "rejected" })}
                              >
                                <AlertCircle className="h-3 w-3" />
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Fee Structure Tab */}
        <TabsContent value="fees" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Monthly Fee Structure</h3>
            <Dialog open={isFeeDialogOpen} onOpenChange={setIsFeeDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Fees
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Update Fee Structure</DialogTitle>
                  <DialogDescription>Modify the monthly fee amounts for different unit types</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleFeeSubmit} className="space-y-4">
                  <div className="space-y-4">
                    {feeTiers.map((tier, index) => (
                      <div key={tier.id} className="flex items-center gap-2 p-3 border rounded-lg">
                        <div className="flex-1 space-y-2">
                          <Label htmlFor={`tier-name-${tier.id}`}>Tier Name</Label>
                          <Input
                            id={`tier-name-${tier.id}`}
                            value={tier.name}
                            onChange={(e) => updateFeeTier(tier.id, { name: e.target.value })}
                            placeholder="Tier name"
                          />
                        </div>
                        <div className="flex-1 space-y-2">
                          <Label htmlFor={`tier-amount-${tier.id}`}>Amount ($)</Label>
                          <Input
                            id={`tier-amount-${tier.id}`}
                            type="number"
                            step="0.01"
                            value={tier.amount}
                            onChange={(e) => updateFeeTier(tier.id, { amount: parseFloat(e.target.value) || 0 })}
                            placeholder="0.00"
                          />
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeFeeTier(tier.id)}
                          disabled={feeTiers.length <= 1}
                          className="mt-6"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                  
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addFeeTier}
                    className="w-full"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Fee Tier
                  </Button>
                  
                  <Button type="submit" disabled={updateFeesMutation.isPending} className="w-full">
                    {updateFeesMutation.isPending ? "Updating..." : "Update Fee Structure"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {feeTiers.map((tier) => (
              <Card key={tier.id}>
                <CardHeader>
                  <CardTitle>{tier.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">${tier.amount}</div>
                  <p className="text-sm text-muted-foreground">per month</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Monthly Income Projection */}
          <div className="mt-8 space-y-4">
            <h3 className="text-lg font-semibold">Monthly Income Projection</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Income Breakdown by Tier */}
              <Card>
                <CardHeader>
                  <CardTitle>Income by Fee Tier</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {feeTiers.map((tier) => {
                      const unitsInTier = units.filter((unit: any) => unit.feeTierId === tier.id);
                      const tierIncome = unitsInTier.length * tier.amount;
                      return (
                        <div key={tier.id} className="flex justify-between items-center">
                          <div>
                            <div className="font-medium">{tier.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {unitsInTier.length} units × ${tier.amount}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold">${tierIncome.toLocaleString()}</div>
                          </div>
                        </div>
                      );
                    })}
                    {/* Unassigned Units */}
                    {(() => {
                      const unassignedUnits = units.filter((unit: any) => !unit.feeTierId);
                      if (unassignedUnits.length > 0) {
                        return (
                          <div className="flex justify-between items-center border-t pt-3">
                            <div>
                              <div className="font-medium text-orange-600">Unassigned Units</div>
                              <div className="text-sm text-muted-foreground">
                                {unassignedUnits.length} units without fee tier
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-semibold text-orange-600">$0</div>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    })()}
                  </div>
                </CardContent>
              </Card>

              {/* Total Monthly Income */}
              <Card>
                <CardHeader>
                  <CardTitle>Monthly Income Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-600">
                        ${feeTiers.reduce((total, tier) => {
                          const unitsInTier = units.filter((unit: any) => unit.feeTierId === tier.id);
                          return total + (unitsInTier.length * tier.amount);
                        }, 0).toLocaleString()}
                      </div>
                      <p className="text-sm text-muted-foreground">Expected monthly income</p>
                    </div>
                    
                    <div className="border-t pt-4 space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Total Units:</span>
                        <span className="font-medium">{units.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Assigned Units:</span>
                        <span className="font-medium">
                          {units.filter((unit: any) => unit.feeTierId).length}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Unassigned Units:</span>
                        <span className="font-medium text-orange-600">
                          {units.filter((unit: any) => !unit.feeTierId).length}
                        </span>
                      </div>
                      <div className="flex justify-between border-t pt-2">
                        <span className="font-medium">Annual Projection:</span>
                        <span className="font-bold text-green-600">
                          ${(feeTiers.reduce((total, tier) => {
                            const unitsInTier = units.filter((unit: any) => unit.feeTierId === tier.id);
                            return total + (unitsInTier.length * tier.amount);
                          }, 0) * 12).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Payment Reminders Tab */}
        <TabsContent value="reminders" className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h3 className="text-lg font-semibold">Payment Reminders</h3>
              <p className="text-sm text-muted-foreground">Manage recurring and one-time payment reminders for units</p>
            </div>
            <Dialog open={isReminderDialogOpen} onOpenChange={setIsReminderDialogOpen}>
              <DialogTrigger asChild>
                <Button className="w-full sm:w-auto">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Reminder
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md max-h-[90vh] overflow-hidden flex flex-col">
                <DialogHeader className="flex-shrink-0">
                  <DialogTitle>{editingReminder ? "Edit Reminder" : "Create Payment Reminder"}</DialogTitle>
                  <DialogDescription>
                    {editingReminder ? "Update the reminder details" : "Set up a new payment reminder for your strata"}
                  </DialogDescription>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto pr-2">
                  <Form {...reminderForm}>
                    <form onSubmit={reminderForm.handleSubmit((data) => {
                      if (editingReminder) {
                        updateReminderMutation.mutate({ id: editingReminder.id, data });
                      } else {
                        createReminderMutation.mutate(data);
                      }
                    })} className="space-y-4">
                    <FormField
                      control={reminderForm.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Title</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Monthly Strata Fee" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={reminderForm.control}
                      name="reminderType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Reminder Type</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select reminder type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="monthly_strata_fee">Monthly Strata Fee</SelectItem>
                              <SelectItem value="monthly_fee">Monthly Fee</SelectItem>
                              <SelectItem value="fee_overdue">Fee Overdue</SelectItem>
                              <SelectItem value="special_assessment">Special Assessment</SelectItem>
                              <SelectItem value="maintenance_fee">Maintenance Fee</SelectItem>
                              <SelectItem value="custom">Custom</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={reminderForm.control}
                      name="unitId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Assign to Unit (Optional)</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="All units or select specific unit" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="all">All Units</SelectItem>
                              {units.map((unit: any) => (
                                <SelectItem key={unit.id} value={unit.id}>
                                  Unit {unit.unitNumber} {unit.ownerName && `- ${unit.ownerName}`}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={reminderForm.control}
                        name="amount"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Amount ($)</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                step="0.01"
                                placeholder="0.00"
                                value={field.value || ""}
                                onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={reminderForm.control}
                        name="priority"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Priority</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue />
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
                    </div>

                    <FormField
                      control={reminderForm.control}
                      name="dueDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Due Date (Optional)</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={reminderForm.control}
                      name="reminderTime"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Reminder Time</FormLabel>
                          <FormControl>
                            <Input 
                              type="time" 
                              {...field} 
                              className="w-full"
                            />
                          </FormControl>
                          <div className="text-xs text-muted-foreground">
                            Time when the reminder will be sent
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={reminderForm.control}
                      name="isRecurring"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Recurring Reminder</FormLabel>
                            <div className="text-sm text-muted-foreground">
                              Automatically repeat this reminder
                            </div>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    {reminderForm.watch("isRecurring") && (
                      <div className="space-y-4 p-4 bg-muted/20 rounded-lg">
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={reminderForm.control}
                            name="recurringPattern"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Frequency</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select frequency" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="daily">Daily</SelectItem>
                                    <SelectItem value="weekly">Weekly</SelectItem>
                                    <SelectItem value="monthly">Monthly</SelectItem>
                                    <SelectItem value="yearly">Yearly</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={reminderForm.control}
                            name="recurringInterval"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Every</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="number" 
                                    min="1" 
                                    placeholder="1"
                                    {...field}
                                    onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        {/* Advanced scheduling options based on pattern */}
                        {reminderForm.watch("recurringPattern") === "weekly" && (
                          <FormField
                            control={reminderForm.control}
                            name="weeklyDays"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Days of Week</FormLabel>
                                <div className="grid grid-cols-4 gap-2">
                                  {["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"].map((day) => (
                                    <div key={day} className="flex items-center space-x-2">
                                      <input
                                        type="checkbox"
                                        id={day}
                                        checked={field.value?.includes(day) || false}
                                        onChange={(e) => {
                                          const current = field.value || [];
                                          if (e.target.checked) {
                                            field.onChange([...current, day]);
                                          } else {
                                            field.onChange(current.filter((d: string) => d !== day));
                                          }
                                        }}
                                        className="rounded border-gray-300"
                                      />
                                      <Label htmlFor={day} className="text-xs capitalize">{day.slice(0, 3)}</Label>
                                    </div>
                                  ))}
                                </div>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        )}

                        {reminderForm.watch("recurringPattern") === "monthly" && (
                          <FormField
                            control={reminderForm.control}
                            name="monthlyType"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Monthly Schedule</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select monthly pattern" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="date">On specific date of month</SelectItem>
                                    <SelectItem value="day">On specific day of week</SelectItem>
                                    <SelectItem value="last_day">On last day of month</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        )}

                        {reminderForm.watch("recurringPattern") === "monthly" && reminderForm.watch("monthlyType") === "date" && (
                          <FormField
                            control={reminderForm.control}
                            name="monthlyDate"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Day of Month</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="number" 
                                    min="1" 
                                    max="31"
                                    placeholder="1"
                                    {...field}
                                    onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        )}

                        {reminderForm.watch("recurringPattern") === "monthly" && reminderForm.watch("monthlyType") === "day" && (
                          <div className="grid grid-cols-2 gap-4">
                            <FormField
                              control={reminderForm.control}
                              name="monthlyWeekPosition"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Week Position</FormLabel>
                                  <Select onValueChange={field.onChange} value={field.value}>
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select week" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      <SelectItem value="first">First</SelectItem>
                                      <SelectItem value="second">Second</SelectItem>
                                      <SelectItem value="third">Third</SelectItem>
                                      <SelectItem value="fourth">Fourth</SelectItem>
                                      <SelectItem value="last">Last</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={reminderForm.control}
                              name="monthlyWeekday"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Day of Week</FormLabel>
                                  <Select onValueChange={field.onChange} value={field.value}>
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select day" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      <SelectItem value="monday">Monday</SelectItem>
                                      <SelectItem value="tuesday">Tuesday</SelectItem>
                                      <SelectItem value="wednesday">Wednesday</SelectItem>
                                      <SelectItem value="thursday">Thursday</SelectItem>
                                      <SelectItem value="friday">Friday</SelectItem>
                                      <SelectItem value="saturday">Saturday</SelectItem>
                                      <SelectItem value="sunday">Sunday</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        )}

                        {reminderForm.watch("recurringPattern") === "yearly" && (
                          <FormField
                            control={reminderForm.control}
                            name="yearlyMonth"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Month</FormLabel>
                                <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value?.toString()}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select month" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="1">January</SelectItem>
                                    <SelectItem value="2">February</SelectItem>
                                    <SelectItem value="3">March</SelectItem>
                                    <SelectItem value="4">April</SelectItem>
                                    <SelectItem value="5">May</SelectItem>
                                    <SelectItem value="6">June</SelectItem>
                                    <SelectItem value="7">July</SelectItem>
                                    <SelectItem value="8">August</SelectItem>
                                    <SelectItem value="9">September</SelectItem>
                                    <SelectItem value="10">October</SelectItem>
                                    <SelectItem value="11">November</SelectItem>
                                    <SelectItem value="12">December</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        )}

                        <FormField
                          control={reminderForm.control}
                          name="recurringEndDate"
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
                      </div>
                    )}

                    <FormField
                      control={reminderForm.control}
                      name="autoSend"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Auto-Send</FormLabel>
                            <div className="text-sm text-muted-foreground">
                              Automatically send reminder notifications
                            </div>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={reminderForm.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description (Optional)</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Additional details about this reminder..."
                              className="resize-none"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setIsReminderDialogOpen(false);
                          setEditingReminder(null);
                          reminderForm.reset();
                        }}
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                      <Button 
                        type="submit" 
                        disabled={createReminderMutation.isPending || updateReminderMutation.isPending}
                        className="flex-1"
                      >
                        {editingReminder ? "Update" : "Create"}
                      </Button>
                    </div>
                  </form>
                </Form>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardContent className="p-0">
              {remindersLoading ? (
                <div className="p-8 text-center">
                  <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
                  <p className="mt-2 text-sm text-muted-foreground">Loading reminders...</p>
                </div>
              ) : reminders.length === 0 ? (
                <div className="p-8 text-center">
                  <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-lg font-medium">No reminders yet</p>
                  <p className="text-sm text-muted-foreground">Create your first payment reminder to get started</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Unit</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Time</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Recurring</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reminders.map((reminder: PaymentReminder) => {
                      const assignedUnit = reminder.unitId 
                        ? units.find((unit: any) => unit.id === reminder.unitId)
                        : null;
                      
                      return (
                        <TableRow key={reminder.id}>
                          <TableCell className="font-medium">{reminder.title}</TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {reminder.reminderType.replace('_', ' ')}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {assignedUnit ? `Unit ${assignedUnit.unitNumber}` : "All Units"}
                          </TableCell>
                          <TableCell>
                            {reminder.amount ? `$${reminder.amount}` : "-"}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4 text-muted-foreground" />
                              <span className="text-sm">
                                {reminder.reminderTime || "09:00"}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={
                              reminder.status === "active" ? "default" :
                              reminder.status === "paused" ? "secondary" :
                              reminder.status === "completed" ? "secondary" : "outline"
                            }>
                              {reminder.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={
                              reminder.priority === "urgent" ? "destructive" :
                              reminder.priority === "high" ? "destructive" :
                              reminder.priority === "normal" ? "default" : "secondary"
                            }>
                              {reminder.priority}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {reminder.isRecurring ? (
                              <div className="flex items-center gap-1">
                                <Repeat className="w-4 h-4" />
                                <span className="text-sm">
                                  {formatRecurringPattern(reminder)}
                                </span>
                              </div>
                            ) : (
                              <span className="text-sm text-muted-foreground">One-time</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              {reminder.autoSend && (
                                <Button size="sm" variant="outline">
                                  <Mail className="w-4 h-4" />
                                </Button>
                              )}
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setEditingReminder(reminder);
                                  reminderForm.reset({
                                    title: reminder.title,
                                    description: reminder.description || "",
                                    reminderType: reminder.reminderType,
                                    unitId: reminder.unitId || "all",
                                    amount: reminder.amount || undefined,
                                    dueDate: reminder.dueDate ? new Date(reminder.dueDate).toISOString().split('T')[0] : "",
                                    reminderTime: reminder.reminderTime || "09:00",
                                    isRecurring: reminder.isRecurring,
                                    recurringPattern: reminder.recurringPattern || "",
                                    recurringInterval: reminder.recurringInterval || 1,
                                    recurringEndDate: reminder.recurringEndDate ? new Date(reminder.recurringEndDate).toISOString().split('T')[0] : "",
                                    priority: reminder.priority,
                                    autoSend: reminder.autoSend,
                                    emailTemplate: reminder.emailTemplate || "",
                                  });
                                  setIsReminderDialogOpen(true);
                                }}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => deleteReminderMutation.mutate(reminder.id)}
                                disabled={deleteReminderMutation.isPending}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Dwellings Tab */}
        <TabsContent value="dwellings" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Unit Management</h3>
            <Dialog open={isDwellingDialogOpen} onOpenChange={setIsDwellingDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-green-500 hover:bg-green-600 text-white" onClick={() => setEditingDwelling(null)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Unit
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editingDwelling ? "Edit Unit" : "Add New Unit"}</DialogTitle>
                  <DialogDescription>
                    {editingDwelling ? "Update unit details and owner information" : "Add a new unit to the strata"}
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleDwellingSubmit} className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="unitNumber">Unit Number</Label>
                      <Input 
                        id="unitNumber" 
                        name="unitNumber" 
                        defaultValue={editingDwelling?.unitNumber} 
                        required 
                      />
                    </div>
                    <div>
                      <Label htmlFor="unitType">Unit Type</Label>
                      <Select name="unitType" defaultValue={editingDwelling?.unitType}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select unit type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="studio">Studio</SelectItem>
                          <SelectItem value="one_bedroom">One Bedroom</SelectItem>
                          <SelectItem value="two_bedroom">Two Bedroom</SelectItem>
                          <SelectItem value="three_bedroom">Three Bedroom</SelectItem>
                          <SelectItem value="penthouse">Penthouse</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="feeTierId">Fee Tier</Label>
                      <Select name="feeTierId" defaultValue={editingDwelling?.feeTierId}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select fee tier" />
                        </SelectTrigger>
                        <SelectContent>
                          {feeTiers.map((tier) => (
                            <SelectItem key={tier.id} value={tier.id}>
                              {tier.name} - ${tier.amount}/month
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="font-medium">Owner Information</h4>
                    <div>
                      <Label htmlFor="ownerName">Owner Name</Label>
                      <Input 
                        id="ownerName" 
                        name="ownerName" 
                        defaultValue={editingDwelling?.ownerName}
                        required 
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="ownerEmail">Email</Label>
                        <Input 
                          id="ownerEmail" 
                          name="ownerEmail" 
                          type="email"
                          defaultValue={editingDwelling?.ownerEmail}
                        />
                      </div>
                      <div>
                        <Label htmlFor="ownerPhone">Phone</Label>
                        <Input 
                          id="ownerPhone" 
                          name="ownerPhone" 
                          defaultValue={editingDwelling?.ownerPhone}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-medium">Unit Details</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="squareFootage">Square Footage</Label>
                        <Input 
                          id="squareFootage" 
                          name="squareFootage" 
                          type="number"
                          defaultValue={editingDwelling?.squareFootage}
                        />
                      </div>
                      <div>
                        <Label htmlFor="parkingSpaces">Parking Spaces</Label>
                        <Input 
                          id="parkingSpaces" 
                          name="parkingSpaces" 
                          type="number"
                          defaultValue={editingDwelling?.parkingSpaces}
                        />
                      </div>
                    </div>
                  </div>

                  <Button type="submit" disabled={createUnitMutation.isPending || updateUnitMutation.isPending}>
                    {editingDwelling 
                      ? (updateUnitMutation.isPending ? "Updating..." : "Update Unit")
                      : (createUnitMutation.isPending ? "Creating..." : "Create Unit")
                    }
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Unit</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Fee Tier</TableHead>
                    <TableHead>Owner</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead>Parking</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {units.map((unit: any) => {
                    // Find the fee tier for this unit
                    const feeTier = feeData?.feeStructure?.tiers?.find((tier: any) => tier.id === unit.feeTierId);

                    return (
                      <TableRow key={unit.id}>
                        <TableCell className="font-medium">Unit {unit.unitNumber}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {unit.unitType?.replace('_', ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {feeTier ? (
                            <div className="text-sm">
                              <div className="font-medium text-gray-900">{feeTier.name}</div>
                              <div className="text-gray-500">${feeTier.amount?.toFixed(2)}/mo</div>
                            </div>
                          ) : (
                            <Badge variant="outline" className="text-yellow-600 border-yellow-600">
                              Not Assigned
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>{unit.ownerName || 'N/A'}</TableCell>
                      <TableCell>
                        {unit.ownerEmail || unit.ownerPhone ? (
                          <div className="text-sm">
                            {unit.ownerEmail && <div>{unit.ownerEmail}</div>}
                            {unit.ownerPhone && <div>{unit.ownerPhone}</div>}
                          </div>
                        ) : 'N/A'}
                      </TableCell>
                      <TableCell>
                        {unit.squareFootage ? `${unit.squareFootage} sq ft` : 'N/A'}
                      </TableCell>
                      <TableCell>{unit.parkingSpaces || 0} spaces</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-blue-600 border-blue-600 hover:bg-blue-50"
                            onClick={() => handleEditDwelling(unit)}
                          >
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-green-600 border-green-600 hover:bg-green-50"
                          >
                            Documents
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Funds Tab */}
        <TabsContent value="funds" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Fund Management</h3>
            <Dialog open={isFundDialogOpen} onOpenChange={setIsFundDialogOpen}>
              <DialogTrigger asChild>
                <Button 
                  className="bg-green-500 hover:bg-green-600 text-white"
                  onClick={() => {
                    setEditingFund(null);
                    setIsFundDialogOpen(true);
                  }}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Fund
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>{editingFund ? "Edit Fund" : "Add New Fund"}</DialogTitle>
                  <DialogDescription>
                    {editingFund ? "Update fund information and settings" : "Create a new fund for reserve management"}
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleFundSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="fundName">Fund Name</Label>
                      <Input 
                        id="fundName" 
                        name="name" 
                        defaultValue={editingFund?.name}
                        placeholder="e.g., Reserve Fund"
                        required 
                      />
                    </div>
                    <div>
                      <Label htmlFor="fundType">Fund Type</Label>
                      <Select name="type" defaultValue={editingFund?.type || "reserve"}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select fund type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="reserve">Reserve Fund</SelectItem>
                          <SelectItem value="operating">Operating Fund</SelectItem>
                          <SelectItem value="emergency">Emergency Fund</SelectItem>
                          <SelectItem value="special_levy">Special Levy</SelectItem>
                          <SelectItem value="investment">Investment Fund</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="balance">Current Balance ($)</Label>
                      <Input 
                        id="balance" 
                        name="balance" 
                        type="number" 
                        step="0.01"
                        defaultValue={editingFund?.balance}
                        placeholder="0.00"
                        required 
                      />
                    </div>
                    <div>
                      <Label htmlFor="target">Target Amount ($)</Label>
                      <Input 
                        id="target" 
                        name="target" 
                        type="number" 
                        step="0.01"
                        defaultValue={editingFund?.target}
                        placeholder="Optional target amount"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="interestRate">Interest Rate (% annual)</Label>
                      <Input 
                        id="interestRate" 
                        name="interestRate" 
                        type="number" 
                        step="0.001"
                        defaultValue={editingFund?.interestRate}
                        placeholder="e.g., 2.5"
                      />
                    </div>
                    <div>
                      <Label htmlFor="compoundingFrequency">Compounding</Label>
                      <Select name="compoundingFrequency" defaultValue={editingFund?.compoundingFrequency || "monthly"}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="monthly">Monthly</SelectItem>
                          <SelectItem value="quarterly">Quarterly</SelectItem>
                          <SelectItem value="annually">Annually</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="institution">Financial Institution</Label>
                      <Input 
                        id="institution" 
                        name="institution" 
                        defaultValue={editingFund?.institution}
                        placeholder="e.g., TD Bank"
                      />
                    </div>
                    <div>
                      <Label htmlFor="accountNumber">Account Number</Label>
                      <Input 
                        id="accountNumber" 
                        name="accountNumber" 
                        defaultValue={editingFund?.accountNumber}
                        placeholder="Last 4 digits: ****1234"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea 
                      id="notes" 
                      name="notes" 
                      defaultValue={editingFund?.notes}
                      placeholder="Additional notes about this fund"
                    />
                  </div>

                  <Button type="submit" disabled={createFundMutation.isPending || updateFundMutation.isPending}>
                    {(createFundMutation.isPending || updateFundMutation.isPending) ? "Saving..." : editingFund ? "Update Fund" : "Create Fund"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Fund Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {funds.map((fund) => {
              const balance = fund.balance ? parseFloat(fund.balance) : 0;
              const target = fund.target ? parseFloat(fund.target) : null;
              const progressPercentage = target && target > 0 ? Math.min((balance / target) * 100, 100) : 0;
              const interestRate = fund.interestRate ? parseFloat(fund.interestRate) : 0;
              const monthlyGrowth = interestRate > 0 && balance > 0 ?
                (balance * interestRate / 100 / 12) : 0;
              
              return (
                <Card key={fund.id} className="relative hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{fund.name}</CardTitle>
                        <Badge 
                          variant="outline" 
                          className={`mt-1 capitalize ${
                            fund.type === 'reserve' ? 'border-blue-300 text-blue-700' :
                            fund.type === 'emergency' ? 'border-red-300 text-red-700' :
                            fund.type === 'operating' ? 'border-green-300 text-green-700' :
                            'border-gray-300 text-gray-700'
                          }`}
                        >
                          {fund.type.replace('_', ' ')}
                        </Badge>
                      </div>
                      <div className="flex space-x-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditFund(fund)}
                          title="Edit Fund"
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteFund(fund.id)}
                          className="text-red-600 border-red-600 hover:bg-red-50"
                          title="Delete Fund"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="text-3xl font-bold text-green-600">
                          ${balance.toLocaleString()}
                        </div>
                        <p className="text-sm text-muted-foreground">Current Balance</p>
                      </div>
                      
                      {target && (
                        <div>
                          <div className="flex justify-between text-sm mb-2">
                            <span className="font-medium">Target: ${target.toLocaleString()}</span>
                            <span className="font-semibold text-green-600">{progressPercentage.toFixed(1)}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-3">
                            <div 
                              className={`h-3 rounded-full transition-all duration-500 ${
                                progressPercentage >= 80 ? 'bg-green-500' :
                                progressPercentage >= 60 ? 'bg-yellow-500' :
                                'bg-red-500'
                              }`}
                              style={{ width: `${progressPercentage}%` }}
                            />
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            ${(target - balance).toLocaleString()} remaining to target
                          </p>
                        </div>
                      )}

                      {fund.interestRate && interestRate > 0 && (
                        <div className="bg-blue-50 rounded-lg p-3">
                          <div className="text-sm">
                            <div className="flex justify-between items-center mb-1">
                              <span className="font-medium">Interest Rate:</span>
                              <span className="font-bold text-blue-600">
                                {interestRate.toFixed(2)}%
                              </span>
                            </div>
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-muted-foreground">Monthly Growth:</span>
                              <span className="font-semibold text-green-600">
                                +${monthlyGrowth.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              Compounded {fund.compoundingFrequency}
                            </p>
                          </div>
                        </div>
                      )}

                      {fund.institution && (
                        <div className="text-sm text-muted-foreground bg-gray-50 rounded p-2">
                          <div className="font-medium">{fund.institution}</div>
                          {fund.accountNumber && (
                            <div className="text-xs">Account: {fund.accountNumber}</div>
                          )}
                        </div>
                      )}

                      <div className="flex space-x-2 pt-2">
                        <Button
                          size="sm"
                          onClick={() => openTransactionDialog(fund)}
                          className="flex-1 bg-green-500 hover:bg-green-600 text-white"
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          Transaction
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditFund(fund)}
                          className="flex-1"
                        >
                          <Edit className="h-3 w-3 mr-1" />
                          Edit
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {funds.length === 0 && (
            <Card>
              <CardContent className="text-center py-8">
                <div className="text-muted-foreground">
                  <DollarSign className="mx-auto h-12 w-12 mb-4 opacity-50" />
                  <h3 className="font-medium mb-2">No funds created yet</h3>
                  <p className="text-sm">Create your first fund to start managing your strata's finances</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Fund Transaction Dialog */}
          <Dialog open={isTransactionDialogOpen} onOpenChange={setIsTransactionDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Transaction to {selectedFund?.name}</DialogTitle>
                <DialogDescription>
                  Record a deposit, withdrawal, or interest payment
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleTransactionSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="transactionType">Transaction Type</Label>
                  <Select name="type" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select transaction type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="deposit">Deposit</SelectItem>
                      <SelectItem value="withdrawal">Withdrawal</SelectItem>
                      <SelectItem value="interest">Interest Payment</SelectItem>
                      <SelectItem value="transfer_in">Transfer In</SelectItem>
                      <SelectItem value="transfer_out">Transfer Out</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="transactionAmount">Amount ($)</Label>
                  <Input 
                    id="transactionAmount" 
                    name="amount" 
                    type="number" 
                    step="0.01"
                    placeholder="0.00"
                    required 
                  />
                </div>

                <div>
                  <Label htmlFor="transactionDate">Transaction Date</Label>
                  <Input 
                    id="transactionDate" 
                    name="transactionDate" 
                    type="date"
                    defaultValue={new Date().toISOString().split('T')[0]}
                    required 
                  />
                </div>

                <div>
                  <Label htmlFor="transactionDescription">Description</Label>
                  <Textarea 
                    id="transactionDescription" 
                    name="description" 
                    placeholder="Optional description of the transaction"
                  />
                </div>

                <Button type="submit" disabled={createTransactionMutation.isPending}>
                  {createTransactionMutation.isPending ? "Recording..." : "Record Transaction"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </TabsContent>
      </Tabs>
    </div>
  );
}
