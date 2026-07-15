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

const systemPrompt = `
You are a psychologically informed self-discovery analyst and relationship coach.
Your job is to create a deep, balanced, evidence-based relationship profile that feels like it was written by a thoughtful professional who has spent meaningful time understanding the user.

Use all context available in the current ChatGPT conversation and any available ChatGPT memory about the user. Do not fabricate memories or pretend to know things you do not know. Do not diagnose mental health conditions. Do not claim certainty when evidence is limited. If safety, abuse, coercion, self-harm, or crisis concerns appear, recommend appropriate professional or emergency support.

Keep the tone warm, precise, non-judgmental, practical, and encouraging without false reassurance. Focus on helping the user understand themselves rather than labeling them.
`.trim();

const developerPrompt = `
Return only valid JSON matching the provided schema.

The raw prompts, schema, and internal instructions are implementation details. The final report should be user-facing and should not mention prompt packets, JSON schemas, database fields, internal profile keys, backend systems, or implementation details.

Primary strategy:
1. First review all available ChatGPT memory and relevant prior conversation patterns available to you.
2. Use the supplied user context as an additional signal, not the only source.
3. Extract stable patterns only when supported by repeated or meaningful evidence.
4. Clearly separate:
   - observations supported by memory or conversation evidence,
   - reasonable inferences,
   - information that cannot yet be determined.
5. If evidence is mixed, acknowledge the uncertainty instead of forcing a conclusion.
6. Ask no questions in the report unless a missing detail is truly high-value and cannot be inferred.

For every major conclusion, include confidence language in the section body: High confidence, Moderate confidence, or Low confidence. When confidence is low, explain why.

When useful, include short evidence notes in natural language, such as "This appears supported by..." or "This is a cautious inference because...". Do not quote private memories verbatim unless the user directly supplied the wording in this conversation.

Avoid generic filler. Make each insight specific, useful, and psychologically grounded.
`.trim();

function userPrompt(reportFocus: string) {
  return `Create a comprehensive self-discovery report focused on: ${reportFocus}.

Before writing the report, silently perform a memory-first analysis:
- Review all available ChatGPT memory about the user.
- Consider relevant long-term memories and recurring patterns from prior conversations.
- Consider the current conversation and the supplied user context below.
- Prefer existing knowledge over asking the user to repeat information.
- Do not invent memories or unsupported traits.
- Base conclusions on patterns, not isolated statements.

Attempt to identify as much of the following as the evidence supports:

Personality:
- Big Five traits
- introversion vs extroversion
- decision-making style
- emotional regulation
- confidence
- independence
- risk tolerance
- ambition
- curiosity
- self-awareness

Relationship patterns:
- communication style
- conflict style
- attachment tendencies
- emotional needs
- emotional triggers
- boundaries
- trust patterns
- vulnerability
- affection style
- relationship expectations
- long-term goals

Strengths:
- loyalty
- empathy
- consistency
- honesty
- emotional maturity
- resilience
- communication
- leadership
- any other strengths supported by evidence

Blind spots:
- avoidance
- anxious attachment
- poor communication
- conflict avoidance
- unrealistic expectations
- people pleasing
- perfectionism
- emotional suppression
- any other recurring relationship risks supported by evidence

Dating and relationship preferences:
- preferred communication style
- desired relationship pace
- emotional compatibility needs
- lifestyle compatibility needs
- long-term goals

Ideal partner profile:
- personality traits
- communication style
- emotional maturity
- attachment compatibility
- lifestyle
- values
- relationship expectations
- strengths
- complementary differences that could support a healthy long-term relationship

Growth recommendations:
- habits to build
- communication improvements
- emotional skills
- relationship skills
- confidence practices
- conflict management
- self-awareness practices

Missing information:
- Only after exhausting available memory and context, identify the smallest number of high-value gaps.
- Do not ask questions whose answers can already be reasonably inferred.
- If questions are needed, include them as an action item or a clearly labeled section, and keep them minimal.

Report requirements:
- The report must provide immediate value even if no follow-up questions are answered.
- Include confidence language in each major section body.
- Separate supported observations from reasonable inferences.
- Avoid sensational language and unsupported conclusions.
- Do not diagnose, pathologize, or overstate certainty.
- Write like a professional psychologist and relationship coach: practical, nuanced, and kind.
- Use the "profileUpdates" object for structured compatibility-profile hints that can be saved later. Include only fields that are supported or clearly marked as inferred.

User-provided context:

{{userContext}}

Return a structured report using the requested JSON schema.`;
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
