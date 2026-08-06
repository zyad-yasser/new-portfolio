import { db } from "@repo/db";
import { tag } from "@repo/db/schema";
import { asc, ilike } from "drizzle-orm";
import { z } from "zod";
import { createPublicTRPCRouter, publicProcedure } from "../init";

export const tagRouter = createPublicTRPCRouter({
  list: publicProcedure.query(() => db.query.tag.findMany({ orderBy: asc(tag.name) })),

  search: publicProcedure
    .input(z.object({ query: z.string().trim().max(30) }))
    .query(({ input }) =>
      db.query.tag.findMany({
        where: input.query ? ilike(tag.name, `%${input.query}%`) : undefined,
        orderBy: asc(tag.name),
        limit: 20,
      })
    ),
});
