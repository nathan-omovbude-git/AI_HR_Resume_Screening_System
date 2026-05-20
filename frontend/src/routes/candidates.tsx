import { createFileRoute } from "@tanstack/react-router";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { mockCandidates } from "@/lib/mock-data";
import { Search, MapPin } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/candidates")({
  component: () => (
    <ProtectedRoute>
      <AppShell>
        <CandidatesPage />
      </AppShell>
    </ProtectedRoute>
  ),
});

function CandidatesPage() {
  const [q, setQ] = useState("");
  const filtered = mockCandidates.filter((c) =>
    `${c.name} ${c.title} ${c.matchedSkills.join(" ")}`.toLowerCase().includes(q.toLowerCase())
  );
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Candidates</h1>
        <p className="text-sm text-muted-foreground">All candidates across active jobs.</p>
      </div>
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Search by name, role, skill..." value={q} onChange={(e) => setQ(e.target.value)} className="pl-9" />
      </div>
      <div className="grid gap-3">
        {filtered.map((c) => (
          <Card key={c.id} className="p-5">
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-primary text-sm font-semibold text-primary-foreground shadow-glow">
                {c.name.split(" ").map((n) => n[0]).join("")}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{c.name}</span>
                  {c.demographic.group === "Underrepresented" && (
                    <Badge variant="outline" className="text-[10px]">URG</Badge>
                  )}
                </div>
                <div className="text-xs text-muted-foreground">{c.title}</div>
                <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="h-3 w-3" /> {c.location} · {c.experience} yrs
                </div>
                <div className="mt-3 flex flex-wrap gap-1">
                  {c.matchedSkills.slice(0, 5).map((s) => (
                    <Badge key={s} variant="secondary" className="text-[10px]">{s}</Badge>
                  ))}
                </div>
              </div>
              <div className="w-32 text-right">
                <div className="text-2xl font-semibold text-gradient">
                  {(c.similarity * 100).toFixed(0)}%
                </div>
                <Progress value={c.similarity * 100} className="mt-1 h-1" />
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
