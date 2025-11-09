import React, { useEffect, useRef } from 'react';

type Props = {
  value?: string;
  onChange: (dataUrl: string | undefined) => void;
  height?: number;
};

export function SignaturePad({ value, onChange, height = 160 }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const drawing = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    // Hi-dpi
    const scale = window.devicePixelRatio || 1;
    const width = canvas.clientWidth * scale;
    const h = height * scale;
    canvas.width = width;
    canvas.height = h;
    ctx.scale(scale, scale);
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#111827';
  }, [height]);

  const getPos = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const pt = 'touches' in e ? e.touches[0] : (e as React.MouseEvent);
    return { x: pt.clientX - rect.left, y: pt.clientY - rect.top };
  };

  const start = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    drawing.current = true;
    const pos = getPos(e);
    const ctx = canvasRef.current!.getContext('2d')!;
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
  };
  const move = (e: React.MouseEvent | React.TouchEvent) => {
    if (!drawing.current) return;
    const pos = getPos(e);
    const ctx = canvasRef.current!.getContext('2d')!;
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
  };
  const end = () => {
    if (!drawing.current) return;
    drawing.current = false;
    const data = canvasRef.current!.toDataURL('image/png');
    onChange(data);
  };

  const clear = () => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    onChange(undefined);
  };

  return (
    <div className="space-y-2">
      <div className="rounded-md border bg-card text-card-foreground">
        <canvas
          ref={canvasRef}
          style={{ width: '100%', height }}
          onMouseDown={start}
          onMouseMove={move}
          onMouseUp={end}
          onMouseLeave={end}
          onTouchStart={start}
          onTouchMove={move}
          onTouchEnd={end}
        />
      </div>
      <div className="flex gap-2 text-xs text-muted-foreground">
        <button type="button" className="border rounded px-2 py-1" onClick={clear}>Clear</button>
        {value && <span>Captured</span>}
      </div>
    </div>
  );
}
