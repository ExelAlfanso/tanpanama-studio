import { projectImageKeys } from "@tanpanama/contracts";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const projects = sqliteTable("projects", {
  category: text("category").notNull(),
  description: text("description").notNull(),
  featured: integer("featured", { mode: "boolean" }).notNull().default(false),
  id: text("id").primaryKey(),
  image: text("image", { enum: projectImageKeys }).notNull(),
  imageUrl: text("image_url"),
  published: integer("published", { mode: "boolean" }).notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  summary: text("summary").notNull(),
  title: text("title").notNull(),
  year: text("year").notNull(),
});
