import { createFileRoute, Link } from "@tanstack/react-router";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import {
  ArrowLeft,
  MapPin,
  Sparkles,
  Upload,
  FileText,
  Loader2,
  Trash2,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/jobs/$jobId")({
  component: () => (
    <ProtectedRoute>
      <AppShell>
        <JobDetail />
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
  requirements: string | null;
  required_skills: string[] | null;
  status: string;
  created_at: string;
};

type ResumeRow = {
  id: string;
  candidate_name: string;
  candidate_email: string | null;
  file_name: string | null;
  file_path: string | null;
  status: string;
  created_at: string;
};

function JobDetail() {
  const { jobId } = Route.useParams();
  const { user } = useAuth();
  const [job, setJob] = useState<JobRow | null>(null);
  const [resumes, setResumes] = useState<ResumeRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);

  const load = async () => {
    setLoading(true);
    const [{ data: j }, { data: r }] = await Promise.all([
      supabase.from("jobs").select("*").eq("id", jobId).maybeSingle(),
      supabase
        .from("resumes")
        .select("*")
        .eq("job_id", jobId)
        .order("created_at", { ascending: false }),
    ]);
    setJob((j as JobRow) ?? null);
    setResumes((r as ResumeRow[]) ?? []);
    setLoading(false);
  };

  useEffect(() => {
    if (user) load();
  }, [user, jobId]);

  const removeResume = async (r: ResumeRow) => {
    if (!confirm(`Delete résumé for ${r.candidate_name}?`)) return;
    if (r.file_path) await supabase.storage.from("resumes").remove([r.file_path]);
    const { error } = await supabase.from("resumes").delete().eq("id", r.id);
    if (error) return toast.error(error.message);
    toast.success("Résumé deleted");
    load();
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading...
      </div>
    );
  }
  if (!job) {
    return (
      <div className="space-y-3">
        <Link to="/jobs" className="inline-flex items-center gap-1 text-sm text-muted-foreground">
          <ArrowLeft className="h-3 w-3" /> Back to jobs
        </Link>
        <p>Job not found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link
        to="/jobs"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3 w-3" /> Back to jobs
      </Link>

      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold tracking-tight">{job.title}</h1>
            <Badge variant={job.status === "open" ? "default" : "secondary"}>{job.status}</Badge>
          </div>
          <div className="mt-2 flex flex-wrap gap-4 text-sm text-muted-foreground">
            {job.company && <span>{job.company}</span>}
            {job.location && (
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3" /> {job.location}
              </span>
            )}
          </div>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="hero" className="gap-2">
              <Upload className="h-4 w-4" /> Upload résumé
            </Button>
          </DialogTrigger>
          <UploadResumeDialog
            jobId={job.id}
            onUploaded={() => {
              setOpen(false);
              load();
            }}
          />
        </Dialog>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <Card className="p-5">
          <h2 className="font-semibold">Job description</h2>
          <p className="mt-3 whitespace-pre-wrap text-sm text-muted-foreground">
            {job.description}
          </p>
          {job.requirements && (
            <>
              <h3 className="mt-5 font-semibold">Requirements</h3>
              <p className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">
                {job.requirements}
              </p>
            </>
          )}
          {job.required_skills && job.required_skills.length > 0 && (
            <div className="mt-5">
              <h3 className="font-semibold">Required skills</h3>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {job.required_skills.map((s) => (
                  <Badge key={s} variant="outline">
                    {s}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </Card>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Résumés ({resumes.length})</h2>
            <Button variant="outline" size="sm" className="gap-1" disabled>
              <Sparkles className="h-3 w-3" /> Run match
            </Button>
          </div>
          {resumes.length === 0 ? (
            <Card className="flex flex-col items-center justify-center p-8 text-center">
              <FileText className="mb-2 h-8 w-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                No résumés uploaded yet. Upload one to start matching.
              </p>
            </Card>
          ) : (
            resumes.map((r) => (
              <Card key={r.id} className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="font-medium">{r.candidate_name}</div>
                    {r.candidate_email && (
                      <div className="truncate text-xs text-muted-foreground">
                        {r.candidate_email}
                      </div>
                    )}
                    {r.file_name && (
                      <div className="mt-1 flex items-center gap-1 truncate text-xs text-muted-foreground">
                        <FileText className="h-3 w-3" /> {r.file_name}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Badge variant="secondary" className="text-[10px]">
                      {r.status}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground hover:text-destructive"
                      onClick={() => removeResume(r)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function UploadResumeDialog({
  jobId,
  onUploaded,
}: {
  jobId: string;
  onUploaded: () => void;
}) {
  const { user } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [parsedText, setParsedText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  const onFileChange = async (f: File | null) => {
    setFile(f);
    if (!f) return;
    if (f.size > 10 * 1024 * 1024) {
      toast.error("File must be under 10MB");
      setFile(null);
      return;
    }
    // For text/plain we can preview parsed text; PDFs/DOCX are stored as-is for later parsing
    if (f.type === "text/plain") {
      const text = await f.text();
      setParsedText(text.slice(0, 50000));
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!name.trim()) {
      toast.error("Candidate name is required");
      return;
    }
    if (!file && !parsedText.trim()) {
      toast.error("Provide a résumé file or paste résumé text");
      return;
    }
    setSaving(true);

    let filePath: string | null = null;
    let fileName: string | null = null;
    if (file) {
      const ext = file.name.split(".").pop() ?? "bin";
      const path = `${user.id}/${jobId}/${crypto.randomUUID()}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from("resumes")
        .upload(path, file, { contentType: file.type || "application/octet-stream" });
      if (upErr) {
        setSaving(false);
        toast.error(upErr.message);
        return;
      }
      filePath = path;
      fileName = file.name;
    }

    const { error } = await supabase.from("resumes").insert({
      user_id: user.id,
      job_id: jobId,
      candidate_name: name.trim().slice(0, 200),
      candidate_email: email.trim().slice(0, 255) || null,
      file_path: filePath,
      file_name: fileName,
      parsed_text: parsedText.trim().slice(0, 50000) || null,
      status: parsedText.trim() ? "parsed" : "pending",
    });

    setSaving(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Résumé uploaded");
    setName("");
    setEmail("");
    setParsedText("");
    setFile(null);
    onUploaded();
  };

  return (
    <DialogContent className="max-w-xl">
      <DialogHeader>
        <DialogTitle>Upload résumé</DialogTitle>
        <DialogDescription>
          Upload a PDF/DOCX/TXT file or paste résumé text. Plain text is parsed instantly;
          other formats are stored for the matching pipeline.
        </DialogDescription>
      </DialogHeader>
      <form onSubmit={submit} className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="r-name">Candidate name *</Label>
            <Input
              id="r-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={200}
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="r-email">Email</Label>
            <Input
              id="r-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              maxLength={255}
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="r-file">Résumé file (PDF, DOCX, TXT — max 10MB)</Label>
          <Input
            id="r-file"
            type="file"
            accept=".pdf,.doc,.docx,.txt"
            onChange={(e) => onFileChange(e.target.files?.[0] ?? null)}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="r-text">Parsed résumé text {file?.type !== "text/plain" && "(optional)"}</Label>
          <textarea
            id="r-text"
            value={parsedText}
            onChange={(e) => setParsedText(e.target.value.slice(0, 50000))}
            rows={6}
            placeholder="Paste résumé content here for immediate matching..."
            className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          />
        </div>
        <DialogFooter>
          <Button type="submit" variant="hero" disabled={saving} className="gap-2">
            {saving && <Loader2 className="h-4 w-4 animate-spin" />} Upload
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}
