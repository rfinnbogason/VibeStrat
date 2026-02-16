import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import * as SecureStore from "expo-secure-store";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import * as ImagePicker from "expo-image-picker";

const BASE_URL = process.env.EXPO_PUBLIC_BASE_URL || "https://vibe-strat.vercel.app";
const TOKEN_KEY = "vibestrat_auth_token";

type AuthView = "home" | "login" | "signup" | "strata";
type AppScreen = "overview" | "notifications" | "quotes" | "vendors" | "financial" | "maintenance" | "meetings" | "communications" | "account" | "masterAdmin";
type User = { id: string; email: string; firstName?: string; lastName?: string; role?: string };
type Strata = { id: string; name?: string };
type Metrics = { totalProperties?: number; outstandingFees?: string | number; pendingApprovals?: number; openMaintenance?: number };
type Financial = { monthlyRevenue?: number; monthlyExpenses?: number; reserveFund?: number };
type Item = { id: string; title?: string; description?: string; createdAt?: string; status?: string; isRead?: boolean; message?: string; vendorId?: string; amount?: number | string; metadata?: any };
type Meeting = { id: string; title?: string; scheduledAt?: string; status?: string };
type QuoteForm = { projectTitle: string; description: string; amount: string; vendorName: string };
type ExpenseForm = { description: string; amount: string; category: string };
type MaintenanceForm = {
  title: string;
  description: string;
  category: string;
  priority: string;
  status: string;
  estimatedCost: string;
  actualCost: string;
  scheduledDate: string;
  completedDate: string;
  nextServiceDate: string;
  contractor: string;
  warranty: string;
  notes: string;
};
type MeetingForm = { title: string; description: string; meetingDate: string; location: string; meetingType: string };
type AnnouncementForm = { title: string; content: string; type: string; priority: string };
type MessageForm = { subject: string; content: string; priority: string };
type FinancialTab = "expenses" | "fees" | "reminders" | "dwellings" | "funds";
type FeeTier = { id: string; name: string; amount: number };
type FeeData = { strataId: string; feeStructure?: { tiers?: FeeTier[]; [key: string]: any } };
type Reminder = { id: string; title?: string; reminderType?: string; amount?: number; dueDate?: string; reminderTime?: string; isRecurring?: boolean; recurringPattern?: string; recurringInterval?: number; status?: string; priority?: string; createdAt?: string };
type Unit = { id: string; unitNumber?: string; unitType?: string; feeTierId?: string; ownerName?: string; ownerEmail?: string; ownerPhone?: string; squareFootage?: number; parkingSpaces?: number };
type Fund = { id: string; name?: string; type?: string; balance?: string | number; target?: string | number; interestRate?: string | number; institution?: string };
type UploadedQuoteDocument = { fileUrl: string; fileName: string; fileSize: number; mimeType: string };
type Vendor = {
  id: string;
  name?: string;
  serviceCategories?: string[];
  contactInfo?: { email?: string; phone?: string; address?: string; website?: string };
  businessLicense?: string;
  emergencyContact?: string;
  isPreferred?: boolean;
  notes?: string;
  createdAt?: string;
};
type VendorContract = {
  id: string;
  vendorId: string;
  contractName?: string;
  description?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  costAmount?: string | number;
  costFrequency?: string;
};
type VendorHistory = {
  id: string;
  vendorId: string;
  eventType?: string;
  title?: string;
  description?: string;
  rating?: number;
  cost?: string | number;
  eventDate?: string;
  createdAt?: string;
};

Notifications.setNotificationHandler({
  handleNotification: async () => ({ shouldShowAlert: true, shouldPlaySound: true, shouldSetBadge: true, shouldShowBanner: true, shouldShowList: true }),
});

async function api(path: string, init: RequestInit = {}, token?: string) {
  const headers: Record<string, string> = { "Content-Type": "application/json", ...(init.headers as Record<string, string>) };
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`${BASE_URL}${path}`, { ...init, headers });
  const text = await res.text();
  let data: any = {};
  try { data = text ? JSON.parse(text) : {}; } catch { data = { message: text }; }
  if (!res.ok) throw new Error(data?.message || "Request failed");
  return data;
}

const money = (v: any) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(Number(v || 0));
const when = (v?: string) => (v ? new Date(v).toLocaleString() : "Unknown");
const label = (s?: string) => (s || "unknown").replace(/_/g, " ");

