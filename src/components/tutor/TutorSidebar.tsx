import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Home, 
  Calendar, 
  PawPrint, 
  User, 
  Settings, 
  Bell,
  Heart,
  FileText,
  LogOut,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/useAuth';
import { useState } from 'react';
import logoVetPerto from '@/assets/logo-vetperto.jpg';

const menuItems = [
  { 
    href: '/tutor', 
    label: 'Início', 
    icon: Home,
    description: 'Visão geral'
  },
  { 
    href: '/tutor/agendamentos', 
    label: 'Agendamentos', 
    icon: Calendar,
    description: 'Suas consultas'
  },
  { 
    href: '/tutor/pets', 
    label: 'Meus Pets', 
    icon: PawPrint,
    description: 'Gerenciar pets'
  },
  { 
    href: '/tutor/favoritos', 
    label: 'Favoritos', 
    icon: Heart,
    description: 'Profissionais salvos'
  },
  { 
    href: '/tutor/historico', 
    label: 'Histórico', 
    icon: FileText,
    description: 'Consultas anteriores'
  },
];

const bottomMenuItems = [
  { 
    href: '/tutor/perfil', 
    label: 'Meu Perfil', 
    icon: User,
    description: 'Dados pessoais'
  },
  { 
    href: '/tutor/notificacoes', 
    label: 'Notificações', 
    icon: Bell,
    description: 'Alertas e avisos'
  },
  { 
    href: '/tutor/configuracoes', 
    label: 'Configurações', 
    icon: Settings,
    description: 'Preferências'
  },
];

export function TutorSidebar() {
  const location = useLocation();
  const { profile, signOut } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  const isActive = (path: string) => {
    if (path === '/tutor') {
      return location.pathname === '/tutor';
    }
    return location.pathname.startsWith(path);
  };

  const getInitials = () => {
    const name = profile?.social_name || profile?.full_name || 'U';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
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
                Área do Tutor
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
          <Avatar className="h-10 w-10 border-2 border-primary/20">
            <AvatarImage src={profile?.profile_picture_url || undefined} />
            <AvatarFallback className="bg-primary/10 text-primary font-semibold text-sm">
              {getInitials()}
            </AvatarFallback>
          </Avatar>
        ) : (
          <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-primary/5 to-secondary/5 border border-border/50">
            <Avatar className="h-12 w-12 border-2 border-primary/20">
              <AvatarImage src={profile?.profile_picture_url || undefined} />
              <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                {getInitials()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground truncate">
                {profile?.social_name || profile?.full_name?.split(' ')[0] || 'Usuário'}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {profile?.email}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          
          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative",
                active 
                  ? "bg-primary text-primary-foreground shadow-glow" 
                  : "text-muted-foreground hover:text-foreground hover:bg-muted",
                collapsed && "justify-center px-2"
              )}
            >
              <Icon className={cn(
                "flex-shrink-0 transition-transform duration-200",
                active ? "w-5 h-5" : "w-5 h-5 group-hover:scale-110"
              )} />
              
              {!collapsed && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{item.label}</p>
                  <p className={cn(
                    "text-[10px] truncate",
                    active ? "text-primary-foreground/70" : "text-muted-foreground"
                  )}>
                    {item.description}
                  </p>
                </div>
              )}

              {/* Tooltip for collapsed state */}
              {collapsed && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-popover text-popover-foreground text-xs rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50">
                  {item.label}
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
                  ? "bg-primary/10 text-primary" 
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
