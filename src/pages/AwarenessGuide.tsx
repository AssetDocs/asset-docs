import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Home, Shield } from 'lucide-react';

const AwarenessGuide: React.FC = () => {
  const risks = [
    {
      emoji: "🔥",
      title: "Clogged Dryer Vents",
      description: "Leading cause of house fires. Clean at least once per year."
    },
    {
      emoji: "💧",
      title: "Leaky Roofs & Gutters",
      description: "Clogged gutters or damaged shingles cause water intrusion and mold."
    },
    {
      emoji: "⚡",
      title: "Outdated Electrical Systems",
      description: "Overloaded circuits and old wiring spark dangerous fires."
    },
    {
      emoji: "💦",
      title: "Water Heater Failure",
      description: "Sediment buildup leads to tank ruptures and flooding. Flush yearly."
    },
    {
      emoji: "🦠",
      title: "Mold & Poor Ventilation",
      description: "Hidden mold causes health problems and structural damage."
    },
    {
      emoji: "🐜",
      title: "Pests (Termites, Rodents, Ants)",
      description: "Quietly destroy foundations, chew wires, and spread disease."
    },
    {
      emoji: "🏚️",
      title: "Foundation Cracks & Poor Drainage",
      description: "Water pooling erodes foundations and shifts soil."
    },
    {
      emoji: "🔥",
      title: "Chimney & Fireplace Creosote",
      description: "Buildup ignites quickly — clean before winter."
    },
    {
      emoji: "💧",
      title: "Sump Pump Failure",
      description: "A quick test could save thousands in flood damage."
    },
    {
      emoji: "🔒",
      title: "Security & Cyber Risks",
      description: "Outdated alarms, cameras, or weak cybersecurity put property & data at risk."
    }
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-grow py-12 px-4 bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Home className="h-8 w-8 text-primary" />
              <Shield className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-4xl font-bold text-foreground mb-4">
              🏠🔒 Asset Docs Awareness Guide
            </h1>
            <h2 className="text-2xl font-semibold text-muted-foreground mb-6">
              Top 10 Hidden Risks That Can Damage Your Home or Business
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Most property losses are preventable with regular maintenance and smart documentation. 
              Protect your investment before disaster strikes.
            </p>
          </div>

          {/* Risk Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {risks.map((risk, index) => (
              <Card key={index} className="h-full hover:shadow-lg transition-shadow duration-300">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">{risk.emoji}</span>
                    <Badge variant="outline">{index + 1}</Badge>
                  </div>
                  <CardTitle className="text-lg leading-tight">{risk.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{risk.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pro Tip Section */}
          <Card className="bg-primary/5 border-primary/20 mb-8">
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-6 w-6 text-primary" />
                <Badge variant="default">Pro Tip from Asset Docs</Badge>
              </div>
              <CardTitle className="text-xl">Prevention is Key</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-lg">
                Most property losses are preventable with regular maintenance and smart documentation. 
                Protect your investment before disaster strikes.
              </p>
            </CardContent>
          </Card>

          {/* Call to Action */}
          <div className="text-center bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg p-8">
            <h3 className="text-2xl font-bold text-foreground mb-4">
              📌 Protect your property. Protect your family. Protect your business.
            </h3>
            <p className="text-xl font-semibold text-primary">
              Asset Docs – Your Digital Safety Net
            </p>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default AwarenessGuide;