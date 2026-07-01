import type {
  JsonObject,
  PromptRenderInput,
  RenderedPrompt,
} from "@/server/ai/types";

function renderTemplate(template: string, variables: JsonObject) {
  return template.replace(
    /\{\{\s*([a-zA-Z0-9_.-]+)\s*\}\}/g,
    (_, key: string) => {
      const value = variables[key];
      return value === undefined || value === null ? "" : String(value);
    },
  );
}

export function renderPrompt(input: PromptRenderInput): RenderedPrompt {
  return {
    systemPrompt: renderTemplate(input.systemPrompt, input.variables),
    developerPrompt: input.developerPrompt
      ? renderTemplate(input.developerPrompt, input.variables)
      : undefined,
    userPrompt: renderTemplate(input.userPromptTemplate, input.variables),
  };
}
