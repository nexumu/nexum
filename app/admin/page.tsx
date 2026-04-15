"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { navItems } from "@/components/site/admin-sidebar";

export default function AdminPage() {
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        const validPaths = navItems.map((item) => item.href);
        if (pathname === "/admin" || !validPaths.includes(pathname)) {
            router.push("/admin/productos");
        }
    }, [pathname, router]);

    return null;
}
