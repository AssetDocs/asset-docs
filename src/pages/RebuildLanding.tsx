import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import assetSafeLogo from '@/assets/asset-safe-logo.png';
import UpdateSignupForm from '@/components/rebuild/UpdateSignupForm';

interface RebuildLandingProps {
  /**
   * True when this page is standing in for a former marketing URL. Those
   * responses are noindex so they do not compete with the root URL, which
   * remains the indexable, self-canonical Asset Safe homepage.
   */
  isSubstitutePath?: boolean;
}

const values = [
  {
    title: 'Document What Matters',
    body: 'Property, possessions, improvements, and important records — kept so the documentation you need is easier to find.',
  },
  {
    title: 'Keep It Organized',
    body: 'Give important information a reliable, structured home instead of scattered folders, drawers, and devices.',
  },
  {
    title: 'Be Prepared',
    body: 'Help ensure the right information is available when you, your family, or someone you trust needs it.',
  },
];

const RebuildLanding: React.FC<RebuildLandingProps> = ({
  isSubstitutePath = false,
}) => {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Helmet>
        <title>Asset Safe | Document. Organize. Protect.</title>
        <meta
          name="description"
          content="Asset Safe helps individuals, families, landlords, and businesses document and organize important property, records, and information so they're better prepared when it matters."
        />
        <link rel="canonical" href="https://getassetsafe.com/" />
        <meta
          name="robots"
          content={isSubstitutePath ? 'noindex, follow' : 'index, follow'}
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://getassetsafe.com/" />
        <meta
          property="og:title"
          content="Asset Safe | Document. Organize. Protect."
        />
        <meta
          property="og:description"
          content="Document and organize the property, records, and information that may someday matter — so you're prepared when it counts."
        />
        <meta property="og:site_name" content="Asset Safe" />
      </Helmet>

      {/* Header — logo only. No navigation, no sign-in, no admin links. */}
      <header className="border-b border-gray-100">
        <div className="mx-auto max-w-5xl px-6 py-6">
          <img src={assetSafeLogo} alt="Asset Safe" className="h-10 w-auto" />
        </div>
      </header>

      <main className="flex-grow">
        {/* Hero */}
        <section className="mx-auto max-w-3xl px-6 pt-20 pb-16 sm:pt-28 sm:pb-20">
          <h1 className="text-3xl font-bold leading-tight tracking-tight text-brand-darkBlue sm:text-4xl md:text-5xl">
            Be prepared for what comes next.
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-gray-600 sm:text-xl">
            Asset Safe helps homeowners, renters, landlords, families, and
            businesses document and organize their property, possessions,
            improvements, and important records — the information that may
            someday matter.
          </p>
          <p className="mt-5 text-lg leading-relaxed text-gray-600 sm:text-xl">
            Good documentation isn't only about keeping records. It's about
            being prepared when life doesn't go according to plan.
          </p>
          <p className="mt-8 text-lg font-medium text-brand-blue sm:text-xl">
            Everything you love. Protected in one place.
          </p>
        </section>

        {/* Rebuild message */}
        <section className="border-y border-gray-100 bg-gray-50">
          <div className="mx-auto max-w-3xl px-6 py-16 sm:py-20">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-blue">
              We're strengthening Asset Safe.
            </p>
            <p className="mt-6 text-lg leading-relaxed text-gray-700">
              Asset Safe is currently undergoing an extensive rebuild with an
              even greater emphasis on security, privacy, reliability, and
              long-term protection.
            </p>
            <p className="mt-5 text-lg leading-relaxed text-gray-700">
              We're taking the time to build the foundation right.
            </p>
          </div>
        </section>

        {/* Values */}
        <section className="mx-auto max-w-5xl px-6 py-16 sm:py-20">
          <div className="grid gap-10 sm:gap-8 md:grid-cols-3">
            {values.map((value) => (
              <div key={value.title}>
                <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-darkBlue">
                  {value.title}
                </h2>
                <p className="mt-3 text-base leading-relaxed text-gray-600">
                  {value.body}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Email updates */}
        <section className="border-y border-gray-100 bg-gray-50">
          <div className="mx-auto max-w-xl px-6 py-16 sm:py-20">
            <h2 className="text-2xl font-bold text-brand-darkBlue sm:text-3xl">
              Stay informed.
            </h2>
            <p className="mt-4 text-base leading-relaxed text-gray-600 sm:text-lg">
              Be among the first to receive Asset Safe updates, early-access
              announcements, and information about our return.
            </p>
            <div className="mt-8">
              <UpdateSignupForm />
            </div>
            <p className="mt-4 text-sm text-gray-500">
              See our{' '}
              <Link to="/privacy-policy" className="underline hover:text-brand-blue">
                Privacy Policy
              </Link>
              .
            </p>
          </div>
        </section>

        {/* Closing brand message */}
        <section className="mx-auto max-w-3xl px-6 py-20 text-center sm:py-24">
          <p className="text-xl font-semibold text-brand-darkBlue sm:text-2xl">
            Your property. Your information. Your story.
          </p>
          <p className="mt-4 text-lg text-brand-blue sm:text-xl">
            Document it. Organize it. Protect it.
          </p>
        </section>
      </main>

      <footer className="border-t border-gray-100">
        <div className="mx-auto flex max-w-5xl flex-col gap-4 px-6 py-8 text-sm text-gray-500 sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 Asset Safe</p>
          <nav className="flex flex-wrap gap-x-6 gap-y-2">
            <Link to="/privacy-policy" className="hover:text-brand-blue">
              Privacy
            </Link>
            <Link to="/terms" className="hover:text-brand-blue">
              Terms
            </Link>
            <Link to="/cookie-policy" className="hover:text-brand-blue">
              Cookie Policy
            </Link>
            <Link to="/legal" className="hover:text-brand-blue">
              Legal
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
};

export default RebuildLanding;
