import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ContactAttachments from '@/components/ContactAttachments';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useContributor } from '@/contexts/ContributorContext';
import { supabase } from '@/integrations/supabase/client';
import { Plus, Edit, Trash2, Star, Phone, Mail, MapPin, User, ChevronLeft, ChevronDown, ChevronUp, Paperclip } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

interface VIPContact {
  id: string;
  name: string;
  relationship: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zip_code: string | null;
  notes: string | null;
  priority: number;
  created_at: string;
  updated_at: string;
}

const RELATIONSHIP_OPTIONS = [
  'Spouse/Partner',
  'Parent',
  'Child',
  'Sibling',
  'Extended Family',
  'Doctor',
  'Lawyer/Attorney',
  'Financial Advisor',
  'Accountant/CPA',
  'Insurance Agent',
  'Real Estate Agent',
  'Executor',
  'Trustee',
  'Power of Attorney',
  'Emergency Contact',
  'Neighbor',
  'Friend',
  'Caregiver',
  'Other'
];

const VIPContacts: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const { isViewer, accountOwnerId } = useContributor();
  
  const [contacts, setContacts] = useState<VIPContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<VIPContact | null>(null);
  const [saving, setSaving] = useState(false);
  const [expandedContacts, setExpandedContacts] = useState<Set<string>>(new Set());

  const toggleExpanded = (contactId: string) => {
    setExpandedContacts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(contactId)) {
        newSet.delete(contactId);
      } else {
        newSet.add(contactId);
      }
      return newSet;
    });
  };
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    relationship: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zip_code: '',
    notes: '',
    priority: 3
  });

  const effectiveUserId = accountOwnerId || user?.id;

  useEffect(() => {
    if (effectiveUserId) {
      fetchContacts();
    }
  }, [effectiveUserId]);

  const fetchContacts = async () => {
    if (!effectiveUserId) return;
    
    try {
      const { data, error } = await supabase
        .from('vip_contacts')
        .select('*')
        .eq('user_id', effectiveUserId)
        .order('priority', { ascending: false })
        .order('name', { ascending: true });

      if (error) throw error;
      setContacts(data || []);
    } catch (error) {
      console.error('Error fetching contacts:', error);
      toast({
        title: "Error",
        description: "Failed to load contacts.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      relationship: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      state: '',
      zip_code: '',
      notes: '',
      priority: 3
    });
    setEditingContact(null);
  };

  const openEditDialog = (contact: VIPContact) => {
    setEditingContact(contact);
    setFormData({
      name: contact.name,
      relationship: contact.relationship || '',
      email: contact.email || '',
      phone: contact.phone || '',
      address: contact.address || '',
      city: contact.city || '',
      state: contact.state || '',
      zip_code: contact.zip_code || '',
      notes: contact.notes || '',
      priority: contact.priority
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast({
        title: "Error",
        description: "Name is required.",
        variant: "destructive"
      });
      return;
    }

    if (!effectiveUserId) {
      toast({
        title: "Error",
        description: "User not authenticated.",
        variant: "destructive"
      });
      return;
    }

    setSaving(true);

    try {
      const contactData = {
        name: formData.name.trim(),
        relationship: formData.relationship || null,
        email: formData.email.trim() || null,
        phone: formData.phone.trim() || null,
        address: formData.address.trim() || null,
        city: formData.city.trim() || null,
        state: formData.state.trim() || null,
        zip_code: formData.zip_code.trim() || null,
        notes: formData.notes.trim() || null,
        priority: formData.priority,
        user_id: effectiveUserId
      };

      if (editingContact) {
        const { error } = await supabase
          .from('vip_contacts')
          .update(contactData)
          .eq('id', editingContact.id);

        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Contact updated successfully."
        });
      } else {
        const { error } = await supabase
          .from('vip_contacts')
          .insert(contactData);

        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Contact added successfully."
        });
      }

      setIsDialogOpen(false);
      resetForm();
      fetchContacts();
    } catch (error) {
      console.error('Error saving contact:', error);
      toast({
        title: "Error",
        description: "Failed to save contact.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (contactId: string) => {
    try {
      const { error } = await supabase
        .from('vip_contacts')
        .delete()
        .eq('id', contactId);

      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Contact deleted successfully."
      });
      fetchContacts();
    } catch (error) {
      console.error('Error deleting contact:', error);
      toast({
        title: "Error",
        description: "Failed to delete contact.",
        variant: "destructive"
      });
    }
  };

  const renderPriorityStars = (priority: number) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= priority
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  const PrioritySelector = ({ value, onChange }: { value: number; onChange: (v: number) => void }) => (
    <div className="space-y-2">
      <Label>Priority Level</Label>
      <div className="flex items-center gap-4">
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => onChange(star)}
              className="p-1 hover:scale-110 transition-transform"
            >
              <Star
                className={`h-6 w-6 ${
                  star <= value
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'text-gray-300 hover:text-yellow-200'
                }`}
              />
            </button>
          ))}
        </div>
        <span className="text-sm text-muted-foreground">
          {value === 5 ? 'Critical' : value === 4 ? 'High' : value === 3 ? 'Medium' : value === 2 ? 'Low' : 'Minimal'}
        </span>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <div className="flex-grow py-8 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-wrap gap-2 mb-6">
            <Button
              onClick={() => navigate('/account')}
              variant="outline"
              size="sm"
              className="bg-white text-brand-orange border-brand-orange hover:bg-brand-orange/10"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back to Dashboard
            </Button>
            <Button
              onClick={() => navigate('/account', { state: { tab: 'life-hub' } })}
              variant="outline"
              size="sm"
              className="bg-white text-brand-orange border-brand-orange hover:bg-brand-orange/10"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back to Family Archive
            </Button>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">VIP Contacts</h1>
              <p className="text-gray-600 text-sm">Important people to contact in case of emergency or death</p>
            </div>
            
            {!isViewer && (
              <Dialog open={isDialogOpen} onOpenChange={(open) => {
                setIsDialogOpen(open);
                if (!open) resetForm();
              }}>
                <DialogTrigger asChild>
                  <Button className="bg-primary hover:bg-primary/90">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Contact
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>{editingContact ? 'Edit Contact' : 'Add New Contact'}</DialogTitle>
                    <DialogDescription>
                      Add important contact information for someone who may need to be reached.
                    </DialogDescription>
                  </DialogHeader>
                  
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name *</Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          placeholder="John Doe"
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="relationship">Relationship</Label>
                        <Select
                          value={formData.relationship}
                          onValueChange={(value) => setFormData({ ...formData, relationship: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select relationship" />
                          </SelectTrigger>
                          <SelectContent>
                            {RELATIONSHIP_OPTIONS.map((option) => (
                              <SelectItem key={option} value={option}>
                                {option}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          placeholder="john@example.com"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input
                          id="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          placeholder="(555) 123-4567"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="address">Street Address</Label>
                      <Input
                        id="address"
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        placeholder="123 Main St"
                      />
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="space-y-2 col-span-2">
                        <Label htmlFor="city">City</Label>
                        <Input
                          id="city"
                          value={formData.city}
                          onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                          placeholder="New York"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="state">State</Label>
                        <Input
                          id="state"
                          value={formData.state}
                          onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                          placeholder="NY"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="zip_code">ZIP Code</Label>
                        <Input
                          id="zip_code"
                          value={formData.zip_code}
                          onChange={(e) => setFormData({ ...formData, zip_code: e.target.value })}
                          placeholder="10001"
                        />
                      </div>
                    </div>

                    <PrioritySelector 
                      value={formData.priority} 
                      onChange={(v) => setFormData({ ...formData, priority: v })} 
                    />

                    <div className="space-y-2">
                      <Label htmlFor="notes">Notes</Label>
                      <Textarea
                        id="notes"
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        placeholder="Any additional information about this contact..."
                        rows={3}
                      />
                    </div>

                    <DialogFooter>
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => {
                          setIsDialogOpen(false);
                          resetForm();
                        }}
                      >
                        Cancel
                      </Button>
                      <Button type="submit" disabled={saving} className="bg-primary hover:bg-primary/90">
                        {saving ? 'Saving...' : editingContact ? 'Update Contact' : 'Add Contact'}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            )}
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : contacts.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <User className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Contacts Yet</h3>
                <p className="text-gray-600 mb-4">
                  Add important contacts like doctors, lawyers, family members, and other VIPs who may need to be contacted.
                </p>
                {!isViewer && (
                  <Button 
                    onClick={() => setIsDialogOpen(true)}
                    className="bg-primary hover:bg-primary/90"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Your First Contact
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {contacts.map((contact) => (
                <Card key={contact.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <User className="h-5 w-5 text-brand-blue" />
                          {contact.name}
                        </CardTitle>
                        {contact.relationship && (
                          <CardDescription className="mt-1">
                            {contact.relationship}
                          </CardDescription>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        {renderPriorityStars(contact.priority)}
                        {!isViewer && (
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openEditDialog(contact)}
                              className="h-8 w-8 p-0"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Contact</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete {contact.name}? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDelete(contact.id)}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    {contact.phone && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <Phone className="h-4 w-4" />
                        <a href={`tel:${contact.phone}`} className="hover:text-brand-blue">
                          {contact.phone}
                        </a>
                      </div>
                    )}
                    {contact.email && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <Mail className="h-4 w-4" />
                        <a href={`mailto:${contact.email}`} className="hover:text-brand-blue truncate">
                          {contact.email}
                        </a>
                      </div>
                    )}
                    {(contact.address || contact.city || contact.state) && (
                      <div className="flex items-start gap-2 text-gray-600">
                        <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                        <span>
                          {[contact.address, contact.city, contact.state, contact.zip_code]
                            .filter(Boolean)
                            .join(', ')}
                        </span>
                      </div>
                    )}
                    {contact.notes && (
                      <p className="text-gray-500 text-xs mt-2 pt-2 border-t line-clamp-2">
                        {contact.notes}
                      </p>
                    )}

                    {/* Attachments Collapsible Section */}
                    <Collapsible 
                      open={expandedContacts.has(contact.id)}
                      onOpenChange={() => toggleExpanded(contact.id)}
                      className="mt-4 pt-4 border-t"
                    >
                      <CollapsibleTrigger asChild>
                        <Button 
                          variant="ghost" 
                          className="w-full flex items-center justify-between p-2 h-auto hover:bg-gray-50"
                        >
                          <span className="flex items-center gap-2 text-sm font-medium text-brand-blue">
                            <Paperclip className="h-4 w-4" />
                            Attachments (Documents, Images, Voice Notes)
                          </span>
                          {expandedContacts.has(contact.id) ? (
                            <ChevronUp className="h-4 w-4 text-gray-500" />
                          ) : (
                            <ChevronDown className="h-4 w-4 text-gray-500" />
                          )}
                        </Button>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        {effectiveUserId && (
                          <ContactAttachments
                            contactId={contact.id}
                            userId={effectiveUserId}
                            isViewer={isViewer}
                            contactName={contact.name}
                          />
                        )}
                      </CollapsibleContent>
                    </Collapsible>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default VIPContacts;
