import type { JsonObject } from "@/server/ai/types";

export type SelfDiscoveryReportType =
  | "personality_analysis"
  | "dating_blueprint"
  | "relationship_strengths"
  | "blind_spots"
  | "communication_style"
  | "love_language"
  | "attachment_style"
  | "coaching_tools";

export type SelfDiscoveryDefinition = {
  type: SelfDiscoveryReportType;
  title: string;
  description: string;
  promptTemplateKey: string;
  schemaName: string;
  jsonSchema: JsonObject;
  systemPrompt: string;
  developerPrompt: string;
  userPromptTemplate: string;
};

const sharedOutputSchema = {
  type: "object",
  additionalProperties: false,
  required: [
    "reportType",
    "title",
    "summary",
    "sections",
    "insights",
    "actionItems",
    "profileUpdates",
    "confidence",
  ],
  properties: {
    reportType: { type: "string" },
    title: { type: "string" },
    summary: { type: "string" },
    sections: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["heading", "body"],
        properties: {
          heading: { type: "string" },
          body: { type: "string" },
        },
      },
    },
    insights: {
      type: "array",
      items: { type: "string" },
    },
    actionItems: {
      type: "array",
      items: { type: "string" },
    },
    profileUpdates: {
      type: "object",
      additionalProperties: true,
    },
    confidence: {
      type: "number",
      minimum: 0,
      maximum: 1,
    },
  },
} satisfies JsonObject;

const systemPrompt =
  "You are an expert relationship self-discovery analyst. Produce direct, respectful, practical insight. Do not diagnose mental health conditions. Do not claim certainty. Ask for professional help when safety or abuse is involved.";

const developerPrompt =
  "Return only valid JSON matching the provided schema. Keep the output useful for a single-user self-discovery product. Do not mention that you are an AI model. Avoid generic filler.";

function userPrompt(reportFocus: string) {
  return `Analyze the following user-provided context for the report focus: ${reportFocus}.

User context:
{{userContext}}

Return a structured report using the requested JSON schema. Include practical insights, clear sections, and profileUpdates that can later update a structured compatibility profile.`;
}

export const selfDiscoveryDefinitions: SelfDiscoveryDefinition[] = [
  {
    type: "personality_analysis",
    title: "Personality Analysis",
    description:
      "A broad read on recurring personality patterns and preferences.",
    promptTemplateKey: "self_discovery.personality_analysis",
    schemaName: "personality_analysis_report",
    jsonSchema: sharedOutputSchema,
    systemPrompt,
    developerPrompt,
    userPromptTemplate: userPrompt("personality analysis"),
  },
  {
    type: "dating_blueprint",
    title: "Dating Blueprint",
    description:
      "A practical relationship-readiness and ideal-partner blueprint.",
    promptTemplateKey: "self_discovery.dating_blueprint",
    schemaName: "dating_blueprint_report",
    jsonSchema: sharedOutputSchema,
    systemPrompt,
    developerPrompt,
    userPromptTemplate: userPrompt("dating blueprint"),
  },
  {
    type: "relationship_strengths",
    title: "Relationship Strengths",
    description:
      "The strengths the user likely brings into close relationships.",
    promptTemplateKey: "self_discovery.relationship_strengths",
    schemaName: "relationship_strengths_report",
    jsonSchema: sharedOutputSchema,
    systemPrompt,
    developerPrompt,
    userPromptTemplate: userPrompt("relationship strengths"),
  },
  {
    type: "blind_spots",
    title: "Blind Spots",
    description:
      "Patterns the user may miss in themselves or repeat unconsciously.",
    promptTemplateKey: "self_discovery.blind_spots",
    schemaName: "blind_spots_report",
    jsonSchema: sharedOutputSchema,
    systemPrompt,
    developerPrompt,
    userPromptTemplate: userPrompt("relationship blind spots"),
  },
  {
    type: "communication_style",
    title: "Communication Style",
    description:
      "How the user tends to express needs, handle tension, and connect.",
    promptTemplateKey: "self_discovery.communication_style",
    schemaName: "communication_style_report",
    jsonSchema: sharedOutputSchema,
    systemPrompt,
    developerPrompt,
    userPromptTemplate: userPrompt("communication style"),
  },
  {
    type: "love_language",
    title: "Love Language",
    description:
      "Likely patterns in how the user gives and receives affection.",
    promptTemplateKey: "self_discovery.love_language",
    schemaName: "love_language_report",
    jsonSchema: sharedOutputSchema,
    systemPrompt,
    developerPrompt,
    userPromptTemplate: userPrompt("love language"),
  },
  {
    type: "attachment_style",
    title: "Attachment Style",
    description:
      "A non-clinical attachment-style reflection for relationships.",
    promptTemplateKey: "self_discovery.attachment_style",
    schemaName: "attachment_style_report",
    jsonSchema: sharedOutputSchema,
    systemPrompt,
    developerPrompt,
    userPromptTemplate: userPrompt("attachment style"),
  },
  {
    type: "coaching_tools",
    title: "Coaching Tools",
    description: "Personalized coaching prompts, exercises, and next actions.",
    promptTemplateKey: "self_discovery.coaching_tools",
    schemaName: "coaching_tools_report",
    jsonSchema: sharedOutputSchema,
    systemPrompt,
    developerPrompt,
    userPromptTemplate: userPrompt("coaching tools"),
  },
];

export function getSelfDiscoveryDefinition(type: SelfDiscoveryReportType) {
  return selfDiscoveryDefinitions.find(
    (definition) => definition.type === type,
  );
}
