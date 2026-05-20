import { createFileRoute, Link } from "@tanstack/react-router";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { mockJobs, mockCandidates } from "@/lib/mock-data";
import { Briefcase, Users, ShieldCheck, TrendingUp, ArrowRight, Sparkles } from "lucide-react";

export const Route = createFileRoute("/dashboard")({
  component: () => (
    <ProtectedRoute>
      <AppShell>
        <Dashboard />
      </AppShell>
    </ProtectedRoute>
  ),
});

function Dashboard() {
  const totalCandidates = mockJobs.reduce((s, j) => s + j.candidates, 0);
  const totalShortlisted = mockJobs.reduce((s, j) => s + j.shortlisted, 0);
  const avgFairness = (
    mockJobs.reduce((s, j) => s + j.fairnessScore, 0) / mockJobs.length
  ).toFixed(2);

  const stats = [
    { label: "Active jobs", value: mockJobs.filter((j) => j.status === "active").length, icon: Briefcase, trend: "+2 this week" },
    { label: "Candidates screened", value: totalCandidates, icon: Users, trend: "+48 today" },
    { label: "Shortlisted", value: totalShortlisted, icon: TrendingUp, trend: "12% conv." },
    { label: "Avg fairness score", value: avgFairness, icon: ShieldCheck, trend: "Above target" },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Your AI screening pipeline at a glance.</p>
        </div>
        <Link to="/jobs">
          <Button variant="hero" className="gap-2">
            <Sparkles className="h-4 w-4" /> New job
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map(({ label, value, icon: Icon, trend }) => (
          <Card key={label} className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-xs uppercase tracking-wide text-muted-foreground">{label}</div>
                <div className="mt-2 text-3xl font-semibold">{value}</div>
                <div className="mt-1 text-xs text-muted-foreground">{trend}</div>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-primary text-primary-foreground shadow-glow">
                <Icon className="h-5 w-5" />
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="p-6 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold">Active jobs</h2>
            <Link to="/jobs" className="text-sm text-primary hover:underline">
              View all <ArrowRight className="inline h-3 w-3" />
            </Link>
          </div>
          <div className="space-y-3">
            {mockJobs.slice(0, 4).map((job) => (
              <Link
                key={job.id}
                to="/jobs/$jobId"
                params={{ jobId: job.id }}
                className="flex items-center justify-between rounded-lg border border-border p-4 transition-all hover:border-primary/40 hover:bg-accent/40"
              >
                <div>
                  <div className="font-medium">{job.title}</div>
                  <div className="text-xs text-muted-foreground">{job.department} · {job.location}</div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right text-xs">
                    <div className="font-semibold">{job.candidates}</div>
                    <div className="text-muted-foreground">candidates</div>
                  </div>
                  <Badge variant={job.status === "active" ? "default" : "secondary"}>{job.status}</Badge>
                </div>
              </Link>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="mb-4 font-semibold">Top matches today</h2>
          <div className="space-y-4">
            {mockCandidates.slice(0, 4).map((c) => (
              <div key={c.id} className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-primary text-xs font-semibold text-primary-foreground">
                  {c.name.split(" ").map((n) => n[0]).join("")}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium">{c.name}</div>
                  <div className="truncate text-xs text-muted-foreground">{c.title}</div>
                </div>
                <div className="text-sm font-semibold text-gradient">
                  {(c.similarity * 100).toFixed(0)}%
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
