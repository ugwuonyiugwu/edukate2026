import DiscoveryPage from '@/modules/home/Libraries/library'
import { HydrateClient } from '@/trpc/server'

const page = () => {
  return (
    <HydrateClient>
      <DiscoveryPage/>
    </HydrateClient>
  )
}

export default page
