import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Menu, X, User, Building2, LogIn, LogOut, 
  PawPrint, Calendar, Settings, ChevronDown,
  Stethoscope, LayoutDashboard
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/useAuth";
import logoVetPerto from "@/assets/logo-vetperto.jpg";

const navLinks = [
  { href: "/buscar", label: "Buscar Profissionais" },
  { href: "/servicos", label: "Serviços" },
  { href: "/planos", label: "Para Profissionais" },
  { href: "/sobre", label: "Sobre" },
];

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile, loading, signOut } = useAuth();

  const isActive = (path: string) => location.pathname === path;

  const getInitials = () => {
    const name = profile?.social_name || profile?.full_name || 'U';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  const getDashboardPath = () => {
    if (profile?.user_type === 'tutor') return '/tutor';
    if (profile?.user_type === 'profissional' || profile?.user_type === 'empresa') return '/profissional';
    return '/dashboard';
  };

  const getProfilePath = () => {
    if (profile?.user_type === 'tutor') return '/tutor/perfil';
    if (profile?.user_type === 'profissional' || profile?.user_type === 'empresa') return '/profissional/perfil';
    return '/dashboard';
  };

  const getUserTypeLabel = () => {
    switch (profile?.user_type) {
      case 'tutor': return 'Tutor';
      case 'profissional': return 'Profissional';
      case 'empresa': return 'Empresa';
      default: return 'Usuário';
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const renderAuthenticatedMenu = () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="flex items-center gap-2 px-2 hover:bg-muted">
          <Avatar className="h-8 w-8 border border-border">
            <AvatarImage src={profile?.profile_picture_url || undefined} />
            <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
              {getInitials()}
            </AvatarFallback>
          </Avatar>
          <div className="hidden sm:flex flex-col items-start">
            <span className="text-sm font-medium leading-none">
              {profile?.social_name || profile?.full_name?.split(' ')[0] || 'Usuário'}
            </span>
            <span className="text-[10px] text-muted-foreground leading-none mt-0.5">
              {getUserTypeLabel()}
            </span>
          </div>
          <ChevronDown className="w-4 h-4 text-muted-foreground hidden sm:block" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">
              {profile?.social_name || profile?.full_name}
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              {profile?.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <DropdownMenuItem asChild>
          <Link to={getDashboardPath()} className="flex items-center gap-2 cursor-pointer">
            <LayoutDashboard className="w-4 h-4" />
            Meu Painel
          </Link>
        </DropdownMenuItem>
        
        <DropdownMenuItem asChild>
          <Link to={getProfilePath()} className="flex items-center gap-2 cursor-pointer">
            <User className="w-4 h-4" />
            Meu Perfil
          </Link>
        </DropdownMenuItem>

        {profile?.user_type === 'tutor' && (
          <>
            <DropdownMenuItem asChild>
              <Link to="/tutor/agendamentos" className="flex items-center gap-2 cursor-pointer">
                <Calendar className="w-4 h-4" />
                Meus Agendamentos
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/tutor/pets" className="flex items-center gap-2 cursor-pointer">
                <PawPrint className="w-4 h-4" />
                Meus Pets
              </Link>
            </DropdownMenuItem>
          </>
        )}

        {(profile?.user_type === 'profissional' || profile?.user_type === 'empresa') && (
          <>
            <DropdownMenuItem asChild>
              <Link to="/profissional/agendamentos" className="flex items-center gap-2 cursor-pointer">
                <Calendar className="w-4 h-4" />
                Agendamentos
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/profissional/servicos" className="flex items-center gap-2 cursor-pointer">
                <Stethoscope className="w-4 h-4" />
                Meus Serviços
              </Link>
            </DropdownMenuItem>
          </>
        )}

        <DropdownMenuSeparator />
        
        <DropdownMenuItem 
          onClick={handleSignOut}
          className="flex items-center gap-2 cursor-pointer text-destructive focus:text-destructive"
        >
          <LogOut className="w-4 h-4" />
          Sair
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  const renderGuestMenu = () => (
    <div className="flex items-center gap-3">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="ghost" 
            size="sm" 
            className="gap-2 font-medium text-foreground hover:text-primary hover:bg-primary/5 transition-all duration-200"
          >
            <LogIn className="w-4 h-4" />
            Entrar
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem asChild>
            <Link to="/login/tutor" className="flex items-center gap-2 cursor-pointer">
              <User className="w-4 h-4" />
              Sou Tutor
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link to="/login/profissional" className="flex items-center gap-2 cursor-pointer">
              <Stethoscope className="w-4 h-4" />
              Sou Profissional
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link to="/login/empresa" className="flex items-center gap-2 cursor-pointer">
              <Building2 className="w-4 h-4" />
              Sou Empresa
            </Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Button 
        asChild 
        size="sm"
        className="bg-gradient-primary hover:opacity-90 transition-all duration-300 shadow-sm hover:shadow-md font-semibold px-5"
      >
        <Link to="/cadastro">Cadastre-se</Link>
      </Button>
    </div>
  );

  const renderMobileAuthenticatedMenu = () => (
    <div className="flex flex-col gap-2 px-4">
      <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 mb-2">
        <Avatar className="h-10 w-10 border border-border">
          <AvatarImage src={profile?.profile_picture_url || undefined} />
          <AvatarFallback className="bg-primary/10 text-primary font-semibold">
            {getInitials()}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="text-sm font-medium">
            {profile?.social_name || profile?.full_name?.split(' ')[0]}
          </p>
          <p className="text-xs text-muted-foreground">{getUserTypeLabel()}</p>
        </div>
      </div>
      
      <Link
        to={getDashboardPath()}
        onClick={() => setMobileMenuOpen(false)}
        className="flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium hover:bg-muted transition-colors"
      >
        <LayoutDashboard className="w-4 h-4" />
        Meu Painel
      </Link>
      
      <Link
        to={getProfilePath()}
        onClick={() => setMobileMenuOpen(false)}
        className="flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium hover:bg-muted transition-colors"
      >
        <User className="w-4 h-4" />
        Meu Perfil
      </Link>

      {profile?.user_type === 'tutor' && (
        <>
          <Link
            to="/tutor/agendamentos"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium hover:bg-muted transition-colors"
          >
            <Calendar className="w-4 h-4" />
            Meus Agendamentos
          </Link>
          <Link
            to="/tutor/pets"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium hover:bg-muted transition-colors"
          >
            <PawPrint className="w-4 h-4" />
            Meus Pets
          </Link>
        </>
      )}

      {(profile?.user_type === 'profissional' || profile?.user_type === 'empresa') && (
        <>
          <Link
            to="/profissional/agendamentos"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium hover:bg-muted transition-colors"
          >
            <Calendar className="w-4 h-4" />
            Agendamentos
          </Link>
          <Link
            to="/profissional/servicos"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium hover:bg-muted transition-colors"
          >
            <Stethoscope className="w-4 h-4" />
            Meus Serviços
          </Link>
        </>
      )}
      
      <button
        onClick={() => {
          handleSignOut();
          setMobileMenuOpen(false);
        }}
        className="flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors w-full text-left"
      >
        <LogOut className="w-4 h-4" />
        Sair
      </button>
    </div>
  );

  const renderMobileGuestMenu = () => (
    <div className="flex flex-col gap-2 px-4">
      <Button variant="outline" asChild className="w-full">
        <Link to="/login" onClick={() => setMobileMenuOpen(false)}>Entrar</Link>
      </Button>
      <Button asChild className="w-full bg-gradient-primary">
        <Link to="/cadastro" onClick={() => setMobileMenuOpen(false)}>Cadastre-se</Link>
      </Button>
    </div>
  );

  return (
    <header className="sticky top-0 z-50 w-full glass border-b border-border/50">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="flex items-center justify-center w-11 h-11 rounded-xl overflow-hidden shadow-soft group-hover:shadow-glow transition-shadow duration-300">
            <img 
              src={logoVetPerto} 
              alt="VetPerto Logo" 
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex flex-col">
            <span className="font-display text-xl font-bold text-foreground leading-tight">
              Vet<span className="text-primary">Perto</span>
            </span>
            <span className="text-[10px] text-muted-foreground leading-tight hidden sm:block">
              Cuidado a um clique
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                isActive(link.href)
                  ? "bg-primary-light text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-3">
          {loading ? (
            <div className="w-8 h-8 rounded-full bg-muted animate-pulse" />
          ) : user ? (
            renderAuthenticatedMenu()
          ) : (
            renderGuestMenu()
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2 rounded-lg hover:bg-muted transition-colors"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-border/50 bg-background"
          >
            <nav className="container py-4 flex flex-col gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                    isActive(link.href)
                      ? "bg-primary-light text-primary"
                      : "text-muted-foreground hover:bg-muted"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <div className="border-t border-border my-2" />
              {user ? renderMobileAuthenticatedMenu() : renderMobileGuestMenu()}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
