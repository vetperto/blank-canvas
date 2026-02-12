import { Link } from "react-router-dom";
import { Facebook, Instagram, Linkedin, Twitter, Mail, Phone } from "lucide-react";
import logoVetPerto from "@/assets/logo-vetperto.jpg";

const footerLinks = {
  plataforma: [
    { label: "Buscar Profissionais", href: "/buscar" },
    { label: "Para Profissionais", href: "/planos" },
    { label: "Para Empresas", href: "/planos" },
    { label: "Baixar App", href: "/app" },
  ],
  institucional: [
    { label: "Sobre Nós", href: "/sobre" },
    { label: "Como Funciona", href: "/como-funciona" },
    { label: "Blog", href: "/blog" },
    { label: "Carreiras", href: "/carreiras" },
  ],
  suporte: [
    { label: "Central de Ajuda", href: "/ajuda" },
    { label: "Fale Conosco", href: "/contato" },
    { label: "Termos de Uso", href: "/termos" },
    { label: "Política de Privacidade", href: "/privacidade" },
  ],
};

const socialLinks = [
  { icon: Instagram, href: "#", label: "Instagram" },
  { icon: Facebook, href: "#", label: "Facebook" },
  { icon: Linkedin, href: "#", label: "LinkedIn" },
  { icon: Twitter, href: "#", label: "Twitter" },
];

export function Footer() {
  return (
    <footer className="bg-foreground text-background/90">
      <div className="container py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-3 mb-4">
              <div className="flex items-center justify-center w-12 h-12 rounded-xl overflow-hidden bg-background/10">
                <img 
                  src={logoVetPerto} 
                  alt="VetPerto Logo" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex flex-col">
                <span className="font-display text-xl font-bold">
                  Vet<span className="text-secondary">Perto</span>
                </span>
                <span className="text-xs text-background/60">Cuidado a um clique</span>
              </div>
            </Link>
            <p className="text-background/70 text-sm mb-3 max-w-sm font-medium">
              Da saúde ao lazer, tudo para o seu pet, feito por apaixonados por Pet.
            </p>
            <p className="text-background/60 text-sm mb-6 max-w-sm">
              Conectando tutores aos melhores profissionais e serviços pet do Brasil. 
              Encontre veterinários, pet walkers, adestradores e muito mais perto de você.
            </p>
            <div className="flex gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className="w-10 h-10 flex items-center justify-center rounded-lg bg-background/10 hover:bg-secondary hover:text-secondary-foreground transition-colors"
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Links Sections */}
          <div>
            <h4 className="font-semibold mb-4">Plataforma</h4>
            <ul className="space-y-3">
              {footerLinks.plataforma.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    className="text-sm text-background/70 hover:text-secondary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Institucional</h4>
            <ul className="space-y-3">
              {footerLinks.institucional.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    className="text-sm text-background/70 hover:text-secondary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Suporte</h4>
            <ul className="space-y-3">
              {footerLinks.suporte.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    className="text-sm text-background/70 hover:text-secondary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-background/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-background/60">
            © {new Date().getFullYear()} VetPerto. Todos os direitos reservados.
          </p>
          <div className="flex items-center gap-6 text-sm text-background/60">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4" />
              contato@vetperto.com.br
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4" />
              (11) 99999-9999
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
