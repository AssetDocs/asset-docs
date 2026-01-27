import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Camera, Shield, Share2, Database } from 'lucide-react';

const DocumentProtectSection: React.FC = () => {
  const steps = [
    { number: 1, title: 'Document', description: 'Capture photos, videos, and details of your property and possessions.', icon: <Camera className="w-8 h-8" /> },
    { number: 2, title: 'Store', description: 'Securely save everything in the cloud with encryption and privacy controls.', icon: <Database className="w-8 h-8" /> },
    { number: 3, title: 'Protect', description: 'Access your records anytime for claims, planning, or property sales.', icon: <Shield className="w-8 h-8" /> },
  ];

  const tools = [
    {
      icon: <Camera className="w-8 h-8" />,
      title: 'Smart Asset Documentation',
      description: 'Capture detailed images, videos, and inventory of your property with easy-to-use tools.',
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: 'Secure Digital Vault',
      description: 'Enterprise-grade encryption keeps your documentation safe and accessible only to you.',
    },
    {
      icon: <Share2 className="w-8 h-8" />,
      title: 'Preparedness & Sharing Controls',
      description: 'Share access with trusted contacts and be ready for insurance claims or estate planning.',
    },
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="section-title mb-12">Everything You Need to Document and Protect</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Left: 3-Step Process as Horizontal Cards */}
          <div className="space-y-6">
            {steps.map((step, index) => (
              <div
                key={index}
                className="flex items-start gap-4 p-6 bg-card rounded-lg border border-border shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex-shrink-0 w-14 h-14 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                  {step.icon}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium text-primary">Step {step.number}</span>
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-1">{step.title}</h3>
                  <p className="text-muted-foreground">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
          
          {/* Right: 3 Core Tools */}
          <div className="space-y-6">
            {tools.map((tool, index) => (
              <div
                key={index}
                className="flex items-start gap-4 p-6 bg-card rounded-lg border border-border shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex-shrink-0 w-14 h-14 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                  {tool.icon}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-1">{tool.title}</h3>
                  <p className="text-muted-foreground">{tool.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* CTAs */}
        <div className="mt-12 text-center">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-primary hover:bg-primary/90">
              <Link to="/features">View All Features</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/scenarios">Solutions</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DocumentProtectSection;
