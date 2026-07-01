-- CreateEnum
CREATE TYPE "PromptTemplateStatus" AS ENUM ('DRAFT', 'ACTIVE', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "AiRequestStatus" AS ENUM ('SUCCEEDED', 'FAILED');

-- CreateTable
CREATE TABLE "PromptTemplate" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "status" "PromptTemplateStatus" NOT NULL DEFAULT 'DRAFT',
    "defaultModel" TEXT,
    "defaultSchema" JSONB,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PromptTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PromptVersion" (
    "id" TEXT NOT NULL,
    "promptTemplateId" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "systemPrompt" TEXT NOT NULL,
    "developerPrompt" TEXT,
    "userPromptTemplate" TEXT NOT NULL,
    "jsonSchema" JSONB,
    "model" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "changelog" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PromptVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AiUsageEvent" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "promptVersionId" TEXT,
    "provider" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "featureKey" TEXT NOT NULL,
    "status" "AiRequestStatus" NOT NULL,
    "requestId" TEXT,
    "inputTokens" INTEGER,
    "outputTokens" INTEGER,
    "totalTokens" INTEGER,
    "latencyMs" INTEGER,
    "errorCode" TEXT,
    "errorMessage" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AiUsageEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AiRateLimitBucket" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,
    "limit" INTEGER NOT NULL,
    "windowMs" INTEGER NOT NULL,
    "windowEndsAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AiRateLimitBucket_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PromptTemplate_key_key" ON "PromptTemplate"("key");

-- CreateIndex
CREATE UNIQUE INDEX "PromptVersion_promptTemplateId_version_key" ON "PromptVersion"("promptTemplateId", "version");

-- CreateIndex
CREATE INDEX "PromptVersion_promptTemplateId_idx" ON "PromptVersion"("promptTemplateId");

-- CreateIndex
CREATE INDEX "PromptVersion_isActive_idx" ON "PromptVersion"("isActive");

-- CreateIndex
CREATE INDEX "AiUsageEvent_userId_idx" ON "AiUsageEvent"("userId");

-- CreateIndex
CREATE INDEX "AiUsageEvent_promptVersionId_idx" ON "AiUsageEvent"("promptVersionId");

-- CreateIndex
CREATE INDEX "AiUsageEvent_featureKey_idx" ON "AiUsageEvent"("featureKey");

-- CreateIndex
CREATE INDEX "AiUsageEvent_createdAt_idx" ON "AiUsageEvent"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "AiRateLimitBucket_key_key" ON "AiRateLimitBucket"("key");

-- AddForeignKey
ALTER TABLE "PromptVersion" ADD CONSTRAINT "PromptVersion_promptTemplateId_fkey" FOREIGN KEY ("promptTemplateId") REFERENCES "PromptTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiUsageEvent" ADD CONSTRAINT "AiUsageEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiUsageEvent" ADD CONSTRAINT "AiUsageEvent_promptVersionId_fkey" FOREIGN KEY ("promptVersionId") REFERENCES "PromptVersion"("id") ON DELETE SET NULL ON UPDATE CASCADE;
