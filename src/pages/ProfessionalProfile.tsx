import { useState, useEffect } from "react";
import { useParams, Link, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  MapPin,
  Eye,
  CheckCircle,
  Calendar,
  Clock,
  Share2,
  Heart,
  Award,
  Briefcase,
  CreditCard,
  Home,
  Building2,
  Loader2,
  Lock,
} from "lucide-react";
import { AppointmentBooking } from "@/components/scheduling/AppointmentBooking";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { StarRating } from "@/components/ui/star-rating";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useProfessionalProfile } from "@/hooks/useProfessionalProfile";
import { useAuth } from "@/hooks/useAuth";
import vet1 from "@/assets/vet-1.jpg";

const planLabels = {
  basic: "Básico",
  intermediate: "Verificado",
  complete: "Completo",
  enterprise: "Empresa",
};

export default function ProfessionalProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading: authLoading } = useAuth();
  const { professional, isLoading, error } = useProfessionalProfile(id);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isBookingOpen, setIsBookingOpen] = useState(false);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      // Save current URL to redirect back after login
      navigate(`/login?redirect=${encodeURIComponent(location.pathname)}`, { replace: true });
    }
  }, [user, authLoading, navigate, location.pathname]);

  // Show loading while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary mb-4" />
            <p className="text-muted-foreground">Verificando acesso...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Show login required message if not authenticated
  if (!user) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center max-w-md px-4">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Acesso Restrito</h2>
            <p className="text-muted-foreground mb-6">
              Para visualizar o perfil dos profissionais, você precisa estar logado.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to={`/login?redirect=${encodeURIComponent(location.pathname)}`}>
                <Button className="w-full sm:w-auto">Fazer Login</Button>
              </Link>
              <Link to={`/cadastro?redirect=${encodeURIComponent(location.pathname)}`}>
                <Button variant="outline" className="w-full sm:w-auto">Criar Conta</Button>
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary mb-4" />
            <p className="text-muted-foreground">Carregando perfil...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !professional) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-lg font-medium mb-2">Profissional não encontrado</p>
            <p className="text-muted-foreground mb-4">
              O perfil que você está procurando não existe ou foi removido.
            </p>
            <Link to="/buscar">
              <Button>Voltar para busca</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1">
        {/* Breadcrumb */}
        <div className="border-b border-border bg-card">
          <div className="container py-3">
            <nav className="text-sm text-muted-foreground">
              <Link to="/" className="hover:text-primary">Início</Link>
              <span className="mx-2">/</span>
              <Link to="/buscar" className="hover:text-primary">Buscar</Link>
              <span className="mx-2">/</span>
              <span className="text-foreground">{professional.name}</span>
            </nav>
          </div>
        </div>

        <div className="container py-8">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Profile Header */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-card rounded-2xl border border-border p-6 shadow-card"
              >
                <div className="flex flex-col sm:flex-row gap-6">
                  <div className="relative shrink-0">
                    <img
                      src={professional.photo || vet1}
                      alt={professional.name}
                      className="w-32 h-32 rounded-2xl object-cover"
                    />
                    {professional.isVerified && (
                      <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-accent rounded-full flex items-center justify-center shadow-soft">
                        <CheckCircle className="w-5 h-5 text-accent-foreground" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h1 className="text-2xl font-bold mb-1">{professional.name}</h1>
                        <p className="text-muted-foreground mb-2">{professional.specialty}</p>
                        <Badge variant="outline" className={`plan-${professional.planType} mb-3`}>
                          {planLabels[professional.planType]}
                        </Badge>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => setIsFavorite(!isFavorite)}
                        >
                          <Heart className={`w-5 h-5 ${isFavorite ? "fill-destructive text-destructive" : ""}`} />
                        </Button>
                        <Button variant="outline" size="icon">
                          <Share2 className="w-5 h-5" />
                        </Button>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <StarRating rating={professional.rating} size="sm" />
                        <span className="font-medium ml-1">{professional.rating}</span>
                        <span className="text-muted-foreground">
                          ({professional.reviewCount} avaliações)
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Eye className="w-4 h-4" />
                        {professional.views} visualizações
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-3 mt-4">
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="w-4 h-4 text-primary" />
                        {professional.location}
                      </div>
                      {professional.crmv && (
                        <div className="flex items-center gap-2 text-sm">
                          <Award className="w-4 h-4 text-primary" />
                          {professional.crmv}
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-sm">
                        <Briefcase className="w-4 h-4 text-primary" />
                        {professional.experience} de experiência
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Tabs */}
              <Tabs defaultValue="about" className="space-y-6">
                <TabsList className="w-full justify-start bg-card border border-border rounded-xl p-1 h-auto flex-wrap">
                  <TabsTrigger value="about" className="rounded-lg">Sobre</TabsTrigger>
                  <TabsTrigger value="services" className="rounded-lg">Serviços</TabsTrigger>
                  <TabsTrigger value="reviews" className="rounded-lg">Avaliações</TabsTrigger>
                  <TabsTrigger value="education" className="rounded-lg">Formação</TabsTrigger>
                </TabsList>

                <TabsContent value="about" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Sobre</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground whitespace-pre-line">
                        {professional.description}
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Tipos de Atendimento</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-3">
                        {professional.attendanceTypes.includes("Consultório") && (
                          <div className="flex items-center gap-2 px-4 py-2 bg-muted rounded-lg">
                            <Building2 className="w-5 h-5 text-primary" />
                            <span>Atendimento em Consultório</span>
                          </div>
                        )}
                        {professional.attendanceTypes.includes("Domiciliar") && (
                          <div className="flex items-center gap-2 px-4 py-2 bg-muted rounded-lg">
                            <Home className="w-5 h-5 text-primary" />
                            <span>Atendimento Domiciliar</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Formas de Pagamento</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {professional.paymentMethods.length > 0 && professional.paymentMethods[0] !== "Consulte" ? (
                        <div className="flex flex-wrap gap-2">
                          {professional.paymentMethods.map((method) => (
                            <Badge key={method} variant="outline" className="px-3 py-1">
                              <CreditCard className="w-3.5 h-3.5 mr-1.5" />
                              {method}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          Métodos de pagamento não informados. Consulte o profissional.
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="services">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Tabela de Serviços</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {professional.services.map((service, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-4 bg-muted rounded-xl"
                          >
                            <div>
                              <p className="font-medium">{service.name}</p>
                              <p className="text-sm text-muted-foreground flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5" />
                                Duração: {service.duration}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-primary">{service.price}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="reviews">
                  <Card>
                    <CardHeader className="flex-row items-center justify-between">
                      <CardTitle className="text-lg">Avaliações dos Tutores</CardTitle>
                      <div className="flex items-center gap-2">
                        <StarRating rating={professional.rating} size="md" />
                        <span className="font-bold text-lg">{professional.rating}</span>
                        <span className="text-muted-foreground">
                          ({professional.reviewCount})
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {professional.reviews.map((review) => (
                          <div
                            key={review.id}
                            className="p-4 bg-muted rounded-xl"
                          >
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <p className="font-medium">{review.author}</p>
                                <p className="text-xs text-muted-foreground">{review.pet}</p>
                              </div>
                              <div className="flex items-center gap-2">
                                <StarRating rating={review.rating} size="sm" />
                                <span className="text-sm text-muted-foreground">{review.date}</span>
                              </div>
                            </div>
                            <p className="text-sm text-muted-foreground">{review.comment}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="education">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Formação Acadêmica</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="relative pl-6 border-l-2 border-primary/30 space-y-6">
                        {professional.education.map((edu, index) => (
                          <div key={index} className="relative">
                            <div className="absolute -left-[29px] w-4 h-4 rounded-full bg-primary" />
                            <p className="text-sm text-primary font-medium">{edu.year}</p>
                            <p className="font-semibold">{edu.title}</p>
                            <p className="text-sm text-muted-foreground">{edu.institution}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>

            {/* Sidebar - Scheduling */}
            <div className="lg:col-span-1">
              <div className="sticky top-20 space-y-4">
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-card rounded-2xl border border-border p-6 shadow-card"
                >
                  <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-primary" />
                    Agendar Consulta
                  </h3>

                  <p className="text-sm text-muted-foreground mb-4">
                    Selecione uma data e horário disponível para agendar sua consulta com {professional.name}.
                  </p>

                  <Button
                    className="w-full bg-gradient-primary hover:opacity-90"
                    size="lg"
                    onClick={() => setIsBookingOpen(true)}
                  >
                    <Calendar className="w-5 h-5 mr-2" />
                    Escolher Data e Horário
                  </Button>

                  <p className="text-xs text-muted-foreground text-center mt-3">
                    Navegue pelo calendário e escolha qualquer data futura disponível
                  </p>
                </motion.div>

                {/* Contact Card */}
                <Card>
                  <CardContent className="p-4">
                    <p className="text-sm text-muted-foreground mb-3">Endereço:</p>
                    <p className="text-sm mb-4">{professional.address}</p>
                    <Button variant="outline" className="w-full" size="sm">
                      <MapPin className="w-4 h-4 mr-2" />
                      Ver no Mapa
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>

          {/* Appointment Booking Modal with Annual Calendar */}
          <AppointmentBooking
            professionalId={professional.id}
            professionalName={professional.name}
            isOpen={isBookingOpen}
            onClose={() => setIsBookingOpen(false)}
          />
        </div>
      </main>

      <Footer />
    </div>
  );
}
