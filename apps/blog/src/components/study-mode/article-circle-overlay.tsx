"use client";

import { VerifiedGate } from "@/components/verified-gate";
import type { HighlightColor, TiptapDoc } from "@repo/db/schema";
import { getErrorMessage } from "@repo/trpc/error";
import { publicApi } from "@repo/trpc/public/react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { MediaNoteComposer } from "./media-note-composer";

export type CircleAnnotation = {
  id: string;
  xPercent: number;
  yPercent: number;
  radiusPercent: number;
  color: HighlightColor;
  noteJson: TiptapDoc | null;
};

const CIRCLE_CANVAS_SRC = "article-canvas";
const MOVE_THRESHOLD_PX = 4;

const COLOR_STROKE: Record<HighlightColor, string> = {
  yellow: "#eab308",
  green: "#22c55e",
  blue: "#3b82f6",
  pink: "#ec4899",
};

type Point = { x: number; y: number };

type DragState =
  | { kind: "lasso"; points: Point[] }
  | {
      kind: "move";
      id: string;
      startPoint: Point;
      offset: Point;
      currentXPercent: number;
      currentYPercent: number;
      moved: boolean;
    };

function fitCircle(points: Point[]) {
  const centerX = points.reduce((sum, p) => sum + p.x, 0) / points.length;
  const centerY = points.reduce((sum, p) => sum + p.y, 0) / points.length;
  const radius =
    points.reduce((sum, p) => sum + Math.hypot(p.x - centerX, p.y - centerY), 0) / points.length;
  return { x: centerX, y: centerY, radius };
}

