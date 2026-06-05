import { userRouter } from '@/modules/home/Profile/server/users';
import { createTRPCRouter } from '../init';
import { documentRouter } from '@/modules/Library/server/procedure';
import { quizRouter } from '@/modules/home/QuizGrid/server/procedure';
import { classRouter } from '@/modules/home/Classes/server/procedure';
import { curriculumRouter } from '@/modules/Admin/Class/server/procedure';
import { scholarshipRouter } from '@/modules/Admin/Scholarship/server/procedure';
import { teacherRouter } from '@/modules/Admin/Teachers/server/procedure';
import { adminQuizRouter } from '@/modules/Admin/AdminQuizathon/server/procedure';
import { userQuizRouter } from '@/modules/home/Quizathon/server/procedure';
import { upgradeRouter } from '@/modules/Admin/UsersManagement/UpgradeUser/server/procedure';
import { notificationRouter } from '@/modules/home/Notification/server/procedure';

export const appRouter = createTRPCRouter({
 
 users: userRouter,
 documents: documentRouter,
 quiz: quizRouter,
 classes: classRouter,
 questions: curriculumRouter,
 scholarship: scholarshipRouter,
 teacher: teacherRouter,
 adminquizathon: adminQuizRouter,
 userquizathon: userQuizRouter,
 userupgrade: upgradeRouter,
 notifications: notificationRouter,
});

export type AppRouter = typeof appRouter; 