"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, FileText, Upload } from "@/components/brand/icons";
import { HireschemaLogo } from "@/components/brand/HireschemaLogo";
import { ShareScoreCard } from "@/components/review/ShareScoreCard";
import { getUploadApiBaseUrl } from "@/lib/api/base-url";
import { BTN_GHOST, BTN_PRIMARY } from "@/lib/button-classes";
import { cn } from "@/lib/utils";

type PriorityStatus = "strong" | "needs_work" | "missing";

type PriorityCheck = {
  id: string;
  label: string;
  looking_for: string;
  status: PriorityStatus;
  note: string;
};

type CategoryBlock = {
  score: number;
  summary: string;
  weight: number;
};

type HiringScores = {
  relevance: number;
  experience: number;
  impact: number;
  skills: number;
  communication: number;
  culture_fit: number;
  overall: number;
};

type PublicCvReview = {
  kind: "public_cv_review";
  free: boolean;
  headline: string;
  verdict: string;
  target_role_guess: string | null;
  priority_checks: PriorityCheck[];
  categories: Record<string, CategoryBlock>;
  scores: HiringScores;
  impact_rewrites: { weak: string; strong: string }[];
  red_flags: string[];
  strengths: string[];
  improvements: string[];
  role_targets: string[];
  profile: {
    first_name: string | null;
    current_title: string | null;
    years_experience: number | null;
    skill_count: number;
    location_city: string | null;
  };
  cta: {
    title: string;
    body: string;
    primary_label: string;
    secondary_label: string;
  };
  privacy: { stored: boolean; note: string };
};

type Phase = "idle" | "dragging" | "reviewing" | "done" | "error";

const SIGNUP_HREF = "/invite";
const LOGIN_HREF = "/signup?mode=signin";

const SCAN_STEPS = [
  "Reading file structure…",
  "Checking headline & identity…",
  "Reviewing work experience…",
  "Scoring measurable impact…",
  "Mapping skills & projects…",
  "Weighing relevance, credibility, signals…",
  "Building hiring scorecard…",
] as const;

const CATEGORY_META: { key: string; label: string; weight: string }[] = [
  { key: "relevance", label: "Relevance", weight: "40%" },
  { key: "impact", label: "Impact", weight: "25%" },
  { key: "credibility", label: "Credibility", weight: "15%" },
  { key: "communication", label: "Communication", weight: "10%" },
  { key: "signals", label: "Signals", weight: "10%" },
];

const HIRING_SCORE_META: { key: keyof HiringScores; label: string }[] = [
  { key: "relevance", label: "Relevance" },
  { key: "experience", label: "Experience" },
  { key: "impact", label: "Impact" },
  { key: "skills", label: "Skills" },
  { key: "communication", label: "Communication" },
  { key: "culture_fit", label: "Culture fit" },
];

const DEFAULT_PRIORITY: Omit<PriorityCheck, "status" | "note">[] = [
  {
    id: "headline",
    label: "Headline",
    looking_for: 'Clear identity ("Software Engineer", "Product Designer")',
  },
  {
    id: "work_experience",
    label: "Work experience",
    looking_for: "Relevant roles and responsibilities",
  },
  {
    id: "achievements",
    label: "Achievements",
    looking_for: "Measurable impact",
  },
  {
    id: "skills",
    label: "Skills",
    looking_for: "Skills that match the job description",
  },
  {
    id: "projects",
    label: "Projects",
    looking_for: "Real-world work and proof of ability",
  },
  {
    id: "education",
    label: "Education",
    looking_for: "Degree, certifications, and relevance",
  },
  {
    id: "stability",
    label: "Stability",
    looking_for: "Frequent job changes or unexplained gaps",
  },
  {
    id: "presentation",
    label: "Presentation",
    looking_for: "Readability and professionalism",
  },
];

function clampScore(value: unknown, fallback = 55): number {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(0, Math.min(100, Math.round(n)));
}

function scoreTone(n: number): string {
  if (n >= 80) return "text-accent";
  if (n >= 60) return "text-ink-900";
  return "text-destructive";
}

