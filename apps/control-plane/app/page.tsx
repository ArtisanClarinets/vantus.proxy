import { redirect } from "next/navigation";
import { headers } from "next/headers";

export default async function RootPage() {
    // Check if logged in (simplified check via cookie presence for root redirect)
    // In App Router with Better Auth, we can use client or checking headers.
    // For server-side redirect, we rely on session cookie.
    const headersList = await headers();
    // This is a naive check; real session validation happens in middleware or auth lib.
    // But for root redirect, it's often sufficient to check if cookie exists.
    const cookie = headersList.get("cookie") || "";

    // Better Auth session cookie name might vary, usually `better-auth.session_token`
    if (cookie.includes("better-auth.session_token")) {
        redirect("/app/dashboard");
    } else {
        redirect("/auth/login");
    }
}
