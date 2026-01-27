import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Camera, Shield, Share2, ArrowRight } from 'lucide-react';

const DocumentProtectSection: React.FC = () => {
  const steps = [
    { number: 1, title: 'Document', description: 'Capture photos, videos, and details of your property and possessions.' },
    { number: 2, title: 'Store', description: 'Securely save everything in the cloud with encryption and privacy controls.' },
    { number: 3, title: 'Protect', description: 'Access your records anytime for claims, planning, or property sales.' },
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
          {/* Left: 3-Step Process with Circular Visual */}
          <div className="flex flex-col items-center">
            <div className="relative w-full max-w-sm mx-auto">
              {/* Circular container */}
              <div className="relative">
                {/* Connecting arrows/circle */}
                <svg className="absolute inset-0 w-full h-full" viewBox="0 0 300 300">
                  <circle
                    cx="150"
                    cy="150"
                    r="120"
                    fill="none"
                    stroke="hsl(var(--primary))"
                    strokeWidth="2"
                    strokeDasharray="8 4"
                    opacity="0.3"
                  />
                  {/* Arrow indicators */}
                  <path
                    d="M 150 30 A 120 120 0 0 1 260 180"
                    fill="none"
                    stroke="hsl(var(--primary))"
                    strokeWidth="2"
                    markerEnd="url(#arrowhead)"
                  />
                  <path
                    d="M 260 180 A 120 120 0 0 1 80 240"
                    fill="none"
                    stroke="hsl(var(--secondary))"
                    strokeWidth="2"
                    markerEnd="url(#arrowhead2)"
                  />
                  <path
                    d="M 80 240 A 120 120 0 0 1 150 30"
                    fill="none"
                    stroke="hsl(var(--accent))"
                    strokeWidth="2"
                    markerEnd="url(#arrowhead3)"
                  />
                  <defs>
                    <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                      <polygon points="0 0, 10 3.5, 0 7" fill="hsl(var(--primary))" />
                    </marker>
                    <marker id="arrowhead2" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                      <polygon points="0 0, 10 3.5, 0 7" fill="hsl(var(--secondary))" />
                    </marker>
                    <marker id="arrowhead3" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                      <polygon points="0 0, 10 3.5, 0 7" fill="hsl(var(--accent))" />
                    </marker>
                  </defs>
                </svg>
                
                {/* Step nodes */}
                <div className="relative h-80">
                  {/* Step 1 - Top */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 text-center">
                    <div className="w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center mx-auto mb-2 shadow-lg">
                      <span className="text-xl font-bold">1</span>
                    </div>
                    <h4 className="font-semibold text-foreground">{steps[0].title}</h4>
                    <p className="text-sm text-muted-foreground max-w-[140px] mx-auto mt-1">{steps[0].description}</p>
                  </div>
                  
                  {/* Step 2 - Bottom Right */}
                  <div className="absolute bottom-8 right-0 text-center">
                    <div className="w-16 h-16 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center mx-auto mb-2 shadow-lg">
                      <span className="text-xl font-bold">2</span>
                    </div>
                    <h4 className="font-semibold text-foreground">{steps[1].title}</h4>
                    <p className="text-sm text-muted-foreground max-w-[140px] mx-auto mt-1">{steps[1].description}</p>
                  </div>
                  
                  {/* Step 3 - Bottom Left */}
                  <div className="absolute bottom-8 left-0 text-center">
                    <div className="w-16 h-16 rounded-full bg-accent text-accent-foreground flex items-center justify-center mx-auto mb-2 shadow-lg">
                      <span className="text-xl font-bold">3</span>
                    </div>
                    <h4 className="font-semibold text-foreground">{steps[2].title}</h4>
                    <p className="text-sm text-muted-foreground max-w-[140px] mx-auto mt-1">{steps[2].description}</p>
                  </div>
                </div>
              </div>
            </div>
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
