import { Metadata } from 'next';
import { AuthCard } from '@/components/auth/auth-card';

export const metadata: Metadata = {
  title: 'Login - TimesheetPro',
  description: 'Sign in to your timesheet management account',
};

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <AuthCard />
      </div>
    </div>
  );
}
