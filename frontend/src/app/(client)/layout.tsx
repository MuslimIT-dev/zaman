import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth-server';
import { LOGIN_PATH } from '@/lib/auth-config';

export default async function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) redirect(LOGIN_PATH);

  return (
    <div className="flex min-h-screen flex-col">
      {/* client-header */}
      <main className="flex-1">{children}</main>
    </div>
  );
}