// @/db/schema.ts
import { pgTable, text, timestamp, uuid, integer, uniqueIndex, date } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  clerkId: text("clerk_id").unique().notNull(),
  email: text("email").notNull(),
  username: text("username"),
  imageUrl: text("image_url"),
  firstName: text("first_name"), 
  lastName: text("last_name"),
  phoneNumber: text("phone_number"),
  school: text("school"),
  gender: text("gender"),
  dateOfBirth: date("date_of_birth"), 
  state: text("state"),
  quizProgress: integer("quiz_progress").default(0).notNull(),
  courseProgress: integer("course_progress").default(0).notNull(),
  currentStreak: integer("current_streak").default(0).notNull(),
  longestStreak: integer("longest_streak").default(0).notNull(),
  points: integer("points").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (t) => [uniqueIndex("clerk_id_idx").on(t.clerkId)]);