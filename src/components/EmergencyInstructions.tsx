import React, { useState, useEffect, useCallback } from 'react';
import { ChevronDown, Plus, Trash2, Save, AlertTriangle, Users, Loader2 } from 'lucide-react';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface ContactInfo {
  name: string;
  relationship: string;
  phone: string;
  email: string;
  notify_first?: boolean;
}

interface FirstActions {
  first_action: string;
  most_important: string;
  do_not_do: string;
}

interface AccessNotes {
  insurance_location: string;
  documents_location: string;
  password_notes: string;
}

interface PropertyAssets {
  focus_on: string;
  document_before_moving: string;
  do_not_discard: string;
}

interface Professional {
  name: string;
  role: string;
  phone: string;
  email: string;
  notes: string;
}

const DEFAULT_PROFESSIONALS: Professional[] = [
  { name: '', role: 'Insurance Agent', phone: '', email: '', notes: '' },
  { name: '', role: 'Restoration Company', phone: '', email: '', notes: '' },
  { name: '', role: 'Plumber', phone: '', email: '', notes: '' },
  { name: '', role: 'Electrician', phone: '', email: '', notes: '' },
  { name: '', role: 'Attorney', phone: '', email: '', notes: '' },
  { name: '', role: 'Executor / Estate Contact', phone: '', email: '', notes: '' },
  { name: '', role: 'Financial Advisor', phone: '', email: '', notes: '' },
];

const emptyContact: ContactInfo = { name: '', relationship: '', phone: '', email: '' };
const emptyFirstActions: FirstActions = { first_action: '', most_important: '', do_not_do: '' };
const emptyAccessNotes: AccessNotes = { insurance_location: '', documents_location: '', password_notes: '' };
const emptyPropertyAssets: PropertyAssets = { focus_on: '', document_before_moving: '', do_not_discard: '' };

// Extracted outside to prevent re-creation on parent re-renders
const Field = ({ label, helper, children }: { label: string; helper?: string; children: React.ReactNode }) => (
  <div className="space-y-1">
    <Label className="text-xs font-medium text-foreground">{label}</Label>
    {children}
    {helper && <p className="text-[11px] text-muted-foreground">{helper}</p>}
  </div>
);

