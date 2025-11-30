
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import ChatbotInterface from '@/components/ChatbotInterface';
import { MessageCircle, HelpCircle } from 'lucide-react';

interface ContactFormData {
  name: string;
  email: string;
  telephone: string;
  message: string;
  hearAboutUs: string;
}

const Contact: React.FC = () => {
  const { toast } = useToast();
  const [showChat, setShowChat] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const form = useForm<ContactFormData>({
    defaultValues: {
      name: '',
      email: '',
      telephone: '',
      message: '',
      hearAboutUs: '',
    },
  });

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true);
    try {
      console.log('Contact form submitted:', data);
      
      const { error } = await supabase.functions.invoke('send-contact-email', {
        body: data
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Message Sent Successfully!",
        description: `Thank you ${data.name}, we'll get back to you soon! You should also receive a confirmation email.`,
      });
      form.reset();
    } catch (error) {
      console.error('Error sending contact email:', error);
      toast({
        title: "Error Sending Message",
        description: "There was a problem sending your message. Please try again or contact us directly at support@assetsafe.net",
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
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-brand-blue mb-8 text-center">Contact Us</h1>
          
          {/* Q&A and Chat Assistant Section - Made More Prominent */}
          <div className="bg-gradient-to-r from-blue-50 to-teal-50 p-6 rounded-lg mb-10 border border-blue-200">
            <h2 className="text-2xl font-semibold mb-4 text-center text-gray-800">
              Get Quick Answers First
            </h2>
            <p className="text-gray-600 text-center mb-6">
              Save time by checking our FAQ or chatting with our AI assistant for instant answers.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/qa">
                <Button className="bg-brand-blue hover:bg-brand-blue/90 text-white flex items-center gap-2">
                  <HelpCircle className="w-5 h-5" />
                  Browse Q&A Section
                </Button>
              </Link>
              
              <Button 
                onClick={() => setShowChat(!showChat)}
                variant="outline"
                className="border-brand-blue text-brand-blue hover:bg-brand-blue hover:text-white flex items-center gap-2"
              >
                <MessageCircle className="w-5 h-5" />
                {showChat ? 'Close' : 'Open'} AI Chat Assistant
              </Button>
            </div>
            
            {showChat && (
              <div className="mt-6">
                <ChatbotInterface />
              </div>
            )}
          </div>
          
          <div className="bg-white p-8 rounded-lg shadow-md">
            <p className="text-lg text-gray-600 mb-8 text-center">
              Still have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
            </p>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="name"
                    rules={{ required: "Name is required" }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name *</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Enter your full name" 
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="email"
                    rules={{ 
                      required: "Email is required",
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: "Invalid email address"
                      }
                    }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email *</FormLabel>
                        <FormControl>
                          <Input 
                            type="email"
                            placeholder="Enter your email address" 
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="telephone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Telephone Number</FormLabel>
                        <FormControl>
                          <Input 
                            type="tel"
                            placeholder="(123) 456-7890" 
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="hearAboutUs"
                    rules={{ required: "Please tell us how you heard about us" }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>How did you hear about us? *</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Google search, referral, social media, etc." 
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="message"
                  rules={{ required: "Message is required" }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Message/Question *</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Tell us about your question or how we can help you..."
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
                  disabled={isSubmitting}
                  className="w-full bg-brand-blue hover:bg-brand-blue/90 text-white disabled:opacity-50"
                >
                  {isSubmitting ? 'Sending...' : 'Send Message'}
                </Button>
              </form>
            </Form>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Contact;
