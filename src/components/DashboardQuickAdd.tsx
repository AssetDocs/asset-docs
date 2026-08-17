import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import AssetTypeSelector, { type AssetUploadType } from '@/components/AssetTypeSelector';
import { resolveAssetUploadDestination } from '@/lib/assetUploadRouting';
import { useAccount } from '@/contexts/AccountContext';
import { track } from '@/lib/track';
import {
  Plus,
  ChevronLeft,
  ChevronRight,
  FolderOpen,
  Heart,
  Wrench,
  Contact,
  Briefcase,
  BookOpen,
  Mic,
  ChefHat,
  Pill,
  MapPin,
  Archive,
  Hammer,
  Palette,
  CalendarDays,
  Package,
  Sparkles,
} from 'lucide-react';

type Step = 'root' | 'knowledge-hub';

interface AddOption {
  label: string;
  description: string;
  icon: React.ElementType;
  /** Destination inside an existing workflow. `add=1` only asks that UI to open. */
  to: string;
}

const knowledgeHubOptions: AddOption[] = [
  { label: 'VIP Contact', description: 'Add an important contact', icon: Contact, to: '/account/contacts?add=1' },
  { label: 'Trusted Professional', description: 'Add a service provider or contractor', icon: Briefcase, to: '/account?tab=service-pros&add=1' },
  { label: 'Medication', description: 'Add to the family medication list', icon: Pill, to: '/account?tab=medication-list&add=1' },
  { label: 'Note', description: 'Capture an important note', icon: BookOpen, to: '/account?tab=notes&add=1' },
  { label: 'Voice Note', description: 'Record a voice memo', icon: Mic, to: '/account?tab=voice-notes' },
  { label: 'Family Tradition', description: 'Preserve a family tradition or story', icon: Sparkles, to: '/account?tab=family-traditions&add=1' },
  { label: 'Family Recipe', description: 'Preserve a family recipe', icon: ChefHat, to: '/account?tab=family-recipes&add=1' },
  { label: 'Memory', description: 'Add a memory to Memory Safe', icon: Archive, to: '/account/memory-safe/upload' },
  { label: 'Important Location', description: 'Record where something is stored', icon: MapPin, to: '/account?tab=important-locations&add=1' },
  { label: 'Paint Code', description: 'Save a paint color, brand, and finish', icon: Palette, to: '/account?tab=paint-codes' },
  { label: 'Upgrade / Repair', description: 'Document an improvement or repair', icon: Hammer, to: '/account?tab=upgrades-repairs&add=1' },
  { label: 'Calendar Entry', description: 'Create a reminder or event', icon: CalendarDays, to: '/account?tab=smart-calendar&add=1' },
];

