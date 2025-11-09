import { useMemo, useState } from 'react';

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

export function useTaskSessions(initial: Session[] = []) {
  const [sessions, setSessions] = useState<Session[]>(initial);

  const activeToday = useMemo(() => sessions.find((s) => s.dateKey === dateKey() && !s.ended_at), [sessions]);

  const startToday = async () => {
    if (activeToday) return activeToday;
    const g = await geo();
    const s: Session = {
      id: crypto.randomUUID(),
      dateKey: dateKey(),
      started_at: new Date().toISOString(),
      start_geo: g,
      beforePhotos: [],
      afterPhotos: [],
      media: [],
    };
    setSessions((prev) => [...prev, s]);
    return s;
  };

  const endActive = async (): Promise<Session[] | undefined> => {
    if (!activeToday) return undefined;
    const g = await geo();
    let nextOut: Session[] | undefined;
    setSessions((prev) => {
      const next = prev.map((s) => (s.id === activeToday.id ? { ...s, ended_at: new Date().toISOString(), end_geo: g } : s));
      nextOut = next;
      return next;
    });
    return nextOut;
  };

  const upsert = (update: Partial<Session> & { id: string }) => {
    setSessions((prev) => prev.map((s) => (s.id === update.id ? { ...s, ...update } : s)));
  };

  return { sessions, setSessions, activeToday, startToday, endActive, upsert };
}
