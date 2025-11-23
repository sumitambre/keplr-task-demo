import { useMemo, useState, useEffect, useCallback, useRef } from 'react';

const safeSaveToLocalStorage = (key: string, data: any) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.warn('LocalStorage quota exceeded. Saving without photos.');
    try {
      const lite = Array.isArray(data) ? data.map((s: any) => ({ ...s, beforePhotos: [], afterPhotos: [], media: [] })) : data;
      localStorage.setItem(key, JSON.stringify(lite));
    } catch (e2) {
      console.error('Failed to save to localStorage:', e2);
    }
  }
};

export type Session = {
  id: string;
  dateKey: string; // YYYY-MM-DD
  started_at?: string; // ISO
  start_geo?: { lat: number; lng: number; accuracy?: number };
  beforePhotos: string[]; // object URLs for now
  notes?: string;
  media?: string[];
  ended_at?: string; // ISO
  end_geo?: { lat: number; lng: number; accuracy?: number };
  afterPhotos: string[];
  // Optional signature per session (data URL for preview in UI)
  signatureDataUrl?: string;
};

export const dateKey = (d = new Date()) => {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

const geo = () =>
  new Promise<{ lat: number; lng: number; accuracy?: number } | undefined>((resolve) => {
    if (!('geolocation' in navigator)) return resolve(undefined);
    navigator.geolocation.getCurrentPosition(
      (p) => resolve({ lat: p.coords.latitude, lng: p.coords.longitude, accuracy: p.coords.accuracy }),
      () => resolve(undefined),
      { enableHighAccuracy: true, maximumAge: 60_000, timeout: 6_000 },
    );
  });

// Get API URL from environment
const getApiUrl = () => {
  return ((import.meta as any)?.env?.VITE_API_URL as string | undefined)?.replace(/\/$/, '') || '';
};

export function useTaskSessions(initial: Session[] = [], taskId?: string) {
  const [sessions, setSessions] = useState<Session[]>(initial);
  const [isSyncing, setIsSyncing] = useState(false);
  const initializedRef = useRef<string | undefined>(undefined);

  const activeToday = useMemo(() => sessions.find((s) => s.dateKey === dateKey() && !s.ended_at), [sessions]);

  // Persist sessions to backend when they change
  const syncToBackend = useCallback(async (updatedSessions: Session[], explicitStatus?: string) => {
    if (!taskId) {
      // Save to localStorage if no taskId (fallback)
      safeSaveToLocalStorage(`task-sessions-v2-${taskId || 'temp'}`, updatedSessions);
      return;
    }

    try {
      setIsSyncing(true);
      const apiUrl = getApiUrl();

      // Update the task with the new sessions data
      const response = await fetch(`${apiUrl}/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessions: updatedSessions,
          // Also update the status if sessions exist
          status: explicitStatus || (updatedSessions.some(s => !s.ended_at) ? 'In Progress' :
            updatedSessions.some(s => s.ended_at) ? 'In Progress' : 'New'),
        }),
      });

      if (!response.ok) {
        console.error('Failed to sync sessions to backend');
        // Fallback to localStorage
        safeSaveToLocalStorage(`task-sessions-v2-${taskId}`, updatedSessions);
      } else {
        // Also save to localStorage as backup
        safeSaveToLocalStorage(`task-sessions-v2-${taskId}`, updatedSessions);
      }
    } catch (error) {
      console.error('Error syncing sessions:', error);
      // Fallback to localStorage
      safeSaveToLocalStorage(`task-sessions-v2-${taskId || 'temp'}`, updatedSessions);
    } finally {
      setIsSyncing(false);
    }
  }, [taskId]);

  // Initialize sessions ONCE on mount from initial prop or localStorage
  // Reinitialize only when switching to a different task
  useEffect(() => {
    // Only initialize if this is a new taskId or first mount
    if (initializedRef.current === taskId) {
      return;
    }

    // If we have initial sessions from the backend, use them
    if (initial && initial.length > 0) {
      setSessions(initial);
      initializedRef.current = taskId;
      // Also cache to localStorage
      if (taskId) {
        safeSaveToLocalStorage(`task-sessions-v2-${taskId}`, initial);
      }
    } else if (taskId) {
      // Otherwise, try to load from localStorage
      const cached = localStorage.getItem(`task-sessions-v2-${taskId}`);
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          if (parsed && parsed.length > 0) {
            setSessions(parsed);
            initializedRef.current = taskId;
          } else {
            // No cached data, initialize with empty
            setSessions([]);
            initializedRef.current = taskId;
          }
        } catch (e) {
          console.error('Failed to parse cached sessions', e);
          setSessions([]);
          initializedRef.current = taskId;
        }
      } else {
        // No cached data, initialize with empty
        setSessions([]);
        initializedRef.current = taskId;
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [taskId]); // Only re-run when taskId changes

  const isStartingRef = useRef(false);

  const startToday = async (initialData?: { beforePhotos?: string[], notes?: string }) => {
    if (activeToday) return activeToday;
    if (isStartingRef.current) return undefined; // Prevent double submission

    isStartingRef.current = true;
    try {
      const g = await geo();
      const s: Session = {
        id: crypto.randomUUID(),
        dateKey: dateKey(),
        started_at: new Date().toISOString(),
        start_geo: g,
        beforePhotos: initialData?.beforePhotos || [],
        afterPhotos: [],
        media: [],
        notes: initialData?.notes,
      };

      setSessions(prev => {
        // Double check if active session exists in latest state
        const existing = prev.find(p => p.dateKey === dateKey() && !p.ended_at);
        if (existing) return prev;

        const newSessions = [...prev, s];
        syncToBackend(newSessions);
        return newSessions;
      });

      return s;
    } finally {
      isStartingRef.current = false;
    }
  };

  const endActive = async (isComplete = false) => {
    if (!activeToday) return;
    const g = await geo();
    const now = new Date().toISOString();

    setSessions(prev => {
      const next = prev.map(s => s.id === activeToday.id ? { ...s, ended_at: now, end_geo: g } : s);
      syncToBackend(next, isComplete ? 'Completed' : undefined);
      return next;
    });
  };

  const upsert = (update: Partial<Session> & { id: string }) => {
    setSessions(prev => {
      const nextSessions = prev.map((s) => (s.id === update.id ? { ...s, ...update } : s));
      syncToBackend(nextSessions);
      return nextSessions;
    });
  };

  return { sessions, setSessions, activeToday, startToday, endActive, upsert, isSyncing };
}
