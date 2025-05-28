
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';

interface ContactFormData {
  name: string;
}

const Contact: React.FC = () => {
  const { toast } = useToast();
  const form = useForm<ContactFormData>({
    defaultValues: {
      name: '',
    },
  });

  const onSubmit = (data: ContactFormData) => {
    console.log('Contact form submitted:', data);
    toast({
      title: "Message Sent",
      description: `Thank you ${data.name}, we'll get back to you soon!`,
    });
    form.reset();
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <div className="container mx-auto px-4 py-12 flex-grow">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-4xl font-bold text-brand-blue mb-8 text-center">Contact Us</h1>
          
          <div className="bg-white p-8 rounded-lg shadow-md">
            <p className="text-lg text-gray-600 mb-8 text-center">
              We'd love to hear from you. Send us a message and we'll respond as soon as possible.
            </p>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="name"
                  rules={{ required: "Name is required" }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter your full name" 
                          {...field}
                          className="w-full"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Button 
                  type="submit" 
                  className="w-full bg-brand-blue hover:bg-brand-blue/90 text-white"
                >
                  Send Message
                </Button>
              </form>
            </Form>
          </div>
          
          <div className="mt-12 text-center">
            <h2 className="text-2xl font-semibold mb-6 text-gray-800">Other Ways to Reach Us</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold mb-3 text-gray-800">Email</h3>
                <p className="text-gray-600">
                  <a href="mailto:info@assetdocs.com" className="hover:text-brand-blue transition-colors">
                    info@assetdocs.com
                  </a>
                </p>
              </div>
              
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold mb-3 text-gray-800">Phone</h3>
                <p className="text-gray-600">
                  <a href="tel:+11234567890" className="hover:text-brand-blue transition-colors">
                    (123) 456-7890
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Contact;
