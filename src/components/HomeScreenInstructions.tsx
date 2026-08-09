import React, { useEffect, useMemo, useState } from 'react';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DESKTOP_OPTION_GROUP,
  HOME_SCREEN_CONFIRMATION,
  HomeScreenBrowser,
  HomeScreenDevice,
  MOBILE_OPTION_GROUPS,
  decodeSelection,
  detectEnvironment,
  encodeSelection,
  getBrowserLabel,
  getEnvironmentLabel,
  getHomeScreenInstructions,
} from '@/lib/homeScreenInstructions';

interface HomeScreenInstructionsProps {
  /** 'banner' renders on the orange dashboard strip, 'page' on a normal surface. */
  variant?: 'banner' | 'page';
  includeDesktop?: boolean;
  onSelectionChange?: (device: HomeScreenDevice, browser: HomeScreenBrowser) => void;
}

const HomeScreenInstructions: React.FC<HomeScreenInstructionsProps> = ({
  variant = 'page',
  includeDesktop = false,
  onSelectionChange,
}) => {
  const [selection, setSelection] = useState<string>('');
  const [detectedLabel, setDetectedLabel] = useState<string>('');

  const groups = useMemo(
    () => (includeDesktop ? [...MOBILE_OPTION_GROUPS, DESKTOP_OPTION_GROUP] : MOBILE_OPTION_GROUPS),
    [includeDesktop],
  );

  useEffect(() => {
    const env = detectEnvironment();
    if (env.confident) {
      setSelection(encodeSelection(env.device, env.browser));
      setDetectedLabel(getEnvironmentLabel(env.device, env.browser));
    }
  }, []);

  const { device, browser } = selection
    ? decodeSelection(selection)
    : { device: 'unknown' as HomeScreenDevice, browser: 'unknown' as HomeScreenBrowser };

  const instructions = getHomeScreenInstructions(device, browser);

  const isBanner = variant === 'banner';
  const labelClass = isBanner ? 'text-white/85' : 'text-muted-foreground';
  const strongClass = isBanner ? 'text-white font-semibold' : 'text-foreground font-semibold';
  const bodyClass = isBanner ? 'text-white/95' : 'text-muted-foreground';
  const triggerClass = isBanner
    ? 'h-8 text-xs bg-white/15 border-white/30 text-white'
    : 'h-9 text-sm';

  const handleChange = (value: string) => {
    setSelection(value);
    const next = decodeSelection(value);
    onSelectionChange?.(next.device, next.browser);
  };

  return (
    <div className={isBanner ? 'space-y-2' : 'space-y-4'}>
      {detectedLabel ? (
        <p className={`text-xs ${labelClass}`}>
          We think you&apos;re using <span className={strongClass}>{detectedLabel}</span>. Using a
          different browser?
        </p>
      ) : (
        <p className={`text-xs ${labelClass}`}>Choose your device and browser below.</p>
      )}

      <div className="flex items-center gap-2">
        <span className={`text-xs whitespace-nowrap ${labelClass}`}>Instructions for:</span>
        <Select value={selection} onValueChange={handleChange}>
          <SelectTrigger className={`${triggerClass} max-w-[240px]`} aria-label="Device and browser">
            <SelectValue placeholder="Select device and browser">
              {selection ? getEnvironmentLabel(device, browser) : undefined}
            </SelectValue>

          </SelectTrigger>
          <SelectContent>
            {groups.map((group) => (
              <SelectGroup key={group.device}>
                <SelectLabel>{group.label}</SelectLabel>
                {group.browsers.map((b) => (
                  <SelectItem key={`${group.device}:${b}`} value={encodeSelection(group.device, b)}>
                    {getBrowserLabel(b)}
                  </SelectItem>
                ))}
              </SelectGroup>
            ))}
          </SelectContent>
        </Select>
      </div>

      {instructions ? (
        <div
          className={
            isBanner
              ? 'text-xs bg-white/10 rounded-md p-3 space-y-1'
              : 'text-sm bg-muted/50 rounded-md p-4 space-y-2'
          }
        >
          <p className={strongClass}>{instructions.title}</p>
          <ol className={`list-decimal list-inside space-y-1 ${bodyClass}`}>
            {instructions.steps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
          {instructions.note && (
            <p className={isBanner ? 'text-white/80' : 'text-muted-foreground'}>
              {instructions.note}
            </p>
          )}
          <p className={isBanner ? 'text-white/80' : 'text-muted-foreground'}>
            {HOME_SCREEN_CONFIRMATION}
          </p>
        </div>
      ) : (
        <p className={`text-xs ${labelClass}`}>
          Select your device and browser to see the steps.
        </p>
      )}
    </div>
  );
};

export default HomeScreenInstructions;
