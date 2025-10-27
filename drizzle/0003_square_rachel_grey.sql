ALTER TABLE "agencies" ALTER COLUMN "created_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "client_documents" ALTER COLUMN "uploaded_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "clients" ALTER COLUMN "created_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "client_documents" ADD COLUMN "type" text NOT NULL;--> statement-breakpoint
ALTER TABLE "client_documents" ADD COLUMN "size" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "client_documents" ADD COLUMN "expires_at" timestamp NOT NULL;