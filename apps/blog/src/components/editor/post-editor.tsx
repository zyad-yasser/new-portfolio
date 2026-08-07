"use client";

import { CoverImagePicker } from "@/components/media/cover-image-picker";
import { categoryColorClasses } from "@/lib/category-colors";
import type { TiptapDoc } from "@repo/db/schema";
import { publicApi } from "@repo/trpc/public/react";
import { Badge } from "@repo/ui/badge";
import { Button } from "@repo/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/ui/card";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@repo/ui/command";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@repo/ui/dialog";
import { Input } from "@repo/ui/input";
import { Label } from "@repo/ui/label";
import { cn } from "@repo/ui/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@repo/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@repo/ui/select";
import { Textarea } from "@repo/ui/textarea";
import { Check, Loader2, Plus, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { TiptapEditor } from "./tiptap-editor";
import { type AutosaveStatus, useAutosavePost } from "./use-autosave-post";

const EMPTY_DOC: TiptapDoc = { type: "doc", content: [{ type: "paragraph" }] };
const MAX_TAGS = 5;

function SavingIndicator({ status }: { status: AutosaveStatus }) {
  if (status === "saving") {
    return (
      <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Loader2 className="size-3.5 animate-spin" />
        Saving…
      </span>
    );
  }
  if (status === "saved") {
    return (
      <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Check className="size-3.5" />
        Saved
      </span>
    );
  }
  if (status === "error") {
    return <span className="text-xs text-destructive">Couldn't save</span>;
  }
  return null;
}

function TagPicker({
  tagNames,
  onAdd,
  onRemove,
}: {
  tagNames: string[];
  onAdd: (name: string) => void;
  onRemove: (name: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const { data: results } = publicApi.tag.search.useQuery({ query }, { enabled: open });

  const canAddMore = tagNames.length < MAX_TAGS;

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {tagNames.map((name) => (
        <Badge key={name} variant="secondary" className="gap-1 pr-1">
          {name}
          <button
            type="button"
            aria-label={`Remove tag ${name}`}
            onClick={() => onRemove(name)}
            className="cursor-pointer rounded-full hover:bg-muted-foreground/20"
          >
            <X className="size-3" />
          </button>
        </Badge>
      ))}

      {canAddMore && (
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button type="button" variant="outline" size="sm" className="h-7 gap-1 text-xs">
              <Plus className="size-3.5" />
              Tag
            </Button>
          </PopoverTrigger>
          <PopoverContent align="start" className="w-56 p-0">
            <Command shouldFilter={false}>
              <CommandInput
                placeholder="Search or add tag…"
                value={query}
                onValueChange={setQuery}
              />
              <CommandList>
                <CommandEmpty>
                  {query.trim() && (
                    <button
                      type="button"
                      className="flex w-full cursor-pointer items-center gap-2 px-2 py-1.5 text-left text-sm hover:bg-accent"
                      onClick={() => {
                        onAdd(query);
                        setQuery("");
                        setOpen(false);
                      }}
                    >
                      <Plus className="size-3.5" />
                      Create "{query.trim()}"
                    </button>
                  )}
                </CommandEmpty>
                <CommandGroup>
                  {results
                    ?.filter((t) => !tagNames.includes(t.name))
                    .map((t) => (
                      <CommandItem
                        key={t.id}
                        value={t.name}
                        onSelect={() => {
                          onAdd(t.name);
                          setQuery("");
                          setOpen(false);
                        }}
                      >
                        {t.name}
                      </CommandItem>
                    ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
}

function NewSeriesDialog({ onCreated }: { onCreated: (id: string) => void }) {
  const utils = publicApi.useUtils();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const create = publicApi.series.create.useMutation({
    onSuccess: async (created) => {
      await utils.series.mine.invalidate();
      setOpen(false);
      setTitle("");
      setDescription("");
      onCreated(created.id);
    },
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant="outline" size="sm" className="h-7 gap-1 text-xs">
          <Plus className="size-3.5" />
          New series
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New series</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="series-title">Title</Label>
            <Input id="series-title" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="series-description">Description</Label>
            <Textarea
              id="series-description"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            disabled={!title.trim() || create.isPending}
            onClick={() => create.mutate({ title, description: description || null })}
          >
            {create.isPending && <Loader2 className="size-4 animate-spin" />}
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function PostEditor({
  mode,
  existingPostId,
  initialTitle,
  initialContentJson,
  initialCategoryId,
  initialSeriesId,
  initialTagNames,
  initialCoverImageUrl,
  doneHref,
}: {
  mode: "create" | "edit";
  existingPostId?: string;
  initialTitle?: string;
  initialContentJson?: TiptapDoc;
  initialCategoryId?: string | null;
  initialSeriesId?: string | null;
  initialTagNames?: string[];
  initialCoverImageUrl?: string | null;
  doneHref?: string;
}) {
  const router = useRouter();
  const [title, setTitle] = useState(initialTitle ?? "");
  const [contentJson, setContentJson] = useState<TiptapDoc>(initialContentJson ?? EMPTY_DOC);
  const [categoryId, setCategoryId] = useState<string | null>(initialCategoryId ?? null);
  const [seriesId, setSeriesId] = useState<string | null>(initialSeriesId ?? null);
  const [tagNames, setTagNames] = useState<string[]>(initialTagNames ?? []);
  const [coverImageUrl, setCoverImageUrl] = useState<string | null>(initialCoverImageUrl ?? null);

  const { data: categories } = publicApi.category.list.useQuery(undefined, {
    staleTime: 10 * 60 * 1000,
  });
  const { data: mySeries } = publicApi.series.mine.useQuery();
  const autosave = useAutosavePost(existingPostId);

  const skipNextAutosave = useRef(true);
  useEffect(() => {
    if (skipNextAutosave.current) {
      skipNextAutosave.current = false;
      return;
    }
    autosave.schedule({ title, contentJson, categoryId, seriesId, tagNames, coverImageUrl });
  }, [title, contentJson, categoryId, seriesId, tagNames, coverImageUrl]);

  function addTag(name: string) {
    const trimmed = name.trim();
    if (!trimmed || tagNames.length >= MAX_TAGS || tagNames.includes(trimmed)) return;
    setTagNames((prev) => [...prev, trimmed]);
  }

  function removeTag(name: string) {
    setTagNames((prev) => prev.filter((t) => t !== name));
  }

  async function handlePublish() {
    const result = await autosave.publish();
    if (result) {
      router.push(`/post/${result.slug}`);
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-3">
        <div>
          <CardTitle>{mode === "edit" ? "Edit post" : "Write a post"}</CardTitle>
          <CardDescription>Changes save automatically as you write.</CardDescription>
        </div>
        <SavingIndicator status={autosave.status} />
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <CoverImagePicker value={coverImageUrl} onChange={setCoverImageUrl} />

        <Input
          autoFocus
          placeholder="Post title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          className="text-lg font-medium"
        />

        <div className="flex flex-wrap items-center gap-4">
          <Select
            value={categoryId ?? "none"}
            onValueChange={(value) => setCategoryId(value === "none" ? null : value)}
          >
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No category</SelectItem>
              {categories?.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>
                  <span
                    className={cn(
                      "inline-block size-2 rounded-full",
                      categoryColorClasses(cat.color).dot
                    )}
                  />
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={seriesId ?? "none"}
            onValueChange={(value) => setSeriesId(value === "none" ? null : value)}
          >
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Series" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No series</SelectItem>
              {mySeries?.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <NewSeriesDialog onCreated={setSeriesId} />

          <TagPicker tagNames={tagNames} onAdd={addTag} onRemove={removeTag} />
        </div>

        <TiptapEditor content={contentJson} onChange={setContentJson} />

        <div className="flex items-center justify-end gap-2">
          {doneHref && (
            <Button asChild variant="outline">
              <Link href={doneHref}>Done</Link>
            </Button>
          )}
          {mode === "create" && (
            <Button onClick={handlePublish} disabled={!title.trim() || autosave.isPublishing}>
              {autosave.isPublishing && <Loader2 className="size-4 animate-spin" />}
              Publish
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
