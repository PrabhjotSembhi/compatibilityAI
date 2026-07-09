"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { useState } from "react";

export default function ConsentPage() {
  return (
    <Suspense fallback={null}>
      <ConsentContent />
    </Suspense>
  );
}

function ConsentContent() {
  const searchParams = useSearchParams();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const clientId = searchParams.get("client_id") ?? "ChatGPT";
  const scope = searchParams.get("scope") ?? "";
  const consentCode = searchParams.get("consent_code");

  async function decide(accept: boolean) {
    setBusy(true);
    setError("");

    const response = await fetch("/api/auth/oauth2/consent", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        accept,
        consent_code: consentCode,
      }),
    });

    const body = await response.json().catch(() => null);

    if (!response.ok || !body?.redirectURI) {
      setBusy(false);
      setError(body?.message ?? body?.error?.message ?? "Consent failed.");
      return;
    }

    window.location.href = body.redirectURI;
  }

  return (
    <main className="min-h-screen bg-background px-6 py-12 text-foreground">
      <section className="mx-auto flex w-full max-w-md flex-col gap-6">
        <div>
          <p className="text-sm text-muted-foreground">Compatibility AI</p>
          <h1 className="text-2xl font-semibold">Connect ChatGPT</h1>
        </div>

        <div className="rounded-md border p-4">
          <p className="text-sm text-muted-foreground">App</p>
          <p className="font-medium">{clientId}</p>
          <p className="mt-4 text-sm text-muted-foreground">Access</p>
          <p className="font-mono text-sm">{scope || "openid profile email"}</p>
        </div>

        {error ? <p className="text-sm text-destructive">{error}</p> : null}

        <div className="flex gap-3">
          <button
            className="h-10 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground disabled:opacity-60"
            disabled={busy}
            onClick={() => decide(true)}
            type="button"
          >
            Allow
          </button>
          <button
            className="h-10 rounded-md border px-4 text-sm font-medium disabled:opacity-60"
            disabled={busy}
            onClick={() => decide(false)}
            type="button"
          >
            Deny
          </button>
        </div>
      </section>
    </main>
  );
}
