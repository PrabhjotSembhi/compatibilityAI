import { z } from "zod";

import {
  createToolContext,
  getProfileSummariesByUserId,
  type McpToolContext,
  resolveActiveProfileId,
  resolveMessageRecipient,
  resolveRelationshipContextId,
} from "@/server/mcp/context";
import { matchingService } from "@/server/matching/service";
import {
  selfDiscoveryReportOutputSchema,
  selfDiscoveryReportTypeSchema,
} from "@/server/self-discovery/schemas";
import { selfDiscoveryService } from "@/server/self-discovery/service";
import { socialService } from "@/server/social/service";
import { validateInput } from "@/server/validation";
import { AppError } from "@/server/errors";
import type { McpSession } from "@/server/mcp/context";

type ToolResult = {
  content: Array<{
    type: "text";
    text: string;
  }>;
  structuredContent?: unknown;
};

type ToolDefinition = {
  name: string;
  title: string;
  description: string;
  inputSchema: Record<string, unknown>;
  execute(input: unknown, context: McpToolContext): Promise<ToolResult>;
};

const reportTypeEnum = selfDiscoveryReportTypeSchema.options;

const relationshipTypeProperty = {
  type: "string",
  description:
    "Optional relationship area, such as dating, friendship, networking, or co-founder matching.",
};

const getReportTypesTool: ToolDefinition = {
  name: "get_report_types",
  title: "Get available reports",
  description:
    "List the self-discovery reports a person can create in Compatibility AI. Returns product-facing names only.",
  inputSchema: {
    type: "object",
    properties: {},
    additionalProperties: false,
  },
  async execute() {
    const reportTypes = selfDiscoveryService
      .listReportTypes()
      .map((report) => ({
        type: report.type,
        title: report.title,
        description: report.description,
      }));

    return {
      content: [
        {
          type: "text",
          text: `Available reports: ${reportTypes
            .map((report) => report.title)
            .join(", ")}.`,
        },
      ],
      structuredContent: {
        reportTypes,
      },
    };
  },
};

const createPromptPacketTool: ToolDefinition = {
  name: "create_prompt_packet",
  title: "Prepare self-discovery report",
  description:
    "Internal tool for preparing a self-discovery report. Use the returned internal instructions to generate the finished report in ChatGPT; do not show raw prompts, schemas, or prompt keys to the user.",
  inputSchema: {
    type: "object",
    properties: {
      reportType: {
        type: "string",
        enum: reportTypeEnum,
        description:
          "The kind of self-discovery report the user asked for, such as communication_style or dating_blueprint.",
      },
      userContext: {
        type: "string",
        minLength: 20,
        maxLength: 20000,
        description:
          "The user's own words and relevant conversation context to analyze.",
      },
      debug: {
        type: "boolean",
        default: false,
        description:
          "Only true when the user explicitly asks to inspect the underlying prompt packet.",
      },
    },
    required: ["reportType", "userContext"],
    additionalProperties: false,
  },
  async execute(input) {
    const parsed = validateInput(
      z.object({
        reportType: selfDiscoveryReportTypeSchema,
        userContext: z.string().min(20).max(20000),
        debug: z.boolean().default(false),
      }),
      input,
    );
    const packet = selfDiscoveryService.createPromptPacket({
      reportType: parsed.reportType,
      userContext: parsed.userContext,
    });

    if (parsed.debug) {
      return {
        content: [
          {
            type: "text",
            text: packet.fullPrompt,
          },
        ],
        structuredContent: {
          debug: true,
          promptPacket: packet,
        },
      };
    }

    return {
      content: [
        {
          type: "text",
          text: "Ready to generate the finished report privately. Continue by writing the polished report for the user, then save it.",
        },
      ],
      structuredContent: {
        reportType: packet.reportType,
        title: packet.title,
        privateInstructions: packet.fullPrompt,
        nextStep:
          "Use privateInstructions only as hidden guidance. Do not mention prompts, schemas, prompt packets, tool calls, backend validation, or implementation details to the user. After generating the report, call save_report with the finished report.",
      },
    };
  },
};

