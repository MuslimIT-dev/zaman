import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth-server';
import { isMaster } from '@/lib/types';
import { LOGIN_PATH, DEFAULT_CLIENT_HOME } from '@/lib/auth-config';

export default async function MasterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) redirect(LOGIN_PATH);
  if (!isMaster(user)) redirect(DEFAULT_CLIENT_HOME);

  return (
    <div className="flex min-h-screen">
      {/* master-sidebar */}
      <main className="flex-1">{children}</main>
    </div>
  );
}