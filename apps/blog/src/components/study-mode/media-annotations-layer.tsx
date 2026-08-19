"use client";

import { useEffect, useState } from "react";
import { ArticleCircleOverlay, type CircleAnnotation } from "./article-circle-overlay";
import { type VideoComment, VideoMarkerStrip } from "./video-marker-strip";

type Rect = { top: number; left: number; width: number; height: number };

export function MediaAnnotationsLayer({
  postId,
  articleRef,
  studyMode,
  activeTool,
  videoComments,
  circleAnnotations,
  session,
}: {
  postId: string;
  articleRef: React.RefObject<HTMLDivElement | null>;
  studyMode: boolean;
  activeTool: "highlight" | "circle";
  videoComments: VideoComment[];
  circleAnnotations: CircleAnnotation[];
  session: { user: { emailVerified: boolean } } | null | undefined;
}) {
  const [videos, setVideos] = useState<{ el: HTMLVideoElement; src: string; rect: Rect }[]>([]);

  useEffect(() => {
    const container = articleRef.current;
    if (!studyMode || !container) {
      setVideos([]);
      return;
    }

    function measure() {
      if (!container) return;
      const containerRect = container.getBoundingClientRect();

      const videoEls = [...container.querySelectorAll("video")];
      setVideos(
        videoEls.map((el) => {
          const r = el.getBoundingClientRect();
          return {
            el,
            src: el.currentSrc || el.src,
            rect: {
              top: r.top - containerRect.top,
              left: r.left - containerRect.left,
              width: r.width,
              height: r.height,
            },
          };
        })
      );
    }

    measure();

    const resizeObserver = new ResizeObserver(measure);
    resizeObserver.observe(container);
    window.addEventListener("resize", measure);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [studyMode, articleRef]);

  if (!studyMode) return null;

  return (
    <div className="pointer-events-none absolute inset-0">
      {videos.map(({ el, src, rect }) => (
        <VideoMarkerStrip
          key={src}
          postId={postId}
          videoEl={el}
          videoSrc={src}
          rect={rect}
          comments={videoComments.filter((comment) => comment.videoSrc === src)}
          session={session}
        />
      ))}
      <ArticleCircleOverlay
        postId={postId}
        toolActive={activeTool === "circle"}
        annotations={circleAnnotations}
        session={session}
      />
    </div>
  );
}