const SectionCollapsible = ({ number, title, description, children }: { number: number; title: string; description: string; children: React.ReactNode }) => {
  const [open, setOpen] = useState(false);
  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger asChild>
        <button className="w-full flex items-center justify-between gap-3 px-4 py-3 bg-muted/30 hover:bg-muted/50 rounded-lg transition-colors">
          <div className="text-left">
            <h4 className="text-sm font-bold text-foreground">Section {number}: {title}</h4>
            {open && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
          </div>
          <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform flex-shrink-0 ${open ? '' : '-rotate-90'}`} />
        </button>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="pt-4 px-1">
          {children}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};

// Helper to build a summary of saved data
const buildSavedSummary = (
  primaryContact: ContactInfo,
  secondaryContact: ContactInfo,
  firstActions: FirstActions,
  accessNotes: AccessNotes,
  propertyAssets: PropertyAssets,
  professionals: Professional[],
  familyNotes: string,
) => {
  const items: string[] = [];
  if (primaryContact.name) items.push(`Primary Contact: ${primaryContact.name}`);
  if (secondaryContact.name) items.push(`Secondary Contact: ${secondaryContact.name}`);
  if (firstActions.first_action || firstActions.most_important || firstActions.do_not_do) items.push('First Actions documented');
  if (accessNotes.insurance_location || accessNotes.documents_location || accessNotes.password_notes) items.push('Access Notes documented');
  if (propertyAssets.focus_on || propertyAssets.document_before_moving || propertyAssets.do_not_discard) items.push('Property Priorities documented');
  const filledPros = professionals.filter(p => p.name);
  if (filledPros.length > 0) items.push(`${filledPros.length} Professional${filledPros.length > 1 ? 's' : ''} listed`);
  if (familyNotes) items.push('Family Notes added');
  return items;
};

interface EmergencyInstructionsProps {
  onNavigate?: (tab: string) => void;
  standalone?: boolean;
}

const EmergencyInstructions: React.FC<EmergencyInstructionsProps> = ({ onNavigate, standalone = false }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(standalone);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasContributors, setHasContributors] = useState<boolean | null>(null);
  const [hasSavedData, setHasSavedData] = useState(false);

  const [primaryContact, setPrimaryContact] = useState<ContactInfo>({ ...emptyContact, notify_first: true });
  const [secondaryContact, setSecondaryContact] = useState<ContactInfo>({ ...emptyContact });
  const [firstActions, setFirstActions] = useState<FirstActions>({ ...emptyFirstActions });
  const [accessNotes, setAccessNotes] = useState<AccessNotes>({ ...emptyAccessNotes });
  const [propertyAssets, setPropertyAssets] = useState<PropertyAssets>({ ...emptyPropertyAssets });
  const [professionals, setProfessionals] = useState<Professional[]>(DEFAULT_PROFESSIONALS.map(p => ({ ...p })));
  const [familyNotes, setFamilyNotes] = useState('');

  const isFormEmpty = useCallback(() => {
    const contactEmpty = (c: ContactInfo) => !c.name && !c.phone && !c.email;
    const actionsEmpty = !firstActions.first_action && !firstActions.most_important && !firstActions.do_not_do;
    const notesEmpty = !accessNotes.insurance_location && !accessNotes.documents_location && !accessNotes.password_notes;
    const assetsEmpty = !propertyAssets.focus_on && !propertyAssets.document_before_moving && !propertyAssets.do_not_discard;
    const prosEmpty = professionals.every(p => !p.name && !p.phone && !p.email && !p.notes);
    return contactEmpty(primaryContact) && contactEmpty(secondaryContact) && actionsEmpty && notesEmpty && assetsEmpty && prosEmpty && !familyNotes;
  }, [primaryContact, secondaryContact, firstActions, accessNotes, propertyAssets, professionals, familyNotes]);

  const savedSummary = buildSavedSummary(primaryContact, secondaryContact, firstActions, accessNotes, propertyAssets, professionals, familyNotes);

  // Load data
  useEffect(() => {
    if (!user) return;
    const load = async () => {
      setIsLoading(true);
      try {
        const [instrRes, contribRes] = await Promise.all([
          supabase.from('emergency_instructions').select('*').eq('user_id', user.id).maybeSingle(),
          supabase.from('contributors').select('id').eq('account_owner_id', user.id).limit(1),
        ]);
        setHasContributors((contribRes.data?.length ?? 0) > 0);
        if (instrRes.data) {
          const d = instrRes.data;
          setHasSavedData(true);
          if (d.primary_contact && typeof d.primary_contact === 'object') setPrimaryContact(d.primary_contact as any);
          if (d.secondary_contact && typeof d.secondary_contact === 'object') setSecondaryContact(d.secondary_contact as any);
          if (d.first_actions && typeof d.first_actions === 'object') setFirstActions(d.first_actions as any);
          if (d.access_notes && typeof d.access_notes === 'object') setAccessNotes(d.access_notes as any);
          if (d.property_assets && typeof d.property_assets === 'object') setPropertyAssets(d.property_assets as any);
          if (Array.isArray(d.professionals) && d.professionals.length > 0) setProfessionals(d.professionals as any);
          if (d.family_notes) setFamilyNotes(d.family_notes);
        }
      } catch (e) {
        console.error('Error loading emergency instructions:', e);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setIsSaving(true);
    try {
      const payload = {
        user_id: user.id,
        primary_contact: primaryContact as any,
        secondary_contact: secondaryContact as any,
        first_actions: firstActions as any,
        access_notes: accessNotes as any,
        property_assets: propertyAssets as any,
        professionals: professionals as any,
        family_notes: familyNotes,
      };
      const { error } = await supabase.from('emergency_instructions').upsert(payload, { onConflict: 'user_id' });
      if (error) throw error;
      setHasSavedData(true);
      toast({ title: 'Saved', description: 'Emergency Instructions have been saved.' });
    } catch (e: any) {
      console.error('Save error:', e);
      toast({ title: 'Save Failed', description: e.message || 'Could not save.', variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  const addProfessional = () => setProfessionals(prev => [...prev, { name: '', role: '', phone: '', email: '', notes: '' }]);
  const removeProfessional = (i: number) => setProfessionals(prev => prev.filter((_, idx) => idx !== i));
  const updateProfessional = (i: number, field: keyof Professional, value: string) => {
    setProfessionals(prev => prev.map((p, idx) => idx === i ? { ...p, [field]: value } : p));
  };

  const formContent = (
    <div className="space-y-6">
      <p className="text-xs text-muted-foreground">Clear guidance that brings clarity during unexpected situations.</p>

      {hasContributors === false && (
        <div className="sticky top-0 z-10 bg-amber-50 border border-amber-200 rounded-lg p-4 flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-bold text-amber-900">🔔 Authorized User Required</h4>
            <p className="text-xs text-amber-700 mt-0.5">
              Emergency Instructions are designed to help trusted people act on your behalf.
              To be effective, at least one Authorized User must be added to your account.
              They do not need access to your private records.
            </p>
          </div>
          <Button
            size="sm"
            variant="outline"
            className="border-amber-300 text-amber-800 hover:bg-amber-100 text-xs flex-shrink-0"
            onClick={() => onNavigate?.('access-activity')}
          >
            <Users className="h-3.5 w-3.5 mr-1" />
            Add Authorized User
          </Button>
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <>
          {/* SECTION 1 */}
          <SectionCollapsible number={1} title="Immediate Contacts" description="Who should be contacted first in an emergency.">
            <div className="space-y-4">
              <p className="text-xs font-semibold text-foreground">Primary Emergency Contact</p>
              <p className="text-[11px] text-muted-foreground -mt-3">The person who should be contacted first in an urgent or unexpected situation.</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field label="Name">
                  <Input className="h-8 text-xs" value={primaryContact.name} onChange={e => setPrimaryContact(p => ({ ...p, name: e.target.value }))} placeholder="Full name" />
                </Field>
                <Field label="Relationship" helper="Example: Spouse, sibling, close friend">
                  <Input className="h-8 text-xs" value={primaryContact.relationship} onChange={e => setPrimaryContact(p => ({ ...p, relationship: e.target.value }))} placeholder="Relationship" />
                </Field>
                <Field label="Phone Number" helper="A number that can be reached quickly.">
                  <Input className="h-8 text-xs" value={primaryContact.phone} onChange={e => setPrimaryContact(p => ({ ...p, phone: e.target.value }))} placeholder="Phone" />
                </Field>
                <Field label="Email Address" helper="Optional, but helpful if phone contact isn't possible.">
                  <Input className="h-8 text-xs" value={primaryContact.email} onChange={e => setPrimaryContact(p => ({ ...p, email: e.target.value }))} placeholder="Email" />
                </Field>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={primaryContact.notify_first ?? false} onCheckedChange={v => setPrimaryContact(p => ({ ...p, notify_first: v }))} />
                <div>
                  <Label className="text-xs font-medium">Notify First</Label>
                  <p className="text-[11px] text-muted-foreground">Mark this person as the first point of contact.</p>
                </div>
              </div>

              <div className="border-t border-border pt-4 mt-4">
                <p className="text-xs font-semibold text-foreground">Secondary Emergency Contact</p>
                <p className="text-[11px] text-muted-foreground mb-3">Backup contact if the primary person cannot be reached.</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Field label="Name">
                    <Input className="h-8 text-xs" value={secondaryContact.name} onChange={e => setSecondaryContact(p => ({ ...p, name: e.target.value }))} placeholder="Full name" />
                  </Field>
                  <Field label="Relationship">
                    <Input className="h-8 text-xs" value={secondaryContact.relationship} onChange={e => setSecondaryContact(p => ({ ...p, relationship: e.target.value }))} placeholder="Relationship" />
                  </Field>
                  <Field label="Phone Number">
                    <Input className="h-8 text-xs" value={secondaryContact.phone} onChange={e => setSecondaryContact(p => ({ ...p, phone: e.target.value }))} placeholder="Phone" />
                  </Field>
                  <Field label="Email Address">
                    <Input className="h-8 text-xs" value={secondaryContact.email} onChange={e => setSecondaryContact(p => ({ ...p, email: e.target.value }))} placeholder="Email" />
                  </Field>
                </div>
              </div>
            </div>
          </SectionCollapsible>

          {/* SECTION 2 */}
          <SectionCollapsible number={2} title="What To Do First" description="Simple instructions that help reduce confusion and stress.">
            <div className="space-y-3">
              <Field label="The first action to take in a time-sensitive situation is…" helper="Example: Contact our insurance agent and document any visible damage.">
                <Textarea className="text-xs min-h-[60px]" value={firstActions.first_action} onChange={e => setFirstActions(p => ({ ...p, first_action: e.target.value }))} />
              </Field>
              <Field label="The most important thing to protect right now is…" helper="Example: Prevent water damage from spreading or secure the property.">
                <Textarea className="text-xs min-h-[60px]" value={firstActions.most_important} onChange={e => setFirstActions(p => ({ ...p, most_important: e.target.value }))} />
              </Field>
              <Field label="Do NOT do the following…" helper="Example: Do not approve repairs before insurance documentation is complete.">
                <Textarea className="text-xs min-h-[60px]" value={firstActions.do_not_do} onChange={e => setFirstActions(p => ({ ...p, do_not_do: e.target.value }))} />
              </Field>
            </div>
          </SectionCollapsible>

          {/* SECTION 3 */}
          <SectionCollapsible number={3} title="Access & Information Notes" description="Where trusted people can find critical information without sharing access.">
            <div className="space-y-3">
              <Field label="Insurance Information Location" helper="Example: Insurance policies are saved in the Insurance Documents section.">
                <Input className="h-8 text-xs" value={accessNotes.insurance_location} onChange={e => setAccessNotes(p => ({ ...p, insurance_location: e.target.value }))} />
              </Field>
              <Field label="Important Documents Location" helper="Example: Legal and financial documents are stored in the Secure Vault.">
                <Input className="h-8 text-xs" value={accessNotes.documents_location} onChange={e => setAccessNotes(p => ({ ...p, documents_location: e.target.value }))} />
              </Field>
              <Field label="Password Access Notes" helper="Example: Login credentials are stored in the Password Catalog.">
                <Input className="h-8 text-xs" value={accessNotes.password_notes} onChange={e => setAccessNotes(p => ({ ...p, password_notes: e.target.value }))} />
              </Field>
            </div>
          </SectionCollapsible>

          {/* SECTION 4 */}
          <SectionCollapsible number={4} title="Property & Asset Priorities" description="Guidance for protecting property and documenting assets.">
            <div className="space-y-3">
              <Field label="If there is property damage, focus on…" helper="Example: Photograph each room before moving or cleaning anything.">
                <Textarea className="text-xs min-h-[60px]" value={propertyAssets.focus_on} onChange={e => setPropertyAssets(p => ({ ...p, focus_on: e.target.value }))} />
              </Field>
              <Field label="Items that should be documented before moving or discarding" helper="Example: Furniture, electronics, appliances, or high-value items.">
                <Textarea className="text-xs min-h-[60px]" value={propertyAssets.document_before_moving} onChange={e => setPropertyAssets(p => ({ ...p, document_before_moving: e.target.value }))} />
              </Field>
              <Field label="Items that should not be discarded" helper="Example: Damaged materials until insurance documentation is complete.">
                <Textarea className="text-xs min-h-[60px]" value={propertyAssets.do_not_discard} onChange={e => setPropertyAssets(p => ({ ...p, do_not_discard: e.target.value }))} />
              </Field>
            </div>
          </SectionCollapsible>

          {/* SECTION 5 */}
          <SectionCollapsible number={5} title="Trusted Professionals" description="Professionals who may need to be contacted during an emergency.">
            <div className="space-y-4">
              {professionals.map((pro, i) => (
                <div key={i} className="border border-border rounded-lg p-3 space-y-3 bg-muted/20">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-foreground">{pro.role || `Professional ${i + 1}`}</span>
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive" onClick={() => removeProfessional(i)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Field label="Name" helper="The professional or company name.">
                      <Input className="h-8 text-xs" value={pro.name} onChange={e => updateProfessional(i, 'name', e.target.value)} placeholder="Name" />
                    </Field>
                    <Field label="Role" helper="Example: Insurance Agent, Restoration Contractor">
                      <Input className="h-8 text-xs" value={pro.role} onChange={e => updateProfessional(i, 'role', e.target.value)} placeholder="Role" />
                    </Field>
                    <Field label="Phone Number" helper="Best number to reach them quickly.">
                      <Input className="h-8 text-xs" value={pro.phone} onChange={e => updateProfessional(i, 'phone', e.target.value)} placeholder="Phone" />
                    </Field>
                    <Field label="Email Address" helper="Optional, but useful for documentation and follow-up.">
                      <Input className="h-8 text-xs" value={pro.email} onChange={e => updateProfessional(i, 'email', e.target.value)} placeholder="Email" />
                    </Field>
                  </div>
                  <Field label="Notes" helper="Example: Call before approving any work.">
                    <Input className="h-8 text-xs" value={pro.notes} onChange={e => updateProfessional(i, 'notes', e.target.value)} placeholder="Notes" />
                  </Field>
                </div>
              ))}
              <Button variant="outline" size="sm" className="text-xs" onClick={addProfessional}>
                <Plus className="h-3.5 w-3.5 mr-1" />
                Add Another Professional
              </Button>
            </div>
          </SectionCollapsible>

          {/* SECTION 6 */}
          <SectionCollapsible number={6} title="Notes for Family" description="Optional notes meant to provide clarity or reassurance.">
            <Field label="Additional Notes" helper="Anything you want your family or trusted people to know in this situation.">
              <Textarea className="text-xs min-h-[80px]" value={familyNotes} onChange={e => setFamilyNotes(e.target.value)} />
            </Field>
          </SectionCollapsible>

          {/* Footer */}
          <div className="border-t border-border pt-4 space-y-3">
            <p className="text-xs text-muted-foreground text-center">
              {isFormEmpty()
                ? "Emergency Instructions help trusted people act quickly and correctly. You don't need to cover everything — a few notes can make a big difference."
                : 'Emergency Instructions are in place. Trusted people will know what to do.'}
            </p>
            <Button className="w-full" onClick={handleSave} disabled={isSaving}>
              {isSaving ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Saving...</>
              ) : (
                <><Save className="h-4 w-4 mr-2" />Save Instructions</>
              )}
            </Button>
          </div>
        </>
      )}
    </div>
  );

  if (standalone) {
    return (
      <div className="space-y-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">🛟 Emergency Instructions</h2>
          <p className="text-muted-foreground text-sm mt-1">Clear guidance that brings clarity during unexpected situations.</p>
        </div>
        {formContent}
      </div>
    );
  }

  return (
    <div className="w-full bg-card border border-border rounded-lg overflow-hidden">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <button className="w-full px-6 py-4 flex items-center justify-between gap-3 hover:bg-muted/30 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <span className="text-base">🛟</span>
              </div>
              <div className="text-left">
                <span className="text-sm font-semibold text-foreground">Emergency Instructions</span>
                {!isOpen && hasSavedData && savedSummary.length > 0 && (
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    {savedSummary.join(' · ')}
                  </p>
                )}
              </div>
            </div>
            <ChevronDown className={`h-5 w-5 text-muted-foreground transition-transform ${isOpen ? '' : '-rotate-90'}`} />
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="px-4 pb-4 pt-2 border-t border-border">
            {formContent}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};

export default EmergencyInstructions;
