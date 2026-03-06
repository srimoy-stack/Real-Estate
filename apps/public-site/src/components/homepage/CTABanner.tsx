interface CTABannerProps {
  heading?: string;
  description?: string;
  buttonText?: string;
  buttonHref?: string;
}

export function CTABanner({
  heading = 'Ready to find your dream home?',
  description = 'Get in touch with our expert agents today.',
  buttonText = 'Contact Us',
  buttonHref = '/contact',
}: CTABannerProps) {
  return (
    <section className="bg-gray-900 py-16">
      <div className="mx-auto max-w-4xl px-4 text-center">
        <h2 className="text-2xl font-bold text-white sm:text-3xl">{heading}</h2>
        <p className="mt-3 text-gray-300">{description}</p>
        <a
          href={buttonHref}
          className="mt-6 inline-block rounded-md bg-white px-6 py-3 text-sm font-semibold text-gray-900 transition-colors hover:bg-gray-100"
        >
          {buttonText}
        </a>
      </div>
    </section>
  );
}
