import { useState } from "react";
import { Button } from "@repo/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/card";
import { Label } from "@repo/ui/label";
import { AuthState } from "../../hooks/useAuth";
import { Lock, User, KeyRound } from "lucide-react";

// API base URL
// - If VITE_API_URL is set, use it
// - Otherwise use relative '/api' so Vite dev proxy handles CORS
const API_URL = ((import.meta as any)?.env?.VITE_API_URL as string | undefined) ?? '';

export type LoginProps = {
  onLogin: (state: AuthState) => void;
};

export function Login({ onLogin }: LoginProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    try {
      const base = API_URL?.replace(/\/$/, '') || '';
      const response = await fetch(`${base}/api/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const contentType = response.headers.get('content-type') || '';
      let raw = '';
      let data: any = undefined;
      try {
        raw = await response.text();
        if (raw && contentType.includes('application/json')) {
          data = JSON.parse(raw);
        }
      } catch {
        // ignore parse errors, handle below
      }

      if (!response.ok) {
        const msg = (data && data.message)
          || (raw ? raw : undefined)
          || `HTTP ${response.status} ${response.statusText}`;
        throw new Error(msg);
      }

      if (!data) {
        throw new Error('Empty response from server');
      }

      // On success, call the onLogin callback with the new auth state
      onLogin({ token: data.token, user: data.user });

    } catch (err: any) {
      // Normalize common network errors
      const m = (err?.message || '');
      const msg = m.toLowerCase().includes('failed to fetch')
        ? 'Network error. Is the API running?'
        : m.toLowerCase().includes('cors')
          ? 'CORS/Network error. Try using the dev proxy or set VITE_API_URL.'
          : m || 'Unexpected error';
      setError(msg);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-950 dark:to-slate-900 p-4">
      <div className="w-full max-w-md animate-in fade-in zoom-in duration-500">
        <Card className="border-none shadow-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
          <CardHeader className="space-y-1 text-center pb-8">
            <div className="flex justify-center mb-4">
              <div className="p-3 rounded-full bg-primary/10 text-primary ring-1 ring-primary/20">
                <Lock className="h-6 w-6" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold tracking-tight">Welcome back</CardTitle>
            <CardDescription className="text-base">
              Enter your credentials to access your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <Label htmlFor="username" className="text-sm font-medium ml-1">Username</Label>
                <div className="group flex items-center w-full h-12 rounded-lg border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/50 px-3 focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all duration-200 shadow-sm">
                  <User className="h-5 w-5 text-muted-foreground/70 mr-3 group-focus-within:text-primary transition-colors" />
                  <input
                    id="username"
                    className="w-full h-full bg-transparent border-none outline-none text-sm placeholder:text-muted-foreground/70"
                    placeholder="Enter your username"
                    autoComplete="username"
                    value={username}
                    onChange={(event) => setUsername(event.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between ml-1">
                  <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                </div>
                <div className="group flex items-center w-full h-12 rounded-lg border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/50 px-3 focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all duration-200 shadow-sm">
                  <KeyRound className="h-5 w-5 text-muted-foreground/70 mr-3 group-focus-within:text-primary transition-colors" />
                  <input
                    id="password"
                    type="password"
                    className="w-full h-full bg-transparent border-none outline-none text-sm placeholder:text-muted-foreground/70"
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    required
                  />
                </div>
              </div>
              {error && (
                <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm flex items-center gap-2 animate-in slide-in-from-top-2">
                  <span className="font-medium">Error:</span> {error}
                </div>
              )}
              <Button type="submit" className="w-full h-11 text-base font-medium shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all">
                Sign in
              </Button>
            </form>
          </CardContent>
          <div className="p-6 pt-0 text-center text-sm text-muted-foreground">
            <p>Demo Credentials:</p>
            <div className="mt-2 flex justify-center gap-4 text-xs font-mono">
              <span className="px-2 py-1 rounded bg-muted">admin / admin</span>
              <span className="px-2 py-1 rounded bg-muted">user / user</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
