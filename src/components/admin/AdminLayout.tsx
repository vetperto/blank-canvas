import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AdminSidebar } from "./AdminSidebar";
import { useAuth } from "@/hooks/useAuth";
import { useAdmin } from "@/hooks/useAdmin";

interface AdminLayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  actions?: React.ReactNode;
}

export function AdminLayout({ children, title, description, actions }: AdminLayoutProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isAdmin, isLoading, stats } = useAdmin();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAdmin) {
      navigate("/");
    }
  }, [isLoading, isAdmin, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Verificando permissões...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background flex">
      <AdminSidebar
        stats={{
          pendingProfessionals: stats.pendingDocuments,
          pendingReviews: stats.pendingReviews,
          pendingDocuments: stats.pendingDocuments,
        }}
        isMobileOpen={isMobileMenuOpen}
        onMobileClose={() => setIsMobileMenuOpen(false)}
      />

      <div className="flex-1 flex flex-col min-h-screen">
        {/* Mobile Header */}
        <header className="lg:hidden sticky top-0 z-30 bg-card border-b px-4 py-3 flex items-center justify-between">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <Menu className="w-5 h-5" />
          </Button>
          <span className="font-semibold">VetPerto Admin</span>
          <div className="w-10" /> {/* Spacer */}
        </header>

        {/* Page Header */}
        {(title || actions) && (
          <div className="bg-card border-b px-6 py-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                {title && <h1 className="text-2xl font-bold">{title}</h1>}
                {description && (
                  <p className="text-muted-foreground mt-1">{description}</p>
                )}
              </div>
              {actions && <div className="flex items-center gap-2">{actions}</div>}
            </div>
          </div>
        )}

        {/* Main Content */}
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