const saveReportTool: ToolDefinition = {
  name: "save_report",
  title: "Save finished report",
  description:
    "Save a finished self-discovery report for the authenticated user. The user identity and active profile are resolved automatically.",
  inputSchema: {
    type: "object",
    properties: {
      reportType: {
        type: "string",
        enum: reportTypeEnum,
      },
      relationshipType: relationshipTypeProperty,
      report: {
        type: "object",
        description:
          "The polished structured report generated inside ChatGPT. Do not include raw prompts or schemas.",
      },
      chatgptOutput: {
        type: "object",
        description:
          "Backward-compatible alias for report. Prefer report for new calls.",
      },
      shareable: {
        type: "boolean",
        default: true,
      },
    },
    required: ["reportType"],
    additionalProperties: true,
  },
  async execute(input, context) {
    const parsed = validateInput(
      z
        .object({
          reportType: selfDiscoveryReportTypeSchema,
          relationshipType: z.string().min(1).optional(),
          report: z.unknown().optional(),
          chatgptOutput: z.unknown().optional(),
          shareable: z.boolean().default(true),
        })
        .passthrough(),
      input,
    );
    const report = normalizeSelfDiscoveryReport({
      reportType: parsed.reportType,
      value: parsed.report ?? parsed.chatgptOutput,
    });
    const relationshipContextId = await resolveRelationshipContextId({
      userId: context.userId,
      relationshipType: parsed.relationshipType,
    });
    const profileId = await resolveActiveProfileId({
      userId: context.userId,
      relationshipContextId,
    });
    const saved = await selfDiscoveryService.saveReport({
      userId: context.userId,
      profileId,
      relationshipContextId,
      reportType: parsed.reportType,
      chatgptOutput: report,
      shareable: parsed.shareable,
    });

    return {
      content: [
        {
          type: "text",
          text: `Saved "${saved.title}" to your Compatibility AI profile.`,
        },
      ],
      structuredContent: {
        title: saved.title,
        summary: saved.summary,
        status: saved.status,
        savedAt: saved.createdAt,
      },
    };
  },
};

const getRecommendationsTool: ToolDefinition = {
  name: "get_recommendations",
  title: "Get compatibility recommendations",
  description:
    "Return ranked compatibility recommendations for the authenticated user. User identity, active profile, matching context, and engine defaults are inferred automatically.",
  inputSchema: {
    type: "object",
    properties: {
      limit: {
        type: "integer",
        minimum: 1,
        maximum: 20,
        default: 10,
        description: "How many recommendations to show.",
      },
      minimumCompatibilityScore: {
        type: "number",
        minimum: 0,
        maximum: 100,
        default: 0,
        description: "Optional minimum compatibility score.",
      },
      relationshipType: relationshipTypeProperty,
    },
    additionalProperties: false,
  },
  async execute(input, context) {
    const parsed = validateInput(
      z.object({
        limit: z.number().int().min(1).max(20).default(10),
        minimumCompatibilityScore: z.number().min(0).max(100).default(0),
        relationshipType: z.string().min(1).optional(),
      }),
      input,
    );
    const relationshipContextId = await resolveRelationshipContextId({
      userId: context.userId,
      relationshipType: parsed.relationshipType,
    });
    const actorProfileId = await resolveActiveProfileId({
      userId: context.userId,
      relationshipContextId,
    });
    const results = await matchingService.recommendMatches({
      actorUserId: context.userId,
      actorProfileId,
      relationshipContextId,
      limit: parsed.limit,
      minimumFinalScore: parsed.minimumCompatibilityScore,
      includeLimitedProfiles: false,
      persistMatches: true,
    });
    const profileSummaries = await getProfileSummariesByUserId(
      results.recommendations.map(
        (recommendation) => recommendation.candidateUserId,
      ),
    );
    const recommendations = results.recommendations.map((recommendation) => {
      const profile = profileSummaries.get(recommendation.candidateUserId);
      const explanation = formatExplanation(recommendation.explanation);

      return {
        rank: recommendation.rank,
        name: profile?.displayName ?? `Recommendation ${recommendation.rank}`,
        location: [profile?.city, profile?.country].filter(Boolean).join(", "),
        compatibilityScore: recommendation.finalScore,
        explanation,
      };
    });

    return {
      content: [
        {
          type: "text",
          text: formatRecommendations(recommendations),
        },
      ],
      structuredContent: {
        generatedAt: results.generatedAt,
        recommendations,
      },
    };
  },
};

