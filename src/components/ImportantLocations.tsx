// @ts-nocheck
import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
  Archive,
  Edit,
  FileText,
  Info,
  KeyRound,
  LockKeyhole,
  MapPin,
  Plus,
  Search,
  Trash2,
} from 'lucide-react';
import { useAccount } from '@/contexts/AccountContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

type ImportantLocation = {
  id: string;
  user_id: string;
  item_name: string;
  category: string | null;
  property_id: string | null;
  room_area: string | null;
  location_description: string | null;
  related_contact_name: string | null;
  notes: string | null;
  attachment_file_name: string | null;
  created_at: string;
  updated_at: string;
};

type PropertyOption = {
  id: string;
  name: string | null;
  address: string | null;
};

type LocationSort = 'updated-desc' | 'created-desc' | 'name-asc' | 'category' | 'property';

interface ImportantLocationsProps {
  onNavigate?: (tab: string) => void;
}

const ALL_VALUE = 'all';
const NONE_VALUE = '__none__';

const LOCATION_CATEGORIES = [
  'Documents',
  'Keys',
  'Safes / Lockboxes',
  'Storage',
  'Keepsakes',
  'Vehicles',
  'Property',
  'Medical',
  'Insurance',
  'Other',
];

const EMPTY_FORM = {
  item_name: '',
  category: '',
  property_id: NONE_VALUE,
  room_area: '',
  location_description: '',
  related_contact_name: '',
  notes: '',
  attachment_file_name: '',
};

const SENSITIVE_HINT_PATTERN = /\b(password|passcode|safe combination|combination|alarm code|security code|pin|bank login|routing number|account password|recovery phrase|seed phrase)\b/i;

const clean = (value: string) => value.trim() || null;

