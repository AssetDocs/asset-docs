import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { FileText, Download, Eye, X } from 'lucide-react';

interface AdminDoc {
  name: string;
  file: string;
}

const DOCUMENTS: AdminDoc[] = [
  { name: 'Formation Document – Ellidair LLC', file: '/admin-docs/formation-document-ellidair-llc.pdf' },
  { name: 'Assumed Name Acknowledgment', file: '/admin-docs/assumed-name-acknowledgment.pdf' },
  { name: 'Assumed Name Certificate', file: '/admin-docs/assumed-name-certificate.pdf' },
  { name: 'Assumed Name Filing', file: '/admin-docs/assumed-name.pdf' },
  { name: 'EIN Confirmation', file: '/admin-docs/ein.pdf' },
  { name: 'Operating Agreement – Ellidair LLC', file: '/admin-docs/operating-agreement-ellidair-llc.pdf' },
  { name: 'Initial Resolutions – Ellidair LLC', file: '/admin-docs/initial-resolutions-ellidair-llc.pdf' },
  { name: 'SOS Transactions (1)', file: '/admin-docs/sos-transactions-1.pdf' },
  { name: 'SOS Transactions (2)', file: '/admin-docs/sos-transactions-2.pdf' },
  { name: 'SOS Transactions (3)', file: '/admin-docs/sos-transactions-3.pdf' },
];

const AdminDocuments: React.FC = () => {
  const [viewDoc, setViewDoc] = useState<AdminDoc | null>(null);

  const handleDownload = (doc: AdminDoc) => {
    const a = document.createElement('a');
    a.href = doc.file;
    a.download = doc.file.split('/').pop() || 'document.pdf';
    a.click();
  };

  return (
    <>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold">Company Documents</h2>
          <p className="text-muted-foreground">Formation, compliance, and legal filings</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {DOCUMENTS.map((doc) => (
            <Card key={doc.file} className="group hover:shadow-lg transition-shadow">
              <CardContent className="p-4 flex flex-col items-center text-center gap-3">
                {/* Thumbnail */}
                <div className="w-full aspect-[3/4] bg-muted rounded-md flex items-center justify-center overflow-hidden">
                  <iframe
                    src={`${doc.file}#toolbar=0&navpanes=0&scrollbar=0`}
                    className="w-full h-full pointer-events-none"
                    title={doc.name}
                  />
                </div>

                <p className="text-sm font-medium line-clamp-2 leading-tight">{doc.name}</p>

                <div className="flex gap-2 w-full">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1"
                    onClick={() => setViewDoc(doc)}
                  >
                    <Eye className="h-3.5 w-3.5 mr-1" />
                    View
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1"
                    onClick={() => handleDownload(doc)}
                  >
                    <Download className="h-3.5 w-3.5 mr-1" />
                    Download
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Full-size viewer dialog */}
      <Dialog open={!!viewDoc} onOpenChange={() => setViewDoc(null)}>
        <DialogContent className="max-w-4xl w-[95vw] h-[90vh] flex flex-col p-0">
          <DialogHeader className="p-4 pb-2 flex flex-row items-center justify-between">
            <DialogTitle className="text-lg">{viewDoc?.name}</DialogTitle>
            <Button size="sm" variant="ghost" onClick={() => viewDoc && handleDownload(viewDoc)}>
              <Download className="h-4 w-4 mr-1" />
              Download
            </Button>
          </DialogHeader>
          <div className="flex-1 min-h-0 px-4 pb-4">
            {viewDoc && (
              <iframe
                src={viewDoc.file}
                className="w-full h-full rounded-md border"
                title={viewDoc.name}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AdminDocuments;
