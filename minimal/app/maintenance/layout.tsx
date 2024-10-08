"use client";

// components
import CompactLayout from "minimal/layouts/compact";

// ----------------------------------------------------------------------

type Props = {
  children: React.ReactNode;
};

export default function Layout({ children }: Props) {
  return <CompactLayout>{children}</CompactLayout>;
}
