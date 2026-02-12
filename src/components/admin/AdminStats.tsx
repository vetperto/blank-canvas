import { Users, UserCheck, Star, FileCheck, Clock, Shield } from "lucide-react";
import { motion } from "framer-motion";

interface AdminStatsProps {
  stats: {
    totalUsers: number;
    totalProfessionals: number;
    totalReviews: number;
    pendingReviews: number;
    pendingDocuments: number;
    verifiedProfessionals: number;
  };
}

export function AdminStats({ stats }: AdminStatsProps) {
  const statCards = [
    {
      label: "Total de Tutores",
      value: stats.totalUsers,
      icon: Users,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      label: "Profissionais",
      value: stats.totalProfessionals,
      icon: UserCheck,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
    },
    {
      label: "Verificados",
      value: stats.verifiedProfessionals,
      icon: Shield,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      label: "Total de Avaliações",
      value: stats.totalReviews,
      icon: Star,
      color: "text-yellow-500",
      bgColor: "bg-yellow-500/10",
    },
    {
      label: "Avaliações Pendentes",
      value: stats.pendingReviews,
      icon: Clock,
      color: "text-orange-500",
      bgColor: "bg-orange-500/10",
    },
    {
      label: "Documentos Pendentes",
      value: stats.pendingDocuments,
      icon: FileCheck,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {statCards.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="bg-card rounded-xl border border-border p-4"
        >
          <div className={`w-10 h-10 rounded-lg ${stat.bgColor} flex items-center justify-center mb-3`}>
            <stat.icon className={`w-5 h-5 ${stat.color}`} />
          </div>
          <p className="text-2xl font-bold">{stat.value.toLocaleString("pt-BR")}</p>
          <p className="text-sm text-muted-foreground">{stat.label}</p>
        </motion.div>
      ))}
    </div>
  );
}
