export type Candidate = {
  id: string;
  name: string;
  title: string;
  location: string;
  experience: number;
  similarity: number;
  matchedSkills: string[];
  missingSkills: string[];
  sources: ("Resume" | "LinkedIn" | "GitHub" | "Portfolio")[];
  explanation: {
    section: string;
    contribution: number;
  }[];
  highlights: string[];
  demographic: { gender: "F" | "M" | "NB"; group: string };
  status: "pending" | "approved" | "rejected";
  summary: string;
  avatarSeed: string;
};

export type JobPosting = {
  id: string;
  title: string;
  department: string;
  location: string;
  postedAt: string;
  candidates: number;
  shortlisted: number;
  fairnessScore: number;
  status: "active" | "draft" | "closed";
};

export const mockJobs: JobPosting[] = [
  {
    id: "j1",
    title: "Senior ML Engineer",
    department: "AI Platform",
    location: "Remote · EU",
    postedAt: "2 days ago",
    candidates: 142,
    shortlisted: 12,
    fairnessScore: 0.86,
    status: "active",
  },
  {
    id: "j2",
    title: "Full-Stack Developer",
    department: "Product",
    location: "Berlin",
    postedAt: "5 days ago",
    candidates: 89,
    shortlisted: 10,
    fairnessScore: 0.74,
    status: "active",
  },
  {
    id: "j3",
    title: "Data Scientist",
    department: "Analytics",
    location: "London",
    postedAt: "1 week ago",
    candidates: 211,
    shortlisted: 15,
    fairnessScore: 0.91,
    status: "active",
  },
  {
    id: "j4",
    title: "Cloud Solutions Architect",
    department: "Infrastructure",
    location: "Hybrid · Dublin",
    postedAt: "3 weeks ago",
    candidates: 67,
    shortlisted: 8,
    fairnessScore: 0.69,
    status: "closed",
  },
];

