import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { featureSections } from '@/data/featuresContent';

/**
 * Flat index of every Asset Safe feature name, driven by the same config as
 * /features. Names only — descriptions live on /features so there is a single
 * editorial surface.
 */
const FeaturesList: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-12 flex-1">
        <h1 className="text-3xl font-bold text-primary mb-3">All Features</h1>
        <p className="text-muted-foreground max-w-2xl mb-10">
          A complete index of what Asset Safe includes, grouped the same way it is grouped inside the
          app. For what each one does, see{' '}
          <Link to="/features" className="text-primary underline">
            Features
          </Link>
          .
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {featureSections.map((section) => (
            <section key={section.id}>
              <h2 className="text-xl font-semibold mb-4">
                <Link to={`/features#${section.id}`} className="text-primary hover:underline">
                  {section.name}
                </Link>
              </h2>
              <div className="space-y-4">
                {section.groups.map((group) => (
                  <div key={group.heading}>
                    <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">
                      {group.heading}
                    </h3>
                    <ul className="text-sm space-y-0.5">
                      {group.items.map((item) => (
                        <li key={item.name}>• {item.name}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default FeaturesList;
