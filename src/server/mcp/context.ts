import { prisma } from "@/server/database/prisma";
import { AppError } from "@/server/errors";

export type McpSession = {
  userId?: string | null;
  scopes?: string;
};

export type McpToolContext = {
  userId: string;
};

export function createToolContext(session: McpSession): McpToolContext {
  if (!session.userId) {
    throw new AppError(
      "UNAUTHORIZED",
      "Connect your Compatibility AI account before using this tool.",
    );
  }

  return {
    userId: session.userId,
  };
}

export async function resolveRelationshipContextId(input: {
  userId: string;
  relationshipType?: string;
}) {
  if (input.relationshipType) {
    const normalized = input.relationshipType.trim();

    const relationshipContext = await prisma.relationshipContext.findFirst({
      where: {
        status: "ACTIVE",
        OR: [
          { slug: { equals: normalized, mode: "insensitive" } },
          { name: { equals: normalized, mode: "insensitive" } },
          { name: { contains: normalized, mode: "insensitive" } },
        ],
      },
      orderBy: { updatedAt: "desc" },
    });

    if (relationshipContext) {
      return relationshipContext.id;
    }
  }

  const activeProfile = await prisma.profile.findFirst({
    where: {
      userId: input.userId,
      status: "ACTIVE",
      relationshipContext: {
        status: "ACTIVE",
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  return activeProfile?.relationshipContextId ?? undefined;
}

export async function resolveActiveProfileId(input: {
  userId: string;
  relationshipContextId?: string;
}) {
  const activeProfile = await prisma.profile.findFirst({
    where: {
      userId: input.userId,
      relationshipContextId: input.relationshipContextId,
      status: "ACTIVE",
    },
    orderBy: { updatedAt: "desc" },
  });

  return activeProfile?.id ?? undefined;
}

export async function getProfileSummariesByUserId(userIds: string[]) {
  if (!userIds.length) {
    return new Map<string, ProfileSummary>();
  }

  const profiles = await prisma.profile.findMany({
    where: {
      userId: {
        in: userIds,
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  const summaries = new Map<string, ProfileSummary>();

  for (const profile of profiles) {
    if (summaries.has(profile.userId)) {
      continue;
    }

    summaries.set(profile.userId, {
      displayName: profile.displayName ?? "Compatibility profile",
      city: profile.city ?? undefined,
      country: profile.country ?? undefined,
    });
  }

  return summaries;
}

export async function resolveMessageRecipient(input: {
  senderUserId: string;
  relationshipContextId?: string;
  recipientName?: string;
  matchRank?: number;
}) {
  if (input.recipientName) {
    const profile = await prisma.profile.findFirst({
      where: {
        userId: {
          not: input.senderUserId,
        },
        relationshipContextId: input.relationshipContextId,
        displayName: {
          contains: input.recipientName.trim(),
          mode: "insensitive",
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    if (profile) {
      return profile.userId;
    }
  }

  const matches = await prisma.match.findMany({
    where: {
      actorUserId: input.senderUserId,
      relationshipContextId: input.relationshipContextId,
    },
    orderBy: [{ finalScore: "desc" }, { updatedAt: "desc" }],
    take: Math.max(input.matchRank ?? 1, 1),
  });

  const selected = matches[(input.matchRank ?? 1) - 1] ?? matches[0];

  if (!selected) {
    throw new AppError(
      "NOT_FOUND",
      "No match was found for this message. Ask for recommendations first.",
    );
  }

  return selected.candidateUserId;
}

type ProfileSummary = {
  displayName: string;
  city?: string;
  country?: string;
};