export const mockCandidates: Candidate[] = [
  {
    id: "c1",
    name: "Amara Okonkwo",
    title: "ML Engineer · Stripe",
    location: "Berlin, DE",
    experience: 6,
    similarity: 0.94,
    matchedSkills: ["Python", "PyTorch", "MLOps", "AWS", "Kubernetes", "LLMs"],
    missingSkills: ["Rust"],
    sources: ["Resume", "LinkedIn", "GitHub"],
    explanation: [
      { section: "Skills", contribution: 0.42 },
      { section: "Experience", contribution: 0.31 },
      { section: "Projects", contribution: 0.18 },
      { section: "Education", contribution: 0.09 },
    ],
    highlights: [
      "Led production deployment of LLM ranking system serving 4M req/day",
      "Strong PyTorch + MLOps overlap with role requirements",
      "Active GitHub: 14 ML repositories, 2.3k combined stars",
    ],
    demographic: { gender: "F", group: "Underrepresented" },
    status: "pending",
    summary:
      "Strong semantic match driven by deep ML production experience and overlap on cloud-native MLOps tooling.",
    avatarSeed: "amara",
  },
  {
    id: "c2",
    name: "Marcus Chen",
    title: "Senior Data Scientist · Spotify",
    location: "Stockholm, SE",
    experience: 8,
    similarity: 0.91,
    matchedSkills: ["Python", "TensorFlow", "Spark", "AWS", "SQL"],
    missingSkills: ["Kubernetes", "Rust"],
    sources: ["Resume", "LinkedIn"],
    explanation: [
      { section: "Experience", contribution: 0.38 },
      { section: "Skills", contribution: 0.34 },
      { section: "Education", contribution: 0.16 },
      { section: "Projects", contribution: 0.12 },
    ],
    highlights: [
      "8 yrs in large-scale recommendation systems",
      "Co-authored 3 papers on retrieval-augmented ranking",
    ],
    demographic: { gender: "M", group: "General" },
    status: "pending",
    summary: "High match on senior experience and semantic scoring across recommendation domains.",
    avatarSeed: "marcus",
  },
  {
    id: "c3",
    name: "Priya Raman",
    title: "ML Researcher · DeepMind alum",
    location: "London, UK",
    experience: 5,
    similarity: 0.88,
    matchedSkills: ["Python", "PyTorch", "Transformers", "Research"],
    missingSkills: ["MLOps", "AWS"],
    sources: ["Resume", "GitHub", "Portfolio"],
    explanation: [
      { section: "Skills", contribution: 0.4 },
      { section: "Projects", contribution: 0.28 },
      { section: "Education", contribution: 0.22 },
      { section: "Experience", contribution: 0.1 },
    ],
    highlights: [
      "PhD in NLP from Cambridge",
      "Published transformer interpretability research at NeurIPS",
    ],
    demographic: { gender: "F", group: "Underrepresented" },
    status: "approved",
    summary: "Outstanding research depth; lighter on production MLOps but strong learning trajectory.",
    avatarSeed: "priya",
  },
  {
    id: "c4",
    name: "James Whitaker",
    title: "Backend Engineer → ML",
    location: "Manchester, UK",
    experience: 7,
    similarity: 0.82,
    matchedSkills: ["Python", "AWS", "Kubernetes", "SQL"],
    missingSkills: ["PyTorch", "LLMs", "MLOps"],
    sources: ["Resume", "LinkedIn"],
    explanation: [
      { section: "Experience", contribution: 0.45 },
      { section: "Skills", contribution: 0.3 },
      { section: "Education", contribution: 0.15 },
      { section: "Projects", contribution: 0.1 },
    ],
    highlights: ["Strong infra background, transitioning into ML"],
    demographic: { gender: "M", group: "General" },
    status: "pending",
    summary: "Solid infrastructure foundation; ML depth still growing.",
    avatarSeed: "james",
  },
  {
    id: "c5",
    name: "Sofia Hernández",
    title: "Applied Scientist · Amazon",
    location: "Madrid, ES",
    experience: 4,
    similarity: 0.86,
    matchedSkills: ["Python", "PyTorch", "AWS", "LLMs", "MLOps"],
    missingSkills: ["Kubernetes"],
    sources: ["Resume", "LinkedIn", "GitHub"],
    explanation: [
      { section: "Skills", contribution: 0.44 },
      { section: "Projects", contribution: 0.26 },
      { section: "Experience", contribution: 0.2 },
      { section: "Education", contribution: 0.1 },
    ],
    highlights: [
      "Recent work on retrieval pipelines at Amazon Search",
      "Strong coverage of skills ontology",
    ],
    demographic: { gender: "F", group: "Underrepresented" },
    status: "pending",
    summary: "Excellent applied ML track record with high ontology coverage.",
    avatarSeed: "sofia",
  },
  {
    id: "c6",
    name: "Daniel Kowalski",
    title: "Software Engineer · Google",
    location: "Zurich, CH",
    experience: 9,
    similarity: 0.79,
    matchedSkills: ["Python", "AWS", "SQL", "Spark"],
    missingSkills: ["PyTorch", "LLMs"],
    sources: ["Resume", "LinkedIn"],
    explanation: [
      { section: "Experience", contribution: 0.5 },
      { section: "Skills", contribution: 0.25 },
      { section: "Education", contribution: 0.15 },
      { section: "Projects", contribution: 0.1 },
    ],
    highlights: ["Long tenure at Google on data pipelines"],
    demographic: { gender: "M", group: "General" },
    status: "rejected",
    summary: "Strong tenure but lower semantic overlap on ML specifics.",
    avatarSeed: "daniel",
  },
];

export const skillsOntology = {
  Frontend: ["React", "Next.js", "TypeScript", "Tailwind", "Vue"],
  Backend: ["Node.js", "Python", "Go", "Rust", "Java"],
  ML: ["PyTorch", "TensorFlow", "Transformers", "LLMs", "MLOps"],
  Cloud: ["AWS", "GCP", "Azure", "Kubernetes", "Docker"],
  Data: ["SQL", "Spark", "Snowflake", "Airflow", "dbt"],
};

export const fairnessMetrics = {
  disparateImpact: 0.86,
  statisticalParity: 0.91,
  representation: { Underrepresented: 4, General: 6 },
  threshold: 0.8,
};
