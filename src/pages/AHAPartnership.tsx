import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Shield, 
  Camera, 
  FileCheck, 
  Lock, 
  Smartphone,
  Home,
  Flame,
  Droplets,
  AlertTriangle,
  Heart,
  CheckCircle,
  Users,
  Target,
  Handshake
} from 'lucide-react';

const AHAPartnership = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Header */}
        <div className="mb-8">
          <Button 
            variant="outline" 
            onClick={() => navigate('/admin')}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Admin
          </Button>
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-2">AHA Member Protection Vault</h1>
            <p className="text-lg text-primary font-medium mb-4">Powered by Asset Safe</p>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Protect What You've Built. Be Ready for What Comes Next.
            </p>
          </div>
        </div>

        {/* Introduction */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <p className="text-lg leading-relaxed mb-4">
              The <strong>AHA Member Protection Vault</strong> is a private, secure digital solution designed to help homeowners document, organize, and protect what matters most—before disaster, damage, or disputes occur.
            </p>
            <p className="text-lg leading-relaxed">
              Created exclusively for American Homeowners Association members, this benefit helps reduce stress, strengthen insurance claims, and give homeowners peace of mind through proactive preparation.
            </p>
          </CardContent>
        </Card>

        {/* Why This Matters */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-6 h-6 text-primary" />
              Why This Matters for Homeowners
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg mb-4">
              Most insurance claim delays and disputes happen for one simple reason:
            </p>
            <p className="text-2xl font-bold text-primary mb-4">Lack of documentation.</p>
            <p className="text-lg mb-4">
              Without clear proof of ownership, condition, and value, homeowners are often left scrambling during already stressful situations.
            </p>
            <p className="text-lg font-medium">
              The AHA Member Protection Vault solves this by helping members prepare <em>before</em> they ever need to file a claim.
            </p>
          </CardContent>
        </Card>

        {/* What Members Get */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-6 h-6 text-primary" />
              What Members Get
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex gap-4">
              <Camera className="w-8 h-8 text-primary flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-lg mb-1">Secure Digital Property Documentation</h3>
                <p className="text-muted-foreground">
                  Easily upload photos, videos, and supporting details for personal belongings, home contents, and valuable items—organized and stored securely in one place.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <FileCheck className="w-8 h-8 text-primary flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-lg mb-1">Insurance-Ready Records</h3>
                <p className="text-muted-foreground">
                  Create clear, time-stamped documentation that supports insurance claims, disaster recovery, and loss reporting.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <Target className="w-8 h-8 text-primary flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-lg mb-1">Guided Inventory Experience</h3>
                <p className="text-muted-foreground">
                  No spreadsheets. No guesswork. Members are guided step-by-step through documenting what matters most.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <Lock className="w-8 h-8 text-primary flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-lg mb-1">Private & Secure Storage</h3>
                <p className="text-muted-foreground">
                  All information is protected with modern security standards and remains private to the member.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <Smartphone className="w-8 h-8 text-primary flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-lg mb-1">Anywhere, Anytime Access</h3>
                <p className="text-muted-foreground">
                  Access your records from any device—whether at home, on the road, or during an emergency.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* How This Supports AHA's Mission */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="w-6 h-6 text-primary" />
              How This Supports AHA's Mission
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg mb-4">
              The American Homeowners Association advocates for fairness, protection, and education for homeowners.
            </p>
            <p className="text-lg mb-4">The AHA Member Protection Vault:</p>
            <ul className="space-y-2 text-lg">
              <li className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-primary" />
                Empowers homeowners with documentation and proof
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-primary" />
                Reduces stress during insurance claims and disputes
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-primary" />
                Encourages proactive preparedness
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-primary" />
                Strengthens homeowner confidence and leverage
              </li>
            </ul>
            <p className="text-xl font-bold text-primary mt-6">This is advocacy in action.</p>
          </CardContent>
        </Card>

        {/* Common Scenarios */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Home className="w-6 h-6 text-primary" />
              Common Scenarios Where This Helps
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                <Flame className="w-6 h-6 text-orange-500" />
                <span>Fire or smoke damage</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                <Droplets className="w-6 h-6 text-blue-500" />
                <span>Floods or storm-related loss</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                <AlertTriangle className="w-6 h-6 text-red-500" />
                <span>Theft or vandalism</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                <FileCheck className="w-6 h-6 text-primary" />
                <span>Insurance claim disputes</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                <Home className="w-6 h-6 text-primary" />
                <span>Major renovations or moves</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                <Heart className="w-6 h-6 text-pink-500" />
                <span>Estate or legacy planning</span>
              </div>
            </div>
            <p className="text-lg font-medium mt-6 text-center">Prepared homeowners recover faster.</p>
          </CardContent>
        </Card>

        {/* Exclusive Member Benefit */}
        <Card className="mb-8 border-primary">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-6 h-6 text-primary" />
              Exclusive Member Benefit
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg mb-4">As an AHA member, you receive:</p>
            <ul className="space-y-2 text-lg">
              <li className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-primary" />
                Special member-only pricing
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-primary" />
                Priority onboarding support
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-primary" />
                Access to ongoing preparedness resources
              </li>
            </ul>
            <p className="text-lg font-medium mt-4 text-primary">This benefit is not available to the general public.</p>
          </CardContent>
        </Card>

        {/* How It Works */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>How It Works</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">1</div>
                <p className="text-lg">Activate your AHA Member Protection Vault</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">2</div>
                <p className="text-lg">Securely document your belongings at your own pace</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">3</div>
                <p className="text-lg">Access your records anytime you need them</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">4</div>
                <p className="text-lg">Be prepared—long before something goes wrong</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* About the Technology */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-6 h-6 text-primary" />
              About the Technology
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg mb-4">
              The AHA Member Protection Vault is powered by <strong>Asset Safe</strong>, a homeowner-focused digital platform built to help individuals document, protect, and preserve what they own.
            </p>
            <p className="text-lg">
              Asset Safe was created with one goal:<br />
              <strong>Make preparedness simple, private, and accessible for every homeowner.</strong>
            </p>
          </CardContent>
        </Card>

        {/* CTA */}
        <Card className="mb-8 bg-primary text-primary-foreground">
          <CardContent className="pt-6 text-center">
            <h2 className="text-2xl font-bold mb-2">Get Started</h2>
            <p className="text-xl mb-2">Activate Your AHA Member Protection Vault Today</p>
            <p className="text-lg mb-6">Peace of mind starts with preparation.</p>
            <Button 
              size="lg" 
              variant="secondary"
              onClick={() => navigate('/contact')}
              className="text-lg px-8"
            >
              Activate Now
            </Button>
          </CardContent>
        </Card>

        {/* Executive Summary Section */}
        <div className="border-t-4 border-primary pt-8 mt-12">
          <h2 className="text-3xl font-bold text-center mb-2">AHA Member Protection Vault — Executive Summary</h2>
          <p className="text-center text-primary font-medium mb-8">Powered by Asset Safe</p>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg">
                The AHA Member Protection Vault is a proposed member benefit designed to help homeowners proactively document, protect, and organize their personal property—before disaster, damage, or insurance disputes occur.
              </p>
              <p className="text-lg mt-4">
                Powered by Asset Safe, this digital solution aligns directly with the American Homeowners Association's mission to advocate for homeowner protection, preparedness, and fairness.
              </p>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>The Problem AHA Members Face</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg mb-4">
                Most insurance claim delays, denials, and disputes stem from one core issue:
              </p>
              <p className="text-xl font-bold text-primary mb-4">Insufficient documentation of personal property.</p>
              <p className="text-lg">
                Homeowners are often unaware of this gap until they are already under stress from fire, flood, theft, or other loss events. At that point, recovery becomes slower, more complex, and more adversarial.
              </p>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>The Solution</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg mb-4">The AHA Member Protection Vault provides members with a simple, secure way to:</p>
              <ul className="space-y-2 text-lg">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-primary" />
                  Document belongings with photos, videos, and descriptions
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-primary" />
                  Create time-stamped, insurance-ready records
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-primary" />
                  Securely store information privately in one place
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-primary" />
                  Access records anytime, from any device
                </li>
              </ul>
              <p className="text-lg font-medium mt-4">This empowers homeowners <em>before</em> a claim is ever filed.</p>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Value to AHA</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg mb-4">
                This partnership positions AHA as a proactive advocate—not only educating members, but equipping them with a tangible tool that reduces stress and improves outcomes.
              </p>
              <p className="text-lg font-medium mb-2">Key benefits to AHA include:</p>
              <ul className="space-y-2 text-lg">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-primary" />
                  Increased perceived value of membership
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-primary" />
                  Strong alignment with homeowner advocacy and preparedness
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-primary" />
                  No physical inventory, logistics, or fulfillment
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-primary" />
                  No insurance, legal, or financial liability
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-primary" />
                  Positive brand association during high-stress life events
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Value to AHA Members</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg mb-2">Members gain:</p>
              <ul className="space-y-2 text-lg">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-primary" />
                  Greater confidence and preparedness
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-primary" />
                  Faster, smoother insurance claim experiences
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-primary" />
                  Reduced stress during emergencies
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-primary" />
                  Peace of mind knowing documentation is already complete
                </li>
              </ul>
              <p className="text-lg font-medium mt-4 text-primary">This benefit is preventative, not reactive.</p>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Handshake className="w-6 h-6 text-primary" />
                Partnership Model
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-lg">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-primary" />
                  White-labeled AHA experience
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-primary" />
                  Co-branded landing page
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-primary" />
                  Member-exclusive pricing or access
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-primary" />
                  Asset Safe serves as the underlying technology provider
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-muted-foreground mt-8 pb-8">
          <p>
            The AHA Member Protection Vault is an exclusive benefit for American Homeowners Association members and is powered by Asset Safe. Asset Safe does not provide insurance, legal, or financial advice.
          </p>
        </div>

        {/* Back to Admin */}
        <div className="text-center pb-8">
          <Button variant="outline" onClick={() => navigate('/admin')}>
            Return to Admin Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AHAPartnership;
