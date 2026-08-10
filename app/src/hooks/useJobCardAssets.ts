"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { getApplicationKitForJob } from "@/lib/api/applicationKit";
import type { MatchedJob } from "@/lib/api/matches";
import { saveJob } from "@/lib/api/saved-jobs";
import {
  openLearningRoadmap,
  requestLearningRoadmap,
} from "@/lib/api/learningRoadmap";
import { useToast } from "@/components/ui";
import { useAiOperations } from "@/components/providers/AiOperationsProvider";
import { AI_OPERATION_KINDS } from "@/lib/operations/kinds";

export type AssetStatus = "idle" | "loading" | "ready" | "error";

export type KitPreviewTab = "resume" | "cover_letter" | "interview_prep";

export type KitPreviewState = {
  jobId: string;
  jobTitle: string;
  resumeId: string | null;
  tab: KitPreviewTab;
} | null;

export type UseJobCardAssetsOptions = {
  onKitReady?: (job: MatchedJob) => void;
  onJobSaved?: (jobId: string) => void;
};

function kitReadyFromJob(job: MatchedJob, kitByJob: Record<string, AssetStatus>): boolean {
  const local = kitByJob[job.job_id];
  if (local === "ready") return true;
  if (local === "loading" || local === "error") return false;
  return job.action_state === "kit_ready";
}

