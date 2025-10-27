CREATE TABLE "management_persons" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"kyc_id" uuid NOT NULL,
	"full_name" text NOT NULL,
	"position" text,
	"document_number" text,
	"date_of_birth" varchar(20),
	"type" text,
	"country_of_birth" text,
	"country_of_residence" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "shareholders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"kyc_id" uuid NOT NULL,
	"full_name" text NOT NULL,
	"document_number" text,
	"date_of_birth" varchar(20),
	"professional_activity" text,
	"country_of_birth" text,
	"country_of_residence" text,
	"ownership_percentage" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ubos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"kyc_id" uuid NOT NULL,
	"full_name" text NOT NULL,
	"nationality" text,
	"document_number" text,
	"position" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "management_persons" ADD CONSTRAINT "management_persons_kyc_id_kyc_documents_id_fk" FOREIGN KEY ("kyc_id") REFERENCES "public"."kyc_documents"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shareholders" ADD CONSTRAINT "shareholders_kyc_id_kyc_documents_id_fk" FOREIGN KEY ("kyc_id") REFERENCES "public"."kyc_documents"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ubos" ADD CONSTRAINT "ubos_kyc_id_kyc_documents_id_fk" FOREIGN KEY ("kyc_id") REFERENCES "public"."kyc_documents"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "mp_kyc_id_idx" ON "management_persons" USING btree ("kyc_id");--> statement-breakpoint
CREATE INDEX "sh_kyc_id_idx" ON "shareholders" USING btree ("kyc_id");--> statement-breakpoint
CREATE INDEX "ubo_kyc_id_idx" ON "ubos" USING btree ("kyc_id");