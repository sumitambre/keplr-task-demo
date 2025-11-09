import React from 'react';
import { Button } from '@repo/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@repo/ui/card';
import { Badge } from '@repo/ui/badge';
import { ArrowLeft, Printer, Share2, MapPin, Clock, Image as ImageIcon } from 'lucide-react';

interface TaskPDFPreviewProps {
  task: any;
  onBack: () => void;
}

export function TaskPDFPreview({ task, onBack }: TaskPDFPreviewProps) {
  const sessions = (task as any).sessions || [];
  const client = task.client || task.clientName || '—';
  const site = task.clientSite || task.siteName || '';
  const workTitle = task.title || '—';
  const status = task.status || 'Completed';
  const finalSignature = (task as any).finalSignature || [...sessions].reverse().find((s: any) => s.signatureDataUrl)?.signatureDataUrl || (task as any).signature;
  const ack = (task as any).ack || {};
  const totalMs = sessions.reduce((sum: number, s: any) => {
    const a = s.started_at ? new Date(s.started_at).getTime() : 0;
    const b = s.ended_at ? new Date(s.ended_at).getTime() : a;
    return sum + Math.max(0, b - a);
  }, 0);
  const totalHours = Math.floor(totalMs / 3_600_000);
  const totalMinutes = Math.round((totalMs % 3_600_000) / 60_000);
  const handlePrint = () => {
    window.print();
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `Task Report - ${client}`,
        text: `Task completed for ${client}: ${workTitle}`,
        url: window.location.href,
      });
    } else {
      // Fallback for browsers that don't support Web Share API
      const shareData = `Task Report - ${client}\n${workTitle}\nCompleted on ${new Date().toLocaleDateString()}`;
      navigator.clipboard.writeText(shareData);
      alert('Report details copied to clipboard');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-background text-foreground border-b p-4 print:hidden">
        <div className="flex items-center gap-3 mb-2">
          <Button 
            variant="ghost" 
            size="icon"
            className="text-foreground hover:bg-accent"
            onClick={onBack}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl">Task - PDF Preview</h1>
        </div>
      </div>

      {/* PDF Content */}
      <div className="p-4 max-w-2xl mx-auto">
        <Card className="print:shadow-none print:border-0">
          <CardHeader className="text-center border-b">
            <CardTitle className="text-2xl">Task Completion Report</CardTitle>
            <Badge variant="outline" className="w-fit mx-auto">{status}</Badge>
          </CardHeader>
          
          <CardContent className="p-6 space-y-6">
            {/* Job Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold mb-2">Client Information</h3>
                <p><strong>Client:</strong> {client}</p>
                {site && <p><strong>Site:</strong> {site}</p>}
                <p><strong>Work Title:</strong> {workTitle}</p>
                <p><strong>Status:</strong> {status}</p>
                {sessions.length > 0 && (
                  <p><strong>Sessions:</strong> {sessions.length}</p>
                )}
              </div>
              {/* Right column intentionally left minimal per request */}
              <div></div>
            </div>

            {/* Session Timeline */}
            {sessions.length > 0 && (
              <div className="space-y-4">
                <h3 className="font-semibold">Session Timeline</h3>
                {sessions.map((s: any, idx: number) => (
                  <div key={s.id || idx} className="rounded-md border p-3">
                    <div className="flex items-center justify-between">
                      <div className="font-medium">Session #{idx + 1} — {s.dateKey || (s.started_at && new Date(s.started_at).toLocaleDateString())}</div>
                      {s.signatureDataUrl && <span className="text-emerald-600 text-xs">Signed</span>}
                    </div>
                    <div className="mt-1 grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />Start: {s.started_at ? new Date(s.started_at).toLocaleString() : '—'}</div>
                      <div className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />End: {s.ended_at ? new Date(s.ended_at).toLocaleString() : '—'}</div>
                      <div className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />Start Geo: {s.start_geo ? `${s.start_geo.lat?.toFixed(5)}, ${s.start_geo.lng?.toFixed(5)}${typeof s.start_geo.accuracy === 'number' ? ` (±${Math.round(s.start_geo.accuracy)}m)` : ''}` : '—'}</div>
                      <div className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />End Geo: {s.end_geo ? `${s.end_geo.lat?.toFixed(5)}, ${s.end_geo.lng?.toFixed(5)}${typeof s.end_geo.accuracy === 'number' ? ` (±${Math.round(s.end_geo.accuracy)}m)` : ''}` : '—'}</div>
                    </div>
                    {s.notes && <div className="mt-2 text-sm">Notes: {s.notes}</div>}
                    <div className="mt-2 grid grid-cols-2 md:grid-cols-2 gap-4">
                      {Array.isArray(s.beforePhotos) && s.beforePhotos.length > 0 && (
                        <div>
                          <div className="flex items-center gap-2 mb-1 text-sm font-medium"><ImageIcon className="h-4 w-4" /> Before Photos ({s.beforePhotos.length})</div>
                          <div className="flex flex-wrap gap-3">
                            {s.beforePhotos.map((u: string, i: number) => (
                              <img key={u + i} src={u} className="w-[30%] rounded border object-cover" />
                            ))}
                          </div>
                        </div>
                      )}
                      {Array.isArray(s.afterPhotos) && s.afterPhotos.length > 0 && (
                        <div>
                          <div className="flex items-center gap-2 mb-1 text-sm font-medium"><ImageIcon className="h-4 w-4" /> After Photos ({s.afterPhotos.length})</div>
                          <div className="flex flex-wrap gap-3">
                            {s.afterPhotos.map((u: string, i: number) => (
                              <img key={u + i} src={u} className="w-[30%] rounded border object-cover" />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                <div className="text-sm text-muted-foreground">
                  Total time: {totalHours}h {totalMinutes}m
                </div>
              </div>
            )}

            {/* Remarks */}
            {task.remarks && (
              <div>
                <h3 className="font-semibold mb-2">Remarks</h3>
                <div className="bg-muted p-3 rounded-lg">
                  <p>{task.remarks}</p>
                </div>
              </div>
            )}

            {/* Final Signature */}
            {finalSignature && (
              <div>
                <h3 className="font-semibold mb-2">Final Client Signature</h3>
                <div className="border rounded-lg p-4 bg-card">
                  <img 
                    src={finalSignature} 
                    alt="Client signature"
                    className="max-w-full h-auto"
                  />
                </div>
                {(ack.name || ack.phone) && (
                  <div className="mt-2 text-sm text-muted-foreground">
                    {ack.name && <div><strong>Name:</strong> {ack.name}</div>}
                    {ack.phone && <div><strong>Phone:</strong> {ack.phone}</div>}
                  </div>
                )}
              </div>
            )}

            {/* Report Footer */}
            <div className="border-t pt-4 text-center text-sm text-muted-foreground">
              <p>Report generated on {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}</p>
              <p>Technician Console - Task Management System</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="p-4 border-t bg-background print:hidden">
        <div className="flex gap-2 max-w-2xl mx-auto">
          <Button 
            variant="outline" 
            onClick={handlePrint}
            className="flex-1"
          >
            <Printer className="mr-2 h-4 w-4" />
            Print
          </Button>
          <Button 
            onClick={handleShare}
            className="flex-1"
          >
            <Share2 className="mr-2 h-4 w-4" />
            Share
          </Button>
        </div>
      </div>
    </div>
  );
}
