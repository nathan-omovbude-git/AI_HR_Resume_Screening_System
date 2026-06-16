import { useState, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Upload, CheckCircle2, XCircle, ShieldAlert, Cpu, Sliders, FileText, History, Download } from "lucide-react";
import { jsPDF } from "jspdf";

export const Route = createFileRoute("/candidates")({
  component: () => (
    <AppShell>
      <IntelligentScreeningGateway />
    </AppShell>
  ),
});

interface OntologyDomain {
  detected: string[];
  missing: string[];
  match_ratio: number;
}

interface ScreeningResult {
  candidate_meta: {
    filename: string;
    experience_years: number;
    education_level: string;
  };
  verdict: {
    shortlisted: number;
    score: number;
    confidence: number;
    justification?: string;
  };
  ontology_breakdown: Record<string, OntologyDomain>;
}

interface HistoricalRecord {
  id: number;
  candidate_name: string;
  job_title: string;
  overall_score: number;
  pillar_scores: Record<string, number>;
  slider_weights: Record<string, number>;
  xai_justification: string;
  created_at: string;
}

export function IntelligentScreeningGateway() {
  const [file, setFile] = useState<File | null>(null);
  const [experience, setExperience] = useState<string>("2");
  const [education, setEducation] = useState<string>("Undergraduate");
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<ScreeningResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Historical Logging States
  const [history, setHistory] = useState<HistoricalRecord[]>([]);
  const [fetchingHistory, setFetchingHistory] = useState<boolean>(false);

  // Dynamic Parameter Optimization States (Must sum to 100)
  const [wSemantic, setWSemantic] = useState<number>(50);
  const [wExperience, setWExperience] = useState<number>(30);
  const [wEducation, setWEducation] = useState<number>(20);
  const totalWeight = wSemantic + wExperience + wEducation;

  // ---------------------------------------------------------------------------
  // 🛰️ FETCH HISTORY TIMELINE ASSETS (Milestone #1)
  // ---------------------------------------------------------------------------
  const fetchEvaluationHistory = async () => {
    setFetchingHistory(true);
    try {
      const response = await fetch("http://localhost:8000/api/history");
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

    loading || totalWeight !== 100 ? null : setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("experience_years", experience);
    formData.append("education_level", education);
    formData.append("weight_semantic", wSemantic.toString());
    formData.append("weight_experience", wExperience.toString());
    formData.append("weight_education", wEducation.toString());

    try {
      const response = await fetch("http://localhost:8000/api/screen-resume", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Engine failed to process document.");
      }

      const data: ScreeningResult = await response.json();
      setResult(data);
      
      // Live synchronization loop instant validation (Milestone #2)
      fetchEvaluationHistory();
    } catch (err: any) {
      setError(err.message || "Could not reach the screening server.");
    } finally {
      setLoading(false);
    }
  };

  // ---------------------------------------------------------------------------
  // 📄 ENGINE COMPILATION: HIGH-INSIGHT AUTOMATED AUDIT TRANSCRIPT
  // ---------------------------------------------------------------------------
  const handleExportPDF = (candidate: any, isFromHistory = false) => {
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

    // 1. Top Core Accent Plate Banner (Navy)
    doc.setFillColor(15, 23, 42); 
    doc.rect(0, 0, 210, 38, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.text("LUMEN HIRE AI EVALUATION REPORT", 14, 18);

    doc.setFontSize(9);
    doc.setFont("helvetica", "italic");
    doc.setFillColor(99, 102, 241);
    doc.text("Core Infrastructure Framework • Comprehensive XAI Verification Stream", 14, 26);
    doc.text(`System Reference Block ID: #${isFromHistory ? candidate.id : "LIVE-EXEC"}`, 14, 31);

    // Structural Mapping Calculations
    const rawName = isFromHistory ? candidate.candidate_name : candidate.candidate_meta.filename;
    const name = rawName.split(".")[0].replace(/[_-]/g, " ").toUpperCase();
    const position = isFromHistory ? candidate.job_title : "Data Science / ML Specialization";
    const finalScore = isFromHistory ? candidate.overall_score : candidate.verdict.score;
    const trackingDate = isFromHistory ? new Date(candidate.created_at).toLocaleDateString() : new Date().toLocaleDateString();
    
    // Fallback safe collection for the dynamic text explanation
    let rationaleText = "";
    if (isFromHistory) {
      rationaleText = candidate.xai_justification;
    } else {
      rationaleText = candidate.verdict.justification || 
        `Candidate score evaluated at ${finalScore}%. Under your current alignment criteria weights (${wSemantic}% Semantic / ${wExperience}% Experience / ${wEducation}% Education), the composite vector math has identified explicit keyword alignments. Full domain matrices are detailed below.`;
    }

    // 2. Candidate Core Metadata Grid Section
    doc.setTextColor(15, 23, 42);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text(`Candidate Identifier: ${name}`, 14, 52);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(71, 85, 105);
    doc.text(`Assigned Vector Profile: ${position}`, 14, 59);
    doc.text(`Generation Status: System Verified`, 14, 65);
    doc.text(`Evaluation Timestamp: ${trackingDate}`, 14, 71);
    
    // 3. Score Highlight Badge Frame
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

    // Dynamic Tracking Coordinate Base Setup (Prevents dead whitespace issues)
    let currentY = 82;
    doc.setDrawColor(241, 245, 249);
    doc.line(14, currentY, 196, currentY);
    currentY += 10;

    // 4. Dynamic Parameter Criteria Weights Breakdown Card
    doc.setFillColor(250, 250, 250);
    doc.rect(14, currentY, 182, 14, "F");
    doc.rect(14, currentY, 182, 14, "S");
    
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text("CRITERIA MODEL WEIGHTS UTILIZED DURING MATCH:", 18, currentY + 9);
    
    doc.setFont("helvetica", "mono");
    doc.setTextColor(15, 23, 42);
    const wSem = isFromHistory && candidate.slider_weights ? candidate.slider_weights.semantic : wSemantic;
    const wExp = isFromHistory && candidate.slider_weights ? candidate.slider_weights.experience : wExperience;
    const wEdu = isFromHistory && candidate.slider_weights ? candidate.slider_weights.education : wEducation;
    doc.text(`[Semantic Fit: ${wSem}%]   [Experience: ${wExp}%]   [Education: ${wEdu}%]`, 94, currentY + 9);
    
    currentY += 22;

    // 5. Multi-Line Wrapped Natural Language Narrative
    doc.setTextColor(15, 23, 42);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("Explainable AI (XAI) Decision Verdict Summary:", 14, currentY);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(51, 65, 85);
    
    const splitExplanation = doc.splitTextToSize(rationaleText, 182);
    currentY += 6;
    doc.text(splitExplanation, 14, currentY);
    
    // Tight accordion calculation to eliminate structural scrolling overflow gaps
    currentY += (splitExplanation.length * 5) + 6;
    doc.setDrawColor(241, 245, 249);
    doc.line(14, currentY, 196, currentY);
    currentY += 10;

    // 6. Semantic Ontology Keyword Grid Breakdown Expansion
    doc.setTextColor(15, 23, 42);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("Granular Knowledge Domain Ontology Matrix:", 14, currentY);
    currentY += 7;

    const ontologySource = isFromHistory ? {} : (candidate.ontology_breakdown || {});
    
    if (Object.keys(ontologySource).length === 0) {
      // High-Insight fallback text layout block for historical logs
      doc.setFillColor(253, 242, 248);
      doc.rect(14, currentY, 182, 24, "F");
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9.5);
      doc.setTextColor(157, 23, 77);
      
      const archiveText = "Strategic Database Mapping Log Note: The complete semantic arrays (detected terms vs missing prerequisites) remain encrypted and stored inside your system's SQLite relational backend engine binary stream for real-time dashboard analytics.";
      const splitArchive = doc.splitTextToSize(archiveText, 172);
      doc.text(splitArchive, 18, currentY + 7);
      currentY += 30;
    } else {
      // Dynamic loop moving objects downward using precision relative math rules
      Object.entries(ontologySource).forEach(([domain, data]: [string, any]) => {
        if (currentY > 255) { doc.addPage(); currentY = 20; } 

        // Draw Shaded Segment Blocks per category axis
        doc.setFillColor(250, 250, 250);
        doc.rect(14, currentY, 182, 22, "F");
        doc.setDrawColor(241, 245, 249);
        doc.rect(14, currentY, 182, 22, "S");

        doc.setFont("helvetica", "bold");
        doc.setFontSize(9.5);
        doc.setTextColor(30, 41, 59);
        doc.text(`${domain} Axis Core Competency Match — Strength: ${Math.round(data.match_ratio * 100)}%`, 18, currentY + 5.5);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(8.5);
        
        const foundStr = data.detected.length > 0 ? data.detected.join(", ") : "None detected";
        const missingStr = data.missing.length > 0 ? data.missing.join(", ") : "None missing";

        doc.setTextColor(16, 185, 129); // Green found metrics
        doc.text(`Detected Terms: ${foundStr}`, 18, currentY + 11.5, { maxWidth: 174 });
        
        doc.setTextColor(239, 68, 68); // Red missing parameters
        doc.text(`Missing Prerequisites: ${missingStr}`, 18, currentY + 17, { maxWidth: 174 });
        
        currentY += 27; 
      });
    }

    // 7. Footer Validation Seal Stamp Anchor
    if (currentY > 265) { doc.addPage(); currentY = 20; }
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text("LUMEN HIRE PLATFORM INSIGHT AUTOMATION ENGINE • END OF VERIFICATION DOSSIER", 14, currentY + 10);

    doc.save(`lumen_comprehensive_audit_${name.toLowerCase().replace(/\s+/g, "_")}.pdf`);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">AI Intelligent Screening Gateway</h1>
          <p className="text-slate-500 mt-2">Upload raw candidate documents to process them against the core technical skills ontology matrix.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* LEFT COLUMN: CRITERIA INPUT CONTROL PANEL */}
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
                    <option value="Undergraduate">Undergraduate Degree</option>
                    <option value="Masters">Masters Degree</option>
                    <option value="PhD">PhD Doctorate</option>
                  </select>
                </div>

                {/* DYNAMIC WEIGHT CONTROLS PANEL */}
                <div className="pt-4 border-t border-slate-100 space-y-4">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider">
                    <span className="flex items-center gap-1.5"><Sliders className="h-3.5 w-3.5" /> Decision Matrix Weights</span>
                    <span className={`font-mono text-xs ${totalWeight === 100 ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {totalWeight}/100%
                    </span>
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
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <Cpu className="animate-spin h-4 w-4" /> Custom Re-Weighting...
                    </span>
                  ) : (
                    "Execute AI Evaluation"
                  )}
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

        {/* RIGHT COLUMN: REVEALING THE REAL-TIME JUDGMENT LOGIC */}
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
              <div className="h-2 w-32 bg-slate-100 rounded-full overflow-hidden relative">
                <div className="absolute top-0 left-0 bottom-0 bg-indigo-600 rounded-full animate-pulse w-full"></div>
              </div>
              <p className="text-xs text-indigo-600 font-medium tracking-wide uppercase animate-pulse">Running text extractors & custom weighting algorithms...</p>
            </div>
          )}

          {result && (
            <Card className="shadow-md border-slate-200 bg-white overflow-hidden transition-all duration-300 animate-in fade-in-50">
              {/* HEAD BANNER: VERDICT CLASSIFICATION */}
              <div className={`p-5 flex items-center justify-between text-white border-b ${result.verdict.shortlisted ? 'bg-emerald-600' : 'bg-amber-600'}`}>
                <div>
                  <span className="text-xs uppercase tracking-wider font-semibold opacity-75">System Recommendation</span>
                  <h2 className="text-2xl font-bold mt-0.5">{result.verdict.shortlisted ? "✓ Shortlisted for Interview" : "✕ Kept in Talent Pool"}</h2>
                </div>
                <div className="text-right flex items-center gap-4">
                  <div>
                    <span className="text-xs uppercase tracking-wider font-semibold opacity-75">Computed Score</span>
                    <div className="text-3xl font-extrabold tracking-tight mt-0.5">{result.verdict.score}%</div>
                  </div>
                  <Button variant="secondary" size="icon" onClick={() => handleExportPDF(result, false)} className="bg-white/10 hover:bg-white/20 text-white border-none mt-4">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* XAI NATURAL LANGUAGE INTERPRETATION CARD */}
              <div className="p-5 bg-slate-900 text-slate-100 border-b border-slate-800 flex flex-col gap-2">
                <div className="flex items-center gap-2 text-xs font-bold text-indigo-400 uppercase tracking-widest">
                  <Cpu className="h-4 w-4 animate-pulse" /> Algorithmic Decision Rationale (XAI)
                </div>
                <p className="text-sm font-medium leading-relaxed text-slate-300">
                  {result.verdict.justification || "Vector calculations completed successfully. See specific domain matrices mapped below."}
                </p>
              </div>

              <CardContent className="p-6 space-y-6">
                {/* METRICS VISUALIZATION */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm font-medium">
                    <span className="text-slate-700">Algorithmic Confidence Bound</span>
                    <span className="text-slate-900">{result.verdict.confidence}%</span>
                  </div>
                  <Progress value={result.verdict.confidence} className="h-2 bg-slate-100 text-slate-900" />
                </div>

                <hr className="border-slate-100" />

                {/* THE BRAIN UNPACKED: SKILLS ONTOLOGY DIAGNOSTIC BREAKDOWN */}
                <div>
                  <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide mb-3">Explainable AI (XAI) Ontology Audit</h3>
                  <div className="grid grid-cols-1 gap-4">
                    {Object.entries(result.ontology_breakdown).map(([domain, data]) => (
                      <div key={domain} className="border border-slate-100 rounded-lg p-4 bg-slate-50/50 space-y-3">
                        <div className="flex justify-between items-center">
                          <h4 className="text-sm font-bold text-slate-700">{domain}</h4>
                          <span className="text-xs font-mono font-bold bg-white px-2 py-0.5 border rounded text-slate-600">
                            Match: {Math.round(data.match_ratio * 100)}%
                          </span>
                        </div>

                        {/* DETECTED KEYWORDS */}
                        <div className="flex flex-wrap gap-1.5 items-center">
                          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider w-16">Found:</span>
                          {data.detected.length === 0 ? (
                            <span className="text-xs italic text-slate-400">None detected</span>
                          ) : (
                            data.detected.map((kw) => (
                              <span key={kw} className="text-xs bg-emerald-50 border border-emerald-200 text-emerald-700 font-medium px-2 py-0.5 rounded flex items-center gap-1">
                                <CheckCircle2 className="h-3 w-3 text-emerald-600" /> {kw}
                              </span>
                            ))
                          )}
                        </div>

                        {/* MISSING KEYWORDS */}
                        <div className="flex flex-wrap gap-1.5 items-center">
                          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider w-16">Missing:</span>
                          {data.missing.length === 0 ? (
                            <span className="text-xs italic text-slate-400">Perfect category match</span>
                          ) : (
                            data.missing.map((kw) => (
                              <span key={kw} className="text-xs bg-slate-100 border border-slate-200 text-slate-500 px-2 py-0.5 rounded flex items-center gap-1">
                                <XCircle className="h-3 w-3 text-slate-400" /> {kw}
                              </span>
                            ))
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* --- TIMELINE COMPONENT HORIZONTAL DISPLAY DRAWER --- */}
      <div className="pt-6 border-t border-slate-200">
        <div className="flex items-center gap-2 mb-4 text-slate-800">
          <History className="h-5 w-5 text-indigo-600" />
          <h2 className="text-xl font-bold tracking-tight">Local Persistent Evaluation Logs</h2>
          <span className="text-xs bg-slate-100 font-mono font-bold text-slate-600 px-2 py-0.5 border rounded-full">
            {history.length} Profiles Cached
          </span>
        </div>

        {fetchingHistory ? (
          <div className="text-xs text-slate-400 uppercase tracking-widest animate-pulse p-4">Syncing file system datastore records...</div>
        ) : history.length === 0 ? (
          <div className="border border-dashed border-slate-200 bg-slate-50/50 rounded-xl p-6 text-center text-sm text-slate-400">
            No evaluations indexed inside the local SQLite binary stream yet.
          </div>
        ) : (
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-slate-200 snap-x">
            {history.map((record) => (
              <Card key={record.id} className="w-[310px] shrink-0 snap-start bg-white border-slate-200 shadow-sm flex flex-col justify-between hover:border-slate-300 transition-all">
                <CardHeader className="p-4 pb-2 flex flex-row items-start justify-between space-y-0">
                  <div className="max-w-[210px]">
                    <span className="text-[10px] text-slate-400 font-mono block mb-1">{new Date(record.created_at).toLocaleString()}</span>
                    <CardTitle className="text-sm font-bold text-slate-800 truncate">{record.candidate_name}</CardTitle>
                    <span className="text-xs font-medium text-slate-500 block truncate mt-0.5">{record.job_title}</span>
                  </div>
                  <div className={`text-sm font-black px-2 py-1 rounded text-white ${record.overall_score >= 55 ? 'bg-emerald-600' : 'bg-amber-600'}`}>
                    {Math.round(record.overall_score)}%
                  </div>
                </CardHeader>
                <CardContent className="p-4 pt-2 space-y-3">
                  <p className="text-xs text-slate-500 line-clamp-3 bg-slate-50 p-2 rounded border border-slate-100 leading-relaxed font-medium">
                    {record.xai_justification}
                  </p>
                  <Button variant="outline" size="sm" onClick={() => handleExportPDF(record, true)} className="w-full text-xs font-semibold flex items-center justify-center gap-2 border-slate-200 text-slate-700 hover:bg-slate-50">
                    <FileText className="h-3.5 w-3.5 text-indigo-500" /> Export Audit Transcript
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
