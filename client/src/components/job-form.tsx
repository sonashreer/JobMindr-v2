import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { insertJobApplicationSchema, type InsertJobApplication } from '@shared/schema';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { PlusCircle, Send } from 'lucide-react';

interface JobFormProps {
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
}

export function JobForm({ onSuccess, onError }: JobFormProps) {
  const queryClient = useQueryClient();
  
  const form = useForm<InsertJobApplication>({
    resolver: zodResolver(insertJobApplicationSchema),
    defaultValues: {
      jobTitle: '',
      companyName: '',
      dateApplied: new Date().toISOString().split('T')[0],
      applicationStatus: 'Applied',
      employmentType: '',
      contactEmail: '',
      applicationClosingDate: '',
    },
  });

  const createApplicationMutation = useMutation({
    mutationFn: async (data: InsertJobApplication) => {
      const response = await apiRequest('POST', '/api/job-applications', data);
      return response.json();
    },
    onSuccess: () => {
      form.reset({
        jobTitle: '',
        companyName: '',
        dateApplied: new Date().toISOString().split('T')[0],
        applicationStatus: 'Applied',
        employmentType: '',
        contactEmail: '',
        applicationClosingDate: '',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/job-applications'] });
      onSuccess('Job application added successfully!');
    },
    onError: (error: Error) => {
      console.error('Error creating job application:', error);
      onError('Failed to create job application. Please try again.');
    },
  });

  const onSubmit = (data: InsertJobApplication) => {
    // Clean up empty string values
    const cleanData = {
      ...data,
      employmentType: data.employmentType || undefined,
      contactEmail: data.contactEmail || undefined,
      applicationClosingDate: data.applicationClosingDate || undefined,
    };
    
    createApplicationMutation.mutate(cleanData);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PlusCircle className="h-5 w-5 text-primary" />
          Enter Job Application Details
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="jobTitle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Job Title <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g. Frontend Developer"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="companyName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Company Name <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g. Google"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="dateApplied"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Date Applied <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="applicationStatus"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Application Status</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Applied">Applied</SelectItem>
                      <SelectItem value="In progress">In progress</SelectItem>
                      <SelectItem value="Interviewing">Interviewing</SelectItem>
                      <SelectItem value="Offer">Offer</SelectItem>
                      <SelectItem value="Rejected">Rejected</SelectItem>
                      <SelectItem value="Withdrawn">Withdrawn</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="employmentType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Employment Type</FormLabel>
                  <Select value={field.value || ""} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select employment type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="full-time">Full-time</SelectItem>
                      <SelectItem value="part-time">Part-time</SelectItem>
                      <SelectItem value="contract">Contract</SelectItem>
                      <SelectItem value="temporary">Temporary</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="contactEmail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contact Email (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="e.g. hr@company.com"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full"
              disabled={createApplicationMutation.isPending}
            >
              {createApplicationMutation.isPending ? (
                'Submitting...'
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Submit Application
                </>
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
