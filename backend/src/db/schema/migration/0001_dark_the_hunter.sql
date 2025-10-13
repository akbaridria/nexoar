ALTER TABLE "user-history" RENAME COLUMN "wallet-address" TO "wallet_address";--> statement-breakpoint
ALTER TABLE "user-history" RENAME COLUMN "option-id" TO "option_id";--> statement-breakpoint
ALTER TABLE "user-history" DROP CONSTRAINT "wallet_option_unique";--> statement-breakpoint
ALTER TABLE "user-history" ADD CONSTRAINT "wallet_option_unique" UNIQUE("wallet_address","option_id");