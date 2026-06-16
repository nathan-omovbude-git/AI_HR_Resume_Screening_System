import { useState, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Upload, CheckCircle2, XCircle, ShieldAlert, Cpu, Sliders, History, Download } from "lucide-react";
import { jsPDF } from "jspdf";

export const Route = createFileRoute("/candidates")({
  component: () => (
    <AppShell>
      <IntelligentScreeningGateway />
    </AppShell>
  ),
});

// Normalized backend schemas to fix desynchronization anomalies
interface ScreeningResult {
  verdict: {
    shortlisted: number;
    composite_score: number;
    model_certainty: number;
  };
  xai_analysis: {
    detected: string[];
    missing: string[];
  };
}

interface HistoricalRecord {
  id: number;
  candidate_name: string;
  job_title: string;
  overall_score: number;
  model_certainty: number;
  slider_weights: Record<string, number> | string;
  xai_detected: string[] | string;
  xai_missing: string[] | string;
  created_at: string;
}

export function IntelligentScreeningGateway() {
  const [file, setFile] = useState<File | null>(null);
  const [experience, setExperience] = useState<string>("2");
  const [education, setEducation] = useState<string>("BSc"); // Match backend schema mapping exactly
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<ScreeningResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const [history, setHistory] = useState<HistoricalRecord[]>([]);
  const [fetchingHistory, setFetchingHistory] = useState<boolean>(false);

  // Dynamic Parameter Optimization States
  const [wSemantic, setWSemantic] = useState<number>(50);
  const [wExperience, setWExperience] = useState<number>(30);
  const [wEducation, setWEducation] = useState<number>(20);
  const totalWeight = wSemantic + wExperience + wEducation;

  const API_BASE_URL = window.location.hostname === "localhost" ? "http://localhost:8000" : "";

  const fetchEvaluationHistory = async () => {
    setFetchingHistory(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/history`);
      if (response.ok) {
        const data = await response.json();
        setHistory(data);
      }
    } catch (err) {
      console.error("Failed to fetch historical database metrics:", err);
    } finally {
      setFetchingHistory(false);
    }
  };

  useEffect(() => {
    fetchEvaluationHistory();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUploadAndScreen = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError("Please select a physical PDF or TXT file to screen.");
      return;
    }
    if (totalWeight !== 100) {
      setError(`Matrix weights must equal exactly 100%. Currently at ${totalWeight}%.`);
      return;
    }

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("experience_years", experience);
    formData.append("education_level", education);
    formData.append("weight_semantic", wSemantic.toString());
    formData.append("weight_experience", wExperience.toString());
    formData.append("weight_education", wEducation.toString());

    try {
      const response = await fetch(`${API_BASE_URL}/api/screen-resume`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Engine failed to process document.");
      }

      const data: ScreeningResult = await response.json();
      setResult(data);
      fetchEvaluationHistory();
    } catch (err: any) {
      setError(err.message || "Could not reach the screening server.");
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDF = (candidate: any, isFromHistory = false) => {
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

    // 1. Structural Header Accents
    doc.setFillColor(15, 23, 42); 
    doc.rect(0, 0, 210, 38, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.text("LUMEN HIRE AI EVALUATION REPORT", 14, 18);

    doc.setFontSize(9);
    doc.setFont("helvetica", "italic");
    doc.text("Core Infrastructure Framework • Comprehensive XAI Verification Stream", 14, 26);
    doc.text(`System Reference Block ID: #${isFromHistory ? candidate.id : "LIVE-EXEC"}`, 14, 31);

    // Context Parsing Assertions
    const rawName = isFromHistory ? candidate.candidate_name : file?.name || "Unknown_Candidate";
    const name = rawName.split(".")[0].replace(/[_-]/g, " ").toUpperCase();
    const position = isFromHistory ? candidate.job_title : "Backend Software Engineer";
    const finalScore = isFromHistory ? candidate.overall_score : candidate.verdict.composite_score;
    const trackingDate = isFromHistory ? new Date(candidate.created_at).toLocaleDateString() : new Date().toLocaleDateString();
    
    // Safety Array Extractor Fallbacks for Historical SQLite Strings
    const detectedArr = isFromHistory 
      ? (typeof candidate.xai_detected === 'string' ? JSON.parse(candidate.xai_detected) : candidate.xai_detected)
      : candidate.xai_analysis.detected;
    
    const missingArr = isFromHistory 
      ? (typeof candidate.xai_missing === 'string' ? JSON.parse(candidate.xai_missing) : candidate.xai_missing)
      : candidate.xai_analysis.missing;

    // 2. Metadata Profile Matrix Layout
    doc.setTextColor(15, 23, 42);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.text(`Candidate Identifier: ${name}`, 14, 52);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(71, 85, 105);
    doc.text(`Assigned Vector Profile: ${position}`, 14, 59);
    doc.text(`Generation Status: System Verified`, 14, 65);
    doc.text(`Evaluation Timestamp: ${trackingDate}`, 14, 71);
    
    // 3. Float Badge Render
    doc.setFillColor(248, 250, 252);
    doc.rect(145, 47, 51, 26, "F");
    doc.setDrawColor(226, 232, 240);
    doc.rect(145, 47, 51, 26, "S");
    
    doc.setTextColor(79, 70, 229); 
    doc.setFont("helvetica", "bold");
    doc.setFontSize(28);
    doc.text(`${Math.round(finalScore)}%`, 154, 64);
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184);
    doc.text("MATCHING COEFFICIENT", 151, 69);

    let currentY = 82;
    doc.setDrawColor(241, 245, 249);
    doc.line(14, currentY, 196, currentY);
    currentY += 10;

    // 4. Parameter Weight Summary Box
    doc.setFillColor(250, 250, 250);
    doc.rect(14, currentY, 182, 14, "F");
    doc.rect(14, currentY, 182, 14, "S");
    
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(100, 116, 139);
    doc.text("CRITERIA MODEL WEIGHTS UTILIZED DURING MATCH:", 18, currentY + 9);
    
    doc.setFont("helvetica", "mono");
    doc.setTextColor(15, 23, 42);
    
    let parsedWeights = { semantic: wSemantic, experience: wExperience, education: wEducation };
    if (isFromHistory && candidate.slider_weights) {
      parsedWeights = typeof candidate.slider_weights === 'string' ? JSON.parse(candidate.slider_weights) : candidate.slider_weights;
    }
    doc.text(`[Semantic Fit: ${parsedWeights.semantic}%]   [Experience: ${parsedWeights.experience}%]   [Education: ${parsedWeights.education}%]`, 96, currentY + 9);
    
    currentY += 24;

    // 5. Narrative Text Section Block
    doc.setTextColor(15, 23, 42);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("Explainable AI (XAI) Decision Verdict Summary:", 14, currentY);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    doc.setTextColor(51, 65, 85);
    
    const narrativeText = `Candidate vector validation matching sequence processed at an overall composite ratio of ${finalScore}%. The foundational vector weights applied mapped out localized text overlaps inside the target semantic token fields. High-resolution infrastructure token analysis results are tracked down inside the domain evaluation metrics block below.`;
    const splitExplanation = doc.splitTextToSize(narrativeText, 182);
    currentY += 6;
    doc.text(splitExplanation, 14, currentY);
    
    currentY += (splitExplanation.length * 5) + 8;

    // 6. Complete Keyword Ontology Matrix Map (Solves Multi-Line Height Crash)
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    doc.text("Granular Knowledge Domain Ontology Matrix:", 14, currentY);
    currentY += 6;

    doc.setFillColor(250, 250, 250);
    doc.rect(14, currentY, 182, 45, "F");
    doc.setDrawColor(234, 242, 248);
    doc.rect(14, currentY, 182, 45, "S");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(30, 41, 59);
    doc.text("Core Competency Vector Intersections", 18, currentY + 6);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    
    const foundText = "Found Tokens: " + (detectedArr?.length > 0 ? detectedArr.join(", ") : "None detected");
    const splitFound = doc.splitTextToSize(foundText, 174);
    doc.setTextColor(16, 185, 129);
    doc.text(splitFound, 18, currentY + 14);

    // Dynamically scale downward based on found array size to prevent collision
    const missingOffset = currentY + 14 + (splitFound.length * 4.5);
    
    const missingText = "Missing Core Prerequisites: " + (missingArr?.length > 0 ? missingArr.join(", ") : "None missing");
    const splitMissing = doc.splitTextToSize(missingText, 174);
    doc.setTextColor(239, 68, 68);
    doc.text(splitMissing, 18, missingOffset);

    // 7. Footer Stamp Base
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text("LUMEN HIRE PLATFORM INSIGHT AUTOMATION ENGINE • END OF VERIFICATION DOSSIER", 14, 285);

    doc.save(`lumen_comprehensive_audit_${name.toLowerCase().replace(/\s+/g, "_")}.pdf`);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">AI Intelligent Screening Gateway</h1>
        <p className="text-slate-500 mt-2">Upload raw candidate documents to process them against the core technical skills ontology matrix.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1 space-y-6">
          <Card className="shadow-sm border-slate-200 bg-white">
            <CardHeader>
              <CardTitle className="text-lg font-medium text-slate-800">Screening Context</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUploadAndScreen} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="resume-file" className="text-sm font-semibold text-slate-700">Resume Document</Label>
                  <div className="border-2 border-dashed border-slate-300 rounded-lg p-4 text-center cursor-pointer hover:border-indigo-500 transition-colors bg-slate-50/50 relative">
                    <input id="resume-file" type="file" accept=".pdf,.txt" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                    <Upload className="mx-auto h-8 w-8 text-slate-400 mb-2" />
                    <span className="text-xs text-slate-600 block truncate">{file ? `📂 ${file.name}` : "Click or drop PDF / TXT here"}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="experience" className="text-sm font-semibold text-slate-700">Verified Experience (Years)</Label>
                  <Input id="experience" type="number" min="0" max="30" value={experience} onChange={(e) => setExperience(e.target.value)} required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="education" className="text-sm font-semibold text-slate-700">Minimum Education Tier</Label>
                  <select id="education" value={education} onChange={(e) => setEducation(e.target.value)} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring">
                    <option value="BSc">Undergraduate Degree (BSc)</option>
                    <option value="MSc">Masters Degree (MSc)</option>
                    <option value="PhD">PhD Doctorate</option>
                  </select>
                </div>

                <div className="pt-4 border-t border-slate-100 space-y-4">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider">
                    <span className="flex items-center gap-1.5"><Sliders className="h-3.5 w-3.5" /> Decision Matrix Weights</span>
                    <span className={`font-mono text-xs ${totalWeight === 100 ? 'text-emerald-600' : 'text-rose-600'}`}>{totalWeight}/100%</span>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-medium text-slate-600">
                      <span>Semantic Fit Strength</span>
                      <span className="font-mono font-bold">{wSemantic}%</span>
                    </div>
                    <input type="range" min="0" max="100" value={wSemantic} onChange={(e) => setWSemantic(parseInt(e.target.value))} className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600" />
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-medium text-slate-600">
                      <span>Years of Experience</span>
                      <span className="font-mono font-bold">{wExperience}%</span>
                    </div>
                    <input type="range" min="0" max="100" value={wExperience} onChange={(e) => setWExperience(parseInt(e.target.value))} className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600" />
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-medium text-slate-600">
                      <span>Education Credentials</span>
                      <span className="font-mono font-bold">{wEducation}%</span>
                    </div>
                    <input type="range" min="0" max="100" value={wEducation} onChange={(e) => setWEducation(parseInt(e.target.value))} className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600" />
                  </div>
                </div>

                <Button type="submit" className="w-full bg-slate-900 hover:bg-slate-800 text-white font-medium" disabled={loading || totalWeight !== 100}>
                  {loading ? <span className="flex items-center justify-center gap-2"><Cpu className="animate-spin h-4 w-4" /> Analyzing Text Array Layer...</span> : "Execute AI Evaluation"}
                </Button>
              </form>

              {error && (
                <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-md flex gap-2 text-xs items-start border border-red-100">
                  <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2 space-y-6">
          {!result && !loading && (
            <div className="h-full min-h-[400px] border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center text-center p-8 bg-slate-50/30">
              <Cpu className="h-12 w-12 text-slate-300 mb-3" />
              <h3 className="text-base font-medium text-slate-700">Awaiting Evaluation Payload</h3>
              <p className="text-xs text-slate-400 max-w-sm mt-1">Adjust configuration sliders and submit a resume to watch the scores recalculate to your custom formula strategy.</p>
            </div>
          )}

          {loading && (
            <div className="h-full min-h-[400px] border border-slate-100 shadow-sm rounded-xl flex flex-col items-center justify-center p-8 bg-white space-y-4">
              <p className="text-xs text-indigo-600 font-medium tracking-wide uppercase animate-pulse">Running vector space similarity match engines...</p>
            </div>
          )}

          {result && (
            <Card className="shadow-md border-slate-200 bg-white overflow-hidden">
              <div className={`p-5 flex items-center justify-between text-white ${result.verdict.shortlisted ? 'bg-emerald-600' : 'bg-amber-600'}`}>
                <div>
                  <span className="text-xs uppercase tracking-wider font-semibold opacity-75">System Recommendation</span>
                  <h2 className="text-2xl font-bold mt-0.5">{result.verdict.shortlisted ? "✓ Shortlisted for Interview" : "✕ Kept in Talent Pool"}</h2>
                </div>
                <div className="text-right flex items-center gap-4">
                  <div>
                    <span className="text-xs uppercase tracking-wider font-semibold opacity-75">Computed Score</span>
                    <div className="text-3xl font-extrabold tracking-tight mt-0.5">{result.verdict.composite_score}%</div>
                  </div>
                  <Button variant="secondary" size="icon" onClick={() => handleExportPDF(result, false)} className="bg-white/20 hover:bg-white/30 text-white rounded-full">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <CardContent className="p-6 space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm font-medium">
                    <span className="text-slate-700">Random Forest Classifier Certainty</span>
                    <span className="text-slate-900">{result.verdict.model_certainty}%</span>
                  </div>
                  <Progress value={result.verdict.model_certainty} className="h-2 bg-slate-100" />
                </div>

                <hr className="border-slate-100" />

                <div>
                  <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide mb-3">Explainable AI (XAI) Ontology Audit</h3>
                  <div className="border border-slate-100 rounded-lg p-4 bg-slate-50/50 space-y-3">
                    <div className="flex flex-wrap gap-1.5 items-center">
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider w-16">Found:</span>
                      {result.xai_analysis.detected.map((kw) => (
                        <span key={kw} className="text-xs bg-emerald-50 border border-emerald-200 text-emerald-700 font-medium px-2 py-0.5 rounded key={kw}">✓ {kw}</span>
                      ))}
                    </div>
                    <div className="flex flex-wrap gap-1.5 items-center">
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider w-16">Missing:</span>
                      {result.xai_analysis.missing.map((kw) => (
                        <span key={kw} className="text-xs bg-slate-100 border border-slate-200 text-slate-500 px-2 py-0.5 rounded key={kw}">✕ {kw}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* --- RE-INDEXED HISTORY TIMELINE DISPLAY LINE --- */}
      <div className="pt-6 border-t border-slate-200">
        <div className="flex items-center gap-2 mb-4 text-slate-800">
          <History className="h-5 w-5 text-indigo-600" />
          <h2 className="text-xl font-bold tracking-tight">Local Persistent Evaluation Logs</h2>
        </div>

        {fetchingHistory ? (
          <div className="text-xs text-slate-400 tracking-widest animate-pulse p-4">Syncing system relational cache database...</div>
        ) : history.length === 0 ? (
          <div className="border border-dashed border-slate-200 bg-slate-50/50 rounded-xl p-6 text-center text-sm text-slate-400">
            No evaluations indexed inside the local SQLite system database cache yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {history.map((record) => (
              <Card key={record.id} className="p-4 bg-white border-slate-200 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start">
                    <h4 className="font-bold text-sm text-slate-800 truncate max-w-[180px]">{record.candidate_name}</h4>
                    <span className="text-xs font-mono font-extrabold text-indigo-600">{record.overall_score}%</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">{record.job_title} · Cert: {record.model_certainty}%</p>
                </div>
                <Button variant="outline" size="sm" onClick={() => handleExportPDF(record, true)} className="mt-4 gap-2 text-xs border-slate-200 hover:bg-slate-50 text-slate-700">
                  <Download className="h-3 w-3" /> Audit Transcript
                </Button>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
