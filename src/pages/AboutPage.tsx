import { motion } from "framer-motion";
import { Heart, Shield, Users, Award, Target, Eye, MapPin, Calendar, Star, CheckCircle } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

const values = [
  {
    icon: Heart,
    title: "Amor pelos Animais",
    description: "Cada pet merece o melhor cuidado. Conectamos tutores apaixonados a profissionais dedicados."
  },
  {
    icon: Shield,
    title: "Confiança e Segurança",
    description: "Verificamos documentos e credenciais de todos os profissionais para sua tranquilidade."
  },
  {
    icon: Users,
    title: "Comunidade",
    description: "Construímos uma rede de profissionais qualificados e tutores responsáveis em todo Brasil."
  },
  {
    icon: Award,
    title: "Excelência",
    description: "Promovemos os melhores padrões de cuidado e atendimento para pets."
  }
];

const stats = [
  { value: "10.000+", label: "Tutores Cadastrados" },
  { value: "2.500+", label: "Profissionais Verificados" },
  { value: "50.000+", label: "Consultas Realizadas" },
  { value: "4.8", label: "Avaliação Média" }
];

const features = [
  {
    icon: MapPin,
    title: "Busca por Localização",
    description: "Encontre profissionais perto de você com nossa busca inteligente por GPS."
  },
  {
    icon: Calendar,
    title: "Agendamento Online",
    description: "Marque consultas e serviços de forma rápida e prática, 24 horas por dia."
  },
  {
    icon: Star,
    title: "Avaliações Reais",
    description: "Leia avaliações de outros tutores e escolha com confiança."
  },
  {
    icon: CheckCircle,
    title: "Profissionais Verificados",
    description: "Todos os profissionais passam por verificação de documentos e credenciais."
  }
];

const team = [
  {
    name: "Equipe de Desenvolvimento",
    role: "Tecnologia",
    description: "Trabalhamos constantemente para melhorar a plataforma e sua experiência."
  },
  {
    name: "Equipe de Suporte",
    role: "Atendimento",
    description: "Estamos aqui para ajudar tutores e profissionais em todas as etapas."
  },
  {
    name: "Equipe de Verificação",
    role: "Qualidade",
    description: "Garantimos que todos os profissionais atendam aos nossos padrões de qualidade."
  }
];

const AboutPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="relative py-20 md:py-28 bg-hero-gradient overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl mx-auto text-center"
          >
            <span className="inline-block px-4 py-2 rounded-full bg-primary/10 text-primary font-medium text-sm mb-6">
              Sobre Nós
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6">
              Conectando{" "}
              <span className="text-gradient-primary">amor</span> e{" "}
              <span className="text-gradient-primary">cuidado</span> para seu pet
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              O VetPerto nasceu do amor pelos animais e da vontade de facilitar o acesso a profissionais 
              qualificados em todo o Brasil.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="bg-card rounded-2xl p-8 shadow-card border border-border"
            >
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
                <Target className="w-7 h-7 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-4">Nossa Missão</h2>
              <p className="text-muted-foreground leading-relaxed">
                Democratizar o acesso a serviços pet de qualidade, conectando tutores a profissionais 
                verificados e comprometidos com o bem-estar animal. Queremos que todo pet tenha acesso 
                ao melhor cuidado, independente de onde esteja.
              </p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-card rounded-2xl p-8 shadow-card border border-border"
            >
              <div className="w-14 h-14 rounded-xl bg-secondary/10 flex items-center justify-center mb-6">
                <Eye className="w-7 h-7 text-secondary" />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-4">Nossa Visão</h2>
              <p className="text-muted-foreground leading-relaxed">
                Ser a principal plataforma de serviços pet do Brasil, reconhecida pela qualidade dos 
                profissionais, facilidade de uso e impacto positivo na vida de milhões de animais e 
                seus tutores.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Nossos Valores
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Os princípios que guiam todas as nossas decisões e ações
            </p>
          </motion.div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-card rounded-xl p-6 shadow-soft border border-border text-center"
              >
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <value.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{value.title}</h3>
                <p className="text-sm text-muted-foreground">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              VetPerto em Números
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Nosso impacto na comunidade pet brasileira
            </p>
          </motion.div>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="text-center p-6"
              >
                <div className="text-4xl md:text-5xl font-bold text-primary mb-2">
                  {stat.value}
                </div>
                <div className="text-muted-foreground font-medium">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Como Funciona
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Facilitamos a conexão entre tutores e profissionais pet
            </p>
          </motion.div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-card rounded-xl p-6 shadow-soft border border-border"
              >
                <div className="w-12 h-12 rounded-lg bg-gradient-primary flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-primary-foreground" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Nossa Equipe
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Profissionais dedicados a tornar a vida dos pets e tutores mais fácil
            </p>
          </motion.div>
          
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {team.map((member, index) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-card rounded-xl p-6 shadow-soft border border-border text-center"
              >
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">{member.name}</h3>
                <p className="text-primary text-sm font-medium mb-2">{member.role}</p>
                <p className="text-sm text-muted-foreground">{member.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-24 bg-gradient-primary">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-2xl mx-auto"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
              Faça Parte da Comunidade VetPerto
            </h2>
            <p className="text-primary-foreground/80 mb-8">
              Junte-se a milhares de tutores e profissionais que já confiam em nossa plataforma
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/cadastro/tutor"
                className="inline-flex items-center justify-center px-6 py-3 bg-background text-foreground font-medium rounded-lg hover:bg-background/90 transition-colors"
              >
                Sou Tutor
              </a>
              <a
                href="/cadastro/profissional"
                className="inline-flex items-center justify-center px-6 py-3 bg-primary-foreground/10 text-primary-foreground font-medium rounded-lg border border-primary-foreground/20 hover:bg-primary-foreground/20 transition-colors"
              >
                Sou Profissional
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default AboutPage;
