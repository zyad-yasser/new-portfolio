"use client";

import { REACTION_EMOJI, REACTION_LABEL } from "@/lib/reactions";
import { publicAuthClient } from "@repo/auth/public-client";
import type { ReactionType } from "@repo/db/schema";
import { REACTION_TYPES } from "@repo/db/schema";
import { getErrorMessage } from "@repo/trpc/error";
import { publicApi } from "@repo/trpc/public/react";
import { Avatar, AvatarFallback, AvatarGroup, AvatarImage } from "@repo/ui/avatar";
import { FlipNumber } from "@repo/ui/flip-number";
import { cn } from "@repo/ui/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@repo/ui/popover";
import { Tooltip, TooltipContent, TooltipTrigger } from "@repo/ui/tooltip";
import { toast } from "sonner";

type Reactor = { id: string; name: string; image: string | null };

function ReactionButton({
  type,
  count,
  active,
  disabled,
  disabledReason,
  reactors,
  onReact,
}: {
  type: ReactionType;
  count: number;
  active: boolean;
  disabled: boolean;
  disabledReason?: string | undefined;
  reactors: Reactor[];
  onReact: () => void;
}) {
  const button = (
    <button
      type="button"
      disabled={disabled}
      onClick={onReact}
      title={REACTION_LABEL[type]}
      aria-label={REACTION_LABEL[type]}
      aria-pressed={active}
      className={cn(
        "flex cursor-pointer items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-colors",
        active
          ? "border-primary bg-primary/10 text-primary"
          : "border-border/60 text-muted-foreground hover:border-border hover:text-foreground",
        disabled && "cursor-default opacity-70"
      )}
    >
      <span>{REACTION_EMOJI[type]}</span>
      {count > 0 && <FlipNumber value={count} label={REACTION_LABEL[type]} />}
    </button>
  );

  const node = reactors.length ? (
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
  ) : (
    button
  );

  if (!disabledReason) {
    return node;
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        {/* biome-ignore lint/a11y/noNoninteractiveTabindex: focusable so keyboard users can reveal why the disabled reaction is disabled */}
        <span tabIndex={0} className="inline-flex">
          {node}
        </span>
      </TooltipTrigger>
      <TooltipContent>{disabledReason}</TooltipContent>
    </Tooltip>
  );
}

export function ReactionBar({ postId }: { postId: string }) {
  const { data: session } = publicAuthClient.useSession();
  const utils = publicApi.useUtils();
  const { data: summary } = publicApi.reaction.summary.useQuery({ postId });
  const { data: mine } = publicApi.reaction.mine.useQuery({ postId }, { enabled: !!session });

  const react = publicApi.reaction.react.useMutation({
    onMutate: async ({ type }) => {
      await Promise.all([
        utils.reaction.summary.cancel({ postId }),
        utils.reaction.mine.cancel({ postId }),
      ]);

      const previousSummary = utils.reaction.summary.getData({ postId });
      const previousMine = utils.reaction.mine.getData({ postId }) ?? null;
      const nextMine = previousMine === type ? null : type;

      utils.reaction.mine.setData({ postId }, nextMine);
      utils.reaction.summary.setData({ postId }, (current) =>
        current?.map((row) => {
          const delta = (row.type === nextMine ? 1 : 0) - (row.type === previousMine ? 1 : 0);
          return delta === 0 ? row : { ...row, count: Math.max(0, row.count + delta) };
        })
      );

      return { previousSummary, previousMine };
    },
    onError: (error, _variables, context) => {
      utils.reaction.summary.setData({ postId }, context?.previousSummary);
      utils.reaction.mine.setData({ postId }, context?.previousMine ?? null);
      toast.error(getErrorMessage(error, "Couldn't react to this post."));
    },
    onSettled: () => {
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
            disabled={!session || !session.user.emailVerified || react.isPending}
            disabledReason={
              session && !session.user.emailVerified
                ? "Verify your email to react to posts"
                : undefined
            }
            reactors={entry?.reactors ?? []}
            onReact={() => react.mutate({ postId, type })}
          />
        );
      })}
    </div>
  );
}
