-- CreateEnum
CREATE TYPE "CampaignType" AS ENUM ('WEB', 'SHORTS', 'GAME');

-- CreateEnum
CREATE TYPE "CampaignStatus" AS ENUM ('ACTIVE', 'PAUSED', 'EXHAUSTED', 'ENDED');

-- CreateEnum
CREATE TYPE "EarningSourceType" AS ENUM ('CLICK', 'SUBMISSION', 'CONVERSION');

-- CreateEnum
CREATE TYPE "EarningStatus" AS ENUM ('PENDING', 'CONFIRMED', 'CANCELED', 'PAID');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "platform_settings" (
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "platform_settings_pkey" PRIMARY KEY ("key")
);

-- CreateTable
CREATE TABLE "campaigns" (
    "id" TEXT NOT NULL,
    "advertiser_id" TEXT NOT NULL,
    "type" "CampaignType" NOT NULL DEFAULT 'WEB',
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "target_url" TEXT NOT NULL,
    "status" "CampaignStatus" NOT NULL DEFAULT 'ACTIVE',
    "budget_total" BIGINT NOT NULL,
    "budget_reserved" BIGINT NOT NULL DEFAULT 0,
    "budget_spent" BIGINT NOT NULL DEFAULT 0,
    "reward_per_click" BIGINT NOT NULL,
    "platform_fee_bps" INTEGER NOT NULL,
    "fee_amount" BIGINT NOT NULL,
    "pending_days" INTEGER NOT NULL DEFAULT 7,
    "is_test" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "campaigns_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "participations" (
    "id" TEXT NOT NULL,
    "campaign_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "joined_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "participations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tracking_links" (
    "id" TEXT NOT NULL,
    "participation_id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tracking_links_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clicks" (
    "id" TEXT NOT NULL,
    "click_id" TEXT NOT NULL,
    "link_id" TEXT NOT NULL,
    "campaign_id" TEXT NOT NULL,
    "visitor_id" TEXT,
    "ip_hash" TEXT NOT NULL,
    "ua_hash" TEXT NOT NULL,
    "user_agent" TEXT NOT NULL DEFAULT '',
    "referrer" TEXT NOT NULL DEFAULT '',
    "is_valid" BOOLEAN NOT NULL,
    "invalid_reason" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "clicks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "earnings" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "participation_id" TEXT NOT NULL,
    "campaign_id" TEXT NOT NULL,
    "source_type" "EarningSourceType" NOT NULL,
    "source_id" TEXT NOT NULL,
    "amount" BIGINT NOT NULL,
    "status" "EarningStatus" NOT NULL DEFAULT 'PENDING',
    "confirm_after" TIMESTAMP(3) NOT NULL,
    "is_test" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "earnings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_name_key" ON "users"("name");

-- CreateIndex
CREATE INDEX "campaigns_status_idx" ON "campaigns"("status");

-- CreateIndex
CREATE INDEX "campaigns_advertiser_id_idx" ON "campaigns"("advertiser_id");

-- CreateIndex
CREATE UNIQUE INDEX "participations_campaign_id_user_id_key" ON "participations"("campaign_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "tracking_links_participation_id_key" ON "tracking_links"("participation_id");

-- CreateIndex
CREATE UNIQUE INDEX "tracking_links_code_key" ON "tracking_links"("code");

-- CreateIndex
CREATE UNIQUE INDEX "clicks_click_id_key" ON "clicks"("click_id");

-- CreateIndex
CREATE INDEX "clicks_link_id_visitor_id_idx" ON "clicks"("link_id", "visitor_id");

-- CreateIndex
CREATE INDEX "clicks_link_id_ip_hash_ua_hash_created_at_idx" ON "clicks"("link_id", "ip_hash", "ua_hash", "created_at");

-- CreateIndex
CREATE INDEX "earnings_user_id_status_idx" ON "earnings"("user_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "earnings_source_type_source_id_key" ON "earnings"("source_type", "source_id");

-- AddForeignKey
ALTER TABLE "campaigns" ADD CONSTRAINT "campaigns_advertiser_id_fkey" FOREIGN KEY ("advertiser_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "participations" ADD CONSTRAINT "participations_campaign_id_fkey" FOREIGN KEY ("campaign_id") REFERENCES "campaigns"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "participations" ADD CONSTRAINT "participations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tracking_links" ADD CONSTRAINT "tracking_links_participation_id_fkey" FOREIGN KEY ("participation_id") REFERENCES "participations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clicks" ADD CONSTRAINT "clicks_link_id_fkey" FOREIGN KEY ("link_id") REFERENCES "tracking_links"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clicks" ADD CONSTRAINT "clicks_campaign_id_fkey" FOREIGN KEY ("campaign_id") REFERENCES "campaigns"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "earnings" ADD CONSTRAINT "earnings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "earnings" ADD CONSTRAINT "earnings_participation_id_fkey" FOREIGN KEY ("participation_id") REFERENCES "participations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "earnings" ADD CONSTRAINT "earnings_campaign_id_fkey" FOREIGN KEY ("campaign_id") REFERENCES "campaigns"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
