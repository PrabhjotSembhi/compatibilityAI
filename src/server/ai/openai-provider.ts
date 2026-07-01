import { getEnv } from "@/config/env";
import { renderPrompt } from "@/server/ai/prompt-renderer";
import type {
  JsonObject,
  PromptRenderInput,
  StructuredAiResult,
} from "@/server/ai/types";
import { AppError } from "@/server/errors";

type OpenAIStructuredRequest = {
  model: string;
  schemaName: string;
  jsonSchema: JsonObject;
  prompt: PromptRenderInput;
};

function extractText(response: unknown): string | undefined {
  const body = response as {
    output_text?: string;
    output?: Array<{ content?: Array<{ text?: string }> }>;
  };

  if (typeof body.output_text === "string") {
    return body.output_text;
  }

  return body.output
    ?.flatMap((item) => item.content ?? [])
    .find((item) => typeof item.text === "string")?.text;
}

export async function generateOpenAIStructuredOutput(
  input: OpenAIStructuredRequest,
): Promise<StructuredAiResult> {
  const env = getEnv();

  if (!env.OPENAI_API_KEY) {
    throw new AppError(
      "SERVICE_UNAVAILABLE",
      "OpenAI API key is not configured.",
    );
  }

  const startedAt = Date.now();
  const renderedPrompt = renderPrompt(input.prompt);
  const messages = [
    { role: "system", content: renderedPrompt.systemPrompt },
    ...(renderedPrompt.developerPrompt
      ? [{ role: "developer", content: renderedPrompt.developerPrompt }]
      : []),
    { role: "user", content: renderedPrompt.userPrompt },
  ];

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: input.model,
      input: messages,
      text: {
        format: {
          type: "json_schema",
          name: input.schemaName,
          strict: true,
          schema: input.jsonSchema,
        },
      },
    }),
  });

  const responseBody = (await response.json()) as {
    id?: string;
    error?: { code?: string; message?: string };
    usage?: {
      input_tokens?: number;
      output_tokens?: number;
      total_tokens?: number;
    };
  };

  if (!response.ok) {
    throw new AppError(
      response.status === 429 ? "RATE_LIMITED" : "SERVICE_UNAVAILABLE",
      responseBody.error?.message ?? "OpenAI request failed.",
      responseBody.error,
    );
  }

  const rawText = extractText(responseBody);

  if (!rawText) {
    throw new AppError(
      "SERVICE_UNAVAILABLE",
      "OpenAI returned no text output.",
    );
  }

  return {
    provider: "openai",
    model: input.model,
    output: JSON.parse(rawText),
    rawText,
    requestId: responseBody.id,
    inputTokens: responseBody.usage?.input_tokens,
    outputTokens: responseBody.usage?.output_tokens,
    totalTokens: responseBody.usage?.total_tokens,
    latencyMs: Date.now() - startedAt,
  };
}
