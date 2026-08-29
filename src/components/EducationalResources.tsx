
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import DocumentationChecklist from '@/components/DocumentationChecklist';
import { BookOpen, Camera, FileText, AlertTriangle, Play, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const EducationalResources: React.FC = () => {
  const resources = [
    {
      icon: BookOpen,
      title: "Home Inventory Guide",
      description: "Create a room-by-room inventory of belongings, photos, receipts, values, and supporting details.",
      type: "Guide",
      duration: "7 min read",
      href: "/home-inventory"
    },
    {
      icon: Camera,
      title: "Photography Best Practices",
      description: "Learn how to capture high-quality photos for comprehensive asset documentation.",
      type: "Guide",
      duration: "2 min read",
      href: "/photography-guide"
    },
    {
      icon: FileText,
      title: "Digital Documentation Guide",
      description: "Compare digital asset documentation with spreadsheets and phone photos.",
      type: "Guide",
      duration: "8 min read",
      href: "/digital-documentation-guide"
    },
    {
      icon: FileText,
      title: "Documentation Checklist",
      description: "Complete interactive checklist for documenting your property and possessions effectively.",
      type: "Interactive Guide",
      duration: "15 min read",
      anchor: "documentation-checklist"
    },
    {
      icon: AlertTriangle,
      title: "Insurance Claim Preparation",
      description: "Step-by-step guide to preparing documentation for insurance claims.",
      type: "Article",
      duration: "7 min read",
      href: "/claims"
    },
    {
      icon: BookOpen,
      title: "Asset Documentation Guide",
      description: "Understand what property details, receipts, condition notes, and estimated values belong in an asset record.",
      type: "Article",
      duration: "8 min read",
      href: "/asset-documentation"
    }
  ];


  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-brand-blue mb-4">
          Learn & Maximize Your Protection
        </h2>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          Get the most out of Asset Safe with our comprehensive guides and best practices. 
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
              {'href' in resource && resource.href ? (
                <Button asChild className="w-full bg-brand-orange hover:bg-brand-orange/90">
                  <Link to={resource.href}>
                    {resource.type === "Video" ? (
                      <Play className="h-4 w-4 mr-2" />
                    ) : (
                      <BookOpen className="h-4 w-4 mr-2" />
                    )}
                    Access {resource.type}
                  </Link>
                </Button>
              ) : (
                <Button
                  className="w-full bg-brand-orange hover:bg-brand-orange/90"
                  onClick={() => {
                    if ('anchor' in resource && resource.anchor) {
                      document.getElementById(resource.anchor)?.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Access {resource.type}
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div id="documentation-checklist" className="mt-12">
        <DocumentationChecklist />
      </div>
    </div>
  );
};

export default EducationalResources;
