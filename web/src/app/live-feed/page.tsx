"use client";

import { useEffect, useState } from "react";
import { createBrowserClient } from '@supabase/ssr';
import { LiveJob, LiveJobCard } from "@/components/livefeed/LiveJobCard";
import { Reveal } from "@/components/ui/Reveal";

export default function LiveFeedPage() {
  const [jobs, setJobs] = useState<LiveJob[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Note: For a production Next.js app, we could do initial data fetch on server side,
  // but since we need real-time updates and are mimicking the client-side architecture 
  // requested in MVP, doing it fully client side here for the live feed stream.

  useEffect(() => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Initial fetch
    const fetchJobs = async () => {
      const { data, error } = await supabase
        .from('live_feed_jobs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);
        
      if (!error && data) {
        setJobs(data as LiveJob[]);
      }
      setIsLoading(false);
    };

    fetchJobs();

    // Subscribe to new inserts
    const channel = supabase
      .channel('live-feed-changes')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'live_feed_jobs' },
        (payload) => {
          setJobs((current) => [payload.new as LiveJob, ...current]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <main className="min-h-screen bg-bg text-text pt-24 pb-16">
      <div className="container mx-auto px-4 max-w-7xl">
        <Reveal className="mb-12 text-center max-w-2xl mx-auto">
          <h1 className="text-display font-bold tracking-tight mb-4">
            Live <span className="text-accent">Job Feed</span>
          </h1>
          <p className="text-text-muted text-lg">
            Real-time opportunities synced directly from our market ingestion bots. 
            Create tailored application kits instantly.
          </p>
        </Reveal>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-64 bg-surface rounded-lg animate-pulse border border-border"></div>
            ))}
          </div>
        ) : jobs.length === 0 ? (
          <div className="text-center py-20 bg-surface rounded-lg border border-border">
            <h3 className="text-xl text-text font-semibold mb-2">No jobs available right now</h3>
            <p className="text-text-muted">Our bots are scouting the market. Check back in a few minutes.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {jobs.map((job) => (
              <Reveal key={job.id} delay={0.1}>
                <LiveJobCard job={job} />
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
