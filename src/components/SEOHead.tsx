import { Helmet } from 'react-helmet-async';
import React from 'react';

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string;
  ogImage?: string;
  canonicalUrl?: string;
  type?: 'website' | 'article';
  structuredData?: object;
}

const SEOHead: React.FC<SEOHeadProps> = ({
  title = 'Asset Safe | Digital Home Inventory, Legacy Locker & Property Documentation Platform',
  description = 'Complete property documentation platform for homeowners, renters & businesses. Secure digital inventory, insurance claims support, estate planning tools & legacy locker. No long-term contract required.',
  keywords = 'digital home inventory, property documentation, insurance claims, asset protection, legacy locker, estate planning, home inventory app, property management, homeowner documentation, digital estate vault',
  ogImage = 'https://www.assetsafe.net/lovable-uploads/asset-safe-logo-email-v2.jpg',
  canonicalUrl,
  type = 'website',
  structuredData
}) => {
  const siteUrl = 'https://www.assetsafe.net';
  const fullCanonicalUrl = canonicalUrl || siteUrl;
  const fullTitle = title.includes('Asset Safe') ? title : `${title} | Asset Safe`;

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="title" content={fullTitle} />
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <link rel="canonical" href={fullCanonicalUrl} />
      <meta name="robots" content="index, follow" />
      <meta name="language" content="English" />
      <meta name="author" content="Asset Safe" />
      <meta httpEquiv="Content-Type" content="text/html; charset=utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <html lang="en-US" />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={fullCanonicalUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:site_name" content="Asset Safe" />
      <meta property="og:locale" content="en_US" />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={fullCanonicalUrl} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />

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
