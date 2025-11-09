import React, { useState } from 'react';
import { Button } from '@repo/ui/button';
import { Input } from '@repo/ui/input';
import { Label } from '@repo/ui/label';
import { Card, CardContent } from '@repo/ui/card';
import { Edit2, Check, X } from 'lucide-react';

interface TimeEditorProps {
  time: string;
  onTimeChange: (newTime: string) => void;
  label: string;
  className?: string;
}

export function TimeEditor({ time, onTimeChange, label, className }: TimeEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTime, setEditedTime] = useState(time);

  const handleEdit = () => {
    setEditedTime(time);
    setIsEditing(true);
  };

  const handleSave = () => {
    onTimeChange(editedTime);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedTime(time);
    setIsEditing(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  if (isEditing) {
    return (
      <Card className={className}>
        <CardContent className="p-3">
          <div className="space-y-2">
            <Label className="text-sm">{label}</Label>
            <div className="flex items-center gap-2">
              <Input
                type="time"
                value={editedTime}
                onChange={(e) => setEditedTime(e.target.value)}
                onKeyDown={handleKeyPress}
                className="flex-1"
                autoFocus
              />
              <Button
                size="sm"
                onClick={handleSave}
                className="px-2"
              >
                <Check className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleCancel}
                className="px-2"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span className="text-sm opacity-90">
        <strong>{label}:</strong> {time}
      </span>
      <Button
        size="sm"
        variant="ghost"
        onClick={handleEdit}
        className="h-6 w-6 p-0 opacity-60 hover:opacity-100"
      >
        <Edit2 className="h-3 w-3" />
      </Button>
    </div>
  );
}
