import React, { useState } from 'react';
import { Button } from '@repo/ui/button';
import { Input } from '@repo/ui/input';
import { Label } from '@repo/ui/label';
import { Textarea } from '@repo/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@repo/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@repo/ui/card';
import { TimeEditor } from './TimeEditor';
import type { Task } from '../../types';
import { ArrowLeft, Camera, Mic, Save, CheckCircle } from 'lucide-react';

interface TaskInProgressProps {
  task: Task;
  onSave: (task: Task) => void;
  onComplete: () => void;
  onBack: () => void;
}

export function TaskInProgress({ task, onSave, onComplete, onBack }: TaskInProgressProps) {
  const [selectedClient, setSelectedClient] = useState(task.clientName);
  const [workTitle, setWorkTitle] = useState(task.title);
  const [remarks, setRemarks] = useState(task.remarks || '');
  const [beforePhotos, setBeforePhotos] = useState<string[]>(task.beforePhotos || []);
  const [startTime, setStartTime] = useState(task.startTime || new Date().toLocaleTimeString('en-US', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit'
  }));

  const recentClients = [
    'ABC Corporation',
    'XYZ Hotel',
    'Tech Solutions Ltd',
    'Green Energy Co',
    'Metro Construction'
  ];

  const workTitles = [
    'HVAC Maintenance',
    'Electrical Repair',
    'Network Setup',
    'Plumbing Fix',
    'Security Installation',
    'General Maintenance'
  ];

  const handleSaveDraft = () => {
    const updatedTask = {
      ...task,
      clientName: selectedClient,
      title: workTitle,
      remarks,
      beforePhotos,
      startTime
    };
    onSave(updatedTask);
  };

  const handleAddPhoto = () => {
    // Mock photo addition
    const mockPhotoUrl = `https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400&h=300&fit=crop`;
    setBeforePhotos(prev => [...prev, mockPhotoUrl]);
  };

  const handleVoiceNote = () => {
    // Mock voice to text
    setRemarks(prev => prev + (prev ? ' ' : '') + 'Voice note: Additional inspection completed successfully.');
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
          <h1 className="text-xl">Task - In Progress</h1>
        </div>
        <TimeEditor
          time={startTime}
          onTimeChange={setStartTime}
          label={`Date: ${task.scheduledDate ? new Date(task.scheduledDate + "T00:00:00").toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }) : "Not scheduled"} | Started`}
          className="text-primary-foreground"
        />
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Task Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Client Selection */}
            <div className="space-y-2">
              <Label>Client</Label>
              <Select value={selectedClient} onValueChange={setSelectedClient}>
                <SelectTrigger>
                  <SelectValue placeholder="Select client" />
                </SelectTrigger>
                <SelectContent>
                  {recentClients.map(client => (
                    <SelectItem key={client} value={client}>
                      {client}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Work Title */}
            <div className="space-y-2">
              <Label>Work Title</Label>
              <Select value={workTitle} onValueChange={setWorkTitle}>
                <SelectTrigger>
                  <SelectValue placeholder="Select work type" />
                </SelectTrigger>
                <SelectContent>
                  {workTitles.map(title => (
                    <SelectItem key={title} value={title}>
                      {title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Technical Selection */}
            <div className="space-y-2">
              <Label>Technical Team</Label>
              <Select value={selectedClient} onValueChange={setSelectedClient}>
                <SelectTrigger>
                  <SelectValue placeholder="Select client" />
                </SelectTrigger>
                <SelectContent>
                  {recentClients.map(client => (
                    <SelectItem key={client} value={client}>
                      {client}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Customer Name */}
            <div className="space-y-2">
              <Label>Customer Team Name</Label>
              <Select value={selectedClient} onValueChange={setSelectedClient}>
                <SelectTrigger>
                  <SelectValue placeholder="Select client" />
                </SelectTrigger>
                <SelectContent>
                  {recentClients.map(client => (
                    <SelectItem key={client} value={client}>
                      {client}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>


            {/* Customer Name */}
            <div className="space-y-2">
              <Label>Customer Mobile Number</Label>
              <Select value={selectedClient} onValueChange={setSelectedClient}>
                <SelectTrigger>
                  <SelectValue placeholder="Select client" />
                </SelectTrigger>
                <SelectContent>
                  {recentClients.map(client => (
                    <SelectItem key={client} value={client}>
                      {client}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Before Photos */}
            <div className="space-y-2">
              <Label>Before Photos</Label>
              <div className="space-y-2">
                {beforePhotos.length > 0 && (
                  <div className="grid grid-cols-2 gap-2">
                    {beforePhotos.map((photo, index) => (
                      <div key={index} className="aspect-video bg-muted rounded-lg overflow-hidden">
                        <img
                          src={photo}
                          alt={`Before photo ${index + 1}`}
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

            {/* Remarks */}
            <div className="space-y-2">
              <Label>Remarks</Label>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Textarea
                    placeholder="Enter task remarks and notes..."
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    className="flex-1"
                    rows={4}
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleVoiceNote}
                    className="shrink-0"
                  >
                    <Mic className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleSaveDraft}
            className="flex-1"
          >
            <Save className="mr-2 h-4 w-4" />
            Save Draft
          </Button>
          <Button
            onClick={onComplete}
            className="flex-1"
          >
            <CheckCircle className="mr-2 h-4 w-4" />
            Complete
          </Button>
        </div>
      </div>
    </div>
  );
}
