import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import SEOHead from '@/components/SEOHead';
import {
  Home,
  Users,
  Landmark,
  Building2,
  ShieldCheck,
  Hammer,
  Scale,
  Briefcase,
  HardHat,
  Gift,
  Sparkles,
  HeartHandshake,
  ClipboardCheck,
  Star,
  Handshake,
  KeyRound,
  GraduationCap,
  Lock,
  ArrowRight,
  Mail,
} from 'lucide-react';

const benefits = [
  {
    icon: Sparkles,
    title: 'Add Meaningful Value',
    body: 'Give customers, residents, employees, members, or families a useful resource they can continue using over time.',
  },
  {
    icon: HeartHandshake,
    title: 'Strengthen Relationships',
    body: 'Extend your connection beyond the initial transaction, service, project, or interaction.',
  },
  {
    icon: ClipboardCheck,
    title: 'Encourage Preparedness',
    body: 'Help people organize important information before an emergency, claim, move, transition, or unexpected event.',
  },
  {
    icon: Star,
    title: 'Differentiate Your Organization',
    body: 'Offer a thoughtful benefit centered around organization, preparedness, and protecting what matters.',
  },
];

const opportunities = [
  {
    icon: Home,
    title: 'Real Estate Agents & Brokerages',
    subheading: 'Extend the relationship beyond closing.',
    body: [
      'Offer Asset Safe as a modern closing benefit that helps clients begin organizing their new home, belongings, records, improvements, and important household information from day one.',
      'It can complement the traditional closing gift with something clients can continue using long after the transaction.',
    ],
  },
  {
    icon: Users,
    title: 'HOAs & Homeowner Associations',
    subheading: 'Support better-informed, better-prepared homeowners.',
    body: [
      'Give residents a resource for organizing property documentation, improvements, maintenance information, household records, trusted contacts, and emergency information while adding another practical benefit to the community experience.',
    ],
  },
  {
    icon: Landmark,
    title: 'Mortgage, Lending, Title & Financial Institutions',
    subheading: 'Create value after the transaction is complete.',
    body: [
      'Homebuyers leave closing with a home — and often a growing collection of documents, warranties, records, receipts, and responsibilities.',
      'Asset Safe gives them a place to begin organizing what comes next while extending the customer experience beyond closing day.',
    ],
  },
  {
    icon: Building2,
    title: 'Property Management Companies',
    subheading: 'Support better property documentation.',
    body: [
      'Asset Safe can help owners, landlords, and residents organize property condition records, improvements, maintenance information, belongings, documents, and other important property details.',
      'It can be especially useful for move-in, move-out, and long-term property documentation.',
    ],
  },
  {
    icon: ShieldCheck,
    title: 'Insurance Agents',
    subheading: 'Help clients prepare before they need to make a claim.',
    body: [
      'Insurance protects against what might happen. Asset Safe helps clients document what they have before something happens.',
      'Agents can introduce Asset Safe as an educational and preparedness resource for property documentation, important records, and household organization.',
    ],
  },
  {
    icon: Hammer,
    title: 'Restoration & Disaster Recovery',
    subheading: 'Turn recovery into future preparedness.',
    body: [
      'After fire, water damage, storms, or other losses, customers often realize how difficult it can be to reconstruct missing information.',
      'Asset Safe gives restoration professionals another way to help customers rebuild their property documentation and prepare more effectively for the future.',
    ],
  },
  {
    icon: Scale,
    title: 'Estate Planning, Trust & Elder Care',
    subheading: 'Help families organize what legal documents cannot.',
    body: [
      'Estate plans handle important legal decisions. Families may also need contacts, household information, property details, personal instructions, records, memories, and everyday knowledge.',
      'Asset Safe complements professional planning by helping families organize that information in one secure place.',
    ],
  },
  {
    icon: Briefcase,
    title: 'Employer Benefits & Employee Assistance Programs',
    subheading: 'Support preparedness beyond the workplace.',
    body: [
      'Asset Safe can be offered as a practical employee benefit that helps individuals organize household information, emergency instructions, family knowledge, property documentation, important records, and other information they may need throughout life.',
    ],
  },
  {
    icon: HardHat,
    title: 'Builders, Developers & New Construction',
    subheading: 'Give homeowners a better start.',
    body: [
      'New homeowners receive warranties, manuals, selections, appliance information, upgrade records, contacts, photos, and other property information from many different sources.',
      'Asset Safe gives homeowners a natural place to begin organizing that information from the start of homeownership.',
    ],
  },
];

