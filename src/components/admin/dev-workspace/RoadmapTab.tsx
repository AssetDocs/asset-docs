import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Map, ArrowRight, Clock, Calendar, Rocket } from 'lucide-react';

interface RoadmapItem {
  title: string;
  description: string;
  status: 'now' | 'next' | 'later';
  tags?: string[];
}

const roadmapItems: RoadmapItem[] = [];

const statusConfig = {
  now: { 
    label: 'Now', 
    icon: Rocket, 
    color: 'bg-green-500', 
    description: 'Active development (0-30 days)',
    badgeVariant: 'default' as const
  },
  next: { 
    label: 'Next', 
    icon: Clock, 
    color: 'bg-blue-500', 
    description: 'Coming soon (30-60 days)',
    badgeVariant: 'secondary' as const
  },
  later: { 
    label: 'Later', 
    icon: Calendar, 
    color: 'bg-muted', 
    description: 'Future planning (60-90+ days)',
    badgeVariant: 'outline' as const
  },
};

export const RoadmapTab: React.FC = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Map className="w-5 h-5" />
            Product Roadmap
          </CardTitle>
          <CardDescription>
            Where the product is heading over the next 30–90 days
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {(['now', 'next', 'later'] as const).map((status) => {
              const config = statusConfig[status];
              const Icon = config.icon;
              const items = roadmapItems.filter(item => item.status === status);
              
              return (
                <div key={status} className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${config.color}`} />
                    <h3 className="font-semibold">{config.label}</h3>
                    <span className="text-xs text-muted-foreground">({items.length})</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{config.description}</p>
                  
                  <div className="space-y-3">
                    {items.map((item, idx) => (
                      <div 
                        key={idx} 
                        className="p-3 border rounded-lg bg-card hover:shadow-sm transition-shadow"
                      >
                        <h4 className="font-medium text-sm">{item.title}</h4>
                        <p className="text-xs text-muted-foreground mt-1">{item.description}</p>
                        {item.tags && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {item.tags.map(tag => (
                              <Badge key={tag} variant="outline" className="text-xs py-0">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
      
      {/* Key Dates */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Key Dates</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <ArrowRight className="w-4 h-4 text-green-500" />
                <span>Feature Freeze - Phase 1</span>
              </div>
              <Badge>TBD</Badge>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <ArrowRight className="w-4 h-4 text-blue-500" />
                <span>Mobile App Beta Launch</span>
              </div>
              <Badge variant="secondary">TBD</Badge>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <ArrowRight className="w-4 h-4 text-muted-foreground" />
                <span>V2.0 Public Release</span>
              </div>
              <Badge variant="outline">TBD</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground text-center">
        💡 This roadmap is for internal planning. Update via code as priorities shift.
      </p>
    </div>
  );
};
