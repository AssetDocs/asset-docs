
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Eye, Download, Trash2 } from 'lucide-react';
import DeleteConfirmationDialog from './DeleteConfirmationDialog';

interface Document {
  id: number;
  name: string;
  type: string;
  uploadDate: string;
}

interface PropertyDocumentsProps {
  documents: Document[];
  onDeleteDocument?: (documentId: number) => void;
}

const PropertyDocuments: React.FC<PropertyDocumentsProps> = ({ documents, onDeleteDocument }) => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState<number | null>(null);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleDeleteClick = (documentId: number) => {
    setDocumentToDelete(documentId);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (documentToDelete && onDeleteDocument) {
      onDeleteDocument(documentToDelete);
    }
    setDeleteDialogOpen(false);
    setDocumentToDelete(null);
  };

  const handleCancelDelete = () => {
    setDeleteDialogOpen(false);
    setDocumentToDelete(null);
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
                {onDeleteDocument && (
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => handleDeleteClick(document.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
      
      <DeleteConfirmationDialog
        isOpen={deleteDialogOpen}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title="Delete Document"
        description="Are you sure you want to delete this document? This action cannot be undone."
      />
    </div>
  );
};

export default PropertyDocuments;
