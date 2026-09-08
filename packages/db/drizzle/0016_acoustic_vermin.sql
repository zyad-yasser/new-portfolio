ALTER TABLE "post" ADD COLUMN "reaction_count" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "post" ADD COLUMN "comment_count" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
UPDATE "post" SET "reaction_count" = COALESCE((
  SELECT count(*) FROM "post_reaction" WHERE "post_reaction"."post_id" = "post"."id"
), 0);--> statement-breakpoint
UPDATE "post" SET "comment_count" = COALESCE((
  SELECT count(*) FROM "comment"
  WHERE "comment"."post_id" = "post"."id" AND "comment"."deleted_at" IS NULL
), 0);
