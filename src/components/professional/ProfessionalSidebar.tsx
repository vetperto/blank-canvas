import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Home, 
  Calendar, 
  Clock, 
  Briefcase,
  User, 
  Settings, 
  Bell,
  Star,
  FileText,
  BarChart3,
  LogOut,
  ChevronLeft,
  ChevronRight,
  BadgeCheck,
  Image,
  DollarSign,
  Lock,
  Crown
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { usePlanLimits } from '@/hooks/usePlanLimits';
import { useState } from 'react';
import logoVetPerto from '@/assets/logo-vetperto.jpg';

interface MenuItem {
  href: string;
  label: string;
  icon: any;
  description: string;
  requiresFeature?: 'portfolio' | 'priceTable';
}

const menuItems: MenuItem[] = [
  { 
    href: '/profissional', 
    label: 'Início', 
    icon: Home,
    description: 'Visão geral'
  },
  { 
    href: '/profissional/agendamentos', 
    label: 'Agendamentos', 
    icon: Calendar,
    description: 'Gerenciar consultas'
  },
  { 
    href: '/profissional/disponibilidade', 
    label: 'Disponibilidade', 
    icon: Clock,
    description: 'Horários de atendimento'
  },
  { 
    href: '/profissional/servicos', 
    label: 'Serviços', 
    icon: Briefcase,
    description: 'Seus serviços'
  },
  { 
    href: '/profissional/portfolio', 
    label: 'Portfólio', 
    icon: Image,
    description: 'Galeria de trabalhos',
    requiresFeature: 'portfolio'
  },
  { 
    href: '/profissional/precos', 
    label: 'Tabela de Preços', 
    icon: DollarSign,
    description: 'Seus valores',
    requiresFeature: 'priceTable'
  },
  { 
    href: '/profissional/avaliacoes', 
    label: 'Avaliações', 
    icon: Star,
    description: 'Feedback de clientes'
  },
  { 
    href: '/profissional/relatorios', 
    label: 'Relatórios', 
    icon: BarChart3,
    description: 'Métricas e análises'
  },
];

const bottomMenuItems: MenuItem[] = [
  { 
    href: '/profissional/perfil', 
    label: 'Meu Perfil', 
    icon: User,
    description: 'Dados profissionais'
  },
  { 
    href: '/profissional/notificacoes', 
    label: 'Notificações', 
    icon: Bell,
    description: 'Alertas e avisos'
  },
  { 
    href: '/profissional/configuracoes', 
    label: 'Configurações', 
    icon: Settings,
    description: 'Preferências'
  },
];

