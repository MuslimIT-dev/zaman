import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center py-24">
      <h1 className="text-5xl font-bold">Calendly Clone</h1>
      <p className="mt-4 text-xl text-gray-600">
        Запись на консультации и курсы
      </p>

      <div className="mt-10 flex gap-3">
        <Link
          href="/masters"
          className="rounded-lg bg-blue-600 px-6 py-3 text-white hover:bg-blue-700"
        >
          Найти мастера
        </Link>
        <Link
          href="/courses"
          className="rounded-lg border px-6 py-3 hover:bg-gray-50"
        >
          Курсы
        </Link>
      </div>

      <div className="mt-16 grid max-w-4xl grid-cols-1 gap-6 md:grid-cols-3">
        <div className="rounded-lg border p-6">
          <h3 className="font-semibold">Психологи и коучи</h3>
          <p className="mt-2 text-sm text-gray-600">
            Найдите специалиста и запишитесь за минуту
          </p>
        </div>
        <div className="rounded-lg border p-6">
          <h3 className="font-semibold">Онлайн-курсы</h3>
          <p className="mt-2 text-sm text-gray-600">
            Покупайте курсы и учитесь в своём темпе
          </p>
        </div>
        <div className="rounded-lg border p-6">
          <h3 className="font-semibold">Для мастеров</h3>
          <p className="mt-2 text-sm text-gray-600">
            Управляйте расписанием и продавайте курсы
          </p>
        </div>
      </div>
    </div>
  );
}