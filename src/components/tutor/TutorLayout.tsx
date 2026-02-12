import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { TutorSidebar } from './TutorSidebar';

interface TutorLayoutProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
}

export function TutorLayout({ children, title, subtitle }: TutorLayoutProps) {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login/tutor" replace />;
  }

  if (profile?.user_type !== 'tutor') {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-muted/30 flex">
      <TutorSidebar />
      
      {/* Main Content */}
      <main className="flex-1 ml-[280px] max-lg:ml-20">
        {/* Header */}
        {(title || subtitle) && (
          <div className="sticky top-0 z-30 bg-background/80 backdrop-blur-lg border-b border-border">
            <div className="px-6 lg:px-8 py-4">
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {title && (
                  <h1 className="text-2xl font-bold text-foreground">{title}</h1>
                )}
                {subtitle && (
                  <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
                )}
              </motion.div>
            </div>
          </div>
        )}

        {/* Page Content */}
        <div className="p-6 lg:p-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            {children}
          </motion.div>
        </div>
      </main>
    </div>
  );
}
