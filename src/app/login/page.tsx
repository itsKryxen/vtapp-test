import { Suspense } from 'react';
import type { Metadata } from 'next';
import LoginForm from './LoginForm';
import { LogoLockup } from '@/components/Logo';
import { CLUB_ID_HELP } from '@/lib/clubId';

export const metadata: Metadata = {
  title: 'Club login',
  description: 'Sign in with your V-TAPP club ID to submit events.',
};

export default function LoginPage() {
  return (
    <div className="container-x grid min-h-[100svh] place-items-center py-28">
      <div className="w-full max-w-md">
        <div className="">
          <div className="panel p-8">
            <LogoLockup width={300} className="mb-6 h-auto w-[220px]" />
            <h1 className="display-md">Club login</h1>
            <p className="mt-2 text-sm leading-relaxed text-slate-400">
              Sign in with the club ID issued by the core team, or the email it was registered with.
            </p>

            <Suspense fallback={<div className="mt-8 h-64 animate-pulse bg-white/5" />}>
              <LoginForm />
            </Suspense>
          </div>
        </div>

        <p className="mt-5 text-center text-xs leading-relaxed text-slate-500">
          {CLUB_ID_HELP}
          <br />
          No credentials yet? Email{' '}
          <a href="mailto:vtapp.convenor@vitap.ac.in" className="text-brand-400 hover:underline">
            vtapp.convenor@vitap.ac.in
          </a>
        </p>
      </div>
    </div>
  );
}