function statusTone(status: PriorityStatus): string {
  if (status === "strong") return "border-accent/40 bg-accent/10 text-accent";
  if (status === "missing") return "border-destructive/40 bg-destructive/10 text-destructive";
  return "border-ink-200 bg-paper-0 text-ink-500";
}

function statusLabel(status: PriorityStatus): string {
  if (status === "strong") return "Strong";
  if (status === "missing") return "Missing";
  return "Needs work";
}

/** Accept new API shape or legacy gatekept payload without crashing the page. */
function normalizeReview(raw: Record<string, unknown>): PublicCvReview {
  const scoresRaw = (raw.scores as Record<string, unknown> | undefined) ?? {};
  const profileRaw = (raw.profile as Record<string, unknown> | undefined) ?? {};
  const gate = (raw.gate as Record<string, unknown> | undefined) ?? {};
  const ctaRaw = (raw.cta as Record<string, unknown> | undefined) ?? {};
  const privacyRaw = (raw.privacy as Record<string, unknown> | undefined) ?? {};

  const overall = clampScore(scoresRaw.overall, 55);
  const impact = clampScore(scoresRaw.impact, 55);
  const communication = clampScore(
    scoresRaw.communication ?? scoresRaw.clarity,
    55,
  );
  const skills = clampScore(scoresRaw.skills ?? scoresRaw.ats, 55);
  const relevance = clampScore(scoresRaw.relevance ?? scoresRaw.market_fit, 55);
  const experience = clampScore(scoresRaw.experience, Math.round((overall + impact) / 2));
  const cultureFit = clampScore(scoresRaw.culture_fit ?? scoresRaw.market_fit, 55);

  const categoriesRaw = (raw.categories as Record<string, unknown> | undefined) ?? {};
  const categories: Record<string, CategoryBlock> = {};
  for (const meta of CATEGORY_META) {
    const block = (categoriesRaw[meta.key] as Record<string, unknown> | undefined) ?? {};
    const fallback =
      meta.key === "relevance"
        ? relevance
        : meta.key === "impact"
          ? impact
          : meta.key === "communication"
            ? communication
            : meta.key === "credibility"
              ? clampScore(Math.round((overall + skills) / 2))
              : clampScore(Math.round((impact + experience) / 2));
    categories[meta.key] = {
      score: clampScore(block.score, fallback),
      summary: String(block.summary || "Scored from your uploaded CV."),
      weight:
        typeof block.weight === "number"
          ? block.weight
          : Number(meta.weight.replace("%", "")) || 0,
    };
  }

  const priorityRaw = Array.isArray(raw.priority_checks) ? raw.priority_checks : [];
  const priority_checks: PriorityCheck[] = DEFAULT_PRIORITY.map((base) => {
    const hit = priorityRaw.find(
      (row) =>
        row &&
        typeof row === "object" &&
        String((row as Record<string, unknown>).id) === base.id,
    ) as Record<string, unknown> | undefined;
    const statusRaw = String(hit?.status || "needs_work");
    const status: PriorityStatus =
      statusRaw === "strong" || statusRaw === "missing" ? statusRaw : "needs_work";
    return {
      ...base,
      status,
      note: String(hit?.note || base.looking_for),
    };
  });

  const improvements = (
    Array.isArray(raw.improvements)
      ? raw.improvements
      : Array.isArray(raw.improvements_preview)
        ? raw.improvements_preview
        : []
  )
    .map((item) => String(item))
    .filter(Boolean)
    .slice(0, 6);

  const strengths = (Array.isArray(raw.strengths) ? raw.strengths : [])
    .map((item) => String(item))
    .filter(Boolean)
    .slice(0, 3);

  const role_targets = (
    Array.isArray(raw.role_targets)
      ? raw.role_targets
      : Array.isArray(raw.role_targets_teaser)
        ? raw.role_targets_teaser
        : []
  )
    .map((item) => String(item))
    .filter(Boolean)
    .slice(0, 3);

  const impact_rewrites = (
    Array.isArray(raw.impact_rewrites) ? raw.impact_rewrites : []
  )
    .map((row) => {
      if (!row || typeof row !== "object") return null;
      const weak = String((row as Record<string, unknown>).weak || "").trim();
      const strong = String((row as Record<string, unknown>).strong || "").trim();
      if (!weak || !strong) return null;
      return { weak, strong };
    })
    .filter((row): row is { weak: string; strong: string } => Boolean(row))
    .slice(0, 3);

  const defaultRewrites = [
    {
      weak: "Responsible for managing a team.",
      strong: "Led a team of 12 people and increased revenue by 32%.",
    },
    {
      weak: "Worked on marketing campaigns.",
      strong: "Reduced customer acquisition costs by 18%.",
    },
  ];

  const red_flags = (Array.isArray(raw.red_flags) ? raw.red_flags : [])
    .map((item) => String(item))
    .filter(Boolean)
    .slice(0, 8);

  return {
    kind: "public_cv_review",
    free: raw.free !== false,
    headline: String(raw.headline || "Recruiter read complete"),
    verdict: String(raw.verdict || "Your CV was scored with an elite recruiter framework."),
    target_role_guess: raw.target_role_guess
      ? String(raw.target_role_guess)
      : profileRaw.current_title
        ? String(profileRaw.current_title)
        : null,
    priority_checks,
    categories,
    scores: {
      relevance,
      experience,
      impact,
      skills,
      communication,
      culture_fit: cultureFit,
      overall,
    },
    impact_rewrites: impact_rewrites.length > 0 ? impact_rewrites : defaultRewrites,
    red_flags:
      red_flags.length > 0
        ? red_flags
        : improvements.slice(0, 3).map((item) => item.replace(/^Add missing:\s*/i, "")),
    strengths:
      strengths.length > 0
        ? strengths
        : ["CV uploaded and scored", "Enough structure for a first screen"],
    improvements:
      improvements.length > 0
        ? improvements
        : ["Add quantified impact to your top bullets", "Lead with a clear identity headline"],
    role_targets,
    profile: {
      first_name: profileRaw.first_name ? String(profileRaw.first_name) : null,
      current_title: profileRaw.current_title ? String(profileRaw.current_title) : null,
      years_experience:
        typeof profileRaw.years_experience === "number" ? profileRaw.years_experience : null,
      skill_count: typeof profileRaw.skill_count === "number" ? profileRaw.skill_count : 0,
      location_city: profileRaw.location_city ? String(profileRaw.location_city) : null,
    },
    cta: {
      title: String(ctaRaw.title || "Ready to act on this review?"),
      body: String(
        ctaRaw.body ||
          gate.cta ||
          "Create a free Hireschema account to get matched India roles, tailored kits, and warm intros.",
      ),
      primary_label: String(ctaRaw.primary_label || "Request invite"),
      secondary_label: String(ctaRaw.secondary_label || "Sign in"),
    },
    privacy: {
      stored: Boolean(privacyRaw.stored),
      note: String(
        privacyRaw.note ||
          "Free review — your file is scored in memory. Access to the app is invite-only.",
      ),
    },
  };
}

