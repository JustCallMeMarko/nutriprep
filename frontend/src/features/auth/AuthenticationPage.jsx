import { useSearchParams } from 'react-router-dom';
import { Show, SignIn, SignUp } from "@clerk/react";
import { normalizeSignupRole } from './roles';

export default function AuthenticationPage() {
    const [searchParams] = useSearchParams();
    const role = normalizeSignupRole(searchParams.get('role'));

    return (
        <div className="flex flex-col items-center justify-center min-h-screen">
            <Show when="signed-out">
                <SignIn routing="path" path="/sign-in" />
                <SignUp routing="path" path="/sign-up" unsafeMetadata={{ role }} fallbackRedirectUrl="/" />
            </Show>
            <Show when="signed-in">
                <div>You are signed in!</div>
            </Show>
        </div>

    )
}
