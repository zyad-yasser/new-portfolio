"use client";

import { REACTION_EMOJI, REACTION_LABEL } from "@/lib/reactions";
import { publicAuthClient } from "@repo/auth/public-client";
import type { ReactionType } from "@repo/db/schema";
import { REACTION_TYPES } from "@repo/db/schema";
import { publicApi } from "@repo/trpc/public/react";
import { Avatar, AvatarFallback, AvatarGroup, AvatarImage } from "@repo/ui/avatar";
import { cn } from "@repo/ui/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@repo/ui/popover";

type Reactor = { id: string; name: string; image: string | null };

function ReactionButton({
  type,
  count,
  active,
  disabled,
  reactors,
  onReact,
}: {
  type: ReactionType;
  count: number;
  active: boolean;
  disabled: boolean;
  reactors: Reactor[];
  onReact: () => void;
}) {
  const button = (
    <button
      type="button"
      disabled={disabled}
      onClick={onReact}
      title={REACTION_LABEL[type]}
      className={cn(
        "flex cursor-pointer items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-colors",
        active
          ? "border-primary bg-primary/10 text-primary"
          : "border-border/60 text-muted-foreground hover:border-border hover:text-foreground",
        disabled && "cursor-default opacity-70"
      )}
    >
      <span>{REACTION_EMOJI[type]}</span>
      {count > 0 && <span>{count}</span>}
    </button>
  );

  if (!reactors.length) {
    return button;
  }

  return (
    <Popover>
      <PopoverTrigger asChild>{button}</PopoverTrigger>
      <PopoverContent align="start" className="w-auto p-3">
        <div className="flex flex-col gap-2">
          <span className="text-xs font-medium text-muted-foreground">{REACTION_LABEL[type]}</span>
          <AvatarGroup>
            {reactors.map((reactor) => (
              <Avatar key={reactor.id} size="sm">
                <AvatarImage src={reactor.image ?? undefined} alt={reactor.name} />
                <AvatarFallback>{reactor.name.slice(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
            ))}
          </AvatarGroup>
        </div>
      </PopoverContent>
    </Popover>
  );
}

export function ReactionBar({ postId }: { postId: string }) {
  const { data: session } = publicAuthClient.useSession();
  const utils = publicApi.useUtils();
  const { data: summary } = publicApi.reaction.summary.useQuery({ postId });
  const { data: mine } = publicApi.reaction.mine.useQuery({ postId }, { enabled: !!session });

  const react = publicApi.reaction.react.useMutation({
    onSuccess: () => {
      utils.reaction.summary.invalidate({ postId });
      utils.reaction.mine.invalidate({ postId });
    },
  });

  return (
    <div className="flex flex-wrap items-center gap-2">
      {REACTION_TYPES.map((type) => {
        const entry = summary?.find((row) => row.type === type);

        return (
          <ReactionButton
            key={type}
            type={type}
            count={entry?.count ?? 0}
            active={mine === type}
            disabled={!session || react.isPending}
            reactors={entry?.reactors ?? []}
            onReact={() => react.mutate({ postId, type })}
          />
        );
      })}
    </div>
  );
}
