
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { QrCode } from 'lucide-react';

const QRCodeSection: React.FC = () => {
  return (
    <Card className="bg-gradient-to-r from-blue-50 to-orange-50 border-brand-blue">
      <CardHeader>
        <CardTitle className="flex items-center">
          <QrCode className="h-6 w-6 mr-2 text-brand-blue" />
          Quick Access & Sharing
        </CardTitle>
        <CardDescription>
          Generate QR codes for instant access to your property documentation
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-white rounded-lg border">
            <h4 className="font-semibold text-brand-blue mb-2">Property Portfolio</h4>
            <p className="text-sm text-gray-600 mb-3">
              Share all properties with insurance agents or family
            </p>
            <Button size="sm" className="bg-brand-blue hover:bg-brand-lightBlue">
              Generate QR
            </Button>
          </div>
          <div className="text-center p-4 bg-white rounded-lg border">
            <h4 className="font-semibold text-brand-blue mb-2">Emergency Access</h4>
            <p className="text-sm text-gray-600 mb-3">
              Quick access during emergencies or claims
            </p>
            <Button size="sm" className="bg-brand-orange hover:bg-brand-orange/90">
              Create Emergency QR
            </Button>
          </div>
          <div className="text-center p-4 bg-white rounded-lg border">
            <h4 className="font-semibold text-brand-blue mb-2">Professional Services</h4>
            <p className="text-sm text-gray-600 mb-3">
              For appraisers, contractors, and inspectors
            </p>
            <Button size="sm" variant="outline">
              Professional QR
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default QRCodeSection;
