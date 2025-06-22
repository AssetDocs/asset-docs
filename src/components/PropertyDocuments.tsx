
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Eye, Download } from 'lucide-react';

interface Document {
  id: number;
  name: string;
  type: string;
  uploadDate: string;
}

interface PropertyDocumentsProps {
  documents: Document[];
}

const PropertyDocuments: React.FC<PropertyDocumentsProps> = ({ documents }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="mt-6 space-y-4">
      {documents.map((document) => (
        <Card key={document.id}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center mr-3">
                  <FileText className="h-6 w-6 text-gray-400" />
                </div>
                <div>
                  <h4 className="font-medium">{document.name}</h4>
                  <p className="text-sm text-gray-500">
                    {document.type} • Uploaded {formatDate(document.uploadDate)}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline">
                  <Eye className="h-4 w-4 mr-1" />
                  View
                </Button>
                <Button size="sm" variant="outline">
                  <Download className="h-4 w-4 mr-1" />
                  Download
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default PropertyDocuments;
