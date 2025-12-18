import { Providers } from "@/components/providers";
import { AuthGuard } from "@/components/auth-guard";
import AdminLayout from "@/components/admin-layout";

export default function AdminGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Providers>
      <AuthGuard>
        <AdminLayout>{children}</AdminLayout>
      </AuthGuard>
    </Providers>
  );
}
