
import React from 'react';
import { Button } from '@/components/ui/button';
import { MessageSquare } from 'lucide-react';
import { Link } from 'react-router-dom';

const FeedbackSection: React.FC = () => {
  return (
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center">
          <MessageSquare className="h-12 w-12 text-brand-blue mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-brand-blue mb-4">
            We Value Your Feedback
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Your thoughts and experiences matter to us. Whether you have concerns, suggestions, 
            or simply want to share your experience with AssetDocs, we'd love to hear from you. 
            Your feedback helps us improve our service and better serve our community.
          </p>
          <Button asChild size="lg" className="bg-brand-blue hover:bg-brand-lightBlue">
            <Link to="/feedback">Share Your Feedback</Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default FeedbackSection;
