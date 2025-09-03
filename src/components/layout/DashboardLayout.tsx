import { Outlet } from 'react-router-dom';
import Navigation from './Navigation';
import Footer from './Footer';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';

const DashboardLayout = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navigation />
      <main className="flex-1 max-w-7xl mx-auto px-4 py-8 w-full">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default DashboardLayout;