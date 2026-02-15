// Organization Schema
export const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Asset Safe",
  "url": "https://www.getassetsafe.com",
  "logo": "https://www.getassetsafe.com/lovable-uploads/asset-safe-logo-email-v2.jpg",
  "description": "Digital home inventory and legacy planning platform for comprehensive property documentation and asset protection.",
  "foundingDate": "2024",
  "address": {
    "@type": "PostalAddress",
    "addressCountry": "US"
  },
  "contactPoint": {
    "@type": "ContactPoint",
    "contactType": "Customer Support",
    "email": "support@assetsafe.net",
    "url": "https://www.getassetsafe.com/contact"
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
    "url": "https://www.getassetsafe.com/pricing",
    "priceValidUntil": "2026-12-31"
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
  "url": "https://www.getassetsafe.com",
  "applicationCategory": "BusinessApplication",
  "operatingSystem": "Web Browser",
  "offers": {
    "@type": "Offer",
    "price": "12.99",
    "priceCurrency": "USD"
  },
  "description": "Digital home inventory and property documentation platform with secure cloud storage, insurance claims support, and legacy planning tools.",
  "featureList": [
    "Digital home inventory",
    "Photo and video documentation",
    "Insurance claims support",
    "Legacy Locker for estate planning",
    "Secure cloud storage",
    "Multi-property management"
  ]
};

// Software Application Schema (for app stores / PWA)
export const softwareApplicationSchema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "Asset Safe",
  "operatingSystem": "Web, iOS, Android",
  "applicationCategory": "LifestyleApplication",
  "offers": {
    "@type": "Offer",
    "price": "12.99",
    "priceCurrency": "USD",
    "priceValidUntil": "2026-12-31"
  }
};

// Video Schema
export const videoSchema = (
  title: string, 
  description: string, 
  thumbnailUrl: string, 
  uploadDate: string,
  contentUrl?: string,
  embedUrl?: string,
  duration?: string
) => ({
  "@context": "https://schema.org",
  "@type": "VideoObject",
  "name": title,
  "description": description,
  "thumbnailUrl": thumbnailUrl,
  "uploadDate": uploadDate,
  ...(contentUrl && { "contentUrl": contentUrl }),
  ...(embedUrl && { "embedUrl": embedUrl }),
  ...(duration && { "duration": duration }),
  "publisher": {
    "@type": "Organization",
    "name": "Asset Safe",
    "logo": {
      "@type": "ImageObject",
      "url": "https://www.getassetsafe.com/lovable-uploads/asset-safe-logo-email-v2.jpg"
    }
  }
});

// Article Schema (for blog posts/guides)
export const articleSchema = (
  title: string, 
  description: string, 
  datePublished: string, 
  author: string = "Asset Safe Team",
  image?: string,
  url?: string
) => ({
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": title,
  "description": description,
  "image": image || "https://www.getassetsafe.com/lovable-uploads/asset-safe-logo-email-v2.jpg",
  ...(url && { "url": url }),
  "author": {
    "@type": "Person",
    "name": author
  },
  "publisher": {
    "@type": "Organization",
    "name": "Asset Safe",
    "logo": {
      "@type": "ImageObject",
      "url": "https://www.getassetsafe.com/lovable-uploads/asset-safe-logo-email-v2.jpg"
    }
  },
  "datePublished": datePublished,
  "dateModified": datePublished
});

// HowTo Schema (for guide pages)
export const howToSchema = (
  name: string,
  description: string,
  steps: Array<{ name: string; text: string; image?: string }>
) => ({
  "@context": "https://schema.org",
  "@type": "HowTo",
  "name": name,
  "description": description,
  "step": steps.map((step, index) => ({
    "@type": "HowToStep",
    "position": index + 1,
    "name": step.name,
    "text": step.text,
    ...(step.image && { "image": step.image })
  }))
});

// Service Schema (for use-case pages)
export const serviceSchema = (
  name: string,
  description: string,
  serviceType: string,
  areaServed: string = "US"
) => ({
  "@context": "https://schema.org",
  "@type": "Service",
  "name": name,
  "description": description,
  "serviceType": serviceType,
  "provider": {
    "@type": "Organization",
    "name": "Asset Safe",
    "url": "https://www.getassetsafe.com"
  },
  "areaServed": {
    "@type": "Country",
    "name": areaServed
  }
});
