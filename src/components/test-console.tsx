"use client";

import {
  Bell,
  FileText,
  Heart,
  History,
  Lightbulb,
  MessageSquare,
  Play,
  Search,
  ShieldAlert,
  Sparkles,
  Stethoscope,
} from "lucide-react";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";

type Endpoint = {
  id: string;
  label: string;
  method: "GET" | "POST" | "PATCH";
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  body?: string;
  query?: string;
};

const sampleActor = "user_001";
const sampleCandidate = "user_002";
const sampleContext = "demo_dating";

const endpoints: Endpoint[] = [
  {
    id: "health",
    label: "Health",
    method: "GET",
    path: "/api/health",
    icon: Stethoscope,
  },
  {
    id: "db-health",
    label: "DB Health",
    method: "GET",
    path: "/api/health/db",
    icon: Stethoscope,
  },
  {
    id: "self-discovery-types",
    label: "Report Types",
    method: "GET",
    path: "/api/self-discovery/report-types",
    icon: Sparkles,
  },
  {
    id: "match-candidates",
    label: "Filter Candidates",
    method: "POST",
    path: "/api/matching/candidates",
    icon: Search,
    body: JSON.stringify(
      {
        actorUserId: sampleActor,
        relationshipContextId: sampleContext,
        limit: 10,
        minimumFinalScore: 50,
      },
      null,
      2,
    ),
  },
  {
    id: "recommendations",
    label: "Recommendations",
    method: "POST",
    path: "/api/matching/recommendations",
    icon: Heart,
    body: JSON.stringify(
      {
        actorUserId: sampleActor,
        relationshipContextId: sampleContext,
        limit: 10,
        minimumFinalScore: 50,
        persistMatches: false,
      },
      null,
      2,
    ),
  },
  {
    id: "compatibility-report",
    label: "Compatibility Report",
    method: "POST",
    path: "/api/matching/reports",
    icon: FileText,
    body: JSON.stringify(
      {
        actorUserId: sampleActor,
        candidateUserId: sampleCandidate,
        relationshipContextId: sampleContext,
        includeAiExplanation: false,
      },
      null,
      2,
    ),
  },
  {
    id: "like",
    label: "Like",
    method: "POST",
    path: "/api/social/likes",
    icon: Heart,
    body: JSON.stringify(
      {
        actorUserId: sampleActor,
        targetUserId: sampleCandidate,
        relationshipContextId: sampleContext,
      },
      null,
      2,
    ),
  },
  {
    id: "likes",
    label: "List Likes",
    method: "GET",
    path: "/api/social/likes",
    query: `userId=${sampleActor}&take=20`,
    icon: Heart,
  },
  {
    id: "message",
    label: "Send Message",
    method: "POST",
    path: "/api/social/messages",
    icon: MessageSquare,
    body: JSON.stringify(
      {
        senderUserId: sampleActor,
        recipientUserId: sampleCandidate,
        relationshipContextId: sampleContext,
        content: "Hey, this is a test message from the console.",
      },
      null,
      2,
    ),
  },
  {
    id: "messages",
    label: "List Messages",
    method: "GET",
    path: "/api/social/messages",
    query: `userId=${sampleActor}&take=20`,
    icon: MessageSquare,
  },
  {
    id: "notifications",
    label: "Notifications",
    method: "GET",
    path: "/api/social/notifications",
    query: `userId=${sampleCandidate}&take=20`,
    icon: Bell,
  },
  {
    id: "match-history",
    label: "Match History",
    method: "GET",
    path: "/api/social/match-history",
    query: `userId=${sampleActor}&take=20`,
    icon: History,
  },
  {
    id: "starters",
    label: "Conversation Starters",
    method: "POST",
    path: "/api/social/conversation-starters",
    icon: Lightbulb,
    body: JSON.stringify(
      {
        userId: sampleActor,
        relationshipContextId: sampleContext,
        count: 5,
      },
      null,
      2,
    ),
  },
  {
    id: "safety",
    label: "Safety Report",
    method: "POST",
    path: "/api/social/safety",
    icon: ShieldAlert,
    body: JSON.stringify(
      {
        reporterUserId: sampleActor,
        subjectUserId: sampleCandidate,
        relationshipContextId: sampleContext,
        reason: "test_report",
        details: "Testing the safety report workflow.",
      },
      null,
      2,
    ),
  },
];

