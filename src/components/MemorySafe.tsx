import React, { useState, useEffect } from 'react';
import { Archive, Plus, SortAsc, Calendar, Type, Grid3X3, List, CheckSquare, Square, Trash2, Loader2, Filter } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useNavigate } from 'react-router-dom';
import DocumentFolders from '@/components/DocumentFolders';
import MediaGalleryGrid from '@/components/MediaGalleryGrid';
import CreateFolderModal from '@/components/CreateFolderModal';
import EditFolderModal from '@/components/EditFolderModal';
import DeleteConfirmationDialog from '@/components/DeleteConfirmationDialog';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

type SortOption = 'date-desc' | 'date-asc' | 'name-asc' | 'name-desc';
type ViewMode = 'grid' | 'list';
type MediaFilter = 'all' | 'photos' | 'videos';

interface Folder {
  id: string;
  folder_name: string;
  description: string | null;
  gradient_color: string;
  created_at: string;
}

const MemorySafe: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const [memories, setMemories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>('date-desc');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [selectedMemories, setSelectedMemories] = useState<string[]>([]);
  const [mediaFilter, setMediaFilter] = useState<MediaFilter>('all');

  const [showCreateFolder, setShowCreateFolder] = useState(false);
  const [showEditFolder, setShowEditFolder] = useState(false);
  const [folderToEdit, setFolderToEdit] = useState<Folder | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [memoryToDelete, setMemoryToDelete] = useState<string | null>(null);
  const [bulkDeleteMode, setBulkDeleteMode] = useState(false);
  const [showDeleteFolderDialog, setShowDeleteFolderDialog] = useState(false);
  const [folderToDelete, setFolderToDelete] = useState<string | null>(null);

  useEffect(() => {
    if (user?.id) {
      fetchMemories();
      fetchFolders();
    }
  }, [user]);

  const fetchMemories = async () => {
    if (!user?.id) return;
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('memory_safe_items')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      setMemories(data || []);
    } catch (error) {
      console.error('Error fetching memories:', error);
      toast({ title: 'Error', description: 'Failed to load memories', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchFolders = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('memory_safe_folders')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      setFolders(data || []);
    } catch (error) {
      console.error('Error fetching folders:', error);
    }
  };

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return '0 B';
    const mb = bytes / (1024 * 1024);
    return mb >= 1 ? `${mb.toFixed(1)} MB` : `${(bytes / 1024).toFixed(1)} KB`;
  };

  const transformedMemories = memories.map(mem => ({
    id: mem.id,
    name: mem.title || mem.file_name,
    url: mem.file_url,
    filePath: mem.file_path,
    bucket: 'memory-safe',
    uploadDate: mem.created_at,
    size: formatFileSize(mem.file_size),
    type: mem.file_name?.split('.').pop()?.toUpperCase() || 'FILE',
    folderId: mem.folder_id
  }));

  const IMAGE_EXTS = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg', 'heic'];
  const VIDEO_EXTS = ['mp4', 'mov', 'avi', 'mkv', 'webm', 'wmv'];

  const filteredMemories = transformedMemories.filter(m => {
    const folderMatch = selectedFolder ? m.folderId === selectedFolder : true;
    if (!folderMatch) return false;
    if (mediaFilter === 'all') return true;
    const ext = m.type?.toLowerCase() || '';
    if (mediaFilter === 'photos') return IMAGE_EXTS.includes(ext);
    if (mediaFilter === 'videos') return VIDEO_EXTS.includes(ext);
    return true;
  });

  const sortedMemories = [...filteredMemories].sort((a, b) => {
    switch (sortBy) {
      case 'date-desc': return new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime();
      case 'date-asc': return new Date(a.uploadDate).getTime() - new Date(b.uploadDate).getTime();
      case 'name-asc': return a.name.localeCompare(b.name);
      case 'name-desc': return b.name.localeCompare(a.name);
      default: return 0;
    }
  });

  // Folder CRUD
  const handleCreateFolder = async (name: string, description: string, gradientColor: string) => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('memory_safe_folders')
        .insert({ user_id: user.id, folder_name: name, description: description || null, gradient_color: gradientColor })
        .select().single();
      if (error) throw error;
      setFolders([data, ...folders]);
      setShowCreateFolder(false);
      toast({ title: 'Success', description: 'Folder created successfully' });
    } catch (error) {
      console.error('Error creating folder:', error);
      toast({ title: 'Error', description: 'Failed to create folder', variant: 'destructive' });
    }
  };

  const handleEditFolder = (folder: Folder) => { setFolderToEdit(folder); setShowEditFolder(true); };

  const handleSaveFolder = async (id: string, name: string, description: string, color: string) => {
    try {
      const { error } = await supabase
        .from('memory_safe_folders')
        .update({ folder_name: name, description: description || null, gradient_color: color })
        .eq('id', id);
      if (error) throw error;
      await fetchFolders();
      setShowEditFolder(false);
      setFolderToEdit(null);
      toast({ title: 'Success', description: 'Folder updated successfully' });
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to update folder', variant: 'destructive' });
    }
  };

  const handleDeleteFolder = (folderId: string) => { setFolderToDelete(folderId); setShowDeleteFolderDialog(true); };

  const confirmDeleteFolder = async () => {
    if (!folderToDelete) return;
    try {
      // Unassign items from folder
      await supabase.from('memory_safe_items').update({ folder_id: null }).eq('folder_id', folderToDelete);
      const { error } = await supabase.from('memory_safe_folders').delete().eq('id', folderToDelete);
      if (error) throw error;
      setFolders(folders.filter(f => f.id !== folderToDelete));
      if (selectedFolder === folderToDelete) setSelectedFolder(null);
      setShowDeleteFolderDialog(false);
      setFolderToDelete(null);
      toast({ title: 'Success', description: 'Folder deleted successfully' });
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to delete folder', variant: 'destructive' });
    }
  };

  // Memory CRUD
  const handleDeleteMemory = (id: string) => { setMemoryToDelete(id); setBulkDeleteMode(false); setShowDeleteDialog(true); };

  const handleBulkDelete = () => {
    if (selectedMemories.length > 0) { setBulkDeleteMode(true); setShowDeleteDialog(true); }
  };

  const confirmDelete = async () => {
    try {
      const idsToDelete = bulkDeleteMode ? selectedMemories : memoryToDelete ? [memoryToDelete] : [];
      for (const id of idsToDelete) {
        const mem = memories.find(m => m.id === id);
        if (mem?.file_path) {
          await supabase.storage.from('memory-safe').remove([mem.file_path]);
        }
        await supabase.from('memory_safe_items').delete().eq('id', id);
      }
      toast({ title: 'Success', description: `${idsToDelete.length} memory(ies) deleted successfully` });
      await fetchMemories();
      setSelectedMemories([]);
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to delete', variant: 'destructive' });
    } finally {
      setShowDeleteDialog(false);
      setMemoryToDelete(null);
      setBulkDeleteMode(false);
    }
  };

  const toggleSelection = (id: string) => {
    setSelectedMemories(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Memory Safe</h2>
        <p className="text-muted-foreground text-sm mt-1">
          A protected place for the memories you want to keep — and pass on.
        </p>
      </div>

      <Button
        className="w-full bg-brand-blue hover:bg-brand-blue/90"
        onClick={() => navigate('/account/memory-safe/upload')}
      >
        <Plus className="h-4 w-4 mr-2" />
        Add Memory
      </Button>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="md:col-span-1">
          <DocumentFolders
            folders={folders}
            selectedFolder={selectedFolder}
            onFolderSelect={setSelectedFolder}
            documentCount={memories.length}
            onDeleteFolder={handleDeleteFolder}
            onCreateFolder={() => setShowCreateFolder(true)}
            onEditFolder={handleEditFolder}
            titleOverride="Memory Organization"
            allItemsLabel="All Memories"
            allItemsDescription="View all memories"
          />
        </div>

        {/* Content */}
        <div className="md:col-span-3">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Archive className="h-5 w-5" />
                  {selectedFolder ? folders.find(f => f.id === selectedFolder)?.folder_name || 'Memories' : 'All Memories'}
                  <Badge variant="secondary">{sortedMemories.length}</Badge>
                </CardTitle>
                <div className="flex items-center gap-2 flex-wrap">
                  {/* Media filter */}
                  <Select value={mediaFilter} onValueChange={(v) => setMediaFilter(v as MediaFilter)}>
                    <SelectTrigger className="w-[140px] h-9">
                      <Filter className="h-4 w-4 mr-1" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Files</SelectItem>
                      <SelectItem value="photos">Photos Only</SelectItem>
                      <SelectItem value="videos">Videos Only</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* Sort */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm">
                        <SortAsc className="h-4 w-4 mr-1" />
                        Sort
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => setSortBy('date-desc')}>
                        <Calendar className="h-4 w-4 mr-2" /> Newest First
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setSortBy('date-asc')}>
                        <Calendar className="h-4 w-4 mr-2" /> Oldest First
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setSortBy('name-asc')}>
                        <Type className="h-4 w-4 mr-2" /> Name A-Z
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setSortBy('name-desc')}>
                        <Type className="h-4 w-4 mr-2" /> Name Z-A
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  {/* View toggle */}
                  <Button variant="outline" size="sm" onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}>
                    {viewMode === 'grid' ? <List className="h-4 w-4" /> : <Grid3X3 className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              {/* Bulk actions */}
              {sortedMemories.length > 0 && (
                <div className="flex items-center gap-2 mt-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => selectedMemories.length === sortedMemories.length
                      ? setSelectedMemories([])
                      : setSelectedMemories(sortedMemories.map(m => m.id))
                    }
                  >
                    {selectedMemories.length === sortedMemories.length
                      ? <><CheckSquare className="h-4 w-4 mr-1" /> Deselect All</>
                      : <><Square className="h-4 w-4 mr-1" /> Select All</>
                    }
                  </Button>
                  {selectedMemories.length > 0 && (
                    <Button variant="destructive" size="sm" onClick={handleBulkDelete}>
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete ({selectedMemories.length})
                    </Button>
                  )}
                </div>
              )}
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-brand-blue" />
                </div>
              ) : (
                <MediaGalleryGrid
                  files={sortedMemories}
                  viewMode={viewMode}
                  selectedFiles={selectedMemories}
                  onFileSelect={toggleSelection}
                  onDeleteFile={handleDeleteMemory}
                  onEditFile={(id) => navigate(`/account/memory-safe/${id}/edit`)}
                  mediaType="document"
                  emptyMessage="No memories found"
                />
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Modals */}
      <CreateFolderModal
        isOpen={showCreateFolder}
        onClose={() => setShowCreateFolder(false)}
        onCreateFolder={handleCreateFolder}
        titleOverride="Create Memory Folder"
        descriptionOverride="Create a folder to organize your memories."
        buttonTextOverride="Create Folder"
        placeholderOverride="Enter folder name..."
      />

      <EditFolderModal
        isOpen={showEditFolder}
        onClose={() => { setShowEditFolder(false); setFolderToEdit(null); }}
        onSave={handleSaveFolder}
        folder={folderToEdit}
      />

      <DeleteConfirmationDialog
        isOpen={showDeleteDialog}
        onClose={() => { setShowDeleteDialog(false); setMemoryToDelete(null); setBulkDeleteMode(false); }}
        onConfirm={confirmDelete}
        title={bulkDeleteMode ? `Delete ${selectedMemories.length} memories?` : 'Delete memory?'}
        description="This action cannot be undone. The file will be permanently removed."
      />

      <DeleteConfirmationDialog
        isOpen={showDeleteFolderDialog}
        onClose={() => { setShowDeleteFolderDialog(false); setFolderToDelete(null); }}
        onConfirm={confirmDeleteFolder}
        title="Delete folder?"
        description="The folder will be deleted but memories inside will be kept."
      />
    </div>
  );
};

export default MemorySafe;
