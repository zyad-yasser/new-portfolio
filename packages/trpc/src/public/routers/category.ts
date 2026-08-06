import { db } from "@repo/db";
import { category } from "@repo/db/schema";
import { asc } from "drizzle-orm";
import { createPublicTRPCRouter, publicProcedure } from "../init";

export const categoryRouter = createPublicTRPCRouter({
  list: publicProcedure.query(() => db.query.category.findMany({ orderBy: asc(category.name) })),
});
