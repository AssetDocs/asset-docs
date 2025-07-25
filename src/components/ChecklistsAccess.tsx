import React from 'react';
import { FeatureGuard } from '@/components/FeatureGuard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { CheckSquare } from 'lucide-react';

const ChecklistsAccess: React.FC = () => {
  return (
    <FeatureGuard featureKey="documentation_checklists">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CheckSquare className="h-5 w-5 text-primary" />
            <CardTitle>Asset Documentation Checklists</CardTitle>
          </div>
          <CardDescription>
            Comprehensive guides for documenting your valuable assets
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Access detailed checklists for documenting your home and business assets, 
            organized by category with photography tips and documentation best practices.
          </p>
          <Link to="/checklists">
            <Button className="w-full">
              <CheckSquare className="h-4 w-4 mr-2" />
              Access Checklists
            </Button>
          </Link>
        </CardContent>
      </Card>
    </FeatureGuard>
  );
};

export default ChecklistsAccess;