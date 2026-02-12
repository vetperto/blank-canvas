import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Search, MapPin, Calendar, Star, Shield, Clock, Users, ArrowRight, CheckCircle, Stethoscope, Scissors, Dog, Home } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ResponsiveSearchBar } from "@/components/search/ResponsiveSearchBar";
import { PlanCard } from "@/components/plans/PlanCard";
import { FeaturedProfessionals } from "@/components/home/FeaturedProfessionals";
import { Button } from "@/components/ui/button";
import heroPets from "@/assets/hero-pets.jpg";

const features = [{
  icon: Search,
  title: "Busca Inteligente",
  description: "Encontre profissionais por especialidade, localização e disponibilidade com filtros avançados."
}, {
  icon: MapPin,
  title: "Perto de Você",
  description: "GPS integrado para encontrar serviços no seu bairro, cidade ou região."
}, {
  icon: Calendar,
  title: "Agenda Online",
  description: "Agende consultas e serviços diretamente pela plataforma, 24h por dia."
}, {
  icon: Star,
  title: "Avaliações Reais",
  description: "Veja notas e comentários de outros tutores para escolher com confiança."
}, {
  icon: Shield,
  title: "Profissionais Verificados",
  description: "Validação de CRMV e documentos para sua segurança."
}, {
  icon: Clock,
  title: "Atendimento Domiciliar",
  description: "Muitos profissionais atendem na sua casa, sem stress para o pet."
}];
const serviceCategories = [{
  icon: Stethoscope,
  title: "Veterinários",
  description: "Clínica geral, especialistas, emergências",
  count: 2340,
  color: "bg-primary-light text-primary"
}, {
  icon: Scissors,
  title: "Banho e Tosa",
  description: "Estética e higiene profissional",
  count: 1890,
  color: "bg-secondary-light text-secondary"
}, {
  icon: Dog,
  title: "Pet Walker",
  description: "Passeios diários para seu pet",
  count: 876,
  color: "bg-accent-light text-accent"
}, {
  icon: Home,
  title: "Hospedagem",
  description: "Day care e hospedagem pet",
  count: 654,
  color: "bg-primary-light text-primary"
}];
const stats = [{
  value: "15.000+",
  label: "Profissionais"
}, {
  value: "500.000+",
  label: "Agendamentos"
}, {
  value: "4.8",
  label: "Avaliação Média"
}, {
  value: "5.000+",
  label: "Cidades"
}];
const plans = [{
  name: "Básico",
  price: "R$ 29,99",
  description: "Ideal para começar",
  planType: "basic" as const,
  features: [{
    text: "Perfil básico com descrição",
    included: true
  }, {
    text: "Foto de perfil",
    included: true
  }, {
    text: "Avaliações visíveis",
    included: true
  }, {
    text: "Até 5 agendamentos/mês",
    included: true
  }, {
    text: "Selo de verificado",
    included: false
  }, {
    text: "Tabela de preços",
    included: false
  }, {
    text: "Portfólio de fotos",
    included: false
  }]
}, {
  name: "Intermediário",
  price: "R$ 39,99",
  description: "O mais escolhido",
  planType: "intermediate" as const,
  popular: true,
  features: [{
    text: "Perfil básico com descrição",
    included: true
  }, {
    text: "Foto de perfil",
    included: true
  }, {
    text: "Avaliações visíveis",
    included: true
  }, {
    text: "Até 15 agendamentos/mês",
    included: true
  }, {
    text: "Selo de verificado",
    included: true
  }, {
    text: "Tabela de preços",
    included: true
  }, {
    text: "Portfólio de fotos",
    included: false
  }]
}, {
  name: "Completo",
  price: "R$ 49,99",
  description: "Para profissionais dedicados",
  planType: "complete" as const,
  features: [{
    text: "Perfil completo",
    included: true
  }, {
    text: "Foto de perfil",
    included: true
  }, {
    text: "Avaliações visíveis",
    included: true
  }, {
    text: "Agendamentos ilimitados",
    included: true
  }, {
    text: "Selo de verificado",
    included: true
  }, {
    text: "Tabela de preços",
    included: true
  }, {
    text: "Portfólio de 10 fotos",
    included: true
  }]
}, {
  name: "Empresas",
  price: "R$ 59,99",
  description: "Para clínicas e petshops",
  planType: "enterprise" as const,
  features: [{
    text: "Perfil empresarial completo",
    included: true
  }, {
    text: "Múltiplos profissionais",
    included: true
  }, {
    text: "Avaliações visíveis",
    included: true
  }, {
    text: "Agendamentos ilimitados",
    included: true
  }, {
    text: "Selo de verificado",
    included: true
  }, {
    text: "Tabela de preços",
    included: true
  }, {
    text: "Portfólio de 10 fotos",
    included: true
  }]
}];
const Index = () => {
  return <div className="min-h-screen flex flex-col">
      <Header />

      {/* Hero Section */}
      <section className="relative bg-hero-gradient overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/10 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent/5 rounded-full blur-3xl" />
        </div>

        <div className="container relative py-16 md:py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div initial={{
            opacity: 0,
            x: -20
          }} animate={{
            opacity: 1,
            x: 0
          }} transition={{
            duration: 0.6
          }}>
              {/* Badge */}
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-primary text-primary-foreground text-sm font-medium mb-6 shadow-soft">
                🐾 A plataforma de serviços pet N°1 do Brasil
              </span>

              {/* Main Headline */}
              <h1 className="font-display text-display-lg mb-4">
                Encontre o melhor cuidado para seu{" "}
                <span className="text-gradient-primary">pet</span>
              </h1>

              {/* Slogan */}
              <motion.p initial={{
              opacity: 0,
              y: 10
            }} animate={{
              opacity: 1,
              y: 0
            }} transition={{
              delay: 0.3
            }} className="text-xl md:text-2xl font-display font-semibold text-gradient-brand mb-6">
                Da saúde ao lazer, tudo para o seu pet, feito por apaixonados por Pet.
              </motion.p>

              <p className="text-lg text-muted-foreground mb-8 max-w-lg">
                Conectamos tutores aos melhores veterinários, pet walkers, groomers e 
                serviços pet do Brasil. Agende online, veja avaliações e cuide do seu 
                melhor amigo.
              </p>

              {/* Stats */}
              <div className="flex flex-wrap gap-6 mb-8 p-4 bg-card/50 backdrop-blur-sm rounded-2xl border border-border/50">
                {stats.map((stat, index) => <motion.div key={stat.label} initial={{
                opacity: 0,
                y: 20
              }} animate={{
                opacity: 1,
                y: 0
              }} transition={{
                delay: 0.4 + index * 0.1
              }} className="text-center flex-1 min-w-[80px]">
                    <p className="text-2xl font-bold text-gradient-primary">{stat.value}</p>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                  </motion.div>)}
              </div>
            </motion.div>

            <motion.div initial={{
            opacity: 0,
            scale: 0.95
          }} animate={{
            opacity: 1,
            scale: 1
          }} transition={{
            duration: 0.6,
            delay: 0.2
          }} className="relative">
              <div className="relative rounded-3xl overflow-hidden shadow-hover ring-1 ring-border/50">
                <img src={heroPets} alt="Pets felizes" className="w-full h-auto object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent" />
              </div>

              {/* Floating Card */}
              <motion.div initial={{
              opacity: 0,
              y: 20
            }} animate={{
              opacity: 1,
              y: 0
            }} transition={{
              delay: 0.6
            }} className="absolute -bottom-6 -left-6 bg-card rounded-2xl p-4 shadow-hover border border-border">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-secondary-light flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-secondary" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">+500 mil</p>
                    <p className="text-sm text-muted-foreground">agendamentos realizados</p>
                  </div>
                </div>
              </motion.div>

              {/* Second Floating Card */}
              <motion.div initial={{
              opacity: 0,
              y: -20
            }} animate={{
              opacity: 1,
              y: 0
            }} transition={{
              delay: 0.8
            }} className="absolute -top-4 -right-4 bg-card rounded-2xl p-3 shadow-hover border border-border">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-primary-light flex items-center justify-center">
                    <Shield className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">Verificados</p>
                    <p className="text-xs text-muted-foreground">CRMV validado</p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>

          {/* Search Bar - Responsive */}
          <div className="mt-8 md:mt-12">
            <ResponsiveSearchBar />
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-16 md:py-24">
        <div className="container">
          <motion.div initial={{
          opacity: 0,
          y: 20
        }} whileInView={{
          opacity: 1,
          y: 0
        }} viewport={{
          once: true
        }} className="text-center mb-12">
            <h2 className="font-display text-display-sm mb-4">
              Encontre o serviço ideal
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              De consultas veterinárias a passeios diários, encontre tudo que seu pet precisa em um só lugar.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {serviceCategories.map((category, index) => <motion.div key={category.title} initial={{
            opacity: 0,
            y: 20
          }} whileInView={{
            opacity: 1,
            y: 0
          }} viewport={{
            once: true
          }} transition={{
            delay: index * 0.1
          }}>
                <Link to={`/buscar?categoria=${category.title.toLowerCase()}`} className="block p-6 bg-card rounded-2xl border border-border shadow-card hover:shadow-hover transition-all group">
                  <div className={`w-14 h-14 rounded-xl ${category.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <category.icon className="w-7 h-7" />
                  </div>
                  <h3 className="font-semibold text-lg mb-1">{category.title}</h3>
                  <p className="text-sm text-muted-foreground mb-3">{category.description}</p>
                  <p className="text-sm font-medium text-primary">
                    {category.count.toLocaleString('pt-BR')} profissionais
                  </p>
                </Link>
              </motion.div>)}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-24 bg-muted/50">
        <div className="container">
          <motion.div initial={{
          opacity: 0,
          y: 20
        }} whileInView={{
          opacity: 1,
          y: 0
        }} viewport={{
          once: true
        }} className="text-center mb-12">
            <h2 className="font-display text-display-sm mb-4">
              Por que usar o VetPerto?
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Criamos a melhor experiência para conectar você aos profissionais pet mais qualificados.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => <motion.div key={feature.title} initial={{
            opacity: 0,
            y: 20
          }} whileInView={{
            opacity: 1,
            y: 0
          }} viewport={{
            once: true
          }} transition={{
            delay: index * 0.1
          }} className="p-6 bg-card rounded-2xl border border-border">
                <div className="w-12 h-12 rounded-xl bg-primary-light flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </motion.div>)}
          </div>
        </div>
      </section>

      {/* Top Professionals Section */}
      <FeaturedProfessionals />

      {/* Plans Section */}
      <section className="py-16 md:py-24 bg-muted/50">
        <div className="container">
          <motion.div initial={{
          opacity: 0,
          y: 20
        }} whileInView={{
          opacity: 1,
          y: 0
        }} viewport={{
          once: true
        }} className="text-center mb-12">
            <span className="inline-block px-4 py-2 rounded-full bg-secondary-light text-secondary text-sm font-medium mb-4">
              Para Profissionais
            </span>
            <h2 className="font-display text-display-sm mb-4">
              Planos que cabem no seu bolso
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Escolha o plano ideal para divulgar seus serviços e conquistar mais clientes.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {plans.map((plan, index) => <PlanCard key={plan.name} {...plan} />)}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24">
        <div className="container">
          <motion.div initial={{
          opacity: 0,
          scale: 0.95
        }} whileInView={{
          opacity: 1,
          scale: 1
        }} viewport={{
          once: true
        }} className="relative bg-gradient-primary rounded-3xl p-8 md:p-12 text-center overflow-hidden shadow-glow">
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-secondary/20 rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
            </div>

            <div className="relative z-10 max-w-2xl mx-auto">
              <span className="text-5xl mb-4 block">🐾</span>
              <h2 className="font-display text-display-sm text-primary-foreground mb-4">
                Pronto para encontrar o melhor cuidado?
              </h2>
              <p className="text-xl text-primary-foreground/90 font-medium mb-2">
                Da saúde ao lazer, tudo para o seu pet.
              </p>
              <p className="text-primary-foreground/70 mb-8">
                Junte-se a milhares de tutores que já encontraram os melhores profissionais para seus pets.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Button size="lg" variant="secondary" className="bg-card text-primary hover:bg-card/90 shadow-soft" asChild>
                  <Link to="/buscar">
                    <Search className="w-5 h-5 mr-2" />
                    Buscar Profissionais
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10" asChild>
                  <Link to="/cadastro">
                    Sou Profissional
                  </Link>
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>;
};
export default Index;