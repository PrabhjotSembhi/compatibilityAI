-- CreateEnum
CREATE TYPE "SocialLikeStatus" AS ENUM ('ACTIVE', 'WITHDRAWN');

-- CreateEnum
CREATE TYPE "SafetyReportStatus" AS ENUM ('OPEN', 'REVIEWING', 'RESOLVED', 'DISMISSED');

-- CreateTable
CREATE TABLE "SocialLike" (
    "id" TEXT NOT NULL,
    "actorUserId" TEXT NOT NULL,
    "targetUserId" TEXT NOT NULL,
    "relationshipContextId" TEXT,
    "matchId" TEXT,
    "status" "SocialLikeStatus" NOT NULL DEFAULT 'ACTIVE',
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SocialLike_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SafetyReport" (
    "id" TEXT NOT NULL,
    "reporterUserId" TEXT NOT NULL,
    "subjectUserId" TEXT,
    "relationshipContextId" TEXT,
    "matchId" TEXT,
    "conversationId" TEXT,
    "reason" TEXT NOT NULL,
    "details" TEXT,
    "evidence" JSONB,
    "status" "SafetyReportStatus" NOT NULL DEFAULT 'OPEN',
    "resolution" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SafetyReport_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SocialLike_actorUserId_targetUserId_relationshipContextId_key" ON "SocialLike"("actorUserId", "targetUserId", "relationshipContextId");

-- CreateIndex
CREATE INDEX "SocialLike_actorUserId_idx" ON "SocialLike"("actorUserId");

-- CreateIndex
CREATE INDEX "SocialLike_targetUserId_idx" ON "SocialLike"("targetUserId");

-- CreateIndex
CREATE INDEX "SocialLike_relationshipContextId_idx" ON "SocialLike"("relationshipContextId");

-- CreateIndex
CREATE INDEX "SocialLike_status_idx" ON "SocialLike"("status");

-- CreateIndex
CREATE INDEX "SafetyReport_reporterUserId_idx" ON "SafetyReport"("reporterUserId");

-- CreateIndex
CREATE INDEX "SafetyReport_subjectUserId_idx" ON "SafetyReport"("subjectUserId");

-- CreateIndex
CREATE INDEX "SafetyReport_relationshipContextId_idx" ON "SafetyReport"("relationshipContextId");

-- CreateIndex
CREATE INDEX "SafetyReport_matchId_idx" ON "SafetyReport"("matchId");

-- CreateIndex
CREATE INDEX "SafetyReport_conversationId_idx" ON "SafetyReport"("conversationId");

-- CreateIndex
CREATE INDEX "SafetyReport_status_idx" ON "SafetyReport"("status");

-- AddForeignKey
ALTER TABLE "SocialLike" ADD CONSTRAINT "SocialLike_actorUserId_fkey" FOREIGN KEY ("actorUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SocialLike" ADD CONSTRAINT "SocialLike_targetUserId_fkey" FOREIGN KEY ("targetUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SocialLike" ADD CONSTRAINT "SocialLike_relationshipContextId_fkey" FOREIGN KEY ("relationshipContextId") REFERENCES "RelationshipContext"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SocialLike" ADD CONSTRAINT "SocialLike_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "Match"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SafetyReport" ADD CONSTRAINT "SafetyReport_reporterUserId_fkey" FOREIGN KEY ("reporterUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SafetyReport" ADD CONSTRAINT "SafetyReport_subjectUserId_fkey" FOREIGN KEY ("subjectUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SafetyReport" ADD CONSTRAINT "SafetyReport_relationshipContextId_fkey" FOREIGN KEY ("relationshipContextId") REFERENCES "RelationshipContext"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SafetyReport" ADD CONSTRAINT "SafetyReport_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "Match"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SafetyReport" ADD CONSTRAINT "SafetyReport_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id") ON DELETE SET NULL ON UPDATE CASCADE;
