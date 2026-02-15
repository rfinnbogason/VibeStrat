import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Wrench, Upload } from 'lucide-react';

const repairRequestSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  area: z.enum([
    'common-areas',
    'exterior',
    'unit-specific',
    'parking',
    'landscaping',
    'utilities-hvac',
    'roof-structure',
    'other',
  ]),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  severity: z.enum(['low', 'medium', 'high', 'emergency']),
  estimatedCost: z.number().min(0, 'Cost must be positive').max(100000),
  costJustification: z.string().optional(),
  phone: z.string().optional(),
  unitNumber: z.string().optional(),
  bestTimeToContact: z.string().optional(),
  additionalNotes: z.string().optional(),
});

type RepairRequestFormData = z.infer<typeof repairRequestSchema>;

interface SuggestRepairModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  strataId: string;
}

const areaLabels: Record<string, string> = {
  'common-areas': 'Common Areas',
  'exterior': 'Exterior/Building',
  'unit-specific': 'Unit-Specific',
  'parking': 'Parking',
  'landscaping': 'Landscaping',
  'utilities-hvac': 'Utilities/HVAC',
  'roof-structure': 'Roof/Structure',
  'other': 'Other',
};

const severityLabels: Record<string, { label: string; description: string }> = {
  low: { label: 'Low', description: 'Can wait' },
  medium: { label: 'Medium', description: 'Should schedule soon' },
  high: { label: 'High', description: 'Needs prompt attention' },
  emergency: { label: 'Emergency', description: 'Safety/property damage risk' },
};

export function SuggestRepairModal({ open, onOpenChange, strataId }: SuggestRepairModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<RepairRequestFormData>({
    resolver: zodResolver(repairRequestSchema),
    defaultValues: {
      title: '',
      area: 'common-areas',
      description: '',
      severity: 'medium',
      estimatedCost: 0,
      costJustification: '',
      phone: '',
      unitNumber: '',
      bestTimeToContact: '',
      additionalNotes: '',
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: RepairRequestFormData) => {
      const response = await apiRequest('POST', `/api/strata/${strataId}/repair-requests`, {
        ...data,
        submittedBy: {
          phone: data.phone,
          unitNumber: data.unitNumber,
        },
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Your repair request has been submitted successfully!',
      });
      queryClient.invalidateQueries({ queryKey: [`/api/strata/${strataId}/repair-requests`] });
      queryClient.invalidateQueries({ queryKey: [`/api/strata/${strataId}/repair-requests/stats`] });
      form.reset();
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to submit repair request',
        variant: 'destructive',
      });
    },
  });

  const onSubmit = (data: RepairRequestFormData) => {
    createMutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wrench className="h-5 w-5 text-orange-600" />
            Suggest a Repair
          </DialogTitle>
          <DialogDescription>
            Submit a repair request for your strata community. An admin will review and respond to your suggestion.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Title */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title *</FormLabel>
                  <FormControl>
                    <Input placeholder="Brief title for the repair" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Area */}
            <FormField
              control={form.control}
              name="area"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Area of Concern *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.entries(areaLabels).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description *</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe what needs repair, where it's located, and any relevant details..."
                      rows={4}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>Minimum 20 characters</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Severity */}
            <FormField
              control={form.control}
              name="severity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Severity Level *</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="grid grid-cols-2 gap-4"
                    >
                      {Object.entries(severityLabels).map(([value, { label, description }]) => (
                        <div key={value} className="flex items-center space-x-2">
                          <RadioGroupItem value={value} id={value} />
                          <label
                            htmlFor={value}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                          >
                            {label}
                            <span className="block text-xs text-muted-foreground font-normal">
                              {description}
                            </span>
                          </label>
                        </div>
                      ))}
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Estimated Cost */}
            <FormField
              control={form.control}
              name="estimatedCost"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Estimated Cost ($) *</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="0"
                      max="100000"
                      step="10"
                      placeholder="0"
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormDescription>This is an estimate only</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Cost Justification */}
            <FormField
              control={form.control}
              name="costJustification"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cost Justification (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Why do you think it costs this amount? Any quotes received?"
                      rows={2}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Contact Information */}
            <div className="space-y-4 border-t pt-4">
              <h3 className="font-semibold">Contact Information</h3>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="phone"
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
                  name="unitNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Unit Number</FormLabel>
                      <FormControl>
                        <Input placeholder="101" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="bestTimeToContact"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Best Time to Contact</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select preferred time" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="anytime">Anytime</SelectItem>
                        <SelectItem value="weekdays">Weekdays</SelectItem>
                        <SelectItem value="weekends">Weekends</SelectItem>
                        <SelectItem value="evenings">Evenings only</SelectItem>
                        <SelectItem value="mornings">Mornings only</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Additional Notes */}
            <FormField
              control={form.control}
              name="additionalNotes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Additional Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Any other information that might be helpful..."
                      rows={2}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button type="submit" disabled={createMutation.isPending} className="flex-1">
                {createMutation.isPending ? 'Submitting...' : 'Submit Suggestion'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
