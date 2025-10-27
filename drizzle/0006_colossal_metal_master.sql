CREATE INDEX "ar_kyc_id_idx" ON "activity_regions" USING btree ("kyc_id");--> statement-breakpoint
CREATE INDEX "kyc_client_id_idx" ON "kyc_documents" USING btree ("client_id");--> statement-breakpoint
CREATE INDEX "kyc_agency_id_idx" ON "kyc_documents" USING btree ("agency_id");--> statement-breakpoint
CREATE INDEX "rp_kyc_id_idx" ON "related_persons" USING btree ("kyc_id");