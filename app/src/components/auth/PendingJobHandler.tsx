"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from '@supabase/ssr';

export function PendingJobHandler() {
  const router = useRouter();
  const checked = useRef(false);

  useEffect(() => {
    if (checked.current) return;
    checked.current = true;

    const checkPendingJob = async () => {
      const pendingRaw = localStorage.getItem('hireschema:pending_app_kit_job');
      if (!pendingRaw) return;

      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        try {
          const pendingJob = JSON.parse(pendingRaw);
          // Insert into saved_jobs (assuming a standard structure, adjust table name if needed)
          // Based on migrations this would usually be candidate_saved_jobs or similar.
          // For MVP, we redirect directly to the new-kit page with the job data, which can do the saving.
          
          localStorage.removeItem('hireschema:pending_app_kit_job');
          
          // Redirect to the kit creation page
          router.push(`/jobs/new-kit?jobId=${pendingJob.id}`);
        } catch (e) {
          console.error("Failed to parse pending job", e);
          localStorage.removeItem('hireschema:pending_app_kit_job');
        }
      }
    };

    checkPendingJob();
  }, [router]);

  return null;
}
