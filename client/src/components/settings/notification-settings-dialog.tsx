import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Bell, 
  Mail, 
  Smartphone,
  Volume2,
  VolumeX,
  Save,
  Settings as SettingsIcon
} from "lucide-react";

interface NotificationSettingsDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

interface NotificationSettings {
  emailNotifications: boolean;
  pushNotifications: boolean;
  smsNotifications: boolean;
  weeklyReports: boolean;
  maintenanceAlerts: boolean;
  meetingReminders: boolean;
  announcementNotifications: boolean;
  quoteUpdates: boolean;
  paymentReminders: boolean;
  emergencyAlerts: boolean;
  soundEnabled: boolean;
  notificationFrequency: "immediate" | "daily" | "weekly";
  quietHoursEnabled: boolean;
  quietHoursStart: string;
  quietHoursEnd: string;
}

export function NotificationSettingsDialog({ isOpen, onClose }: NotificationSettingsDialogProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Load current notification settings
  const { data: currentSettings, isLoading } = useQuery({
    queryKey: ["/api/user/notification-settings"],
    enabled: isOpen
  });

  const [settings, setSettings] = useState<NotificationSettings>({
    emailNotifications: currentSettings?.emailNotifications ?? true,
    pushNotifications: currentSettings?.pushNotifications ?? true,
    smsNotifications: currentSettings?.smsNotifications ?? false,
    weeklyReports: currentSettings?.weeklyReports ?? true,
    maintenanceAlerts: currentSettings?.maintenanceAlerts ?? true,
    meetingReminders: currentSettings?.meetingReminders ?? true,
    announcementNotifications: currentSettings?.announcementNotifications ?? true,
    quoteUpdates: currentSettings?.quoteUpdates ?? true,
    paymentReminders: currentSettings?.paymentReminders ?? true,
    emergencyAlerts: currentSettings?.emergencyAlerts ?? true,
    soundEnabled: currentSettings?.soundEnabled ?? true,
    notificationFrequency: currentSettings?.notificationFrequency ?? "immediate",
    quietHoursEnabled: currentSettings?.quietHoursEnabled ?? false,
    quietHoursStart: currentSettings?.quietHoursStart ?? "22:00",
    quietHoursEnd: currentSettings?.quietHoursEnd ?? "08:00"
  });

  const updateNotificationsMutation = useMutation({
    mutationFn: async (data: NotificationSettings) => {
      const response = await apiRequest("PATCH", "/api/user/notification-settings", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Notifications Updated",
        description: "Your notification preferences have been saved successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/user/notification-settings"] });
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update notification settings",
        variant: "destructive",
      });
    }
  });

  const handleSave = () => {
    updateNotificationsMutation.mutate(settings);
  };

  const testNotificationMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/user/test-notification");
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Test Notification Sent",
        description: "Check your selected notification channels for the test message.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Test Failed",
        description: error.message || "Failed to send test notification",
        variant: "destructive",
      });
    }
  });

  if (isLoading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl">
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notification Settings
          </DialogTitle>
          <DialogDescription>
            Configure how and when you receive notifications
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Delivery Methods */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Delivery Methods</CardTitle>
              <CardDescription>
                Choose how you want to receive notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-blue-500" />
                  <div>
                    <Label htmlFor="emailNotifications">Email Notifications</Label>
                    <p className="text-sm text-gray-500">Receive notifications via email</p>
                  </div>
                </div>
                <Switch
                  id="emailNotifications"
                  checked={settings.emailNotifications}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, emailNotifications: checked }))}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Smartphone className="h-4 w-4 text-green-500" />
                  <div>
                    <Label htmlFor="pushNotifications">Push Notifications</Label>
                    <p className="text-sm text-gray-500">Receive browser push notifications</p>
                  </div>
                </div>
                <Switch
                  id="pushNotifications"
                  checked={settings.pushNotifications}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, pushNotifications: checked }))}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Smartphone className="h-4 w-4 text-purple-500" />
                  <div>
                    <Label htmlFor="smsNotifications">SMS Notifications</Label>
                    <p className="text-sm text-gray-500">Receive text messages for urgent items</p>
                  </div>
                </div>
                <Switch
                  id="smsNotifications"
                  checked={settings.smsNotifications}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, smsNotifications: checked }))}
                />
              </div>
            </CardContent>
          </Card>

          {/* Notification Types */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Notification Types</CardTitle>
              <CardDescription>
                Select which types of notifications you want to receive
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="weeklyReports">Weekly Reports</Label>
                  <p className="text-sm text-gray-500">Receive weekly summary reports</p>
                </div>
                <Switch
                  id="weeklyReports"
                  checked={settings.weeklyReports}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, weeklyReports: checked }))}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="maintenanceAlerts">Maintenance Alerts</Label>
                  <p className="text-sm text-gray-500">Get notified about maintenance updates</p>
                </div>
                <Switch
                  id="maintenanceAlerts"
                  checked={settings.maintenanceAlerts}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, maintenanceAlerts: checked }))}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="meetingReminders">Meeting Reminders</Label>
                  <p className="text-sm text-gray-500">Receive reminders for upcoming meetings</p>
                </div>
                <Switch
                  id="meetingReminders"
                  checked={settings.meetingReminders}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, meetingReminders: checked }))}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="announcementNotifications">Announcements</Label>
                  <p className="text-sm text-gray-500">Get notified about new announcements</p>
                </div>
                <Switch
                  id="announcementNotifications"
                  checked={settings.announcementNotifications}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, announcementNotifications: checked }))}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="quoteUpdates">Quote Updates</Label>
                  <p className="text-sm text-gray-500">Receive updates on quote requests and approvals</p>
                </div>
                <Switch
                  id="quoteUpdates"
                  checked={settings.quoteUpdates}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, quoteUpdates: checked }))}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="paymentReminders">Payment Reminders</Label>
                  <p className="text-sm text-gray-500">Get reminded about upcoming payments</p>
                </div>
                <Switch
                  id="paymentReminders"
                  checked={settings.paymentReminders}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, paymentReminders: checked }))}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="emergencyAlerts">Emergency Alerts</Label>
                  <p className="text-sm text-gray-500 font-medium">Critical building emergencies (cannot be disabled)</p>
                </div>
                <Switch
                  id="emergencyAlerts"
                  checked={true}
                  disabled={true}
                />
              </div>
            </CardContent>
          </Card>

          {/* Advanced Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Advanced Settings</CardTitle>
              <CardDescription>
                Configure delivery frequency and quiet hours
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {settings.soundEnabled ? (
                    <Volume2 className="h-4 w-4 text-blue-500" />
                  ) : (
                    <VolumeX className="h-4 w-4 text-gray-400" />
                  )}
                  <div>
                    <Label htmlFor="soundEnabled">Notification Sounds</Label>
                    <p className="text-sm text-gray-500">Play sound for notifications</p>
                  </div>
                </div>
                <Switch
                  id="soundEnabled"
                  checked={settings.soundEnabled}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, soundEnabled: checked }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notificationFrequency">Notification Frequency</Label>
                <Select
                  value={settings.notificationFrequency}
                  onValueChange={(value: "immediate" | "daily" | "weekly") => 
                    setSettings(prev => ({ ...prev, notificationFrequency: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="immediate">Immediate</SelectItem>
                    <SelectItem value="daily">Daily Summary</SelectItem>
                    <SelectItem value="weekly">Weekly Summary</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="quietHoursEnabled">Quiet Hours</Label>
                  <p className="text-sm text-gray-500">Disable non-urgent notifications during specified hours</p>
                </div>
                <Switch
                  id="quietHoursEnabled"
                  checked={settings.quietHoursEnabled}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, quietHoursEnabled: checked }))}
                />
              </div>

              {settings.quietHoursEnabled && (
                <div className="grid grid-cols-2 gap-4 ml-6">
                  <div className="space-y-2">
                    <Label htmlFor="quietHoursStart">Start Time</Label>
                    <input
                      id="quietHoursStart"
                      type="time"
                      value={settings.quietHoursStart}
                      onChange={(e) => setSettings(prev => ({ ...prev, quietHoursStart: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="quietHoursEnd">End Time</Label>
                    <input
                      id="quietHoursEnd"
                      type="time"
                      value={settings.quietHoursEnd}
                      onChange={(e) => setSettings(prev => ({ ...prev, quietHoursEnd: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button 
              onClick={handleSave}
              disabled={updateNotificationsMutation.isPending}
              className="flex-1"
            >
              {updateNotificationsMutation.isPending ? (
                "Saving..."
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Settings
                </>
              )}
            </Button>
            
            <Button
              variant="outline"
              onClick={() => testNotificationMutation.mutate()}
              disabled={testNotificationMutation.isPending}
            >
              {testNotificationMutation.isPending ? (
                "Sending..."
              ) : (
                "Test Notification"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}