export function TestConsole() {
  const [selectedId, setSelectedId] = useState(endpoints[0].id);
  const [body, setBody] = useState(endpoints[0].body ?? "");
  const [query, setQuery] = useState(endpoints[0].query ?? "");
  const [response, setResponse] = useState("Run an endpoint to see output.");
  const [status, setStatus] = useState<"idle" | "running" | "ok" | "error">(
    "idle",
  );

  const selected = useMemo(
    () =>
      endpoints.find((endpoint) => endpoint.id === selectedId) ?? endpoints[0],
    [selectedId],
  );

  function selectEndpoint(endpoint: Endpoint) {
    setSelectedId(endpoint.id);
    setBody(endpoint.body ?? "");
    setQuery(endpoint.query ?? "");
    setResponse("Run an endpoint to see output.");
    setStatus("idle");
  }

  async function runEndpoint() {
    setStatus("running");
    setResponse("Running...");

    try {
      const url = query.trim()
        ? `${selected.path}?${query.trim().replace(/^\?/, "")}`
        : selected.path;
      const init: RequestInit = {
        method: selected.method,
        headers:
          selected.method === "GET"
            ? undefined
            : { "Content-Type": "application/json" },
      };

      if (selected.method !== "GET") {
        init.body = body.trim() ? body : "{}";
      }

      const result = await fetch(url, init);
      const text = await result.text();
      const formatted = safeFormatJson(text);

      setStatus(result.ok ? "ok" : "error");
      setResponse(`HTTP ${result.status} ${result.statusText}\n\n${formatted}`);
    } catch (error) {
      setStatus("error");
      setResponse(error instanceof Error ? error.message : "Unknown error");
    }
  }

  const StatusIcon = selected.icon;

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto grid min-h-screen w-full max-w-7xl grid-cols-1 gap-0 lg:grid-cols-[280px_1fr]">
        <aside className="border-b border-border bg-muted/30 p-4 lg:border-r lg:border-b-0">
          <div className="mb-5">
            <p className="text-xs font-medium text-muted-foreground">
              Internal Test Console
            </p>
            <h1 className="mt-1 text-xl font-semibold">Compatibility AI</h1>
          </div>

          <div className="grid grid-cols-2 gap-2 lg:grid-cols-1">
            {endpoints.map((endpoint) => {
              const Icon = endpoint.icon;
              const active = endpoint.id === selected.id;

              return (
                <button
                  key={endpoint.id}
                  className={`flex h-10 items-center gap-2 rounded-md border px-3 text-left text-sm transition ${
                    active
                      ? "border-foreground bg-background"
                      : "border-border bg-transparent hover:bg-background"
                  }`}
                  onClick={() => selectEndpoint(endpoint)}
                  type="button"
                >
                  <Icon className="size-4" />
                  <span className="truncate">{endpoint.label}</span>
                </button>
              );
            })}
          </div>
        </aside>

        <section className="p-4 sm:p-6">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
            <div className="flex items-center gap-3">
              <div className="flex size-9 items-center justify-center rounded-md border border-border bg-muted">
                <StatusIcon className="size-4" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">
                  {selected.method} {selected.path}
                </p>
                <h2 className="text-2xl font-semibold">{selected.label}</h2>
              </div>
            </div>
            <Button disabled={status === "running"} onClick={runEndpoint}>
              <Play className="size-4" />
              Run
            </Button>
          </div>

          <div className="grid gap-4 xl:grid-cols-2">
            <div className="space-y-4">
              <label className="block">
                <span className="mb-2 block text-sm font-medium">
                  Query string
                </span>
                <input
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring/30"
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Optional, for example userId=user_001&take=20"
                  value={query}
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-medium">
                  JSON body
                </span>
                <textarea
                  className="min-h-[420px] w-full resize-y rounded-md border border-input bg-background p-3 font-mono text-xs leading-5 outline-none focus:ring-2 focus:ring-ring/30"
                  disabled={selected.method === "GET"}
                  onChange={(event) => setBody(event.target.value)}
                  spellCheck={false}
                  value={selected.method === "GET" ? "" : body}
                />
              </label>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Response</span>
                <span
                  className={`rounded-md border px-2 py-1 text-xs ${
                    status === "ok"
                      ? "border-green-700/30 text-green-700"
                      : status === "error"
                        ? "border-red-700/30 text-red-700"
                        : "border-border text-muted-foreground"
                  }`}
                >
                  {status}
                </span>
              </div>
              <pre className="min-h-[494px] overflow-auto rounded-md border border-border bg-muted/30 p-3 text-xs leading-5">
                {response}
              </pre>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function safeFormatJson(text: string) {
  try {
    return JSON.stringify(JSON.parse(text), null, 2);
  } catch {
    return text;
  }
}
