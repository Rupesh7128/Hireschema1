export interface PendingAppKitJob {
  id: string;
  title: string;
  company: string;
  location: string;
  url: string;
  work_type?: string;
  salary?: string;
  tags?: string[];
}

const STORAGE_KEY = 'hireschema:pending_app_kit_job';

export function savePendingJob(job: PendingAppKitJob) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(job));
  }
}

export function getPendingJob(): PendingAppKitJob | null {
  if (typeof window !== 'undefined') {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      try {
        return JSON.parse(data);
      } catch (e) {
        console.error('Failed to parse pending job from local storage', e);
        return null;
      }
    }
  }
  return null;
}

export function clearPendingJob() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_KEY);
  }
}
