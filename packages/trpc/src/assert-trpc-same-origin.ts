import { SameOriginError, assertSameOrigin } from "@repo/utils/same-origin";
import { TRPCError } from "@trpc/server";

export function assertTRPCSameOrigin(headers: Headers) {
  try {
    assertSameOrigin(headers);
  } catch (error) {
    if (error instanceof SameOriginError) {
      throw new TRPCError({ code: "FORBIDDEN", message: error.message });
    }
    throw error;
  }
}
