
import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Home, Video, BookOpen, Shield, CheckCircle2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const Welcome: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <Navbar />
      
      <div className="flex-grow flex items-center justify-center py-12 px-4">
        <div className="max-w-4xl w-full">
          {/* Welcome Hero */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
              <CheckCircle2 className="w-10 h-10 text-primary-foreground" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Welcome to AssetDocs! 🎉
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Congratulations on taking proactive steps to protect your assets and minimize your risks. 
              You've made an excellent decision for your future security!
            </p>
          </div>

          {/* Main CTA Card */}
          <Card className="mb-8 border-2 border-primary/20 shadow-xl">
            <CardContent className="p-8 text-center">
              <Shield className="w-16 h-16 text-primary mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-foreground mb-3">
                Your Dashboard Awaits
              </h2>
              <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
                Start documenting your assets, uploading photos, and building your comprehensive property protection portfolio.
              </p>
              <Link to="/inventory">
                <Button size="lg" className="text-lg px-8 py-6 h-auto">
                  <Home className="mr-2 h-5 w-5" />
                  Go to Dashboard
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Resources Grid */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="bg-accent/20 p-3 rounded-lg">
                    <Video className="w-6 h-6 text-accent-foreground" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      Video Help Center
                    </h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      Watch step-by-step tutorials to make the most of AssetDocs features.
                    </p>
                    <Link to="/video-help">
                      <Button variant="outline" size="sm">
                        Watch Tutorials
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="bg-secondary/20 p-3 rounded-lg">
                    <BookOpen className="w-6 h-6 text-secondary-foreground" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      Resources & Guides
                    </h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      Explore our comprehensive library of guides and reference materials.
                    </p>
                    <Link to="/resources">
                      <Button variant="outline" size="sm">
                        Browse Resources
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick tip */}
          <div className="mt-8 text-center">
            <p className="text-sm text-muted-foreground">
              💡 <strong>Pro Tip:</strong> Start by adding your first property and uploading photos of your most valuable items.
            </p>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Welcome;
