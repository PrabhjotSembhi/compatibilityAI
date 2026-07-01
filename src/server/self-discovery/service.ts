import { renderPrompt } from "@/server/ai/prompt-renderer";
import {
  getSelfDiscoveryDefinition,
  selfDiscoveryDefinitions,
} from "@/server/self-discovery/definitions";
import type {
  CreatePromptPacketInput,
  SaveSelfDiscoveryReportInput,
} from "@/server/self-discovery/schemas";
import { AppError } from "@/server/errors";
import { reportService } from "@/server/domain/reports/service";

export const selfDiscoveryService = {
  listReportTypes() {
    return selfDiscoveryDefinitions.map((definition) => ({
      type: definition.type,
      title: definition.title,
      description: definition.description,
      promptTemplateKey: definition.promptTemplateKey,
      schemaName: definition.schemaName,
      jsonSchema: definition.jsonSchema,
    }));
  },

  createPromptPacket(input: CreatePromptPacketInput) {
    const definition = getSelfDiscoveryDefinition(input.reportType);

    if (!definition) {
      throw new AppError("NOT_FOUND", "Unknown self-discovery report type.");
    }

    const rendered = renderPrompt({
      systemPrompt: definition.systemPrompt,
      developerPrompt: definition.developerPrompt,
      userPromptTemplate: definition.userPromptTemplate,
      variables: {
        userContext: input.userContext,
      },
    });

    const fullPrompt = [
      "SYSTEM:",
      rendered.systemPrompt,
      "",
      "DEVELOPER:",
      rendered.developerPrompt ?? "",
      "",
      "USER:",
      rendered.userPrompt,
      "",
      "JSON SCHEMA:",
      JSON.stringify(definition.jsonSchema, null, 2),
    ].join("\n");

    return {
      reportType: definition.type,
      title: definition.title,
      promptTemplateKey: definition.promptTemplateKey,
      schemaName: definition.schemaName,
      jsonSchema: definition.jsonSchema,
      fullPrompt,
    };
  },

  async saveReport(input: SaveSelfDiscoveryReportInput) {
    const definition = getSelfDiscoveryDefinition(input.reportType);

    if (!definition) {
      throw new AppError("NOT_FOUND", "Unknown self-discovery report type.");
    }

    return reportService.create({
      userId: input.userId,
      profileId: input.profileId,
      relationshipContextId: input.relationshipContextId,
      type: input.reportType,
      title: input.chatgptOutput.title || definition.title,
      status: "READY",
      summary: input.chatgptOutput.summary,
      payload: {
        source: "user_chatgpt",
        promptTemplateKey: definition.promptTemplateKey,
        schemaName: definition.schemaName,
        report: input.chatgptOutput,
      },
      shareable: input.shareable,
    });
  },
};
