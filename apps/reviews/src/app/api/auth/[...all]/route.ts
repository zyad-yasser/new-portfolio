import { publicAuth } from "@repo/auth/public";
import { toNextJsHandler } from "better-auth/next-js";

export const { GET, POST } = toNextJsHandler(publicAuth);
