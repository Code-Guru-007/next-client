"use client";

// auth
import { GuestGuard } from "minimal/auth/guard";
// components
import AuthClassicLayout from "minimal/layouts/auth/classic";

// ----------------------------------------------------------------------

type Props = {
  children: React.ReactNode;
};

export default function Layout({ children }: Props) {
  return (
    <GuestGuard>
      <AuthClassicLayout title="Manage the job more effectively with Minimal">
        {children}
      </AuthClassicLayout>
    </GuestGuard>
  );
}
