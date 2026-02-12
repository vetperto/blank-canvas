import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Stethoscope,
  Scissors,
  Dog,
  Home,
  Heart,
  Brain,
  Bone,
  Eye,
  Syringe,
  Activity,
  Sparkles,
  MapPin,
  Calendar,
  Shield,
  Star,
  ArrowRight,
  CheckCircle,
  Clock,
  Users,
} from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";

const mainServices = [
  {
    icon: Stethoscope,
    title: "Veterinários",
    description: "Consultas, exames e tratamentos com profissionais qualificados e CRMV verificado.",
    features: [
      "Clínica geral e check-ups",
      "Vacinas e vermifugação",
      "Exames laboratoriais",
      "Cirurgias e procedimentos",
      "Atendimento de emergência",
    ],
    count: "2.340+",
    color: "bg-primary",
    lightColor: "bg-primary-light",
    textColor: "text-primary",
  },
  {
    icon: Scissors,
    title: "Banho e Tosa",
    description: "Estética e higiene profissional para deixar seu pet sempre limpo e bonito.",
    features: [
      "Banho completo",
      "Tosa higiênica e estética",
      "Hidratação de pelos",
      "Corte de unhas",
      "Limpeza de ouvidos",
    ],
    count: "1.890+",
    color: "bg-secondary",
    lightColor: "bg-secondary-light",
    textColor: "text-secondary",
  },
  {
    icon: Dog,
    title: "Pet Walker",
    description: "Passeios diários para manter seu pet ativo, saudável e feliz.",
    features: [
      "Passeios individuais ou em grupo",
      "Monitoramento GPS em tempo real",
      "Fotos e vídeos do passeio",
      "Relatórios de atividade",
      "Horários flexíveis",
    ],
    count: "876+",
    color: "bg-accent",
    lightColor: "bg-accent-light",
    textColor: "text-accent",
  },
  {
    icon: Home,
    title: "Hospedagem Pet",
    description: "Day care e hospedagem com carinho e segurança enquanto você viaja.",
    features: [
      "Day care diário",
      "Hospedagem por diárias",
      "Ambientes climatizados",
      "Câmeras de monitoramento",
      "Alimentação inclusa",
    ],
    count: "654+",
    color: "bg-primary",
    lightColor: "bg-primary-light",
    textColor: "text-primary",
  },
];

const specialties = [
  {
    icon: Heart,
    title: "Cardiologia",
    description: "Especialistas em doenças do coração",
  },
  {
    icon: Brain,
    title: "Neurologia",
    description: "Tratamento de distúrbios neurológicos",
  },
  {
    icon: Bone,
    title: "Ortopedia",
    description: "Cirurgias e tratamentos ósseos",
  },
  {
    icon: Eye,
    title: "Oftalmologia",
    description: "Cuidados com a visão do pet",
  },
  {
    icon: Syringe,
    title: "Oncologia",
    description: "Tratamento de tumores e câncer",
  },
  {
    icon: Activity,
    title: "Fisioterapia",
    description: "Reabilitação e recuperação",
  },
  {
    icon: Sparkles,
    title: "Dermatologia",
    description: "Tratamento de pele e pelos",
  },
  {
    icon: Stethoscope,
    title: "Acupuntura",
    description: "Medicina integrativa veterinária",
  },
];

const additionalServices = [
  {
    title: "Adestramento",
    description: "Treinamento comportamental e obediência para pets de todas as idades.",
    icon: Brain,
  },
  {
    title: "Pet Sitter",
    description: "Cuidadores que vão até sua casa para alimentar e brincar com seu pet.",
    icon: Heart,
  },
  {
    title: "Transporte Pet",
    description: "Transporte seguro e confortável para consultas e passeios.",
    icon: MapPin,
  },
  {
    title: "Nutrição Animal",
    description: "Orientação nutricional especializada para dietas balanceadas.",
    icon: Activity,
  },
];

const benefits = [
  {
    icon: Shield,
    title: "Profissionais Verificados",
    description: "Todos os profissionais passam por verificação de documentos e credenciais.",
  },
  {
    icon: Star,
    title: "Avaliações Reais",
    description: "Veja notas e comentários de outros tutores antes de agendar.",
  },
  {
    icon: Calendar,
    title: "Agenda Online 24h",
    description: "Agende consultas e serviços a qualquer hora, de qualquer lugar.",
  },
  {
    icon: Clock,
    title: "Atendimento Domiciliar",
    description: "Muitos profissionais atendem na sua casa, sem stress para o pet.",
  },
];

const petTypes = [
  { name: "Cães", emoji: "🐕" },
  { name: "Gatos", emoji: "🐈" },
  { name: "Aves", emoji: "🐦" },
  { name: "Roedores", emoji: "🐹" },
  { name: "Répteis", emoji: "🦎" },
  { name: "Peixes", emoji: "🐠" },
];

