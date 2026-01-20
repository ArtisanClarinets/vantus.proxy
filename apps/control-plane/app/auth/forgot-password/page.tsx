"use client";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import Link from "next/link";
import { Loader2, ArrowLeft, Mail } from "lucide-react";

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
    const [error, setError] = useState("");

    const handleResetRequest = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus("loading");
        setError("");
        
        // @ts-ignore
        const { error } = await authClient.forgetPassword({
            email,
            redirectTo: "/auth/reset-password",
        });

        if (error) {
            setStatus("error");
            setError(error.message || "Failed to send reset email");
        } else {
            setStatus("success");
        }
    };

    if (status === "success") {
        return (
            <div className="text-center space-y-6">
                 <div className="flex justify-center">
                    <div className="rounded-full bg-blue-100 p-3">
                        <Mail className="w-8 h-8 text-blue-600" />
                    </div>
                </div>
                <div className="space-y-2">
                    <h1 className="text-2xl font-bold text-gray-900">Check your email</h1>
                    <p className="text-gray-500 max-w-sm mx-auto">
                        If an account exists for <span className="font-medium text-gray-900">{email}</span>, we sent a password reset link.
                    </p>
                </div>
                <div className="pt-4">
                    <Link href="/auth/login" className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Login
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="space-y-2 text-center">
                <h1 className="text-xl font-semibold tracking-tight text-gray-900">Reset Password</h1>
                <p className="text-sm text-gray-500">
                    Enter your email address and we'll send you a link to reset your password.
                </p>
            </div>
            
            {error && (
                <div className="p-3 text-sm text-red-500 bg-red-50 border border-red-100 rounded-lg animate-in fade-in slide-in-from-top-2">
                    {error}
                </div>
            )}

            <form onSubmit={handleResetRequest} className="space-y-4">
                <div className="space-y-2">
                     <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-gray-700" htmlFor="email">
                        Email
                    </label>
                    <input
                        id="email"
                        className="flex h-10 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200 ease-in-out"
                        placeholder="name@example.com"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        required
                    />
                </div>
                <button
                    className="inline-flex items-center justify-center w-full h-10 px-4 py-2 text-sm font-medium text-white transition-all duration-200 bg-blue-600 rounded-md hover:bg-blue-700 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
                    type="submit"
                    disabled={status === "loading"}
                >
                    {status === "loading" ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                    Send Reset Link
                </button>
            </form>
             <div className="text-center text-sm">
                <Link href="/auth/login" className="inline-flex items-center text-blue-600 hover:text-blue-700 hover:underline transition-colors">
                     <ArrowLeft className="w-3 h-3 mr-1" />
                    Back to Login
                </Link>
            </div>
        </div>
    );
}