const sendMessageTool: ToolDefinition = {
  name: "send_message",
  title: "Send message",
  description:
    "Send a message from the authenticated user to a recommended match. The sender and active relationship context are inferred automatically.",
  inputSchema: {
    type: "object",
    properties: {
      content: {
        type: "string",
        minLength: 1,
        maxLength: 4000,
        description: "The message to send.",
      },
      recipientName: {
        type: "string",
        description:
          "Optional visible profile name. If omitted, the latest top match is used.",
      },
      matchRank: {
        type: "integer",
        minimum: 1,
        maximum: 20,
        default: 1,
        description:
          "Optional rank from the latest recommendations, for example 1 for the top match.",
      },
      relationshipType: relationshipTypeProperty,
    },
    required: ["content"],
    additionalProperties: false,
  },
  async execute(input, context) {
    const parsed = validateInput(
      z.object({
        content: z.string().min(1).max(4000),
        recipientName: z.string().min(1).optional(),
        matchRank: z.number().int().min(1).max(20).default(1),
        relationshipType: z.string().min(1).optional(),
      }),
      input,
    );
    const relationshipContextId = await resolveRelationshipContextId({
      userId: context.userId,
      relationshipType: parsed.relationshipType,
    });
    const recipientUserId = await resolveMessageRecipient({
      senderUserId: context.userId,
      relationshipContextId,
      recipientName: parsed.recipientName,
      matchRank: parsed.matchRank,
    });
    const profileId = await resolveActiveProfileId({
      userId: context.userId,
      relationshipContextId,
    });
    const [recipientSummary] = (
      await getProfileSummariesByUserId([recipientUserId])
    ).values();

    await socialService.sendMessage({
      senderUserId: context.userId,
      recipientUserId,
      profileId,
      relationshipContextId,
      content: parsed.content,
      metadata: {
        source: "chatgpt_mcp",
        recipientName: parsed.recipientName,
        matchRank: parsed.matchRank,
      },
    });

    return {
      content: [
        {
          type: "text",
          text: `Message sent to ${recipientSummary?.displayName ?? "your match"}.`,
        },
      ],
      structuredContent: {
        delivered: true,
        recipientName: recipientSummary?.displayName ?? "Your match",
      },
    };
  },
};

export const mcpTools: ToolDefinition[] = [
  getReportTypesTool,
  createPromptPacketTool,
  saveReportTool,
  getRecommendationsTool,
  sendMessageTool,
];

const callToolParamsSchema = z.object({
  name: z.string().min(1),
  arguments: z.unknown().optional(),
});

export function listTools() {
  return {
    tools: mcpTools.map(({ name, title, description, inputSchema }) => ({
      name,
      title,
      description,
      inputSchema,
    })),
  };
}

export async function callTool(params: unknown, session: McpSession) {
  const input = validateInput(callToolParamsSchema, params);
  const tool = mcpTools.find((candidate) => candidate.name === input.name);

  if (!tool) {
    throw new AppError("NOT_FOUND", `Unknown MCP tool: ${input.name}`);
  }

  return tool.execute(input.arguments ?? {}, createToolContext(session));
}

