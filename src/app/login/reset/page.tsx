import { Suspense } from 'react';
import type { Metadata } from 'next';
import ResetForm from './ResetForm';
import { LogoLockup } from '@/components/Logo';

export const metadata: Metadata = {
  title: 'Set a new password',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

export default function ResetPasswordPage() {
  return (
    <div className="container-x grid min-h-[100svh] place-items-center py-28">
      <div className="w-full max-w-md">
        <div className="panel p-8">
          <LogoLockup width={300} className="mb-6 h-auto w-[220px]" />
          <h1 className="display-md">Set a new password</h1>
          <p className="mt-2 text-sm leading-relaxed text-slate-400">
            Choose something you have not used elsewhere. This replaces the password on the account
            the reset link belongs to.
          </p>

          <Suspense fallback={<div className="mt-8 h-56 skeleton" />}>
            <ResetForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
