import React, { useState, useRef } from 'react';
import { Button } from '@repo/ui/button';
import { Label } from '@repo/ui/label';
import { Textarea } from '@repo/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@repo/ui/card';
import { TimeEditor } from './TimeEditor';
import type { Task } from '../../types';
import { ArrowLeft, Camera, FileText } from 'lucide-react';

interface TaskCompleteProps {
  task: Task;
  onComplete: (task: Task) => void;
  onBack: () => void;
}

export function TaskComplete({ task, onComplete, onBack }: TaskCompleteProps) {
  const [afterPhotos, setAfterPhotos] = useState<string[]>(task.afterPhotos || []);
  const [signature, setSignature] = useState(task.signature || '');
  const [finalRemarks, setFinalRemarks] = useState(task.remarks || '');
  const [startTime, setStartTime] = useState(task.startTime || '');
  const [endTime, setEndTime] = useState(task.endTime || new Date().toLocaleTimeString('en-US', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit'
  }));
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  const handleAddPhoto = () => {
    // Mock photo addition
    const mockPhotoUrl = `https://images.unsplash.com/photo-1581092162384-8987c1d64718?w=400&h=300&fit=crop`;
    setAfterPhotos(prev => [...prev, mockPhotoUrl]);
  };
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    setIsDrawing(true);
    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.beginPath();
      ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
      ctx.stroke();
    }
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (canvas) {
      setSignature(canvas.toDataURL());
    }
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        setSignature('');
      }
    }
  };

  const handleSaveAndGeneratePDF = () => {
    const completedTask = {
      ...task,
      afterPhotos,
      signature,
      remarks: finalRemarks,
      startTime,
      endTime,
      endLocation: { lat: 25.2048, lng: 55.2708 } // Mock geo location
    };

    onComplete(completedTask);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-background text-foreground border-b p-4">
        <div className="flex items-center gap-3 mb-3">
          <Button
            variant="ghost"
            size="icon"
            className="text-foreground hover:bg-accent"
            onClick={onBack}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl">Task - Complete</h1>
        </div>
        <div className="space-y-1">
          <TimeEditor
            time={endTime}
            onTimeChange={setEndTime}
            label="Completion time"
            className="text-primary-foreground"
          />
          <p className="text-sm opacity-90">Auto captured: Location</p>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Final Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Task Info */}
            <div className="bg-muted p-3 rounded-lg space-y-2">
              <p><strong>Client:</strong> {task.clientName}</p>
              <p><strong>Task:</strong> {task.title}</p>
              <TimeEditor
                time={startTime}
                onTimeChange={setStartTime}
                label="Started"
              />
            </div>

            {/* After Photos */}
            <div className="space-y-2">
              <Label>After Photos</Label>
              <div className="space-y-2">
                {afterPhotos.length > 0 && (
                  <div className="grid grid-cols-2 gap-2">
                    {afterPhotos.map((photo, index) => (
                      <div key={index} className="aspect-video bg-muted rounded-lg overflow-hidden">
                        <img
                          src={photo}
                          alt={`After photo ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                )}
                <Button
                  variant="outline"
                  onClick={handleAddPhoto}
                  className="w-full"
                >
                  <Camera className="mr-2 h-4 w-4" />
                  Add Photo
                </Button>
              </div>
            </div>

            {/* Client Signature */}
            <div className="space-y-2">
              <Label>Client Signature</Label>
              <div className="space-y-2">
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-2">
                  <canvas
                    ref={canvasRef}
                    width={300}
                    height={150}
                    className="w-full border rounded touch-none"
                    style={{ touchAction: 'none' }}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                  />
                </div>
                <Button
                  variant="outline"
                  onClick={clearSignature}
                  size="sm"
                >
                  Clear Signature
                </Button>
              </div>
            </div>

            {/* Final Remarks */}
            <div className="space-y-2">
              <Label>Final Remarks (Optional)</Label>
              <Textarea
                placeholder="Any additional notes or observations..."
                value={finalRemarks}
                onChange={(e) => setFinalRemarks(e.target.value)}
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Complete Button */}
        <Button
          onClick={handleSaveAndGeneratePDF}
          className="w-full h-12"
        >
          <FileText className="mr-2 h-4 w-4" />
          Save & Generate PDF
        </Button>
      </div>
    </div>
  );
}