const partnerModels = [
  {
    icon: Gift,
    title: 'Sponsored Memberships',
    body: 'Offer Asset Safe to customers, residents, employees, homeowners, or members as a benefit provided by your organization.',
  },
  {
    icon: KeyRound,
    title: 'Closing & Welcome Programs',
    body: 'Incorporate Asset Safe into a home closing, move-in, new-construction handoff, employee onboarding, or other meaningful milestone.',
  },
  {
    icon: Users,
    title: 'Organization & Community Programs',
    body: 'Create broader programs for brokerages, associations, employers, communities, customer groups, or professional networks.',
  },
  {
    icon: GraduationCap,
    title: 'Educational Partnerships',
    body: 'Collaborate around property documentation, preparedness, household organization, disaster readiness, family continuity, or related educational initiatives.',
  },
  {
    icon: Handshake,
    title: 'Co-Branded Introductions',
    body: 'Introduce Asset Safe through thoughtfully branded materials while allowing the individual to maintain their own independent Asset Safe account.',
  },
];

const privacySteps = [
  'Your organization provides the benefit.',
  'The customer owns the account.',
  'Their information stays private.',
];

const Partnership: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Partnership Opportunities | Asset Safe"
        description="Explore Asset Safe partnership opportunities for real estate, insurance, property management, lending, HOAs, employers, builders, estate planning, restoration, and other organizations serving people, homes, and communities."
        canonicalUrl="https://getassetsafe.com/partnership"
      />
      <Navbar />

      <main>
        {/* Hero */}
        <section
          aria-labelledby="partnership-hero-heading"
          className="border-b border-border bg-gradient-to-b from-secondary/30 to-background"
        >
          <div className="container mx-auto px-6 py-20 md:py-28">
            <div className="max-w-3xl">
              <h1
                id="partnership-hero-heading"
                className="text-4xl md:text-5xl font-bold tracking-tight"
              >
                Partner With Asset Safe
              </h1>
              <p className="mt-4 text-xl md:text-2xl text-primary font-medium">
                Give the people you serve something genuinely useful.
              </p>
              <div className="mt-6 space-y-4 text-lg text-muted-foreground">
                <p>
                  Asset Safe helps individuals and families document their property, organize
                  important information, preserve household knowledge, and prepare the people they
                  trust for the moments when that information matters most.
                </p>
                <p>
                  For organizations, Asset Safe creates an opportunity to extend value beyond the
                  transaction, policy, closing, project, or service.
                </p>
              </div>
              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <Button asChild size="lg" className="w-full sm:w-auto">
                  <a href="#partnership-opportunities">Explore Partnership Opportunities</a>
                </Button>
                <Button asChild size="lg" variant="outline" className="w-full sm:w-auto">
                  <Link to="/features">See What Asset Safe Does</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Why partner */}
        <section aria-labelledby="why-partner-heading" className="py-16 md:py-24">
          <div className="container mx-auto px-6">
            <div className="max-w-3xl">
              <h2 id="why-partner-heading" className="text-3xl md:text-4xl font-bold tracking-tight">
                Extend the value of what you already do.
              </h2>
              <div className="mt-4 space-y-3 text-lg text-muted-foreground">
                <p>
                  Your organization may already help people buy homes, protect property, recover from
                  disasters, plan for the future, manage communities, or navigate major life
                  transitions.
                </p>
                <p>Asset Safe gives those efforts a practical digital home.</p>
              </div>
            </div>

            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {benefits.map(({ icon: Icon, title, body }) => (
                <Card key={title} className="h-full">
                  <CardContent className="p-6">
                    <Icon className="w-6 h-6 text-primary" aria-hidden="true" />
                    <h3 className="mt-4 text-lg font-semibold">{title}</h3>
                    <p className="mt-2 text-muted-foreground">{body}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Partnership opportunities */}
        <section
          id="partnership-opportunities"
          aria-labelledby="opportunities-heading"
          className="scroll-mt-24 border-y border-border bg-muted/30 py-16 md:py-24"
        >
          <div className="container mx-auto px-6">
            <h2
              id="opportunities-heading"
              className="max-w-3xl text-3xl md:text-4xl font-bold tracking-tight"
            >
              Built for Organizations That Serve People, Homes &amp; Communities
            </h2>

            <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {opportunities.map(({ icon: Icon, title, subheading, body }) => (
                <Card key={title} className="h-full bg-background">
                  <CardContent className="p-6">
                    <Icon className="w-6 h-6 text-primary" aria-hidden="true" />
                    <h3 className="mt-4 text-lg font-semibold">{title}</h3>
                    <p className="mt-1 text-sm font-medium text-primary">{subheading}</p>
                    <div className="mt-3 space-y-3 text-muted-foreground">
                      {body.map((paragraph) => (
                        <p key={paragraph}>{paragraph}</p>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Flexible ways to partner */}
        <section aria-labelledby="ways-to-partner-heading" className="py-16 md:py-24">
          <div className="container mx-auto px-6">
            <div className="max-w-3xl">
              <h2
                id="ways-to-partner-heading"
                className="text-3xl md:text-4xl font-bold tracking-tight"
              >
                Flexible Ways to Partner
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Partnerships can be shaped around the organization, audience, and experience you want
                to create.
              </p>
            </div>

            <div className="mt-10 grid gap-6 md:grid-cols-2">
              {partnerModels.map(({ icon: Icon, title, body }) => (
                <div key={title} className="flex gap-4 rounded-lg border border-border p-6">
                  <Icon className="w-6 h-6 shrink-0 text-primary" aria-hidden="true" />
                  <div>
                    <h3 className="text-lg font-semibold">{title}</h3>
                    <p className="mt-2 text-muted-foreground">{body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Privacy & trust */}
        <section
          aria-labelledby="privacy-heading"
          className="border-y border-border bg-primary/5 py-16 md:py-24"
        >
          <div className="container mx-auto px-6">
            <div className="max-w-3xl">
              <Lock className="w-7 h-7 text-primary" aria-hidden="true" />
              <h2 id="privacy-heading" className="mt-4 text-3xl md:text-4xl font-bold tracking-tight">
                Your Relationship. Their Information.
              </h2>
              <p className="mt-3 text-lg font-medium text-primary">
                Partnership without access to private customer data.
              </p>
              <div className="mt-5 space-y-4 text-lg text-muted-foreground">
                <p>
                  When an organization introduces or sponsors Asset Safe, the individual creates and
                  controls their own account.
                </p>
                <p>
                  Your organization does not automatically receive access to their property records,
                  documents, Secure Vault information, Family Archive, personal information, or
                  account contents.
                </p>
                <p>They decide what they store and who they choose to share it with.</p>
              </div>
            </div>

            <ol className="mt-10 grid gap-4 md:grid-cols-3">
              {privacySteps.map((step, index) => (
                <li
                  key={step}
                  className="rounded-lg border border-border bg-background p-6"
                >
                  <span className="text-sm font-semibold text-primary">Step {index + 1}</span>
                  <p className="mt-2 font-medium">{step}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Core insight */}
        <section aria-labelledby="core-insight-heading" className="py-16 md:py-24">
          <div className="container mx-auto px-6">
            <div className="max-w-3xl">
              <h2
                id="core-insight-heading"
                className="text-3xl md:text-4xl font-bold tracking-tight"
              >
                Built to Support What You Already Care About
              </h2>
              <div className="mt-4 space-y-3 text-lg text-muted-foreground">
                <p>The strongest Asset Safe partnerships start with something simple:</p>
                <p>
                  Your organization already cares about its clients, homeowners, residents,
                  employees, members, or families.
                </p>
                <p>Asset Safe gives you another way to support them.</p>
              </div>

              <div className="mt-8 border-l-4 border-primary pl-6">
                <p className="text-xl md:text-2xl font-semibold leading-relaxed">
                  You provide the relationship.
                  <br />
                  Asset Safe provides the infrastructure.
                  <br />
                  They remain in control of their information.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section
          aria-labelledby="partnership-cta-heading"
          className="border-t border-border bg-muted/30 py-16 md:py-24"
        >
          <div className="container mx-auto px-6">
            <div className="max-w-3xl">
              <h2
                id="partnership-cta-heading"
                className="text-3xl md:text-4xl font-bold tracking-tight"
              >
                Let's Explore What Asset Safe Could Look Like for Your Organization
              </h2>
              <div className="mt-4 space-y-3 text-lg text-muted-foreground">
                <p>Every organization serves people differently.</p>
                <p>
                  Whether you're exploring a closing benefit, homeowner resource, employee program,
                  community offering, preparedness initiative, or something entirely different, we'd
                  be happy to explore how Asset Safe could fit.
                </p>
              </div>

              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <Button asChild size="lg" className="w-full sm:w-auto">
                  <a href="#partnership-opportunities">
                    Explore a Partnership
                    <ArrowRight className="ml-2 w-4 h-4" aria-hidden="true" />
                  </a>
                </Button>
                <Button asChild size="lg" variant="outline" className="w-full sm:w-auto">
                  <Link to="/contact">
                    <Mail className="mr-2 w-4 h-4" aria-hidden="true" />
                    Contact Asset Safe
                  </Link>
                </Button>
              </div>

              <p className="mt-6 text-sm text-muted-foreground">
                Real Estate · Insurance · Property Management · Lending · HOAs · Restoration · Estate
                Planning · Employee Benefits · Builders
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Partnership;
