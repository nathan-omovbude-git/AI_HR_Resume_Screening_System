import { createFileRoute } from "@tanstack/react-router";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { fairnessMetrics, mockJobs } from "@/lib/mock-data";
import { ShieldCheck, ShieldAlert, Info } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/fairness")({
  component: () => (
    <ProtectedRoute>
      <AppShell>
        <FairnessPage />
      </AppShell>
    </ProtectedRoute>
  ),
});

function FairnessPage() {
  const [minRepresentation, setMinRepresentation] = useState([40]);
  const [enforce, setEnforce] = useState(true);
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Fairness</h1>
        <p className="text-sm text-muted-foreground">Bias monitoring and constraint configuration across the pipeline.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard label="Disparate impact ratio" value={fairnessMetrics.disparateImpact} threshold={0.8} />
        <MetricCard label="Statistical parity" value={fairnessMetrics.statisticalParity} threshold={0.85} />
        <MetricCard label="URG representation" value={0.4} threshold={0.4} format="pct" />
      </div>

      <Card className="p-6">
        <h2 className="mb-4 font-semibold">Pipeline stages</h2>
        <div className="space-y-3">
          {[
            { stage: "1. Data ingestion", desc: "Sensitive attributes detected and partitioned out of embeddings.", status: "ok" },
            { stage: "2. Model inference", desc: "Score distributions monitored across demographic groups.", status: "ok" },
            { stage: "3. Decision output", desc: "Threshold rebalancing applied to hit parity targets.", status: "warn" },
          ].map((s) => (
            <div key={s.stage} className="flex items-start gap-3 rounded-lg border border-border bg-card/50 p-4">
              {s.status === "ok" ? (
                <ShieldCheck className="mt-0.5 h-5 w-5 text-success" />
              ) : (
                <ShieldAlert className="mt-0.5 h-5 w-5 text-warning" />
              )}
              <div className="flex-1">
                <div className="font-medium">{s.stage}</div>
                <div className="text-sm text-muted-foreground">{s.desc}</div>
              </div>
              <Badge variant={s.status === "ok" ? "default" : "secondary"}>
                {s.status === "ok" ? "Healthy" : "Adjusting"}
              </Badge>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="mb-1 font-semibold">Constraints</h2>
        <p className="mb-6 text-sm text-muted-foreground">Reshape final ranking without retraining the model.</p>
        <div className="space-y-6">
          <div>
            <div className="flex items-center justify-between">
              <Label>Minimum URG representation in shortlist</Label>
              <span className="text-sm font-medium">{minRepresentation[0]}%</span>
            </div>
            <Slider value={minRepresentation} onValueChange={setMinRepresentation} min={0} max={60} step={5} className="mt-3" />
            <p className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
              <Info className="h-3 w-3" /> e.g. minimum 4 of 10 shortlisted candidates from underrepresented groups
            </p>
          </div>
          <div className="flex items-center justify-between rounded-lg border border-border bg-muted/30 p-4">
            <div>
              <Label className="font-medium">Enforce on every shortlist</Label>
              <p className="text-xs text-muted-foreground">Re-rank automatically when constraint is violated.</p>
            </div>
            <Switch checked={enforce} onCheckedChange={setEnforce} />
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="mb-4 font-semibold">Fairness by job</h2>
        <div className="space-y-3">
          {mockJobs.map((j) => (
            <div key={j.id} className="flex items-center gap-4">
              <div className="min-w-0 flex-1">
                <div className="font-medium">{j.title}</div>
                <div className="text-xs text-muted-foreground">{j.department}</div>
              </div>
              <div className="w-48">
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full"
                    style={{
                      width: `${j.fairnessScore * 100}%`,
                      background: j.fairnessScore >= 0.8 ? "var(--success)" : "var(--warning)",
                    }}
                  />
                </div>
              </div>
              <div className="w-12 text-right text-sm font-semibold">{j.fairnessScore.toFixed(2)}</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function MetricCard({ label, value, threshold, format }: { label: string; value: number; threshold: number; format?: "pct" }) {
  const ok = value >= threshold;
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs uppercase tracking-wide text-muted-foreground">{label}</div>
          <div className="mt-2 text-3xl font-semibold">
            {format === "pct" ? `${(value * 100).toFixed(0)}%` : value.toFixed(2)}
          </div>
          <div className="mt-1 text-xs text-muted-foreground">Target ≥ {threshold}</div>
        </div>
        <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${ok ? "bg-success/15 text-success" : "bg-warning/15 text-warning"}`}>
          {ok ? <ShieldCheck className="h-5 w-5" /> : <ShieldAlert className="h-5 w-5" />}
        </div>
      </div>
    </Card>
  );
}
