import { userRouter } from '@/modules/home/Profile/server/users';
import { createTRPCRouter } from '../init';


export const appRouter = createTRPCRouter({
 
 users: userRouter
});
// export type definition of API
export type AppRouter = typeof appRouter; 