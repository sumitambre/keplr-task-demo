import React from 'react';
import { Button } from '@repo/ui/button';
import { Input } from '@repo/ui/input';
import { Label } from '@repo/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@repo/ui/card';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

interface LoginProps {
  onLogin: (username: string) => void;
}

export function Login({ onLogin }: LoginProps) {
  const LoginSchema = z.object({
    username: z.string().min(1, 'Username is required'),
    password: z.string().min(1, 'Password is required'),
  });
  const form = useForm<{ username: string; password: string }>({
    resolver: zodResolver(LoginSchema),
    defaultValues: { username: '', password: '' },
  });
  const { control, handleSubmit, formState } = form;

  const onSubmitForm = handleSubmit((values) => {
    onLogin(values.username);
  });

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center space-y-2">
          <CardTitle className="text-2xl">User Console</CardTitle>
          <p className="text-muted-foreground">Technician App</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={(e) => { e.preventDefault(); onSubmitForm(); }} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Controller
                control={control}
                name="username"
                render={({ field }) => (
                  <Input id="username" type="text" placeholder="Enter username" {...field} />
                )}
              />
              {formState.errors.username && (
                <p className="text-xs text-destructive">{formState.errors.username.message as any}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Controller
                control={control}
                name="password"
                render={({ field }) => (
                  <Input id="password" type="password" placeholder="Enter password" {...field} />
                )}
              />
              {formState.errors.password && (
                <p className="text-xs text-destructive">{formState.errors.password.message as any}</p>
              )}
            </div>
            <Button type="submit" className="w-full">
              Login
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
