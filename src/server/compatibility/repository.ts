import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/server/database/prisma";
import type { CompatibilityProfileSnapshot } from "@/server/compatibility/types";

type CompatibilityProfileRecord = Prisma.CompatibilityProfileGetPayload<{
  include: {
    profile: {
      include: {
        personalityProfile: true;
      };
    };
  };
}>;

export const compatibilityRepository = {
  async getActor(input: {
    actorUserId: string;
    actorProfileId?: string;
    relationshipContextId?: string;
  }) {
    const record = await prisma.compatibilityProfile.findFirst({
      where: {
        userId: input.actorUserId,
        profileId: input.actorProfileId,
        relationshipContextId: input.relationshipContextId,
      },
      include: {
        profile: {
          include: {
            personalityProfile: true,
          },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    return record ? toSnapshot(record) : null;
  },

  async listCandidates(input: {
    actorUserId: string;
    relationshipContextId?: string;
    candidateUserIds?: string[];
    candidateProfileIds?: string[];
    take: number;
    includeLimitedProfiles: boolean;
  }) {
    const visibility = input.includeLimitedProfiles
      ? ["DISCOVERABLE", "LIMITED"]
      : ["DISCOVERABLE"];

    const records = await prisma.compatibilityProfile.findMany({
      where: {
        userId: {
          not: input.actorUserId,
          in: input.candidateUserIds,
        },
        profileId: {
          in: input.candidateProfileIds,
        },
        relationshipContextId: input.relationshipContextId,
        profile: {
          status: "ACTIVE",
          visibility: {
            in: visibility as never,
          },
        },
      },
      include: {
        profile: {
          include: {
            personalityProfile: true,
          },
        },
      },
      orderBy: [{ updatedAt: "desc" }, { userId: "asc" }],
      take: input.take,
    });

    return records.map(toSnapshot);
  },
};

function toSnapshot(
  record: CompatibilityProfileRecord,
): CompatibilityProfileSnapshot {
  return {
    userId: record.userId,
    profileId: record.profileId,
    relationshipContextId: record.relationshipContextId,
    status: record.profile?.status,
    visibility: record.profile?.visibility,
    city: record.profile?.city,
    country: record.profile?.country,
    languages: record.profile?.languages ?? [],
    attributes: readJsonObject(record.profile?.attributes),
    preferences: readJsonObject(record.profile?.preferences),
    constraints: readJsonObject(record.profile?.constraints),
    features: readJsonObject(record.features),
    values: readJsonObject(record.values),
    interests: readJsonObject(record.interests),
    dealBreakers: readJsonObject(record.dealBreakers),
    embedding: record.embedding,
    personality: record.profile?.personalityProfile
      ? {
          dimensions: readJsonObject(
            record.profile.personalityProfile.dimensions,
          ),
          strengths: readJsonObject(
            record.profile.personalityProfile.strengths,
          ),
          blindSpots: readJsonObject(
            record.profile.personalityProfile.blindSpots,
          ),
          communicationStyle:
            record.profile.personalityProfile.communicationStyle,
          conflictStyle: record.profile.personalityProfile.conflictStyle,
          attachmentStyle: record.profile.personalityProfile.attachmentStyle,
        }
      : null,
  };
}

function readJsonObject(value: Prisma.JsonValue | null | undefined) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  return value as Record<string, unknown>;
}
