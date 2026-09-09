import { useEffect, useRef, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth, useUser } from '@clerk/react';
import { homePathForRole, roleFromUser } from './roles';

const MAX_RELOAD_ATTEMPTS = 8;
const RELOAD_INTERVAL_MS = 2000;

export default function RequireRole({ role, children }) {
  const { isLoaded: authLoaded, isSignedIn } = useAuth();
  const { isLoaded: userLoaded, user } = useUser();
  const location = useLocation();
  const [reloadAttempts, setReloadAttempts] = useState(0);
  const reloadTimer = useRef(null);

  const loaded = authLoaded && userLoaded;

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
    return null;
  }

  if (!isSignedIn) {
    return <Navigate to="/sign-in" replace state={{ from: location }} />;
  }

  const userRole = roleFromUser(user);

  if (!userRole) {
    if (reloadAttempts < MAX_RELOAD_ATTEMPTS) {
      return (
        <div className="flex min-h-screen items-center justify-center">
          <p className="text-sm text-slate-500">Setting up your account…</p>
        </div>
      );
    }
    return <Navigate to="/" replace />;
  }

  if (userRole === role) {
    return children;
  }

  return <Navigate to={homePathForRole(userRole)} replace />;
}
