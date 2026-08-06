import type { Metadata } from 'next';
import LoginClientPage from './LoginClientPage';

export const metadata: Metadata = {
  title: 'Club login',
  description: 'Sign in with your V-TAPP club ID to submit events.',
};

export default function LoginPage() {
  return <LoginClientPage />;
}

