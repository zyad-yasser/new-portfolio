import { publicAuth } from "@repo/auth/public";

export async function createPublicTRPCContext(opts: { headers: Headers }) {
  const session = await publicAuth.api.getSession({ headers: opts.headers });

  return {
    session,
  };
}

export type PublicTRPCContext = Awaited<ReturnType<typeof createPublicTRPCContext>>;
