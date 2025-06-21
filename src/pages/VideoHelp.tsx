
import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, BookOpen, UserPlus, Camera, Upload, Building, FileText, Settings } from 'lucide-react';

const VideoHelp: React.FC = () => {
  const tutorials = [
    {
      id: 1,
      title: "Getting Started: Create Your Account",
      description: "Learn how to sign up and set up your Asset Docs account in just a few minutes.",
      duration: "3:45",
      icon: UserPlus,
      category: "Getting Started",
      thumbnail: "/placeholder.svg"
    },
    {
      id: 2,
      title: "Adding Your First Property",
      description: "Step-by-step guide to adding property information and basic details.",
      duration: "5:20",
      icon: Building,
      category: "Property Management",
      thumbnail: "/placeholder.svg"
    },
    {
      id: 3,
      title: "Using CubiCasa Integration",
      description: "Create professional floor plans instantly with CubiCasa's AI-powered technology.",
      duration: "7:15",
      icon: Building,
      category: "Floor Plans",
      thumbnail: "/placeholder.svg"
    },
    {
      id: 4,
      title: "Uploading Photos for Asset Documentation",
      description: "Best practices for photographing your assets and uploading them for AI analysis.",
      duration: "6:30",
      icon: Camera,
      category: "Photo Management",
      thumbnail: "/placeholder.svg"
    },
    {
      id: 5,
      title: "Video Documentation Tips",
      description: "How to create effective video documentation of your property and assets.",
      duration: "4:50",
      icon: Upload,
      category: "Video Management",
      thumbnail: "/placeholder.svg"
    },
    {
      id: 6,
      title: "Managing Your Documents",
      description: "Organize, categorize, and manage all your property documents efficiently.",
      duration: "5:40",
      icon: FileText,
      category: "Document Management",
      thumbnail: "/placeholder.svg"
    },
    {
      id: 7,
      title: "AI Valuation and Asset Recognition",
      description: "Understanding how our AI identifies and values your assets automatically.",
      duration: "6:10",
      icon: Settings,
      category: "AI Features",
      thumbnail: "/placeholder.svg"
    },
    {
      id: 8,
      title: "Generating Reports for Insurance",
      description: "Create comprehensive reports for insurance claims and property documentation.",
      duration: "8:25",
      icon: FileText,
      category: "Reports",
      thumbnail: "/placeholder.svg"
    }
  ];

  const categories = [...new Set(tutorials.map(t => t.category))];

  const handlePlayVideo = (tutorialId: number) => {
    console.log(`Playing tutorial ${tutorialId}`);
    // TODO: Implement video player functionality
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <div className="flex-grow py-12 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-brand-blue mb-4">
              Video Help Center
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Learn how to use Asset Docs with our comprehensive video tutorials. 
              From getting started to advanced features, we'll guide you through every step.
            </p>
          </div>

          {/* Featured Tutorial */}
          <Card className="mb-12 bg-gradient-to-r from-brand-blue to-brand-lightBlue text-white">
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="flex-1">
                  <h2 className="text-2xl font-bold mb-2">New User? Start Here!</h2>
                  <p className="text-blue-100 mb-4">
                    Watch our comprehensive getting started guide that covers account creation, 
                    adding your first property, and uploading your first photos.
                  </p>
                  <Button 
                    onClick={() => handlePlayVideo(1)}
                    className="bg-white text-brand-blue hover:bg-gray-100"
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Watch Now (3:45)
                  </Button>
                </div>
                <div className="w-full md:w-80 h-48 bg-white/20 rounded-lg flex items-center justify-center">
                  <Play className="h-16 w-16 text-white/80" />
                </div>
              </div>
            </CardContent>
          </Card>

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
                              onClick={() => handlePlayVideo(tutorial.id)}
                              variant="outline" 
                              size="sm"
                              className="w-full"
                            >
                              <Play className="h-4 w-4 mr-2" />
                              Watch Tutorial
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
                get the most out of Asset Docs.
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
