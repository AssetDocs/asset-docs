
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { toast } from '@/hooks/use-toast';
import { MessageSquare } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useState } from 'react';

const feedbackSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().optional(),
  hearAboutUs: z.string().min(1, 'Please select how you heard about us'),
  currentUser: z.enum(['yes', 'no'], {
    required_error: 'Please select if you are a current user',
  }),
  npsScore: z.string().min(1, 'Please select a rating'),
  improvement: z.string().min(10, 'Please provide at least 10 characters of feedback'),
});

type FeedbackFormData = z.infer<typeof feedbackSchema>;

const Feedback: React.FC = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<FeedbackFormData>({
    resolver: zodResolver(feedbackSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      hearAboutUs: '',
      currentUser: undefined,
      npsScore: '',
      improvement: '',
    },
  });

  const onSubmit = async (data: FeedbackFormData) => {
    setIsSubmitting(true);
    try {
      const { error } = await supabase.functions.invoke('send-feedback-email', {
        body: {
          name: data.name,
          email: data.email,
          phone: data.phone || '',
          hearAboutUs: data.hearAboutUs,
          currentUser: data.currentUser,
          npsScore: data.npsScore,
          improvement: data.improvement,
        },
      });

      if (error) throw error;

      toast({
        title: "Thank you for your feedback!",
        description: "We appreciate your input and will review it carefully.",
      });
      form.reset();
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast({
        title: "Error",
        description: "Failed to submit feedback. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <div className="container mx-auto px-4 py-12 flex-grow">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <MessageSquare className="h-12 w-12 text-brand-blue mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-brand-blue mb-2">We Value Your Feedback</h1>
            <p className="text-muted-foreground">
              Help us improve AssetDocs by sharing your thoughts and experiences with us.
            </p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your full name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address *</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="Enter your email address" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number (Optional)</FormLabel>
                    <FormControl>
                      <Input type="tel" placeholder="Enter your phone number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="hearAboutUs"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>How did you hear about us? *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select an option" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="search-engine">Search Engine (Google, Bing, etc.)</SelectItem>
                        <SelectItem value="social-media">Social Media</SelectItem>
                        <SelectItem value="friend-family">Friend or Family</SelectItem>
                        <SelectItem value="insurance-agent">Insurance Agent/Company</SelectItem>
                        <SelectItem value="advertisement">Advertisement</SelectItem>
                        <SelectItem value="news-article">News Article/Blog</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="currentUser"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>Are you a current user of AssetDocs? *</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-col space-y-1"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="yes" id="current-yes" />
                          <Label htmlFor="current-yes">Yes, I am a current user</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="no" id="current-no" />
                          <Label htmlFor="current-no">No, I am not a current user</Label>
                        </div>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="npsScore"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>How likely are you to refer AssetDocs to a friend or family member? *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a rating (0-10)" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="10">10 - Extremely likely</SelectItem>
                        <SelectItem value="9">9 - Very likely</SelectItem>
                        <SelectItem value="8">8 - Likely</SelectItem>
                        <SelectItem value="7">7 - Somewhat likely</SelectItem>
                        <SelectItem value="6">6 - Neutral</SelectItem>
                        <SelectItem value="5">5 - Neutral</SelectItem>
                        <SelectItem value="4">4 - Somewhat unlikely</SelectItem>
                        <SelectItem value="3">3 - Unlikely</SelectItem>
                        <SelectItem value="2">2 - Very unlikely</SelectItem>
                        <SelectItem value="1">1 - Extremely unlikely</SelectItem>
                        <SelectItem value="0">0 - Would not recommend</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="improvement"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>What can we do to improve our service? *</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Please share your thoughts, suggestions, or any concerns you may have..."
                        className="min-h-[120px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button 
                type="submit" 
                className="w-full bg-brand-blue hover:bg-brand-lightBlue"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
              </Button>
            </form>
          </Form>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Feedback;
