import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { JobForm } from '@/components/job-form';
import { JobTable } from '@/components/job-table';
import { Toast } from '@/components/toast';
import { Button } from '@/components/ui/button';
import { Briefcase, LogOut } from 'lucide-react';

export function Dashboard() {
  const { logout } = useAuth();
  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error';
    isVisible: boolean;
  }>({
    message: '',
    type: 'success',
    isVisible: false,
  });

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type, isVisible: true });
  };

  const hideToast = () => {
    setToast(prev => ({ ...prev, isVisible: false }));
  };

  const handleLogout = () => {
    logout();
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="h-10 w-10 bg-primary rounded-lg flex items-center justify-center mr-3">
                <Briefcase className="text-white h-5 w-5" />
              </div>
              <h1 className="text-xl font-semibold text-gray-900">JobMindr</h1>
            </div>
            <Button
              variant="outline"
              onClick={handleLogout}
              className="flex items-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Job Application Form */}
          <div className="lg:col-span-1">
            <JobForm
              onSuccess={(message) => showToast(message, 'success')}
              onError={(message) => showToast(message, 'error')}
            />
          </div>

          {/* Job Applications Dashboard */}
          <div className="lg:col-span-2">
            <JobTable
              onSuccess={(message) => showToast(message, 'success')}
              onError={(message) => showToast(message, 'error')}
            />
          </div>
        </div>
      </main>

      {/* Toast Notifications */}
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={hideToast}
      />
    </div>
  );
}
