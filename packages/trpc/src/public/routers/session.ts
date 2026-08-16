import { publicAuth } from "@repo/auth/public";
import { z } from "zod";
import { authedProcedure, createPublicTRPCRouter } from "../init";

export const sessionRouter = createPublicTRPCRouter({
  list: authedProcedure.query(async ({ ctx }) => {
    const sessions = await publicAuth.api.listSessions({ headers: ctx.headers });
    const currentToken = ctx.session.session.token;

    return sessions
      .map((session) => ({
        id: session.id,
        token: session.token,
        ipAddress: session.ipAddress ?? null,
        userAgent: session.userAgent ?? null,
        createdAt: new Date(session.createdAt),
        expiresAt: new Date(session.expiresAt),
        isCurrent: session.token === currentToken,
      }))
      .sort((a, b) => {
        if (a.isCurrent !== b.isCurrent) {
          return a.isCurrent ? -1 : 1;
        }
        return b.createdAt.getTime() - a.createdAt.getTime();
      });
  }),

  revoke: authedProcedure.input(z.object({ token: z.string() })).mutation(async ({ ctx, input }) => {
    await publicAuth.api.revokeSession({ body: { token: input.token }, headers: ctx.headers });
    return { ok: true };
  }),

  revokeOthers: authedProcedure.mutation(async ({ ctx }) => {
    await publicAuth.api.revokeOtherSessions({ headers: ctx.headers });
    return { ok: true };
  }),
});
