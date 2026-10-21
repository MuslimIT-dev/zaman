'use client';

import { useLocale } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/navigation';
import { locales, localeNames, type Locale } from '@/i18n/config';

export function LocaleSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  function change(next: Locale) {
    router.replace(pathname, { locale: next });
  }

  return (
    <select
      value={locale}
      onChange={(e) => change(e.target.value as Locale)}
      className="rounded-lg border px-3 py-1 text-sm"
    >
      {locales.map((l) => (
        <option key={l} value={l}>
          {localeNames[l]}
        </option>
      ))}
    </select>
  );
}