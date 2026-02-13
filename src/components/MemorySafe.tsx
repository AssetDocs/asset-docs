import React from 'react';
import { Archive } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const MemorySafe: React.FC = () => {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Memory Safe</h2>
        <p className="text-muted-foreground text-sm mt-1">
          A protected place for the memories you want to keep — and pass on.
        </p>
      </div>

      <Card className="border border-dashed border-muted-foreground/30">
        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center mb-4">
            <Archive className="h-8 w-8 text-rose-600" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">Coming Soon</h3>
          <p className="text-muted-foreground text-sm max-w-md">
            Memory Safe will give you a protected place to store cherished photos, letters, 
            and keepsakes you want to preserve and pass on to loved ones.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default MemorySafe;