const DashboardQuickAdd: React.FC = () => {
  const navigate = useNavigate();
  const { canEdit } = useAccount();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>('root');
  const [assetSelectorOpen, setAssetSelectorOpen] = useState(false);

  if (!canEdit) return null;

  const openChooser = () => {
    setStep('root');
    setOpen(true);
    track('dashboard_add_opened');
  };

  const closeChooser = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (!nextOpen) setStep('root');
  };

  const selectCategory = (category: 'asset_documentation' | 'knowledge_hub') => {
    track('dashboard_add_category_selected', { category });
    if (category === 'asset_documentation') {
      track('dashboard_add_asset_documentation');
      setOpen(false);
      setStep('root');
      setAssetSelectorOpen(true);
      return;
    }
    track('dashboard_add_knowledge_hub');
    setStep('knowledge-hub');
  };

  const goTo = (to: string) => {
    setOpen(false);
    setStep('root');
    navigate(to);
  };

  const handleAssetTypeSelect = (type: AssetUploadType) => {
    setAssetSelectorOpen(false);
    const destination = resolveAssetUploadDestination(type);
    if (destination.kind === 'scan') {
      // Reuse the scanner (and its save logic) that already lives in Asset Documentation.
      navigate('/account?tab=asset-documentation&add=scan');
      return;
    }
    navigate(destination.to);
  };

  const optionList = step === 'family-archive' ? familyArchiveOptions : insightsToolsOptions;

  return (
    <>
      <div className="md:col-span-2 py-1">
        <div className="border-t border-border mb-4" />
        <Button
          type="button"
          onClick={openChooser}
          aria-label="Add documentation, family information, or property details"
          className="w-full rounded-xl bg-background border-2 border-brand-blue hover:bg-brand-blue/5 text-brand-blue py-2.5 px-4 flex flex-col items-center gap-0.5"
        >
          <span className="flex items-center gap-1.5 text-base font-bold">
            <Plus className="h-4 w-4" />
            Add
          </span>
        </Button>
        <p className="text-center text-xs text-muted-foreground mt-1.5">
          Quickly add documentation and details
        </p>
        <div className="border-t border-border mt-4" />
      </div>

      <Dialog open={open} onOpenChange={closeChooser}>
        <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {step === 'root'
                ? 'What would you like to add?'
                : step === 'family-archive'
                  ? 'Add to Family Archive'
                  : 'Add with Insights & Tools'}
            </DialogTitle>
            <DialogDescription>
              {step === 'root'
                ? 'Choose where your new information belongs.'
                : 'Choose what you would like to create.'}
            </DialogDescription>
          </DialogHeader>

          {step === 'root' ? (
            <div className="grid grid-cols-1 gap-3 py-2">
              {[
                {
                  key: 'asset_documentation' as const,
                  label: 'Asset Documentation',
                  description: 'Photos, videos, policies, receipts, and records.',
                  icon: FolderOpen,
                },
                {
                  key: 'family_archive' as const,
                  label: 'Family Archive',
                  description: 'Contacts, notes, recipes, locations, and memories.',
                  icon: Heart,
                },
                {
                  key: 'insights_tools' as const,
                  label: 'Insights & Tools',
                  description: 'Repairs, paint codes, calendar entries, and item values.',
                  icon: Wrench,
                },
              ].map(option => (
                <Button
                  key={option.key}
                  variant="outline"
                  className="h-auto w-full justify-start gap-3 py-4 px-4 text-left hover:border-brand-blue hover:bg-brand-blue/5"
                  onClick={() => selectCategory(option.key)}
                >
                  <span className="w-10 h-10 rounded-full bg-yellow text-yellow-foreground flex items-center justify-center flex-shrink-0">
                    <option.icon className="h-5 w-5" />
                  </span>
                  <span className="flex-1 min-w-0">
                    <span className="block font-medium text-sm">{option.label}</span>
                    <span className="block text-xs text-muted-foreground whitespace-normal">
                      {option.description}
                    </span>
                  </span>
                  <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                </Button>
              ))}
            </div>
          ) : (
            <div className="space-y-3 py-2">
              <Button
                variant="ghost"
                size="sm"
                className="px-2 text-muted-foreground"
                onClick={() => setStep('root')}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Back
              </Button>

              <div className="grid grid-cols-1 gap-2">
                {optionList.map(option => (
                  <Button
                    key={option.label}
                    variant="outline"
                    className="h-auto w-full justify-start gap-3 py-3 px-4 text-left hover:border-brand-blue hover:bg-brand-blue/5"
                    onClick={() => goTo(option.to)}
                  >
                    <span className="w-9 h-9 rounded-full bg-yellow text-yellow-foreground flex items-center justify-center flex-shrink-0">
                      <option.icon className="h-4 w-4" />
                    </span>
                    <span className="flex-1 min-w-0">
                      <span className="block font-medium text-sm">{option.label}</span>
                      <span className="block text-xs text-muted-foreground whitespace-normal">
                        {option.description}
                      </span>
                    </span>
                    <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  </Button>
                ))}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AssetTypeSelector
        open={assetSelectorOpen}
        onOpenChange={setAssetSelectorOpen}
        onSelect={handleAssetTypeSelect}
      />
    </>
  );
};

export default DashboardQuickAdd;
