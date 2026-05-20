import type { Candidate } from "@/lib/mock-data";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, X, ShieldAlert, ShieldCheck, MessageSquare } from "lucide-react";
import { toast } from "sonner";

export function CandidateDetail({ candidate }: { candidate: Candidate }) {
  return (
    <Card className="overflow-hidden">
      <div className="bg-gradient-primary p-5 text-primary-foreground">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20 text-base font-semibold backdrop-blur">
            {candidate.name.split(" ").map((n) => n[0]).join("")}
          </div>
          <div>
            <div className="font-semibold">{candidate.name}</div>
            <div className="text-xs opacity-90">{candidate.title}</div>
          </div>
        </div>
        <div className="mt-4 flex items-baseline gap-2">
          <span className="text-3xl font-bold">{(candidate.similarity * 100).toFixed(0)}%</span>
          <span className="text-xs opacity-90">cosine similarity</span>
        </div>
      </div>

      <div className="space-y-5 p-5">
        <section>
          <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            AI Summary
          </div>
          <p className="text-sm leading-relaxed">{candidate.summary}</p>
        </section>

        <section>
          <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Why this match — SHAP attribution
          </div>
          <div className="space-y-2">
            {candidate.explanation.map((e) => (
              <div key={e.section}>
                <div className="mb-1 flex justify-between text-xs">
                  <span>{e.section}</span>
                  <span className="font-medium">{(e.contribution * 100).toFixed(0)}%</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full bg-gradient-primary"
                    style={{ width: `${e.contribution * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Highlights
          </div>
          <ul className="space-y-1.5">
            {candidate.highlights.map((h) => (
              <li key={h} className="flex gap-2 text-sm">
                <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-success" />
                <span>{h}</span>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Skills coverage
          </div>
          <div className="flex flex-wrap gap-1.5">
            {candidate.matchedSkills.map((s) => (
              <Badge key={s} className="bg-success/15 text-success-foreground border-success/30">
                <span className="text-success">{s}</span>
              </Badge>
            ))}
            {candidate.missingSkills.map((s) => (
              <Badge key={s} variant="outline" className="text-muted-foreground line-through">
                {s}
              </Badge>
            ))}
          </div>
        </section>

        <section className="rounded-lg border border-border bg-muted/40 p-3">
          <div className="flex items-center gap-2 text-xs">
            {candidate.demographic.group === "Underrepresented" ? (
              <ShieldAlert className="h-4 w-4 text-warning" />
            ) : (
              <ShieldCheck className="h-4 w-4 text-success" />
            )}
            <span className="font-medium">Fairness signal:</span>
            <span className="text-muted-foreground">
              {candidate.demographic.group} group · counted for parity check
            </span>
          </div>
        </section>

        <div className="flex gap-2 pt-2">
          <Button
            variant="hero"
            className="flex-1"
            onClick={() => toast.success(`${candidate.name} approved`)}
          >
            <Check className="h-4 w-4" /> Approve
          </Button>
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => toast(`${candidate.name} rejected`)}
          >
            <X className="h-4 w-4" /> Reject
          </Button>
          <Button variant="outline" size="icon" aria-label="Feedback">
            <MessageSquare className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
