import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, Camera, Shield, CheckCircle, AlertTriangle } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const PhotographerInterest: React.FC = () => {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    full_name: '',
    business_name: '',
    email: '',
    phone: '',
    city_state: '',
    primary_service_area: '',
    website_url: '',
    years_experience: '',
    currently_active: 'yes',
    additional_notes: '',
  });

  const updateField = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.full_name.trim() || !form.email.trim() || !form.phone.trim() || !form.city_state.trim() || !form.primary_service_area.trim() || !form.years_experience) {
      toast({ title: 'Please complete all required fields', variant: 'destructive' });
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase.from('photographer_interest').insert({
        full_name: form.full_name.trim(),
        business_name: form.business_name.trim() || null,
        email: form.email.trim(),
        phone: form.phone.trim(),
        city_state: form.city_state.trim(),
        primary_service_area: form.primary_service_area.trim(),
        website_url: form.website_url.trim() || null,
        years_experience: form.years_experience,
        currently_active: form.currently_active === 'yes',
        additional_notes: form.additional_notes.trim() || null,
      });

      if (error) throw error;

      setSubmitted(true);
      toast({ title: 'Interest form submitted successfully' });
    } catch (err: any) {
      console.error('Submission error:', err);
      toast({ title: 'Failed to submit form', description: err.message, variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-2xl mx-auto px-4 py-24 text-center space-y-6">
          <CheckCircle className="w-16 h-16 text-primary mx-auto" />
          <h1 className="text-3xl font-bold text-foreground">Thank You</h1>
          <p className="text-muted-foreground text-lg">
            Your interest has been received. Asset Safe will review submissions and follow up with additional details as the program develops.
          </p>
          <Button variant="outline" onClick={() => navigate('/')}>Return Home</Button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-16 space-y-16">
        {/* Hero */}
        <section className="text-center space-y-4 pt-8">
          <div className="flex justify-center">
            <Camera className="w-12 h-12 text-primary" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground leading-tight">
            Professional In-Home Documentation for Families Who Need Support
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Asset Safe partners with trusted photographers to help individuals and families document their homes and belongings with care, clarity, and confidence.
          </p>
        </section>

        {/* What Is Asset Safe */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-foreground">What Is Asset Safe?</h2>
          <p className="text-muted-foreground leading-relaxed">
            Asset Safe is a secure digital platform designed to help individuals and families document, organize, and protect their physical belongings and important assets.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            The platform supports self-paced documentation for insurance preparedness, estate planning, and long-term legacy preservation — all in a structured, low-stress environment.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            For some users, including elderly individuals or families navigating major life transitions, self-documentation can feel overwhelming. Asset Safe offers an optional, assisted documentation pathway to help meet those needs.
          </p>
        </section>

        {/* How Asset Safe Serves the End User */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-foreground">How Asset Safe Serves the End User</h2>
          <ul className="space-y-3">
            {[
              'Guided, room-by-room asset documentation',
              'Secure storage and organized categorization',
              'Clear visual records for insurance readiness and estate planning',
              'Time-stamped, third-party documentation',
              'Reduced stress for individuals and families',
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-3 text-muted-foreground">
                <CheckCircle className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* The Photographer's Role */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-foreground">The Photographer's Role</h2>
          <p className="text-muted-foreground leading-relaxed">
            Asset Safe works with experienced real estate photographers to provide professional, respectful in-home documentation services.
          </p>
          <h3 className="text-lg font-medium text-foreground pt-2">Responsibilities May Include:</h3>
          <ul className="space-y-3">
            {[
              'Room-by-room still photography',
              'Close-up documentation of higher-value or identifying items',
              'Optional walkthrough video capture',
              'Following a structured documentation checklist',
              'Secure upload of media to the Asset Safe platform',
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-3 text-muted-foreground">
                <CheckCircle className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>

          {/* Clarification callout */}
          <Card className="border-destructive/30 bg-destructive/5 mt-6">
            <CardContent className="flex items-start gap-3 p-4">
              <AlertTriangle className="w-5 h-5 text-destructive mt-0.5 shrink-0" />
              <p className="text-sm text-foreground">
                <strong>Important:</strong> Asset Safe photographers do not provide on-site valuations, appraisals, or insurance guidance. This role is strictly focused on visual documentation.
              </p>
            </CardContent>
          </Card>
        </section>

        {/* Who This Is For */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-foreground">Who This Is For</h2>
          <ul className="space-y-3">
            {[
              'Professional real estate photographers',
              'Media professionals experienced working in private homes',
              'Individuals who value discretion, accuracy, and professionalism',
              'Photographers comfortable following structured documentation guidelines',
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-3 text-muted-foreground">
                <CheckCircle className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Interest Form */}
        <section className="space-y-6">
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold text-foreground">Interest Form</h2>
            <p className="text-muted-foreground">
              If you're interested in learning more and being considered as part of Asset Safe's trusted photographer network, please complete the form below.
            </p>
          </div>

          <Card>
            <CardContent className="p-6 sm:p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Name fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="full_name">Full Name *</Label>
                    <Input id="full_name" value={form.full_name} onChange={e => updateField('full_name', e.target.value)} placeholder="Jane Doe" required maxLength={100} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="business_name">Business Name <span className="text-muted-foreground text-xs">(optional)</span></Label>
                    <Input id="business_name" value={form.business_name} onChange={e => updateField('business_name', e.target.value)} placeholder="Doe Photography LLC" maxLength={100} />
                  </div>
                </div>

                {/* Contact */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address *</Label>
                    <Input id="email" type="email" value={form.email} onChange={e => updateField('email', e.target.value)} placeholder="jane@example.com" required maxLength={255} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input id="phone" type="tel" value={form.phone} onChange={e => updateField('phone', e.target.value)} placeholder="(555) 123-4567" required maxLength={20} />
                  </div>
                </div>

                {/* Location */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city_state">City & State *</Label>
                    <Input id="city_state" value={form.city_state} onChange={e => updateField('city_state', e.target.value)} placeholder="Austin, TX" required maxLength={100} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="primary_service_area">Primary Service Area *</Label>
                    <Input id="primary_service_area" value={form.primary_service_area} onChange={e => updateField('primary_service_area', e.target.value)} placeholder="Austin metro, Round Rock, Cedar Park" required maxLength={255} />
                  </div>
                </div>

                {/* Website */}
                <div className="space-y-2">
                  <Label htmlFor="website_url">Website or Portfolio Link <span className="text-muted-foreground text-xs">(optional)</span></Label>
                  <Input id="website_url" type="url" value={form.website_url} onChange={e => updateField('website_url', e.target.value)} placeholder="https://janedoephoto.com" maxLength={500} />
                </div>

                {/* Experience & Active Status */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Years of Professional Experience *</Label>
                    <Select value={form.years_experience} onValueChange={v => updateField('years_experience', v)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select range" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1-3">1–3 years</SelectItem>
                        <SelectItem value="4-7">4–7 years</SelectItem>
                        <SelectItem value="8-12">8–12 years</SelectItem>
                        <SelectItem value="12+">12+ years</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-3">
                    <Label>Currently active as a real estate photographer? *</Label>
                    <RadioGroup value={form.currently_active} onValueChange={v => updateField('currently_active', v)} className="flex gap-6 pt-1">
                      <div className="flex items-center gap-2">
                        <RadioGroupItem value="yes" id="active-yes" />
                        <Label htmlFor="active-yes" className="font-normal cursor-pointer">Yes</Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <RadioGroupItem value="no" id="active-no" />
                        <Label htmlFor="active-no" className="font-normal cursor-pointer">No</Label>
                      </div>
                    </RadioGroup>
                  </div>
                </div>

                {/* Additional Notes */}
                <div className="space-y-2">
                  <Label htmlFor="additional_notes">Anything else we should know? <span className="text-muted-foreground text-xs">(optional)</span></Label>
                  <Textarea id="additional_notes" value={form.additional_notes} onChange={e => updateField('additional_notes', e.target.value)} placeholder="Equipment, specializations, availability…" rows={4} maxLength={1000} />
                </div>

                <Button type="submit" className="w-full sm:w-auto" disabled={submitting}>
                  {submitting ? 'Submitting…' : 'Submit Interest'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </section>

        {/* Footer Note */}
        <p className="text-sm text-muted-foreground text-center pb-8">
          Asset Safe will review submissions and follow up with additional details as the program develops. Submission of this form does not guarantee participation.
        </p>
      </main>

      <Footer />
    </div>
  );
};

export default PhotographerInterest;
