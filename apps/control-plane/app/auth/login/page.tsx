"use client";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const router = useRouter();

    const signIn = async () => {
        const { data, error } = await authClient.signIn.email({
            email,
            password,
            callbackURL: "/app/dashboard",
        });
        if (error) {
            setError(error.message || "Failed to login");
        } else {
            router.push("/app/dashboard");
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50">
            <div className="w-full max-w-md p-8 space-y-6 bg-white rounded shadow-md">
                <h1 className="text-2xl font-bold text-center">Vantus Proxy</h1>
                {error && <div className="text-red-500 text-sm text-center">{error}</div>}
                <div className="space-y-4">
                    <input
                        className="w-full p-2 border rounded"
                        placeholder="Email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                    />
                    <input
                        className="w-full p-2 border rounded"
                        placeholder="Password"
                        type="password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                    />
                    <button
                        className="w-full p-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                        onClick={signIn}
                    >
                        Sign In
                    </button>
                </div>
            </div>
        </div>
    );
}
