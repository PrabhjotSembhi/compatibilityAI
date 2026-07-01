import { selfDiscoveryService } from "@/server/self-discovery/service";

export default function SelfDiscoveryPage() {
  const reportTypes = selfDiscoveryService.listReportTypes();

  return (
    <main className="min-h-screen bg-background px-6 py-10 text-foreground">
      <section className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        <div className="flex flex-col gap-3">
          <p className="text-sm font-medium text-muted-foreground">
            Phase 5 Self-Discovery
          </p>
          <h1 className="text-3xl font-semibold tracking-normal sm:text-4xl">
            ChatGPT-powered self-discovery reports
          </h1>
          <p className="max-w-3xl text-base leading-7 text-muted-foreground">
            The platform generates structured prompt packets. Users run them in
            their own ChatGPT, then paste validated JSON back into the backend
            so reports can be saved without backend AI spend.
          </p>
        </div>

        <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {reportTypes.map((reportType) => (
            <article
              className="rounded-lg border border-border bg-card p-4 text-card-foreground"
              key={reportType.type}
            >
              <h2 className="text-base font-semibold">{reportType.title}</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {reportType.description}
              </p>
              <p className="mt-4 break-words text-xs text-muted-foreground">
                {reportType.promptTemplateKey}
              </p>
            </article>
          ))}
        </section>

        <section className="grid gap-4 lg:grid-cols-3">
          <div className="rounded-lg border border-border bg-card p-4">
            <h2 className="text-sm font-semibold">1. Create Prompt Packet</h2>
            <code className="mt-3 block rounded-md bg-muted p-3 text-xs">
              POST /api/self-discovery/prompt-packet
            </code>
          </div>
          <div className="rounded-lg border border-border bg-card p-4">
            <h2 className="text-sm font-semibold">2. Run In ChatGPT</h2>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              The user pastes the generated packet into their own ChatGPT and
              copies the JSON response.
            </p>
          </div>
          <div className="rounded-lg border border-border bg-card p-4">
            <h2 className="text-sm font-semibold">3. Save JSON Report</h2>
            <code className="mt-3 block rounded-md bg-muted p-3 text-xs">
              POST /api/self-discovery/reports
            </code>
          </div>
        </section>
      </section>
    </main>
  );
}
