import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { LowCreditsAlert, LostClientNotificationListener } from "@/components/credits";
import Index from "./pages/Index";
import AboutPage from "./pages/AboutPage";
import SearchPage from "./pages/SearchPage";
import ProfessionalProfilePage from "./pages/ProfessionalProfile";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ForgotPassword from "./pages/auth/ForgotPassword";
import Dashboard from "./pages/Dashboard";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminTutors from "./pages/admin/AdminTutors";
import AdminProfessionals from "./pages/admin/AdminProfessionals";
import AdminCompanies from "./pages/admin/AdminCompanies";
import AdminVerification from "./pages/admin/AdminVerification";
import AdminReviews from "./pages/admin/AdminReviews";
import AdminDocuments from "./pages/admin/AdminDocuments";
import AdminLogs from "./pages/admin/AdminLogs";
import PlansPage from "./pages/PlansPage";
import ServicesPage from "./pages/ServicesPage";
import NotFound from "./pages/NotFound";
import ConfirmAppointment from "./pages/ConfirmAppointment";

// Tutor Pages
import TutorDashboard from "./pages/tutor/TutorDashboard";
import TutorProfile from "./pages/tutor/TutorProfile";
import TutorAppointments from "./pages/tutor/TutorAppointments";
import TutorPets from "./pages/tutor/TutorPets";
import TutorFavorites from "./pages/tutor/TutorFavorites";
import TutorHistory from "./pages/tutor/TutorHistory";
import TutorNotifications from "./pages/tutor/TutorNotifications";
import TutorSettings from "./pages/tutor/TutorSettings";

// Professional Pages
import ProfessionalDashboard from "./pages/professional/ProfessionalDashboard";
import ProfessionalProfile from "./pages/professional/ProfessionalProfile";
import ProfessionalAppointments from "./pages/professional/ProfessionalAppointments";
import ProfessionalAvailability from "./pages/professional/ProfessionalAvailability";
import ProfessionalServices from "./pages/professional/ProfessionalServices";
import ProfessionalPortfolio from "./pages/professional/ProfessionalPortfolio";
import ProfessionalPriceTable from "./pages/professional/ProfessionalPriceTable";
import ProfessionalReviews from "./pages/professional/ProfessionalReviews";
import ProfessionalReports from "./pages/professional/ProfessionalReports";
import ProfessionalNotifications from "./pages/professional/ProfessionalNotifications";
import ProfessionalSettings from "./pages/professional/ProfessionalSettings";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          {/* Global Credit Alerts for Professionals */}
          <LowCreditsAlert />
          <LostClientNotificationListener />
          
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/sobre" element={<AboutPage />} />
            <Route path="/servicos" element={<ServicesPage />} />
            <Route path="/buscar" element={<SearchPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/login/:type" element={<Login />} />
            <Route path="/cadastro" element={<Register />} />
            <Route path="/cadastro/:type" element={<Register />} />
            <Route path="/recuperar-senha" element={<ForgotPassword />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/tutores" element={<AdminTutors />} />
            <Route path="/admin/profissionais" element={<AdminProfessionals />} />
            <Route path="/admin/empresas" element={<AdminCompanies />} />
            <Route path="/admin/verificacao" element={<AdminVerification />} />
            <Route path="/admin/avaliacoes" element={<AdminReviews />} />
            <Route path="/admin/documentos" element={<AdminDocuments />} />
            <Route path="/admin/logs" element={<AdminLogs />} />
            <Route path="/planos" element={<PlansPage />} />
            <Route path="/confirmar-agendamento" element={<ConfirmAppointment />} />
            
            {/* Tutor Routes */}
            <Route path="/tutor" element={<TutorDashboard />} />
            <Route path="/tutor/perfil" element={<TutorProfile />} />
            <Route path="/tutor/agendamentos" element={<TutorAppointments />} />
            <Route path="/tutor/pets" element={<TutorPets />} />
            <Route path="/tutor/favoritos" element={<TutorFavorites />} />
            <Route path="/tutor/historico" element={<TutorHistory />} />
            <Route path="/tutor/notificacoes" element={<TutorNotifications />} />
            <Route path="/tutor/configuracoes" element={<TutorSettings />} />
            
            {/* Professional Panel Routes - Must come before :id route */}
            <Route path="/profissional" element={<ProfessionalDashboard />} />
            <Route path="/profissional/perfil" element={<ProfessionalProfile />} />
            <Route path="/profissional/agendamentos" element={<ProfessionalAppointments />} />
            <Route path="/profissional/disponibilidade" element={<ProfessionalAvailability />} />
            <Route path="/profissional/servicos" element={<ProfessionalServices />} />
            <Route path="/profissional/portfolio" element={<ProfessionalPortfolio />} />
            <Route path="/profissional/precos" element={<ProfessionalPriceTable />} />
            <Route path="/profissional/avaliacoes" element={<ProfessionalReviews />} />
            <Route path="/profissional/relatorios" element={<ProfessionalReports />} />
            <Route path="/profissional/notificacoes" element={<ProfessionalNotifications />} />
            <Route path="/profissional/configuracoes" element={<ProfessionalSettings />} />
            
            {/* Public Professional Profile - Must come after specific routes */}
            <Route path="/profissional/:id" element={<ProfessionalProfilePage />} />
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
