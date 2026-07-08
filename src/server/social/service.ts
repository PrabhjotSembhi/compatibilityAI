import type { Prisma } from "@/generated/prisma/client";
import { AppError } from "@/server/errors";
import type {
  ConversationStartersInput,
  CreateLikeInput,
  CreateSafetyReportInput,
  ListMessagesInput,
  ListSocialQuery,
  SendMessageInput,
  WithdrawLikeInput,
} from "@/server/social/schemas";
import { socialRepository } from "@/server/social/repository";

export const socialService = {
  listLikes(query: ListSocialQuery) {
    return socialRepository.listLikes(query);
  },

  async like(input: CreateLikeInput) {
    if (input.actorUserId === input.targetUserId) {
      throw new AppError("BAD_REQUEST", "A user cannot like themselves.");
    }

    const like = await socialRepository.createOrReactivateLike(input);
    const reverseLike = await socialRepository.findActiveReverseLike(input);

    await socialRepository.createNotification({
      userId: input.targetUserId,
      type: reverseLike ? "social.mutual_like" : "social.like",
      title: reverseLike ? "New mutual like" : "New like",
      body: reverseLike
        ? "You and another user liked each other."
        : "Another user liked your profile.",
      data: toInputJsonObject({
        likeId: like.id,
        actorUserId: input.actorUserId,
        relationshipContextId: input.relationshipContextId,
        mutual: Boolean(reverseLike),
      }),
    });

    return {
      like,
      mutual: Boolean(reverseLike),
      reverseLike,
    };
  },

  withdrawLike(input: WithdrawLikeInput) {
    return socialRepository.withdrawLike(input);
  },

  async sendMessage(input: SendMessageInput) {
    if (input.senderUserId === input.recipientUserId) {
      throw new AppError("BAD_REQUEST", "A user cannot message themselves.");
    }

    const conversation = input.conversationId
      ? await socialRepository.getConversationForUser(
          input.conversationId,
          input.senderUserId,
        )
      : await socialRepository.createConversation(input);

    if (!conversation) {
      throw new AppError(
        "NOT_FOUND",
        "Conversation not found for this sender.",
      );
    }

    const message = await socialRepository.createMessage({
      conversationId: conversation.id,
      senderUserId: input.senderUserId,
      recipientUserId: input.recipientUserId,
      content: input.content,
      metadata: input.metadata,
    });

    await socialRepository.createNotification({
      userId: input.recipientUserId,
      type: "social.message",
      title: "New message",
      body: input.content.slice(0, 180),
      data: toInputJsonObject({
        conversationId: conversation.id,
        messageId: message.id,
        senderUserId: input.senderUserId,
      }),
    });

    return { conversation, message };
  },

  listMessages(input: ListMessagesInput) {
    return socialRepository.listMessages(input);
  },

  listNotifications(query: ListSocialQuery) {
    return socialRepository.listNotifications(query);
  },

  listMatchHistory(query: ListSocialQuery) {
    return socialRepository.listMatchHistory(query);
  },

  async createConversationStarters(input: ConversationStartersInput) {
    const match = input.matchId
      ? await socialRepository.findMatch(input.matchId)
      : null;
    const context = input.context ?? {};
    const seeds = [
      "What is something you are genuinely excited to learn more about right now?",
      "What kind of connection usually brings out your best self?",
      "What is a small habit or ritual that says a lot about how you live?",
      "What is a value you try to protect when life gets busy?",
      "What would make a first conversation feel easy and worthwhile for you?",
      "What is a question you wish more people asked early?",
      "What kind of support do you appreciate most from people close to you?",
      "What is one thing your profile cannot fully capture?",
    ];

    return {
      userId: input.userId,
      matchId: input.matchId,
      relationshipContextId:
        input.relationshipContextId ?? match?.relationshipContextId,
      basis: {
        finalScore: match?.finalScore ?? null,
        context,
      },
      starters: seeds.slice(0, input.count).map((text, index) => ({
        id: `starter_${index + 1}`,
        text,
        source: "deterministic",
      })),
    };
  },

  async createSafetyReport(input: CreateSafetyReportInput) {
    const report = await socialRepository.createSafetyReport(input);

    if (input.subjectUserId) {
      await socialRepository.createNotification({
        userId: input.subjectUserId,
        type: "social.safety_report_created",
        title: "Safety report received",
        body: "A safety report involving your account was created for review.",
        data: toInputJsonObject({
          safetyReportId: report.id,
          reason: input.reason,
        }),
      });
    }

    return report;
  },

  listSafetyReports(query: ListSocialQuery) {
    return socialRepository.listSafetyReports(query);
  },
};

function toInputJsonObject(value: unknown) {
  return value as Prisma.InputJsonObject;
}