function ScoreRing({ value, label }: { value: number; label: string }) {
  const size = 156;
  const stroke = 10;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const safe = clampScore(value, 0);
  const offset = c - (safe / 100) * c;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90" aria-hidden>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke="currentColor"
            strokeWidth={stroke}
            className="text-ink-100"
          />
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke="currentColor"
            strokeWidth={stroke}
            strokeLinecap="square"
            className="text-accent"
            strokeDasharray={c}
            initial={{ strokeDashoffset: c }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={cn("text-4xl font-semibold tabular-nums", scoreTone(safe))}>
            {safe}
          </span>
          <span className="text-micro text-ink-500">/ 100</span>
        </div>
      </div>
      <span className="text-micro font-medium uppercase tracking-[0.12em] text-ink-500">
        {label}
      </span>
    </div>
  );
}

function ScoreBar({ label, value }: { label: string; value: number }) {
  const safe = clampScore(value, 0);
  return (
    <div className="space-y-1.5">
      <div className="flex items-end justify-between gap-3">
        <p className="text-small font-medium text-ink-900">{label}</p>
        <span className={cn("text-small font-semibold tabular-nums", scoreTone(safe))}>
          {safe}
        </span>
      </div>
      <div className="h-2 w-full bg-ink-100">
        <motion.div
          className="h-full bg-accent"
          initial={{ width: 0 }}
          animate={{ width: `${safe}%` }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>
    </div>
  );
}

function ScanningLoader({ fileName }: { fileName: string | null }) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => {
      setStep((prev) => (prev + 1) % SCAN_STEPS.length);
    }, 1600);
    return () => window.clearInterval(id);
  }, []);

  const progress = Math.min(92, 12 + step * 12);

  return (
    <motion.section
      key="loading"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="mx-auto mt-12 max-w-lg"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="border border-ink-100 bg-paper-1 p-6 md:p-8">
        <div className="flex items-center gap-4">
          <div className="relative flex h-14 w-14 shrink-0 items-center justify-center border-2 border-ink-100 bg-paper-0">
            <FileText className="h-6 w-6 text-accent" />
            <span className="absolute inset-0 animate-ping border border-accent/40 opacity-40" />
          </div>
          <div>
            <p className="text-h3 text-ink-900">Scanning your résumé</p>
            <p className="mt-1 text-small text-ink-500">
              {fileName ? fileName : "Uploaded CV"} · elite recruiter pass
            </p>
          </div>
        </div>

        <div className="mt-6 h-2 w-full bg-ink-100">
          <motion.div
            className="h-full bg-accent"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.45 }}
          />
        </div>
        <p className="mt-2 text-micro tabular-nums text-ink-500">{progress}%</p>

        <ul className="mt-6 space-y-2">
          {SCAN_STEPS.map((label, index) => {
            const done = index < step;
            const active = index === step;
            return (
              <li
                key={label}
                className={cn(
                  "flex items-center gap-3 border px-3 py-2.5 text-small transition-colors",
                  active
                    ? "border-accent/40 bg-accent/10 text-ink-900"
                    : done
                      ? "border-ink-100 bg-paper-0 text-ink-500"
                      : "border-ink-100/60 bg-transparent text-ink-400",
                )}
              >
                <span
                  className={cn(
                    "h-2 w-2 shrink-0",
                    active ? "animate-pulse bg-accent" : done ? "bg-accent" : "bg-ink-200",
                  )}
                />
                {label}
              </li>
            );
          })}
        </ul>
        <p className="mt-5 text-center text-micro text-ink-500">
          Usually 10–40 seconds · stay on this page
        </p>
      </div>
    </motion.section>
  );
}

