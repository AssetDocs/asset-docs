
import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Clock, MapPin, Camera, FileImage, BarChart, Shield } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const formSchema = z.object({
  firstName: z.string().min(2, { message: "First name must be at least 2 characters." }),
  lastName: z.string().min(2, { message: "Last name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  phone: z.string().min(10, { message: "Please enter a valid phone number." }),
  propertyAddress: z.string().min(5, { message: "Please enter a valid property address." }),
  propertyType: z.string(),
  squareFootage: z.string().min(1, { message: "Square footage is required." }),
  preferredDate: z.string(),
  timePreference: z.string(),
  services: z.array(z.string()).min(1, { message: "Please select at least one service." }),
  specialRequests: z.string().optional(),
});

const ScheduleProfessional: React.FC = () => {
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [estimatedCost, setEstimatedCost] = useState<number>(0);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      propertyAddress: "",
      propertyType: "",
      squareFootage: "",
      preferredDate: "",
      timePreference: "",
      services: [],
      specialRequests: "",
    },
  });

  const services = [
    { id: 'photography', name: 'High Resolution Photography', description: 'Professional photos of all areas and assets' },
    { id: 'lidar', name: '3D LiDAR Scanning', description: 'Precise 3D models with measurements' },
    { id: 'reports', name: 'Detailed Reports', description: 'Comprehensive documentation reports' },
    { id: 'xactimate', name: 'Xactimate ESX Files', description: 'Insurance-ready ESX file generation' },
    { id: 'tagging', name: 'Asset Tagging', description: 'Individual item identification and cataloging' },
  ];

  const handleServiceToggle = (serviceId: string) => {
    const newServices = selectedServices.includes(serviceId)
      ? selectedServices.filter(id => id !== serviceId)
      : [...selectedServices, serviceId];
    
    setSelectedServices(newServices);
    form.setValue('services', newServices);
  };

  const calculateEstimate = (sqft: string) => {
    const footage = parseFloat(sqft);
    if (!isNaN(footage)) {
      const cost = footage * 0.35;
      setEstimatedCost(cost);
    } else {
      setEstimatedCost(0);
    }
  };

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    console.log('Schedule request:', values);
    // Here you would typically send the data to your backend
    alert('Thank you! We will contact you within 24 hours to confirm your appointment.');
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      {/* Hero Section */}
      <section className="bg-brand-blue text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-6">Schedule Your AssetDocs Professional</h1>
          <p className="text-xl max-w-3xl mx-auto">
            Book a certified AssetDocs professional for comprehensive property documentation with third-party verification.
          </p>
        </div>
      </section>
      
      {/* Services Overview */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Professional Services Included</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <Camera className="h-8 w-8 text-brand-blue mb-2" />
                <CardTitle>Professional Photography</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>High-resolution documentation of your entire property and all valuable assets.</CardDescription>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <FileImage className="h-8 w-8 text-brand-blue mb-2" />
                <CardTitle>3D LiDAR Scanning</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>Precise 3D models with accurate measurements and asset location mapping.</CardDescription>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <BarChart className="h-8 w-8 text-brand-blue mb-2" />
                <CardTitle>Comprehensive Reports</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>Detailed documentation reports and Xactimate ESX files for insurance purposes.</CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
      
      {/* Scheduling Form */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Schedule Your Documentation Session</CardTitle>
                <CardDescription>
                  Fill out the form below to schedule your professional property documentation session.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    {/* Personal Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="firstName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>First Name</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="lastName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Last Name</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email Address</FormLabel>
                            <FormControl>
                              <Input type="email" {...field} />
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
                            <FormLabel>Phone Number</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    {/* Property Information */}
                    <FormField
                      control={form.control}
                      name="propertyAddress"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Property Address</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="propertyType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Property Type</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select property type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="residential">Residential Home</SelectItem>
                                <SelectItem value="condo">Condominium</SelectItem>
                                <SelectItem value="commercial">Commercial Property</SelectItem>
                                <SelectItem value="rental">Rental Property</SelectItem>
                                <SelectItem value="vacation">Vacation Home</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="squareFootage"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Square Footage</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                {...field} 
                                onChange={(e) => {
                                  field.onChange(e);
                                  calculateEstimate(e.target.value);
                                }}
                              />
                            </FormControl>
                            <FormDescription>
                              Total square footage of the property
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    {/* Cost Estimate */}
                    {estimatedCost > 0 && (
                      <div className="bg-brand-green text-white p-4 rounded-lg">
                        <h3 className="text-lg font-semibold mb-2">Estimated Investment</h3>
                        <p className="text-2xl font-bold">${estimatedCost.toLocaleString()}</p>
                        <p className="text-sm opacity-90">Based on $0.35 per square foot</p>
                      </div>
                    )}
                    
                    {/* Scheduling Preferences */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="preferredDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Preferred Date</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="timePreference"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Time Preference</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select time preference" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="morning">Morning (8 AM - 12 PM)</SelectItem>
                                <SelectItem value="afternoon">Afternoon (12 PM - 5 PM)</SelectItem>
                                <SelectItem value="evening">Evening (5 PM - 8 PM)</SelectItem>
                                <SelectItem value="flexible">Flexible</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    {/* Special Requests */}
                    <FormField
                      control={form.control}
                      name="specialRequests"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Special Requests or Notes</FormLabel>
                          <FormControl>
                            <Textarea 
                              {...field} 
                              placeholder="Any special requirements, areas of focus, or additional information..."
                              className="min-h-[100px]"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <Button type="submit" size="lg" className="w-full bg-brand-blue hover:bg-brand-lightBlue">
                      Schedule My Documentation Session
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default ScheduleProfessional;
