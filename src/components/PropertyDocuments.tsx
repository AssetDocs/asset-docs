import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Upload, Loader2 } from 'lucide-react';
import { usePropertyFiles } from '@/hooks/usePropertyFiles';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface PropertyDocumentsProps {
  propertyId: string | null;
}

interface LinkedAssetDocument {
  id: string;
  document_name: string | null;
  file_name: string;
  file_url: string | null;
  created_at: string;
  document_type: string | null;
}

const PropertyDocuments: React.FC<PropertyDocumentsProps> = ({ propertyId }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    files: documents,
    isLoading,
  } = usePropertyFiles(propertyId, 'document');
  const [assetDocuments, setAssetDocuments] = useState<LinkedAssetDocument[]>([]);
  const [assetDocumentsLoading, setAssetDocumentsLoading] = useState(false);

  useEffect(() => {
    const fetchAssetDocuments = async () => {
      if (!propertyId || !user) {
        setAssetDocuments([]);
        return;
      }

      setAssetDocumentsLoading(true);
      const { data, error } = await supabase
        .from('user_documents')
        .select('id, document_name, file_name, file_url, created_at, document_type')
        .eq('property_id', propertyId)
        .eq('user_id', user.id)
        .eq('pending_delete', false)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching linked Asset Documentation records:', error);
        setAssetDocuments([]);
      } else {
        setAssetDocuments((data || []) as LinkedAssetDocument[]);
      }

      setAssetDocumentsLoading(false);
    };

    fetchAssetDocuments();
  }, [propertyId, user]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const openAssetDocumentationUpload = () => {
    const query = new URLSearchParams({ type: 'other' });
    if (propertyId) query.set('property_id', propertyId);
    navigate(`/account/documents/upload?${query.toString()}`);
  };

  if (!propertyId) {
    return (
      <div className="mt-6 text-center text-gray-500 p-8 border border-dashed rounded-lg">
        <FileText className="h-12 w-12 mx-auto text-gray-300 mb-2" />
        <p>Select a property to view linked documents</p>
      </div>
    );
  }

  return (
    <div className="mt-6 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
        <div>
          <p className="text-sm font-medium text-gray-700">Linked from Asset Documentation</p>
          <p className="text-xs text-gray-500">
            Property Profiles organize what belongs to this property. Uploads are managed in Asset Documentation.
          </p>
        </div>
        <Button 
          variant="outline" 
          size="sm"
          onClick={openAssetDocumentationUpload}
        >
          <Upload className="h-4 w-4 mr-2" />
          Upload Asset Documentation
        </Button>
      </div>

      {isLoading || assetDocumentsLoading ? (
        <div className="text-center py-8">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
        </div>
      ) : documents.length === 0 && assetDocuments.length === 0 ? (
        <div className="text-center text-gray-500 p-8 border border-dashed rounded-lg">
          <FileText className="h-12 w-12 mx-auto text-gray-300 mb-2" />
          <p className="mb-4">No documents linked to this property yet.</p>
          <Button onClick={openAssetDocumentationUpload}>
            <Upload className="h-4 w-4 mr-2" />
            Add in Asset Documentation
          </Button>
        </div>
      ) : null}

      {assetDocuments.map((document) => (
        <Card key={document.id}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center min-w-0">
                <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center mr-3 shrink-0">
                  <FileText className="h-6 w-6 text-gray-400" />
                </div>
                <div className="min-w-0">
                  <h4 className="font-medium truncate">{document.document_name || document.file_name}</h4>
                  <p className="text-sm text-gray-500">
                    Linked {formatDate(document.created_at)}
                  </p>
                </div>
              </div>
              {document.file_url && (
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => window.open(document.file_url!, '_blank')}
                >
                  View
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
      
      {documents.map((document) => (
        <Card key={document.id}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center mr-3">
                  <FileText className="h-6 w-6 text-gray-400" />
                </div>
                <div>
                  <h4 className="font-medium truncate">{document.file_name}</h4>
                  <p className="text-sm text-gray-500">
                    Uploaded {formatDate(document.created_at)}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => window.open(document.file_url, '_blank')}
                >
                  View
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
