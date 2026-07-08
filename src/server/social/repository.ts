import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/server/database/prisma";
import type {
  CreateLikeInput,
  CreateSafetyReportInput,
  ListMessagesInput,
  ListSocialQuery,
  SendMessageInput,
  WithdrawLikeInput,
} from "@/server/social/schemas";

export const socialRepository = {
  listLikes(query: ListSocialQuery) {
    return prisma.socialLike.findMany({
      orderBy: { createdAt: "desc" },
      take: query.take,
      where: {
        relationshipContextId: query.relationshipContextId,
        status: query.status as never,
        OR: query.userId
          ? [{ actorUserId: query.userId }, { targetUserId: query.userId }]
          : undefined,
      },
    });
  },

  async createOrReactivateLike(input: CreateLikeInput) {
    const existing = await prisma.socialLike.findFirst({
      where: {
        actorUserId: input.actorUserId,
        targetUserId: input.targetUserId,
        relationshipContextId: input.relationshipContextId,
      },
    });

    if (existing) {
      return prisma.socialLike.update({
        where: { id: existing.id },
        data: {
          status: "ACTIVE",
          matchId: input.matchId,
          metadata: input.metadata,
        },
      });
    }

    return prisma.socialLike.create({
      data: input,
    });
  },

  withdrawLike(input: WithdrawLikeInput) {
    return prisma.socialLike.updateMany({
      where: {
        actorUserId: input.actorUserId,
        targetUserId: input.targetUserId,
        relationshipContextId: input.relationshipContextId,
        status: "ACTIVE",
      },
      data: {
        status: "WITHDRAWN",
      },
    });
  },

  findActiveReverseLike(input: CreateLikeInput) {
    return prisma.socialLike.findFirst({
      where: {
        actorUserId: input.targetUserId,
        targetUserId: input.actorUserId,
        relationshipContextId: input.relationshipContextId,
        status: "ACTIVE",
      },
    });
  },

  createConversation(input: SendMessageInput) {
    return prisma.conversation.create({
      data: {
        userId: input.senderUserId,
        profileId: input.profileId,
        relationshipContextId: input.relationshipContextId,
        topic: "Social conversation",
        metadata: toInputJsonObject({
          participantUserIds: [input.senderUserId, input.recipientUserId],
          matchId: input.matchId,
        }),
      },
    });
  },

  getConversationForUser(conversationId: string, userId: string) {
    return prisma.conversation.findFirst({
      where: {
        id: conversationId,
        OR: [
          { userId },
          {
            metadata: {
              path: ["participantUserIds"],
              array_contains: userId,
            },
          },
        ],
      },
    });
  },

  createMessage(input: {
    conversationId: string;
    senderUserId: string;
    recipientUserId: string;
    content: string;
    metadata?: Prisma.InputJsonObject;
  }) {
    return prisma.conversationMessage.create({
      data: {
        conversationId: input.conversationId,
        role: "USER",
        content: input.content,
        metadata: toInputJsonObject({
          ...input.metadata,
          senderUserId: input.senderUserId,
          recipientUserId: input.recipientUserId,
        }),
      },
    });
  },

  listMessages(input: ListMessagesInput) {
    return prisma.conversation.findMany({
      include: { messages: { orderBy: { createdAt: "asc" } } },
      orderBy: { updatedAt: "desc" },
      take: input.take,
      where: {
        id: input.conversationId,
        relationshipContextId: input.relationshipContextId,
        OR: [
          { userId: input.userId },
          {
            metadata: {
              path: ["participantUserIds"],
              array_contains: input.userId,
            },
          },
        ],
      },
    });
  },

  listMatchHistory(query: ListSocialQuery) {
    return prisma.match.findMany({
      include: {
        socialLikes: true,
        safetyReports: true,
      },
      orderBy: { updatedAt: "desc" },
      take: query.take,
      where: {
        relationshipContextId: query.relationshipContextId,
        status: query.status as never,
        OR: query.userId
          ? [{ actorUserId: query.userId }, { candidateUserId: query.userId }]
          : undefined,
      },
    });
  },

  findMatch(matchId: string) {
    return prisma.match.findUnique({
      where: { id: matchId },
    });
  },

  listNotifications(query: ListSocialQuery) {
    return prisma.notification.findMany({
      orderBy: { createdAt: "desc" },
      take: query.take,
      where: {
        userId: query.userId,
        status: query.status as never,
      },
    });
  },

  createNotification(input: {
    userId: string;
    type: string;
    title: string;
    body?: string;
    data?: Prisma.InputJsonObject;
  }) {
    return prisma.notification.create({
      data: {
        userId: input.userId,
        type: input.type,
        title: input.title,
        body: input.body,
        data: input.data,
      },
    });
  },

  listSafetyReports(query: ListSocialQuery) {
    return prisma.safetyReport.findMany({
      orderBy: { createdAt: "desc" },
      take: query.take,
      where: {
        relationshipContextId: query.relationshipContextId,
        status: query.status as never,
        OR: query.userId
          ? [{ reporterUserId: query.userId }, { subjectUserId: query.userId }]
          : undefined,
      },
    });
  },

  createSafetyReport(input: CreateSafetyReportInput) {
    return prisma.safetyReport.create({
      data: input,
    });
  },
};

function toInputJsonObject(value: unknown) {
  return value as Prisma.InputJsonObject;
}
