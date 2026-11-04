CREATE TABLE "post_image_annotation" (
	"id" text PRIMARY KEY NOT NULL,
	"post_id" text NOT NULL,
	"user_id" text NOT NULL,
	"image_src" text NOT NULL,
	"x_percent" real NOT NULL,
	"y_percent" real NOT NULL,
	"radius_percent" real NOT NULL,
	"color" text DEFAULT 'yellow' NOT NULL,
	"note_json" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "post_video_comment" (
	"id" text PRIMARY KEY NOT NULL,
	"post_id" text NOT NULL,
	"user_id" text NOT NULL,
	"video_src" text NOT NULL,
	"timestamp_seconds" real NOT NULL,
	"color" text DEFAULT 'yellow' NOT NULL,
	"note_json" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "post_image_annotation" ADD CONSTRAINT "post_image_annotation_post_id_post_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."post"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "post_image_annotation" ADD CONSTRAINT "post_image_annotation_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "post_video_comment" ADD CONSTRAINT "post_video_comment_post_id_post_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."post"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "post_video_comment" ADD CONSTRAINT "post_video_comment_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "post_image_annotation_post_id_user_id_idx" ON "post_image_annotation" USING btree ("post_id","user_id");--> statement-breakpoint
CREATE INDEX "post_image_annotation_user_id_idx" ON "post_image_annotation" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "post_video_comment_post_id_user_id_idx" ON "post_video_comment" USING btree ("post_id","user_id");--> statement-breakpoint
CREATE INDEX "post_video_comment_user_id_idx" ON "post_video_comment" USING btree ("user_id");