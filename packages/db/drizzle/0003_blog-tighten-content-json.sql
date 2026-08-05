ALTER TABLE "post" ALTER COLUMN "excerpt_text" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "post" ALTER COLUMN "content_json" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "post" DROP COLUMN "content";