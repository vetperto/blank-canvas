import { AdminLayout } from "@/components/admin/AdminLayout";
import { VerificationManagement } from "@/components/admin/VerificationManagement";

export default function AdminVerification() {
  return (
    <AdminLayout
      title="Verificação de Perfis"
      description="Gerenciar verificação de profissionais e empresas"
    >
      <VerificationManagement />
    </AdminLayout>
  );
}
