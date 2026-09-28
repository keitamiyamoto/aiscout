-- CreateTable
CREATE TABLE "Lead" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nameKana" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "contactTimes" TEXT[],
    "age" TEXT NOT NULL,
    "prefecture" TEXT NOT NULL,
    "jobCategory" TEXT NOT NULL,
    "employmentType" TEXT NOT NULL,
    "currentIncome" INTEGER NOT NULL,
    "desiredIncome" INTEGER NOT NULL,
    "timing" TEXT NOT NULL,
    "marketValue" INTEGER NOT NULL,
    "topJob" TEXT NOT NULL,
    "answers" JSONB NOT NULL,
    "result" JSONB NOT NULL,
    "engineVersion" INTEGER NOT NULL,
    "interviewRequestedAt" TIMESTAMP(3),
    "interviewMethod" TEXT,
    "interviewNote" TEXT,
    "status" TEXT NOT NULL DEFAULT 'new',
    "memo" TEXT NOT NULL DEFAULT '',
    "utmSource" TEXT,
    "utmMedium" TEXT,
    "utmCampaign" TEXT,
    "userAgent" TEXT,
    "sheetSyncedAt" TIMESTAMP(3),
    "sheetSyncError" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Lead_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Lead_token_key" ON "Lead"("token");

-- CreateIndex
CREATE INDEX "Lead_createdAt_idx" ON "Lead"("createdAt");

-- CreateIndex
CREATE INDEX "Lead_phone_idx" ON "Lead"("phone");

-- CreateIndex
CREATE INDEX "Lead_status_createdAt_idx" ON "Lead"("status", "createdAt");
