"use client";
import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import Link from "next/link";
import { Loader2, CheckCircle2, ArrowLeft } from "lucide-react";

function ResetPasswordContent() {
    const searchParams = useSearchParams();
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
    const [error, setError] = useState("");

    const handleReset = async (e: React.FormEvent) => {
        e.preventDefault();
        const token = searchParams.get("token");
        if (!token) {
            setError("Missing token. Please follow the link in your email.");
            return;
        }

        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        if (password.length < 8) {
            setError("Password must be at least 8 characters");
            return;
        }

        setStatus("loading");
        setError("");

        const { error } = await authClient.resetPassword({
            newPassword: password,
            token: token
        });

        if (error) {
            setStatus("error");
            setError(error.message || "Failed to reset password");
        } else {
            setStatus("success");
        }
    };

    if (status === "success") {
        return (
             <div className="text-center space-y-6">
                <div className="flex justify-center">
                    <div className="rounded-full bg-green-100 p-3">
                        <CheckCircle2 className="w-8 h-8 text-green-600" />
                    </div>
                </div>
                <div className="space-y-2">
                    <h1 className="text-2xl font-bold text-gray-900">Password Reset Successful</h1>
                    <p className="text-gray-600 max-w-sm mx-auto">
                        Your password has been updated. You can now log in with your new password.
                    </p>
                </div>
                <div className="pt-4">
                    <Link href="/auth/login" className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Go to Login
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="space-y-2 text-center">
                <h1 className="text-xl font-semibold tracking-tight text-gray-900">New Password</h1>
                <p className="text-sm text-gray-500">
                    Enter your new password below.
                </p>
            </div>

            {error && (
                <div className="p-3 text-sm text-red-500 bg-red-50 border border-red-100 rounded-lg animate-in fade-in slide-in-from-top-2">
                    {error}
                </div>
            )}

            <form onSubmit={handleReset} className="space-y-4">
                <div className="space-y-2">
                    <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-gray-700" htmlFor="password">
                        New Password
                    </label>
                    <input
                        id="password"
                        className="flex h-10 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200 ease-in-out"
                        placeholder="New Password"
                        type="password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        required
                        minLength={8}
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-gray-700" htmlFor="confirmPassword">
                        Confirm New Password
                    </label>
                    <input
                        id="confirmPassword"
                        className="flex h-10 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200 ease-in-out"
                        placeholder="Confirm New Password"
                        type="password"
                        value={confirmPassword}
                        onChange={e => setConfirmPassword(e.target.value)}
                        required
                        minLength={8}
                    />
                </div>
                <button
                    className="inline-flex items-center justify-center w-full h-10 px-4 py-2 text-sm font-medium text-white transition-all duration-200 bg-blue-600 rounded-md hover:bg-blue-700 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
                    type="submit"
                    disabled={status === "loading"}
                >
                    {status === "loading" ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                    Update Password
                </button>
            </form>
        </div>
    );
}

export default function ResetPasswordPage() {
    return (
        <Suspense fallback={<div className="flex justify-center p-8"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>}>
            <ResetPasswordContent />
        </Suspense>
    );
}
