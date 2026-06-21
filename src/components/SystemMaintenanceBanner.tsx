import { AlertTriangle } from 'lucide-react';
import { useSystemMaintenance } from '@/hooks/useSystemMaintenance';

const DEFAULT_MESSAGE =
  'Asset Safe is in maintenance mode. Your records remain available, but changes are temporarily paused.';

const SystemMaintenanceBanner = () => {
  const maintenance = useSystemMaintenance();

  if (maintenance.loading || !maintenance.isActive) {
    return null;
  }

  return (
    <div className="sticky top-0 z-[70] border-b border-amber-300 bg-amber-50 px-4 py-3 text-amber-950 shadow-sm">
      <div className="mx-auto flex max-w-7xl items-start gap-3">
        <AlertTriangle className="mt-0.5 h-5 w-5 flex-none" aria-hidden="true" />
        <div className="min-w-0 text-sm leading-5">
          <p className="font-semibold">Maintenance mode active</p>
          <p>{maintenance.message || DEFAULT_MESSAGE}</p>
        </div>
      </div>
    </div>
  );
};

export default SystemMaintenanceBanner;
