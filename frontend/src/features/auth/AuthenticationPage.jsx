import { Navigate, useLocation, useSearchParams } from 'react-router-dom';
import { SignIn, SignUp, useAuth, useUser } from "@clerk/react";
import { homePathForRole, isRole, normalizeSignupRole, roleFromUser } from './roles';
import { ROUTES } from '@/lib/routes';

export default function AuthenticationPage() {
    const [searchParams] = useSearchParams();
    const location = useLocation();
    const { isLoaded: authLoaded, isSignedIn } = useAuth();
    const { isLoaded: userLoaded, user } = useUser();
    const role = normalizeSignupRole(searchParams.get('role'));
    const isSignInPage = location.pathname.startsWith(ROUTES.SIGN_IN);

    if (!authLoaded || !userLoaded) {
        return <AuthLoading />;
    }

    if (isSignedIn) {
        const userRole = roleFromUser(user);

        if (!isRole(userRole)) {
            return <Navigate to={ROUTES.USER} replace />;
        }

        return <Navigate to={homePathForRole(userRole)} replace />;
    }

    return (
        <div className="flex min-h-screen flex-col items-center justify-center">
            {isSignInPage ? (
                <SignIn routing="path" path={ROUTES.SIGN_IN} />
            ) : (
                <SignUp
                    routing="path"
                    path={ROUTES.SIGN_UP}
                    unsafeMetadata={{ role }}
                    fallbackRedirectUrl={ROUTES.USER}
                />
            )}
        </div>
    );
}

function AuthLoading({ message = 'Loading authentication...' }) {
    return (
        <div className="flex min-h-screen items-center justify-center">
            <p className="text-sm text-slate-500">{message}</p>
        </div>
    );
}
