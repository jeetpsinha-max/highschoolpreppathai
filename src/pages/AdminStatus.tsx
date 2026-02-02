import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { EnhancementStatusPanel } from '@/components/admin/EnhancementStatusPanel';
import { useUserRole } from '@/hooks/useUserRole';
import { Navigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

export default function AdminStatus() {
  const { roles, loading, hasRole } = useUserRole();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Allow admin users only
  if (!hasRole('admin')) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Admin Status</h1>
          <p className="text-muted-foreground mt-2">
            System health and data cache monitoring
          </p>
        </div>
        
        <EnhancementStatusPanel />
      </main>
      <Footer />
    </div>
  );
}
