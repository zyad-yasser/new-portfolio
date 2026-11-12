DROP INDEX "comment_post_id_idx";--> statement-breakpoint
CREATE INDEX "account_user_id_idx" ON "account" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "session_user_id_idx" ON "session" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "two_factor_user_id_idx" ON "two_factor" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "comment_post_id_parent_created_at_idx" ON "comment" USING btree ("post_id","parent_comment_id","created_at");--> statement-breakpoint
CREATE INDEX "comment_author_id_idx" ON "comment" USING btree ("author_id");--> statement-breakpoint
CREATE INDEX "media_folder_parent_id_idx" ON "media_folder" USING btree ("parent_id");--> statement-breakpoint
CREATE INDEX "notification_recipient_id_created_at_idx" ON "notification" USING btree ("recipient_id","created_at");--> statement-breakpoint
CREATE INDEX "notification_actor_id_idx" ON "notification" USING btree ("actor_id");--> statement-breakpoint
CREATE INDEX "notification_post_id_idx" ON "notification" USING btree ("post_id");--> statement-breakpoint
CREATE INDEX "notification_comment_id_idx" ON "notification" USING btree ("comment_id");--> statement-breakpoint
CREATE INDEX "post_category_id_idx" ON "post" USING btree ("category_id");--> statement-breakpoint
CREATE INDEX "series_author_id_idx" ON "series" USING btree ("author_id");--> statement-breakpoint
CREATE INDEX "review_user_id_idx" ON "review" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "review_created_at_id_idx" ON "review" USING btree ("created_at","id");