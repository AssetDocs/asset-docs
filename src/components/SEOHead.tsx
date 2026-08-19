import { Helmet } from 'react-helmet-async';
import React from 'react';

interface SEOHeadProps {
  title?: string;
  browserTitle?: string;
  description?: string;
  socialTitle?: string;
  socialDescription?: string;
  keywords?: string;
  ogImage?: string;
  canonicalUrl?: string;
  type?: 'website' | 'article';
  structuredData?: object;
  noIndex?: boolean;
}

const SEOHead: React.FC<SEOHeadProps> = ({
  title = 'Asset Safe | Protect What Matters',
  browserTitle,
  description = 'Your assets, important information, records, and memories — organized, protected, and ready when you need them.',
  socialTitle,
  socialDescription,
  keywords = 'asset documentation, important records, property documentation, insurance records, secure vault, asset protection, family information, continuity planning',
  ogImage = 'https://getassetsafe.com/images/asset-safe-social-card.png',
  canonicalUrl,
  type = 'website',
  structuredData,
  noIndex = false
}) => {
  const siteUrl = 'https://getassetsafe.com';
  const fullCanonicalUrl = canonicalUrl || siteUrl;
  const fullTitle = title.includes('Asset Safe') || `${title} | Asset Safe`.length > 60 ? title : `${title} | Asset Safe`;
  const documentTitle = browserTitle || fullTitle;
  const fullOgImage = ogImage.startsWith('http') ? ogImage : `${siteUrl}${ogImage.startsWith('/') ? ogImage : `/${ogImage}`}`;
  const ogTitle = socialTitle || fullTitle;
  const ogDescription = socialDescription || description;

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{documentTitle}</title>
      <meta name="title" content={fullTitle} />
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <link rel="canonical" href={fullCanonicalUrl} />
      <meta name="robots" content={noIndex ? "noindex, nofollow" : "index, follow"} />
      <meta name="language" content="English" />
      <meta name="author" content="Asset Safe" />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={fullCanonicalUrl} />
      <meta property="og:title" content={ogTitle} />
      <meta property="og:description" content={ogDescription} />
      <meta property="og:image" content={fullOgImage} />
      <meta property="og:site_name" content="Asset Safe" />
      <meta property="og:locale" content="en_US" />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={fullCanonicalUrl} />
      <meta name="twitter:title" content={ogTitle} />
      <meta name="twitter:description" content={ogDescription} />
      <meta name="twitter:image" content={fullOgImage} />

      {/* Structured Data */}
      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}
    </Helmet>
  );
};

export default SEOHead;
