CREATE TABLE "series" (
	"id" text PRIMARY KEY NOT NULL,
	"author_id" text NOT NULL,
	"title" text NOT NULL,
	"slug" text NOT NULL,
	"description" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "series_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
ALTER TABLE "post" ADD COLUMN "series_id" text;--> statement-breakpoint
ALTER TABLE "post" ADD COLUMN "series_order" integer;--> statement-breakpoint
ALTER TABLE "post" ADD COLUMN "search_vector" "tsvector";--> statement-breakpoint
ALTER TABLE "series" ADD CONSTRAINT "series_author_id_user_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "post" ADD CONSTRAINT "post_series_id_series_id_fk" FOREIGN KEY ("series_id") REFERENCES "public"."series"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "post_series_id_idx" ON "post" USING btree ("series_id");--> statement-breakpoint
CREATE INDEX "post_search_vector_idx" ON "post" USING gin ("search_vector");--> statement-breakpoint
UPDATE "post" SET "search_vector" =
	setweight(to_tsvector('english', title), 'A') || setweight(to_tsvector('english', excerpt_text), 'B');