export function ArticleCircleOverlay({
  postId,
  toolActive,
  annotations,
  session,
}: {
  postId: string;
  toolActive: boolean;
  annotations: CircleAnnotation[];
  session: { user: { emailVerified: boolean } } | null | undefined;
}) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const sizeRef = useRef(size);
  sizeRef.current = size;
  const annotationsRef = useRef(annotations);
  annotationsRef.current = annotations;
  const [drag, setDrag] = useState<DragState | null>(null);
  const dragRef = useRef<DragState | null>(null);
  dragRef.current = drag;
  const [pendingPositions, setPendingPositions] = useState<
    Record<string, { xPercent: number; yPercent: number }>
  >({});
  const pendingPositionsRef = useRef(pendingPositions);
  pendingPositionsRef.current = pendingPositions;
  const [active, setActive] = useState<{
    mode: "create" | "edit";
    id?: string;
    xPercent: number;
    yPercent: number;
    radiusPercent: number;
    color: HighlightColor;
    noteJson: TiptapDoc | null;
    anchorPoint: { top: number; left: number };
  } | null>(null);

  const utils = publicApi.useUtils();
  const canDraw = !!session?.user.emailVerified;

  useEffect(() => {
    setPendingPositions((current) => {
      const ids = Object.keys(current);
      if (ids.length === 0) return current;
      let changed = false;
      const next = { ...current };
      for (const id of ids) {
        const annotation = annotations.find((item) => item.id === id);
        const pending = current[id];
        if (
          annotation &&
          pending &&
          Math.abs(annotation.xPercent - pending.xPercent) < 0.01 &&
          Math.abs(annotation.yPercent - pending.yPercent) < 0.01
        ) {
          delete next[id];
          changed = true;
        }
      }
      return changed ? next : current;
    });
  }, [annotations]);

  useEffect(() => {
    const el = svgRef.current;
    if (!el) return;
    function measure() {
      if (!el) return;
      const rect = el.getBoundingClientRect();
      setSize({ width: rect.width, height: rect.height });
    }
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const createAnnotation = publicApi.imageAnnotation.create.useMutation({
    onMutate: (input) => {
      utils.imageAnnotation.listMineForPost.cancel({ postId });
      const previous = utils.imageAnnotation.listMineForPost.getData({ postId });
      const optimisticRow = {
        id: `optimistic-${crypto.randomUUID()}`,
        postId: input.postId,
        userId: "",
        imageSrc: input.imageSrc,
        xPercent: input.xPercent,
        yPercent: input.yPercent,
        radiusPercent: input.radiusPercent,
        color: input.color ?? "yellow",
        noteJson: (input.noteJson ?? null) as TiptapDoc | null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      utils.imageAnnotation.listMineForPost.setData({ postId }, (old) =>
        old ? [...old, optimisticRow] : [optimisticRow]
      );
      return { previous };
    },
    onSuccess: () => toast.success("Circle added."),
    onError: (error, _input, context) => {
      if (context?.previous) {
        utils.imageAnnotation.listMineForPost.setData({ postId }, context.previous);
      }
      toast.error(getErrorMessage(error, "Couldn't add this circle."));
    },
    onSettled: () => {
      utils.imageAnnotation.listMineForPost.invalidate({ postId });
    },
  });

  const updateNote = publicApi.imageAnnotation.updateNote.useMutation({
    onSuccess: () => {
      utils.imageAnnotation.listMineForPost.invalidate({ postId });
      toast.success("Note saved.");
    },
    onError: (error) => toast.error(getErrorMessage(error, "Couldn't save this note.")),
  });

  const updateColor = publicApi.imageAnnotation.updateColor.useMutation({
    onSuccess: () => utils.imageAnnotation.listMineForPost.invalidate({ postId }),
    onError: (error) => toast.error(getErrorMessage(error, "Couldn't update the color.")),
  });

  const updatePosition = publicApi.imageAnnotation.updatePosition.useMutation({
    onMutate: (input) => {
      utils.imageAnnotation.listMineForPost.cancel({ postId });
      const previous = utils.imageAnnotation.listMineForPost.getData({ postId });
      utils.imageAnnotation.listMineForPost.setData({ postId }, (old) =>
        old?.map((item) =>
          item.id === input.id
            ? { ...item, xPercent: input.xPercent, yPercent: input.yPercent }
            : item
        )
      );
      return { previous };
    },
    onError: (error, _input, context) => {
      if (context?.previous) {
        utils.imageAnnotation.listMineForPost.setData({ postId }, context.previous);
      }
      toast.error(getErrorMessage(error, "Couldn't move this circle."));
    },
    onSettled: () => {
      utils.imageAnnotation.listMineForPost.invalidate({ postId });
    },
  });

  const deleteAnnotation = publicApi.imageAnnotation.delete.useMutation({
    onSuccess: () => {
      utils.imageAnnotation.listMineForPost.invalidate({ postId });
      toast.success("Circle deleted.");
      setActive(null);
    },
    onError: (error) => toast.error(getErrorMessage(error, "Couldn't delete this circle.")),
  });

  function clampPx(value: number, max: number) {
    return Math.min(max, Math.max(0, value));
  }

  function toLocalPoint(clientX: number, clientY: number): Point {
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    return {
      x: clampPx(clientX - rect.left, rect.width),
      y: clampPx(clientY - rect.top, rect.height),
    };
  }

  function toPercent(point: Point) {
    const current = sizeRef.current;
    if (current.width === 0 || current.height === 0) return { xPercent: 0, yPercent: 0 };
    return {
      xPercent: (point.x / current.width) * 100,
      yPercent: (point.y / current.height) * 100,
    };
  }

  function fromPercent(xPercent: number, yPercent: number): Point {
    const current = sizeRef.current;
    return { x: (xPercent / 100) * current.width, y: (yPercent / 100) * current.height };
  }

  function pointToClient(xPercent: number, yPercent: number) {
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return { top: 0, left: 0 };
    return {
      top: rect.top + (yPercent / 100) * rect.height,
      left: rect.left + (xPercent / 100) * rect.width,
    };
  }

  useEffect(() => {
    function handleMove(event: MouseEvent) {
      if (!dragRef.current) return;
      const point = toLocalPoint(event.clientX, event.clientY);
      setDrag((current) => {
        if (!current) return current;
        if (current.kind === "lasso") {
          return { ...current, points: [...current.points, point] };
        }
        const moved =
          current.moved ||
          Math.hypot(point.x - current.startPoint.x, point.y - current.startPoint.y) >
            MOVE_THRESHOLD_PX;
        const center = { x: point.x + current.offset.x, y: point.y + current.offset.y };
        const { xPercent, yPercent } = toPercent(center);
        return { ...current, currentXPercent: xPercent, currentYPercent: yPercent, moved };
      });
    }

    function handleUp() {
      if (!dragRef.current) return;
      setDrag((current) => {
        if (!current) return null;

        if (current.kind === "lasso") {
          if (current.points.length < 3) return null;
          const fit = fitCircle(current.points);
          if (fit.radius < 8) return null;
          const { xPercent, yPercent } = toPercent({ x: fit.x, y: fit.y });
          const radiusPercent = Math.min((fit.radius / sizeRef.current.width) * 100, 50);
          setActive({
            mode: "create",
            xPercent,
            yPercent,
            radiusPercent,
            color: "yellow",
            noteJson: null,
            anchorPoint: pointToClient(xPercent, yPercent),
          });
          return null;
        }

        if (current.moved) {
          const { id, currentXPercent, currentYPercent } = current;
          setPendingPositions((prev) => ({
            ...prev,
            [id]: { xPercent: currentXPercent, yPercent: currentYPercent },
          }));
          updatePosition.mutate({ id, xPercent: currentXPercent, yPercent: currentYPercent });
        } else {
          const annotation = annotationsRef.current.find((item) => item.id === current.id);
          if (annotation) {
            const pending = pendingPositionsRef.current[annotation.id];
            const xPercent = pending?.xPercent ?? annotation.xPercent;
            const yPercent = pending?.yPercent ?? annotation.yPercent;
            setActive({
              mode: "edit",
              id: annotation.id,
              xPercent,
              yPercent,
              radiusPercent: annotation.radiusPercent,
              color: annotation.color,
              noteJson: annotation.noteJson,
              anchorPoint: pointToClient(xPercent, yPercent),
            });
          }
        }
        return null;
      });
    }

    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseup", handleUp);
    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseup", handleUp);
    };
    // Attached exactly once for the component's lifetime — re-subscribing on every drag update
    // (or even on every drag start/stop) is what caused dragging to feel laggy. Live values are
    // read via refs (dragRef/annotationsRef/sizeRef) instead of the closed-over state.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleSvgMouseDown(event: React.MouseEvent<SVGSVGElement>) {
    if (!canDraw || !toolActive || event.button !== 0) return;
    const point = toLocalPoint(event.clientX, event.clientY);
    setDrag({ kind: "lasso", points: [point] });
  }

  function handleCircleMouseDown(annotation: CircleAnnotation, event: React.MouseEvent) {
    if (!canDraw) return;
    event.stopPropagation();
    const pending = pendingPositions[annotation.id];
    const xPercent = pending?.xPercent ?? annotation.xPercent;
    const yPercent = pending?.yPercent ?? annotation.yPercent;
    const startPoint = toLocalPoint(event.clientX, event.clientY);
    const center = fromPercent(xPercent, yPercent);
    setDrag({
      kind: "move",
      id: annotation.id,
      startPoint,
      offset: { x: center.x - startPoint.x, y: center.y - startPoint.y },
      currentXPercent: xPercent,
      currentYPercent: yPercent,
      moved: false,
    });
  }

  function openView(annotation: CircleAnnotation, event: React.KeyboardEvent) {
    event.stopPropagation();
    const pending = pendingPositions[annotation.id];
    const xPercent = pending?.xPercent ?? annotation.xPercent;
    const yPercent = pending?.yPercent ?? annotation.yPercent;
    setActive({
      mode: "edit",
      id: annotation.id,
      xPercent,
      yPercent,
      radiusPercent: annotation.radiusPercent,
      color: annotation.color,
      noteJson: annotation.noteJson,
      anchorPoint: pointToClient(xPercent, yPercent),
    });
  }

  const lassoPoints = drag?.kind === "lasso" ? drag.points : null;

  return (
    <>
      <VerifiedGate
        verified={canDraw}
        message={session ? "Verify your email to draw circles" : "Log in to draw circles"}
      >
        <svg
          ref={svgRef}
          className="absolute inset-0"
          style={{ pointerEvents: toolActive ? "auto" : "none", cursor: "crosshair" }}
          width="100%"
          height="100%"
          viewBox={`0 0 ${size.width || 1} ${size.height || 1}`}
          onMouseDown={handleSvgMouseDown}
        >
          <title>Circle annotations</title>
          {annotations.map((annotation) => {
            const isMoving = drag?.kind === "move" && drag.id === annotation.id;
            const pending = pendingPositions[annotation.id];
            const effectiveXPercent = isMoving
              ? drag.currentXPercent
              : (pending?.xPercent ?? annotation.xPercent);
            const effectiveYPercent = isMoving
              ? drag.currentYPercent
              : (pending?.yPercent ?? annotation.yPercent);
            const point = fromPercent(effectiveXPercent, effectiveYPercent);
            const radiusPx = (annotation.radiusPercent / 100) * size.width;
            return (
              <circle
                key={annotation.id}
                data-annotation-id={annotation.id}
                cx={point.x}
                cy={point.y}
                r={radiusPx}
                fill="transparent"
                stroke={COLOR_STROKE[annotation.color]}
                strokeWidth={2}
                style={{
                  pointerEvents: "auto",
                  cursor: canDraw ? "grab" : "pointer",
                }}
                role="button"
                tabIndex={0}
                aria-label="Open note"
                onMouseDown={(event) => handleCircleMouseDown(annotation, event)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    openView(annotation, event);
                  }
                }}
              />
            );
          })}
          {lassoPoints && (
            <polyline
              points={lassoPoints.map((p) => `${p.x},${p.y}`).join(" ")}
              fill="none"
              stroke="white"
              strokeWidth={1}
              strokeDasharray="2 2"
            />
          )}
          {active?.mode === "create" &&
            (() => {
              const previewPoint = fromPercent(active.xPercent, active.yPercent);
              return (
                <circle
                  cx={previewPoint.x}
                  cy={previewPoint.y}
                  r={(active.radiusPercent / 100) * size.width}
                  fill="transparent"
                  stroke={COLOR_STROKE[active.color]}
                  strokeWidth={2}
                />
              );
            })()}
        </svg>
      </VerifiedGate>

      {active && (
        <MediaNoteComposer
          label="Circle note"
          color={active.color}
          noteJson={active.noteJson}
          anchorPoint={active.anchorPoint}
          saving={createAnnotation.isPending || updateNote.isPending}
          onColorChange={(color) => {
            setActive((current) => (current ? { ...current, color } : current));
            if (active.mode === "edit" && active.id) {
              updateColor.mutate({ id: active.id, color });
            }
          }}
          onSave={(doc) => {
            if (active.mode === "create") {
              createAnnotation.mutate({
                postId,
                imageSrc: CIRCLE_CANVAS_SRC,
                xPercent: active.xPercent,
                yPercent: active.yPercent,
                radiusPercent: active.radiusPercent,
                color: active.color,
                noteJson: doc,
              });
            } else if (active.id) {
              updateNote.mutate({ id: active.id, noteJson: doc });
            }
            setActive(null);
          }}
          onDelete={
            active.mode === "edit" && active.id
              ? () => {
                  if (active.id) deleteAnnotation.mutate({ id: active.id });
                }
              : undefined
          }
          onClose={() => setActive(null)}
        />
      )}
    </>
  );
}
