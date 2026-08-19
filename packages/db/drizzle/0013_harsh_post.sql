CREATE TABLE "post_highlight" (
	"id" text PRIMARY KEY NOT NULL,
	"post_id" text NOT NULL,
	"user_id" text NOT NULL,
	"quote_text" text NOT NULL,
	"prefix_text" text DEFAULT '' NOT NULL,
	"suffix_text" text DEFAULT '' NOT NULL,
	"start_offset" integer NOT NULL,
	"end_offset" integer NOT NULL,
	"color" text DEFAULT 'yellow' NOT NULL,
	"note_json" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "post_highlight" ADD CONSTRAINT "post_highlight_post_id_post_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."post"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "post_highlight" ADD CONSTRAINT "post_highlight_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "post_highlight_post_id_user_id_idx" ON "post_highlight" USING btree ("post_id","user_id");--> statement-breakpoint
CREATE INDEX "post_highlight_user_id_idx" ON "post_highlight" USING btree ("user_id");