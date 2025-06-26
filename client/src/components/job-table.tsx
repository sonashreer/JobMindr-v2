import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { type JobApplication } from '@shared/schema';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { ChartLine, ArrowUpDown, ArrowUp, ArrowDown, Edit, Trash2, Briefcase } from 'lucide-react';

interface JobTableProps {
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
}

export function JobTable({ onSuccess, onError }: JobTableProps) {
  const queryClient = useQueryClient();
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [sortBy, setSortBy] = useState<string>('dateApplied');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [filters, setFilters] = useState({
    companyName: '',
    status: '',
    dateApplied: '',
  });
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [currentApplication, setCurrentApplication] = useState<JobApplication | null>(null);
  const [newStatus, setNewStatus] = useState('');

  const { data: applications = [], isLoading } = useQuery({
    queryKey: ['/api/job-applications', { ...filters, sortBy, sortOrder }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.companyName) params.append('companyName', filters.companyName);
      if (filters.status) params.append('status', filters.status);
      if (filters.dateApplied) params.append('dateApplied', filters.dateApplied);
      if (sortBy) params.append('sortBy', sortBy);
      if (sortOrder) params.append('sortOrder', sortOrder);
      
      const response = await fetch(`/api/job-applications?${params}`);
      if (!response.ok) throw new Error('Failed to fetch applications');
      return response.json();
    },
  });

  // Get unique company names for dropdown
  const { data: allApplications = [] } = useQuery({
    queryKey: ['/api/job-applications/all'],
    queryFn: async () => {
      const response = await fetch('/api/job-applications');
      if (!response.ok) throw new Error('Failed to fetch all applications');
      return response.json();
    },
  });

  const uniqueCompanies = Array.from(new Set(allApplications.map((app: JobApplication) => app.companyName)))
    .sort();

  const updateApplicationMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const response = await apiRequest('PUT', `/api/job-applications/${id}`, {
        applicationStatus: status,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/job-applications'] });
      onSuccess('Application status updated successfully!');
      setUpdateModalOpen(false);
      setCurrentApplication(null);
    },
    onError: (error: Error) => {
      console.error('Error updating application:', error);
      onError('Failed to update application status.');
    },
  });

  const deleteApplicationsMutation = useMutation({
    mutationFn: async (ids: number[]) => {
      await apiRequest('DELETE', '/api/job-applications', { ids });
    },
    onSuccess: (_, ids) => {
      queryClient.invalidateQueries({ queryKey: ['/api/job-applications'] });
      onSuccess(`${ids.length} job application(s) deleted successfully!`);
      setSelectedIds([]);
    },
    onError: (error: Error) => {
      console.error('Error deleting applications:', error);
      onError('Failed to delete job applications.');
    },
  });

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(applications.map((app: JobApplication) => app.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectRow = (id: number, checked: boolean) => {
    if (checked) {
      setSelectedIds([...selectedIds, id]);
    } else {
      setSelectedIds(selectedIds.filter(selectedId => selectedId !== id));
    }
  };

  const handleUpdateStatus = (application: JobApplication) => {
    setCurrentApplication(application);
    setNewStatus(application.applicationStatus);
    setUpdateModalOpen(true);
  };

  const confirmUpdate = () => {
    if (currentApplication && newStatus) {
      updateApplicationMutation.mutate({
        id: currentApplication.id,
        status: newStatus,
      });
    }
  };

  const handleDeleteSelected = () => {
    if (selectedIds.length > 0) {
      deleteApplicationsMutation.mutate(selectedIds);
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'Applied':
        return 'default';
      case 'In progress':
        return 'secondary';
      case 'Interviewing':
        return 'outline';
      case 'Offer':
        return 'default';
      case 'Rejected':
        return 'destructive';
      case 'Withdrawn':
        return 'secondary';
      default:
        return 'default';
    }
  };

  const getSortIcon = (column: string) => {
    if (sortBy !== column) return <ArrowUpDown className="ml-1 h-4 w-4" />;
    return sortOrder === 'asc' ? 
      <ArrowUp className="ml-1 h-4 w-4" /> : 
      <ArrowDown className="ml-1 h-4 w-4" />;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ChartLine className="h-5 w-5 text-primary" />
            Job Applications Dashboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p>Loading applications...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ChartLine className="h-5 w-5 text-primary" />
          Job Applications Dashboard
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="bg-gray-50 p-4 rounded-lg border mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <Label className="text-xs font-medium text-gray-600 mb-1 block">
                Filter by Company
              </Label>
              <Select 
                value={filters.companyName || "all"} 
                onValueChange={(value) => setFilters({ ...filters, companyName: value === "all" ? "" : value })}
              >
                <SelectTrigger className="text-sm">
                  <SelectValue placeholder="All Companies" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Companies</SelectItem>
                  {uniqueCompanies.map((company) => (
                    <SelectItem key={company} value={company}>
                      {company}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs font-medium text-gray-600 mb-1 block">
                Filter by Status
              </Label>
              <Select value={filters.status || "all"} onValueChange={(value) => setFilters({ ...filters, status: value === "all" ? "" : value })}>
                <SelectTrigger className="text-sm">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="Applied">Applied</SelectItem>
                  <SelectItem value="In progress">In progress</SelectItem>
                  <SelectItem value="Interviewing">Interviewing</SelectItem>
                  <SelectItem value="Offer">Offer</SelectItem>
                  <SelectItem value="Rejected">Rejected</SelectItem>
                  <SelectItem value="Withdrawn">Withdrawn</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs font-medium text-gray-600 mb-1 block">
                Filter by Date Applied
              </Label>
              <Input
                type="date"
                value={filters.dateApplied}
                onChange={(e) => setFilters({ ...filters, dateApplied: e.target.value })}
                className="text-sm"
              />
            </div>
          </div>
          
          <div className="flex justify-between items-center">
            <div>
              {selectedIds.length > 0 && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Selected ({selectedIds.length})
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Job Applications</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete {selectedIds.length} job application(s)? 
                        This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction 
                        onClick={handleDeleteSelected}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
            <div className="text-sm text-gray-600">
              {applications.length} applications
            </div>
          </div>
        </div>

        {/* Table */}
        {applications.length === 0 ? (
          <div className="text-center py-12">
            <Briefcase className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Job Applications Yet</h3>
            <p className="text-gray-500">Start by adding your first job application above.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    <Checkbox
                      checked={selectedIds.length === applications.length && applications.length > 0}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:text-gray-700"
                    onClick={() => handleSort('jobTitle')}
                  >
                    <div className="flex items-center">
                      Job Title
                      {getSortIcon('jobTitle')}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:text-gray-700"
                    onClick={() => handleSort('companyName')}
                  >
                    <div className="flex items-center">
                      Company
                      {getSortIcon('companyName')}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:text-gray-700"
                    onClick={() => handleSort('dateApplied')}
                  >
                    <div className="flex items-center">
                      Date Applied
                      {getSortIcon('dateApplied')}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:text-gray-700"
                    onClick={() => handleSort('applicationStatus')}
                  >
                    <div className="flex items-center">
                      Status
                      {getSortIcon('applicationStatus')}
                    </div>
                  </TableHead>
                  <TableHead>Employment Type</TableHead>
                  <TableHead>Contact Email</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {applications.map((application: JobApplication) => (
                  <TableRow key={application.id} className="hover:bg-gray-50">
                    <TableCell>
                      <Checkbox
                        checked={selectedIds.includes(application.id)}
                        onCheckedChange={(checked) => 
                          handleSelectRow(application.id, checked as boolean)
                        }
                      />
                    </TableCell>
                    <TableCell className="font-medium">
                      {application.jobTitle}
                    </TableCell>
                    <TableCell>{application.companyName}</TableCell>
                    <TableCell>{application.dateApplied}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(application.applicationStatus)}>
                        {application.applicationStatus}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {application.employmentType ? (
                        <span className="capitalize">{application.employmentType}</span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {application.contactEmail ? (
                        <a 
                          href={`mailto:${application.contactEmail}`} 
                          className="text-blue-600 hover:underline"
                        >
                          {application.contactEmail}
                        </a>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleUpdateStatus(application)}
                        className="text-primary hover:text-primary-dark"
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Update
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Update Status Modal */}
        <Dialog open={updateModalOpen} onOpenChange={setUpdateModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Update Application Status</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <Label className="block text-sm font-medium text-gray-700 mb-2">
                New Status
              </Label>
              <Select value={newStatus} onValueChange={setNewStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Applied">Applied</SelectItem>
                  <SelectItem value="In progress">In progress</SelectItem>
                  <SelectItem value="Interviewing">Interviewing</SelectItem>
                  <SelectItem value="Offer">Offer</SelectItem>
                  <SelectItem value="Rejected">Rejected</SelectItem>
                  <SelectItem value="Withdrawn">Withdrawn</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setUpdateModalOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={confirmUpdate}
                disabled={updateApplicationMutation.isPending}
              >
                {updateApplicationMutation.isPending ? 'Updating...' : 'Update'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
