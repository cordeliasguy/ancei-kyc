ALTER TABLE "user" ALTER COLUMN "role" SET DEFAULT 'responsible';--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "agency_id" uuid;--> statement-breakpoint
ALTER TABLE "user" ADD CONSTRAINT "user_agency_id_agencies_id_fk" FOREIGN KEY ("agency_id") REFERENCES "public"."agencies"("id") ON DELETE cascade ON UPDATE no action;