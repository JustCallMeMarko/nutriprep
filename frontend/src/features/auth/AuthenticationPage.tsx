import { Navigate, useLocation, useSearchParams } from 'react-router-dom';
import { SignIn, SignUp, useAuth, useUser } from "@clerk/react";
import { ROUTES } from '@/constants/routes';
import { ROLES } from '@/constants/roles';


const SIGNUP_ROLES = ['user', 'rider'];

export const isRole = (role: any) => Object.values(ROLES).includes(role);

export default function AuthenticationPage() {
    const [searchParams] = useSearchParams();
    const location = useLocation();
    const { isLoaded: authLoaded, isSignedIn } = useAuth();
    const { isLoaded: userLoaded, user } = useUser();
    const requestedRole = searchParams.get('role');
    const role = requestedRole && SIGNUP_ROLES.includes(requestedRole) ? requestedRole : ROLES.USER;
    const isSignInPage = location.pathname.startsWith(ROUTES.SIGN_IN);

    if (!authLoaded || !userLoaded) {
        return <AuthLoading />;
    }

    if (isSignedIn) {
        const userRole = user?.publicMetadata?.role;

        if (!isRole(userRole)) {
            return <Navigate to={ROUTES.USER_DASHBOARD} replace />;
        }

        return <Navigate to={`/${userRole}`} replace />;
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
                    fallbackRedirectUrl={ROUTES.USER_DASHBOARD}
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