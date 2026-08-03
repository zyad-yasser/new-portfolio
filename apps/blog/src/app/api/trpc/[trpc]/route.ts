import { createPublicTRPCContext } from "@repo/trpc/public/context";
import { publicAppRouter } from "@repo/trpc/public/routers/_app";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";

function handler(req: Request) {
  return fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: publicAppRouter,
    createContext: () => createPublicTRPCContext({ headers: req.headers }),
  });
}

export { handler as GET, handler as POST };
