CREATE TYPE "public"."kyc_file_type" AS ENUM('signature', 'other');--> statement-breakpoint
CREATE TYPE "public"."kyc_service_type" AS ENUM('corporate_accounting', 'immigration', 'company_formation', 'personal_income_tax', 'coworking');--> statement-breakpoint
CREATE TABLE "kyc_document_files" (
	"document_id" uuid NOT NULL,
	"kyc_document_id" uuid NOT NULL,
	"linked_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "kyc_document_files_kyc_document_id_document_id_pk" PRIMARY KEY("kyc_document_id","document_id")
);
--> statement-breakpoint
ALTER TABLE "kyc_documents" ADD COLUMN "services" "kyc_service_type"[] NOT NULL;--> statement-breakpoint
ALTER TABLE "kyc_document_files" ADD CONSTRAINT "kyc_document_files_document_id_client_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."client_documents"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kyc_document_files" ADD CONSTRAINT "kyc_document_files_kyc_document_id_kyc_documents_id_fk" FOREIGN KEY ("kyc_document_id") REFERENCES "public"."kyc_documents"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "document_id_idx" ON "kyc_document_files" USING btree ("document_id");--> statement-breakpoint
CREATE INDEX "kyc_document_id_idx" ON "kyc_document_files" USING btree ("kyc_document_id");