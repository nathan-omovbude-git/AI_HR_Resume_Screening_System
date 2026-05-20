import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles, Brain, ShieldCheck, GitBranch, ArrowRight, Zap, Eye, BarChart3 } from "lucide-react";
import heroImg from "@/assets/hero.jpg";
import { useAuth } from "@/lib/auth-context";

export const Route = createFileRoute("/")({
  component: Landing,
});

function Landing() {
  const { user } = useAuth();
  const navigate = useNavigate();
  useEffect(() => {
    if (user) navigate({ to: "/dashboard" });
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <header className="sticky top-0 z-40 glass border-b border-border">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-primary shadow-glow">
              <Sparkles className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-semibold">Lumen Hire</span>
          </Link>
          <nav className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
            <a href="#features" className="hover:text-foreground">Features</a>
            <a href="#how" className="hover:text-foreground">How it works</a>
            <a href="#fairness" className="hover:text-foreground">Fairness</a>
          </nav>
          <div className="flex items-center gap-2">
            <Link to="/auth">
              <Button variant="ghost" size="sm">Sign in</Button>
            </Link>
            <Link to="/auth">
              <Button size="sm" variant="hero">Get started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0 -z-10"
          style={{
            backgroundImage: `url(${heroImg})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            opacity: 0.35,
          }}
        />
        <div className="absolute inset-0 -z-10 bg-gradient-hero" />
        <div className="mx-auto max-w-7xl px-6 py-24 md:py-32">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-3 py-1 text-xs backdrop-blur">
              <Sparkles className="h-3 w-3 text-primary" />
              Sentence-BERT · Explainable AI · Fairness-aware
            </div>
            <h1 className="text-balance text-5xl font-bold tracking-tight md:text-6xl">
              Hire with <span className="text-gradient">clarity</span>, not bias.
            </h1>
            <p className="mt-6 text-lg text-muted-foreground">
              Semantic résumé matching that explains every decision. Multi-source candidate
              profiles, transparent scoring, and fairness metrics built into every shortlist.
            </p>
            <div className="mt-10 flex items-center justify-center gap-3">
              <Link to="/auth">
                <Button size="lg" variant="hero" className="gap-2">
                  Start screening <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <a href="#features">
                <Button size="lg" variant="outline">See features</Button>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="border-t border-border bg-gradient-subtle py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold md:text-4xl">A recruiter's intelligent copilot</h2>
            <p className="mt-3 text-muted-foreground">
              Every shortlist comes with the why, the what, and a fairness check.
            </p>
          </div>
          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {[
              { icon: Brain, title: "Semantic matching", text: "Domain-tuned Sentence-BERT embeddings rank candidates by true meaning, not keyword overlap." },
              { icon: Eye, title: "Explainable AI", text: "SHAP-based attributions show which sections and skills drove each match score." },
              { icon: ShieldCheck, title: "Fairness pipeline", text: "Disparate impact, statistical parity, and rebalancing constraints baked into ranking." },
              { icon: GitBranch, title: "Multi-source profiles", text: "LinkedIn, GitHub, portfolios — unified into a single embedding space." },
              { icon: BarChart3, title: "Skills ontology", text: "Customizable taxonomy maps raw text to domain-aware skill clusters." },
              { icon: Zap, title: "Human-in-the-loop", text: "Approve, reject, and feedback signals refine the model over time." },
            ].map(({ icon: Icon, title, text }) => (
              <div key={title} className="group rounded-2xl border border-border bg-card p-6 shadow-sm transition-all hover:shadow-elegant">
                <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-primary text-primary-foreground shadow-glow">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="font-semibold">{title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How */}
      <section id="how" className="py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid gap-12 md:grid-cols-2 md:items-center">
            <div>
              <h2 className="text-3xl font-bold md:text-4xl">How it works</h2>
              <ol className="mt-8 space-y-6">
                {[
                  ["Upload", "Drop in a job description and résumés, or sync from your ATS."],
                  ["Embed & match", "Domain-tuned SBERT computes cosine similarity across a unified profile space."],
                  ["Explain", "Each match comes with section-level attributions and natural-language reasoning."],
                  ["Rebalance", "Fairness constraints reshape rankings without retraining the model."],
                ].map(([title, text], i) => (
                  <li key={title} className="flex gap-4">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-primary text-sm font-semibold text-primary-foreground shadow-glow">
                      {i + 1}
                    </div>
                    <div>
                      <div className="font-semibold">{title}</div>
                      <div className="text-sm text-muted-foreground">{text}</div>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
            <div id="fairness" className="rounded-3xl border border-border bg-card p-8 shadow-elegant">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <ShieldCheck className="h-4 w-4 text-success" /> Fairness snapshot
              </div>
              <div className="mt-6 space-y-5">
                {[
                  { label: "Disparate impact ratio", value: 0.86, target: 0.8 },
                  { label: "Statistical parity", value: 0.91, target: 0.85 },
                  { label: "Underrepresented in shortlist", value: 0.4, target: 0.4 },
                ].map((m) => (
                  <div key={m.label}>
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{m.label}</span>
                      <span className="font-medium">{m.value.toFixed(2)}</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full bg-gradient-primary"
                        style={{ width: `${m.value * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border bg-gradient-subtle py-20">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h2 className="text-3xl font-bold md:text-4xl">Ready to see it in action?</h2>
          <p className="mt-3 text-muted-foreground">Sign in and explore a live demo dataset.</p>
          <Link to="/auth" className="mt-8 inline-block">
            <Button size="lg" variant="hero" className="gap-2">
              Try Lumen Hire <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      <footer className="border-t border-border py-8 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Lumen Hire · AI-driven résumé screening
      </footer>
    </div>
  );
}
