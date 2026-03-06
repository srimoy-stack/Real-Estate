interface HeroSliderProps {
  brandName: string;
  tagline?: string;
}

export function HeroSlider({ brandName, tagline }: HeroSliderProps) {
  return (
    <section className="relative flex min-h-[60vh] items-center justify-center bg-gray-100">
      <div className="mx-auto max-w-4xl px-4 text-center">
        <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
          {brandName}
        </h1>
        {tagline && (
          <p className="mt-4 text-lg text-gray-600">{tagline}</p>
        )}
        {/* TODO: Replace with actual image slider */}
      </div>
    </section>
  );
}
