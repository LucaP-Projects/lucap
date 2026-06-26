import { ForgotPasswordForm } from '@/components/auth/forgot-password-form';
import { ReturnButton } from '@/components/auth/return-button';

export default function Page() {
    return (
        <div className="space-y-4">
            <ReturnButton href="/auth/login" label="Login" />
            <h1 className="text-3xl font-bold">Forgot Password</h1>
            <p className="text-muted-foreground">
                Please enter your email address to receive a password reset link.
            </p>
            <ForgotPasswordForm />
        </div>
    );
}
