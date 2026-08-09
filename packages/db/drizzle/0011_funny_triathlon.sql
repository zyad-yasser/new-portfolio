CREATE TABLE "user_storage_quota" (
	"id" text PRIMARY KEY NOT NULL,
	"owner_id" text NOT NULL,
	"total_bytes" bigint DEFAULT 5368709120 NOT NULL,
	"used_bytes" bigint DEFAULT 0 NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_storage_quota_owner_id_unique" UNIQUE("owner_id")
);
--> statement-breakpoint
ALTER TABLE "user_storage_quota" ADD CONSTRAINT "user_storage_quota_owner_id_user_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;