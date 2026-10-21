import { LoginForm } from '@/components/auth/login-form';

export default async function LoginPage({
  searchParams,
}: {
  searchParams: { returnTo?: string };
}) {
  return (
    <div className="mx-auto max-w-md p-6">
      <h1 className="mb-6 text-2xl font-bold">Вход</h1>
      <LoginForm returnTo={searchParams.returnTo ?? ''} />
    </div>
  );
}