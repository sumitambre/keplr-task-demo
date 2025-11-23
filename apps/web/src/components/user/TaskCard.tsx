import React from 'react';
// Using a local button base for strict color control on mobile
import { Badge } from '@repo/ui/badge';
import { Card, CardContent } from '@repo/ui/card';
import { cn } from '@repo/ui/utils';
import type { Task } from '../../types';
import { Play, Building2, Wrench, MapPin, ExternalLink, User } from 'lucide-react';
import { useUserPrefs } from '../../context/user-prefs';

interface TaskCardProps {
  task: Task;
  onStart: () => void;
  onContinue: () => void;
  onComplete: () => void;
  onReport?: () => void;
}

const STATUS_VARIANTS: Record<Task['status'], 'default' | 'secondary' | 'outline'> = {
  New: 'default',
  'In Progress': 'secondary',
  Completed: 'outline',
  Pending: 'outline', // Added Pending
};

const STATUS_STYLES: Record<Task['status'], string> = {
  New: 'bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-foreground',
  'In Progress':
    'bg-amber-500/15 text-amber-700 dark:bg-amber-500/20 dark:text-amber-200',
  Completed:
    'bg-emerald-500/15 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-200',
  Pending: 'bg-gray-500/15 text-gray-700 dark:bg-gray-500/20 dark:text-gray-200', // Added Pending
};

const formatDate = (iso: string | undefined) => {
  if (!iso) return 'No date';
  return new Date(iso + 'T00:00:00').toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

type Priority = 'Critical' | 'High' | 'Medium' | 'Low';

const PRIORITY_STYLES: Record<Priority, string> = {
  // Design: High priority uses red pastel like Critical
  Critical: 'bg-[#FEE2E2] border-[#FCA5A5] text-[#991B1B]',
  High: 'bg-[#FEE2E2] border-[#FCA5A5] text-[#991B1B]',
  Medium: 'bg-[#FEF3C7] border-[#FCD34D] text-[#92400E]',
  Low: 'bg-[#DCFCE7] border-[#86EFAC] text-[#065F46]',
};

export function TaskCard({ task, onStart, onContinue, onReport }: TaskCardProps) {
  const { fontScale } = useUserPrefs();
  const sizes = fontScale === 'lg'
    ? { titleMain: 'text-[1.15rem]', line: 'text-lg', meta: 'text-base' }
    : { titleMain: 'text-[1.05rem]', line: 'text-base', meta: 'text-sm' };
  const statusVariant = STATUS_VARIANTS[task.status] ?? 'default';
  const statusClassName = STATUS_STYLES[task.status] ?? '';
  const priority = ((task as any).priority ?? 'Medium') as Priority;
  const priorityClasses = PRIORITY_STYLES[priority];

  const BtnBase = ({ className = '', children, onClick }: { className?: string; children: React.ReactNode; onClick: () => void }) => (
    <button
      type="button"
      onClick={onClick}
      className={cn('inline-flex items-center justify-center gap-2 rounded-md h-10 px-5 font-medium shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50', className)}
    >
      {children}
    </button>
  );

  const btnSolid = 'bg-primary text-primary-foreground hover:bg-primary/90';

  const renderPrimaryAction = () => {
    if (task.status === 'New') {
      return (
        <BtnBase
          onClick={onStart}
          className={cn('flex-1 w-full sm:w-auto', btnSolid)}
        // Inline style to guarantee color regardless of theme overrides
        // and ensure legible contrast on light backgrounds
        // eslint-disable-next-line react/forbid-dom-props
        >
          <Play className="mr-2 h-4 w-4" /> Start
        </BtnBase>
      );
    }

    if (task.status === 'In Progress') {
      return (
        <BtnBase
          onClick={onContinue}
          className={cn('flex-1 w-full sm:w-auto', btnSolid)}
        >
          <Play className="mr-2 h-4 w-4" /> Continue
        </BtnBase>
      );
    }

    if (task.status === 'Completed') {
      return (
        <BtnBase
          onClick={onReport || (() => { })}
          className={cn('flex-1 w-full sm:w-auto', btnSolid)}
        >
          <ExternalLink className="mr-2 h-4 w-4" /> View Report
        </BtnBase>
      );
    }

    return null;
  };

  return (
    <Card className={"w-full min-w-0 bg-card text-card-foreground border transition-colors shadow-sm hover:shadow-md overflow-hidden"}>
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                {/* Client name; clickable only if a map url is provided */}
                {Boolean((task as any).siteMapUrl) ? (
                  <a
                    href={(task as any).siteMapUrl as string}
                    target="_blank"
                    rel="noreferrer"
                    className={cn("inline-flex items-center gap-1 font-medium text-primary hover:underline truncate max-w-full", sizes.titleMain)}
                  >
                    {task.clientName}
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                ) : (
                  <h4 className={cn('font-medium truncate max-w-full', sizes.titleMain)}>{task.clientName}</h4>
                )}
              </div>
              {(task as any).siteName && (
                <div className={cn("mt-0.5 flex items-center gap-2 text-muted-foreground", sizes.line)}>
                  <MapPin className="h-4 w-4" />
                  <p className="truncate">{(task as any).siteName}</p>
                </div>
              )}
              <div className={cn("mt-1 flex items-center gap-2 text-muted-foreground", sizes.line)}>
                <Wrench className="h-4 w-4" />
                <p className="truncate max-w-full">{task.title}</p>
              </div>
              {((task as any).onsiteContactName || (task as any).contactNumber) && (
                <div className={cn("mt-1 flex items-center gap-2 text-muted-foreground", sizes.meta)}>
                  <User className="h-3.5 w-3.5" />
                  <p className="truncate">
                    {[(task as any).onsiteContactName, (task as any).contactNumber].filter(Boolean).join(' • ')}
                  </p>
                </div>
              )}
              <p className={cn("mt-1 text-muted-foreground truncate max-w-full", sizes.meta)}>Scheduled: {formatDate(task.scheduledDate)}</p>
              {(task as any).remarks && (
                <p className={cn("text-muted-foreground truncate max-w-full", sizes.meta)}>{(task as any).remarks}</p>
              )}
            </div>

            <div className="flex flex-col items-end gap-2">
              <span className={`rounded-full border px-2 py-0.5 text-xs font-medium ${priorityClasses}`}>{priority}</span>
              <Badge
                variant={statusVariant}
                className={cn('border-transparent', statusClassName)}
              >
                {task.status}
              </Badge>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            {renderPrimaryAction()}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