const ServicesPage = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      {/* Hero Section */}
      <section className="relative bg-hero-gradient overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/10 rounded-full blur-3xl" />
        </div>

        <div className="container relative py-16 md:py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto"
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-primary text-primary-foreground text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4" />
              Serviços Completos para seu Pet
            </span>

            <h1 className="font-display text-display-lg mb-4">
              Todos os serviços que seu{" "}
              <span className="text-gradient-primary">pet</span> precisa
            </h1>

            <p className="text-xl font-display font-semibold text-gradient-brand mb-4">
              Da saúde ao lazer, tudo para o seu pet, feito por apaixonados por Pet.
            </p>

            <p className="text-lg text-muted-foreground mb-8">
              De consultas veterinárias a passeios diários, hospedagem e estética. 
              Encontre profissionais qualificados e verificados em todo o Brasil.
            </p>

            <div className="flex flex-wrap justify-center gap-4">
              <Button size="lg" asChild className="bg-gradient-primary hover:opacity-90">
                <Link to="/buscar">
                  <MapPin className="w-5 h-5 mr-2" />
                  Buscar Profissionais
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/planos">
                  Sou Profissional
                </Link>
              </Button>
            </div>
          </motion.div>

          {/* Pet Types */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-12 flex flex-wrap justify-center gap-4"
          >
            {petTypes.map((pet) => (
              <div
                key={pet.name}
                className="flex items-center gap-2 px-4 py-2 bg-card rounded-full border border-border shadow-soft"
              >
                <span className="text-2xl">{pet.emoji}</span>
                <span className="text-sm font-medium">{pet.name}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Main Services */}
      <section className="py-16 md:py-24">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="font-display text-display-sm mb-4">
              Serviços Principais
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Conheça os serviços mais procurados pelos tutores em nossa plataforma.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            {mainServices.map((service, index) => (
              <motion.div
                key={service.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-card rounded-2xl border border-border shadow-card overflow-hidden hover:shadow-hover transition-shadow"
              >
                <div className="p-6 md:p-8">
                  <div className="flex items-start gap-4 mb-4">
                    <div className={`w-14 h-14 rounded-xl ${service.lightColor} ${service.textColor} flex items-center justify-center flex-shrink-0`}>
                      <service.icon className="w-7 h-7" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-display text-xl font-semibold">{service.title}</h3>
                        <span className={`text-sm font-medium ${service.textColor}`}>
                          {service.count} profissionais
                        </span>
                      </div>
                      <p className="text-muted-foreground text-sm">{service.description}</p>
                    </div>
                  </div>

                  <ul className="space-y-2 mb-6">
                    {service.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2 text-sm">
                        <CheckCircle className={`w-4 h-4 ${service.textColor}`} />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button asChild className="w-full" variant="outline">
                    <Link to={`/buscar?categoria=${service.title.toLowerCase()}`}>
                      Encontrar {service.title}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Veterinary Specialties */}
      <section className="py-16 md:py-24 bg-muted/50">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <span className="inline-block px-4 py-2 rounded-full bg-primary-light text-primary text-sm font-medium mb-4">
              Especialidades Veterinárias
            </span>
            <h2 className="font-display text-display-sm mb-4">
              Especialistas para cada necessidade
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Encontre veterinários especializados nas mais diversas áreas da medicina animal.
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {specialties.map((specialty, index) => (
              <motion.div
                key={specialty.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
              >
                <Link
                  to={`/buscar?especialidade=${specialty.title.toLowerCase()}`}
                  className="block p-4 md:p-6 bg-card rounded-xl border border-border text-center hover:shadow-hover hover:border-primary/30 transition-all group"
                >
                  <div className="w-12 h-12 rounded-xl bg-primary-light flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                    <specialty.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-sm md:text-base mb-1">{specialty.title}</h3>
                  <p className="text-xs md:text-sm text-muted-foreground">{specialty.description}</p>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Additional Services */}
      <section className="py-16 md:py-24">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="font-display text-display-sm mb-4">
              Mais Serviços
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Outros serviços disponíveis para o bem-estar completo do seu pet.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {additionalServices.map((service, index) => (
              <motion.div
                key={service.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="p-6 bg-card rounded-2xl border border-border shadow-card hover:shadow-hover transition-all"
              >
                <div className="w-12 h-12 rounded-xl bg-secondary-light flex items-center justify-center mb-4">
                  <service.icon className="w-6 h-6 text-secondary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{service.title}</h3>
                <p className="text-sm text-muted-foreground">{service.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 md:py-24 bg-muted/50">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <span className="inline-block px-4 py-2 rounded-full bg-secondary-light text-secondary text-sm font-medium mb-4">
              Por que escolher o VetPerto?
            </span>
            <h2 className="font-display text-display-sm mb-4">
              A melhor experiência para você e seu pet
            </h2>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit, index) => (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="w-16 h-16 rounded-2xl bg-gradient-primary flex items-center justify-center mx-auto mb-4 shadow-soft">
                  <benefit.icon className="w-8 h-8 text-primary-foreground" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{benefit.title}</h3>
                <p className="text-sm text-muted-foreground">{benefit.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative bg-gradient-primary rounded-3xl p-8 md:p-12 text-center overflow-hidden shadow-glow"
          >
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-secondary/20 rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
            </div>

            <div className="relative z-10 max-w-2xl mx-auto">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Users className="w-8 h-8 text-primary-foreground" />
              </div>
              <h2 className="font-display text-display-sm text-primary-foreground mb-4">
                É profissional pet?
              </h2>
              <p className="text-xl text-primary-foreground/90 font-medium mb-2">
                Faça parte da maior plataforma de serviços pet do Brasil.
              </p>
              <p className="text-primary-foreground/70 mb-8">
                Cadastre-se e conquiste novos clientes. Planos a partir de R$ 29,99/mês.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Button size="lg" variant="secondary" className="bg-card text-primary hover:bg-card/90 shadow-soft" asChild>
                  <Link to="/cadastro/profissional">
                    Cadastrar como Profissional
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10" asChild>
                  <Link to="/planos">
                    Ver Planos
                  </Link>
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ServicesPage;
