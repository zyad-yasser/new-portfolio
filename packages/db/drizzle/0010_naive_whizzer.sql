CREATE TABLE "media_folder" (
	"id" text PRIMARY KEY NOT NULL,
	"owner_id" text NOT NULL,
	"parent_id" text,
	"name" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "media" ADD COLUMN "folder_id" text;--> statement-breakpoint
ALTER TABLE "media_folder" ADD CONSTRAINT "media_folder_owner_id_user_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "media_folder" ADD CONSTRAINT "media_folder_parent_id_media_folder_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."media_folder"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "media_folder_owner_id_parent_id_idx" ON "media_folder" USING btree ("owner_id","parent_id");--> statement-breakpoint
ALTER TABLE "media" ADD CONSTRAINT "media_folder_id_media_folder_id_fk" FOREIGN KEY ("folder_id") REFERENCES "public"."media_folder"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "media_folder_id_idx" ON "media" USING btree ("folder_id");