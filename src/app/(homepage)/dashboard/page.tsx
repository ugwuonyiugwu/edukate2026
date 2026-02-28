import { DashboardView } from '@/modules/home/Dashboard'
import { HydrateClient } from '@/trpc/server'

const page = () => {
  return (
    <HydrateClient>
      <DashboardView/>
    </HydrateClient>
  )
}

export default page
