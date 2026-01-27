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
          <div className="flex flex-col items-center justify-center">
            <div className="relative w-full max-w-md mx-auto">
              {/* Connecting arrows/circle */}
              <svg className="w-full" viewBox="0 0 400 420" fill="none">
                {/* Dashed circle */}
                <circle
                  cx="200"
                  cy="180"
                  r="100"
                  fill="none"
                  stroke="hsl(var(--primary))"
                  strokeWidth="2"
                  strokeDasharray="8 4"
                  opacity="0.3"
                />
                {/* Arrow from Step 1 to Step 2 */}
                <path
                  d="M 200 80 A 100 100 0 0 1 285 230"
                  fill="none"
                  stroke="hsl(var(--primary))"
                  strokeWidth="2"
                  markerEnd="url(#arrow1)"
                />
                {/* Arrow from Step 2 to Step 3 */}
                <path
                  d="M 285 230 A 100 100 0 0 1 115 230"
                  fill="none"
                  stroke="hsl(var(--secondary))"
                  strokeWidth="2"
                  markerEnd="url(#arrow2)"
                />
                {/* Arrow from Step 3 to Step 1 */}
                <path
                  d="M 115 230 A 100 100 0 0 1 200 80"
                  fill="none"
                  stroke="hsl(var(--accent))"
                  strokeWidth="2"
                  markerEnd="url(#arrow3)"
                />
                <defs>
                  <marker id="arrow1" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                    <polygon points="0 0, 10 3.5, 0 7" fill="hsl(var(--primary))" />
                  </marker>
                  <marker id="arrow2" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                    <polygon points="0 0, 10 3.5, 0 7" fill="hsl(var(--secondary))" />
                  </marker>
                  <marker id="arrow3" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                    <polygon points="0 0, 10 3.5, 0 7" fill="hsl(var(--accent))" />
                  </marker>
                </defs>
                
                {/* Step 1 - Top Center */}
                <g>
                  <circle cx="200" cy="50" r="28" fill="hsl(var(--primary))" />
                  <text x="200" y="56" textAnchor="middle" fill="white" fontSize="18" fontWeight="bold">1</text>
                </g>
                
                {/* Step 2 - Bottom Right */}
                <g>
                  <circle cx="310" cy="260" r="28" fill="hsl(var(--secondary))" />
                  <text x="310" y="266" textAnchor="middle" fill="white" fontSize="18" fontWeight="bold">2</text>
                </g>
                
                {/* Step 3 - Bottom Left */}
                <g>
                  <circle cx="90" cy="260" r="28" fill="hsl(var(--accent))" />
                  <text x="90" y="266" textAnchor="middle" fill="hsl(var(--accent-foreground))" fontSize="18" fontWeight="bold">3</text>
                </g>
              </svg>
              
              {/* Step Labels - positioned outside SVG for better text handling */}
              <div className="absolute top-[85px] left-1/2 -translate-x-1/2 text-center w-40">
                <h4 className="font-semibold text-foreground">{steps[0].title}</h4>
                <p className="text-xs text-muted-foreground mt-1">{steps[0].description}</p>
              </div>
              
              <div className="absolute bottom-[20px] right-0 text-center w-36">
                <h4 className="font-semibold text-foreground">{steps[1].title}</h4>
                <p className="text-xs text-muted-foreground mt-1">{steps[1].description}</p>
              </div>
              
              <div className="absolute bottom-[20px] left-0 text-center w-36">
                <h4 className="font-semibold text-foreground">{steps[2].title}</h4>
                <p className="text-xs text-muted-foreground mt-1">{steps[2].description}</p>
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