export default function ReviewMyCvClient() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [error, setError] = useState("");
  const [review, setReview] = useState<PublicCvReview | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const runReview = useCallback(async (file: File) => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setError("");
    setFileName(file.name);
    setPhase("reviewing");
    setReview(null);

    const form = new FormData();
    form.append("resume", file);

    try {
      const res = await fetch(`${getUploadApiBaseUrl()}/api/v1/public/review-cv`, {
        method: "POST",
        body: form,
        signal: controller.signal,
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { detail?: unknown };
        const detail =
          typeof body.detail === "string"
            ? body.detail
            : Array.isArray(body.detail)
              ? "Could not read that file. Try a PDF or DOCX under 10MB."
              : `Review failed (${res.status})`;
        throw new Error(detail);
      }
      const data = (await res.json()) as Record<string, unknown>;
      setReview(normalizeReview(data));
      setPhase("done");
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      setError(err instanceof Error ? err.message : "Something went wrong while scanning.");
      setPhase("error");
    }
  }, []);

  const onFile = useCallback(
    (file: File | null | undefined) => {
      if (!file) return;
      const lower = file.name.toLowerCase();
      if (!lower.endsWith(".pdf") && !lower.endsWith(".docx") && !lower.endsWith(".doc")) {
        setError("Upload a PDF or DOCX résumé.");
        setPhase("error");
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        setError("File must be under 10MB.");
        setPhase("error");
        return;
      }
      void runReview(file);
    },
    [runReview],
  );

  return (
    <main id="main-content" className="relative min-h-screen overflow-hidden bg-paper-0">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.4]"
        aria-hidden
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(159,232,112,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(159,232,112,0.04) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          maskImage: "radial-gradient(ellipse 70% 50% at 50% 0%, black, transparent)",
        }}
      />

      <header className="relative z-10 border-b border-ink-100/60 bg-paper-0/80 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-page items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2" aria-label="Hireschema home">
            <HireschemaLogo size={28} />
            <span className="rounded-full border border-accent/30 bg-accent/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-accent">
              Free
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <Link href={LOGIN_HREF} className={cn(BTN_GHOST, "px-3 py-2 text-small")}>
              Sign in
            </Link>
            <Link href={SIGNUP_HREF} className={cn(BTN_PRIMARY, "px-4 py-2 text-small")}>
              Request invite
            </Link>
          </div>
        </div>
      </header>

      <div className="relative z-10 mx-auto max-w-page px-6 pb-24 pt-12 md:pt-16">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-auto max-w-2xl text-center"
        >
          <h1 className="text-[36px] font-semibold leading-[1.08] tracking-tight text-ink-900 md:text-display">
            Review my <span className="text-accent">CV</span>
          </h1>
          <p className="mx-auto mt-4 max-w-lg text-body leading-relaxed text-ink-600">
            Scored the way big-tech recruiters screen applications — priority scan, weighted
            categories, hiring scores, and red flags. Free. No account needed to see your review.
          </p>
        </motion.div>

        <AnimatePresence mode="wait">
          {(phase === "idle" || phase === "dragging" || phase === "error") && (
            <motion.section
              key="upload"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="mx-auto mt-10 max-w-xl"
            >
              <div
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    inputRef.current?.click();
                  }
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  setPhase("dragging");
                }}
                onDragLeave={() => setPhase("idle")}
                onDrop={(e) => {
                  e.preventDefault();
                  setPhase("idle");
                  onFile(e.dataTransfer.files?.[0]);
                }}
                onClick={() => inputRef.current?.click()}
                className={cn(
                  "cursor-pointer border-2 border-dashed px-6 py-14 text-center transition-colors",
                  phase === "dragging"
                    ? "border-accent bg-accent/5"
                    : "border-ink-100 bg-paper-1 hover:border-accent/50",
                )}
              >
                <Upload className="mx-auto h-8 w-8 text-accent" />
                <p className="mt-4 text-h3 text-ink-900">Drop your CV here</p>
                <p className="mt-2 text-small text-ink-500">
                  PDF or DOCX · max 10MB · free · not stored until you sign up
                </p>
                <span className={cn(BTN_PRIMARY, "mt-6 inline-flex px-5 py-2.5 text-small")}>
                  Choose file
                </span>
                <input
                  ref={inputRef}
                  type="file"
                  accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  className="hidden"
                  onChange={(e) => onFile(e.target.files?.[0])}
                />
              </div>
              {phase === "error" && error ? (
                <div
                  className="mt-4 border border-destructive/30 bg-destructive/5 px-4 py-3 text-center"
                  role="alert"
                >
                  <p className="text-small text-destructive">{error}</p>
                  <button
                    type="button"
                    className="mt-2 text-small text-ink-500 underline-offset-4 hover:underline"
                    onClick={() => {
                      setPhase("idle");
                      setError("");
                    }}
                  >
                    Try another file
                  </button>
                </div>
              ) : null}
            </motion.section>
          )}

          {phase === "reviewing" && <ScanningLoader fileName={fileName} />}

          {phase === "done" && review && (
            <motion.section
              key="result"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="mx-auto mt-12 max-w-4xl space-y-6"
            >
              <div className="border border-ink-100 bg-paper-1 p-6 md:p-8">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="border border-accent/30 bg-accent/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-accent">
                    Free review
                  </span>
                  {review.profile.first_name ? (
                    <span className="text-micro text-ink-500">for {review.profile.first_name}</span>
                  ) : null}
                  {review.target_role_guess ? (
                    <span className="text-micro text-ink-500">
                      · best-fit read: {review.target_role_guess}
                    </span>
                  ) : null}
                </div>
                <div className="mt-6 flex flex-col items-center gap-8 md:flex-row md:items-start md:justify-between">
                  <ScoreRing value={review.scores.overall} label="Overall hiring score" />
                  <div className="flex-1 space-y-4">
                    <h2 className="text-h1 text-ink-900 md:text-[28px]">{review.headline}</h2>
                    <p className="text-body leading-relaxed text-ink-600">{review.verdict}</p>
                  </div>
                </div>
              </div>

              <ShareScoreCard
                overall={review.scores.overall}
                role={review.target_role_guess}
              />

              <div className="border border-ink-100 bg-paper-1 p-6 md:p-8">
                <p className="text-micro font-semibold uppercase tracking-[0.14em] text-accent">
                  Recruiter scan order
                </p>
                <h3 className="mt-2 text-h3 text-ink-900">What I check first</h3>
                <div className="mt-6 overflow-x-auto">
                  <table className="w-full min-w-[640px] border-collapse text-left">
                    <thead>
                      <tr className="border-b border-ink-100 text-micro uppercase tracking-[0.1em] text-ink-500">
                        <th className="py-2 pr-3 font-medium">#</th>
                        <th className="py-2 pr-3 font-medium">What I check</th>
                        <th className="py-2 pr-3 font-medium">Looking for</th>
                        <th className="py-2 pr-3 font-medium">Your CV</th>
                        <th className="py-2 font-medium">Note</th>
                      </tr>
                    </thead>
                    <tbody>
                      {review.priority_checks.map((row, idx) => (
                        <tr key={row.id} className="border-b border-ink-100/80 align-top">
                          <td className="py-3 pr-3 text-small tabular-nums text-ink-500">
                            {idx + 1}
                          </td>
                          <td className="py-3 pr-3 text-small font-medium text-ink-900">
                            {row.label}
                          </td>
                          <td className="py-3 pr-3 text-small text-ink-500">{row.looking_for}</td>
                          <td className="py-3 pr-3">
                            <span
                              className={cn(
                                "inline-flex border px-2 py-0.5 text-micro font-medium",
                                statusTone(row.status),
                              )}
                            >
                              {statusLabel(row.status)}
                            </span>
                          </td>
                          <td className="py-3 text-small text-ink-600">{row.note}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="border border-ink-100 bg-paper-1 p-6 md:p-8">
                <p className="text-micro font-semibold uppercase tracking-[0.14em] text-accent">
                  Five major categories
                </p>
                <h3 className="mt-2 text-h3 text-ink-900">How elite recruiters weigh a CV</h3>
                <div className="mt-6 grid gap-4 md:grid-cols-2">
                  {CATEGORY_META.map((meta) => {
                    const block = review.categories[meta.key];
                    if (!block) return null;
                    return (
                      <div key={meta.key} className="border border-ink-100 bg-paper-0 p-4">
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-small font-semibold text-ink-900">
                            {meta.label}{" "}
                            <span className="font-normal text-ink-500">({meta.weight})</span>
                          </p>
                          <span className={cn("text-h3 tabular-nums", scoreTone(block.score))}>
                            {block.score}
                          </span>
                        </div>
                        <div className="mt-3 h-2 bg-ink-100">
                          <motion.div
                            className="h-full bg-accent"
                            initial={{ width: 0 }}
                            animate={{ width: `${block.score}%` }}
                            transition={{ duration: 0.8 }}
                          />
                        </div>
                        <p className="mt-3 text-small leading-relaxed text-ink-600">
                          {block.summary}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="border border-ink-100 bg-paper-1 p-6 md:p-8">
                <p className="text-micro font-semibold uppercase tracking-[0.14em] text-accent">
                  AI hiring scorecard
                </p>
                <h3 className="mt-2 text-h3 text-ink-900">How we score every CV</h3>
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  {HIRING_SCORE_META.map((s) => (
                    <ScoreBar key={s.key} label={s.label} value={review.scores[s.key]} />
                  ))}
                </div>
              </div>

              {review.impact_rewrites.length > 0 && (
                <div className="border border-ink-100 bg-paper-1 p-6 md:p-8">
                  <p className="text-micro font-semibold uppercase tracking-[0.14em] text-accent">
                    Impact (25%)
                  </p>
                  <h3 className="mt-2 text-h3 text-ink-900">Weak vs strong bullets</h3>
                  <div className="mt-6 space-y-4">
                    {review.impact_rewrites.map((pair) => (
                      <div
                        key={`${pair.weak}-${pair.strong}`}
                        className="grid gap-3 md:grid-cols-2"
                      >
                        <div className="border border-destructive/30 bg-destructive/5 p-4">
                          <p className="text-micro font-semibold uppercase tracking-[0.1em] text-destructive">
                            Weak
                          </p>
                          <p className="mt-2 text-small text-ink-600">{pair.weak}</p>
                        </div>
                        <div className="border border-accent/30 bg-accent/5 p-4">
                          <p className="text-micro font-semibold uppercase tracking-[0.1em] text-accent">
                            Strong
                          </p>
                          <p className="mt-2 text-small text-ink-900">{pair.strong}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid gap-4 md:grid-cols-2">
                <div className="border border-ink-100 bg-paper-1 p-6">
                  <h3 className="text-h3 text-ink-900">What works</h3>
                  <ul className="mt-4 space-y-3">
                    {review.strengths.map((item) => (
                      <li key={item} className="flex gap-3 text-small leading-relaxed text-ink-600">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 bg-accent" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="border border-ink-100 bg-paper-1 p-6">
                  <h3 className="text-h3 text-ink-900">Fix next</h3>
                  <ul className="mt-4 space-y-3">
                    {review.improvements.map((item) => (
                      <li key={item} className="flex gap-3 text-small leading-relaxed text-ink-600">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 bg-destructive" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {review.red_flags.length > 0 && (
                <div className="border border-destructive/30 bg-paper-1 p-6 md:p-8">
                  <h3 className="text-h3 text-ink-900">Red flags on this CV</h3>
                  <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                    {review.red_flags.map((flag) => (
                      <li
                        key={flag}
                        className="flex gap-3 border border-ink-100 bg-paper-0 px-3 py-2 text-small text-ink-600"
                      >
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 bg-destructive" />
                        {flag}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="border border-ink-100 bg-paper-1 p-6 text-center md:p-8">
                <h3 className="text-h1 text-ink-900 md:text-[28px]">
                  Get matched roles from this CV
                </h3>
                <p className="mx-auto mt-3 max-w-lg text-body leading-relaxed text-ink-500">
                  Hireschema is invite-only. Request access to unlock India role matches, tailored
                  application kits, and warm intros from your Gmail
                  {review.role_targets[0] ? (
                    <>
                      {" "}
                      — we already see signal for{" "}
                      <span className="text-ink-900">{review.role_targets[0]}</span>
                    </>
                  ) : null}
                  .
                </p>
                <div className="mt-7 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
                  <Link
                    href={SIGNUP_HREF}
                    className={cn(BTN_PRIMARY, "group inline-flex justify-center gap-2 px-6 py-3.5 text-body")}
                  >
                    Request invite
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                  <Link
                    href={LOGIN_HREF}
                    className={cn(BTN_GHOST, "inline-flex justify-center px-6 py-3.5 text-body")}
                  >
                    Sign in
                  </Link>
                </div>
                <p className="mt-5 text-micro text-ink-400">
                  Your review stays free. App access is invite-only — we&apos;ll email you when
                  approved.
                </p>
                <div className="mt-6 border-t border-ink-100 pt-5">
                  <button
                    type="button"
                    className="text-small text-ink-500 underline-offset-4 hover:text-ink-900 hover:underline"
                    onClick={() => {
                      setPhase("idle");
                      setReview(null);
                      setFileName(null);
                      setError("");
                    }}
                  >
                    Review another CV
                  </button>
                </div>
              </div>
            </motion.section>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
