import Link from 'next/link';
import { UserMenu } from '@/components/auth/user-menu';

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Link href="/" className="text-xl font-bold">
            Calendly Clone
          </Link>

          <nav className="flex items-center gap-6">
            <Link href="/masters" className="text-sm hover:text-blue-600">
              Мастера
            </Link>
            <Link href="/courses" className="text-sm hover:text-blue-600">
              Курсы
            </Link>
          </nav>

          <UserMenu />
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl flex-1 px-6 py-8">
        {children}
      </main>

      <footer className="border-t py-8 text-center text-sm text-gray-500">
        © 2026 ZAMAN
      </footer>
    </div>
  );
}