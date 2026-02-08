import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Plus, Trash2, User, Building2, Wrench, DollarSign, Calendar, Phone, Mail, MapPin, Globe, Star } from 'lucide-react';

interface Contact {
  id?: string;
  contact_name: string;
  contact_phone: string;
  contact_email: string;
  role: string;
}

interface Project {
  id?: string;
  date_of_work: string;
  work_completed: string;
  project_cost: string;
  notes: string;
  satisfaction_rating: number | null;
}

interface ServiceProvider {
  id?: string;
  company_name: string;
  company_website: string;
  address: string;
  service_type: string;
  notes: string;
  contacts: Contact[];
  projects: Project[];
}

const SERVICE_TYPES = [
  'Electrician',
  'Plumber',
  'HVAC',
  'Painter',
  'Handyman',
  'Roofer',
  'Landscaper',
  'Carpenter',
  'Flooring',
  'Appliance Repair',
  'Pest Control',
  'Cleaning Service',
  'Pool Service',
  'Security System',
  'Other'
];

const ServiceProsSection: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [providers, setProviders] = useState<ServiceProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  const [newProvider, setNewProvider] = useState<ServiceProvider>({
    company_name: '',
    company_website: '',
    address: '',
    service_type: '',
    notes: '',
    contacts: [{ contact_name: '', contact_phone: '', contact_email: '', role: '' }],
    projects: []
  });

  useEffect(() => {
    if (user) {
      fetchProviders();
    }
  }, [user]);

  const fetchProviders = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      const { data: providersData, error: providersError } = await supabase
        .from('service_providers')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (providersError) throw providersError;

      const providersWithDetails = await Promise.all(
        (providersData || []).map(async (provider) => {
          const [contactsRes, projectsRes] = await Promise.all([
            supabase
              .from('service_provider_contacts')
              .select('*')
              .eq('service_provider_id', provider.id),
            supabase
              .from('service_provider_projects')
              .select('*')
              .eq('service_provider_id', provider.id)
              .order('date_of_work', { ascending: false })
          ]);

          return {
            id: provider.id,
            company_name: provider.company_name,
            company_website: provider.company_website || '',
            address: provider.address || '',
            service_type: provider.service_type || '',
            notes: provider.notes || '',
            contacts: (contactsRes.data || []).map(c => ({
              id: c.id,
              contact_name: c.contact_name || '',
              contact_phone: c.contact_phone || '',
              contact_email: c.contact_email || '',
              role: c.role || ''
            })),
            projects: (projectsRes.data || []).map(p => ({
              id: p.id,
              date_of_work: p.date_of_work || '',
              work_completed: p.work_completed || '',
              project_cost: p.project_cost?.toString() || '',
              notes: p.notes || '',
              satisfaction_rating: p.satisfaction_rating
            }))
          };
        })
      );

      setProviders(providersWithDetails);
    } catch (error) {
      console.error('Error fetching providers:', error);
      toast({
        title: "Error",
        description: "Failed to load service providers",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddProvider = async () => {
    if (!user || !newProvider.company_name.trim()) {
      toast({
        title: "Required",
        description: "Please enter a company name",
        variant: "destructive"
      });
      return;
    }

    try {
      setSaving(true);

      const { data: providerData, error: providerError } = await supabase
        .from('service_providers')
        .insert({
          user_id: user.id,
          company_name: newProvider.company_name,
          company_website: newProvider.company_website || null,
          address: newProvider.address || null,
          service_type: newProvider.service_type || null,
          notes: newProvider.notes || null
        })
        .select()
        .single();

      if (providerError) throw providerError;

      const validContacts = newProvider.contacts.filter(c => c.contact_name.trim() || c.contact_phone.trim() || c.contact_email.trim());
      if (validContacts.length > 0) {
        const { error: contactsError } = await supabase
          .from('service_provider_contacts')
          .insert(
            validContacts.map(c => ({
              service_provider_id: providerData.id,
              contact_name: c.contact_name || '',
              contact_phone: c.contact_phone || null,
              contact_email: c.contact_email || null,
              role: c.role || null
            }))
          );
        if (contactsError) throw contactsError;
      }

      const validProjects = newProvider.projects.filter(p => p.work_completed.trim() || p.date_of_work);
      if (validProjects.length > 0) {
        const { error: projectsError } = await supabase
          .from('service_provider_projects')
          .insert(
            validProjects.map(p => ({
              service_provider_id: providerData.id,
              date_of_work: p.date_of_work || null,
              work_completed: p.work_completed || null,
              project_cost: p.project_cost ? parseFloat(p.project_cost) : null,
              notes: p.notes || null,
              satisfaction_rating: p.satisfaction_rating
            }))
          );
        if (projectsError) throw projectsError;
      }

      toast({
        title: "Success",
        description: "Service provider added successfully"
      });

      setNewProvider({
        company_name: '',
        company_website: '',
        address: '',
        service_type: '',
        notes: '',
        contacts: [{ contact_name: '', contact_phone: '', contact_email: '', role: '' }],
        projects: []
      });
      setShowAddForm(false);
      fetchProviders();
    } catch (error) {
      console.error('Error adding provider:', error);
      toast({
        title: "Error",
        description: "Failed to add service provider",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteProvider = async (providerId: string) => {
    if (!confirm('Are you sure you want to delete this service provider?')) return;

    try {
      const { error } = await supabase
        .from('service_providers')
        .delete()
        .eq('id', providerId);

      if (error) throw error;

      toast({
        title: "Deleted",
        description: "Service provider removed"
      });
      fetchProviders();
    } catch (error) {
      console.error('Error deleting provider:', error);
      toast({
        title: "Error",
        description: "Failed to delete provider",
        variant: "destructive"
      });
    }
  };

  const addContact = () => {
    setNewProvider(prev => ({
      ...prev,
      contacts: [...prev.contacts, { contact_name: '', contact_phone: '', contact_email: '', role: '' }]
    }));
  };

  const removeContact = (index: number) => {
    setNewProvider(prev => ({
      ...prev,
      contacts: prev.contacts.filter((_, i) => i !== index)
    }));
  };

  const updateContact = (index: number, field: keyof Contact, value: string) => {
    setNewProvider(prev => ({
      ...prev,
      contacts: prev.contacts.map((c, i) => i === index ? { ...c, [field]: value } : c)
    }));
  };

  const addProject = () => {
    setNewProvider(prev => ({
      ...prev,
      projects: [...prev.projects, { date_of_work: '', work_completed: '', project_cost: '', notes: '', satisfaction_rating: null }]
    }));
  };

  const removeProject = (index: number) => {
    setNewProvider(prev => ({
      ...prev,
      projects: prev.projects.filter((_, i) => i !== index)
    }));
  };

  const updateProject = (index: number, field: keyof Project, value: string | number | null) => {
    setNewProvider(prev => ({
      ...prev,
      projects: prev.projects.map((p, i) => i === index ? { ...p, [field]: value } : p)
    }));
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center text-muted-foreground">Loading service providers...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wrench className="h-5 w-5 text-brand-blue" />
            Service Pros
          </CardTitle>
          <CardDescription>
            Keep track of your trusted service providers, contractors, and their work history
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!showAddForm ? (
            <Button onClick={() => setShowAddForm(true)} className="w-full bg-brand-blue hover:bg-brand-lightBlue">
              <Plus className="h-4 w-4 mr-2" />
              Add Service Provider
            </Button>
          ) : (
            <div className="space-y-6 border rounded-lg p-4 bg-muted/30">
              <h3 className="font-semibold text-lg">New Service Provider</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="company_name">Company Name *</Label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="company_name"
                      value={newProvider.company_name}
                      onChange={(e) => setNewProvider(prev => ({ ...prev, company_name: e.target.value }))}
                      placeholder="ABC Plumbing"
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="service_type">Service Type</Label>
                  <Select
                    value={newProvider.service_type}
                    onValueChange={(value) => setNewProvider(prev => ({ ...prev, service_type: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type..." />
                    </SelectTrigger>
                    <SelectContent>
                      {SERVICE_TYPES.map(type => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company_website">Website</Label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="company_website"
                      value={newProvider.company_website}
                      onChange={(e) => setNewProvider(prev => ({ ...prev, company_website: e.target.value }))}
                      placeholder="https://example.com"
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="address"
                      value={newProvider.address}
                      onChange={(e) => setNewProvider(prev => ({ ...prev, address: e.target.value }))}
                      placeholder="123 Main St, City, State"
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-medium">Contacts</Label>
                  <Button type="button" variant="outline" size="sm" onClick={addContact}>
                    <Plus className="h-3 w-3 mr-1" /> Add Contact
                  </Button>
                </div>
                {newProvider.contacts.map((contact, index) => (
                  <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-3 p-3 border rounded-md bg-background">
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        value={contact.contact_name}
                        onChange={(e) => updateContact(index, 'contact_name', e.target.value)}
                        placeholder="Name"
                        className="pl-10"
                      />
                    </div>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        value={contact.contact_phone}
                        onChange={(e) => updateContact(index, 'contact_phone', e.target.value)}
                        placeholder="Phone"
                        className="pl-10"
                      />
                    </div>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        value={contact.contact_email}
                        onChange={(e) => updateContact(index, 'contact_email', e.target.value)}
                        placeholder="Email"
                        className="pl-10"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Input
                        value={contact.role}
                        onChange={(e) => updateContact(index, 'role', e.target.value)}
                        placeholder="Role (e.g., Owner)"
                        className="flex-1"
                      />
                      {newProvider.contacts.length > 1 && (
                        <Button type="button" variant="ghost" size="icon" onClick={() => removeContact(index)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-medium">Work History</Label>
                  <Button type="button" variant="outline" size="sm" onClick={addProject}>
                    <Plus className="h-3 w-3 mr-1" /> Add Project
                  </Button>
                </div>
                {newProvider.projects.map((project, index) => (
                  <div key={index} className="p-3 border rounded-md bg-background space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div className="relative">
                        <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          type="date"
                          value={project.date_of_work}
                          onChange={(e) => updateProject(index, 'date_of_work', e.target.value)}
                          className="pl-10"
                        />
                      </div>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          type="number"
                          value={project.project_cost}
                          onChange={(e) => updateProject(index, 'project_cost', e.target.value)}
                          placeholder="Cost"
                          className="pl-10"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <Label className="text-sm whitespace-nowrap">Rating:</Label>
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => updateProject(index, 'satisfaction_rating', project.satisfaction_rating === star ? null : star)}
                              className="p-1"
                            >
                              <Star
                                className={`h-5 w-5 ${
                                  project.satisfaction_rating && project.satisfaction_rating >= star
                                    ? 'fill-yellow-400 text-yellow-400'
                                    : 'text-muted-foreground'
                                }`}
                              />
                            </button>
                          ))}
                        </div>
                        <Button type="button" variant="ghost" size="icon" onClick={() => removeProject(index)} className="ml-auto">
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                    <Textarea
                      value={project.work_completed}
                      onChange={(e) => updateProject(index, 'work_completed', e.target.value)}
                      placeholder="Describe the work completed..."
                      rows={2}
                    />
                    <Input
                      value={project.notes}
                      onChange={(e) => updateProject(index, 'notes', e.target.value)}
                      placeholder="Additional notes..."
                    />
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">General Notes</Label>
                <Textarea
                  id="notes"
                  value={newProvider.notes}
                  onChange={(e) => setNewProvider(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Any additional notes about this provider..."
                  rows={2}
                />
              </div>

              <div className="flex gap-3">
                <Button onClick={handleAddProvider} disabled={saving} className="bg-brand-blue hover:bg-brand-blue/90">
                  {saving ? 'Saving...' : 'Save Provider'}
                </Button>
                <Button variant="outline" onClick={() => setShowAddForm(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {providers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Your Service Providers ({providers.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="space-y-2">
              {providers.map((provider) => (
                <AccordionItem key={provider.id} value={provider.id || ''} className="border rounded-lg px-4">
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center gap-3 text-left">
                      <Building2 className="h-5 w-5 text-brand-blue flex-shrink-0" />
                      <div>
                        <div className="font-medium">{provider.company_name}</div>
                        {provider.service_type && (
                          <div className="text-sm text-muted-foreground">{provider.service_type}</div>
                        )}
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pt-4 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                      {provider.company_website && (
                        <div className="flex items-center gap-2">
                          <Globe className="h-4 w-4 text-muted-foreground" />
                          <a href={provider.company_website} target="_blank" rel="noopener noreferrer" className="text-brand-blue hover:underline">
                            {provider.company_website}
                          </a>
                        </div>
                      )}
                      {provider.address && (
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span>{provider.address}</span>
                        </div>
                      )}
                    </div>

                    {provider.contacts.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="font-medium text-sm">Contacts</h4>
                        <div className="grid gap-2">
                          {provider.contacts.map((contact) => (
                            <div key={contact.id} className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm p-2 bg-muted/50 rounded">
                              {contact.contact_name && (
                                <span className="flex items-center gap-1">
                                  <User className="h-3 w-3" /> {contact.contact_name}
                                  {contact.role && <span className="text-muted-foreground">({contact.role})</span>}
                                </span>
                              )}
                              {contact.contact_phone && (
                                <a href={`tel:${contact.contact_phone}`} className="flex items-center gap-1 text-brand-blue">
                                  <Phone className="h-3 w-3" /> {contact.contact_phone}
                                </a>
                              )}
                              {contact.contact_email && (
                                <a href={`mailto:${contact.contact_email}`} className="flex items-center gap-1 text-brand-blue">
                                  <Mail className="h-3 w-3" /> {contact.contact_email}
                                </a>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {provider.projects.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="font-medium text-sm">Work History</h4>
                        <div className="space-y-2">
                          {provider.projects.map((project) => (
                            <div key={project.id} className="p-3 border rounded-md text-sm space-y-1">
                              <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                                {project.date_of_work && (
                                  <span className="flex items-center gap-1">
                                    <Calendar className="h-3 w-3" />
                                    {new Date(project.date_of_work).toLocaleDateString()}
                                  </span>
                                )}
                                {project.project_cost && (
                                  <span className="flex items-center gap-1 font-medium">
                                    <DollarSign className="h-3 w-3" />
                                    {parseFloat(project.project_cost).toLocaleString()}
                                  </span>
                                )}
                                {project.satisfaction_rating && (
                                  <div className="flex items-center gap-0.5">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                      <Star
                                        key={star}
                                        className={`h-3 w-3 ${
                                          project.satisfaction_rating && project.satisfaction_rating >= star
                                            ? 'fill-yellow-400 text-yellow-400'
                                            : 'text-muted-foreground'
                                        }`}
                                      />
                                    ))}
                                  </div>
                                )}
                              </div>
                              {project.work_completed && <p>{project.work_completed}</p>}
                              {project.notes && <p className="text-muted-foreground">{project.notes}</p>}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {provider.notes && (
                      <div className="text-sm">
                        <h4 className="font-medium">Notes</h4>
                        <p className="text-muted-foreground">{provider.notes}</p>
                      </div>
                    )}

                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteProvider(provider.id!)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Provider
                    </Button>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>
      )}

      {providers.length === 0 && !showAddForm && (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            <Wrench className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No service providers added yet.</p>
            <p className="text-sm">Add your trusted contractors, handymen, and service providers to keep track of their work.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ServiceProsSection;
