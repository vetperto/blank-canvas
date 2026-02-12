import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Calendar, Clock, Settings, User, 
  Briefcase, Home, LogOut, ChevronRight,
  PawPrint
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { useAuth } from '@/hooks/useAuth';
import { AvailabilityManager } from '@/components/scheduling/AvailabilityManager';
import { ServiceManager } from '@/components/scheduling/ServiceManager';
import { AppointmentList } from '@/components/scheduling/AppointmentList';
import { PendingReviews } from '@/components/reviews/PendingReviews';
import { AppointmentLimitCard } from '@/components/dashboard/AppointmentLimitCard';
import { PetManager } from '@/components/pets/PetManager';
import { VaccineReminderTest } from '@/components/pets/VaccineReminderTest';

export default function Dashboard() {
  const { profile, user, loading, signOut } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const isProfessional = profile?.user_type === 'profissional' || profile?.user_type === 'empresa';
  const isTutor = profile?.user_type === 'tutor';

  return (
    <div className="min-h-screen flex flex-col bg-muted/30">
      <Header />

      <main className="flex-1 container py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Welcome Section */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold">
                Olá, {profile?.social_name || profile?.full_name?.split(' ')[0] || 'Usuário'}! 👋
              </h1>
              <p className="text-muted-foreground">
                {isProfessional 
                  ? 'Gerencie sua agenda e serviços'
                  : 'Veja seus agendamentos e pets'
                }
              </p>
            </div>
            <Button variant="outline" onClick={() => signOut()}>
              <LogOut className="w-4 h-4 mr-2" />
              Sair
            </Button>
          </div>

          {/* Professional Dashboard */}
          {isProfessional && (
            <>
              {/* Appointment Limit Card */}
              <div className="mb-6">
                <AppointmentLimitCard />
              </div>

              <Tabs defaultValue="appointments" className="space-y-6">
              <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-grid">
                <TabsTrigger value="appointments" className="gap-2">
                  <Calendar className="w-4 h-4" />
                  <span className="hidden sm:inline">Agendamentos</span>
                </TabsTrigger>
                <TabsTrigger value="availability" className="gap-2">
                  <Clock className="w-4 h-4" />
                  <span className="hidden sm:inline">Disponibilidade</span>
                </TabsTrigger>
                <TabsTrigger value="services" className="gap-2">
                  <Briefcase className="w-4 h-4" />
                  <span className="hidden sm:inline">Serviços</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="appointments">
                <AppointmentList viewAs="professional" />
              </TabsContent>

              <TabsContent value="availability">
                <AvailabilityManager />
              </TabsContent>

              <TabsContent value="services">
                <ServiceManager />
              </TabsContent>
              </Tabs>
            </>
          )}

          {/* Tutor Dashboard */}
          {isTutor && (
            <>
              {/* Pending Reviews Banner */}
              <PendingReviews />

              <Tabs defaultValue="appointments" className="space-y-6">
                <TabsList className="grid w-full grid-cols-2 lg:w-auto lg:inline-grid">
                  <TabsTrigger value="appointments" className="gap-2">
                    <Calendar className="w-4 h-4" />
                    Meus Agendamentos
                  </TabsTrigger>
                  <TabsTrigger value="pets" className="gap-2">
                    <PawPrint className="w-4 h-4" />
                    Meus Pets
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="appointments">
                  <AppointmentList viewAs="tutor" />
                </TabsContent>

                <TabsContent value="pets">
                  <div className="grid gap-6 lg:grid-cols-3">
                    <div className="lg:col-span-2">
                      <PetManager />
                    </div>
                    <div>
                      <VaccineReminderTest />
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </>
          )}
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
