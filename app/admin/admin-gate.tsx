"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAdminAuth } from "./admin-auth";

export default function AdminGate({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAdmin, isLoading } = useAdminAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    if (!isAdmin && pathname !== "/admin/login") {
      router.replace("/admin/login");
      return;
    }

    if (isAdmin && pathname === "/admin/login") {
      router.replace("/admin");
    }
  }, [isAdmin, isLoading, pathname, router]);

  if (isLoading) {
    return null;
  }

  if (!isAdmin && pathname !== "/admin/login") {
    return null;
  }

  return <>{children}</>;
}
