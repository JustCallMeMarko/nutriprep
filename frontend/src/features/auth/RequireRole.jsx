import { useEffect, useRef, useState } from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import { useAuth, useUser } from '@clerk/react';
import { homePathForRole, isRole, roleFromUser } from './roles';
import { ROUTES } from '@/lib/routes';

const MAX_RELOAD_ATTEMPTS = 8;
const RELOAD_INTERVAL_MS = 2000;

export default function RequireRole({ role, children }) {
  const { isLoaded: authLoaded, isSignedIn } = useAuth();
  const { isLoaded: userLoaded, user } = useUser();
  const location = useLocation();
  const [reloadAttempts, setReloadAttempts] = useState(0);
  const reloadTimer = useRef(null);

  const loaded = authLoaded && userLoaded;
  const roleIsValid = isRole(role);

  useEffect(() => {
    if (!loaded || isSignedIn === false) return;
    if (!user) return;

    const hasRole = roleFromUser(user);
    if (hasRole || reloadAttempts >= MAX_RELOAD_ATTEMPTS) return;

    if (reloadTimer.current) clearTimeout(reloadTimer.current);
    reloadTimer.current = setTimeout(async () => {
      try {
        await user.reload();
      } finally {
        setReloadAttempts((attempts) => attempts + 1);
      }
    }, RELOAD_INTERVAL_MS);

    return () => {
      if (reloadTimer.current) clearTimeout(reloadTimer.current);
    };
  }, [loaded, isSignedIn, user, reloadAttempts]);

  if (!loaded) {
    return <AuthLoading />;
  }

  if (!roleIsValid) {
    return <AuthError message="This area is not configured correctly." />;
  }

  if (!isSignedIn) {
    return <Navigate to={ROUTES.SIGN_IN} replace state={{ from: location }} />;
  }

  const userRole = roleFromUser(user);

  if (!isRole(userRole)) {
    if (reloadAttempts < MAX_RELOAD_ATTEMPTS) {
      return (
        <div className="flex min-h-screen items-center justify-center">
          <p className="text-sm text-slate-500">Setting up your account…</p>
        </div>
      );
    }
    return <AuthError message="Your account does not have an assigned role yet." />;
  }

  if (userRole === role) {
    return children;
  }

  return <Navigate to={homePathForRole(userRole)} replace />;
}

function AuthLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <p className="text-sm text-slate-500">Loading your account...</p>
    </div>
  );
}

function AuthError({ message }) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 className="text-xl font-bold text-slate-900">Access unavailable</h1>
      <p className="max-w-md text-sm text-slate-500">{message}</p>
      <Link
        to={ROUTES.HOME}
        className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
      >
        Return home
      </Link>
    </main>
  );
}
