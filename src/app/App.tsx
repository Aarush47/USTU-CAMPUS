import { ClerkProvider } from '@clerk/clerk-react';
import { RouterProvider } from 'react-router';
import { router } from './routes';
import { SessionEnforcer } from './components/SessionEnforcer';

export default function App() {
  const publishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

  if (!publishableKey) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-6">
        <div className="max-w-xl w-full border border-border rounded-xl bg-card p-6">
          <h1 className="text-xl font-semibold text-foreground mb-3">Configuration Required</h1>
          <p className="text-sm text-muted-foreground mb-3">
            Missing <strong>VITE_CLERK_PUBLISHABLE_KEY</strong>. Add it in Vercel project settings,
            then redeploy.
          </p>
          <p className="text-xs text-muted-foreground">
            Also verify <strong>VITE_SUPABASE_URL</strong> and <strong>VITE_SUPABASE_ANON_KEY</strong>
            are set for production.
          </p>
        </div>
      </div>
    );
  }

  return (
    <ClerkProvider publishableKey={publishableKey}>
      <SessionEnforcer />
      <RouterProvider router={router} />
    </ClerkProvider>
  );
}