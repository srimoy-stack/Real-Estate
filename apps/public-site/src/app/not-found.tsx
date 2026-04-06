import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <h1 className="text-4xl font-extrabold text-gray-900">404</h1>
      <p className="mt-3 text-lg text-gray-600">
        The page you are looking for does not exist.
      </p>
      <Link
        href="/"
        className="mt-6 inline-block rounded-md bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-gray-800"
      >
        Go Home
      </Link>
    </div>
  );
}
