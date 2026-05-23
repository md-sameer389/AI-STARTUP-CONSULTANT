import { useState, useEffect } from 'react';
import { api } from '../api';

export function useJobStatus(jobId: string | null) {
  const [status, setStatus] = useState<'queued' | 'running' | 'completed' | 'failed' | null>(null);
  const [currentAgent, setCurrentAgent] = useState<string | null>(null);
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!jobId) {
      return;
    }

    setIsLoading(true);
    setError(null);

    // Initial check
    const checkStatus = async () => {
      try {
        const res = await api.getStatus(jobId);
        setStatus(res.status);
        setCurrentAgent(res.current_agent);
        setProgressPercent(res.progress_percent);
        setIsLoading(false);

        if (res.status === 'completed' || res.status === 'failed') {
          return true; // Stop indicator
        }
      } catch (err: any) {
        console.error('Error fetching job status:', err);
        setError(err.response?.data?.detail || 'Failed to fetch status update.');
        setIsLoading(false);
        return true; // Stop on errors to prevent flooding
      }
      return false;
    };

    checkStatus();

    // Start polling interval
    const intervalId = setInterval(async () => {
      const shouldStop = await checkStatus();
      if (shouldStop) {
        clearInterval(intervalId);
      }
    }, 3000);

    return () => clearInterval(intervalId);
  }, [jobId]);

  return { status, currentAgent, progressPercent, isLoading, error };
}
