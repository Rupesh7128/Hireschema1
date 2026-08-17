"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { savePendingJob, PendingAppKitJob } from "@/lib/pendingJobStorage";
import { useState, useEffect } from "react";
import { createBrowserClient } from '@supabase/ssr';

export interface LiveJob {
  id: string;
  title: string;
  company: string;
  location: string;
  work_type?: string;
  salary?: string;
  url: string;
  tags?: string[];
  created_at: string;
}

export function LiveJobCard({ job }: { job: LiveJob }) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Note: in a real app, you'd use a shared Supabase client from context.
  // We initialize one here to check session state on mount.
  useEffect(() => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthenticated(!!session);
    });
  }, []);

  const handleCreateKit = async () => {
    setIsProcessing(true);
    
    const pendingJob: PendingAppKitJob = {
      id: job.id,
      title: job.title,
      company: job.company,
      location: job.location,
      url: job.url,
      work_type: job.work_type,
      salary: job.salary,
      tags: job.tags
    };

    if (isAuthenticated) {
      // In production, we'd hit an API to save this to user's saved_jobs
      // For now, redirect to the app where they are authenticated
      router.push(`https://app.hireschema.com/jobs/new-kit?jobId=${job.id}`);
    } else {
      // Unauthenticated flow
      savePendingJob(pendingJob);
      router.push("https://app.hireschema.com/login?redirect=/dashboard");
    }
    
    setIsProcessing(false);
  };

  return (
    <div className="bg-surface border border-border rounded-lg p-6 hover:border-border-strong transition-colors flex flex-col h-full relative group">
      <div className="absolute inset-0 bg-surface-raised opacity-0 group-hover:opacity-100 transition-opacity rounded-lg -z-10 translate-y-1 translate-x-1"></div>
      <div className="flex-1">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-xl font-bold text-text mb-1 leading-tight">{job.title}</h3>
            <p className="text-text-muted font-medium">{job.company}</p>
          </div>
          {job.work_type && (
            <Badge variant="muted" className="text-accent">{job.work_type}</Badge>
          )}
        </div>
        
        <div className="space-y-2 mb-6">
          <div className="flex items-center text-text-subtle text-sm">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            {job.location}
          </div>
          
          {job.salary && (
            <div className="flex items-center text-text-subtle text-sm tabular-nums">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              {job.salary}
            </div>
          )}
        </div>
        
        {job.tags && job.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {job.tags.map(tag => (
              <span key={tag} className="text-xs px-2 py-1 bg-bg border border-border rounded-md text-text-muted">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="mt-auto pt-4 border-t border-border flex flex-col gap-3">
        <Button 
          variant="primary" 
          className="w-full bg-accent text-accent-fg hover:bg-accent-hover font-semibold"
          onClick={handleCreateKit}
          isLoading={isProcessing}
        >
          Create Application Kit
        </Button>
        <a 
          href={job.url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-center text-sm text-text-muted hover:text-text transition-colors"
        >
          View original listing ↗
        </a>
      </div>
    </div>
  );
}
