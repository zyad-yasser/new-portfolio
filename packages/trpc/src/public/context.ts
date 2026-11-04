import { publicAuth } from "@repo/auth/public";
import { assertTRPCSameOrigin } from "../assert-trpc-same-origin";

export async function createPublicTRPCContext(opts: { headers: Headers }) {
  assertTRPCSameOrigin(opts.headers);

  const session = await publicAuth.api.getSession({ headers: opts.headers });

  return {
    session,
    headers: opts.headers,
  };
}

export type PublicTRPCContext = Awaited<ReturnType<typeof createPublicTRPCContext>>;
