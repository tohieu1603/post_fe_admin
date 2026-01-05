import { Providers } from "@/components/providers";
import { AuthProvider } from "@/lib/auth";
import { AuthGuard } from "@/components/auth-guard";
import AdminLayout from "@/components/admin-layout";

export default function AdminGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Providers>
      <AuthProvider>
        <AuthGuard>
          <AdminLayout>{children}</AdminLayout>
        </AuthGuard>
      </AuthProvider>
    </Providers>
  );
}
