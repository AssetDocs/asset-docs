import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import SEOHead from '@/components/SEOHead';
import {
  ArrowLeft,
  Building2,
  Shield,
  Users,
  Lock,
  BarChart3,
  FileText,
  CheckCircle2,
  ChevronRight,
  Landmark,
  Church,
  GraduationCap,
  Home,
  Briefcase,
  ShieldCheck,
} from 'lucide-react';

const EnterpriseWhiteLabel = () => {
  const navigate = useNavigate();

  const handleCTAClick = () => {
    navigate('/contact');
  };

  return (
    <>
      <SEOHead
        title="Asset Safe for Organizations | White-Label Enterprise"
        description="Offer your employees, members, or clients a secure, guided asset documentation system—fully branded under your organization."
      />
      <Navbar />

      <main className="min-h-screen bg-background">
        {/* Back button */}
        <div className="container mx-auto px-4 pt-6">
          <Button
            variant="outline"
            onClick={() => navigate('/admin/b2b-opportunities')}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to B2B Opportunities
          </Button>
        </div>

        {/* 1. Hero Section */}
        <section className="bg-brand-blue text-white py-20">
          <div className="container mx-auto px-4 text-center max-w-4xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
              Your Brand at the Center of Asset Protection
            </h1>
            <p className="text-lg md:text-xl mb-10 opacity-90 max-w-3xl mx-auto">
              Offer your employees, members, or clients a secure, guided asset documentation
              system—fully branded under your organization.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button
                size="lg"
                className="bg-white text-brand-blue hover:bg-gray-100 font-semibold"
                onClick={handleCTAClick}
              >
                Request Enterprise Demo
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white/10"
                onClick={() => {
                  document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                View Enterprise Features
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        </section>

        {/* 2. What White-Label Means */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4 max-w-4xl">
            <h2 className="text-3xl font-bold text-center mb-4">What White-Label Means</h2>
            <p className="text-center text-muted-foreground mb-10 max-w-2xl mx-auto">
              Your organization takes center stage. Asset Safe powers everything behind the scenes.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto">
              {[
                'Organization logo displayed at top of user dashboard',
                'Organization name shown as provider',
                'Custom welcome message',
                'Optional custom domain',
                'Co-branded or fully private-label options',
                'Asset Safe operates in the background',
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3 p-4 bg-background rounded-lg border">
                  <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 3. Why Organizations Use Asset Safe */}
        <section className="py-16">
          <div className="container mx-auto px-4 max-w-5xl">
            <h2 className="text-3xl font-bold text-center mb-12">Why Organizations Use Asset Safe</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <Building2 className="w-5 h-5 text-primary" />
                    Benefits for Organizations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {[
                      'Risk reduction',
                      'Trust & goodwill',
                      'Documentation readiness',
                      'Oversight & reporting',
                      'Scalable across teams',
                    ].map((item, i) => (
                      <li key={i} className="flex items-center gap-3">
                        <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                        <span className="text-sm">{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <Users className="w-5 h-5 text-primary" />
                    Benefits for Users
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {[
                      'Step-by-step guidance',
                      'Secure asset & document storage',
                      'Easier insurance claims',
                      'Legacy & executor readiness',
                      'Mobile-friendly experience',
                    ].map((item, i) => (
                      <li key={i} className="flex items-center gap-3">
                        <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                        <span className="text-sm">{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* 4. Core Enterprise Features */}
        <section id="features" className="py-16 bg-muted/30">
          <div className="container mx-auto px-4 max-w-5xl">
            <h2 className="text-3xl font-bold text-center mb-12">Core Enterprise Features</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { icon: Building2, title: 'White-Label Branding', desc: 'Your logo, name, and messaging across the platform' },
                { icon: Users, title: 'Admin Dashboard', desc: 'User management, roles, and organization controls' },
                { icon: BarChart3, title: 'Bulk User Invites', desc: 'Onboard teams quickly with batch invitations' },
                { icon: Shield, title: 'Progress Tracking', desc: 'Monitor user readiness and documentation completion' },
                { icon: FileText, title: 'Asset Documentation', desc: 'Comprehensive system for property and belongings' },
                { icon: Lock, title: 'Secure Vault & Records', desc: 'Encrypted storage for sensitive documents' },
                { icon: ShieldCheck, title: 'Role-Based Access', desc: 'Encryption and granular access permissions' },
                { icon: BarChart3, title: 'Audit Logs', desc: 'Full activity tracking and compliance reporting' },
              ].map((feature, i) => (
                <Card key={i} className="text-center">
                  <CardContent className="pt-6">
                    <div className="flex justify-center mb-4">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <feature.icon className="w-6 h-6 text-primary" />
                      </div>
                    </div>
                    <h3 className="font-semibold mb-2">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* 5. Industry Use Cases */}
        <section className="py-16">
          <div className="container mx-auto px-4 max-w-5xl">
            <h2 className="text-3xl font-bold text-center mb-12">Industry Use Cases</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { icon: Home, title: 'Real Estate Brokerages', desc: 'Provide post-closing asset protection to homebuyers as a value-added service.' },
                { icon: Shield, title: 'Insurance Companies', desc: 'Equip policyholders with documentation tools for faster, smoother claims.' },
                { icon: Briefcase, title: 'Enterprise Employers', desc: 'Offer personal preparedness as a meaningful employee benefit.' },
                { icon: Church, title: 'Churches & Nonprofits', desc: 'Help congregations and members protect household assets affordably.' },
                { icon: GraduationCap, title: 'Schools & Universities', desc: 'Support faculty, staff, and student housing with documentation resources.' },
                { icon: Landmark, title: 'Government Departments', desc: 'Empower residents with proactive documentation before disasters strike.' },
              ].map((useCase, i) => (
                <Card key={i}>
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <useCase.icon className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold mb-1">{useCase.title}</h3>
                        <p className="text-sm text-muted-foreground">{useCase.desc}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* 6. Enterprise Pricing Overview */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4 max-w-4xl">
            <h2 className="text-3xl font-bold text-center mb-4">Enterprise Pricing</h2>
            <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
              Flexible plans designed for organizations of every size.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {[
                { tier: 'Team', range: '10–50 users', desc: 'Small teams and departments' },
                { tier: 'Organization', range: '50–200 users', desc: 'Mid-size organizations and chapters' },
                { tier: 'Enterprise', range: '200+ users', desc: 'Large-scale deployments' },
              ].map((plan, i) => (
                <Card key={i} className="text-center">
                  <CardContent className="pt-6">
                    <h3 className="text-xl font-bold mb-1">{plan.tier}</h3>
                    <p className="text-primary font-semibold mb-2">{plan.range}</p>
                    <p className="text-sm text-muted-foreground">{plan.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
            <p className="text-center text-sm text-muted-foreground mb-6">
              Volume pricing, annual contracts, and custom agreements available.
            </p>
            <div className="text-center">
              <Button size="lg" onClick={handleCTAClick}>
                Talk to Sales
              </Button>
            </div>
          </div>
        </section>

        {/* 7. Final CTA Section */}
        <section className="py-20 bg-brand-blue text-white">
          <div className="container mx-auto px-4 text-center max-w-3xl">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Bring Asset Protection Under Your Brand
            </h2>
            <p className="text-lg mb-10 opacity-90">
              Asset Safe enables organizations to provide trusted, secure asset documentation at
              scale—under their own name.
            </p>
            <Button
              size="lg"
              className="bg-white text-brand-blue hover:bg-gray-100 font-semibold"
              onClick={handleCTAClick}
            >
              Request Enterprise Demo
            </Button>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
};

export default EnterpriseWhiteLabel;
