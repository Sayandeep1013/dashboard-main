"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

const PUBLIC_PATHS = ["/login"];

export default function AuthGuard({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const [isAuthorized, setIsAuthorized] = useState(false);

    useEffect(() => {
        // Check initial auth state
        const checkAuth = () => {
            const isLoggedIn = sessionStorage.getItem("isLoggedIn") === "true";
            const isPublicPath = PUBLIC_PATHS.includes(pathname);

            if (!isLoggedIn && !isPublicPath) {
                // Not logged in and trying to access a protected route -> Redirect to login
                setIsAuthorized(false);
                router.push("/login");
            } else if (isLoggedIn && isPublicPath) {
                // Logged in but trying to access login page -> Redirect to home
                setIsAuthorized(true); // Technically authorized, but redirecting
                router.push("/");
            } else {
                // Authorized (Logged in accessing protected OR Guest accessing public)
                setIsAuthorized(true);
            }
        };

        checkAuth();
    }, [pathname, router]);

    // Show nothing (or a subtle loader) while we verify auth to prevent content flash
    if (!isAuthorized) {
        return null;
    }

    return <>{children}</>;
}
