import type { ReactionType } from "@repo/db/schema";

export const REACTION_EMOJI: Record<ReactionType, string> = {
  like: "👍",
  unicorn: "🦄",
  mindblown: "🤯",
  raised_hands: "🙌",
  fire: "🔥",
};

export const REACTION_LABEL: Record<ReactionType, string> = {
  like: "Like",
  unicorn: "Unicorn",
  mindblown: "Mind blown",
  raised_hands: "Raised hands",
  fire: "Fire",
};
