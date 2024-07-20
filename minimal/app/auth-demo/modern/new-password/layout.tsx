"use client";

// components
import AuthModernCompactLayout from "minimal/layouts/auth/modern-compact";

// ----------------------------------------------------------------------

type Props = {
  children: React.ReactNode;
};

export default function Layout({ children }: Props) {
  return <AuthModernCompactLayout>{children}</AuthModernCompactLayout>;
}
