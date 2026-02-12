import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  UserCog,
  Building2,
  Star,
  FileCheck,
  Shield,
  TrendingUp,
  Calendar,
  Clock,
  AlertCircle,
} from "lucide-react";
import { motion } from "framer-motion";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAdmin } from "@/hooks/useAdmin";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { stats, fetchStats } = useAdmin();

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const quickStats = [
    {
      label: "Total de Tutores",
      value: stats.totalUsers,
      icon: Users,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
      href: "/admin/tutores",
    },
    {
      label: "Profissionais",
      value: stats.totalProfessionals,
      icon: UserCog,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
      href: "/admin/profissionais",
    },
    {
      label: "Verificados",
      value: stats.verifiedProfessionals,
      icon: Shield,
      color: "text-primary",
      bgColor: "bg-primary/10",
      href: "/admin/verificacao",
    },
    {
      label: "Total de Avaliações",
      value: stats.totalReviews,
      icon: Star,
      color: "text-yellow-500",
      bgColor: "bg-yellow-500/10",
      href: "/admin/avaliacoes",
    },
  ];

  const pendingItems = [
    {
      label: "Avaliações Pendentes",
      count: stats.pendingReviews,
      icon: Clock,
      href: "/admin/avaliacoes",
      color: "text-orange-500",
    },
    {
      label: "Documentos Pendentes",
      count: stats.pendingDocuments,
      icon: FileCheck,
      href: "/admin/documentos",
      color: "text-purple-500",
    },
  ];

  return (
    <AdminLayout
      title="Dashboard"
      description="Visão geral da plataforma VetPerto"
    >
      <div className="space-y-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {quickStats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card
                className="cursor-pointer hover:border-primary transition-colors"
                onClick={() => navigate(stat.href)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                      <stat.icon className={`w-5 h-5 ${stat.color}`} />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">
                        {stat.value.toLocaleString("pt-BR")}
                      </p>
                      <p className="text-xs text-muted-foreground">{stat.label}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Pending Actions */}
        <div className="grid md:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-lg font-semibold">
                  Itens Pendentes
                </CardTitle>
                <AlertCircle className="w-5 h-5 text-orange-500" />
              </CardHeader>
              <CardContent className="space-y-4">
                {pendingItems.map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted cursor-pointer transition-colors"
                    onClick={() => navigate(item.href)}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className={`w-5 h-5 ${item.color}`} />
                      <span className="font-medium">{item.label}</span>
                    </div>
                    <Badge
                      variant={item.count > 0 ? "destructive" : "secondary"}
                      className="h-6 px-2"
                    >
                      {item.count}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-lg font-semibold">
                  Ações Rápidas
                </CardTitle>
                <TrendingUp className="w-5 h-5 text-primary" />
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => navigate("/admin/verificacao")}
                >
                  <Shield className="w-4 h-4 mr-2" />
                  Verificar Profissionais
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => navigate("/admin/avaliacoes")}
                >
                  <Star className="w-4 h-4 mr-2" />
                  Moderar Avaliações
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => navigate("/admin/documentos")}
                >
                  <FileCheck className="w-4 h-4 mr-2" />
                  Verificar Documentos
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => navigate("/admin/logs")}
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  Ver Logs de Ações
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Summary Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Taxa de Verificação
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-primary">
                  {stats.totalProfessionals > 0
                    ? Math.round(
                        (stats.verifiedProfessionals / stats.totalProfessionals) * 100
                      )
                    : 0}
                  %
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {stats.verifiedProfessionals} de {stats.totalProfessionals} profissionais
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Média de Avaliações
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-yellow-500">
                  {stats.totalProfessionals > 0
                    ? (stats.totalReviews / stats.totalProfessionals).toFixed(1)
                    : 0}
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  por profissional
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Relação Tutor/Profissional
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-500">
                  {stats.totalProfessionals > 0
                    ? (stats.totalUsers / stats.totalProfessionals).toFixed(1)
                    : 0}
                  :1
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  tutores por profissional
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </AdminLayout>
  );
}
