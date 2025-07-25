export interface SearchResult {
  id: string;
  title: string;
  description: string;
  path: string;
  category: 'page' | 'feature' | 'help' | 'account';
  keywords: string[];
}

export interface QuickAction {
  id: string;
  title: string;
  path: string;
  icon: string;
}

// All searchable content in the application
const searchableContent: SearchResult[] = [
  // Main Pages
  {
    id: 'home',
    title: 'Home',
    description: 'Asset documentation platform for homeowners and renters',
    path: '/',
    category: 'page',
    keywords: ['home', 'main', 'landing', 'dashboard']
  },
  {
    id: 'features',
    title: 'Features',
    description: 'Platform features and capabilities',
    path: '/features',
    category: 'page',
    keywords: ['features', 'capabilities', 'functionality', 'tools']
  },
  {
    id: 'scenarios',
    title: 'Scenarios',
    description: 'Use cases and scenarios for asset documentation',
    path: '/scenarios',
    category: 'page',
    keywords: ['scenarios', 'use cases', 'examples', 'situations']
  },
  {
    id: 'pricing',
    title: 'Pricing',
    description: 'Subscription plans and pricing information',
    path: '/pricing',
    category: 'page',
    keywords: ['pricing', 'plans', 'subscription', 'cost', 'payment']
  },
  {
    id: 'about',
    title: 'About',
    description: 'About Asset Docs and our mission',
    path: '/about',
    category: 'page',
    keywords: ['about', 'company', 'mission', 'team']
  },
  {
    id: 'contact',
    title: 'Contact',
    description: 'Get in touch with our support team',
    path: '/contact',
    category: 'page',
    keywords: ['contact', 'support', 'help', 'email', 'reach out']
  },
  
  // Help & Resources
  {
    id: 'video-help',
    title: 'Video Help',
    description: 'Video tutorials and guides',
    path: '/video-help',
    category: 'help',
    keywords: ['video', 'help', 'tutorial', 'guide', 'how to']
  },
  {
    id: 'resources',
    title: 'Resources',
    description: 'Documentation and learning resources',
    path: '/resources',
    category: 'help',
    keywords: ['resources', 'documentation', 'guides', 'learning']
  },
  {
    id: 'qa',
    title: 'Q&A',
    description: 'Frequently asked questions',
    path: '/qa',
    category: 'help',
    keywords: ['qa', 'faq', 'questions', 'answers', 'help']
  },
  {
    id: 'glossary',
    title: 'Glossary',
    description: 'Terms and definitions',
    path: '/glossary',
    category: 'help',
    keywords: ['glossary', 'terms', 'definitions', 'dictionary']
  },
  {
    id: 'claims',
    title: 'Claims',
    description: 'Insurance claims assistance',
    path: '/claims',
    category: 'help',
    keywords: ['claims', 'insurance', 'assistance', 'process']
  },
  {
    id: 'industry-requirements',
    title: 'Industry Requirements',
    description: 'Industry-specific documentation requirements',
    path: '/industry-requirements',
    category: 'help',
    keywords: ['industry', 'requirements', 'compliance', 'regulations']
  },
  {
    id: 'state-requirements',
    title: 'State Requirements',
    description: 'State-specific documentation requirements',
    path: '/state-requirements',
    category: 'help',
    keywords: ['state', 'requirements', 'regulations', 'local laws']
  },
  {
    id: 'checklists',
    title: 'Checklists',
    description: 'Documentation checklists and guides',
    path: '/checklists',
    category: 'help',
    keywords: ['checklists', 'guides', 'documentation', 'organize']
  },
  {
    id: 'photography-guide',
    title: 'Photography Guide',
    description: 'Tips for taking better asset photos',
    path: '/photography-guide',
    category: 'help',
    keywords: ['photography', 'photos', 'tips', 'guide', 'camera']
  },
  {
    id: 'ai-valuation-guide',
    title: 'AI Valuation Guide',
    description: 'How AI valuation works',
    path: '/ai-valuation-guide',
    category: 'help',
    keywords: ['ai', 'valuation', 'artificial intelligence', 'estimates']
  },
  
  // Account Features
  {
    id: 'dashboard',
    title: 'Dashboard',
    description: 'Main account dashboard',
    path: '/account',
    category: 'account',
    keywords: ['dashboard', 'account', 'overview', 'summary']
  },
  {
    id: 'properties',
    title: 'Properties',
    description: 'Manage your properties',
    path: '/account/properties',
    category: 'account',
    keywords: ['properties', 'real estate', 'homes', 'manage']
  },
  {
    id: 'photos',
    title: 'Photos',
    description: 'Photo gallery and uploads',
    path: '/account/photos',
    category: 'account',
    keywords: ['photos', 'gallery', 'images', 'upload', 'pictures']
  },
  {
    id: 'videos',
    title: 'Videos',
    description: 'Video gallery and uploads',
    path: '/account/videos',
    category: 'account',
    keywords: ['videos', 'gallery', 'upload', 'recordings']
  },
  {
    id: 'documents',
    title: 'Documents',
    description: 'Document storage and management',
    path: '/account/documents',
    category: 'account',
    keywords: ['documents', 'files', 'storage', 'paperwork']
  },
  {
    id: 'floorplans',
    title: 'Floor Plans',
    description: 'Floor plan uploads and management',
    path: '/account/floorplans',
    category: 'account',
    keywords: ['floor plans', 'blueprints', 'layout', 'architecture']
  },
  {
    id: 'insurance',
    title: 'Insurance',
    description: 'Insurance information and claims',
    path: '/account/insurance',
    category: 'account',
    keywords: ['insurance', 'coverage', 'policy', 'claims']
  },
  {
    id: 'settings',
    title: 'Account Settings',
    description: 'Account preferences and settings',
    path: '/account/settings',
    category: 'account',
    keywords: ['settings', 'preferences', 'account', 'profile']
  }
];

