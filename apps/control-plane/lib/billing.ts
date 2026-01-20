// Mock Billing Library (Stripe Abstraction)
// In a real app, install 'stripe' package: npm install stripe

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || 'sk_test_mock';

// Mock implementation
export const billing = {
    customers: {
        create: async (params: { email: string; name: string; metadata: any }) => {
            console.log("[Billing] Creating customer", params);
            return { id: `cus_${Math.random().toString(36).substr(2, 9)}` };
        }
    },
    billingPortal: {
        sessions: {
            create: async (params: { customer: string; return_url: string }) => {
                console.log("[Billing] Creating portal session", params);
                return { url: 'https://billing.stripe.com/p/session/test_123' };
            }
        }
    },
    checkout: {
        sessions: {
            create: async (params: any) => {
                return { url: 'https://checkout.stripe.com/c/pay/test_123' };
            }
        }
    }
};
