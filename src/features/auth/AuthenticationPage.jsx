import { Show, SignIn, SignUp } from "@clerk/react";

export default function AuthenticationPage() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen">
            <Show when="signed-out">
                <SignIn routing="path" path="/sign-in" />
                <SignUp routing="path" path="/sign-up" />
            </Show>
            <Show when="signed-in">
                <div>You are signed in!</div>
            </Show>
        </div>

    )
}
