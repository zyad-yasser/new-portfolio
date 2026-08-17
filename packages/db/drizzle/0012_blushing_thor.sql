CREATE TABLE "post_reshare" (
	"user_id" text NOT NULL,
	"post_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "post_reshare_user_id_post_id_pk" PRIMARY KEY("user_id","post_id")
);
--> statement-breakpoint
ALTER TABLE "post" ALTER COLUMN "title" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "post" ALTER COLUMN "excerpt_text" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "post" ADD COLUMN "type" text DEFAULT 'article' NOT NULL;--> statement-breakpoint
ALTER TABLE "post" ADD COLUMN "quoted_post_id" text;--> statement-breakpoint
ALTER TABLE "post_reshare" ADD CONSTRAINT "post_reshare_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "post_reshare" ADD CONSTRAINT "post_reshare_post_id_post_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."post"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "post_reshare_post_id_idx" ON "post_reshare" USING btree ("post_id");--> statement-breakpoint
ALTER TABLE "post" ADD CONSTRAINT "post_quoted_post_id_post_id_fk" FOREIGN KEY ("quoted_post_id") REFERENCES "public"."post"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "post_author_id_idx" ON "post" USING btree ("author_id");--> statement-breakpoint
CREATE INDEX "post_quoted_post_id_idx" ON "post" USING btree ("quoted_post_id");--> statement-breakpoint
CREATE INDEX "post_published_created_at_idx" ON "post" USING btree ("published","created_at" DESC NULLS LAST,"id" DESC NULLS LAST) WHERE "post"."published" = true;