## Goal

Remove the YouTube iframe from the homepage hero and play your uploaded intro video directly on the site — no YouTube branding, ads, related-video prompts, or outbound links.

Yes, this is fully doable: a native HTML5 `<video>` player has no third-party chrome at all.

## Source file

`Asset_Safe_Introduction.mp4` — 1920x1080, H.264/AAC, 59s, 50.7 MB. 50 MB is too heavy for a homepage hero, so it gets re-encoded before hosting.

## Steps

1. **Optimize the video** with ffmpeg: scale to 1280x720, H.264 CRF ~26, AAC 128k audio, and `-movflags +faststart` so playback starts before the whole file downloads. Expected result: roughly 6–12 MB.
2. **Generate a poster frame** (a still grabbed from the video) so the hero shows a clean branded image before play, with no layout shift.
3. **Upload both to the Lovable CDN** as `.asset.json` pointers (`src/assets/asset-safe-intro.mp4.asset.json` and the poster). The binaries stay out of the repo.
4. **Rewrite the hero player** in `src/components/HeroSection.tsx`: swap the iframe for a native `<video>` with `controls`, `playsInline`, `preload="metadata"`, `poster`, and `controlsList="nodownload noremoteplayback"` plus `disablePictureInPicture` to keep the UI minimal. Same card styling and 16:9 frame as today.
5. **Update the video structured data** in `src/pages/Index.tsx` so the JSON-LD `contentUrl`/`thumbnailUrl` point at the new self-hosted files instead of the YouTube embed URL (keeps SEO video rich-result eligibility).
6. Verify in the preview at desktop and mobile widths.

## Defaults I'll use (say the word to change)

- **Click to play**, not autoplay — poster image shown first, sound on when the visitor presses play. (Browsers only allow autoplay when muted, and a muted auto-playing intro loses the narration.)
- Native browser controls, no custom player UI.
- The old `public/AssetDocsIntro2.mp4` and the Legacy Locker YouTube embed are left untouched — this change is hero-only.

## Technical notes

`<video>` served from the Lovable CDN supports HTTP range requests, so seeking works normally. No third-party scripts, cookies, or trackers are loaded — which also removes YouTube's cookie footprint from the homepage.
