/**
 * Shared "Add to Home Screen" helpers.
 *
 * Deliberately split into three concerns so each can be maintained on its own:
 *  - detectEnvironment()          -> best-guess device + browser from the user agent
 *  - getEnvironmentLabel()        -> human-readable label for a combination
 *  - getHomeScreenInstructions()  -> the step content for a combination
 *
 * Wording is intentionally generic enough to survive minor browser menu-label
 * changes ("or the equivalent shortcut option shown by ...").
 */

export type HomeScreenDevice = 'android' | 'ios' | 'desktop' | 'unknown';

export type HomeScreenBrowser =
  | 'chrome'
  | 'edge'
  | 'firefox'
  | 'samsung'
  | 'safari'
  | 'other'
  | 'unknown';

export interface HomeScreenEnvironment {
  device: HomeScreenDevice;
  browser: HomeScreenBrowser;
  /** True only when both the device and the browser were identified from known tokens. */
  confident: boolean;
}

export interface HomeScreenInstructionSet {
  title: string;
  steps: string[];
  note?: string;
}

export const HOME_SCREEN_CONFIRMATION =
  'Asset Safe will appear on your home screen for quick, app-like access to your dashboard.';

/* ------------------------------------------------------------------ */
/* Detection                                                           */
/* ------------------------------------------------------------------ */

function detectDevice(ua: string): HomeScreenDevice {
  const isIOS =
    /iPad|iPhone|iPod/.test(ua) ||
    (typeof navigator !== 'undefined' &&
      navigator.platform === 'MacIntel' &&
      navigator.maxTouchPoints > 1);
  if (isIOS) return 'ios';
  if (/Android/i.test(ua)) return 'android';
  if (/Windows|Macintosh|CrOS|X11|Linux/i.test(ua)) return 'desktop';
  return 'unknown';
}

/**
 * Browser detection runs after device detection because the tokens differ per
 * platform (EdgA on Android vs EdgiOS on iOS, CriOS vs Chrome, etc.).
 * Vendor-specific tokens are always checked before the generic ones, since
 * most alternative browsers also include "Chrome"/"Safari" in their UA.
 */