export function useJobCardAssets(options: UseJobCardAssetsOptions = {}) {
  const router = useRouter();
  const { toast } = useToast();
  const { trackAndWait } = useAiOperations();
  const [kitByJob, setKitByJob] = useState<Record<string, AssetStatus>>({});
  const [roadmapByJob, setRoadmapByJob] = useState<Record<string, AssetStatus>>({});
  const [resumeIdByJob, setResumeIdByJob] = useState<Record<string, string>>({});
  const [roadmapIdByJob, setRoadmapIdByJob] = useState<Record<string, string>>({});
  const [preview, setPreview] = useState<KitPreviewState>(null);

  const openKitPreview = useCallback(
    async (job: MatchedJob, tab: KitPreviewTab = "resume") => {
      let resumeId: string | null = resumeIdByJob[job.job_id] ?? null;
      if (!resumeId) {
        const kit = await getApplicationKitForJob(job.job_id).catch(() => null);
        resumeId = kit?.tailored_resume_id ?? null;
        if (resumeId) {
          setResumeIdByJob((s) => ({ ...s, [job.job_id]: resumeId! }));
          setKitByJob((s) => ({ ...s, [job.job_id]: "ready" }));
        }
      }
      setPreview({
        jobId: job.job_id,
        jobTitle: job.title,
        resumeId,
        tab,
      });
    },
    [resumeIdByJob]
  );

  const closePreview = useCallback(() => setPreview(null), []);

  const handlePrepareKit = useCallback(
    async (job: MatchedJob) => {
      const status = kitByJob[job.job_id];
      if (kitReadyFromJob(job, kitByJob)) {
        await openKitPreview(job, "resume");
        return;
      }
      if (status === "loading") return;

      setKitByJob((s) => ({ ...s, [job.job_id]: "loading" }));
      try {
        options.onJobSaved?.(job.job_id);
        // Must finish save BEFORE prepare — inactive/off-market jobs are only
        // eligible for kits when a saved_jobs row exists.
        await saveJob(job.job_id).catch(() => undefined);

        const existing = await getApplicationKitForJob(job.job_id).catch(() => null);
        if (existing?.tailored_resume_id) {
          setResumeIdByJob((s) => ({
            ...s,
            [job.job_id]: existing.tailored_resume_id!,
          }));
          setKitByJob((s) => ({ ...s, [job.job_id]: "ready" }));
          options.onKitReady?.(job);
          toast.success(
            `Kit ready for ${job.title}${job.company_name ? ` at ${job.company_name}` : ""}`,
          );
          await openKitPreview(job, "resume");
          return;
        }

        // One-tap: enqueue + wait here instead of only deep-linking to chat.
        const {
          prepareApplicationKit,
          fetchReadyApplicationKit,
        } = await import("@/lib/api/applicationKit");
        const outcome = await prepareApplicationKit(job.job_id);
        if (outcome.status === "ready") {
          const resumeId = outcome.data.resume.resume_id;
          if (resumeId) {
            setResumeIdByJob((s) => ({ ...s, [job.job_id]: resumeId }));
          }
          setKitByJob((s) => ({ ...s, [job.job_id]: "ready" }));
          options.onKitReady?.(job);
          toast.success(
            `Kit ready for ${job.title}${job.company_name ? ` at ${job.company_name}` : ""}`,
          );
          await openKitPreview(job, "resume");
          return;
        }

        const terminal = await trackAndWait(outcome.operation, {
          kind: AI_OPERATION_KINDS.applicationKit,
        });
        if (terminal.status !== "succeeded") {
          throw new Error(
            terminal.error_message?.trim() ||
              terminal.message.trim() ||
              "Couldn't prepare application kit",
          );
        }
        const ready = await fetchReadyApplicationKit(job.job_id);
        const resumeId = ready.resume.resume_id;
        if (resumeId) {
          setResumeIdByJob((s) => ({ ...s, [job.job_id]: resumeId }));
        }
        setKitByJob((s) => ({ ...s, [job.job_id]: "ready" }));
        options.onKitReady?.(job);
        toast.success(
          `Kit ready for ${job.title}${job.company_name ? ` at ${job.company_name}` : ""}`,
        );
        await openKitPreview(job, "resume");
      } catch (err) {
        setKitByJob((s) => ({ ...s, [job.job_id]: "error" }));
        // Fallback: open chat deep-link so the candidate can still finish.
        const params = new URLSearchParams();
        params.set("kit_job_id", job.job_id);
        if (job.title) params.set("kit_title", job.title);
        if (job.company_name) params.set("kit_company", job.company_name);
        router.push(`/dashboard?${params.toString()}`);
        toast.error((err as Error).message ?? "Couldn't prepare kit — opened chat to retry");
      }
    },
    [kitByJob, openKitPreview, options, router, toast, trackAndWait]
  );

  const handleLearningRoadmap = useCallback(
    async (job: MatchedJob) => {
      const status = roadmapByJob[job.job_id];
      if (status === "ready") {
        const roadmapId = roadmapIdByJob[job.job_id];
        if (roadmapId) {
          try {
            await openLearningRoadmap(roadmapId);
          } catch (err) {
            toast.error((err as Error).message ?? "Couldn't open roadmap");
          }
        }
        return;
      }
      if (status === "loading") return;

      setRoadmapByJob((s) => ({ ...s, [job.job_id]: "loading" }));
      try {
        const outcome = await requestLearningRoadmap(job.job_id);
        let roadmapId: string;
        if (outcome.status === "ready") {
          roadmapId = outcome.data.roadmap_id;
        } else {
          const terminal = await trackAndWait(outcome.operation, {
            kind: AI_OPERATION_KINDS.learningRoadmap,
          });
          if (terminal.status !== "succeeded" || !terminal.result_id) {
            throw new Error(
              terminal.error_message?.trim() ||
                terminal.message.trim() ||
                "Couldn't build roadmap",
            );
          }
          roadmapId = terminal.result_id;
        }
        setRoadmapIdByJob((s) => ({ ...s, [job.job_id]: roadmapId }));
        await openLearningRoadmap(roadmapId);
        setRoadmapByJob((s) => ({ ...s, [job.job_id]: "ready" }));
      } catch (err) {
        setRoadmapByJob((s) => ({ ...s, [job.job_id]: "error" }));
        toast.error((err as Error).message ?? "Couldn't build roadmap");
      }
    },
    [roadmapByJob, roadmapIdByJob, toast, trackAndWait]
  );

  return {
    kitByJob,
    roadmapByJob,
    preview,
    openKitPreview,
    closePreview,
    handlePrepareKit,
    handleLearningRoadmap,
  };
}
