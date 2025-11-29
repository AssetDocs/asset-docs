// Organization Schema
export const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Asset Safe",
  "url": "https://www.assetsafe.net",
  "logo": "https://www.assetsafe.net/lovable-uploads/asset-safe-logo-email-v2.jpg",
  "description": "Digital home inventory and legacy planning platform for comprehensive property documentation and asset protection.",
  "address": {
    "@type": "PostalAddress",
    "addressCountry": "US"
  },
  "contactPoint": {
    "@type": "ContactPoint",
    "contactType": "Customer Support",
    "email": "support@assetsafe.net",
    "url": "https://www.assetsafe.net/contact"
  },
  "sameAs": [
    "https://www.facebook.com/assetsafe",
    "https://twitter.com/assetsafe",
    "https://www.linkedin.com/company/assetsafe"
  ]
};

// Product Schema for Subscription Plans
export const productSchema = (planName: string, price: string, description: string) => ({
  "@context": "https://schema.org",
  "@type": "Product",
  "name": planName,
  "description": description,
  "brand": {
    "@type": "Brand",
    "name": "Asset Safe"
  },
  "offers": {
    "@type": "Offer",
    "price": price,
    "priceCurrency": "USD",
    "availability": "https://schema.org/InStock",
    "url": "https://www.assetsafe.net/pricing",
    "priceValidUntil": "2025-12-31"
  }
});

// FAQ Schema
export const faqSchema = (faqs: Array<{ question: string; answer: string }>) => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": faqs.map(faq => ({
    "@type": "Question",
    "name": faq.question,
    "acceptedAnswer": {
      "@type": "Answer",
      "text": faq.answer
    }
  }))
});

// Breadcrumb Schema
export const breadcrumbSchema = (items: Array<{ name: string; url: string }>) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": items.map((item, index) => ({
    "@type": "ListItem",
    "position": index + 1,
    "name": item.name,
    "item": item.url
  }))
});

// WebApplication Schema
export const webApplicationSchema = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "Asset Safe",
  "url": "https://www.assetsafe.net",
  "applicationCategory": "BusinessApplication",
  "operatingSystem": "Web Browser",
  "offers": {
    "@type": "Offer",
    "price": "12.99",
    "priceCurrency": "USD"
  },
  "description": "Digital home inventory and property documentation platform with secure cloud storage, insurance claims support, and legacy planning tools."
};

// Local Business Schema (if applicable)
export const localBusinessSchema = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "Asset Safe",
  "image": "https://www.assetsafe.net/lovable-uploads/asset-safe-logo-email-v2.jpg",
  "url": "https://www.assetsafe.net",
  "telephone": "+1-XXX-XXX-XXXX", // Update with actual phone if available
  "address": {
    "@type": "PostalAddress",
    "addressCountry": "US"
  },
  "priceRange": "$$",
  "openingHoursSpecification": {
    "@type": "OpeningHoursSpecification",
    "dayOfWeek": [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday"
    ],
    "opens": "09:00",
    "closes": "17:00"
  }
};

// Article Schema (for blog posts/guides)
export const articleSchema = (title: string, description: string, datePublished: string, author: string = "Asset Safe Team") => ({
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": title,
  "description": description,
  "author": {
    "@type": "Person",
    "name": author
  },
  "publisher": {
    "@type": "Organization",
    "name": "Asset Safe",
    "logo": {
      "@type": "ImageObject",
      "url": "https://www.assetsafe.net/lovable-uploads/asset-safe-logo-email-v2.jpg"
    }
  },
  "datePublished": datePublished,
  "dateModified": datePublished
});
