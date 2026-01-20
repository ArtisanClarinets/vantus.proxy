"use client";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import Link from "next/link";
import { Loader2, CheckCircle2, XCircle, ArrowLeft } from "lucide-react";

function VerifyEmailContent() {
    const searchParams = useSearchParams();
    const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
    const [error, setError] = useState("");

    useEffect(() => {
        const token = searchParams.get("token");
        if (!token) {
            setStatus("error");
            setError("No verification token found.");
            return;
        }

        authClient.verifyEmail({ 
            query: {
                token: token 
            }
        })
            .then(({ error }) => {
                if (error) {
                    setStatus("error");
                    setError(error.message || "Failed to verify email");
                } else {
                    setStatus("success");
                }
            })
            .catch(() => {
                setStatus("error");
                setError("An unexpected error occurred.");
            });
    }, [searchParams]);

    if (status === "loading") {
        return (
            <div className="flex flex-col items-center justify-center space-y-4 py-8">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                <p className="text-gray-500">Verifying your email...</p>
            </div>
        );
    }

    if (status === "error") {
        return (
            <div className="text-center space-y-6">
                 <div className="flex justify-center">
                    <div className="rounded-full bg-red-100 p-3">
                        <XCircle className="w-8 h-8 text-red-600" />
                    </div>
                </div>
                <div className="space-y-2">
                    <h1 className="text-2xl font-bold text-gray-900">Verification Failed</h1>
                    <p className="text-gray-500 max-w-sm mx-auto">{error}</p>
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
         <div className="text-center space-y-6">
            <div className="flex justify-center">
                <div className="rounded-full bg-green-100 p-3">
                    <CheckCircle2 className="w-8 h-8 text-green-600" />
                </div>
            </div>
            <div className="space-y-2">
                <h1 className="text-2xl font-bold text-gray-900">Email Verified!</h1>
                <p className="text-gray-600 max-w-sm mx-auto">
                    Your email has been successfully verified. You can now log in to your account.
                </p>
            </div>
            <div className="pt-4">
                <Link 
                    href="/auth/login" 
                    className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white transition-all duration-200 bg-blue-600 rounded-md hover:bg-blue-700 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
                >
                    Go to Login
                </Link>
            </div>
        </div>
    );
}

export default function VerifyEmailPage() {
    return (
        <Suspense fallback={<div className="flex justify-center p-8"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>}>
            <VerifyEmailContent />
        </Suspense>
    );
}
