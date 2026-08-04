import { publicAuth } from "@repo/auth/public";
import { SameOriginError, assertSameOrigin } from "@repo/utils/same-origin";
import { TRPCError } from "@trpc/server";

export async function createPublicTRPCContext(opts: { headers: Headers }) {
  try {
    assertSameOrigin(opts.headers);
  } catch (error) {
    if (error instanceof SameOriginError) {
      throw new TRPCError({ code: "FORBIDDEN", message: error.message });
    }
    throw error;
  }

  const session = await publicAuth.api.getSession({ headers: opts.headers });

  return {
    session,
    headers: opts.headers,
  };
}

export type PublicTRPCContext = Awaited<ReturnType<typeof createPublicTRPCContext>>;
