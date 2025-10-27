ALTER TABLE "kyc_documents" ADD COLUMN "risk_level" text;--> statement-breakpoint
ALTER TABLE "kyc_documents" ADD COLUMN "namebook_checked" boolean;--> statement-breakpoint
ALTER TABLE "kyc_documents" ADD COLUMN "namebook_date" text;--> statement-breakpoint
ALTER TABLE "kyc_documents" ADD COLUMN "onu_list_checked" boolean;--> statement-breakpoint
ALTER TABLE "kyc_documents" ADD COLUMN "onu_list_date" text;--> statement-breakpoint
ALTER TABLE "kyc_documents" ADD COLUMN "web_checked" boolean;--> statement-breakpoint
ALTER TABLE "kyc_documents" ADD COLUMN "web_date" text;--> statement-breakpoint
ALTER TABLE "kyc_documents" ADD COLUMN "ocic_opinion" text;--> statement-breakpoint
ALTER TABLE "kyc_documents" ADD COLUMN "ocic_comments" text;