export default function App() {
  const [booting, setBooting] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [showTopBar, setShowTopBar] = useState(true);
  const scrollY = useRef(0);

  const [authView, setAuthView] = useState<AuthView>("home");
  const [screen, setScreen] = useState<AppScreen>("overview");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [strata, setStrata] = useState<Strata[]>([]);
  const [selectedStrataId, setSelectedStrataId] = useState("");
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [financial, setFinancial] = useState<Financial | null>(null);
  const [activity, setActivity] = useState<Item[]>([]);
  const [notificationsList, setNotificationsList] = useState<Item[]>([]);
  const [strataUsers, setStrataUsers] = useState<any[]>([]);
  const [approvals, setApprovals] = useState<Item[]>([]);
  const [maintenance, setMaintenance] = useState<Item[]>([]);
  const [approvedRepairRequests, setApprovedRepairRequests] = useState<Item[]>([]);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [quotes, setQuotes] = useState<Item[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [vendorContracts, setVendorContracts] = useState<VendorContract[]>([]);
  const [vendorHistory, setVendorHistory] = useState<VendorHistory[]>([]);
  const [selectedQuoteVendorId, setSelectedQuoteVendorId] = useState("");
  const [selectedVendorId, setSelectedVendorId] = useState("");
  const [selectedStrataRole, setSelectedStrataRole] = useState("resident");
  const [adminStrata, setAdminStrata] = useState<any[]>([]);
  const [adminUsers, setAdminUsers] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<Item[]>([]);
  const [announcements, setAnnouncements] = useState<Item[]>([]);
  const [messages, setMessages] = useState<Item[]>([]);
  const [financialTab, setFinancialTab] = useState<FinancialTab>("expenses");
  const [fees, setFees] = useState<FeeTier[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [funds, setFunds] = useState<Fund[]>([]);
  const [editingExpenseId, setEditingExpenseId] = useState("");
  const [editExpenseForm, setEditExpenseForm] = useState<{ description: string; amount: string; category: string; expenseDate: string; isRecurring: boolean; recurringFrequency: string }>({ description: "", amount: "", category: "general", expenseDate: "", isRecurring: false, recurringFrequency: "" });
  const [reminderForm, setReminderForm] = useState<{ title: string; reminderType: string; unitId: string; amount: string; dueDate: string; reminderTime: string; isRecurring: boolean; recurringPattern: string; recurringInterval: string; priority: string }>({ title: "", reminderType: "monthly_strata_fee", unitId: "all", amount: "", dueDate: "", reminderTime: "09:00", isRecurring: false, recurringPattern: "monthly", recurringInterval: "1", priority: "normal" });
  const [unitForm, setUnitForm] = useState<{ id: string; unitNumber: string; unitType: string; feeTierId: string; ownerName: string; ownerEmail: string; ownerPhone: string; squareFootage: string; parkingSpaces: string }>({ id: "", unitNumber: "", unitType: "apartment", feeTierId: "", ownerName: "", ownerEmail: "", ownerPhone: "", squareFootage: "", parkingSpaces: "" });
  const [fundForm, setFundForm] = useState<{ id: string; name: string; type: string; balance: string; target: string; interestRate: string; institution: string }>({ id: "", name: "", type: "reserve", balance: "", target: "", interestRate: "", institution: "" });
  const [transactionForm, setTransactionForm] = useState<{ fundId: string; type: string; amount: string; description: string; transactionDate: string }>({ fundId: "", type: "contribution", amount: "", description: "", transactionDate: "" });
  const [quoteForm, setQuoteForm] = useState<QuoteForm>({ projectTitle: "", description: "", amount: "", vendorName: "" });
  const [quoteStatusFilter, setQuoteStatusFilter] = useState<"all" | "submitted" | "approved" | "rejected">("all");
  const [uploadedQuoteDocument, setUploadedQuoteDocument] = useState<UploadedQuoteDocument | null>(null);
  const [quotePreviewUri, setQuotePreviewUri] = useState("");
  const [analyzingQuoteDoc, setAnalyzingQuoteDoc] = useState(false);
  const [vendorForm, setVendorForm] = useState<{ name: string; email: string; phone: string; categories: string; businessLicense: string; emergencyContact: string; notes: string; isPreferred: boolean }>({ name: "", email: "", phone: "", categories: "", businessLicense: "", emergencyContact: "", notes: "", isPreferred: false });
  const [contractForm, setContractForm] = useState<{ contractName: string; description: string; startDate: string; endDate: string; costAmount: string; costFrequency: string; paymentTerms: string; serviceScope: string; autoRenew: boolean }>({ contractName: "", description: "", startDate: "", endDate: "", costAmount: "", costFrequency: "monthly", paymentTerms: "", serviceScope: "", autoRenew: false });
  const [vendorHistoryForm, setVendorHistoryForm] = useState<{ eventType: string; title: string; description: string; rating: string; cost: string; eventDate: string }>({ eventType: "service_completed", title: "", description: "", rating: "", cost: "", eventDate: "" });
  const [adminStrataForm, setAdminStrataForm] = useState<{ name: string; address: string; city: string; province: string; postalCode: string; country: string; unitCount: string; email: string; phoneNumber: string }>({ name: "", address: "", city: "", province: "", postalCode: "", country: "Canada", unitCount: "", email: "", phoneNumber: "" });
  const [adminUserForm, setAdminUserForm] = useState<{ email: string; firstName: string; lastName: string; role: string; temporaryPassword: string }>({ email: "", firstName: "", lastName: "", role: "resident", temporaryPassword: "" });
  const [expenseForm, setExpenseForm] = useState<ExpenseForm>({ description: "", amount: "", category: "general" });
  const [maintenanceTab, setMaintenanceTab] = useState<"pendingRepairs" | "active" | "completed" | "upcoming" | "archived">("active");
  const [editingMaintenanceId, setEditingMaintenanceId] = useState("");
  const [maintenanceForm, setMaintenanceForm] = useState<MaintenanceForm>({
    title: "",
    description: "",
    category: "other",
    priority: "medium",
    status: "planned",
    estimatedCost: "",
    actualCost: "",
    scheduledDate: "",
    completedDate: "",
    nextServiceDate: "",
    contractor: "",
    warranty: "",
    notes: "",
  });
  const [meetingForm, setMeetingForm] = useState<MeetingForm>({ title: "", description: "", meetingDate: "", location: "", meetingType: "board" });
  const [announcementForm, setAnnouncementForm] = useState<AnnouncementForm>({ title: "", content: "", type: "general", priority: "normal" });
  const [messageForm, setMessageForm] = useState<MessageForm>({ subject: "", content: "", priority: "normal" });
  const [messageRecipientMode, setMessageRecipientMode] = useState<"all" | "single">("all");
  const [selectedRecipientId, setSelectedRecipientId] = useState("");
  const [showRecipientDropdown, setShowRecipientDropdown] = useState(false);

  const [login, setLogin] = useState({ email: "", password: "" });
  const [signup, setSignup] = useState({ firstName: "", lastName: "", email: "", password: "" });
  const [reg, setReg] = useState({ strataName: "", address: "", city: "", province: "", postalCode: "", unitCount: "", adminFirstName: "", adminLastName: "", adminEmail: "", adminPhone: "", description: "" });

  const authed = !!(token && user);
  const unread = useMemo(() => notificationsList.filter((n) => !n.isRead).length, [notificationsList]);
  const filteredQuotes = useMemo(() => {
    if (quoteStatusFilter === "all") return quotes;
    return quotes.filter((q) => (q.status || "").toLowerCase() === quoteStatusFilter);
  }, [quotes, quoteStatusFilter]);
  const recipientOptions = useMemo(() => {
    return strataUsers
      .map((row: any) => {
        const uid = row?.userId || row?.user?.id;
        const email = row?.user?.email || "";
        const name = `${row?.user?.firstName || ""} ${row?.user?.lastName || ""}`.trim() || email || "User";
        return { id: uid, label: name, email };
      })
      .filter((u: any) => !!u.id && u.id !== user?.id);
  }, [strataUsers, user?.id]);
  const selectedRecipientLabel = useMemo(() => {
    if (!selectedRecipientId) return "Select user";
    return recipientOptions.find((u: any) => u.id === selectedRecipientId)?.label || "Select user";
  }, [recipientOptions, selectedRecipientId]);
  const isMasterAdmin = useMemo(() => {
    const email = (user?.email || "").toLowerCase();
    return email === "rfinnbogason@gmail.com" || (user?.role || "").toLowerCase() === "master_admin";
  }, [user?.email, user?.role]);
  const canManageVendors = useMemo(() => {
    if (isMasterAdmin) return true;
    return ["chairperson", "property_manager", "treasurer"].includes((selectedStrataRole || "").toLowerCase());
  }, [isMasterAdmin, selectedStrataRole]);

  useEffect(() => { (async () => {
    try { const saved = await SecureStore.getItemAsync(TOKEN_KEY); if (saved) { setToken(saved); await loadDashboard(saved); } }
    catch { await SecureStore.deleteItemAsync(TOKEN_KEY); }
    finally { setBooting(false); }
  })(); }, []);

  useEffect(() => {
    setShowTopBar(true);
    setShowRecipientDropdown(false);
    scrollY.current = 0;
  }, [screen, authView]);

  useEffect(() => {
    if (selectedVendorId && !vendors.some((v) => v.id === selectedVendorId)) {
      setSelectedVendorId("");
    }
    if (selectedQuoteVendorId && !vendors.some((v) => v.id === selectedQuoteVendorId)) {
      setSelectedQuoteVendorId("");
    }
  }, [vendors, selectedVendorId, selectedQuoteVendorId]);

  useEffect(() => {
    if (messageRecipientMode === "all") {
      setSelectedRecipientId("");
      setShowRecipientDropdown(false);
      return;
    }
    if (selectedRecipientId && !recipientOptions.some((u: any) => u.id === selectedRecipientId)) {
      setSelectedRecipientId("");
    }
  }, [messageRecipientMode, recipientOptions, selectedRecipientId]);

  async function registerPushToken(authToken: string) {
    try {
      if (!Device.isDevice) return;
      const perms = await Notifications.getPermissionsAsync();
      const finalStatus = perms.status === "granted" ? perms.status : (await Notifications.requestPermissionsAsync()).status;
      if (finalStatus !== "granted") return;
      const expoToken = (await Notifications.getExpoPushTokenAsync()).data;
      if (expoToken) await api("/api/user/fcm-token", { method: "POST", body: JSON.stringify({ token: expoToken }) }, authToken);
    } catch {}
  }

  async function loadDashboard(authToken: string) {
    const me = await api("/api/auth/me", { method: "GET" }, authToken);
    const list: Strata[] = await api("/api/strata", { method: "GET" }, authToken);
    setUser(me);
    setStrata(Array.isArray(list) ? list : []);
    if (list?.length) { setSelectedStrataId(list[0].id); await loadStrata(authToken, list[0].id); }
    const meEmail = String(me?.email || "").toLowerCase();
    if (meEmail === "rfinnbogason@gmail.com" || String(me?.role || "").toLowerCase() === "master_admin") {
      await loadMasterAdminData(authToken);
    } else {
      setAdminStrata([]);
      setAdminUsers([]);
    }
  }

  async function loadMasterAdminData(authToken: string) {
    const [as, au] = await Promise.all([
      api("/api/admin/strata", { method: "GET" }, authToken).catch(() => []),
      api("/api/admin/users", { method: "GET" }, authToken).catch(() => []),
    ]);
    setAdminStrata(Array.isArray(as) ? as : []);
    setAdminUsers(Array.isArray(au) ? au : []);
  }

  async function loadStrata(authToken: string, strataId: string) {
    const [m, f, a, n, su, p, mt, rr, me, q, ve, vc, vh, roleData, ex, an, msg, feeData, rem, un, fu] = await Promise.all([
      api(`/api/strata/${strataId}/metrics`, {}, authToken).catch(() => null),
      api(`/api/financial/summary/${strataId}`, {}, authToken).catch(() => null),
      api(`/api/strata/${strataId}/recent-activity`, {}, authToken).catch(() => []),
      api(`/api/strata/${strataId}/notifications`, {}, authToken).catch(() => []),
      api(`/api/strata/${strataId}/users`, {}, authToken).catch(() => []),
      api(`/api/strata/${strataId}/pending-approvals`, {}, authToken).catch(() => []),
      api(`/api/strata/${strataId}/maintenance`, {}, authToken).catch(() => []),
      api(`/api/strata/${strataId}/repair-requests?status=approved`, {}, authToken).catch(() => []),
      api(`/api/strata/${strataId}/meetings`, {}, authToken).catch(() => []),
      api(`/api/strata/${strataId}/quotes`, {}, authToken).catch(() => []),
      api(`/api/strata/${strataId}/vendors`, {}, authToken).catch(() => []),
      api(`/api/strata/${strataId}/vendor-contracts`, {}, authToken).catch(() => []),
      api(`/api/strata/${strataId}/vendor-history`, {}, authToken).catch(() => []),
      api(`/api/strata/${strataId}/user-role`, {}, authToken).catch(() => ({ role: "resident" })),
      api(`/api/strata/${strataId}/expenses`, {}, authToken).catch(() => []),
      api(`/api/strata/${strataId}/announcements`, {}, authToken).catch(() => []),
      api(`/api/strata/${strataId}/messages`, {}, authToken).catch(() => []),
      api(`/api/financial/fees/${strataId}`, {}, authToken).catch(() => null),
      api(`/api/financial/reminders/${strataId}`, {}, authToken).catch(() => []),
      api(`/api/strata/${strataId}/units`, {}, authToken).catch(() => []),
      api(`/api/strata/${strataId}/funds`, {}, authToken).catch(() => []),
    ]);
    setMetrics(m || null); setFinancial(f || null);
    setActivity(Array.isArray(a) ? a : []);
    setNotificationsList(Array.isArray(n) ? n : []);
    setStrataUsers(Array.isArray(su) ? su : []);
    setApprovals(Array.isArray(p) ? p : []);
    setMaintenance(Array.isArray(mt) ? mt : []);
    setApprovedRepairRequests(Array.isArray(rr) ? rr : []);
    setMeetings(Array.isArray(me) ? me : []);
    setQuotes(Array.isArray(q) ? q : []);
    setVendors(Array.isArray(ve) ? ve : []);
    setVendorContracts(Array.isArray(vc) ? vc : []);
    setVendorHistory(Array.isArray(vh) ? vh : []);
    setSelectedStrataRole(String((roleData as any)?.role || "resident"));
    setExpenses(Array.isArray(ex) ? ex : []);
    setAnnouncements(Array.isArray(an) ? an : []);
    setMessages(Array.isArray(msg) ? msg : []);
    const incomingTiers = (feeData as FeeData | null)?.feeStructure?.tiers;
    setFees(Array.isArray(incomingTiers) ? incomingTiers : [
      { id: "studio", name: "Studio Units", amount: 0 },
      { id: "one_bedroom", name: "One Bedroom", amount: 0 },
      { id: "two_bedroom", name: "Two Bedroom", amount: 0 },
    ]);
    setReminders(Array.isArray(rem) ? rem : []);
    setUnits(Array.isArray(un) ? un : []);
    setFunds(Array.isArray(fu) ? fu : []);
  }

  async function onLogin() {
    if (busy || !login.email.trim() || !login.password.trim()) return;
    setBusy(true); setError(""); setNotice("");
    try {
      const data = await api("/api/auth/login", { method: "POST", body: JSON.stringify({ email: login.email.trim().toLowerCase(), password: login.password }) });
      if (!data?.token) throw new Error("No auth token returned");
      setToken(data.token); await SecureStore.setItemAsync(TOKEN_KEY, data.token); await loadDashboard(data.token); await registerPushToken(data.token); setNotice("Signed in successfully.");
    } catch (e: any) { setError(e?.message || "Login failed"); } finally { setBusy(false); }
  }

  async function onSignup() {
    if (busy || !signup.firstName || !signup.lastName || !signup.email || signup.password.length < 6) return;
    setBusy(true); setError(""); setNotice("");
    try {
      const data = await api("/api/auth/signup", { method: "POST", body: JSON.stringify({ ...signup, email: signup.email.trim().toLowerCase() }) });
      if (!data?.token) throw new Error("No auth token returned");
      setToken(data.token); await SecureStore.setItemAsync(TOKEN_KEY, data.token); await loadDashboard(data.token); await registerPushToken(data.token); setNotice("Account created.");
    } catch (e: any) { setError(e?.message || "Signup failed"); } finally { setBusy(false); }
  }

  async function onRegisterStrata() {
    if (busy || Object.values(reg).some((v) => !String(v).trim())) return;
    const units = Number.parseInt(reg.unitCount, 10); if (!Number.isFinite(units) || units <= 0) return setError("Unit count must be greater than 0.");
    setBusy(true); setError(""); setNotice("");
    try {
      await api("/api/strata/register", { method: "POST", body: JSON.stringify({ ...reg, unitCount: units, adminEmail: reg.adminEmail.trim().toLowerCase(), managementType: "self_managed" }) }, token || undefined);
      setNotice("Strata registration submitted."); setAuthView("home");
    } catch (e: any) { setError(e?.message || "Registration failed"); } finally { setBusy(false); }
  }

  async function onSelectStrata(id: string) { if (!token || busy || id === selectedStrataId) return; setSelectedStrataId(id); setBusy(true); try { await loadStrata(token, id); } finally { setBusy(false); } }
  async function onRefresh() { if (!token || busy) return; setBusy(true); try { await loadDashboard(token); setNotice("Dashboard refreshed."); } finally { setBusy(false); } }
  async function markRead(id: string) { if (!token) return; try { await api(`/api/notifications/${id}/read`, { method: "PATCH" }, token); setNotificationsList((p) => p.map((n) => n.id === id ? { ...n, isRead: true } : n)); } catch {} }
  async function updateApproval(item: Item, status: "approved" | "rejected") {
    if (!token || busy) return;
    setBusy(true);
    try {
      await api(item.vendorId ? `/api/quotes/${item.id}` : `/api/expenses/${item.id}`, { method: "PATCH", body: JSON.stringify({ status }) }, token);
      await loadStrata(token, selectedStrataId);
      setNotice(`Item ${status}.`);
    } catch (e: any) { setError(e?.message || `Failed to ${status} item.`); } finally { setBusy(false); }
  }

  function normalizeAmountInput(value: unknown) {
    const cleaned = String(value ?? "").replace(/[^0-9.]/g, "");
    const parts = cleaned.split(".");
    if (parts.length <= 1) return cleaned;
    return `${parts[0]}.${parts.slice(1).join("")}`;
  }

  function applyExtractedQuoteData(data: Record<string, any>) {
    setQuoteForm((prev) => ({
      projectTitle: data.projectTitle ? String(data.projectTitle) : prev.projectTitle,
      description: data.description ? String(data.description) : (data.scope ? String(data.scope) : prev.description),
      amount: data.amount !== undefined && data.amount !== null ? normalizeAmountInput(data.amount) : prev.amount,
      vendorName: data.vendorName ? String(data.vendorName) : prev.vendorName,
    }));
  }

  async function analyzeQuoteImage(asset: ImagePicker.ImagePickerAsset) {
    if (!token) return;
    if (!asset.base64) { setError("Could not read image data. Please try again."); return; }
    const mimeType = asset.mimeType || "image/jpeg";
    const dataUrl = `data:${mimeType};base64,${asset.base64}`;

    setAnalyzingQuoteDoc(true);
    setError("");
    setNotice("");
    try {
      const extracted = await api("/api/quotes/analyze-document", {
        method: "POST",
        body: JSON.stringify({ fileData: dataUrl, mimeType }),
      }, token);
      applyExtractedQuoteData(extracted || {});
      setUploadedQuoteDocument({
        fileUrl: dataUrl,
        fileName: asset.fileName || `quote-${Date.now()}.jpg`,
        fileSize: asset.fileSize || 0,
        mimeType,
      });
      setQuotePreviewUri(asset.uri);
      setNotice("Quote document analyzed and attached.");
    } catch (e: any) {
      setError(e?.message || "Failed to analyze quote document.");
    } finally {
      setAnalyzingQuoteDoc(false);
    }
  }

  async function pickQuoteImageFromLibrary() {
    if (!token || busy || analyzingQuoteDoc) return;
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) { setError("Photo library permission is required to upload a quote image."); return; }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 0.9,
      base64: true,
    });
    if (result.canceled || !result.assets?.length) return;
    await analyzeQuoteImage(result.assets[0]);
  }

  async function captureQuoteWithCamera() {
    if (!token || busy || analyzingQuoteDoc) return;
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) { setError("Camera permission is required to take a quote photo."); return; }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 0.9,
      base64: true,
    });
    if (result.canceled || !result.assets?.length) return;
    await analyzeQuoteImage(result.assets[0]);
  }

  async function createQuote() {
    if (!token || !selectedStrataId || busy) return;
    if (!quoteForm.projectTitle.trim() || !quoteForm.description.trim() || !quoteForm.amount.trim()) return;
    setBusy(true); setError(""); setNotice("");
    try {
      await api(`/api/strata/${selectedStrataId}/quotes`, {
        method: "POST",
        body: JSON.stringify({
          projectTitle: quoteForm.projectTitle,
          description: quoteForm.description,
          amount: Number(quoteForm.amount),
          vendorName: quoteForm.vendorName || "Vendor",
          vendorId: selectedQuoteVendorId || undefined,
          category: "maintenance",
          status: "submitted",
          quoteDocument: uploadedQuoteDocument || undefined,
        }),
      }, token);
      setQuoteForm({ projectTitle: "", description: "", amount: "", vendorName: "" });
      setSelectedQuoteVendorId("");
      setUploadedQuoteDocument(null);
      setQuotePreviewUri("");
      await loadStrata(token, selectedStrataId);
      setNotice("Quote submitted.");
    } catch (e: any) { setError(e?.message || "Failed to create quote."); } finally { setBusy(false); }
  }

  async function updateQuoteStatus(id: string, status: "approved" | "rejected") {
    if (!token || busy) return;
    setBusy(true);
    try {
      await api(`/api/quotes/${id}`, { method: "PATCH", body: JSON.stringify({ status }) }, token);
      await loadStrata(token, selectedStrataId);
      setNotice(`Quote ${status}.`);
    } catch (e: any) { setError(e?.message || `Failed to ${status} quote.`); } finally { setBusy(false); }
  }

  function selectQuoteVendor(vendorId: string) {
    setSelectedQuoteVendorId(vendorId);
    const v = vendors.find((x) => x.id === vendorId);
    if (v?.name) {
      setQuoteForm((prev) => ({ ...prev, vendorName: v.name || prev.vendorName }));
    }
  }

  async function createVendor() {
    if (!token || !selectedStrataId || busy || !canManageVendors) return;
    if (!vendorForm.name.trim()) return;
    setBusy(true); setError(""); setNotice("");
    try {
      const payload = {
        name: vendorForm.name.trim(),
        contactInfo: {
          email: vendorForm.email || undefined,
          phone: vendorForm.phone || undefined,
        },
        serviceCategories: vendorForm.categories ? vendorForm.categories.split(",").map((v) => v.trim()).filter(Boolean) : [],
        businessLicense: vendorForm.businessLicense || undefined,
        emergencyContact: vendorForm.emergencyContact || undefined,
        isPreferred: vendorForm.isPreferred,
        notes: vendorForm.notes || undefined,
      };
      await api(`/api/strata/${selectedStrataId}/vendors`, { method: "POST", body: JSON.stringify(payload) }, token);
      setVendorForm({ name: "", email: "", phone: "", categories: "", businessLicense: "", emergencyContact: "", notes: "", isPreferred: false });
      await loadStrata(token, selectedStrataId);
      setNotice("Vendor created.");
    } catch (e: any) { setError(e?.message || "Failed to create vendor."); } finally { setBusy(false); }
  }

  async function createVendorContract() {
    if (!token || !selectedStrataId || busy || !canManageVendors || !selectedVendorId) return;
    if (!contractForm.contractName.trim() || !contractForm.startDate.trim() || !contractForm.costAmount.trim()) return;
    setBusy(true); setError(""); setNotice("");
    try {
      const payload = {
        strataId: selectedStrataId,
        contractName: contractForm.contractName,
        description: contractForm.description || undefined,
        startDate: contractForm.startDate,
        endDate: contractForm.endDate || undefined,
        costAmount: contractForm.costAmount,
        costFrequency: contractForm.costFrequency || "monthly",
        paymentTerms: contractForm.paymentTerms || undefined,
        serviceScope: contractForm.serviceScope || undefined,
        autoRenew: contractForm.autoRenew,
      };
      await api(`/api/vendors/${selectedVendorId}/contracts`, { method: "POST", body: JSON.stringify(payload) }, token);
      setContractForm({ contractName: "", description: "", startDate: "", endDate: "", costAmount: "", costFrequency: "monthly", paymentTerms: "", serviceScope: "", autoRenew: false });
      await loadStrata(token, selectedStrataId);
      setNotice("Vendor contract created.");
    } catch (e: any) { setError(e?.message || "Failed to create contract."); } finally { setBusy(false); }
  }

  async function createVendorHistoryEntry() {
    if (!token || !selectedStrataId || busy || !canManageVendors || !selectedVendorId) return;
    if (!vendorHistoryForm.title.trim() || !vendorHistoryForm.eventDate.trim()) return;
    setBusy(true); setError(""); setNotice("");
    try {
      const payload = {
        strataId: selectedStrataId,
        eventType: vendorHistoryForm.eventType || "service_completed",
        title: vendorHistoryForm.title,
        description: vendorHistoryForm.description || undefined,
        rating: vendorHistoryForm.rating ? Number(vendorHistoryForm.rating) : undefined,
        cost: vendorHistoryForm.cost || undefined,
        eventDate: vendorHistoryForm.eventDate,
      };
      await api(`/api/vendors/${selectedVendorId}/history`, { method: "POST", body: JSON.stringify(payload) }, token);
      setVendorHistoryForm({ eventType: "service_completed", title: "", description: "", rating: "", cost: "", eventDate: "" });
      await loadStrata(token, selectedStrataId);
      setNotice("Vendor history added.");
    } catch (e: any) { setError(e?.message || "Failed to create history entry."); } finally { setBusy(false); }
  }

  async function createAdminStrata() {
    if (!token || busy || !isMasterAdmin) return;
    if (!adminStrataForm.name.trim() || !adminStrataForm.address.trim() || !adminStrataForm.unitCount.trim()) return;
    setBusy(true); setError(""); setNotice("");
    try {
      await api("/api/admin/strata", {
        method: "POST",
        body: JSON.stringify({
          name: adminStrataForm.name,
          address: adminStrataForm.address,
          city: adminStrataForm.city || undefined,
          province: adminStrataForm.province || undefined,
          postalCode: adminStrataForm.postalCode || undefined,
          country: adminStrataForm.country || "Canada",
          unitCount: Number(adminStrataForm.unitCount),
          email: adminStrataForm.email || undefined,
          phoneNumber: adminStrataForm.phoneNumber || undefined,
        }),
      }, token);
      setAdminStrataForm({ name: "", address: "", city: "", province: "", postalCode: "", country: "Canada", unitCount: "", email: "", phoneNumber: "" });
      await loadMasterAdminData(token);
      setNotice("Strata organization created.");
    } catch (e: any) { setError(e?.message || "Failed to create strata."); } finally { setBusy(false); }
  }

  async function createAdminUser() {
    if (!token || busy || !isMasterAdmin) return;
    if (!adminUserForm.email.trim() || !adminUserForm.temporaryPassword.trim()) return;
    setBusy(true); setError(""); setNotice("");
    try {
      await api("/api/admin/users", {
        method: "POST",
        body: JSON.stringify({
          email: adminUserForm.email.trim().toLowerCase(),
          firstName: adminUserForm.firstName || undefined,
          lastName: adminUserForm.lastName || undefined,
          role: adminUserForm.role || "resident",
          temporaryPassword: adminUserForm.temporaryPassword,
        }),
      }, token);
      setAdminUserForm({ email: "", firstName: "", lastName: "", role: "resident", temporaryPassword: "" });
      await loadMasterAdminData(token);
      setNotice("User created.");
    } catch (e: any) { setError(e?.message || "Failed to create user."); } finally { setBusy(false); }
  }

  async function createExpense() {
    if (!token || !selectedStrataId || busy) return;
    if (!expenseForm.description.trim() || !expenseForm.amount.trim()) return;
    setBusy(true); setError(""); setNotice("");
    try {
      await api(`/api/strata/${selectedStrataId}/expenses`, {
        method: "POST",
        body: JSON.stringify({
          description: expenseForm.description,
          amount: Number(expenseForm.amount),
          category: expenseForm.category,
          status: "pending",
        }),
      }, token);
      setExpenseForm({ description: "", amount: "", category: "general" });
      await loadStrata(token, selectedStrataId);
      setNotice("Expense added.");
    } catch (e: any) { setError(e?.message || "Failed to add expense."); } finally { setBusy(false); }
  }

  async function updateExpenseStatus(id: string, status: "approved" | "rejected") {
    if (!token || busy) return;
    setBusy(true);
    try {
      await api(`/api/expenses/${id}`, { method: "PATCH", body: JSON.stringify({ status }) }, token);
      await loadStrata(token, selectedStrataId);
      setNotice(`Expense ${status}.`);
    } catch (e: any) { setError(e?.message || `Failed to ${status} expense.`); } finally { setBusy(false); }
  }

  function beginEditExpense(exp: any) {
    setEditingExpenseId(exp.id);
    setEditExpenseForm({
      description: exp.description || "",
      amount: String(exp.amount || ""),
      category: exp.category || "general",
      expenseDate: exp.expenseDate ? String(exp.expenseDate).slice(0, 10) : "",
      isRecurring: !!exp.isRecurring,
      recurringFrequency: exp.recurringFrequency || "",
    });
  }

  async function saveEditedExpense() {
    if (!token || !editingExpenseId || busy) return;
    setBusy(true);
    try {
      await api(`/api/expenses/${editingExpenseId}`, {
        method: "PATCH",
        body: JSON.stringify({
          description: editExpenseForm.description,
          amount: Number(editExpenseForm.amount),
          category: editExpenseForm.category,
          expenseDate: editExpenseForm.expenseDate || undefined,
          isRecurring: editExpenseForm.isRecurring,
          recurringFrequency: editExpenseForm.isRecurring ? editExpenseForm.recurringFrequency || undefined : null,
        }),
      }, token);
      setEditingExpenseId("");
      await loadStrata(token, selectedStrataId);
      setNotice("Expense updated.");
    } catch (e: any) { setError(e?.message || "Failed to update expense."); } finally { setBusy(false); }
  }

  async function deleteExpense(id: string) {
    if (!token || busy) return;
    setBusy(true);
    try {
      await api(`/api/expenses/${id}`, { method: "DELETE" }, token);
      await loadStrata(token, selectedStrataId);
      setNotice("Expense deleted.");
    } catch (e: any) { setError(e?.message || "Failed to delete expense."); } finally { setBusy(false); }
  }

  function addFeeTier() {
    const id = `tier_${Date.now()}`;
    setFees((prev) => [...prev, { id, name: "New Tier", amount: 0 }]);
  }

  function updateFeeTier(id: string, patch: Partial<FeeTier>) {
    setFees((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t)));
  }

  function removeFeeTier(id: string) {
    setFees((prev) => (prev.length > 1 ? prev.filter((t) => t.id !== id) : prev));
  }

  async function saveFeeStructure() {
    if (!token || !selectedStrataId || busy) return;
    setBusy(true);
    try {
      await api("/api/financial/fees", { method: "POST", body: JSON.stringify({ strataId: selectedStrataId, feeStructure: { tiers: fees } }) }, token);
      await loadStrata(token, selectedStrataId);
      setNotice("Fee structure updated.");
    } catch (e: any) { setError(e?.message || "Failed to update fee structure."); } finally { setBusy(false); }
  }

  async function createReminder() {
    if (!token || !selectedStrataId || busy) return;
    if (!reminderForm.title.trim()) return;
    setBusy(true);
    try {
      await api("/api/financial/reminders", {
        method: "POST",
        body: JSON.stringify({
          strataId: selectedStrataId,
          title: reminderForm.title,
          reminderType: reminderForm.reminderType,
          unitId: reminderForm.unitId === "all" ? undefined : reminderForm.unitId,
          amount: reminderForm.amount ? Number(reminderForm.amount) : undefined,
          dueDate: reminderForm.dueDate || undefined,
          reminderTime: reminderForm.reminderTime || "09:00",
          isRecurring: reminderForm.isRecurring,
          recurringPattern: reminderForm.isRecurring ? reminderForm.recurringPattern : undefined,
          recurringInterval: reminderForm.isRecurring ? Number(reminderForm.recurringInterval || 1) : undefined,
          priority: reminderForm.priority || "normal",
          autoSend: true,
        }),
      }, token);
      setReminderForm({ title: "", reminderType: "monthly_strata_fee", unitId: "all", amount: "", dueDate: "", reminderTime: "09:00", isRecurring: false, recurringPattern: "monthly", recurringInterval: "1", priority: "normal" });
      await loadStrata(token, selectedStrataId);
      setNotice("Reminder created.");
    } catch (e: any) { setError(e?.message || "Failed to create reminder."); } finally { setBusy(false); }
  }

  async function deleteReminder(id: string) {
    if (!token || busy) return;
    setBusy(true);
    try {
      await api(`/api/financial/reminders/${id}`, { method: "DELETE" }, token);
      await loadStrata(token, selectedStrataId);
      setNotice("Reminder deleted.");
    } catch (e: any) { setError(e?.message || "Failed to delete reminder."); } finally { setBusy(false); }
  }

  function startEditUnit(unit: Unit) {
    setUnitForm({
      id: unit.id,
      unitNumber: unit.unitNumber || "",
      unitType: unit.unitType || "apartment",
      feeTierId: unit.feeTierId || "",
      ownerName: unit.ownerName || "",
      ownerEmail: unit.ownerEmail || "",
      ownerPhone: unit.ownerPhone || "",
      squareFootage: unit.squareFootage ? String(unit.squareFootage) : "",
      parkingSpaces: unit.parkingSpaces ? String(unit.parkingSpaces) : "",
    });
  }

  async function saveUnit() {
    if (!token || !selectedStrataId || busy) return;
    if (!unitForm.unitNumber.trim()) return;
    setBusy(true);
    try {
      const payload = {
        unitNumber: unitForm.unitNumber,
        unitType: unitForm.unitType,
        feeTierId: unitForm.feeTierId || undefined,
        ownerName: unitForm.ownerName || undefined,
        ownerEmail: unitForm.ownerEmail || undefined,
        ownerPhone: unitForm.ownerPhone || undefined,
        squareFootage: unitForm.squareFootage ? Number(unitForm.squareFootage) : undefined,
        parkingSpaces: unitForm.parkingSpaces ? Number(unitForm.parkingSpaces) : undefined,
      };
      if (unitForm.id) {
        await api(`/api/units/${unitForm.id}`, { method: "PATCH", body: JSON.stringify(payload) }, token);
      } else {
        await api(`/api/strata/${selectedStrataId}/units`, { method: "POST", body: JSON.stringify(payload) }, token);
      }
      setUnitForm({ id: "", unitNumber: "", unitType: "apartment", feeTierId: "", ownerName: "", ownerEmail: "", ownerPhone: "", squareFootage: "", parkingSpaces: "" });
      await loadStrata(token, selectedStrataId);
      setNotice("Dwelling saved.");
    } catch (e: any) { setError(e?.message || "Failed to save dwelling."); } finally { setBusy(false); }
  }

  async function deleteUnit(id: string) {
    if (!token || busy) return;
    setBusy(true);
    try {
      await api(`/api/units/${id}`, { method: "DELETE" }, token);
      await loadStrata(token, selectedStrataId);
      setNotice("Dwelling deleted.");
    } catch (e: any) { setError(e?.message || "Failed to delete dwelling."); } finally { setBusy(false); }
  }

  function startEditFund(fund: Fund) {
    setFundForm({
      id: fund.id,
      name: fund.name || "",
      type: fund.type || "reserve",
      balance: String(fund.balance || ""),
      target: String(fund.target || ""),
      interestRate: String(fund.interestRate || ""),
      institution: fund.institution || "",
    });
  }

  async function saveFund() {
    if (!token || !selectedStrataId || busy) return;
    if (!fundForm.name.trim()) return;
    setBusy(true);
    try {
      const payload = {
        name: fundForm.name,
        type: fundForm.type,
        balance: fundForm.balance || "0",
        target: fundForm.target || undefined,
        interestRate: fundForm.interestRate || undefined,
        institution: fundForm.institution || undefined,
      };
      if (fundForm.id) {
        await api(`/api/funds/${fundForm.id}`, { method: "PATCH", body: JSON.stringify(payload) }, token);
      } else {
        await api(`/api/strata/${selectedStrataId}/funds`, { method: "POST", body: JSON.stringify(payload) }, token);
      }
      setFundForm({ id: "", name: "", type: "reserve", balance: "", target: "", interestRate: "", institution: "" });
      await loadStrata(token, selectedStrataId);
      setNotice("Fund saved.");
    } catch (e: any) { setError(e?.message || "Failed to save fund."); } finally { setBusy(false); }
  }

  async function deleteFund(id: string) {
    if (!token || busy) return;
    setBusy(true);
    try {
      await api(`/api/funds/${id}`, { method: "DELETE" }, token);
      await loadStrata(token, selectedStrataId);
      setNotice("Fund deleted.");
    } catch (e: any) { setError(e?.message || "Failed to delete fund."); } finally { setBusy(false); }
  }

  async function addTransaction() {
    if (!token || busy || !transactionForm.fundId || !transactionForm.amount) return;
    setBusy(true);
    try {
      await api(`/api/funds/${transactionForm.fundId}/transactions`, {
        method: "POST",
        body: JSON.stringify({
          type: transactionForm.type,
          amount: transactionForm.amount,
          description: transactionForm.description || undefined,
          transactionDate: transactionForm.transactionDate || new Date().toISOString().slice(0, 10),
        }),
      }, token);
      setTransactionForm({ fundId: "", type: "contribution", amount: "", description: "", transactionDate: "" });
      await loadStrata(token, selectedStrataId);
      setNotice("Transaction recorded.");
    } catch (e: any) { setError(e?.message || "Failed to record transaction."); } finally { setBusy(false); }
  }

  function resetMaintenanceForm() {
    setEditingMaintenanceId("");
    setMaintenanceForm({
      title: "",
      description: "",
      category: "other",
      priority: "medium",
      status: "planned",
      estimatedCost: "",
      actualCost: "",
      scheduledDate: "",
      completedDate: "",
      nextServiceDate: "",
      contractor: "",
      warranty: "",
      notes: "",
    });
  }

  function startEditMaintenance(project: any) {
    setEditingMaintenanceId(project.id);
    setMaintenanceForm({
      title: project.title || "",
      description: project.description || "",
      category: project.category || "other",
      priority: project.priority || "medium",
      status: project.status || "planned",
      estimatedCost: project.estimatedCost ? String(project.estimatedCost) : "",
      actualCost: project.actualCost ? String(project.actualCost) : "",
      scheduledDate: project.scheduledDate ? String(project.scheduledDate).slice(0, 10) : "",
      completedDate: project.completedDate ? String(project.completedDate).slice(0, 10) : "",
      nextServiceDate: project.nextServiceDate ? String(project.nextServiceDate).slice(0, 10) : "",
      contractor: project.contractor || "",
      warranty: project.warranty || "",
      notes: project.notes || "",
    });
  }

  async function saveMaintenanceProject() {
    if (!token || !selectedStrataId || busy) return;
    if (!maintenanceForm.title.trim()) return;
    setBusy(true); setError(""); setNotice("");
    try {
      const payload = {
        title: maintenanceForm.title,
        description: maintenanceForm.description || undefined,
        category: maintenanceForm.category || "other",
        priority: maintenanceForm.priority || "medium",
        status: maintenanceForm.status || "planned",
        estimatedCost: maintenanceForm.estimatedCost ? Number(maintenanceForm.estimatedCost) : 0,
        actualCost: maintenanceForm.actualCost ? Number(maintenanceForm.actualCost) : undefined,
        scheduledDate: maintenanceForm.scheduledDate || undefined,
        completedDate: maintenanceForm.completedDate || undefined,
        nextServiceDate: maintenanceForm.nextServiceDate || undefined,
        contractor: maintenanceForm.contractor || undefined,
        warranty: maintenanceForm.warranty || undefined,
        notes: maintenanceForm.notes || undefined,
      };
      if (editingMaintenanceId) {
        await api(`/api/maintenance/${editingMaintenanceId}`, { method: "PATCH", body: JSON.stringify(payload) }, token);
        setNotice("Maintenance project updated.");
      } else {
        await api(`/api/strata/${selectedStrataId}/maintenance`, { method: "POST", body: JSON.stringify(payload) }, token);
        setNotice("Maintenance project created.");
      }
      resetMaintenanceForm();
      await loadStrata(token, selectedStrataId);
    } catch (e: any) { setError(e?.message || "Failed to save maintenance project."); } finally { setBusy(false); }
  }

  async function updateMaintenanceStatus(id: string, status: string) {
    if (!token || busy) return;
    setBusy(true);
    try {
      await api(`/api/maintenance/${id}`, { method: "PATCH", body: JSON.stringify({ status }) }, token);
      await loadStrata(token, selectedStrataId);
      setNotice("Maintenance updated.");
    } catch (e: any) { setError(e?.message || "Failed to update maintenance."); } finally { setBusy(false); }
  }

  async function archiveMaintenanceProject(id: string, archived: boolean) {
    if (!token || busy) return;
    setBusy(true);
    try {
      await api(`/api/maintenance/${id}/${archived ? "archive" : "unarchive"}`, { method: "PATCH" }, token);
      await loadStrata(token, selectedStrataId);
      setNotice(archived ? "Project archived." : "Project unarchived.");
    } catch (e: any) { setError(e?.message || "Failed to update archive status."); } finally { setBusy(false); }
  }

  async function deleteMaintenanceProject(id: string) {
    if (!token || busy) return;
    setBusy(true);
    try {
      await api(`/api/maintenance/${id}`, { method: "DELETE" }, token);
      await loadStrata(token, selectedStrataId);
      setNotice("Project deleted.");
    } catch (e: any) { setError(e?.message || "Failed to delete project."); } finally { setBusy(false); }
  }

  async function convertRepairToMaintenance(repairRequestId: string) {
    if (!token || busy) return;
    setBusy(true);
    try {
      await api(`/api/repair-requests/${repairRequestId}/convert-to-maintenance`, { method: "POST" }, token);
      await loadStrata(token, selectedStrataId);
      setNotice("Repair request converted to project.");
      setMaintenanceTab("active");
    } catch (e: any) { setError(e?.message || "Failed to convert repair request."); } finally { setBusy(false); }
  }

  async function deleteRepairRequest(id: string) {
    if (!token || busy) return;
    setBusy(true);
    try {
      await api(`/api/repair-requests/${id}`, { method: "DELETE" }, token);
      await loadStrata(token, selectedStrataId);
      setNotice("Repair request deleted.");
    } catch (e: any) { setError(e?.message || "Failed to delete repair request."); } finally { setBusy(false); }
  }

  async function createMeeting() {
    if (!token || !selectedStrataId || busy) return;
    if (!meetingForm.title.trim() || !meetingForm.meetingDate.trim()) return;
    setBusy(true); setError(""); setNotice("");
    try {
      const meetingIso = new Date(meetingForm.meetingDate).toISOString();
      await api(`/api/strata/${selectedStrataId}/meetings`, {
        method: "POST",
        body: JSON.stringify({
          title: meetingForm.title,
          description: meetingForm.description,
          meetingType: meetingForm.meetingType,
          meetingDate: meetingIso,
          scheduledAt: meetingIso,
          location: meetingForm.location,
          status: "scheduled",
        }),
      }, token);
      setMeetingForm({ title: "", description: "", meetingDate: "", location: "", meetingType: "board" });
      await loadStrata(token, selectedStrataId);
      setNotice("Meeting scheduled.");
    } catch (e: any) { setError(e?.message || "Failed to schedule meeting."); } finally { setBusy(false); }
  }

  async function updateMeetingStatus(id: string, status: string) {
    if (!token || busy) return;
    setBusy(true);
    try {
      await api(`/api/meetings/${id}`, { method: "PATCH", body: JSON.stringify({ status }) }, token);
      await loadStrata(token, selectedStrataId);
      setNotice("Meeting updated.");
    } catch (e: any) { setError(e?.message || "Failed to update meeting."); } finally { setBusy(false); }
  }

  async function createAnnouncement() {
    if (!token || !selectedStrataId || busy) return;
    if (!announcementForm.title.trim() || !announcementForm.content.trim()) return;
    setBusy(true); setError(""); setNotice("");
    try {
      await api(`/api/strata/${selectedStrataId}/announcements`, {
        method: "POST",
        body: JSON.stringify({
          title: announcementForm.title,
          content: announcementForm.content,
          type: announcementForm.type,
          priority: announcementForm.priority,
        }),
      }, token);
      setAnnouncementForm({ title: "", content: "", type: "general", priority: "normal" });
      await loadStrata(token, selectedStrataId);
      setNotice("Announcement posted.");
    } catch (e: any) { setError(e?.message || "Failed to post announcement."); } finally { setBusy(false); }
  }

  async function sendMessage() {
    if (!token || !selectedStrataId || busy) return;
    if (!messageForm.subject.trim() || !messageForm.content.trim()) return;
    const recipientIds = messageRecipientMode === "all"
      ? recipientOptions.map((u: any) => u.id)
      : (selectedRecipientId ? [selectedRecipientId] : []);
    if (!recipientIds.length) {
      setError(messageRecipientMode === "single" ? "Please select a user to send this message." : "No recipients available in this strata.");
      return;
    }
    setBusy(true); setError(""); setNotice("");
    try {
      await api(`/api/strata/${selectedStrataId}/messages`, {
        method: "POST",
        body: JSON.stringify({
          subject: messageForm.subject,
          content: messageForm.content,
          priority: messageForm.priority,
          messageType: messageRecipientMode === "all" ? "broadcast" : "private",
          isGroupChat: messageRecipientMode === "all",
          recipientIds,
        }),
      }, token);
      setMessageForm({ subject: "", content: "", priority: "normal" });
      setSelectedRecipientId("");
      setShowRecipientDropdown(false);
      await loadStrata(token, selectedStrataId);
      setNotice(messageRecipientMode === "all" ? `Message sent to ${recipientIds.length} users.` : "Message sent.");
    } catch (e: any) {
      const msg = e?.message || "Failed to send message.";
      setError(`${msg} [API: ${BASE_URL}]`);
    } finally { setBusy(false); }
  }

  async function logout() {
    setToken(null);
    setUser(null);
    setStrata([]);
    setSelectedStrataId("");
    setSelectedStrataRole("resident");
    setStrataUsers([]);
    setVendors([]);
    setVendorContracts([]);
    setVendorHistory([]);
    setMessageRecipientMode("all");
    setSelectedRecipientId("");
    setShowRecipientDropdown(false);
    setAdminStrata([]);
    setAdminUsers([]);
    setAuthView("home");
    setScreen("overview");
    await SecureStore.deleteItemAsync(TOKEN_KEY);
  }

  function onScroll(y: number, viewportHeight: number, contentHeight: number) {
    if (drawerOpen) return;
    const overflow = contentHeight - viewportHeight;
    if (overflow <= 80) {
      if (!showTopBar) setShowTopBar(true);
      scrollY.current = y;
      return;
    }
    const maxY = Math.max(0, overflow);
    const atTop = y <= 4;
    const atBottom = y >= maxY - 4;
    if (atTop) {
      if (!showTopBar) setShowTopBar(true);
      scrollY.current = 0;
      return;
    }
    if (atBottom) {
      scrollY.current = y;
      return;
    }
    const d = y - scrollY.current;
    if (Math.abs(d) >= 20) {
      if (d > 0 && y > 64) setShowTopBar(false);
      if (d < 0) setShowTopBar(true);
      scrollY.current = y;
    }
  }
  const banner = error ? <View style={s.err}><Text style={s.errT}>{error}</Text></View> : notice ? <View style={s.ok}><Text style={s.okT}>{notice}</Text></View> : null;
  const quickMeetings = meetings.filter((m) => m.status === "scheduled" && m.scheduledAt && new Date(m.scheduledAt).getTime() > Date.now()).slice(0, 3);
  const nonArchivedMaintenance = maintenance.filter((m: any) => !m.archived);
  const archivedMaintenance = maintenance.filter((m: any) => !!m.archived);
  const activeMaintenance = nonArchivedMaintenance.filter((m: any) => ["planned", "scheduled", "in-progress", "in_progress"].includes(String(m.status || "").toLowerCase()));
  const completedMaintenance = nonArchivedMaintenance.filter((m: any) => String(m.status || "").toLowerCase() === "completed");
  const upcomingMaintenance = nonArchivedMaintenance.filter((m: any) => {
    if (!m.nextServiceDate) return false;
    const t = new Date(m.nextServiceDate).getTime();
    return Number.isFinite(t) && t > Date.now();
  });

  function Drawer() {
    if (!drawerOpen) return null;
    const currentStrata = strata.find((x) => x.id === selectedStrataId);
    const item = (id: AppScreen, t: string) => <TouchableOpacity key={id} style={[s.drawerItem, screen === id && s.drawerItemA]} onPress={() => { setScreen(id); setShowTopBar(true); setDrawerOpen(false); }}><Text style={[s.drawerT, screen === id && s.drawerTA]}>{t}</Text></TouchableOpacity>;
    return <View style={s.drawerWrap}><View style={s.drawer}><View style={s.drawerHeader}><Text style={s.drawerHeaderLabel}>Current Strata</Text><Text style={s.drawerHeaderValue}>{currentStrata?.name || "No strata selected"}</Text></View>{strata.length > 1 ? <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.drawerStrataRow}><View style={s.row}>{strata.map((st) => <TouchableOpacity key={st.id} style={[s.chip, st.id === selectedStrataId && s.chipA]} onPress={() => { onSelectStrata(st.id); setShowTopBar(true); }}><Text style={[s.chipT, st.id === selectedStrataId && s.chipTA]}>{st.name || "Strata"}</Text></TouchableOpacity>)}</View></ScrollView> : null}{item("overview","Overview")}{item("quotes","Quotes")}{item("vendors","Vendors")}{item("financial","Financial")}{item("maintenance","Maintenance")}{item("meetings","Meetings")}{item("communications","Communications")}{item("notifications","Notifications")}{item("account","Account")}{isMasterAdmin ? item("masterAdmin", "Master Admin") : null}<TouchableOpacity style={s.drawerItem} onPress={() => { setShowTopBar(true); onRefresh(); }}><Text style={s.drawerT}>Refresh Data</Text></TouchableOpacity></View><Pressable style={s.backdrop} onPress={() => setDrawerOpen(false)} /></View>;
  }

  if (booting) return <SafeAreaView style={s.safe}><StatusBar style="dark" /><View style={s.center}><ActivityIndicator size="large" color="#16a34a" /><Text>Loading VibeStrat...</Text></View></SafeAreaView>;

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView style={s.safe} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <View style={[s.top, !showTopBar && s.topHidden]}>
          <TouchableOpacity style={s.iconBtn} onPress={() => setDrawerOpen((v) => !v)}><Text style={s.icon}>☰</Text></TouchableOpacity>
          <View style={s.topCenter} pointerEvents="none"><Image source={require("./assets/logo.png")} style={s.topLogo} resizeMode="contain" /></View>
          <TouchableOpacity style={s.iconBtn} onPress={() => setScreen("notifications")}><Text style={s.icon}>🔔</Text>{unread > 0 ? <View style={s.badge}><Text style={s.badgeT}>{unread > 9 ? "9+" : unread}</Text></View> : null}</TouchableOpacity>
        </View>
        <ScrollView contentContainerStyle={s.c} keyboardShouldPersistTaps="handled" onScroll={(e) => onScroll(e.nativeEvent.contentOffset.y, e.nativeEvent.layoutMeasurement.height, e.nativeEvent.contentSize.height)} scrollEventThrottle={16} bounces={false} alwaysBounceVertical={false} overScrollMode="never">
          {banner}
          {!authed ? (
            authView === "home" ? <View style={s.card}><Text style={s.hGreen}>Transform Your Strata</Text><Text style={s.hDark}>Management Experience</Text><Text style={s.sub}>The complete platform for strata and rental management in one place.</Text><View style={s.row}><TouchableOpacity style={s.btnP} onPress={() => setAuthView("signup")}><Text style={s.btnPT}>Start Free Trial</Text></TouchableOpacity><TouchableOpacity style={s.btnS} onPress={() => setAuthView("login")}><Text style={s.btnST}>Sign In</Text></TouchableOpacity></View></View> :
            authView === "login" ? <View style={s.card}><Text style={s.section}>Sign In</Text><TextInput style={s.input} value={login.email} onChangeText={(v) => setLogin((p) => ({ ...p, email: v }))} placeholder="Email" autoCapitalize="none" /><TextInput style={s.input} value={login.password} onChangeText={(v) => setLogin((p) => ({ ...p, password: v }))} placeholder="Password" secureTextEntry /><TouchableOpacity style={[s.btnP, busy && s.dis]} onPress={onLogin} disabled={busy}>{busy ? <ActivityIndicator color="#fff" /> : <Text style={s.btnPT}>Sign In</Text>}</TouchableOpacity><TouchableOpacity style={s.link} onPress={() => setAuthView("signup")}><Text style={s.linkT}>Create account</Text></TouchableOpacity><TouchableOpacity style={s.link} onPress={() => setAuthView("home")}><Text style={s.linkT}>Back</Text></TouchableOpacity></View> :
            authView === "signup" ? <View style={s.card}><Text style={s.section}>Create Account</Text><View style={s.row}><TextInput style={[s.input,s.flex]} value={signup.firstName} onChangeText={(v) => setSignup((p) => ({ ...p, firstName: v }))} placeholder="First name" /><TextInput style={[s.input,s.flex]} value={signup.lastName} onChangeText={(v) => setSignup((p) => ({ ...p, lastName: v }))} placeholder="Last name" /></View><TextInput style={s.input} value={signup.email} onChangeText={(v) => setSignup((p) => ({ ...p, email: v }))} placeholder="Email" autoCapitalize="none" /><TextInput style={s.input} value={signup.password} onChangeText={(v) => setSignup((p) => ({ ...p, password: v }))} placeholder="Password (min 6 chars)" secureTextEntry /><TouchableOpacity style={[s.btnP, busy && s.dis]} onPress={onSignup} disabled={busy}>{busy ? <ActivityIndicator color="#fff" /> : <Text style={s.btnPT}>Create Account</Text>}</TouchableOpacity><TouchableOpacity style={s.btnS} onPress={() => setAuthView("strata")}><Text style={s.btnST}>Register Strata Only</Text></TouchableOpacity><TouchableOpacity style={s.link} onPress={() => setAuthView("login")}><Text style={s.linkT}>Already have account</Text></TouchableOpacity></View> :
            <View style={s.card}><Text style={s.section}>Register Strata</Text><TextInput style={s.input} value={reg.strataName} onChangeText={(v) => setReg((p) => ({ ...p, strataName: v }))} placeholder="Strata name" /><TextInput style={s.input} value={reg.address} onChangeText={(v) => setReg((p) => ({ ...p, address: v }))} placeholder="Address" /><View style={s.row}><TextInput style={[s.input,s.flex]} value={reg.city} onChangeText={(v) => setReg((p) => ({ ...p, city: v }))} placeholder="City" /><TextInput style={[s.input,s.flex]} value={reg.province} onChangeText={(v) => setReg((p) => ({ ...p, province: v }))} placeholder="Province" /></View><View style={s.row}><TextInput style={[s.input,s.flex]} value={reg.postalCode} onChangeText={(v) => setReg((p) => ({ ...p, postalCode: v }))} placeholder="Postal code" /><TextInput style={[s.input,s.flex]} value={reg.unitCount} onChangeText={(v) => setReg((p) => ({ ...p, unitCount: v }))} placeholder="Unit count" keyboardType="number-pad" /></View><View style={s.row}><TextInput style={[s.input,s.flex]} value={reg.adminFirstName} onChangeText={(v) => setReg((p) => ({ ...p, adminFirstName: v }))} placeholder="Admin first name" /><TextInput style={[s.input,s.flex]} value={reg.adminLastName} onChangeText={(v) => setReg((p) => ({ ...p, adminLastName: v }))} placeholder="Admin last name" /></View><TextInput style={s.input} value={reg.adminEmail} onChangeText={(v) => setReg((p) => ({ ...p, adminEmail: v }))} placeholder="Admin email" autoCapitalize="none" /><TextInput style={s.input} value={reg.adminPhone} onChangeText={(v) => setReg((p) => ({ ...p, adminPhone: v }))} placeholder="Admin phone" /><TextInput style={s.input} value={reg.description} onChangeText={(v) => setReg((p) => ({ ...p, description: v }))} placeholder="Requirements" /><TouchableOpacity style={[s.btnP, busy && s.dis]} onPress={onRegisterStrata} disabled={busy}>{busy ? <ActivityIndicator color="#fff" /> : <Text style={s.btnPT}>Submit Registration</Text>}</TouchableOpacity><TouchableOpacity style={s.link} onPress={() => setAuthView("signup")}><Text style={s.linkT}>Back</Text></TouchableOpacity></View>
          ) : screen === "overview" ? (
            <View style={s.page}>
              <View style={s.card}><Text style={s.section}>Dashboard</Text><Text style={s.body}>Overview for {strata.find((x) => x.id === selectedStrataId)?.name || "your strata"}</Text></View>
              {strata.length ? <ScrollView horizontal showsHorizontalScrollIndicator={false}><View style={s.row}>{strata.map((x) => <TouchableOpacity key={x.id} style={[s.chip, x.id === selectedStrataId && s.chipA]} onPress={() => onSelectStrata(x.id)}><Text style={[s.chipT, x.id === selectedStrataId && s.chipTA]}>{x.name || "Strata"}</Text></TouchableOpacity>)}</View></ScrollView> : null}
              <View style={s.metric}><Text style={s.mLabel}>Total Properties</Text><Text style={s.mValue}>{String(metrics?.totalProperties ?? 0)}</Text></View>
              <View style={s.metric}><Text style={s.mLabel}>Outstanding Fees</Text><Text style={s.mValue}>{String(metrics?.outstandingFees ?? "$0")}</Text></View>
              <View style={s.metric}><Text style={s.mLabel}>Pending Approvals</Text><Text style={s.mValue}>{String(metrics?.pendingApprovals ?? approvals.length)}</Text></View>
              <View style={s.metric}><Text style={s.mLabel}>Open Maintenance</Text><Text style={s.mValue}>{String(metrics?.openMaintenance ?? maintenance.length)}</Text></View>
              <View style={s.card}><Text style={s.cardT}>Financial Overview</Text><Text style={s.body}>Monthly Revenue: {money(financial?.monthlyRevenue)}</Text><Text style={s.body}>Monthly Expenses: {money(financial?.monthlyExpenses)}</Text><Text style={s.body}>Reserve Fund: {money(financial?.reserveFund)}</Text><Text style={s.body}>Net Income: {money((financial?.monthlyRevenue || 0) - (financial?.monthlyExpenses || 0))}</Text></View>
              <View style={s.card}><Text style={s.cardT}>Recent Activity</Text>{activity.length ? activity.slice(0, 8).map((a) => <View key={a.id} style={s.list}><Text style={s.listT}>{a.title || "Activity"}</Text><Text style={s.body}>{a.description || "No description"}</Text><Text style={s.meta}>{when(a.createdAt)}</Text></View>) : <Text style={s.body}>No recent activity.</Text>}</View>
              <View style={s.card}><Text style={s.cardT}>Quick Actions</Text><TouchableOpacity style={s.action} onPress={() => setScreen("quotes")}><Text style={s.actionT}>Request Quote</Text></TouchableOpacity><TouchableOpacity style={s.action} onPress={() => setNotice("Meetings page parity is queued next.")}><Text style={s.actionT}>Schedule Meeting</Text></TouchableOpacity><TouchableOpacity style={s.action} onPress={() => setScreen("financial")}><Text style={s.actionT}>Add Expense</Text></TouchableOpacity><TouchableOpacity style={s.action} onPress={() => setNotice("Communications page parity is queued next.")}><Text style={s.actionT}>Send Announcement</Text></TouchableOpacity><Text style={s.cardT}>Upcoming Events</Text>{quickMeetings.length ? quickMeetings.map((m) => <Text key={m.id} style={s.body}>{m.title || "Meeting"} â€¢ {m.scheduledAt ? new Date(m.scheduledAt).toLocaleString() : "TBD"}</Text>) : <Text style={s.body}>No upcoming events.</Text>}</View>
              <View style={s.card}><Text style={s.cardT}>Pending Approvals</Text>{approvals.length ? approvals.slice(0, 8).map((p) => <View key={p.id} style={s.list}><Text style={s.listT}>{p.description || "Pending item"}</Text><Text style={s.body}>{p.vendorId ? "Quote" : "Expense"} â€¢ {money(p.amount)} â€¢ {when(p.createdAt)}</Text><View style={s.row}><TouchableOpacity style={s.smP} onPress={() => updateApproval(p, "approved")}><Text style={s.smT}>Approve</Text></TouchableOpacity><TouchableOpacity style={s.smR} onPress={() => updateApproval(p, "rejected")}><Text style={s.smT}>Reject</Text></TouchableOpacity></View></View>) : <Text style={s.body}>No pending approvals.</Text>}</View>
              <View style={s.card}><Text style={s.cardT}>Recent Maintenance</Text>{maintenance.length ? maintenance.slice(0, 5).map((m) => <View key={m.id} style={s.list}><Text style={s.listT}>{m.title || "Maintenance"}</Text><Text style={s.body}>{m.description || "No description"}</Text><Text style={s.meta}>{label(m.status)} â€¢ {when(m.createdAt)}</Text></View>) : <Text style={s.body}>No maintenance requests.</Text>}</View>
            </View>
          ) : screen === "notifications" ? (
            <View style={s.page}>
              <View style={s.card}><Text style={s.section}>Notifications</Text>{notificationsList.length ? notificationsList.map((n) => <TouchableOpacity key={n.id} style={[s.list, n.isRead ? s.nRead : s.nUnread]} onPress={() => markRead(n.id)}><Text style={s.listT}>{n.title || "Notification"}</Text><Text style={s.body}>{n.message || "No message"}</Text><Text style={s.meta}>{when(n.createdAt)}</Text></TouchableOpacity>) : <Text style={s.body}>No notifications yet.</Text>}</View>
              <View style={s.card}>
                <Text style={s.cardT}>Send Message</Text>
                <Text style={s.body}>Send to all users in this strata or select one user.</Text>
                <View style={s.row}>
                  <TouchableOpacity style={[s.chip, messageRecipientMode === "all" && s.chipA]} onPress={() => setMessageRecipientMode("all")}><Text style={[s.chipT, messageRecipientMode === "all" && s.chipTA]}>All Users</Text></TouchableOpacity>
                  <TouchableOpacity style={[s.chip, messageRecipientMode === "single" && s.chipA]} onPress={() => setMessageRecipientMode("single")}><Text style={[s.chipT, messageRecipientMode === "single" && s.chipTA]}>Single User</Text></TouchableOpacity>
                </View>
                {messageRecipientMode === "single" ? <View>
                  <TouchableOpacity style={s.selectInput} onPress={() => setShowRecipientDropdown((v) => !v)}>
                    <Text style={s.selectInputText}>{selectedRecipientLabel}</Text>
                  </TouchableOpacity>
                  {showRecipientDropdown ? <View style={s.dropdownList}>{recipientOptions.length ? recipientOptions.map((opt: any) => <TouchableOpacity key={opt.id} style={s.dropdownItem} onPress={() => { setSelectedRecipientId(opt.id); setShowRecipientDropdown(false); }}><Text style={s.dropdownItemText}>{opt.label}</Text><Text style={s.dropdownItemMeta}>{opt.email}</Text></TouchableOpacity>) : <Text style={s.body}>No users available.</Text>}</View> : null}
                </View> : null}
                <TextInput style={s.input} value={messageForm.subject} onChangeText={(v) => setMessageForm((p) => ({ ...p, subject: v }))} placeholder="Subject" />
                <TextInput style={s.input} value={messageForm.content} onChangeText={(v) => setMessageForm((p) => ({ ...p, content: v }))} placeholder="Message content" />
                <TextInput style={s.input} value={messageForm.priority} onChangeText={(v) => setMessageForm((p) => ({ ...p, priority: v }))} placeholder="Priority (normal/high/urgent)" />
                <TouchableOpacity style={[s.btnS, busy && s.dis]} onPress={sendMessage} disabled={busy}><Text style={s.btnST}>Send Message</Text></TouchableOpacity>
              </View>
            </View>
          ) : screen === "quotes" ? (
            <View style={s.page}>
              <View style={s.card}><Text style={s.section}>Quotes</Text><Text style={s.body}>Create and manage vendor quote approvals.</Text></View>
              <View style={s.card}>
                <Text style={s.cardT}>New Quote Request</Text>
                <Text style={s.body}>Add a quote document by taking a photo or uploading from your library. We'll extract details automatically.</Text>
                {vendors.length ? <View style={s.card}><Text style={s.meta}>Select Vendor (optional)</Text><ScrollView horizontal showsHorizontalScrollIndicator={false}><View style={s.row}><TouchableOpacity style={[s.chip, !selectedQuoteVendorId && s.chipA]} onPress={() => { setSelectedQuoteVendorId(""); }}><Text style={[s.chipT, !selectedQuoteVendorId && s.chipTA]}>No Vendor</Text></TouchableOpacity>{vendors.map((v) => <TouchableOpacity key={v.id} style={[s.chip, selectedQuoteVendorId === v.id && s.chipA]} onPress={() => selectQuoteVendor(v.id)}><Text style={[s.chipT, selectedQuoteVendorId === v.id && s.chipTA]}>{v.name || "Vendor"}</Text></TouchableOpacity>)}</View></ScrollView></View> : null}
                <View style={s.row}>
                  <TouchableOpacity style={[s.action, s.flex, (busy || analyzingQuoteDoc) && s.dis]} onPress={captureQuoteWithCamera} disabled={busy || analyzingQuoteDoc}>
                    <Text style={s.actionT}>Take Photo</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[s.action, s.flex, (busy || analyzingQuoteDoc) && s.dis]} onPress={pickQuoteImageFromLibrary} disabled={busy || analyzingQuoteDoc}>
                    <Text style={s.actionT}>Upload Image</Text>
                  </TouchableOpacity>
                </View>
                {analyzingQuoteDoc ? <View style={s.row}><ActivityIndicator color="#16a34a" /><Text style={s.body}>Analyzing quote image...</Text></View> : null}
                {uploadedQuoteDocument ? <View style={s.card}><Text style={s.meta}>Attached: {uploadedQuoteDocument.fileName}</Text>{quotePreviewUri ? <Image source={{ uri: quotePreviewUri }} style={s.quotePreview} resizeMode="cover" /> : null}</View> : null}
                <TextInput style={s.input} value={quoteForm.projectTitle} onChangeText={(v) => setQuoteForm((p) => ({ ...p, projectTitle: v }))} placeholder="Project title" />
                <TextInput style={s.input} value={quoteForm.description} onChangeText={(v) => setQuoteForm((p) => ({ ...p, description: v }))} placeholder="Description" />
                <View style={s.row}>
                  <TextInput style={[s.input,s.flex]} value={quoteForm.amount} onChangeText={(v) => setQuoteForm((p) => ({ ...p, amount: v }))} placeholder="Amount" keyboardType="decimal-pad" />
                  <TextInput style={[s.input,s.flex]} value={quoteForm.vendorName} onChangeText={(v) => setQuoteForm((p) => ({ ...p, vendorName: v }))} placeholder="Vendor" />
                </View>
                <TouchableOpacity style={[s.btnP, busy && s.dis]} onPress={createQuote} disabled={busy}><Text style={s.btnPT}>Submit Quote</Text></TouchableOpacity>
              </View>
              <View style={s.card}><Text style={s.cardT}>All Quotes</Text><ScrollView horizontal showsHorizontalScrollIndicator={false}><View style={s.row}><TouchableOpacity style={[s.chip, quoteStatusFilter === "all" && s.chipA]} onPress={() => setQuoteStatusFilter("all")}><Text style={[s.chipT, quoteStatusFilter === "all" && s.chipTA]}>All</Text></TouchableOpacity><TouchableOpacity style={[s.chip, quoteStatusFilter === "submitted" && s.chipA]} onPress={() => setQuoteStatusFilter("submitted")}><Text style={[s.chipT, quoteStatusFilter === "submitted" && s.chipTA]}>Submitted</Text></TouchableOpacity><TouchableOpacity style={[s.chip, quoteStatusFilter === "approved" && s.chipA]} onPress={() => setQuoteStatusFilter("approved")}><Text style={[s.chipT, quoteStatusFilter === "approved" && s.chipTA]}>Approved</Text></TouchableOpacity><TouchableOpacity style={[s.chip, quoteStatusFilter === "rejected" && s.chipA]} onPress={() => setQuoteStatusFilter("rejected")}><Text style={[s.chipT, quoteStatusFilter === "rejected" && s.chipTA]}>Rejected</Text></TouchableOpacity></View></ScrollView>{filteredQuotes.length ? filteredQuotes.map((q) => <View key={q.id} style={s.list}><Text style={s.listT}>{q.title || q.description || "Quote"}</Text><Text style={s.body}>{money(q.amount)} â€¢ {label(q.status)}{q.vendorId ? " • Linked Vendor" : ""}</Text><Text style={s.meta}>{when(q.createdAt)}</Text>{q.status !== "approved" ? <View style={s.row}><TouchableOpacity style={s.smP} onPress={() => updateQuoteStatus(q.id, "approved")}><Text style={s.smT}>Approve</Text></TouchableOpacity><TouchableOpacity style={s.smR} onPress={() => updateQuoteStatus(q.id, "rejected")}><Text style={s.smT}>Reject</Text></TouchableOpacity></View> : null}</View>) : <Text style={s.body}>No quotes in this filter.</Text>}</View>
            </View>
          ) : screen === "vendors" ? (
            <View style={s.page}>
              <View style={s.card}><Text style={s.section}>Vendors</Text><Text style={s.body}>Manage contractors, contracts, and service history. Quotes and vendors are linked through vendor selection.</Text><Text style={s.meta}>Role: {isMasterAdmin ? "master_admin" : selectedStrataRole}</Text></View>
              <View style={s.card}><Text style={s.cardT}>Vendor List</Text>{vendors.length ? vendors.map((v) => <TouchableOpacity key={v.id} style={[s.list, selectedVendorId === v.id && s.nUnread]} onPress={() => setSelectedVendorId(v.id)}><Text style={s.listT}>{v.name || "Vendor"}</Text><Text style={s.body}>{(v.serviceCategories || []).join(", ") || "No categories"}{v.isPreferred ? " • Preferred" : ""}</Text><Text style={s.meta}>{v.contactInfo?.email || v.contactInfo?.phone || "No contact info"}</Text></TouchableOpacity>) : <Text style={s.body}>No vendors yet.</Text>}</View>
              <View style={s.card}><Text style={s.cardT}>Create Vendor</Text>{canManageVendors ? <><TextInput style={s.input} value={vendorForm.name} onChangeText={(v) => setVendorForm((p) => ({ ...p, name: v }))} placeholder="Vendor name" /><View style={s.row}><TextInput style={[s.input,s.flex]} value={vendorForm.email} onChangeText={(v) => setVendorForm((p) => ({ ...p, email: v }))} placeholder="Email" autoCapitalize="none" /><TextInput style={[s.input,s.flex]} value={vendorForm.phone} onChangeText={(v) => setVendorForm((p) => ({ ...p, phone: v }))} placeholder="Phone" /></View><TextInput style={s.input} value={vendorForm.categories} onChangeText={(v) => setVendorForm((p) => ({ ...p, categories: v }))} placeholder="Categories (comma separated)" /><TextInput style={s.input} value={vendorForm.businessLicense} onChangeText={(v) => setVendorForm((p) => ({ ...p, businessLicense: v }))} placeholder="Business license" /><TextInput style={s.input} value={vendorForm.emergencyContact} onChangeText={(v) => setVendorForm((p) => ({ ...p, emergencyContact: v }))} placeholder="Emergency contact" /><TextInput style={s.input} value={vendorForm.notes} onChangeText={(v) => setVendorForm((p) => ({ ...p, notes: v }))} placeholder="Notes" /><TouchableOpacity style={[s.action, vendorForm.isPreferred && s.chipA]} onPress={() => setVendorForm((p) => ({ ...p, isPreferred: !p.isPreferred }))}><Text style={s.actionT}>{vendorForm.isPreferred ? "Preferred Vendor: Yes" : "Preferred Vendor: No"}</Text></TouchableOpacity><TouchableOpacity style={[s.btnP, busy && s.dis]} onPress={createVendor} disabled={busy}><Text style={s.btnPT}>Create Vendor</Text></TouchableOpacity></> : <Text style={s.body}>Only chairperson/property manager/treasurer/master admin can create vendors.</Text>}</View>
              {selectedVendorId ? <View style={s.card}><Text style={s.cardT}>Selected Vendor Details</Text><Text style={s.body}>{vendors.find((v) => v.id === selectedVendorId)?.name || "Vendor"}</Text><Text style={s.meta}>Contracts: {vendorContracts.filter((c) => c.vendorId === selectedVendorId).length} • History: {vendorHistory.filter((h) => h.vendorId === selectedVendorId).length}</Text>{canManageVendors ? <><Text style={s.cardT}>New Contract</Text><TextInput style={s.input} value={contractForm.contractName} onChangeText={(v) => setContractForm((p) => ({ ...p, contractName: v }))} placeholder="Contract name" /><TextInput style={s.input} value={contractForm.description} onChangeText={(v) => setContractForm((p) => ({ ...p, description: v }))} placeholder="Description" /><View style={s.row}><TextInput style={[s.input,s.flex]} value={contractForm.startDate} onChangeText={(v) => setContractForm((p) => ({ ...p, startDate: v }))} placeholder="Start date YYYY-MM-DD" /><TextInput style={[s.input,s.flex]} value={contractForm.endDate} onChangeText={(v) => setContractForm((p) => ({ ...p, endDate: v }))} placeholder="End date YYYY-MM-DD" /></View><View style={s.row}><TextInput style={[s.input,s.flex]} value={contractForm.costAmount} onChangeText={(v) => setContractForm((p) => ({ ...p, costAmount: v }))} placeholder="Cost amount" keyboardType="decimal-pad" /><TextInput style={[s.input,s.flex]} value={contractForm.costFrequency} onChangeText={(v) => setContractForm((p) => ({ ...p, costFrequency: v }))} placeholder="Frequency (monthly)" /></View><TouchableOpacity style={[s.btnP, busy && s.dis]} onPress={createVendorContract} disabled={busy}><Text style={s.btnPT}>Create Contract</Text></TouchableOpacity><Text style={s.cardT}>New History Entry</Text><View style={s.row}><TextInput style={[s.input,s.flex]} value={vendorHistoryForm.eventType} onChangeText={(v) => setVendorHistoryForm((p) => ({ ...p, eventType: v }))} placeholder="Event type" /><TextInput style={[s.input,s.flex]} value={vendorHistoryForm.eventDate} onChangeText={(v) => setVendorHistoryForm((p) => ({ ...p, eventDate: v }))} placeholder="Event date YYYY-MM-DD" /></View><TextInput style={s.input} value={vendorHistoryForm.title} onChangeText={(v) => setVendorHistoryForm((p) => ({ ...p, title: v }))} placeholder="Title" /><TextInput style={s.input} value={vendorHistoryForm.description} onChangeText={(v) => setVendorHistoryForm((p) => ({ ...p, description: v }))} placeholder="Description" /><View style={s.row}><TextInput style={[s.input,s.flex]} value={vendorHistoryForm.rating} onChangeText={(v) => setVendorHistoryForm((p) => ({ ...p, rating: v }))} placeholder="Rating 1-5" keyboardType="number-pad" /><TextInput style={[s.input,s.flex]} value={vendorHistoryForm.cost} onChangeText={(v) => setVendorHistoryForm((p) => ({ ...p, cost: v }))} placeholder="Cost" keyboardType="decimal-pad" /></View><TouchableOpacity style={[s.btnS, busy && s.dis]} onPress={createVendorHistoryEntry} disabled={busy}><Text style={s.btnST}>Create History Entry</Text></TouchableOpacity></> : null}<Text style={s.cardT}>Contracts</Text>{vendorContracts.filter((c) => c.vendorId === selectedVendorId).length ? vendorContracts.filter((c) => c.vendorId === selectedVendorId).map((c) => <View key={c.id} style={s.list}><Text style={s.listT}>{c.contractName || "Contract"}</Text><Text style={s.body}>{c.status || "active"} • {money(c.costAmount)} / {c.costFrequency || "monthly"}</Text><Text style={s.meta}>{c.startDate ? new Date(c.startDate).toLocaleDateString() : "No start date"}</Text></View>) : <Text style={s.body}>No contracts yet.</Text>}<Text style={s.cardT}>History</Text>{vendorHistory.filter((h) => h.vendorId === selectedVendorId).length ? vendorHistory.filter((h) => h.vendorId === selectedVendorId).map((h) => <View key={h.id} style={s.list}><Text style={s.listT}>{h.title || "History entry"}</Text><Text style={s.body}>{h.eventType || "event"}{h.rating ? ` • Rating ${h.rating}/5` : ""}{h.cost ? ` • ${money(h.cost)}` : ""}</Text><Text style={s.meta}>{h.eventDate ? new Date(h.eventDate).toLocaleDateString() : when(h.createdAt)}</Text></View>) : <Text style={s.body}>No history yet.</Text>}</View> : null}
            </View>
          ) : screen === "financial" ? (
            <View style={s.page}>
              <View style={s.card}><Text style={s.section}>Financial Management</Text><Text style={s.body}>Manage expenses, fees, reminders, dwellings, and funds.</Text></View>
              <View style={s.card}><Text style={s.cardT}>Summary</Text><Text style={s.body}>Monthly Revenue: {money(financial?.monthlyRevenue)}</Text><Text style={s.body}>Monthly Expenses: {money(financial?.monthlyExpenses)}</Text><Text style={s.body}>Reserve Fund: {money(financial?.reserveFund)}</Text><Text style={s.body}>Outstanding Fees: {String(metrics?.outstandingFees ?? "$0")}</Text></View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}><View style={s.row}><TouchableOpacity style={[s.chip, financialTab === "expenses" && s.chipA]} onPress={() => setFinancialTab("expenses")}><Text style={[s.chipT, financialTab === "expenses" && s.chipTA]}>Expenses</Text></TouchableOpacity><TouchableOpacity style={[s.chip, financialTab === "fees" && s.chipA]} onPress={() => setFinancialTab("fees")}><Text style={[s.chipT, financialTab === "fees" && s.chipTA]}>Fees</Text></TouchableOpacity><TouchableOpacity style={[s.chip, financialTab === "reminders" && s.chipA]} onPress={() => setFinancialTab("reminders")}><Text style={[s.chipT, financialTab === "reminders" && s.chipTA]}>Reminders</Text></TouchableOpacity><TouchableOpacity style={[s.chip, financialTab === "dwellings" && s.chipA]} onPress={() => setFinancialTab("dwellings")}><Text style={[s.chipT, financialTab === "dwellings" && s.chipTA]}>Dwellings</Text></TouchableOpacity><TouchableOpacity style={[s.chip, financialTab === "funds" && s.chipA]} onPress={() => setFinancialTab("funds")}><Text style={[s.chipT, financialTab === "funds" && s.chipTA]}>Funds</Text></TouchableOpacity></View></ScrollView>

              {financialTab === "expenses" ? <View style={s.card}><Text style={s.cardT}>Expenses</Text><TextInput style={s.input} value={expenseForm.description} onChangeText={(v) => setExpenseForm((p) => ({ ...p, description: v }))} placeholder="Title" /><View style={s.row}><TextInput style={[s.input,s.flex]} value={expenseForm.amount} onChangeText={(v) => setExpenseForm((p) => ({ ...p, amount: v }))} placeholder="Amount" keyboardType="decimal-pad" /><TextInput style={[s.input,s.flex]} value={expenseForm.category} onChangeText={(v) => setExpenseForm((p) => ({ ...p, category: v }))} placeholder="Category" /></View><TouchableOpacity style={[s.btnP, busy && s.dis]} onPress={createExpense} disabled={busy}><Text style={s.btnPT}>Create Expense</Text></TouchableOpacity>{expenses.length ? expenses.map((e: any) => <View key={e.id} style={s.list}><Text style={s.listT}>{e.description || "Expense"}</Text><Text style={s.body}>{money(e.amount)} • {e.category || "general"} • {label(e.status)}</Text><View style={s.row}><TouchableOpacity style={s.action} onPress={() => beginEditExpense(e)}><Text style={s.actionT}>Edit</Text></TouchableOpacity><TouchableOpacity style={s.action} onPress={() => deleteExpense(e.id)}><Text style={s.actionT}>Delete</Text></TouchableOpacity>{e.status === "pending" ? <><TouchableOpacity style={s.smP} onPress={() => updateExpenseStatus(e.id, "approved")}><Text style={s.smT}>Approve</Text></TouchableOpacity><TouchableOpacity style={s.smR} onPress={() => updateExpenseStatus(e.id, "rejected")}><Text style={s.smT}>Reject</Text></TouchableOpacity></> : null}</View>{editingExpenseId === e.id ? <View style={s.card}><TextInput style={s.input} value={editExpenseForm.description} onChangeText={(v) => setEditExpenseForm((p) => ({ ...p, description: v }))} placeholder="Edit title" /><View style={s.row}><TextInput style={[s.input,s.flex]} value={editExpenseForm.amount} onChangeText={(v) => setEditExpenseForm((p) => ({ ...p, amount: v }))} placeholder="Amount" keyboardType="decimal-pad" /><TextInput style={[s.input,s.flex]} value={editExpenseForm.category} onChangeText={(v) => setEditExpenseForm((p) => ({ ...p, category: v }))} placeholder="Category" /></View><View style={s.row}><TouchableOpacity style={s.smP} onPress={saveEditedExpense}><Text style={s.smT}>Save</Text></TouchableOpacity><TouchableOpacity style={s.smR} onPress={() => setEditingExpenseId("")}><Text style={s.smT}>Cancel</Text></TouchableOpacity></View></View> : null}</View>) : <Text style={s.body}>No expenses yet.</Text>}</View> : null}

              {financialTab === "fees" ? <View style={s.card}><Text style={s.cardT}>Fee Structure</Text>{fees.map((t) => <View key={t.id} style={s.row}><TextInput style={[s.input,s.flex]} value={t.name} onChangeText={(v) => updateFeeTier(t.id, { name: v })} placeholder="Tier name" /><TextInput style={[s.input,s.flex]} value={String(t.amount)} onChangeText={(v) => updateFeeTier(t.id, { amount: Number(v) || 0 })} placeholder="Amount" keyboardType="decimal-pad" /><TouchableOpacity style={s.action} onPress={() => removeFeeTier(t.id)}><Text style={s.actionT}>Remove</Text></TouchableOpacity></View>)}<View style={s.row}><TouchableOpacity style={s.action} onPress={addFeeTier}><Text style={s.actionT}>Add Tier</Text></TouchableOpacity><TouchableOpacity style={s.btnP} onPress={saveFeeStructure}><Text style={s.btnPT}>Save Fees</Text></TouchableOpacity></View></View> : null}

              {financialTab === "reminders" ? <View style={s.card}><Text style={s.cardT}>Reminders</Text><TextInput style={s.input} value={reminderForm.title} onChangeText={(v) => setReminderForm((p) => ({ ...p, title: v }))} placeholder="Title" /><View style={s.row}><TextInput style={[s.input,s.flex]} value={reminderForm.reminderType} onChangeText={(v) => setReminderForm((p) => ({ ...p, reminderType: v }))} placeholder="Type" /><TextInput style={[s.input,s.flex]} value={reminderForm.unitId} onChangeText={(v) => setReminderForm((p) => ({ ...p, unitId: v }))} placeholder="Unit ID or all" /></View><View style={s.row}><TextInput style={[s.input,s.flex]} value={reminderForm.amount} onChangeText={(v) => setReminderForm((p) => ({ ...p, amount: v }))} placeholder="Amount" keyboardType="decimal-pad" /><TextInput style={[s.input,s.flex]} value={reminderForm.dueDate} onChangeText={(v) => setReminderForm((p) => ({ ...p, dueDate: v }))} placeholder="YYYY-MM-DD" /></View><TouchableOpacity style={s.btnP} onPress={createReminder}><Text style={s.btnPT}>Create Reminder</Text></TouchableOpacity>{reminders.length ? reminders.map((r) => <View key={r.id} style={s.list}><Text style={s.listT}>{r.title || "Reminder"}</Text><Text style={s.body}>{r.reminderType || "type"} • {r.amount ? money(r.amount) : "-"} • {r.isRecurring ? "Recurring" : "One-time"}</Text><TouchableOpacity style={s.action} onPress={() => deleteReminder(r.id)}><Text style={s.actionT}>Delete</Text></TouchableOpacity></View>) : <Text style={s.body}>No reminders yet.</Text>}</View> : null}

              {financialTab === "dwellings" ? <View style={s.card}><Text style={s.cardT}>Dwellings</Text><View style={s.row}><TextInput style={[s.input,s.flex]} value={unitForm.unitNumber} onChangeText={(v) => setUnitForm((p) => ({ ...p, unitNumber: v }))} placeholder="Unit number" /><TextInput style={[s.input,s.flex]} value={unitForm.unitType} onChangeText={(v) => setUnitForm((p) => ({ ...p, unitType: v }))} placeholder="Type" /></View><TextInput style={s.input} value={unitForm.feeTierId} onChangeText={(v) => setUnitForm((p) => ({ ...p, feeTierId: v }))} placeholder="Fee tier id" /><TextInput style={s.input} value={unitForm.ownerName} onChangeText={(v) => setUnitForm((p) => ({ ...p, ownerName: v }))} placeholder="Owner name" /><TextInput style={s.input} value={unitForm.ownerEmail} onChangeText={(v) => setUnitForm((p) => ({ ...p, ownerEmail: v }))} placeholder="Owner email" autoCapitalize="none" /><TouchableOpacity style={s.btnP} onPress={saveUnit}><Text style={s.btnPT}>{unitForm.id ? "Update Dwelling" : "Create Dwelling"}</Text></TouchableOpacity>{units.length ? units.map((u) => <View key={u.id} style={s.list}><Text style={s.listT}>Unit {u.unitNumber || "-"}</Text><Text style={s.body}>{u.unitType || "type"} • Tier: {u.feeTierId || "none"}</Text><View style={s.row}><TouchableOpacity style={s.action} onPress={() => startEditUnit(u)}><Text style={s.actionT}>Edit</Text></TouchableOpacity><TouchableOpacity style={s.action} onPress={() => deleteUnit(u.id)}><Text style={s.actionT}>Delete</Text></TouchableOpacity></View></View>) : <Text style={s.body}>No dwellings yet.</Text>}</View> : null}

              {financialTab === "funds" ? <View style={s.card}><Text style={s.cardT}>Funds</Text><TextInput style={s.input} value={fundForm.name} onChangeText={(v) => setFundForm((p) => ({ ...p, name: v }))} placeholder="Fund name" /><View style={s.row}><TextInput style={[s.input,s.flex]} value={fundForm.type} onChangeText={(v) => setFundForm((p) => ({ ...p, type: v }))} placeholder="Type" /><TextInput style={[s.input,s.flex]} value={fundForm.balance} onChangeText={(v) => setFundForm((p) => ({ ...p, balance: v }))} placeholder="Balance" keyboardType="decimal-pad" /></View><TouchableOpacity style={s.btnP} onPress={saveFund}><Text style={s.btnPT}>{fundForm.id ? "Update Fund" : "Create Fund"}</Text></TouchableOpacity><Text style={s.cardT}>Transaction</Text><TextInput style={s.input} value={transactionForm.fundId} onChangeText={(v) => setTransactionForm((p) => ({ ...p, fundId: v }))} placeholder="Fund ID" /><View style={s.row}><TextInput style={[s.input,s.flex]} value={transactionForm.type} onChangeText={(v) => setTransactionForm((p) => ({ ...p, type: v }))} placeholder="Type" /><TextInput style={[s.input,s.flex]} value={transactionForm.amount} onChangeText={(v) => setTransactionForm((p) => ({ ...p, amount: v }))} placeholder="Amount" keyboardType="decimal-pad" /></View><TouchableOpacity style={s.btnS} onPress={addTransaction}><Text style={s.btnST}>Record Transaction</Text></TouchableOpacity>{funds.length ? funds.map((f) => <View key={f.id} style={s.list}><Text style={s.listT}>{f.name || "Fund"}</Text><Text style={s.body}>{f.type || "type"} • Balance: {money(f.balance)}</Text><View style={s.row}><TouchableOpacity style={s.action} onPress={() => startEditFund(f)}><Text style={s.actionT}>Edit</Text></TouchableOpacity><TouchableOpacity style={s.action} onPress={() => deleteFund(f.id)}><Text style={s.actionT}>Delete</Text></TouchableOpacity></View></View>) : <Text style={s.body}>No funds yet.</Text>}</View> : null}
            </View>
          ) : screen === "maintenance" ? (
            <View style={s.page}>
              <View style={s.card}><Text style={s.section}>Maintenance Projects</Text><Text style={s.body}>Track project lifecycle, convert approved repairs, and assign vendors as contractors.</Text></View>
              <View style={s.card}><Text style={s.cardT}>Project Form</Text>{editingMaintenanceId ? <Text style={s.meta}>Editing existing project</Text> : <Text style={s.meta}>Create a new maintenance project</Text>}<TextInput style={s.input} value={maintenanceForm.title} onChangeText={(v) => setMaintenanceForm((p) => ({ ...p, title: v }))} placeholder="Project title" /><TextInput style={s.input} value={maintenanceForm.description} onChangeText={(v) => setMaintenanceForm((p) => ({ ...p, description: v }))} placeholder="Description" /><View style={s.row}><TextInput style={[s.input,s.flex]} value={maintenanceForm.category} onChangeText={(v) => setMaintenanceForm((p) => ({ ...p, category: v }))} placeholder="Category (roofing/plumbing/other)" /><TextInput style={[s.input,s.flex]} value={maintenanceForm.priority} onChangeText={(v) => setMaintenanceForm((p) => ({ ...p, priority: v }))} placeholder="Priority (low/medium/high/critical)" /></View><View style={s.row}><TextInput style={[s.input,s.flex]} value={maintenanceForm.status} onChangeText={(v) => setMaintenanceForm((p) => ({ ...p, status: v }))} placeholder="Status (planned/scheduled/in-progress/completed)" /><TextInput style={[s.input,s.flex]} value={maintenanceForm.estimatedCost} onChangeText={(v) => setMaintenanceForm((p) => ({ ...p, estimatedCost: v }))} placeholder="Estimated cost" keyboardType="decimal-pad" /></View><View style={s.row}><TextInput style={[s.input,s.flex]} value={maintenanceForm.actualCost} onChangeText={(v) => setMaintenanceForm((p) => ({ ...p, actualCost: v }))} placeholder="Actual cost" keyboardType="decimal-pad" /><TextInput style={[s.input,s.flex]} value={maintenanceForm.warranty} onChangeText={(v) => setMaintenanceForm((p) => ({ ...p, warranty: v }))} placeholder="Warranty" /></View><View style={s.row}><TextInput style={[s.input,s.flex]} value={maintenanceForm.scheduledDate} onChangeText={(v) => setMaintenanceForm((p) => ({ ...p, scheduledDate: v }))} placeholder="Scheduled YYYY-MM-DD" /><TextInput style={[s.input,s.flex]} value={maintenanceForm.completedDate} onChangeText={(v) => setMaintenanceForm((p) => ({ ...p, completedDate: v }))} placeholder="Completed YYYY-MM-DD" /></View><TextInput style={s.input} value={maintenanceForm.nextServiceDate} onChangeText={(v) => setMaintenanceForm((p) => ({ ...p, nextServiceDate: v }))} placeholder="Next service YYYY-MM-DD" />{vendors.length ? <View style={s.card}><Text style={s.meta}>Select Contractor From Vendors</Text><ScrollView horizontal showsHorizontalScrollIndicator={false}><View style={s.row}>{vendors.map((v) => <TouchableOpacity key={v.id} style={[s.chip, maintenanceForm.contractor === (v.name || "") && s.chipA]} onPress={() => setMaintenanceForm((p) => ({ ...p, contractor: v.name || p.contractor }))}><Text style={[s.chipT, maintenanceForm.contractor === (v.name || "") && s.chipTA]}>{v.name || "Vendor"}</Text></TouchableOpacity>)}</View></ScrollView></View> : null}<TextInput style={s.input} value={maintenanceForm.contractor} onChangeText={(v) => setMaintenanceForm((p) => ({ ...p, contractor: v }))} placeholder="Contractor (vendor name)" /><TextInput style={s.input} value={maintenanceForm.notes} onChangeText={(v) => setMaintenanceForm((p) => ({ ...p, notes: v }))} placeholder="Notes" /><View style={s.row}><TouchableOpacity style={[s.btnP, busy && s.dis, s.flex]} onPress={saveMaintenanceProject} disabled={busy}><Text style={s.btnPT}>{editingMaintenanceId ? "Update Project" : "Create Project"}</Text></TouchableOpacity><TouchableOpacity style={[s.btnS, s.flex]} onPress={resetMaintenanceForm}><Text style={s.btnST}>Clear</Text></TouchableOpacity></View></View>
              <View style={s.card}><Text style={s.cardT}>Maintenance Views</Text><ScrollView horizontal showsHorizontalScrollIndicator={false}><View style={s.row}><TouchableOpacity style={[s.chip, maintenanceTab === "pendingRepairs" && s.chipA]} onPress={() => setMaintenanceTab("pendingRepairs")}><Text style={[s.chipT, maintenanceTab === "pendingRepairs" && s.chipTA]}>Pending Repairs ({approvedRepairRequests.length})</Text></TouchableOpacity><TouchableOpacity style={[s.chip, maintenanceTab === "active" && s.chipA]} onPress={() => setMaintenanceTab("active")}><Text style={[s.chipT, maintenanceTab === "active" && s.chipTA]}>Active ({activeMaintenance.length})</Text></TouchableOpacity><TouchableOpacity style={[s.chip, maintenanceTab === "completed" && s.chipA]} onPress={() => setMaintenanceTab("completed")}><Text style={[s.chipT, maintenanceTab === "completed" && s.chipTA]}>Completed ({completedMaintenance.length})</Text></TouchableOpacity><TouchableOpacity style={[s.chip, maintenanceTab === "upcoming" && s.chipA]} onPress={() => setMaintenanceTab("upcoming")}><Text style={[s.chipT, maintenanceTab === "upcoming" && s.chipTA]}>Upcoming ({upcomingMaintenance.length})</Text></TouchableOpacity><TouchableOpacity style={[s.chip, maintenanceTab === "archived" && s.chipA]} onPress={() => setMaintenanceTab("archived")}><Text style={[s.chipT, maintenanceTab === "archived" && s.chipTA]}>Archived ({archivedMaintenance.length})</Text></TouchableOpacity></View></ScrollView></View>
              {maintenanceTab === "pendingRepairs" ? <View style={s.card}><Text style={s.cardT}>Approved Repair Requests</Text>{approvedRepairRequests.length ? approvedRepairRequests.map((r: any) => <View key={r.id} style={s.list}><Text style={s.listT}>{r.title || "Repair request"}</Text><Text style={s.body}>{r.description || "No description"}</Text><Text style={s.meta}>{r.area ? `${String(r.area).replace(/-/g, " ")} • ` : ""}{r.severity || "medium"} • {money(r.estimatedCost)}</Text><View style={s.row}><TouchableOpacity style={s.smP} onPress={() => convertRepairToMaintenance(r.id)}><Text style={s.smT}>Convert to Project</Text></TouchableOpacity><TouchableOpacity style={s.smR} onPress={() => deleteRepairRequest(r.id)}><Text style={s.smT}>Delete</Text></TouchableOpacity></View></View>) : <Text style={s.body}>No approved repairs awaiting conversion.</Text>}</View> : null}
              {maintenanceTab !== "pendingRepairs" ? <View style={s.card}><Text style={s.cardT}>Projects</Text>{(maintenanceTab === "active" ? activeMaintenance : maintenanceTab === "completed" ? completedMaintenance : maintenanceTab === "upcoming" ? upcomingMaintenance : archivedMaintenance).length ? (maintenanceTab === "active" ? activeMaintenance : maintenanceTab === "completed" ? completedMaintenance : maintenanceTab === "upcoming" ? upcomingMaintenance : archivedMaintenance).map((m: any) => <View key={m.id} style={s.list}><Text style={s.listT}>{m.title || "Maintenance project"}</Text><Text style={s.body}>{m.description || "No description"}</Text><Text style={s.meta}>{label(m.category)} • {label(m.priority)} • {label(m.status)} • Est {money(m.estimatedCost)}</Text><Text style={s.meta}>Contractor: {m.contractor || "Not assigned"}{vendors.some((v) => (v.name || "").toLowerCase() === String(m.contractor || "").toLowerCase()) ? " (Vendor linked)" : ""}</Text><Text style={s.meta}>{m.scheduledDate ? `Scheduled ${new Date(m.scheduledDate).toLocaleDateString()} • ` : ""}{m.nextServiceDate ? `Next ${new Date(m.nextServiceDate).toLocaleDateString()} • ` : ""}{when(m.createdAt)}</Text><View style={s.row}><TouchableOpacity style={s.action} onPress={() => startEditMaintenance(m)}><Text style={s.actionT}>Edit</Text></TouchableOpacity>{String(m.status || "").toLowerCase() !== "completed" ? <TouchableOpacity style={s.action} onPress={() => updateMaintenanceStatus(m.id, String(m.status || "").toLowerCase() === "planned" ? "scheduled" : String(m.status || "").toLowerCase() === "scheduled" ? "in-progress" : "completed")}><Text style={s.actionT}>Advance</Text></TouchableOpacity> : null}{!m.archived ? <TouchableOpacity style={s.action} onPress={() => archiveMaintenanceProject(m.id, true)}><Text style={s.actionT}>Archive</Text></TouchableOpacity> : <TouchableOpacity style={s.action} onPress={() => archiveMaintenanceProject(m.id, false)}><Text style={s.actionT}>Unarchive</Text></TouchableOpacity>}<TouchableOpacity style={s.smR} onPress={() => deleteMaintenanceProject(m.id)}><Text style={s.smT}>Delete</Text></TouchableOpacity></View></View>) : <Text style={s.body}>No projects in this view.</Text>}</View> : null}
            </View>
          ) : screen === "meetings" ? (
            <View style={s.page}>
              <View style={s.card}><Text style={s.section}>Meetings</Text><Text style={s.body}>Schedule and track strata meetings.</Text></View>
              <View style={s.card}>
                <Text style={s.cardT}>Schedule Meeting</Text>
                <TextInput style={s.input} value={meetingForm.title} onChangeText={(v) => setMeetingForm((p) => ({ ...p, title: v }))} placeholder="Meeting title" />
                <TextInput style={s.input} value={meetingForm.description} onChangeText={(v) => setMeetingForm((p) => ({ ...p, description: v }))} placeholder="Description" />
                <View style={s.row}>
                  <TextInput style={[s.input,s.flex]} value={meetingForm.meetingDate} onChangeText={(v) => setMeetingForm((p) => ({ ...p, meetingDate: v }))} placeholder="YYYY-MM-DDTHH:mm" />
                  <TextInput style={[s.input,s.flex]} value={meetingForm.location} onChangeText={(v) => setMeetingForm((p) => ({ ...p, location: v }))} placeholder="Location" />
                </View>
                <TextInput style={s.input} value={meetingForm.meetingType} onChangeText={(v) => setMeetingForm((p) => ({ ...p, meetingType: v }))} placeholder="Type (board/annual/special)" />
                <TouchableOpacity style={[s.btnP, busy && s.dis]} onPress={createMeeting} disabled={busy}><Text style={s.btnPT}>Schedule</Text></TouchableOpacity>
              </View>
              <View style={s.card}><Text style={s.cardT}>Meetings List</Text>{meetings.length ? meetings.map((m) => <View key={m.id} style={s.list}><Text style={s.listT}>{m.title || "Meeting"}</Text><Text style={s.body}>{label(m.status)} â€¢ {m.scheduledAt ? new Date(m.scheduledAt).toLocaleString() : "No date"}</Text><View style={s.row}><TouchableOpacity style={s.action} onPress={() => updateMeetingStatus(m.id, "completed")}><Text style={s.actionT}>Complete</Text></TouchableOpacity><TouchableOpacity style={s.action} onPress={() => updateMeetingStatus(m.id, "cancelled")}><Text style={s.actionT}>Cancel</Text></TouchableOpacity></View></View>) : <Text style={s.body}>No meetings yet.</Text>}</View>
            </View>
          ) : screen === "communications" ? (
            <View style={s.page}>
              <View style={s.card}><Text style={s.section}>Communications</Text><Text style={s.body}>Announcements and messaging for residents.</Text></View>
              <View style={s.card}>
                <Text style={s.cardT}>Post Announcement</Text>
                <TextInput style={s.input} value={announcementForm.title} onChangeText={(v) => setAnnouncementForm((p) => ({ ...p, title: v }))} placeholder="Title" />
                <TextInput style={s.input} value={announcementForm.content} onChangeText={(v) => setAnnouncementForm((p) => ({ ...p, content: v }))} placeholder="Content" />
                <View style={s.row}>
                  <TextInput style={[s.input,s.flex]} value={announcementForm.type} onChangeText={(v) => setAnnouncementForm((p) => ({ ...p, type: v }))} placeholder="Type" />
                  <TextInput style={[s.input,s.flex]} value={announcementForm.priority} onChangeText={(v) => setAnnouncementForm((p) => ({ ...p, priority: v }))} placeholder="Priority" />
                </View>
                <TouchableOpacity style={[s.btnP, busy && s.dis]} onPress={createAnnouncement} disabled={busy}><Text style={s.btnPT}>Post</Text></TouchableOpacity>
              </View>
              <View style={s.card}>
                <Text style={s.cardT}>Send Broadcast Message</Text>
                <View style={s.row}>
                  <TouchableOpacity style={[s.chip, messageRecipientMode === "all" && s.chipA]} onPress={() => setMessageRecipientMode("all")}><Text style={[s.chipT, messageRecipientMode === "all" && s.chipTA]}>All Users</Text></TouchableOpacity>
                  <TouchableOpacity style={[s.chip, messageRecipientMode === "single" && s.chipA]} onPress={() => setMessageRecipientMode("single")}><Text style={[s.chipT, messageRecipientMode === "single" && s.chipTA]}>Single User</Text></TouchableOpacity>
                </View>
                {messageRecipientMode === "single" ? <View>
                  <TouchableOpacity style={s.selectInput} onPress={() => setShowRecipientDropdown((v) => !v)}>
                    <Text style={s.selectInputText}>{selectedRecipientLabel}</Text>
                  </TouchableOpacity>
                  {showRecipientDropdown ? <View style={s.dropdownList}>{recipientOptions.length ? recipientOptions.map((opt: any) => <TouchableOpacity key={opt.id} style={s.dropdownItem} onPress={() => { setSelectedRecipientId(opt.id); setShowRecipientDropdown(false); }}><Text style={s.dropdownItemText}>{opt.label}</Text><Text style={s.dropdownItemMeta}>{opt.email}</Text></TouchableOpacity>) : <Text style={s.body}>No users available.</Text>}</View> : null}
                </View> : null}
                <TextInput style={s.input} value={messageForm.subject} onChangeText={(v) => setMessageForm((p) => ({ ...p, subject: v }))} placeholder="Subject" />
                <TextInput style={s.input} value={messageForm.content} onChangeText={(v) => setMessageForm((p) => ({ ...p, content: v }))} placeholder="Message content" />
                <TextInput style={s.input} value={messageForm.priority} onChangeText={(v) => setMessageForm((p) => ({ ...p, priority: v }))} placeholder="Priority" />
                <TouchableOpacity style={[s.btnS, busy && s.dis]} onPress={sendMessage} disabled={busy}><Text style={s.btnST}>Send Message</Text></TouchableOpacity>
              </View>
              <View style={s.card}><Text style={s.cardT}>Recent Announcements</Text>{announcements.length ? announcements.slice(0, 10).map((a) => <View key={a.id} style={s.list}><Text style={s.listT}>{a.title || "Announcement"}</Text><Text style={s.body}>{a.description || a.message || "No content"}</Text><Text style={s.meta}>{when(a.createdAt)}</Text></View>) : <Text style={s.body}>No announcements yet.</Text>}</View>
              <View style={s.card}><Text style={s.cardT}>Recent Messages</Text>{messages.length ? messages.slice(0, 10).map((m) => <View key={m.id} style={s.list}><Text style={s.listT}>{m.title || "Message"}</Text><Text style={s.body}>{m.description || m.message || "No content"}</Text><Text style={s.meta}>{when(m.createdAt)}</Text></View>) : <Text style={s.body}>No messages yet.</Text>}</View>
            </View>
          ) : screen === "masterAdmin" ? (
            <View style={s.page}>
              {!isMasterAdmin ? <View style={s.card}><Text style={s.section}>Master Admin</Text><Text style={s.body}>Access denied. This page is only available to the master admin account.</Text></View> : <>
                <View style={s.card}><Text style={s.section}>Master Admin</Text><Text style={s.body}>Global administration for strata organizations and users.</Text></View>
                <View style={s.card}><Text style={s.cardT}>Overview</Text><Text style={s.body}>Strata Organizations: {adminStrata.length}</Text><Text style={s.body}>Users: {adminUsers.length}</Text><TouchableOpacity style={s.action} onPress={() => token ? loadMasterAdminData(token) : undefined}><Text style={s.actionT}>Refresh Admin Data</Text></TouchableOpacity></View>
                <View style={s.card}><Text style={s.cardT}>Create Strata Organization</Text><TextInput style={s.input} value={adminStrataForm.name} onChangeText={(v) => setAdminStrataForm((p) => ({ ...p, name: v }))} placeholder="Strata name" /><TextInput style={s.input} value={adminStrataForm.address} onChangeText={(v) => setAdminStrataForm((p) => ({ ...p, address: v }))} placeholder="Address" /><View style={s.row}><TextInput style={[s.input,s.flex]} value={adminStrataForm.city} onChangeText={(v) => setAdminStrataForm((p) => ({ ...p, city: v }))} placeholder="City" /><TextInput style={[s.input,s.flex]} value={adminStrataForm.province} onChangeText={(v) => setAdminStrataForm((p) => ({ ...p, province: v }))} placeholder="Province" /></View><View style={s.row}><TextInput style={[s.input,s.flex]} value={adminStrataForm.postalCode} onChangeText={(v) => setAdminStrataForm((p) => ({ ...p, postalCode: v }))} placeholder="Postal code" /><TextInput style={[s.input,s.flex]} value={adminStrataForm.unitCount} onChangeText={(v) => setAdminStrataForm((p) => ({ ...p, unitCount: v }))} placeholder="Unit count" keyboardType="number-pad" /></View><View style={s.row}><TextInput style={[s.input,s.flex]} value={adminStrataForm.email} onChangeText={(v) => setAdminStrataForm((p) => ({ ...p, email: v }))} placeholder="Email" autoCapitalize="none" /><TextInput style={[s.input,s.flex]} value={adminStrataForm.phoneNumber} onChangeText={(v) => setAdminStrataForm((p) => ({ ...p, phoneNumber: v }))} placeholder="Phone" /></View><TouchableOpacity style={[s.btnP, busy && s.dis]} onPress={createAdminStrata} disabled={busy}><Text style={s.btnPT}>Create Strata</Text></TouchableOpacity></View>
                <View style={s.card}><Text style={s.cardT}>Create User</Text><View style={s.row}><TextInput style={[s.input,s.flex]} value={adminUserForm.firstName} onChangeText={(v) => setAdminUserForm((p) => ({ ...p, firstName: v }))} placeholder="First name" /><TextInput style={[s.input,s.flex]} value={adminUserForm.lastName} onChangeText={(v) => setAdminUserForm((p) => ({ ...p, lastName: v }))} placeholder="Last name" /></View><TextInput style={s.input} value={adminUserForm.email} onChangeText={(v) => setAdminUserForm((p) => ({ ...p, email: v }))} placeholder="Email" autoCapitalize="none" /><View style={s.row}><TextInput style={[s.input,s.flex]} value={adminUserForm.role} onChangeText={(v) => setAdminUserForm((p) => ({ ...p, role: v }))} placeholder="Role" /><TextInput style={[s.input,s.flex]} value={adminUserForm.temporaryPassword} onChangeText={(v) => setAdminUserForm((p) => ({ ...p, temporaryPassword: v }))} placeholder="Temporary password" /></View><TouchableOpacity style={[s.btnS, busy && s.dis]} onPress={createAdminUser} disabled={busy}><Text style={s.btnST}>Create User</Text></TouchableOpacity></View>
                <View style={s.card}><Text style={s.cardT}>Strata Organizations</Text>{adminStrata.length ? adminStrata.slice(0, 20).map((st) => <View key={st.id} style={s.list}><Text style={s.listT}>{st.name || "Strata"}</Text><Text style={s.body}>{st.address || "No address"} • Units: {st.unitCount ?? "-"}</Text><Text style={s.meta}>Status: {(st.subscriptionStatus || st.status || "unknown").toString()}</Text></View>) : <Text style={s.body}>No strata organizations found.</Text>}</View>
                <View style={s.card}><Text style={s.cardT}>Users</Text>{adminUsers.length ? adminUsers.slice(0, 25).map((u) => <View key={u.id} style={s.list}><Text style={s.listT}>{u.firstName || ""} {u.lastName || ""}</Text><Text style={s.body}>{u.email || "-"}</Text><Text style={s.meta}>Role: {u.role || "resident"} • {u.isActive === false ? "Inactive" : "Active"}</Text></View>) : <Text style={s.body}>No users found.</Text>}</View>
              </>}
            </View>
          ) : (
            <View style={s.card}><Text style={s.section}>Account</Text><Text style={s.body}>Name: {`${user?.firstName || ""} ${user?.lastName || ""}`.trim() || "-"}</Text><Text style={s.body}>Email: {user?.email || "-"}</Text><Text style={s.body}>Role: {user?.role || "-"}</Text><TouchableOpacity style={s.btnS} onPress={() => setAuthView("strata")}><Text style={s.btnST}>Register Additional Strata</Text></TouchableOpacity><TouchableOpacity style={s.btnP} onPress={logout}><Text style={s.btnPT}>Sign Out</Text></TouchableOpacity></View>
          )}
        </ScrollView>
        <Drawer />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#edf3ef" }, c: { paddingTop: 136, paddingHorizontal: 16, paddingBottom: 40, gap: 10 }, center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 10 },
  top: { position: "absolute", top: 0, left: 0, right: 0, zIndex: 30, height: 128, borderBottomWidth: 1, borderBottomColor: "#d8e3dc", backgroundColor: "#f3f8f4", paddingHorizontal: 12, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }, topHidden: { transform: [{ translateY: -140 }], opacity: 0 }, topT: { fontSize: 18, fontWeight: "700", color: "#0f172a" }, topCenter: { flex: 1, alignItems: "center", justifyContent: "center", overflow: "hidden" }, topLogo: { width: 468, height: 120 }, iconBtn: { width: 40, height: 40, alignItems: "center", justifyContent: "center", position: "relative", zIndex: 2 }, icon: { fontSize: 22 }, badge: { position: "absolute", top: 2, right: 2, backgroundColor: "#ef4444", minWidth: 18, height: 18, borderRadius: 9, alignItems: "center", justifyContent: "center", paddingHorizontal: 4 }, badgeT: { color: "#fff", fontSize: 11, fontWeight: "700" },
  drawerWrap: { position: "absolute", inset: 0, flexDirection: "row", zIndex: 40 }, drawer: { width: 280, backgroundColor: "#fff", paddingTop: 24, paddingHorizontal: 14, borderRightWidth: 1, borderRightColor: "#dbe5df" }, drawerHeader: { borderWidth: 1, borderColor: "#dbe5df", borderRadius: 10, backgroundColor: "#f6faf8", padding: 10, marginBottom: 10 }, drawerHeaderLabel: { fontSize: 12, fontWeight: "700", color: "#64748b", textTransform: "uppercase", letterSpacing: 0.4 }, drawerHeaderValue: { marginTop: 4, fontSize: 15, fontWeight: "800", color: "#0f172a" }, drawerStrataRow: { marginBottom: 8 }, backdrop: { flex: 1, backgroundColor: "rgba(15,23,42,0.35)" }, drawerItem: { minHeight: 44, borderRadius: 8, justifyContent: "center", paddingHorizontal: 10, marginBottom: 6 }, drawerItemA: { backgroundColor: "#e9f8ef" }, drawerT: { fontSize: 15, fontWeight: "600", color: "#334e68" }, drawerTA: { color: "#166534" },
  logoWrap: { alignItems: "center", paddingTop: 8 }, logo: { width: 390, height: 160 }, err: { borderRadius: 10, backgroundColor: "#fee2e2", borderWidth: 1, borderColor: "#ef4444", padding: 8 }, errT: { color: "#991b1b", fontSize: 14 }, ok: { borderRadius: 10, backgroundColor: "#dcfce7", borderWidth: 1, borderColor: "#16a34a", padding: 8 }, okT: { color: "#166534", fontSize: 14 },
  card: { borderRadius: 12, borderWidth: 1, borderColor: "#cfdad3", backgroundColor: "#fff", padding: 14, gap: 8 }, page: { gap: 10 }, section: { fontSize: 24, fontWeight: "800", color: "#0f172a" }, cardT: { fontSize: 18, fontWeight: "800", color: "#0f172a" }, body: { color: "#2e4b66", fontSize: 14, lineHeight: 20 }, meta: { color: "#64748b", fontSize: 12 },
  hGreen: { fontSize: 34, fontWeight: "800", color: "#16a34a", textAlign: "center" }, hDark: { marginTop: -6, fontSize: 34, fontWeight: "800", color: "#0f172a", textAlign: "center" }, sub: { marginTop: 8, fontSize: 16, lineHeight: 24, color: "#2e4b66", textAlign: "center" },
  row: { flexDirection: "row", gap: 8, alignItems: "center" }, flex: { flex: 1 }, input: { minHeight: 48, borderRadius: 10, borderWidth: 1, borderColor: "#cfdad3", backgroundColor: "#f7faf9", paddingHorizontal: 12, color: "#0f172a", fontSize: 16 }, btnP: { minHeight: 48, borderRadius: 8, alignItems: "center", justifyContent: "center", backgroundColor: "#16a34a", paddingHorizontal: 18 }, btnPT: { color: "#fff", fontSize: 16, fontWeight: "700" }, btnS: { minHeight: 48, borderRadius: 8, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "#9bb0c5", backgroundColor: "#f5f7f8", paddingHorizontal: 18 }, btnST: { color: "#0f172a", fontSize: 16, fontWeight: "600" }, dis: { opacity: 0.6 }, link: { minHeight: 36, alignItems: "center", justifyContent: "center" }, linkT: { color: "#245e90", fontWeight: "600" },
  chip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, borderWidth: 1, borderColor: "#cfdad3", backgroundColor: "#fff", marginRight: 8 }, chipA: { borderColor: "#16a34a", backgroundColor: "#e9f8ef" }, chipT: { color: "#2e4b66", fontWeight: "600" }, chipTA: { color: "#166534" },
  metric: { borderRadius: 12, borderWidth: 1, borderColor: "#dbe6df", backgroundColor: "#fff", padding: 12 }, mLabel: { color: "#60758a", fontSize: 13, fontWeight: "600" }, mValue: { color: "#0f172a", fontSize: 28, fontWeight: "800", marginTop: 6 },
  list: { borderTopWidth: 1, borderTopColor: "#e5ece8", paddingTop: 8, gap: 3 }, listT: { color: "#0f172a", fontWeight: "700" }, nRead: { backgroundColor: "#fafcfa", borderColor: "#d5e0d9", borderWidth: 1, borderRadius: 10, padding: 8 }, nUnread: { backgroundColor: "#f0fdf4", borderColor: "#16a34a", borderWidth: 1, borderRadius: 10, padding: 8 },
  quotePreview: { width: "100%", height: 180, borderRadius: 10, borderWidth: 1, borderColor: "#d5e0d9", backgroundColor: "#f8fbf9" },
  selectInput: { minHeight: 48, borderRadius: 10, borderWidth: 1, borderColor: "#cfdad3", backgroundColor: "#f7faf9", paddingHorizontal: 12, justifyContent: "center" }, selectInputText: { color: "#0f172a", fontSize: 15 }, dropdownList: { borderRadius: 10, borderWidth: 1, borderColor: "#d5e0d9", backgroundColor: "#fff", marginTop: 6, maxHeight: 220, padding: 6, gap: 2 }, dropdownItem: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 8, backgroundColor: "#f8fbf9" }, dropdownItemText: { color: "#0f172a", fontWeight: "600" }, dropdownItemMeta: { color: "#64748b", fontSize: 12 },
  action: { minHeight: 40, borderRadius: 8, borderWidth: 1, borderColor: "#d2ddf0", backgroundColor: "#f5f8fd", alignItems: "center", justifyContent: "center" }, actionT: { color: "#0f172a", fontWeight: "700" }, smP: { minHeight: 34, borderRadius: 8, alignItems: "center", justifyContent: "center", paddingHorizontal: 12, backgroundColor: "#16a34a" }, smR: { minHeight: 34, borderRadius: 8, alignItems: "center", justifyContent: "center", paddingHorizontal: 12, backgroundColor: "#dc2626" }, smT: { color: "#fff", fontSize: 13, fontWeight: "700" },
});

