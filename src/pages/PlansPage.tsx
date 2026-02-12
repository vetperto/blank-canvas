import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { PlanCard } from "@/components/plans/PlanCard";
import { SUBSCRIPTION_PLANS } from "@/lib/stripe-plans";
import { useSubscription } from "@/hooks/useSubscription";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, CreditCard, RefreshCw, Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const PlansPage = () => {
  const { user, profile } = useAuth();
  const { subscriptionStatus, isLoading, createCheckout, openCustomerPortal, checkSubscription } = useSubscription();
  const navigate = useNavigate();

  const handleSelectPlan = async (priceId: string) => {
    if (!user) {
      navigate("/login?redirect=/planos");
      return;
    }

    if (profile?.user_type === "tutor") {
      return;
    }

    await createCheckout(priceId);
  };

  const getPlanType = (planId: string): "basic" | "intermediate" | "complete" | "enterprise" => {
    switch (planId) {
      case "basic":
        return "basic";
      case "intermediate":
        return "intermediate";
      case "complete":
        return "complete";
      case "enterprise":
        return "enterprise";
      default:
        return "basic";
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-16 bg-gradient-to-br from-primary/10 via-background to-secondary/10">
          <div className="container mx-auto px-4 text-center">
            <Badge variant="outline" className="mb-4">
              Planos e Preços
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Escolha o plano ideal para você
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Expanda sua presença online e conquiste mais clientes com os planos VetPerto
            </p>
          </div>
        </section>

        {/* Current Subscription Status */}
        {user && subscriptionStatus.subscribed && (
          <section className="py-8 bg-muted/30">
            <div className="container mx-auto px-4">
              <Card className="border-primary/50">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Check className="h-5 w-5 text-primary" />
                        Sua Assinatura Atual
                      </CardTitle>
                      <CardDescription>
                        Plano {subscriptionStatus.plan?.name}
                      </CardDescription>
                    </div>
                    <Badge variant="default" className="text-lg px-4 py-1">
                      R$ {subscriptionStatus.plan?.price.toFixed(2)}/mês
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap items-center gap-4">
                    <p className="text-sm text-muted-foreground">
                      Válido até:{" "}
                      <strong>
                        {subscriptionStatus.subscriptionEnd
                          ? format(new Date(subscriptionStatus.subscriptionEnd), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
                          : "N/A"}
                      </strong>
                    </p>
                    <div className="flex gap-2 ml-auto">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={checkSubscription}
                        disabled={isLoading}
                      >
                        <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                        Atualizar Status
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={openCustomerPortal}
                        disabled={isLoading}
                      >
                        <Settings className="h-4 w-4 mr-2" />
                        Gerenciar Assinatura
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>
        )}

        {/* Plans Grid */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {SUBSCRIPTION_PLANS.map((plan) => {
                const isCurrentPlan = subscriptionStatus.productId === plan.productId;
                
                return (
                  <div key={plan.id} className="relative">
                    {isCurrentPlan && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                        <Badge className="bg-primary text-primary-foreground">
                          Seu Plano
                        </Badge>
                      </div>
                    )}
                    <PlanCard
                      name={plan.name}
                      price={`R$ ${plan.price.toFixed(2)}`}
                      period="/mês"
                      description={plan.description}
                      features={plan.features}
                      popular={plan.popular}
                      planType={getPlanType(plan.id)}
                      onSelect={() => handleSelectPlan(plan.priceId)}
                      disabled={isLoading || isCurrentPlan || profile?.user_type === "tutor"}
                      buttonText={
                        isCurrentPlan 
                          ? "Plano Atual" 
                          : profile?.user_type === "tutor"
                          ? "Apenas para Profissionais"
                          : "Assinar Agora"
                      }
                    />
                  </div>
                );
              })}
            </div>

            {/* Info for Tutors */}
            {profile?.user_type === "tutor" && (
              <div className="mt-8 text-center">
                <Card className="max-w-lg mx-auto">
                  <CardContent className="pt-6">
                    <p className="text-muted-foreground">
                      Os planos de assinatura são exclusivos para profissionais e empresas. 
                      Como tutor, você pode usar a plataforma gratuitamente para encontrar e agendar serviços.
                    </p>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* CTA for Non-logged Users */}
            {!user && (
              <div className="mt-12 text-center">
                <Card className="max-w-lg mx-auto">
                  <CardContent className="pt-6">
                    <CreditCard className="h-12 w-12 text-primary mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">
                      Comece agora mesmo
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      Cadastre-se como profissional para acessar os planos e expandir sua clientela
                    </p>
                    <div className="flex gap-4 justify-center">
                      <Button onClick={() => navigate("/login")}>
                        Entrar
                      </Button>
                      <Button variant="outline" onClick={() => navigate("/cadastro")}>
                        Criar Conta
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">
              Perguntas Frequentes
            </h2>
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Posso cancelar a qualquer momento?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Sim! Você pode cancelar sua assinatura a qualquer momento. 
                    Seu acesso continua até o final do período já pago.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Como funciona a cobrança?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    A cobrança é mensal e automática via cartão de crédito. 
                    Você pode gerenciar seu método de pagamento a qualquer momento.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Posso mudar de plano?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Sim! Você pode fazer upgrade ou downgrade do seu plano quando quiser. 
                    O valor será ajustado proporcionalmente.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">O que acontece se eu atingir o limite?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Quando atingir o limite de agendamentos, você será notificado e poderá 
                    fazer upgrade para continuar recebendo novos clientes.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default PlansPage;
