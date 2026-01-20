"use client";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import Link from "next/link";
import { Loader2, CheckCircle2 } from "lucide-react";

export default function RegisterPage() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const signUp = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");
        
        const { error } = await authClient.signUp.email({
            email,
            password,
            name,
            callbackURL: "/app/dashboard",
        });
        
        if (error) {
            setError(error.message || "Failed to register");
            setIsLoading(false);
        } else {
            setSuccess(true);
            setIsLoading(false);
        }
    };

    if (success) {
        return (
            <div className="text-center space-y-6">
                <div className="flex justify-center">
                    <div className="rounded-full bg-green-100 p-3">
                        <CheckCircle2 className="w-8 h-8 text-green-600" />
                    </div>
                </div>
                <div className="space-y-2">
                    <h1 className="text-2xl font-bold text-gray-900">Check your email</h1>
                    <p className="text-gray-500 max-w-sm mx-auto">
                        We sent a verification link to <span className="font-medium text-gray-900">{email}</span>. Please verify your email to continue.
                    </p>
                </div>
                <div className="pt-4">
                    <Link 
                        href="/auth/login" 
                        className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 transition-colors"
                    >
                        Back to Login
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="space-y-2 text-center">
                <h2 className="text-xl font-semibold tracking-tight text-gray-900">Create an account</h2>
                <p className="text-sm text-gray-500">Enter your details to get started</p>
            </div>
            
            {error && (
                <div className="p-3 text-sm text-red-500 bg-red-50 border border-red-100 rounded-lg animate-in fade-in slide-in-from-top-2">
                    {error}
                </div>
            )}

            <form onSubmit={signUp} className="space-y-4">
                <div className="space-y-2">
                    <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-gray-700" htmlFor="name">
                        Full Name
                    </label>
                    <input
                        id="name"
                        className="flex h-10 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200 ease-in-out"
                        placeholder="John Doe"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        required
                        autoComplete="name"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-gray-700" htmlFor="email">
                        Email
                    </label>
                    <input
                        id="email"
                        className="flex h-10 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200 ease-in-out"
                        placeholder="name@example.com"
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        required
                        autoComplete="email"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-gray-700" htmlFor="password">
                        Password
                    </label>
                    <input
                        id="password"
                        className="flex h-10 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200 ease-in-out"
                        placeholder="••••••••"
                        type="password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        required
                        minLength={8}
                        autoComplete="new-password"
                    />
                </div>
                <button
                    className="inline-flex items-center justify-center w-full h-10 px-4 py-2 text-sm font-medium text-white transition-all duration-200 bg-blue-600 rounded-md hover:bg-blue-700 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
                    type="submit"
                    disabled={isLoading}
                >
                    {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                    Create Account
                </button>
            </form>

            <div className="text-center text-sm">
                <span className="text-gray-500">Already have an account? </span>
                <Link href="/auth/login" className="font-medium text-blue-600 hover:text-blue-700 hover:underline">
                    Login
                </Link>
            </div>
        </div>
    );
}
