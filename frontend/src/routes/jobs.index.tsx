import { createFileRoute, Link } from "@tanstack/react-router";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useAuth } from "@/lib/auth-context";
import { Plus, Search, MapPin, Briefcase, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/jobs/")({
  component: () => (
    <ProtectedRoute>
      <AppShell>
        <JobsPage />
      </AppShell>
    </ProtectedRoute>
  ),
});

type JobRow = {
  id: string;
  title: string;
  company: string | null;
  location: string | null;
  description: string;
  required_skills: string[] | null;
  status: string;
  created_at: string;
};

// Clean, enterprise-themed mock array matching your CSV feature metrics schema
const INITIAL_MOCK_JOBS: JobRow[] = [
  {
    id: "job-1",
    title: "Graduate Software Engineer",
    company: "Nthl Media Core",
    location: "Lagos, Nigeria / Hybrid",
    description: "Looking for technical undergrads with strong foundational knowledge in Python, FastAPI, and data structures.",
    required_skills: ["Python", "React", "FastAPI", "TypeScript"],
    status: "open",
    created_at: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: "job-2",
    title: "People Analytics Specialist",
    company: "Enterprise HR Corp",
    location: "Remote",
    description: "Seeking a specialist to optimize recruitment screening pipelines and track algorithmic bias using data analytics tools.",
    required_skills: ["Data Analytics", "Excel", "HR Metrics", "Python"],
    status: "open",
    created_at: new Date(Date.now() - 86400000).toISOString(),
  }
];

function JobsPage() {
  const { user } = useAuth();
  const [q, setQ] = useState("");
  
  // Initialize state directly with local mock array
  const [jobs, setJobs] = useState<JobRow[]>(INITIAL_MOCK_JOBS);
  const [loading, setLoading] = useState(false); // Set to false to bypass infinite loading animations
  const [open, setOpen] = useState(false);

  // Simulates an instantaneous local data refresh
  const load = async () => {
    setLoading(true);
    // Reads directly from current component memory array
    setJobs((prev) => [...prev].sort((a, b) => b.created_at.localeCompare(a.created_at)));
    setLoading(false);
  };

  useEffect(() => {
    if (user) load();
  }, [user]);

  const filtered = jobs.filter((j) =>
    `${j.title} ${j.company ?? ""} ${j.location ?? ""}`.toLowerCase().includes(q.toLowerCase()),
  );

  // Helper function to insert job directly into local component memory state
  const handleAddNewJobLocal = (newJob: JobRow) => {
    setJobs((prev) => [newJob, ...prev]);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Jobs</h1>
          <p className="text-sm text-muted-foreground">
            Post a role and upload résumés to run AI-powered matching.
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="hero" className="gap-2">
              <Plus className="h-4 w-4" /> New job
            </Button>
          </DialogTrigger>
          <NewJobDialog
            onCreated={() => {
              setOpen(false);
              load();
            }}
            onInsertLocal={handleAddNewJobLocal}
          />
        </Dialog>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search jobs..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="pl-9"
        />
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading jobs...
        </div>
      ) : filtered.length === 0 ? (
        <Card className="flex flex-col items-center justify-center p-12 text-center">
          <Briefcase className="mb-3 h-10 w-10 text-muted-foreground" />
          <h3 className="font-semibold">No jobs yet</h3>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            Create your first job posting. You'll then be able to upload résumés and run
            matching.
          </p>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {filtered.map((job) => (
            <Link key={job.id} to="/jobs/$jobId" params={{ jobId: job.id }}>
              <Card className="group h-full p-6 transition-all hover:shadow-elegant hover:border-primary/40">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold">{job.title}</h3>
                    <div className="mt-1 text-xs text-muted-foreground">
                      {job.company ?? "—"}
                    </div>
                  </div>
                  <Badge variant={job.status === "open" ? "default" : "secondary"}>
                    {job.status}
                  </Badge>
                </div>
                <div className="mt-4 flex flex-wrap gap-4 text-xs text-muted-foreground">
                  {job.location && (
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" /> {job.location}
                    </div>
                  )}
                </div>
                {job.required_skills && job.required_skills.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1">
                    {job.required_skills.slice(0, 5).map((s) => (
                      <Badge key={s} variant="outline" className="text-[10px]">
                        {s}
                      </Badge>
                    ))}
                  </div>
                )}
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

interface NewJobDialogProps {
  onCreated: () => void;
  onInsertLocal: (newJob: JobRow) => void;
}

function NewJobDialog({ onCreated, onInsertLocal }: NewJobDialogProps) {
  const { user } = useAuth();
  const [title, setTitle] = useState("");
  const [company, setCompany] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [requirements, setRequirements] = useState("");
  const [skills, setSkills] = useState("");
  const [saving, setSaving] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!title.trim() || !description.trim()) {
      toast.error("Title and description are required");
      return;
    }
    
    setSaving(true);
    
    // Simulates an instantaneous database transaction delay
    setTimeout(() => {
      const simulatedNewJob: JobRow = {
        id: `mock-job-${Date.now()}`,
        title: title.trim().slice(0, 200),
        company: company.trim().slice(0, 200) || null,
        location: location.trim().slice(0, 200) || null,
        description: description.trim().slice(0, 10000),
        required_skills: skills
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
          .slice(0, 30),
        status: "open",
        created_at: new Date().toISOString()
      };

      // Push record directly into the parent component's active memory array
      onInsertLocal(simulatedNewJob);
      
      setSaving(false);
      toast.success("Job posting created successfully (Cached)");
      
      // Reset dialog inputs
      setTitle("");
      setCompany("");
      setLocation("");
      setDescription("");
      setRequirements("");
      setSkills("");
      onCreated();
    }, 400);
  };

  return (
    <DialogContent className="max-w-xl">
      <DialogHeader>
        <DialogTitle>New job posting</DialogTitle>
        <DialogDescription>
          Add a job description. The text will be embedded for résumé matching.
        </DialogDescription>
      </DialogHeader>
      <form onSubmit={submit} className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="j-title">Title *</Label>
            <Input
              id="j-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={200}
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="j-company">Company</Label>
            <Input
              id="j-company"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              maxLength={200}
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="j-location">Location</Label>
          <Input
            id="j-location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            maxLength={200}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="j-desc">Description *</Label>
          <Textarea
            id="j-desc"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={5}
            maxLength={10000}
            required
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="j-req">Requirements</Label>
          <Textarea
            id="j-req"
            value={requirements}
            onChange={(e) => setRequirements(e.target.value)}
            rows={3}
            maxLength={10000}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="j-skills">Required skills (comma separated)</Label>
          <Input
            id="j-skills"
            value={skills}
            onChange={(e) => setSkills(e.target.value)}
            placeholder="React, TypeScript, Node.js"
          />
        </div>
        <DialogFooter>
          <Button type="submit" variant="hero" disabled={saving} className="gap-2">
            {saving && <Loader2 className="h-4 w-4 animate-spin" />} Create job
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}
