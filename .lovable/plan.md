# Fix Merchant Listings "missing image" on /pricing and /gift

Google flags both Product entities because the shared `productSchema` helper never emits an `image` field. Everything else (name, description, brand, offer price, USD currency, availability) is already present and valid, so the fix is additive.

## What changes

1. `src/utils/structuredData.ts` — extend `productSchema` with two optional arguments: `image` (string or array of URLs) and `offerUrl`. The helper keeps its current output and adds `"image"` to the Product, defaulting the offer URL to `https://getassetsafe.com/pricing` exactly as today when no override is passed.
2. `src/pages/Pricing.tsx` — pass the existing Asset Safe branded social card (`asset-safe-social-card.png`, already imported as a Lovable asset and served from `https://getassetsafe.com/__l5e/assets-v1/...`, the same absolute URL already used in Organization and Article schema) as `image`. Offer URL stays `https://getassetsafe.com/pricing`.
3. `src/pages/Gift.tsx` — pass the same branded Asset Safe image as `image`, and correct the Offer `url` to `https://getassetsafe.com/gift` so the offer points at the page that actually sells the gift plan (the helper currently hardcodes `/pricing`, which is an inaccurate offer URL for this entity).

No new image assets are created; the existing branded card is reused for both entities.

## Not changed

Pricing values ($18.99 / $189), checkout or gift purchase behavior, visible copy, layout, canonicals, and existing meta tags. No reviews, ratings, GTIN/MPN, shipping, inventory, or physical-product fields are added.

## Resulting JSON-LD (for review)

```text
/pricing
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "Asset Safe Plan",
  "description": "One simple plan. Everything included. Secure asset documentation, cloud storage, legacy tools, and trusted access.",
  "image": ["https://getassetsafe.com/__l5e/assets-v1/.../asset-safe-social-card.png"],
  "brand": { "@type": "Brand", "name": "Asset Safe" },
  "offers": {
    "@type": "Offer",
    "price": "18.99",
    "priceCurrency": "USD",
    "availability": "https://schema.org/InStock",
    "url": "https://getassetsafe.com/pricing"
  }
}

/gift
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "Asset Safe Gift Plan",
  "description": "One-year gift subscription — everything included. The perfect gift for homeowners and families.",
  "image": ["https://getassetsafe.com/__l5e/assets-v1/.../asset-safe-social-card.png"],
  "brand": { "@type": "Brand", "name": "Asset Safe" },
  "offers": {
    "@type": "Offer",
    "price": "189",
    "priceCurrency": "USD",
    "availability": "https://schema.org/InStock",
    "url": "https://getassetsafe.com/gift"
  }
}
```

## Verification

Build, then load both pages in the preview and read the rendered JSON-LD to confirm each Product has name, image, and a valid Offer with URL, price, USD currency, and availability, and that the prices match the visible page.
