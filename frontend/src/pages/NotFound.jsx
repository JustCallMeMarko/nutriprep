import { Link } from 'react-router-dom';
import { ROUTES } from '@/lib/routes';

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">404</p>
      <h1 className="text-3xl font-extrabold text-slate-900">Page not found</h1>
      <p className="max-w-md text-sm text-slate-500">
        The page you requested does not exist or has moved.
      </p>
      <Link
        to={ROUTES.HOME}
        className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
      >
        Return home
      </Link>
    </main>
  );
}