export function ProfessionalSidebar() {
  const location = useLocation();
  const { profile, signOut } = useAuth();
  const { planLimits } = usePlanLimits();
  const [collapsed, setCollapsed] = useState(false);

  const isActive = (path: string) => {
    if (path === '/profissional') {
      return location.pathname === '/profissional';
    }
    return location.pathname.startsWith(path);
  };

  const getInitials = () => {
    const name = profile?.social_name || profile?.full_name || 'P';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  const getUserTypeLabel = () => {
    if (profile?.user_type === 'empresa') return 'Empresa';
    return 'Profissional';
  };

  const isFeatureLocked = (item: MenuItem) => {
    if (!item.requiresFeature) return false;
    
    if (item.requiresFeature === 'portfolio') {
      return !planLimits?.hasPortfolio;
    }
    if (item.requiresFeature === 'priceTable') {
      return !planLimits?.hasPriceTable;
    }
    return false;
  };

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 80 : 280 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className={cn(
        "fixed left-0 top-0 h-screen bg-card border-r border-border flex flex-col z-40",
        "shadow-soft"
      )}
    >
      {/* Logo Section */}
      <div className={cn(
        "flex items-center h-16 border-b border-border px-4",
        collapsed ? "justify-center" : "justify-between"
      )}>
        <Link to="/" className="flex items-center gap-3 group">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl overflow-hidden shadow-soft group-hover:shadow-glow transition-shadow duration-300">
            <img 
              src={logoVetPerto} 
              alt="VetPerto Logo" 
              className="w-full h-full object-cover"
            />
          </div>
          {!collapsed && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col"
            >
              <span className="font-display text-lg font-bold text-foreground leading-tight">
                Vet<span className="text-primary">Perto</span>
              </span>
              <span className="text-[9px] text-muted-foreground leading-tight">
                Área do {getUserTypeLabel()}
              </span>
            </motion.div>
          )}
        </Link>
        
        {!collapsed && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setCollapsed(true)}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        )}
      </div>

      {collapsed && (
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 mx-auto mt-2"
          onClick={() => setCollapsed(false)}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      )}

      {/* User Profile Card */}
      <div className={cn(
        "p-4 border-b border-border",
        collapsed && "flex justify-center"
      )}>
        {collapsed ? (
          <div className="relative">
            <Avatar className="h-10 w-10 border-2 border-secondary/20">
              <AvatarImage src={profile?.profile_picture_url || undefined} />
              <AvatarFallback className="bg-secondary/10 text-secondary font-semibold text-sm">
                {getInitials()}
              </AvatarFallback>
            </Avatar>
            {profile?.is_verified && (
              <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-0.5">
                <BadgeCheck className="w-3 h-3 text-white" />
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-secondary/5 to-primary/5 border border-border/50">
            <div className="relative">
              <Avatar className="h-12 w-12 border-2 border-secondary/20">
                <AvatarImage src={profile?.profile_picture_url || undefined} />
                <AvatarFallback className="bg-secondary/10 text-secondary font-semibold">
                  {getInitials()}
                </AvatarFallback>
              </Avatar>
              {profile?.is_verified && (
                <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-0.5">
                  <BadgeCheck className="w-3 h-3 text-white" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <p className="text-sm font-semibold text-foreground truncate">
                  {profile?.social_name || profile?.full_name?.split(' ')[0] || 'Profissional'}
                </p>
              </div>
              <p className="text-xs text-muted-foreground truncate">
                {planLimits?.planName || 'Sem Plano'}
              </p>
              {!planLimits?.isSubscribed && (
                <Link to="/planos">
                  <Badge variant="outline" className="mt-1 text-[10px] bg-yellow-500/10 text-yellow-600 border-yellow-500/20 cursor-pointer hover:bg-yellow-500/20">
                    <Crown className="w-2.5 h-2.5 mr-1" />
                    Fazer Upgrade
                  </Badge>
                </Link>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          const locked = isFeatureLocked(item);
          
          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative",
                active 
                  ? "bg-secondary text-secondary-foreground shadow-glow" 
                  : locked
                  ? "text-muted-foreground/50 hover:text-muted-foreground hover:bg-muted/50"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted",
                collapsed && "justify-center px-2"
              )}
            >
              <div className="relative">
                <Icon className={cn(
                  "flex-shrink-0 transition-transform duration-200",
                  active ? "w-5 h-5" : "w-5 h-5 group-hover:scale-110"
                )} />
                {locked && !collapsed && (
                  <Lock className="w-2.5 h-2.5 absolute -top-1 -right-1 text-muted-foreground" />
                )}
              </div>
              
              {!collapsed && (
                <div className="flex-1 min-w-0 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium truncate">{item.label}</p>
                    <p className={cn(
                      "text-[10px] truncate",
                      active ? "text-secondary-foreground/70" : "text-muted-foreground"
                    )}>
                      {item.description}
                    </p>
                  </div>
                  {locked && (
                    <Badge variant="outline" className="text-[9px] ml-2 bg-muted">
                      <Lock className="w-2 h-2 mr-0.5" />
                      Pro
                    </Badge>
                  )}
                </div>
              )}

              {/* Tooltip for collapsed state */}
              {collapsed && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-popover text-popover-foreground text-xs rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50">
                  {item.label}
                  {locked && <Lock className="w-3 h-3 inline ml-1" />}
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Navigation */}
      <div className="p-3 border-t border-border space-y-1">
        {bottomMenuItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          
          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-200 group relative",
                active 
                  ? "bg-secondary/10 text-secondary" 
                  : "text-muted-foreground hover:text-foreground hover:bg-muted",
                collapsed && "justify-center px-2"
              )}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              
              {!collapsed && (
                <span className="text-sm font-medium truncate">{item.label}</span>
              )}

              {collapsed && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-popover text-popover-foreground text-xs rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50">
                  {item.label}
                </div>
              )}
            </Link>
          );
        })}

        {/* Logout Button */}
        <button
          onClick={() => signOut()}
          className={cn(
            "flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-200 w-full group relative",
            "text-destructive/70 hover:text-destructive hover:bg-destructive/10",
            collapsed && "justify-center px-2"
          )}
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          
          {!collapsed && (
            <span className="text-sm font-medium">Sair</span>
          )}

          {collapsed && (
            <div className="absolute left-full ml-2 px-2 py-1 bg-popover text-popover-foreground text-xs rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50">
              Sair
            </div>
          )}
        </button>
      </div>
    </motion.aside>
  );
}
