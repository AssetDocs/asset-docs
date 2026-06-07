
import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import SEOHead from '@/components/SEOHead';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, BookOpen, Shield, Building, Camera, FileText, ClipboardList, BarChart, Users, Lock, Key, Home } from 'lucide-react';
import { breadcrumbSchema } from '@/utils/structuredData';

const VideoHelp: React.FC = () => {
  const handleWatchVideo = (videoUrl: string) => {
    window.open(videoUrl, '_blank');
  };

  const tutorials = [
    {
      id: 1,
      title: "Welcome to Asset Safe",
      description: "Get an overview of Asset Safe and learn how to navigate your dashboard.",
      duration: "3:15",
      icon: Shield,
      category: "Getting Started",
      thumbnail: "/placeholder.svg",
      videoUrl: ""
    },
    {
      id: 2,
      title: "Adding Your First Property",
      description: "Step-by-step guide to adding property information and basic details.",
      duration: "5:20",
      icon: Building,
      category: "Getting Started",
      thumbnail: "/placeholder.svg",
      videoUrl: ""
    },
    {
      id: 3,
      title: "Uploading Photos",
      description: "Best practices for photographing your assets and uploading them for AI analysis.",
      duration: "6:30",
      icon: Camera,
      category: "Asset Documentation",
      thumbnail: "/placeholder.svg",
      videoUrl: ""
    },
    {
      id: 4,
      title: "Uploading Documents",
      description: "Learn how to organize, categorize, and manage all your property documents efficiently.",
      duration: "5:40",
      icon: FileText,
      category: "Asset Documentation",
      thumbnail: "/placeholder.svg",
      videoUrl: ""
    },
    {
      id: 5,
      title: "Understanding the Checklist",
      description: "Learn how to use the interactive checklist for comprehensive asset documentation.",
      duration: "4:50",
      icon: ClipboardList,
      category: "Asset Documentation",
      thumbnail: "/placeholder.svg",
      videoUrl: ""
    },
    {
      id: 6,
      title: "Understanding the Protection Score",
      description: "Discover how your Protection Score is calculated and how to improve it.",
      duration: "5:10",
      icon: BarChart,
      category: "Insights & Tools",
      thumbnail: "/placeholder.svg",
      videoUrl: ""
    },
    {
      id: 7,
      title: "Setting Up Authorized Users",
      description: "Grant access to family members, advisors, or assistants with customizable permissions.",
      duration: "6:00",
      icon: Users,
      category: "Account Management",
      thumbnail: "/placeholder.svg",
      videoUrl: ""
    },
    {
      id: 8,
      title: "Using Legacy Locker",
      description: "Store important information your loved ones will need in a secure digital vault.",
      duration: "7:15",
      icon: Lock,
      category: "Legacy Planning",
      thumbnail: "/placeholder.svg",
      videoUrl: ""
    },
    {
      id: 9,
      title: "Using Digital Access",
      description: "Manage and share digital account credentials and access instructions securely.",
      duration: "5:45",
      icon: Key,
      category: "Legacy Planning",
      thumbnail: "/placeholder.svg",
      videoUrl: ""
    },
    {
      id: 10,
      title: "Creating an Insurance-Ready Home Inventory",
      description: "Generate comprehensive reports formatted for insurance claims and property documentation.",
      duration: "8:25",
      icon: Home,
      category: "Reports",
      thumbnail: "/placeholder.svg",
      videoUrl: ""
    }
  ];

  const categories = [...new Set(tutorials.map(t => t.category))];

  const handlePlayVideo = (tutorial: typeof tutorials[0]) => {
    if (tutorial.videoUrl) {
      window.open(tutorial.videoUrl, '_blank');
    } else {
      console.log(`Video coming soon for: ${tutorial.title}`);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <SEOHead
        title="Video Tutorials & Help | Asset Safe"
        description="Watch step-by-step video tutorials on account setup, property documentation, photo uploads, and Asset Safe dashboard features."
        keywords="asset safe tutorials, video help, how to use asset safe, property documentation tutorial, home inventory walkthrough"
        canonicalUrl="https://www.getassetsafe.com/video-help"
        structuredData={breadcrumbSchema([
          { name: 'Home', url: 'https://www.getassetsafe.com/' },
          { name: 'Video Help', url: 'https://www.getassetsafe.com/video-help' }
        ])}
      />
      <Navbar />
      
      <div className="flex-grow py-12 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-brand-blue mb-4">
              Video Help Center
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Learn how to use Asset Safe with our comprehensive video tutorials. 
              From getting started to advanced features, we'll guide you through every step.
            </p>
          </div>

          {/* Tutorial Categories */}
          {categories.map(category => {
            const categoryTutorials = tutorials.filter(t => t.category === category);
            
            return (
              <div key={category} className="mb-12">
                <h2 className="text-2xl font-bold text-brand-blue mb-6 flex items-center">
                  <BookOpen className="h-6 w-6 mr-2" />
                  {category}
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {categoryTutorials.map(tutorial => (
                    <Card key={tutorial.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                      <CardHeader className="p-0">
                        <div className="aspect-video bg-gray-200 rounded-t-lg relative overflow-hidden">
                          <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                            <Play className="h-12 w-12 text-white" />
                          </div>
                          <div className="absolute bottom-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-sm">
                            {tutorial.duration}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <tutorial.icon className="h-5 w-5 text-brand-blue mt-1 flex-shrink-0" />
                          <div className="flex-1">
                            <CardTitle className="text-lg mb-2">{tutorial.title}</CardTitle>
                            <CardDescription className="text-sm mb-3">
                              {tutorial.description}
                            </CardDescription>
                        <Button 
                          onClick={() => handlePlayVideo(tutorial)}
                          variant="outline" 
                          size="sm"
                          className="w-full"
                          disabled={!tutorial.videoUrl}
                        >
                          <Play className="h-4 w-4 mr-2" />
                          {tutorial.videoUrl ? 'Watch Tutorial' : 'Coming Soon'}
                        </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            );
          })}

          {/* Help Resources */}
          <Card className="bg-blue-50 border-brand-blue/20">
            <CardContent className="p-8 text-center">
              <h3 className="text-2xl font-bold text-brand-blue mb-4">
                Need More Help?
              </h3>
              <p className="text-gray-700 mb-6 max-w-2xl mx-auto">
                Can't find what you're looking for? Our support team is here to help you 
                get the most out of Asset Safe.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Button asChild className="bg-brand-blue hover:bg-brand-lightBlue">
                  <a href="/contact">Contact Support</a>
                </Button>
                <Button asChild variant="outline" className="border-brand-blue text-brand-blue">
                  <a href="/qa">Browse FAQ</a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default VideoHelp;