const ImportantLocations: React.FC<ImportantLocationsProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const { ownerUserId, canEdit, showReadOnlyRestriction } = useAccount();
  const { toast } = useToast();
  const [locations, setLocations] = useState<ImportantLocation[]>([]);
  const [properties, setProperties] = useState<PropertyOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState<ImportantLocation | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [isSaving, setIsSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState(ALL_VALUE);
  const [propertyFilter, setPropertyFilter] = useState(ALL_VALUE);
  const [roomFilter, setRoomFilter] = useState(ALL_VALUE);
  const [sortBy, setSortBy] = useState<LocationSort>('updated-desc');

  const targetUserId = ownerUserId || user?.id || null;

  useEffect(() => {
    fetchLocations();
    fetchProperties();
  }, [targetUserId]);

  const fetchLocations = async () => {
    if (!targetUserId) return;
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('family_important_locations' as any)
        .select('*')
        .eq('user_id', targetUserId)
        .order('updated_at', { ascending: false });
      if (error) throw error;
      setLocations((data || []) as ImportantLocation[]);
    } catch (error) {
      console.error('Error fetching important locations:', error);
      toast({
        title: 'Could not load important locations',
        description: 'Please refresh and try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchProperties = async () => {
    if (!targetUserId) return;
    try {
      const { data, error } = await supabase
        .from('properties' as any)
        .select('id, name, address')
        .eq('user_id', targetUserId)
        .order('name', { ascending: true });
      if (error) throw error;
      setProperties((data || []) as PropertyOption[]);
    } catch (error) {
      console.error('Error fetching properties for important locations:', error);
    }
  };

  const propertyName = (propertyId?: string | null) => {
    if (!propertyId) return '';
    const property = properties.find((item) => item.id === propertyId);
    return property?.name || property?.address || 'Linked property';
  };

  const roomOptions = useMemo(() => {
    return Array.from(new Set(locations.map((entry) => entry.room_area).filter(Boolean)))
      .sort((a, b) => String(a).localeCompare(String(b)));
  }, [locations]);

  const filteredLocations = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    const searchableText = (entry: ImportantLocation) => [
      entry.item_name,
      entry.category,
      propertyName(entry.property_id),
      entry.room_area,
      entry.location_description,
      entry.related_contact_name,
      entry.notes,
      entry.attachment_file_name,
    ].filter(Boolean).join(' ').toLowerCase();

    return locations
      .filter((entry) => !query || searchableText(entry).includes(query))
      .filter((entry) => categoryFilter === ALL_VALUE || entry.category === categoryFilter)
      .filter((entry) => propertyFilter === ALL_VALUE || (propertyFilter === NONE_VALUE ? !entry.property_id : entry.property_id === propertyFilter))
      .filter((entry) => roomFilter === ALL_VALUE || entry.room_area === roomFilter)
      .sort((a, b) => {
        switch (sortBy) {
          case 'created-desc':
            return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
              || a.item_name.localeCompare(b.item_name);
          case 'name-asc':
            return a.item_name.localeCompare(b.item_name);
          case 'category':
            return (a.category || 'zz').localeCompare(b.category || 'zz')
              || a.item_name.localeCompare(b.item_name);
          case 'property':
            return (propertyName(a.property_id) || 'zz').localeCompare(propertyName(b.property_id) || 'zz')
              || a.item_name.localeCompare(b.item_name);
          case 'updated-desc':
          default:
            return new Date(b.updated_at || b.created_at || 0).getTime()
              - new Date(a.updated_at || a.created_at || 0).getTime()
              || a.item_name.localeCompare(b.item_name);
        }
      });
  }, [locations, searchTerm, categoryFilter, propertyFilter, roomFilter, sortBy, properties]);

  const hasActiveFilters = searchTerm.trim() !== ''
    || categoryFilter !== ALL_VALUE
    || propertyFilter !== ALL_VALUE
    || roomFilter !== ALL_VALUE;

  const showsSensitiveHint = SENSITIVE_HINT_PATTERN.test([
    form.item_name,
    form.category,
    form.location_description,
    form.notes,
  ].join(' '));

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setEditingLocation(null);
  };

  const updateForm = (field: keyof typeof EMPTY_FORM, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const openEdit = (entry: ImportantLocation) => {
    setEditingLocation(entry);
    setForm({
      item_name: entry.item_name || '',
      category: entry.category || '',
      property_id: entry.property_id || NONE_VALUE,
      room_area: entry.room_area || '',
      location_description: entry.location_description || '',
      related_contact_name: entry.related_contact_name || '',
      notes: entry.notes || '',
      attachment_file_name: entry.attachment_file_name || '',
    });
    setIsOpen(true);
  };

  const handleSave = async () => {
    if (!canEdit) {
      showReadOnlyRestriction();
      return;
    }
    if (!targetUserId || !form.item_name.trim()) {
      toast({ title: 'Item or location name is required.', variant: 'destructive' });
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        user_id: targetUserId,
        item_name: form.item_name.trim(),
        category: clean(form.category),
        property_id: form.property_id === NONE_VALUE ? null : form.property_id || null,
        room_area: clean(form.room_area),
        location_description: clean(form.location_description),
        related_contact_name: clean(form.related_contact_name),
        notes: clean(form.notes),
        attachment_file_name: clean(form.attachment_file_name),
      };

      const query = editingLocation
        ? supabase.from('family_important_locations' as any).update(payload).eq('id', editingLocation.id)
        : supabase.from('family_important_locations' as any).insert(payload);

      const { error } = await query;
      if (error) throw error;

      toast({
        title: editingLocation ? 'Location updated' : 'Location saved',
        description: 'Your important location reference has been saved.',
      });
      setIsOpen(false);
      resetForm();
      fetchLocations();
    } catch (error) {
      console.error('Error saving important location:', error);
      toast({
        title: 'Save failed',
        description: error?.message || 'Could not save this important location.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (entry: ImportantLocation) => {
    if (!canEdit) {
      showReadOnlyRestriction();
      return;
    }

    try {
      const { error } = await supabase
        .from('family_important_locations' as any)
        .delete()
        .eq('id', entry.id);
      if (error) throw error;

      toast({ title: 'Location deleted', description: 'The reference was removed.' });
      setLocations((current) => current.filter((item) => item.id !== entry.id));
    } catch (error) {
      console.error('Error deleting important location:', error);
      toast({
        title: 'Delete failed',
        description: error?.message || 'Could not delete this location.',
        variant: 'destructive',
      });
    }
  };

  const handleAddClick = (event?: React.MouseEvent) => {
    if (!canEdit) {
      event?.preventDefault();
      showReadOnlyRestriction();
      return;
    }
    resetForm();
  };

  const openLegacyLocker = () => {
    onNavigate?.('legacy-locker');
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-brand-blue" />
            Important Locations
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Record where important documents, keys, keepsakes, and physical items are stored.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900 flex gap-2">
            <Info className="h-4 w-4 mt-0.5 shrink-0" />
            <div className="space-y-2">
              <p>
                Use this space to record where important physical items and documents are kept. For sensitive access details like passwords, safe combinations, security codes, or final instructions, use Legacy Locker or Secure Vault.
              </p>
              {onNavigate && (
                <Button type="button" variant="outline" size="sm" onClick={openLegacyLocker}>
                  Open Legacy Locker
                </Button>
              )}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="text-sm text-muted-foreground">
              Add a clear location reference without storing access codes or confidential instructions.
            </div>
            <Dialog open={isOpen} onOpenChange={(open) => { setIsOpen(open); if (!open) resetForm(); }}>
              <DialogTrigger asChild>
                <Button
                  className="bg-brand-blue hover:bg-brand-blue/90 sm:ml-auto"
                  onClick={handleAddClick}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Location
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{editingLocation ? 'Edit Important Location' : 'Add Important Location'}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  {showsSensitiveHint && (
                    <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900 flex gap-2">
                      <LockKeyhole className="h-4 w-4 mt-0.5 shrink-0" />
                      <p>
                        Sensitive access details are better stored in Legacy Locker or Secure Vault.
                      </p>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="item-name">Item / Location Name *</Label>
                      <Input
                        id="item-name"
                        value={form.item_name}
                        onChange={(event) => updateForm('item_name', event.target.value)}
                        placeholder="Birth certificates, spare keys, wedding album..."
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Category</Label>
                      <Select value={form.category || NONE_VALUE} onValueChange={(value) => updateForm('category', value === NONE_VALUE ? '' : value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={NONE_VALUE}>No category</SelectItem>
                          {LOCATION_CATEGORIES.map((category) => (
                            <SelectItem key={category} value={category}>{category}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Property</Label>
                      <Select value={form.property_id || NONE_VALUE} onValueChange={(value) => updateForm('property_id', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select property" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={NONE_VALUE}>No property</SelectItem>
                          {properties.map((property) => (
                            <SelectItem key={property.id} value={property.id}>
                              {property.name || property.address || 'Unnamed property'}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="room-area">Room / Area</Label>
                      <Input
                        id="room-area"
                        value={form.room_area}
                        onChange={(event) => updateForm('room_area', event.target.value)}
                        placeholder="Office, garage, closet, storage unit..."
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location-description">Where Located</Label>
                    <Textarea
                      id="location-description"
                      value={form.location_description}
                      onChange={(event) => updateForm('location_description', event.target.value)}
                      placeholder="Example: filing cabinet, second drawer, blue folder."
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="related-contact">Related Contact</Label>
                      <Input
                        id="related-contact"
                        value={form.related_contact_name}
                        onChange={(event) => updateForm('related_contact_name', event.target.value)}
                        placeholder="Attorney, family member, insurance agent..."
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="attachment-name">Related File / Attachment Name</Label>
                      <Input
                        id="attachment-name"
                        value={form.attachment_file_name}
                        onChange={(event) => updateForm('attachment_file_name', event.target.value)}
                        placeholder="Policy PDF, deed scan, photo label..."
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea
                      id="notes"
                      value={form.notes}
                      onChange={(event) => updateForm('notes', event.target.value)}
                      placeholder="Optional context that helps identify the item or location."
                      rows={3}
                    />
                  </div>

                  <Button onClick={handleSave} disabled={isSaving} className="w-full">
                    {isSaving ? 'Saving...' : editingLocation ? 'Update Location' : 'Save Location'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Search className="h-4 w-4" />
            Find Important Locations
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Input
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search names, categories, properties, rooms, locations, contacts, or file names..."
          />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_VALUE}>All categories</SelectItem>
                {LOCATION_CATEGORIES.map((category) => (
                  <SelectItem key={category} value={category}>{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={propertyFilter} onValueChange={setPropertyFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Property" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_VALUE}>All properties</SelectItem>
                <SelectItem value={NONE_VALUE}>No property</SelectItem>
                {properties.map((property) => (
                  <SelectItem key={property.id} value={property.id}>
                    {property.name || property.address || 'Unnamed property'}
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
                {roomOptions.map((room) => (
                  <SelectItem key={room} value={room}>{room}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={(value) => setSortBy(value as LocationSort)}>
              <SelectTrigger>
                <SelectValue placeholder="Sort" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="updated-desc">Recently Updated</SelectItem>
                <SelectItem value="created-desc">Recently Added</SelectItem>
                <SelectItem value="name-asc">Name A-Z</SelectItem>
                <SelectItem value="category">Category</SelectItem>
                <SelectItem value="property">Property</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <p className="text-sm text-muted-foreground">
            Showing {filteredLocations.length} important location{filteredLocations.length === 1 ? '' : 's'}
            {searchTerm ? ` for "${searchTerm}"` : ''}.
          </p>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="text-center py-8 text-muted-foreground">Loading important locations...</div>
      ) : filteredLocations.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <MapPin className="h-12 w-12 text-muted-foreground/40 mx-auto mb-3" />
            <p className="font-medium">
              {hasActiveFilters ? 'No matching locations found.' : 'No important locations added yet.'}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {hasActiveFilters
                ? 'Try searching by category, property, room, contact, or file name.'
                : 'Add a physical location reference for key documents, keepsakes, or stored items.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredLocations.map((entry) => (
            <Card key={entry.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <CardTitle className="text-base flex items-center gap-2">
                      {entry.category === 'Keys' ? (
                        <KeyRound className="h-4 w-4 text-brand-blue" />
                      ) : entry.category === 'Documents' ? (
                        <FileText className="h-4 w-4 text-brand-blue" />
                      ) : (
                        <Archive className="h-4 w-4 text-brand-blue" />
                      )}
                      {entry.item_name}
                    </CardTitle>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {entry.category && <Badge variant="secondary">{entry.category}</Badge>}
                      {entry.property_id && <Badge variant="outline">{propertyName(entry.property_id)}</Badge>}
                      {entry.room_area && <Badge variant="outline">{entry.room_area}</Badge>}
                    </div>
                  </div>
                  {canEdit && (
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => openEdit(entry)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-destructive hover:text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Important Location</AlertDialogTitle>
                            <AlertDialogDescription>
                              Delete "{entry.item_name}" from Important Locations? This cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(entry)}>Delete</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                {entry.location_description && (
                  <p><span className="font-medium">Where located:</span> {entry.location_description}</p>
                )}
                {entry.related_contact_name && (
                  <p><span className="font-medium">Related contact:</span> {entry.related_contact_name}</p>
                )}
                {entry.attachment_file_name && (
                  <p><span className="font-medium">Related file:</span> {entry.attachment_file_name}</p>
                )}
                {entry.notes && (
                  <p><span className="font-medium">Notes:</span> {entry.notes}</p>
                )}
                <p className="text-xs text-muted-foreground pt-2">
                  Last updated {entry.updated_at ? new Date(entry.updated_at).toLocaleDateString() : 'recently'}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ImportantLocations;
