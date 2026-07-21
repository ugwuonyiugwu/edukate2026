import { LoadingSpinner } from '@/modules/home/ui/components/Logospinal';
import { trpc, HydrateClient } from '@/trpc/server';
import { Suspense } from 'react';
import { ReferralClientView } from '@/modules/home/Referals/Referal'

export const dynamic = 'force-dynamic';

export default async function ReferralPage() {
  void trpc.referral.getStats.prefetch();

  return (
    <HydrateClient>
      <Suspense fallback={<LoadingSpinner />}>
        <ReferralClientView />
      </Suspense>
    </HydrateClient>
  );
}