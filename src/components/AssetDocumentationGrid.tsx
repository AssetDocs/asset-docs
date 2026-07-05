// @ts-nocheck
import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardGridCard } from './DashboardGridCard';
import { Camera, Eye, FileText, Pencil, Plus, Search, Star, Trash2, Video, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AssetTypeSelector, { type AssetUploadType } from './AssetTypeSelector';
import ScanToPDF from './ScanToPDF';
import { useAuth } from '@/contexts/AuthContext';
import { useAccount } from '@/contexts/AccountContext';
import { useFileUpload } from '@/hooks/useFileUpload';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const ALL_VALUE = '__all__';

const normalize = (value: unknown) => String(value ?? '').toLowerCase().trim();
const asTags = (value: unknown): string[] => {
  if (Array.isArray(value)) return value.map(String).map(tag => tag.trim()).filter(Boolean);
  if (typeof value === 'string') return value.split(',').map(tag => tag.trim()).filter(Boolean);
  return [];
};

const getItemNames = (itemValues: unknown): string[] => {
  if (!Array.isArray(itemValues)) return [];
  return itemValues
    .map((item: any) => item?.name)
    .filter(Boolean)
    .map(String);
};

const AssetDocumentationGrid: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { accountId, ownerUserId, canEdit, showReadOnlyRestriction } = useAccount();
  const { toast } = useToast();
  const [selectorOpen, setSelectorOpen] = useState(false);
  const [scannerOpen, setScannerOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [propertyFilter, setPropertyFilter] = useState(ALL_VALUE);
  const [roomFilter, setRoomFilter] = useState(ALL_VALUE);
  const [fileTypeFilter, setFileTypeFilter] = useState(ALL_VALUE);
  const [categoryFilter, setCategoryFilter] = useState(ALL_VALUE);
  const [tagFilter, setTagFilter] = useState('');
  const [highValueOnly, setHighValueOnly] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [properties, setProperties] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [isFinding, setIsFinding] = useState(false);

  const { uploadSingleFile } = useFileUpload({
    bucket: 'documents',
    onError: (error) => {
      toast({ title: "Upload failed", description: error.message, variant: "destructive" });
    }
  });

  const targetUserId = ownerUserId || user?.id || null;

  useEffect(() => {
    const loadDocumentation = async () => {
      if (!targetUserId) {
        setResults([]);
        setProperties([]);
        setRooms([]);
        return;
      }

      setIsFinding(true);
      try {
        const [
          propertyRes,
          mediaRes,
          documentRes,
          roomRes,
          docFolderRes,
        ] = await Promise.all([
          supabase
            .from('properties')
            .select('id, name, address')
            .eq('user_id', targetUserId),
          supabase
            .from('property_files')
            .select('id, property_id, file_type, file_name, file_url, file_path, file_size, bucket_name, folder_id, description, tags, item_values, is_high_value, created_at')
            .eq('user_id', targetUserId)
            .eq('pending_delete', false)
            .order('created_at', { ascending: false }),
          supabase
            .from('user_documents')
            .select('id, property_id, document_name, file_name, file_url, file_path, file_size, file_type, document_type, category, folder_id, description, tags, created_at')
            .eq('user_id', targetUserId)
            .eq('pending_delete', false)
            .order('created_at', { ascending: false }),
          accountId
            ? supabase
                .from('photo_folders')
                .select('id, folder_name')
                .eq('account_id', accountId)
            : Promise.resolve({ data: [], error: null }),
          accountId
            ? supabase
                .from('document_folders')
                .select('id, folder_name')
                .eq('account_id', accountId)
            : Promise.resolve({ data: [], error: null }),
        ]);

        if (propertyRes.error) throw propertyRes.error;
        if (mediaRes.error) throw mediaRes.error;
        if (documentRes.error) throw documentRes.error;
        if (roomRes.error) throw roomRes.error;
        if (docFolderRes.error) throw docFolderRes.error;

        const propertyRows = propertyRes.data || [];
        const propertyMap = new Map(propertyRows.map((property: any) => [
          property.id,
          property.name || property.address || 'Unnamed Property',
        ]));
        const roomRows = [
          ...(roomRes.data || []).map((room: any) => ({ id: room.id, name: room.folder_name, type: 'media' })),
          ...(docFolderRes.data || []).map((room: any) => ({ id: room.id, name: room.folder_name, type: 'document' })),
        ];
        const roomMap = new Map(roomRows.map((room: any) => [room.id, room.name]));

        const mediaResults = (mediaRes.data || []).map((file: any) => {
          const tags = asTags(file.tags);
          const itemNames = getItemNames(file.item_values);
          const fileType = file.file_type === 'video' ? 'video' : file.file_type === 'document' ? 'document' : 'photo';
          const propertyName = propertyMap.get(file.property_id) || 'No Property';
          const roomName = roomMap.get(file.folder_id) || '';
          const category = fileType === 'photo' ? 'Photo' : fileType === 'video' ? 'Video' : 'Document';

          return {
            id: file.id,
            source: 'property_file',
            name: file.file_name || 'Untitled file',
            url: file.file_url,
            filePath: file.file_path,
            bucket: file.bucket_name || (fileType === 'video' ? 'videos' : 'photos'),
            fileType,
            propertyId: file.property_id || '',
            propertyName,
            roomId: file.folder_id || '',
            roomName,
            category,
            tags,
            itemNames,
            description: file.description || '',
            isHighValue: !!file.is_high_value,
            createdAt: file.created_at,
          };
        });

        const documentResults = (documentRes.data || []).map((doc: any) => {
          const tags = asTags(doc.tags);
          const docType = doc.document_type || doc.category || 'document';
          const isFloorplan = docType === 'floorplan';
          const propertyName = doc.property_id ? propertyMap.get(doc.property_id) || 'Unknown Property' : 'No Property';
          const roomName = roomMap.get(doc.folder_id) || '';

          return {
            id: doc.id,
            source: 'user_document',
            name: doc.document_name || doc.file_name || 'Untitled document',
            url: doc.file_url,
            filePath: doc.file_path,
            bucket: 'documents',
            fileType: isFloorplan ? 'floorplan' : 'document',
            propertyId: doc.property_id || '',
            propertyName,
            roomId: doc.folder_id || '',
            roomName,
            category: doc.category || docType || 'Document',
            documentType: docType,
            tags,
            itemNames: [],
            description: doc.description || '',
            isHighValue: false,
            createdAt: doc.created_at,
          };
        });

        setProperties(propertyRows);
        setRooms(roomRows);
        setResults([...mediaResults, ...documentResults]);
      } catch (error) {
        console.error('Asset Documentation search load failed:', error);
        toast({
          title: 'Search unavailable',
          description: 'Could not load documentation metadata.',
          variant: 'destructive',
        });
      } finally {
        setIsFinding(false);
      }
    };

    loadDocumentation();
  }, [accountId, targetUserId, toast]);

  const filteredResults = useMemo(() => {
    const query = normalize(searchTerm);
    const tagQuery = normalize(tagFilter);

    return results.filter((result) => {
      const searchText = [
        result.name,
        result.propertyName,
        result.roomName,
        result.category,
        result.documentType,
        result.fileType,
        result.description,
        ...result.tags,
        ...result.itemNames,
      ].map(normalize).join(' ');

      const matchesSearch = !query || searchText.includes(query);
      const matchesProperty = propertyFilter === ALL_VALUE || result.propertyId === propertyFilter;
      const matchesRoom = roomFilter === ALL_VALUE || result.roomId === roomFilter;
      const matchesFileType = fileTypeFilter === ALL_VALUE || result.fileType === fileTypeFilter;
      const matchesCategory = categoryFilter === ALL_VALUE || normalize(result.category) === normalize(categoryFilter) || normalize(result.documentType) === normalize(categoryFilter);
      const matchesTag = !tagQuery || result.tags.some((tag: string) => normalize(tag).includes(tagQuery));
      const matchesHighValue = !highValueOnly || result.isHighValue;

      return matchesSearch && matchesProperty && matchesRoom && matchesFileType && matchesCategory && matchesTag && matchesHighValue;
    });
  }, [categoryFilter, fileTypeFilter, highValueOnly, propertyFilter, results, roomFilter, searchTerm, tagFilter]);

  const categoryOptions = useMemo(() => (
    Array.from(new Set(results.map(result => result.category || result.documentType).filter(Boolean))).sort()
  ), [results]);

  const hasActiveFinder = !!searchTerm || propertyFilter !== ALL_VALUE || roomFilter !== ALL_VALUE || fileTypeFilter !== ALL_VALUE || categoryFilter !== ALL_VALUE || !!tagFilter || highValueOnly;

  const resetFinder = () => {
    setSearchTerm('');
    setPropertyFilter(ALL_VALUE);
    setRoomFilter(ALL_VALUE);
    setFileTypeFilter(ALL_VALUE);
    setCategoryFilter(ALL_VALUE);
    setTagFilter('');
    setHighValueOnly(false);
  };

  const getSignedUrl = async (result: any) => {
    if (!result.filePath || !result.bucket) return result.url;
    const { data, error } = await supabase.storage
      .from(result.bucket)
      .createSignedUrl(result.filePath, 3600);
    if (error) throw error;
    return data?.signedUrl || result.url;
  };

  const handleViewResult = async (result: any) => {
    try {
      const url = await getSignedUrl(result);
      if (url) window.open(url, '_blank');
    } catch (error) {
      console.error('Preview failed:', error);
      toast({ title: 'Preview unavailable', description: 'Could not open this file.', variant: 'destructive' });
    }
  };

  const editRouteFor = (result: any) => {
    if (result.source === 'user_document') return `/account/documents/${result.id}/edit`;
    return `/account/media/${result.id}/edit?type=${result.fileType === 'video' ? 'video' : 'photo'}`;
  };

  const handleToggleHighValue = async (result: any) => {
    if (!canEdit) {
      showReadOnlyRestriction();
      return;
    }
    if (result.source !== 'property_file') return;

    const nextValue = !result.isHighValue;
    const { error } = await supabase
      .from('property_files')
      .update({ is_high_value: nextValue })
      .eq('id', result.id);

    if (error) {
      toast({ title: 'Update failed', description: 'Could not update high-value status.', variant: 'destructive' });
      return;
    }

    setResults(prev => prev.map(item => item.id === result.id && item.source === result.source ? { ...item, isHighValue: nextValue } : item));
  };

  const handleDeleteResult = async (result: any) => {
    if (!canEdit) {
      showReadOnlyRestriction();
      return;
    }
    const resource = result.source === 'user_document' ? 'user_document' : 'property_file';
    const { data, error } = await supabase.functions.invoke('secure-delete-file', {
      body: { resource, id: result.id },
    });

    if (error || !(data as any)?.ok) {
      toast({
        title: 'Delete failed',
        description: 'The file could not be fully deleted. Please try again.',
        variant: 'destructive',
      });
      return;
    }

    setResults(prev => prev.filter(item => !(item.id === result.id && item.source === result.source)));
    toast({ title: 'Deleted', description: 'Documentation file deleted successfully.' });
  };

  const handleTypeSelect = (type: AssetUploadType) => {
    setSelectorOpen(false);
    if (type === 'scan_to_pdf') {
      setScannerOpen(true);
      return;
    }
    switch (type) {
      case 'photo':
        navigate('/account/media/upload?tab=photos');
        break;
      case 'video':
        navigate('/account/media/upload?tab=videos');
        break;
      case 'insurance_policy':
        navigate('/account/insurance/new');
        break;
      default:
        navigate(`/account/documents/upload?type=${type}`);
        break;
    }
  };

  const handlePDFReady = async (pdfFile: File) => {
    if (!user) return;

    try {
      const uploadResult = await uploadSingleFile(pdfFile);
      if (!uploadResult) throw new Error('Upload failed');

      await supabase.from('user_documents').insert({
        user_id: user.id,
        file_name: pdfFile.name,
        file_path: uploadResult.path,
        file_url: uploadResult.url,
        file_size: pdfFile.size,
        file_type: 'application/pdf',
        document_type: 'other',
        category: 'general',
        document_name: pdfFile.name.replace(/\.pdf$/, ''),
      });

      toast({ title: "Scanned PDF saved", description: "Your document has been saved to Documents & Records." });
      navigate('/account/documents');
    } catch (error) {
      console.error('Scan PDF save error:', error);
      toast({ title: "Save failed", description: "Could not save the scanned PDF.", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-2xl sm:text-3xl font-bold">Asset Documentation</CardTitle>
          <p className="text-muted-foreground mt-1">
            Claim-ready proof for your home and belongings.
          </p>
        </CardHeader>
        <CardContent className="pt-0">
          <Button onClick={() => setSelectorOpen(true)} className="w-full bg-brand-blue hover:bg-brand-lightBlue">
            <Plus className="h-4 w-4 mr-2" />
            Upload
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Search className="h-5 w-5 text-brand-blue" />
            Find Documentation
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-3">
            <Input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search tags, rooms, file names, item names, or document types..."
              aria-label="Find Documentation"
            />
            {hasActiveFinder && (
              <Button type="button" variant="outline" onClick={resetFinder}>
                <X className="h-4 w-4 mr-1" />
                Clear
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            <Select value={propertyFilter} onValueChange={setPropertyFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Property" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_VALUE}>All properties</SelectItem>
                {properties.map((property: any) => (
                  <SelectItem key={property.id} value={property.id}>
                    {property.name || property.address || 'Unnamed Property'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={roomFilter} onValueChange={setRoomFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Room / Area" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_VALUE}>All rooms / areas</SelectItem>
                {rooms.map((room: any) => (
                  <SelectItem key={`${room.type}-${room.id}`} value={room.id}>
                    {room.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={fileTypeFilter} onValueChange={setFileTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="File Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_VALUE}>All file types</SelectItem>
                <SelectItem value="photo">Photo</SelectItem>
                <SelectItem value="video">Video</SelectItem>
                <SelectItem value="document">Document</SelectItem>
                <SelectItem value="floorplan">Floorplan</SelectItem>
              </SelectContent>
            </Select>

            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_VALUE}>All categories</SelectItem>
                {categoryOptions.map((category: string) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Input
              value={tagFilter}
              onChange={(event) => setTagFilter(event.target.value)}
              placeholder="Filter tags"
              aria-label="Filter tags"
            />
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              id="asset-doc-high-value"
              checked={highValueOnly}
              onCheckedChange={(checked) => setHighValueOnly(checked === true)}
            />
            <Label htmlFor="asset-doc-high-value" className="text-sm cursor-pointer">
              High Value only
            </Label>
          </div>

          <div className="text-sm text-muted-foreground">
            {isFinding ? (
              'Loading documentation...'
            ) : hasActiveFinder ? (
              <>Showing {filteredResults.length} results{searchTerm ? <> for "{searchTerm}"</> : null}</>
            ) : (
              <>Showing {filteredResults.length} recent documentation file{filteredResults.length === 1 ? '' : 's'}</>
            )}
          </div>

          {!isFinding && filteredResults.length === 0 ? (
            <div className="rounded-lg border border-dashed p-6 text-center">
              <p className="font-medium">No matching documentation found.</p>
              <p className="text-sm text-muted-foreground mt-1">
                Try searching by tag, room, property, or document type.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredResults.slice(0, 12).map((result) => (
                <div key={`${result.source}-${result.id}`} className="rounded-lg border p-3 bg-background">
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        {result.fileType === 'video' ? <Video className="h-4 w-4 text-brand-blue" /> : result.fileType === 'photo' ? <Camera className="h-4 w-4 text-brand-blue" /> : <FileText className="h-4 w-4 text-brand-blue" />}
                        <p className="font-medium truncate">{result.name}</p>
                        <Badge variant="outline">{result.category}</Badge>
                        {result.isHighValue && <Badge variant="secondary">High Value</Badge>}
                      </div>
                      <div className="mt-1 flex flex-wrap gap-2 text-xs text-muted-foreground">
                        <span>{result.propertyName}</span>
                        {result.roomName && <span>Room: {result.roomName}</span>}
                        {result.itemNames.length > 0 && <span>Items: {result.itemNames.join(', ')}</span>}
                      </div>
                      {result.tags.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {result.tags.slice(0, 5).map((tag: string) => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Button size="sm" variant="outline" onClick={() => handleViewResult(result)}>
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      {canEdit && (
                        <>
                          <Button size="sm" variant="outline" onClick={() => navigate(editRouteFor(result))}>
                            <Pencil className="h-4 w-4 mr-1" />
                            Edit Tags
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => navigate(editRouteFor(result))}>
                            Change Details
                          </Button>
                          {result.source === 'property_file' && (
                            <Button size="sm" variant="outline" onClick={() => handleToggleHighValue(result)}>
                              <Star className="h-4 w-4 mr-1" />
                              {result.isHighValue ? 'Unmark' : 'High Value'}
                            </Button>
                          )}
                          <Button size="sm" variant="destructive" onClick={() => handleDeleteResult(result)}>
                            <Trash2 className="h-4 w-4 mr-1" />
                            Delete
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {filteredResults.length > 12 && (
                <p className="text-xs text-muted-foreground text-center pt-1">
                  Showing the first 12 matches. Narrow your search to refine the list.
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <DashboardGridCard
          icon={<Camera className="h-6 w-6" />}
          title="Photos & Videos"
          description="Capture and organize photos and videos of your property and belongings."
          tags={['Photos', 'Videos', 'Rooms']}
          actionLabel="Open Photos & Videos"
          actionIcon={<Camera className="h-4 w-4" />}
          onClick={() => navigate('/account/media')}
          color="red"
        />

        <DashboardGridCard
          icon={<FileText className="h-6 w-6" />}
          title="Documents & Records"
          description="Store policies, receipts, warranties, titles, licenses, and other critical records."
          tags={['Policies', 'Receipts', 'Warranties', 'Records']}
          actionLabel="Open Documents & Records"
          actionIcon={<FileText className="h-4 w-4" />}
          onClick={() => navigate('/account/documents')}
          color="red"
        />
      </div>

      <AssetTypeSelector
        open={selectorOpen}
        onOpenChange={setSelectorOpen}
        onSelect={handleTypeSelect}
      />

      <ScanToPDF
        open={scannerOpen}
        onOpenChange={setScannerOpen}
        onPDFReady={handlePDFReady}
      />
    </div>
  );
};

export default AssetDocumentationGrid;
