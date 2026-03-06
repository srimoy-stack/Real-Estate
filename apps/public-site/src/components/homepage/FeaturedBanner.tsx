interface FeaturedBannerProps {
  title?: string;
  subtitle?: string;
}

export function FeaturedBanner({
  title = 'Featured Properties',
  subtitle = 'Hand-picked listings for you',
}: FeaturedBannerProps) {
  return (
    <section className="py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">{title}</h2>
          <p className="mt-2 text-gray-600">{subtitle}</p>
        </div>
        {/* TODO: Property cards grid */}
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-lg border border-gray-200 bg-white p-6 text-center text-sm text-gray-400">
            Listing card placeholder
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-6 text-center text-sm text-gray-400">
            Listing card placeholder
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-6 text-center text-sm text-gray-400">
            Listing card placeholder
          </div>
        </div>
      </div>
    </section>
  );
}
