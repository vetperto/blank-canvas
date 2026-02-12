import { NavLink, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  UserCog,
  Building2,
  FileText,
  Settings,
  History,
  Shield,
  Star,
  FileCheck,
  Home,
  LogOut,
  ChevronDown,
  Menu,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";

interface AdminSidebarProps {
  stats?: {
    pendingProfessionals: number;
    pendingReviews: number;
    pendingDocuments: number;
  };
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
}

interface NavItem {
  label: string;
  href: string;
  icon: typeof LayoutDashboard;
  badge?: number;
  children?: NavItem[];
}

export function AdminSidebar({ stats, isMobileOpen, onMobileClose }: AdminSidebarProps) {
  const location = useLocation();
  const { signOut } = useAuth();
  const [openSections, setOpenSections] = useState<string[]>(["usuarios"]);

  const navItems: NavItem[] = [
    {
      label: "Dashboard",
      href: "/admin",
      icon: LayoutDashboard,
    },
    {
      label: "Usuários",
      href: "#usuarios",
      icon: Users,
      children: [
        {
          label: "Tutores",
          href: "/admin/tutores",
          icon: Users,
        },
        {
          label: "Profissionais",
          href: "/admin/profissionais",
          icon: UserCog,
          badge: stats?.pendingProfessionals,
        },
        {
          label: "Empresas",
          href: "/admin/empresas",
          icon: Building2,
        },
      ],
    },
    {
      label: "Verificação",
      href: "/admin/verificacao",
      icon: Shield,
      badge: stats?.pendingDocuments,
    },
    {
      label: "Avaliações",
      href: "/admin/avaliacoes",
      icon: Star,
      badge: stats?.pendingReviews,
    },
    {
      label: "Documentos",
      href: "/admin/documentos",
      icon: FileCheck,
      badge: stats?.pendingDocuments,
    },
    {
      label: "Conteúdo",
      href: "/admin/conteudo",
      icon: FileText,
    },
    {
      label: "Logs de Ações",
      href: "/admin/logs",
      icon: History,
    },
    {
      label: "Configurações",
      href: "/admin/configuracoes",
      icon: Settings,
    },
  ];

  const toggleSection = (section: string) => {
    setOpenSections((prev) =>
      prev.includes(section)
        ? prev.filter((s) => s !== section)
        : [...prev, section]
    );
  };

  const isActive = (href: string) => {
    if (href === "/admin") {
      return location.pathname === "/admin";
    }
    return location.pathname.startsWith(href);
  };

  const renderNavItem = (item: NavItem, level = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const active = isActive(item.href);
    const isChildActive = item.children?.some((child) => isActive(child.href));

    if (hasChildren) {
      const sectionKey = item.href.replace("#", "");
      const isOpen = openSections.includes(sectionKey) || isChildActive;

      return (
        <Collapsible
          key={item.href}
          open={isOpen}
          onOpenChange={() => toggleSection(sectionKey)}
        >
          <CollapsibleTrigger asChild>
            <button
              className={cn(
                "w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                isChildActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <div className="flex items-center gap-3">
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
              </div>
              <ChevronDown
                className={cn(
                  "w-4 h-4 transition-transform",
                  isOpen && "rotate-180"
                )}
              />
            </button>
          </CollapsibleTrigger>
          <CollapsibleContent className="pl-4 mt-1 space-y-1">
            {item.children.map((child) => renderNavItem(child, level + 1))}
          </CollapsibleContent>
        </Collapsible>
      );
    }

    return (
      <NavLink
        key={item.href}
        to={item.href}
        onClick={onMobileClose}
        className={cn(
          "flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
          active
            ? "bg-primary text-primary-foreground"
            : "text-muted-foreground hover:bg-muted hover:text-foreground",
          level > 0 && "text-sm"
        )}
      >
        <div className="flex items-center gap-3">
          <item.icon className="w-5 h-5" />
          <span>{item.label}</span>
        </div>
        {item.badge && item.badge > 0 && (
          <Badge variant="destructive" className="h-5 px-1.5 text-xs">
            {item.badge}
          </Badge>
        )}
      </NavLink>
    );
  };

  const sidebarContent = (
    <>
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Shield className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="font-bold text-lg">VetPerto</h2>
            <p className="text-xs text-muted-foreground">Painel Admin</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-1">{navItems.map((item) => renderNavItem(item))}</nav>
      </ScrollArea>

      {/* Footer */}
      <div className="p-3 border-t space-y-2">
        <NavLink
          to="/"
          onClick={onMobileClose}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        >
          <Home className="w-5 h-5" />
          <span>Voltar ao Site</span>
        </NavLink>
        <button
          onClick={() => signOut()}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span>Sair</span>
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-card border-r h-screen sticky top-0">
        {sidebarContent}
      </aside>

      {/* Mobile Sidebar Overlay */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={onMobileClose}
        />
      )}

      {/* Mobile Sidebar */}
      <aside
        className={cn(
          "lg:hidden fixed inset-y-0 left-0 w-72 bg-card border-r z-50 flex flex-col transform transition-transform duration-200",
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <button
          onClick={onMobileClose}
          className="absolute right-3 top-4 p-1 rounded-md hover:bg-muted"
        >
          <X className="w-5 h-5" />
        </button>
        {sidebarContent}
      </aside>
    </>
  );
}
