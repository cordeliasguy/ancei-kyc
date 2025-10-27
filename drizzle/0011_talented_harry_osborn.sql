ALTER TABLE "kyc_documents" ALTER COLUMN "status" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "kyc_documents" ALTER COLUMN "status" SET DEFAULT 'submitted'::text;--> statement-breakpoint
DROP TYPE "public"."kyc_status";--> statement-breakpoint
CREATE TYPE "public"."kyc_status" AS ENUM('submitted', 'responsible_reviewed', 'compliance_reviewed', 'completed');--> statement-breakpoint
ALTER TABLE "kyc_documents" ALTER COLUMN "status" SET DEFAULT 'submitted'::"public"."kyc_status";--> statement-breakpoint
ALTER TABLE "kyc_documents" ALTER COLUMN "status" SET DATA TYPE "public"."kyc_status" USING "status"::"public"."kyc_status";