import type { Metadata } from 'next';
import ForgotForm from './ForgotForm';
import { LogoLockup } from '@/components/Logo';
import { FEST } from '@/lib/fest';

export const metadata: Metadata = {
  title: 'Reset password',
  description: 'Request a password reset link for your V-TAPP club account.',
  robots: { index: false, follow: false },
};

export default function ForgotPasswordPage() {
  return (
    <div className="container-x grid min-h-[100svh] place-items-center py-28">
      <div className="w-full max-w-md">
        <div className="panel p-8">
          <LogoLockup width={300} className="mb-6 h-auto w-[220px]" />
          <h1 className="display-md">Forgot password</h1>
          <p className="mt-2 text-sm leading-relaxed text-slate-400">
            Enter your club ID or the email your account was registered with. We will send a link
            that lets you set a new password.
          </p>

          <ForgotForm />
        </div>

        <p className="mt-5 text-center text-xs leading-relaxed text-slate-500">
          Locked out entirely? Email{' '}
          <a href={`mailto:${FEST.email}`} className="text-brand-400 hover:underline">
            {FEST.email}
          </a>{' '}
          and the core team will reissue your credentials.
        </p>
      </div>
    </div>
  );
}
