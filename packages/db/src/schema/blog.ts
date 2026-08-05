import {
  boolean,
  index,
  integer,
  jsonb,
  pgTable,
  primaryKey,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { user } from "./auth";

export type TiptapDoc = {
  type: string;
  attrs?: Record<string, unknown> | undefined;
  text?: string | undefined;
  marks?: Record<string, unknown>[] | undefined;
  content?: TiptapDoc[] | undefined;
};

export const category = pgTable("category", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  color: text("color").notNull().default("slate"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const tag = pgTable("tag", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const post = pgTable("post", {
  id: text("id").primaryKey(),
  authorId: text("author_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  categoryId: text("category_id").references(() => category.id, { onDelete: "set null" }),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  excerptText: text("excerpt_text").notNull(),
  contentJson: jsonb("content_json").$type<TiptapDoc>().notNull(),
  published: boolean("published").notNull().default(false),
  viewCount: integer("view_count").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const postTag = pgTable(
  "post_tag",
  {
    postId: text("post_id")
      .notNull()
      .references(() => post.id, { onDelete: "cascade" }),
    tagId: text("tag_id")
      .notNull()
      .references(() => tag.id, { onDelete: "cascade" }),
  },
  (table) => [
    primaryKey({ columns: [table.postId, table.tagId] }),
    index("post_tag_tag_id_idx").on(table.tagId),
  ]
);
