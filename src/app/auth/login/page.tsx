"use client";

import { FormEvent, useState } from "react";

export default function LoginPage() {
  const [mode, setMode] = useState<"sign-in" | "sign-up">("sign-in");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");

    const endpoint =
      mode === "sign-in"
        ? "/api/auth/sign-in/email"
        : "/api/auth/sign-up/email";
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        email,
        password,
        ...(mode === "sign-up" ? { name } : {}),
      }),
    });

    const body = await response.json().catch(() => null);

    if (!response.ok) {
      setBusy(false);
      setError(
        body?.message ?? body?.error?.message ?? "Authentication failed.",
      );
      return;
    }

    if (body?.url) {
      window.location.href = body.url;
      return;
    }

    if (body?.redirect && body?.url) {
      window.location.href = body.url;
      return;
    }

    window.location.href = "/";
  }

  return (
    <main className="min-h-screen bg-background px-6 py-12 text-foreground">
      <section className="mx-auto flex w-full max-w-sm flex-col gap-6">
        <div>
          <p className="text-sm text-muted-foreground">Compatibility AI</p>
          <h1 className="text-2xl font-semibold">
            {mode === "sign-in" ? "Sign in" : "Create account"}
          </h1>
        </div>

        <form className="flex flex-col gap-4" onSubmit={submit}>
          {mode === "sign-up" ? (
            <label className="flex flex-col gap-2 text-sm">
              Name
              <input
                className="h-10 rounded-md border px-3"
                minLength={1}
                onChange={(event) => setName(event.target.value)}
                required
                value={name}
              />
            </label>
          ) : null}

          <label className="flex flex-col gap-2 text-sm">
            Email
            <input
              className="h-10 rounded-md border px-3"
              onChange={(event) => setEmail(event.target.value)}
              required
              type="email"
              value={email}
            />
          </label>

          <label className="flex flex-col gap-2 text-sm">
            Password
            <input
              className="h-10 rounded-md border px-3"
              minLength={8}
              onChange={(event) => setPassword(event.target.value)}
              required
              type="password"
              value={password}
            />
          </label>

          {error ? <p className="text-sm text-destructive">{error}</p> : null}

          <button
            className="h-10 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground disabled:opacity-60"
            disabled={busy}
            type="submit"
          >
            {busy ? "Working..." : mode === "sign-in" ? "Sign in" : "Create"}
          </button>
        </form>

        <button
          className="text-left text-sm text-muted-foreground"
          onClick={() => setMode(mode === "sign-in" ? "sign-up" : "sign-in")}
          type="button"
        >
          {mode === "sign-in"
            ? "Need an account? Create one"
            : "Already have an account? Sign in"}
        </button>
      </section>
    </main>
  );
}
