import { NextResponse } from 'next/server';
// import { stripe } from '@/lib/billing';

export async function POST(req: Request) {
    const body = await req.text();
    // const sig = req.headers.get('stripe-signature');

    // In a real app, verify signature:
    // const event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET);

    console.log("[Billing Webhook] Received event", body.substring(0, 50));

    // Handle invoice.paid, customer.subscription.updated, etc.

    return NextResponse.json({ received: true });
}
