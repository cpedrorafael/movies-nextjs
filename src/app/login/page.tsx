'use client';

import { useAuth0 } from '@auth0/auth0-react';
import { Button } from '@/components/ui/button';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const { loginWithRedirect, isAuthenticated, isLoading } = useAuth0();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      router.push('/');
    }
  }, [isAuthenticated, isLoading, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold text-foreground">
            Welcome to the Movies App
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Sign in to access your personalized watchlist and recommendations
          </p>
        </div>
        <div className="mt-8">
          <Button
            onClick={() => loginWithRedirect()}
            className="w-full"
            size="lg"
          >
            Sign in
          </Button>
        </div>
      </div>
    </div>
  );
}
