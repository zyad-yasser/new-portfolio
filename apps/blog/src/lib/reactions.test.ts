import { REACTION_TYPES } from "@repo/db/schema";
import { describe, expect, it } from "vitest";
import { REACTION_EMOJI, REACTION_LABEL } from "./reactions";

describe("reaction maps", () => {
  it("has an emoji and a label for every reaction type", () => {
    for (const type of REACTION_TYPES) {
      expect(REACTION_EMOJI[type]).toBeTruthy();
      expect(REACTION_LABEL[type]).toBeTruthy();
    }
  });

  it("uses distinct emoji for every reaction", () => {
    const emoji = REACTION_TYPES.map((type) => REACTION_EMOJI[type]);
    expect(new Set(emoji).size).toBe(emoji.length);
  });
});
