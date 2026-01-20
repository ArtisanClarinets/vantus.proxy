import React from 'react';

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-gray-50 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-sky-100 via-gray-100 to-gray-50">
            <div className="w-full max-w-md px-4">
                <div className="bg-white/80 backdrop-blur-xl border border-white/20 shadow-2xl rounded-2xl overflow-hidden p-8">
                    <div className="mb-8 text-center">
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                            Vantus Proxy
                        </h1>
                        <p className="text-gray-500 mt-2 text-sm">
                            Enterprise Configuration Management
                        </p>
                    </div>
                    {children}
                </div>
                <div className="mt-6 text-center text-xs text-gray-400">
                    &copy; {new Date().getFullYear()} Vantus Systems. All rights reserved.
                </div>
            </div>
        </div>
    );
}