function formatRecommendations(
  recommendations: Array<{
    rank: number;
    name: string;
    location: string;
    compatibilityScore: number;
    explanation: unknown;
  }>,
) {
  if (!recommendations.length) {
    return "No compatible recommendations were found yet.";
  }

  return recommendations
    .map((recommendation) => {
      const location = recommendation.location
        ? ` (${recommendation.location})`
        : "";

      return `${recommendation.rank}. ${recommendation.name}${location}: ${recommendation.compatibilityScore}/100 compatibility. ${formatExplanation(recommendation.explanation)}`;
    })
    .join("\n");
}

function normalizeSelfDiscoveryReport(input: {
  reportType: string;
  value: unknown;
}) {
  if (!input.value || typeof input.value !== "object") {
    throw new AppError(
      "VALIDATION_ERROR",
      "A finished report is required before saving.",
    );
  }

  const report = input.value as Record<string, unknown>;
  const normalized = {
    reportType: readString(report.reportType) ?? input.reportType,
    title: readString(report.title) ?? titleizeReportType(input.reportType),
    summary: readString(report.summary) ?? "Self-discovery report saved.",
    sections: normalizeSections(report.sections),
    insights: normalizeStringArray(report.insights),
    actionItems: normalizeStringArray(report.actionItems),
    profileUpdates: normalizeProfileUpdates(report.profileUpdates),
    confidence: normalizeConfidence(report.confidence),
  };

  return validateInput(selfDiscoveryReportOutputSchema, normalized);
}

function normalizeSections(value: unknown) {
  if (Array.isArray(value)) {
    const sections = value
      .map((section) => {
        if (!section || typeof section !== "object") {
          return null;
        }

        const record = section as Record<string, unknown>;
        const heading =
          readString(record.heading) ??
          readString(record.title) ??
          readString(record.name);
        const body =
          readString(record.body) ??
          readString(record.content) ??
          readString(record.text);

        return heading && body ? { heading, body } : null;
      })
      .filter((section) => section !== null);

    if (sections.length) {
      return sections;
    }
  }

  if (value && typeof value === "object") {
    const sections = Object.entries(value as Record<string, unknown>)
      .map(([heading, body]) => ({
        heading: titleize(heading),
        body: typeof body === "string" ? body : JSON.stringify(body),
      }))
      .filter((section) => section.body);

    if (sections.length) {
      return sections;
    }
  }

  return [
    {
      heading: "Report",
      body: "The report was saved, but no detailed sections were provided.",
    },
  ];
}

function normalizeStringArray(value: unknown) {
  if (Array.isArray(value)) {
    return value
      .map((item) => (typeof item === "string" ? item : JSON.stringify(item)))
      .filter(Boolean);
  }

  if (typeof value === "string") {
    return [value];
  }

  return [];
}

function normalizeProfileUpdates(value: unknown) {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }

  return {};
}

function normalizeConfidence(value: unknown) {
  if (typeof value === "number") {
    return value > 1 ? value / 100 : value;
  }

  if (typeof value === "string") {
    const parsed = Number(value.replace("%", ""));

    if (Number.isFinite(parsed)) {
      return parsed > 1 ? parsed / 100 : parsed;
    }
  }

  return 0.5;
}

function formatExplanation(explanation: unknown) {
  if (
    explanation &&
    typeof explanation === "object" &&
    "summary" in explanation &&
    typeof explanation.summary === "string"
  ) {
    if (explanation.summary.toLowerCase().includes("deterministic")) {
      return "Selected from your compatibility profile, preferences, and shared relationship context.";
    }

    return explanation.summary;
  }

  return "Selected from your compatibility profile, preferences, and shared relationship context.";
}

function readString(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function titleizeReportType(value: string) {
  return titleize(value.replace(/_/g, " "));
}

function titleize(value: string) {
  return value
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}
