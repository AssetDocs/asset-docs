
import React from 'react';
import { Button } from '@/components/ui/button';
import ShareButton from '@/components/ShareButton';
import QRCodeGenerator from '@/components/QRCodeGenerator';
import { QrCode, Video } from 'lucide-react';
import { Link } from 'react-router-dom';

interface AccountHeaderProps {
  showQRCode: boolean;
  onGenerateQR: () => void;
}

const AccountHeader: React.FC<AccountHeaderProps> = ({ showQRCode, onGenerateQR }) => {
  return (
    <>
      <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-brand-blue mb-2">Account Dashboard</h1>
          <p className="text-gray-600">Manage your properties and asset documentation</p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline" className="border-green-500 text-green-500">
            <Link to="/video-help">
              <Video className="h-4 w-4 mr-2" />
              Video Help
            </Link>
          </Button>
          <Button 
            onClick={onGenerateQR}
            variant="outline"
            className="border-brand-blue text-brand-blue"
          >
            <QrCode className="h-4 w-4 mr-2" />
            Generate QR Code
          </Button>
          <ShareButton className="bg-brand-blue hover:bg-brand-lightBlue" />
        </div>
      </div>

      {showQRCode && (
        <div className="mb-6">
          <QRCodeGenerator 
            url={`${window.location.origin}/account/properties/shared`}
            title="My Property Portfolio"
            description="Quick access to all property documentation and asset information"
          />
        </div>
      )}
    </>
  );
};

export default AccountHeader;
