// schema.ts
import { pgTable, text, timestamp, uuid, integer, uniqueIndex } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  clerkId: text("clerk_id").unique().notNull(),
  email: text("email").notNull(),
  username: text("username"),
  imageUrl: text("image_url"),
  // New fields requested
  phoneNumber: text("phone_number"),
  state: text("state"),
  gender: text("gender"),
  points: integer("points").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (t) => [uniqueIndex("clerk_id_idx").on(t.clerkId)]);