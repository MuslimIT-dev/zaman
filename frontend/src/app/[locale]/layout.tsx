import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { Inter } from 'next/font/google';
import { locales, isValidLocale, type Locale } from '@/i18n/config';
import { getCurrentUser } from '@/lib/auth-server';
import { AuthProvider } from '@/providers/auth-provider';

const inter = Inter({ subsets: ['latin', 'cyrillic'] });

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isValidLocale(locale)) notFound();

  setRequestLocale(locale);

  const messages = await getMessages();
  const user = await getCurrentUser();

  return (
    <html lang={locale} className={inter.className}>
      <body>
        <NextIntlClientProvider messages={messages} locale={locale}>
          <AuthProvider initialUser={user}>{children}</AuthProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}