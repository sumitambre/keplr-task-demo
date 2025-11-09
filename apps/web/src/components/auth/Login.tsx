import { useState } from "react";
import { Button } from "@repo/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/card";
import { Input } from "@repo/ui/input";
import { Label } from "@repo/ui/label";
import { AuthState } from "../../hooks/useAuth";

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
    <div className="flex min-h-screen items-center justify-center bg-background">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle>Welcome</CardTitle>
          <CardDescription>Enter your credentials to sign in</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                placeholder="admin or user"
                autoComplete="username"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="admin or user"
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
            </div>
            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
            <Button type="submit" className="w-full">
              Sign in
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
