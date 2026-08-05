"use client";

import { PostEditor } from "@/components/editor/post-editor";
import { SiteHeader } from "@/components/site-header";

export default function NewPostPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto flex max-w-3xl flex-col gap-6 px-6 py-16">
        <PostEditor mode="create" doneHref="/mine" />
      </main>
    </>
  );
}