function detectBrowser(ua: string, device: HomeScreenDevice): HomeScreenBrowser {
  if (device === 'ios') {
    if (/EdgiOS/i.test(ua)) return 'edge';
    if (/CriOS/i.test(ua)) return 'chrome';
    if (/FxiOS/i.test(ua)) return 'firefox';
    if (/OPiOS|OPT\//i.test(ua)) return 'other';
    if (/GoogleApp|FBAN|FBAV|Instagram|Line\//i.test(ua)) return 'other';
    if (/Safari/i.test(ua)) return 'safari';
    return 'unknown';
  }

  if (/EdgA|Edg\//i.test(ua)) return 'edge';
  if (/SamsungBrowser/i.test(ua)) return 'samsung';
  if (/Firefox|FxiOS/i.test(ua)) return 'firefox';
  if (/OPR\/|Opera|YaBrowser|UCBrowser|MiuiBrowser|HuaweiBrowser|Brave/i.test(ua)) return 'other';
  if (/Chrome|CriOS|Chromium/i.test(ua)) return 'chrome';
  if (/Safari/i.test(ua)) return 'safari';
  return 'unknown';
}

export function detectEnvironment(
  userAgent?: string,
): HomeScreenEnvironment {
  const ua =
    userAgent ?? (typeof navigator !== 'undefined' ? navigator.userAgent : '');
  if (!ua) return { device: 'unknown', browser: 'unknown', confident: false };

  const device = detectDevice(ua);
  const browser = detectBrowser(ua, device);
  const confident =
    device !== 'unknown' && browser !== 'unknown' && browser !== 'other';

  return { device, browser, confident };
}

/* ------------------------------------------------------------------ */
/* Labels                                                             */
/* ------------------------------------------------------------------ */

const DEVICE_LABELS: Record<HomeScreenDevice, string> = {
  android: 'Android',
  ios: 'iPhone / iPad',
  desktop: 'Desktop',
  unknown: 'Your device',
};

const BROWSER_LABELS: Record<HomeScreenBrowser, string> = {
  chrome: 'Chrome',
  edge: 'Microsoft Edge',
  firefox: 'Firefox',
  samsung: 'Samsung Internet',
  safari: 'Safari',
  other: 'Another browser',
  unknown: 'Select browser',
};

export function getDeviceLabel(device: HomeScreenDevice): string {
  return DEVICE_LABELS[device];
}

export function getBrowserLabel(browser: HomeScreenBrowser): string {
  return BROWSER_LABELS[browser];
}

/** e.g. "Microsoft Edge on Android" */
export function getEnvironmentLabel(
  device: HomeScreenDevice,
  browser: HomeScreenBrowser,
): string {
  if (device === 'unknown' || browser === 'unknown') return '';
  return `${BROWSER_LABELS[browser]} on ${DEVICE_LABELS[device]}`;
}

/* ------------------------------------------------------------------ */
/* Instruction content                                                */
/* ------------------------------------------------------------------ */

const IOS_SAFARI_PATH: HomeScreenInstructionSet = {
  title: 'Safari on iPhone / iPad',
  steps: [
    'Tap the Share button.',
    'Scroll down and tap Add to Home Screen.',
    'Tap Add.',
  ],
};

function iosNonSafari(browserLabel: string): HomeScreenInstructionSet {
  return {
    title: `${browserLabel} on iPhone / iPad`,
    steps: [
      'Open Asset Safe in Safari and go to your dashboard.',
      'Tap the Share button.',
      'Scroll down and tap Add to Home Screen, then tap Add.',
    ],
    note: `Add to Home Screen support varies in ${browserLabel} on iPhone and iPad, so Safari is the most reliable path.`,
  };
}

const INSTRUCTIONS: Record<string, HomeScreenInstructionSet> = {
  'android:chrome': {
    title: 'Chrome on Android',
    steps: [
      'Open the Chrome menu (⋮).',
      'Look for Add to Home screen or the equivalent shortcut option shown by Chrome.',
      'Confirm.',
    ],
  },
  'android:edge': {
    title: 'Microsoft Edge on Android',
    steps: [
      'Open the Edge menu (⋯).',
      'Look for Add to phone, Add to Home screen, or the equivalent shortcut option.',
      'Confirm.',
    ],
  },
  'android:firefox': {
    title: 'Firefox on Android',
    steps: [
      'Open the Firefox menu (⋮).',
      'Look for Add to Home screen, Install, or the equivalent shortcut option.',
      'Confirm.',
    ],
  },
  'android:samsung': {
    title: 'Samsung Internet on Android',
    steps: [
      'Open the browser menu (☰).',
      'Look for Add page to, then choose Home screen, or the equivalent shortcut option.',
      'Confirm.',
    ],
  },
  'android:other': {
    title: 'Another browser on Android',
    steps: [
      'Open your browser menu.',
      'Look for Add to Home screen or the equivalent shortcut option.',
      'Confirm.',
    ],
    note: 'Not every Android browser offers a home screen shortcut. If you do not see the option, try Chrome or Microsoft Edge.',
  },
  'ios:safari': IOS_SAFARI_PATH,
  'ios:chrome': iosNonSafari('Chrome'),
  'ios:edge': iosNonSafari('Microsoft Edge'),
  'ios:firefox': iosNonSafari('Firefox'),
  'ios:other': iosNonSafari('your current browser'),
  'desktop:chrome': {
    title: 'Chrome on desktop',
    steps: [
      'Open the Chrome menu (⋮).',
      'Look for Save and share, Cast, save and share, or the equivalent shortcut option, then choose Create shortcut.',
      'Name the shortcut and confirm.',
    ],
  },
  'desktop:edge': {
    title: 'Microsoft Edge on desktop',
    steps: [
      'Open the Edge menu (⋯).',
      'Look for Apps, then Install this site as an app, or the equivalent shortcut option.',
      'Confirm.',
    ],
  },
  'desktop:other': {
    title: 'Another desktop browser',
    steps: [
      'Open your browser menu.',
      'Look for a shortcut, pin, or bookmark option for this page.',
      'Confirm.',
    ],
    note: 'Desktop browsers vary. Bookmarking your dashboard works everywhere.',
  },
};

export function getHomeScreenInstructions(
  device: HomeScreenDevice,
  browser: HomeScreenBrowser,
): HomeScreenInstructionSet | null {
  if (device === 'unknown' || browser === 'unknown') return null;
  const exact = INSTRUCTIONS[`${device}:${browser}`];
  if (exact) return exact;
  if (device === 'desktop') return INSTRUCTIONS['desktop:other'];
  if (device === 'ios') return INSTRUCTIONS['ios:other'];
  return INSTRUCTIONS['android:other'];
}

/* ------------------------------------------------------------------ */
/* Selector options                                                   */
/* ------------------------------------------------------------------ */

export interface HomeScreenOptionGroup {
  device: HomeScreenDevice;
  label: string;
  browsers: HomeScreenBrowser[];
}

export const MOBILE_OPTION_GROUPS: HomeScreenOptionGroup[] = [
  {
    device: 'android',
    label: 'Android',
    browsers: ['chrome', 'edge', 'firefox', 'samsung', 'other'],
  },
  {
    device: 'ios',
    label: 'iPhone / iPad',
    browsers: ['safari', 'chrome', 'edge', 'firefox', 'other'],
  },
];

export const DESKTOP_OPTION_GROUP: HomeScreenOptionGroup = {
  device: 'desktop',
  label: 'Desktop',
  browsers: ['chrome', 'edge', 'other'],
};

export function encodeSelection(
  device: HomeScreenDevice,
  browser: HomeScreenBrowser,
): string {
  return `${device}:${browser}`;
}

export function decodeSelection(
  value: string,
): { device: HomeScreenDevice; browser: HomeScreenBrowser } {
  const [device, browser] = value.split(':');
  return {
    device: device as HomeScreenDevice,
    browser: browser as HomeScreenBrowser,
  };
}
