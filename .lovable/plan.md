

## Update Favicon

Replace the current favicon (`favicon.jpg`) with the new uploaded Asset Safe icon.

### Steps

1. **Copy the uploaded image** to `public/favicon.png`
2. **Update `index.html`** to reference the new PNG favicon instead of the old JPG:
   - Change `<link rel="icon" href="/favicon.jpg" type="image/jpeg">` to `<link rel="icon" href="/favicon.png" type="image/png">`
   - Change `<link rel="apple-touch-icon" href="/favicon.jpg">` to `<link rel="apple-touch-icon" href="/favicon.png">`
3. **Update `vite.config.ts`** PWA manifest icons to reference `favicon.png` with `image/png` type
4. **Update `SEOHead.tsx`** if it references the old favicon (quick check -- likely no change needed since favicon is in HTML only)

This is a 2-file change (`index.html`, `vite.config.ts`) plus copying the asset.

