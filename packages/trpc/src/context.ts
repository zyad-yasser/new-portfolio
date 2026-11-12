import { auth } from "@repo/auth";
import { assertTRPCSameOrigin } from "./assert-trpc-same-origin";

export async function createTRPCContext(opts: { headers: Headers }) {
  assertTRPCSameOrigin(opts.headers);

  const session = await auth.api.getSession({ headers: opts.headers });

  return {
    session,
    headers: opts.headers,
  };
}

export type TRPCContext = Awaited<ReturnType<typeof createTRPCContext>>;