// Quick actions for common tasks
const quickActions: QuickAction[] = [
  {
    id: 'upload-photos',
    title: 'Upload Photos',
    path: '/account/photos/upload',
    icon: 'Camera'
  },
  {
    id: 'upload-videos',
    title: 'Upload Videos',
    path: '/account/videos/upload',
    icon: 'Video'
  },
  {
    id: 'add-property',
    title: 'Add Property',
    path: '/account/properties/new',
    icon: 'Home'
  },
  {
    id: 'view-dashboard',
    title: 'Go to Dashboard',
    path: '/account',
    icon: 'LayoutDashboard'
  },
  {
    id: 'get-help',
    title: 'Get Help',
    path: '/video-help',
    icon: 'HelpCircle'
  }
];

export class SearchService {
  private static normalizeText(text: string): string {
    return text.toLowerCase().trim();
  }

  private static calculateRelevance(item: SearchResult, query: string): number {
    const normalizedQuery = this.normalizeText(query);
    const normalizedTitle = this.normalizeText(item.title);
    const normalizedDescription = this.normalizeText(item.description);
    const normalizedKeywords = item.keywords.map(k => this.normalizeText(k));

    let score = 0;

    // Exact title match - highest score
    if (normalizedTitle === normalizedQuery) {
      score += 100;
    }
    // Title starts with query
    else if (normalizedTitle.startsWith(normalizedQuery)) {
      score += 80;
    }
    // Title contains query
    else if (normalizedTitle.includes(normalizedQuery)) {
      score += 60;
    }

    // Keyword exact match
    if (normalizedKeywords.includes(normalizedQuery)) {
      score += 70;
    }
    // Keyword partial match
    else if (normalizedKeywords.some(keyword => keyword.includes(normalizedQuery))) {
      score += 40;
    }

    // Description contains query
    if (normalizedDescription.includes(normalizedQuery)) {
      score += 30;
    }

    // Query words in title/description
    const queryWords = normalizedQuery.split(' ');
    queryWords.forEach(word => {
      if (word.length > 2) {
        if (normalizedTitle.includes(word)) score += 10;
        if (normalizedDescription.includes(word)) score += 5;
        if (normalizedKeywords.some(keyword => keyword.includes(word))) score += 15;
      }
    });

    return score;
  }

  static search(query: string, maxResults: number = 8): SearchResult[] {
    if (!query || query.trim().length < 1) {
      return [];
    }

    const results = searchableContent
      .map(item => ({
        ...item,
        relevance: this.calculateRelevance(item, query)
      }))
      .filter(item => item.relevance > 0)
      .sort((a, b) => b.relevance - a.relevance)
      .slice(0, maxResults)
      .map(({ relevance, ...item }) => item);

    return results;
  }

  static getQuickActions(): QuickAction[] {
    return quickActions;
  }

  static getPopularSearches(): string[] {
    return [
      'upload photos',
      'add property',
      'insurance claims',
      'video help',
      'floor plans',
      'pricing'
    ];
  }
}