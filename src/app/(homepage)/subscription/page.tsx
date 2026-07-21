// app/subscription/page.tsx
import React, { Suspense } from 'react';
import { SubscriptionCheckoutCard } from '@/modules/home/Subscription/Subscription';
import { HydrateClient } from '@/trpc/server';
import { LoadingSpinner } from '@/modules/home/ui/components/Logospinal';

export default function SubscriptionPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] p-6 md:p-12 font-sans">
      <div className="max-w-3xl mx-auto space-y-8">
        <div>
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">Flexible Subscription</h1>
          <p className="text-slate-500 text-sm mt-1">Select an amount between ₦1,000 and ₦5,000 to top up your points.</p>
        </div>
         <HydrateClient>
              <Suspense fallback={<LoadingSpinner />}>
                <SubscriptionCheckoutCard />
              </Suspense>
            </HydrateClient>
        
      </div>
    </div>
  );
}