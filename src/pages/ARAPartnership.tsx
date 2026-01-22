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
  Users,
  Target,
  Handshake,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  Award,
  Briefcase
} from 'lucide-react';

const ARAPartnership = () => {
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
            <h1 className="text-4xl font-bold mb-2">ARA Member Protection Benefit</h1>
            <p className="text-lg text-primary font-medium mb-4">Executive Summary — Powered by Asset Safe</p>
          </div>
        </div>

        {/* Overview */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg leading-relaxed mb-4">
              The <strong>ARA Member Protection Benefit</strong> is a proposed value-added service designed to help residential real estate professionals and their clients proactively document, protect, and organize property inventories and key assets before loss events occur. This tool enhances member value by offering practical support that contributes directly to better client outcomes and stronger professional relationships.
            </p>
            <p className="text-lg leading-relaxed">
              ARA is a member-driven trade association advocating, educating, and elevating real estate professionals nationwide. The Association puts agent needs and industry advancement at the center of its mission, providing access to resources, training, advocacy, and community connections.
            </p>
          </CardContent>
        </Card>

        {/* Market Challenge */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-6 h-6 text-primary" />
              Market Challenge: Claims & Documentation Gaps
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg mb-4">
              Agents frequently advise clients on insurance, home protection, and risk mitigation, yet many homeowners lack clear, organized documentation of their belongings and hard assets. This documentation gap often leads to:
            </p>
            <ul className="space-y-3 text-lg">
              <li className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-orange-500 mt-1 flex-shrink-0" />
                <span>Prolonged or contested insurance claims</span>
              </li>
              <li className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-orange-500 mt-1 flex-shrink-0" />
                <span>Client frustration and stress</span>
              </li>
              <li className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-orange-500 mt-1 flex-shrink-0" />
                <span>Increased workload for agents assisting with evidence gathering</span>
              </li>
            </ul>
            <p className="text-lg mt-4">
              These challenges reflect broader systemic issues in homeowner preparedness and serve as an opportunity for ARA to offer a solution that extends member impact beyond transactions.
            </p>
          </CardContent>
        </Card>

        {/* The Solution */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-6 h-6 text-primary" />
              The Solution: ARA Member Protection Powered by Asset Safe
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg mb-6">
              This benefit equips ARA members — and through them, their clients — with a secure, easy-to-use platform to:
            </p>
            <div className="space-y-4">
              <div className="flex gap-4">
                <Camera className="w-8 h-8 text-primary flex-shrink-0 mt-1" />
                <div>
                  <p className="text-lg">
                    <strong>Organize homeowner property inventories</strong> with photos, videos, and notes
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <FileCheck className="w-8 h-8 text-primary flex-shrink-0 mt-1" />
                <div>
                  <p className="text-lg">
                    <strong>Create time-stamped, insurance-ready documentation</strong>
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <Lock className="w-8 h-8 text-primary flex-shrink-0 mt-1" />
                <div>
                  <p className="text-lg">
                    <strong>Store data securely and privately</strong> with anytime, anywhere access
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <Users className="w-8 h-8 text-primary flex-shrink-0 mt-1" />
                <div>
                  <p className="text-lg">
                    <strong>Empower agents to advise clients</strong> with confidence
                  </p>
                </div>
              </div>
            </div>
            <p className="text-lg mt-6 p-4 bg-muted rounded-lg">
              <strong>Asset Safe</strong> is the technology that makes this possible — a homeowner documentation platform designed to reduce claim stress and improve outcomes.
            </p>
          </CardContent>
        </Card>

        {/* Strategic Value to ARA */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-primary" />
              Strategic Value to ARA
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg mb-4">
              This member benefit aligns with ARA's mission to elevate professional standards, strengthen member capabilities, and support agents in delivering exceptional client experiences.
            </p>
            <p className="text-lg font-medium mb-3">Key benefits to ARA include:</p>
            <ul className="space-y-2 text-lg">
              <li className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                Differentiates membership through a highly practical, consultative tool
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                Enhances agent value propositions with clients
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                Supports agent education on preparedness and risk communication
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                Adds a scalable benefit without operational burden or inventory management
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Value to ARA Members */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="w-6 h-6 text-primary" />
              Value to ARA Members
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg mb-4">Agents and brokers gain a resource they can use to:</p>
            <ul className="space-y-2 text-lg">
              <li className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                Improve client preparedness before listing or closing
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                Provide thoughtful, retention-focused guidance
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                Reduce friction and client anxiety in post-loss scenarios
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                Deepen trust and long-term referral relationships
              </li>
            </ul>
            <p className="text-lg font-medium mt-4 text-primary">
              This benefit enhances both professional credibility and client satisfaction.
            </p>
          </CardContent>
        </Card>

        {/* Partnership Framework */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Handshake className="w-6 h-6 text-primary" />
              Partnership Framework
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg mb-4">
              ARA retains full control of member messaging while Asset Safe provides the underlying technology.
            </p>
            <p className="text-lg font-medium mb-3">Proposed elements:</p>
            <ul className="space-y-2 text-lg">
              <li className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                Co-branded landing page or member portal integration
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                Exclusive member-preferred pricing or access tiers
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                Onboarding support and educational content
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                Optional tracking of engagement metrics
              </li>
            </ul>
            <p className="text-lg mt-4">
              This approach maintains ARA's brand authority and ensures the benefit reinforces the Association's strategic priorities.
            </p>
          </CardContent>
        </Card>

        {/* Implementation & Risk Profile */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="w-6 h-6 text-primary" />
              Implementation & Risk Profile
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-lg">
              <li className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                No system integration required
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                No physical products or inventory to manage
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                Minimal administrative overhead
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                Optional pilot with measurable KPIs
              </li>
            </ul>
            <p className="text-lg font-medium mt-4 text-primary">
              This is a low-risk, high-perceived-value addition to the ARA member benefits portfolio.
            </p>
          </CardContent>
        </Card>

        {/* Strategic Fit */}
        <Card className="mb-8 border-primary">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-6 h-6 text-primary" />
              Strategic Fit
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg">
              This tool transforms valuable industry advocacy into tangible support that helps agents and their clients before, during, and after major events — from moves to claims. It reinforces ARA's role as a forward-thinking association that empowers professionals with modern, real-world resources.
            </p>
          </CardContent>
        </Card>

        {/* Footer Disclaimer */}
        <div className="text-center text-sm text-muted-foreground mt-8 p-6 bg-muted rounded-lg">
          <p>
            The ARA Member Protection Benefit is a proposed member advantage powered by Asset Safe. Asset Safe does not provide insurance, legal, or financial advice.
          </p>
        </div>

        {/* Back to Admin */}
        <div className="text-center py-8">
          <Button variant="outline" onClick={() => navigate('/admin')}>
            Return to Admin Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ARAPartnership;
