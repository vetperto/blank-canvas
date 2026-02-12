// VetPerto Subscription Plans Configuration
// These IDs are from Stripe and should match the products created there

export interface SubscriptionPlan {
  id: string;
  name: string;
  slug: string;
  priceId: string;
  productId: string;
  price: number;
  description: string;
  features: {
    text: string;
    included: boolean;
  }[];
  monthlyAppointmentsLimit: number | null;
  hasVerifiedBadge: boolean;
  hasPriceTable: boolean;
  hasPortfolio: boolean;
  portfolioLimit: number;
  popular?: boolean;
}

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: "basic",
    name: "Básico",
    slug: "basico",
    priceId: "price_1SrgVOQfn2GowbtEqr6diitU",
    productId: "prod_TpLBnjdZLViNZe",
    price: 29.99,
    description: "Ideal para profissionais iniciantes",
    features: [
      { text: "Até 10 agendamentos/mês", included: true },
      { text: "Perfil básico na plataforma", included: true },
      { text: "Suporte por email", included: true },
      { text: "Selo de verificação", included: false },
      { text: "Tabela de preços", included: false },
      { text: "Portfólio de trabalhos", included: false },
    ],
    monthlyAppointmentsLimit: 10,
    hasVerifiedBadge: false,
    hasPriceTable: false,
    hasPortfolio: false,
    portfolioLimit: 0,
  },
  {
    id: "intermediate",
    name: "Intermediário",
    slug: "intermediario",
    priceId: "price_1SrgVrQfn2GowbtE04SCwl1n",
    productId: "prod_TpLCjtWx3U8NIq",
    price: 39.99,
    description: "Para profissionais em crescimento",
    features: [
      { text: "Até 30 agendamentos/mês", included: true },
      { text: "Perfil destacado na plataforma", included: true },
      { text: "Suporte prioritário", included: true },
      { text: "Selo de verificação", included: true },
      { text: "Tabela de preços", included: false },
      { text: "Portfólio de trabalhos", included: false },
    ],
    monthlyAppointmentsLimit: 30,
    hasVerifiedBadge: true,
    hasPriceTable: false,
    hasPortfolio: false,
    portfolioLimit: 0,
    popular: true,
  },
  {
    id: "complete",
    name: "Completo",
    slug: "completo",
    priceId: "price_1SrgW9Qfn2GowbtEhUevJDA0",
    productId: "prod_TpLCwKtKHrasIG",
    price: 49.99,
    description: "Recursos completos para alta demanda",
    features: [
      { text: "Até 80 agendamentos/mês", included: true },
      { text: "Perfil em destaque na busca", included: true },
      { text: "Suporte VIP", included: true },
      { text: "Selo de verificação", included: true },
      { text: "Tabela de preços personalizada", included: true },
      { text: "Portfólio com até 10 fotos", included: true },
    ],
    monthlyAppointmentsLimit: 80,
    hasVerifiedBadge: true,
    hasPriceTable: true,
    hasPortfolio: true,
    portfolioLimit: 10,
  },
  {
    id: "enterprise",
    name: "Empresas",
    slug: "empresas",
    priceId: "price_1SrgWLQfn2GowbtEQ8MMT9Cw",
    productId: "prod_TpLCwkmt7HfeJW",
    price: 59.99,
    description: "Solução completa para clínicas e empresas",
    features: [
      { text: "Agendamentos ilimitados", included: true },
      { text: "Múltiplos profissionais", included: true },
      { text: "Suporte dedicado", included: true },
      { text: "Selo de verificação premium", included: true },
      { text: "Tabela de preços avançada", included: true },
      { text: "Portfólio ilimitado", included: true },
    ],
    monthlyAppointmentsLimit: null,
    hasVerifiedBadge: true,
    hasPriceTable: true,
    hasPortfolio: true,
    portfolioLimit: -1, // unlimited
  },
];

export const getPlanByProductId = (productId: string): SubscriptionPlan | undefined => {
  return SUBSCRIPTION_PLANS.find(plan => plan.productId === productId);
};

export const getPlanByPriceId = (priceId: string): SubscriptionPlan | undefined => {
  return SUBSCRIPTION_PLANS.find(plan => plan.priceId === priceId);
};

export const getPlanBySlug = (slug: string): SubscriptionPlan | undefined => {
  return SUBSCRIPTION_PLANS.find(plan => plan.slug === slug);
};
