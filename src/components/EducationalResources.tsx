
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, Camera, FileText, AlertTriangle, Play, Download } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const EducationalResources: React.FC = () => {
  const navigate = useNavigate();
  const resources = [
    {
      icon: Camera,
      title: "Photography Best Practices",
      description: "Learn how to capture high-quality photos that maximize AI valuation accuracy.",
      type: "Guide",
      duration: "2 min read"
    },
    {
      icon: FileText,
      title: "Documentation Checklist",
      description: "Complete checklist for documenting your property and possessions effectively.",
      type: "PDF Download",
      duration: "2 pages"
    },
    {
      icon: AlertTriangle,
      title: "Insurance Claim Preparation",
      description: "Step-by-step guide to preparing documentation for insurance claims.",
      type: "Video",
      duration: "12 min watch"
    },
    {
      icon: BookOpen,
      title: "Asset Valuation Explained",
      description: "Understanding how our AI determines values and what factors matter most.",
      type: "Article",
      duration: "8 min read"
    }
  ];

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-brand-blue mb-4">
          Learn & Maximize Your Protection
        </h2>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          Get the most out of Asset Docs with our comprehensive guides and best practices. 
          Learn from insurance professionals and property documentation experts.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {resources.map((resource, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center">
                <resource.icon className="h-6 w-6 mr-3 text-brand-blue" />
                {resource.title}
              </CardTitle>
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span className="bg-brand-lightBlue/20 text-brand-blue px-2 py-1 rounded">
                  {resource.type}
                </span>
                <span>{resource.duration}</span>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base mb-4">
                {resource.description}
              </CardDescription>
              <Button 
                className="w-full bg-brand-orange hover:bg-brand-orange/90"
                onClick={() => {
                  if (resource.title === "Photography Best Practices") {
                    navigate('/photography-guide');
                  }
                }}
              >
                {resource.type === "Video" ? (
                  <Play className="h-4 w-4 mr-2" />
                ) : resource.type === "PDF Download" ? (
                  <Download className="h-4 w-4 mr-2" />
                ) : (
                  <BookOpen className="h-4 w-4 mr-2" />
                )}
                Access {resource.type}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-orange-50 border-brand-orange">
        <CardContent className="p-6">
          <div className="text-center">
            <h3 className="text-xl font-semibold text-brand-orange mb-2">
              Need Personal Assistance?
            </h3>
            <p className="text-gray-700 mb-4">
              Schedule a free consultation with our property documentation specialists. 
              Get personalized advice for your specific situation.
            </p>
            <Button className="bg-brand-orange hover:bg-brand-orange/90">
              Schedule Free Consultation
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EducationalResources;
