"use client";

// auth
import { AuthGuard } from "minimal/auth/guard";
// components
import DashboardLayout from "minimal/layouts/dashboard";

// ----------------------------------------------------------------------

type Props = {
  children: React.ReactNode;
};

export default function Layout({ children }: Props) {
  return (
    <AuthGuard>
      <DashboardLayout>{children}</DashboardLayout>
    </AuthGuard>
  );
}
