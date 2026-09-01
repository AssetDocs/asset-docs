# Fix: Homepage hero video has no sound

## Cause (confirmed)

The source upload `Asset_Safe_Homepage_Hero.mp4` contains two streams: H.264 video and a 2-channel AAC audio track. The optimized file that was uploaded to the CDN and is now served on the homepage contains **only the video stream** — the audio track was dropped during the compression step. So the player is fine; the file itself is silent.

The hero player markup in `HeroSection.tsx` is not muted and already shows controls, so no player changes are needed.

## Fix

1. Re-encode the original upload to a web-friendly size, this time explicitly keeping and encoding the audio track (AAC, stereo, ~128 kbps, faststart flag for streaming).
2. Verify with a stream probe that the output has both a video and an audio stream before uploading.
3. Upload the new file as a Lovable Asset and replace the pointer at `src/assets/asset-safe-intro.mp4.asset.json`.
4. Keep the existing poster image as-is (unchanged).
5. Verify in the running preview that the hero video element reports a nonzero duration, is not muted, and has an audible audio track.

## Notes

- File size will grow slightly (roughly +0.3-0.5 MB) because of the added audio; still well within a reasonable hero-video budget.
- Browsers will still not autoplay with sound — the hero uses click-to-play controls, which is the correct pattern here. Nothing else about the hero layout or copy changes.
