import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@repo/ui/card';
import { Button } from '@repo/ui/button';
import { Badge } from '@repo/ui/badge';
import { Label } from '@repo/ui/label';
import { Textarea } from '@repo/ui/textarea';
import { Separator } from '@repo/ui/separator';
import { Camera, Mic, Check, Play, CheckCircle2, ArrowLeft, MapPin, Phone } from 'lucide-react';
import type { TaskHeaderValue } from '../forms/taskSessionSchema';
import { SignaturePad } from './SignaturePad';
import { useTaskSessions, type Session } from '../../hooks/useTaskSessions';

type SimpleTaskValue = {
  // Identifier
  id?: string;
  // Header
  client?: string;
  clientSite?: string;
  siteMapUrl?: string;
  taskType?: string;
  title?: string;
  onsiteContactName?: string;
  contactNumber?: string;
  priority?: 'Low' | 'Medium' | 'High' | 'Critical';
  status?: 'New' | 'In Progress' | 'Completed';
  origin?: 'admin' | 'user';
  // Sessions
  sessions?: Session[];
};

type Props = {
  value: SimpleTaskValue;
  onChange?: (next: SimpleTaskValue) => void;
  onBack?: () => void;
  onComplete?: (payload: any) => void;
};


export function TaskFormSimple({ value, onChange, onBack, onComplete }: Props) {
  const header: TaskHeaderValue = useMemo(
    () => ({
      client: value.client,
      clientSite: value.clientSite,
      taskType: value.taskType,
      title: value.title,
      onsiteContactName: value.onsiteContactName,
      contactNumber: value.contactNumber,
      priority: (value.priority as any) ?? 'Medium',
      status: (value.status as any) ?? 'New',
    }),
    [value]
  );

  // Sessions hook (captures geo/time) - pass task ID for persistence
  const { sessions, setSessions, activeToday, startToday, endActive, upsert } = useTaskSessions(value.sessions || [], value.id);
  const active = activeToday;

  // Pre-start captures (before creating a session)
  const [preBeforePhotos, setPreBeforePhotos] = useState<string[]>([]);
  const [preNotes, setPreNotes] = useState<string>('');

  // Per-session captures
  const [signature, setSignature] = useState<string | undefined>(undefined);
  const [ackName, setAckName] = useState<string>("");
  const [ackPhone, setAckPhone] = useState<string>("");
  const [ackNote, setAckNote] = useState<string>("");
  const fileInputBefore = useRef<HTMLInputElement | null>(null);
  const fileInputAfter = useRef<HTMLInputElement | null>(null);

  // Derive counts
  const beforeCount = active ? (active.beforePhotos?.length ?? 0) : preBeforePhotos.length;
  const afterCount = active?.afterPhotos?.length ?? 0;

  const emit = (next: Partial<SimpleTaskValue>) => {
    const merged: SimpleTaskValue = { ...value, ...next };
    onChange?.(merged);
  };

  // Keep parent value in sync with sessions
  useEffect(() => {
    emit({ sessions });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessions]);

  // Helper function to convert File to base64 data URL for persistent storage
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const addPreBeforePhotos = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    // Convert files to base64 data URLs for persistence
    const base64Promises = Array.from(files).map(f => fileToBase64(f));
    const base64Urls = await Promise.all(base64Promises);
    setPreBeforePhotos((prev) => {
      const next = [...prev, ...base64Urls].slice(0, 8);
      return next;
    });
  };

  const addAfterPhotos = async (files: FileList | null) => {
    if (!files || files.length === 0 || !active) return;
    // Convert files to base64 data URLs for persistence
    const base64Promises = Array.from(files).map(f => fileToBase64(f));
    const base64Urls = await Promise.all(base64Promises);
    const current = active.afterPhotos || [];
    const limited = [...current, ...base64Urls].slice(0, 8);
    upsert({ id: active.id, afterPhotos: limited });
  };


  const setNotes = (text: string) => {
    if (!active) {
      setPreNotes(text);
      return;
    }
    upsert({ id: active.id, notes: text });
  };

  const onStartSession = async () => {
    if (beforeCount < 1) return;
    // Pass pre-start photos/notes directly to startToday to avoid race condition
    await startToday({ beforePhotos: preBeforePhotos, notes: preNotes });

    setPreBeforePhotos([]);
    setPreNotes('');
    emit({ status: 'In Progress' });
  };

  const endToday = async () => {
    if (!active) return;
    if (afterCount < 1 || !signature) {
      alert('Need at least 1 after photo and signature');
      return;
    }
    // attach signature to current session (typed as any to allow extra field)
    upsert({ id: active.id, signatureDataUrl: signature } as any);
    await endActive();
    emit({ status: 'In Progress' });
    setSignature(undefined);
  };

  const completeTask = async () => {
    if (!active) return;
    if (afterCount < 1 || !signature) {
      alert('Need at least 1 after photo and signature');
      return;
    }
    upsert({ id: active.id, signatureDataUrl: signature } as any);

    // End active session and mark task as Completed
    await endActive(true);

    emit({ status: 'Completed' });
    setSignature(undefined);
    try {
      const final = { ...value, status: 'Completed', sessions, ack: { name: ackName || undefined, phone: ackPhone || undefined, note: ackNote || undefined }, finalSignature: signature } as any;
      onComplete?.(final);
    } catch { }
  };

  // Simple validations for the demo structure
  const canStartSession = beforeCount >= 1 && !active;
  const canEnd = (afterCount >= 1 && !!signature) || false;
  const canComplete = (afterCount >= 1 && !!signature) || false;

  return (
    <div className="flex flex-col gap-4 p-4 pb-32">
      {/* Back */}
      <div className="-mt-1">
        {onBack && (
          <Button variant="ghost" size="sm" onClick={onBack} aria-label="Back" className="px-2">
            <ArrowLeft className="mr-1.5 h-4 w-4" /> Back
          </Button>
        )}
      </div>
      {/* Header removed to avoid duplication with schema title */}
      <Card>
        <CardContent className="p-4 sm:p-6">
          <div className="space-y-6">
            {/* Task Title */}
            <div>
              <h2 className="text-xl font-semibold text-foreground">{header.title || 'Task Details'}</h2>
            </div>

            {/* Status Banner */}
            <div className="flex flex-wrap items-center gap-4 rounded-lg border bg-muted/40 p-4">
              <div className="flex items-center gap-4">
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</span>
                  <Badge
                    variant={
                      header.status === 'Completed' ? 'default' :
                        header.status === 'In Progress' ? 'secondary' :
                          'outline'
                    }
                    className="w-fit px-3 py-1"
                  >
                    {header.status || 'New'}
                  </Badge>
                </div>
                <div className="h-8 w-px bg-border" />
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Priority</span>
                  <Badge
                    variant={
                      header.priority === 'Critical' || header.priority === 'High' ? 'destructive' :
                        header.priority === 'Medium' ? 'secondary' :
                          'outline'
                    }
                    className="w-fit px-3 py-1"
                  >
                    {header.priority || 'Medium'}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Client Information */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-foreground/80">Client Information</h4>
              <div className="rounded-md border p-4 space-y-4 bg-card">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs text-muted-foreground">Client Name</Label>
                    <p className="mt-1 font-medium">{header.client || '—'}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Site Location</Label>
                    <div className="mt-1 flex items-center gap-2">
                      <p className="font-medium">{header.clientSite || '—'}</p>
                      {value.siteMapUrl && (
                        <a
                          href={value.siteMapUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center rounded-md p-1.5 hover:bg-accent transition-colors"
                          aria-label="Open in Google Maps"
                        >
                          <MapPin className="h-4 w-4 text-primary" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs text-muted-foreground">On-Site Contact</Label>
                    <p className="mt-1 font-medium">{header.onsiteContactName || '—'}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Contact Number</Label>
                    {header.contactNumber ? (
                      <a
                        href={`tel:${header.contactNumber}`}
                        className="mt-1 font-medium inline-flex items-center gap-2 text-primary hover:underline"
                      >
                        <Phone className="h-4 w-4" />
                        {header.contactNumber}
                      </a>
                    ) : (
                      <p className="mt-1 font-medium">—</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Task Information */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-foreground/80">Task Information</h4>
              <div className="rounded-md border p-4 bg-card">
                <div>
                  <Label className="text-xs text-muted-foreground">Task Type</Label>
                  <div className="mt-1">
                    <Badge variant="outline" className="font-normal">{header.taskType || '—'}</Badge>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      {/* Start Work card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Take before photo to start work</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Before photos grid */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <Label>Before Photos</Label>
              <span className="text-muted-foreground">{beforeCount}/8</span>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {(active ? active.beforePhotos : preBeforePhotos)?.map((u) => (
                <img key={u} src={u} className="w-full aspect-square rounded-md border object-cover" />
              ))}
              {beforeCount < 8 && (
                <Button
                  type="button"
                  variant="outline"
                  className="w-full aspect-square p-0 flex flex-col items-center justify-center gap-1 border-dashed"
                  onClick={() => fileInputBefore.current?.click()}
                  aria-label="Add before photo"
                >
                  <Camera className="h-7 w-5" />
                </Button>
              )}
              <input
                ref={fileInputBefore}
                type="file"
                accept="image/*"
                multiple
                capture="environment"
                className="hidden"
                onChange={async (e) => {
                  if (active) {
                    // allow adding "before" even after start, capped at 8
                    const files = e.target.files;
                    if (files && files.length > 0) {
                      const base64Promises = Array.from(files).map(f => fileToBase64(f));
                      const base64Urls = await Promise.all(base64Promises);
                      const current = active.beforePhotos || [];
                      const limited = [...current, ...base64Urls].slice(0, 8);
                      upsert({ id: active.id, beforePhotos: limited });
                    }
                  } else {
                    addPreBeforePhotos(e.target.files);
                  }
                }}
              />
            </div>
            <p className="text-xs text-muted-foreground">Minimum 1, maximum 8 photos per session.</p>
          </div>

          {/* Notes are optional; shown after first photo */}
          {beforeCount > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="notes">Notes (optional)</Label>
                <Button
                  type="button"
                  size="icon"
                  variant="outline"
                  onClick={() => {
                    // Placeholder mic action for demo
                    alert('Voice input not implemented in simple preview');
                  }}
                >
                  <Mic className="h-4 w-4" />
                </Button>
              </div>
              <Textarea
                id="notes"
                placeholder="Add brief remarks"
                value={active ? (active.notes ?? '') : preNotes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </div>
          )}
          {/* Start Session button (shown only before a session starts) */}
          {!active && (
            <div className="pt-2">
              <Button
                size="lg"
                className="w-full"
                onClick={onStartSession}
                disabled={!canStartSession}
              >
                <Play className="mr-2 h-5 w-5" /> Start Session
              </Button>
            </div>
          )}

        </CardContent>
      </Card>

      {/* End / Complete section */}
      {active && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Finish work</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* After photos */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <Label>After Photos</Label>
                <span className="text-muted-foreground">{afterCount}/8</span>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {active.afterPhotos?.map((u) => (
                  <img key={u} src={u} className="w-full aspect-square rounded-md border object-cover" />
                ))}
                {afterCount < 8 && (
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full aspect-square p-0 flex flex-col items-center justify-center gap-1 border-dashed"
                    onClick={() => fileInputAfter.current?.click()}
                    aria-label="Add after photo"
                  >
                    <Camera className="h-5 w-5" />
                  </Button>
                )}
                <input
                  ref={fileInputAfter}
                  type="file"
                  accept="image/*"
                  multiple
                  capture="environment"
                  className="hidden"
                  onChange={(e) => addAfterPhotos(e.target.files)}
                />
              </div>
              <p className="text-xs text-muted-foreground">Minimum 1, maximum 8 photos per session.</p>
            </div>

            {/* Signature */}
            <div className="space-y-2">
              <Label>Client Signature</Label>
              <SignaturePad value={signature} onChange={setSignature} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <Label>Contact Name</Label>
                <input
                  className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
                  placeholder="Name"
                  value={ackName}
                  onChange={(e) => setAckName(e.target.value)}
                />
              </div>
              <div>
                <Label>Contact Phone</Label>
                <input
                  className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
                  placeholder="Phone"
                  value={ackPhone}
                  onChange={(e) => setAckPhone(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-1">
              <Label>Client Notes (optional)</Label>
              <Textarea
                placeholder="Client remarks..."
                rows={3}
                value={ackNote}
                onChange={(e) => setAckNote(e.target.value)}
              />
            </div>

            <Separator />
          </CardContent>
        </Card>
      )}

      {/* Timeline preview */}
      {sessions.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Timeline</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {sessions.map((s, idx) => (
              <div key={s.id} className="rounded border p-3">
                <div className="flex items-center justify-between text-sm">
                  <div className="font-medium">Session #{idx + 1}</div>
                  {(s as any).signatureDataUrl && (
                    <span className="inline-flex items-center gap-1 text-emerald-600">
                      <Check className="h-4 w-4" /> Signed
                    </span>
                  )}
                </div>
                <div className="mt-2 text-xs text-muted-foreground">
                  <div>
                    Start: {s.started_at ? new Date(s.started_at).toLocaleString() : '—'}
                    {s.start_geo && (
                      <> — {s.start_geo.lat.toFixed(5)}, {s.start_geo.lng.toFixed(5)}{typeof s.start_geo.accuracy === 'number' ? ` (±${Math.round(s.start_geo.accuracy)}m)` : ''}</>
                    )}
                  </div>
                  <div>
                    End: {s.ended_at ? new Date(s.ended_at).toLocaleString() : '—'}
                    {s.end_geo && (
                      <> — {s.end_geo.lat.toFixed(5)}, {s.end_geo.lng.toFixed(5)}{typeof s.end_geo.accuracy === 'number' ? ` (±${Math.round(s.end_geo.accuracy)}m)` : ''}</>
                    )}
                  </div>
                </div>
                <div className="mt-2 text-xs">
                  <span className="mr-4">Before: {s.beforePhotos.length}</span>
                  <span>After: {s.afterPhotos.length}</span>
                </div>
                {s.notes && <div className="mt-2 text-sm">Notes: {s.notes}</div>}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Sticky actions footer visible only when a session is active */}
      {active && (
        <div className="sticky bottom-0 z-10 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="mx-auto max-w-3xl p-3">
            <div className="space-y-2">
              <div className="flex flex-wrap justify-end gap-2">
                <Button
                  variant="secondary"
                  disabled={!canEnd}
                  onClick={endToday}
                  className="flex-none text-sm px-3 py-2"
                >
                  End Today (Continue Tomorrow)
                </Button>
                <Button disabled={!canComplete} onClick={completeTask} className="flex-none text-sm px-3 py-2">
                  <CheckCircle2 className="mr-2 h-4 w-4" /> Complete Task
                </Button>
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-muted-foreground">Work in Progress</p>
              </div>
            </div>
          </div>
        </div>
      )}


    </div>
  );
}

export default TaskFormSimple;
