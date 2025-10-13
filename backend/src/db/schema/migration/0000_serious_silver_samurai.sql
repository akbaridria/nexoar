CREATE TABLE "user-history" (
	"wallet-address" varchar(40) NOT NULL,
	"option-id" integer NOT NULL,
	CONSTRAINT "wallet_option_unique" UNIQUE("wallet-address","option-id")
);
