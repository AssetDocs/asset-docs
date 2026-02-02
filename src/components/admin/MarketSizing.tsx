import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import { 
  TrendingUp, 
  Home, 
  Users, 
  Building2, 
  Briefcase, 
  DollarSign,
  Target,
  PieChart,
  ExternalLink
} from 'lucide-react';

const MarketSizing: React.FC = () => {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight">TAM / SAM / SOM Analysis</h2>
        <p className="text-muted-foreground mt-2">
          Asset Safe Market Opportunity — U.S. Market Sizing (2025)
        </p>
      </div>

      {/* U.S. Baseline Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Home className="w-5 h-5" />
            U.S. Baseline Statistics (2025)
          </CardTitle>
          <CardDescription>Foundation metrics for market sizing</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-primary">134.79M</div>
              <div className="text-sm text-muted-foreground">Total U.S. Households</div>
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-primary">65.3%</div>
              <div className="text-sm text-muted-foreground">Homeownership Rate (Q3)</div>
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-primary">~88.02M</div>
              <div className="text-sm text-muted-foreground">Owner Households</div>
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-primary">~46.77M</div>
              <div className="text-sm text-muted-foreground">Renter Households</div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-primary">38.5M</div>
              <div className="text-sm text-muted-foreground">One-Person Households (29%)</div>
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-primary">61.2M</div>
              <div className="text-sm text-muted-foreground">Age 65+ Population</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* TAM Section */}
      <Card className="border-2 border-primary/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <Badge className="mb-2 bg-primary">TAM</Badge>
              <CardTitle>Total Addressable Market</CardTitle>
              <CardDescription>All U.S. households that could benefit from asset documentation + vault storage</CardDescription>
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold text-primary">134.8M</div>
              <div className="text-sm text-muted-foreground">household accounts</div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Segment</TableHead>
                <TableHead>Households</TableHead>
                <TableHead>% of Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">Homeowners</TableCell>
                <TableCell>~88.0M</TableCell>
                <TableCell>65.3%</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Renters</TableCell>
                <TableCell>~46.8M</TableCell>
                <TableCell>34.7%</TableCell>
              </TableRow>
              <TableRow className="bg-muted/50">
                <TableCell className="font-bold">Total TAM</TableCell>
                <TableCell className="font-bold">134.8M</TableCell>
                <TableCell className="font-bold">100%</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Target Markets */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* B2C Markets */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              B2C: Household Segments
            </CardTitle>
            <CardDescription>Core subscription TAM</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-3 border rounded-lg">
              <div className="flex justify-between items-center">
                <span className="font-medium">Homeowner Households</span>
                <Badge variant="secondary">~88.0M</Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-1">65.3% of households</p>
            </div>
            <div className="p-3 border rounded-lg">
              <div className="flex justify-between items-center">
                <span className="font-medium">Renter Households</span>
                <Badge variant="secondary">~46.8M</Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-1">34.7% of households</p>
            </div>
            <div className="p-3 border rounded-lg">
              <div className="flex justify-between items-center">
                <span className="font-medium">One-Person Households</span>
                <Badge variant="secondary">38.5M</Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-1">Simple onboarding, high need for digital backup</p>
            </div>
          </CardContent>
        </Card>

        {/* Life-Event Segments */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Life-Event Segments
            </CardTitle>
            <CardDescription>High intent, high conversion moments</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-3 border rounded-lg">
              <div className="flex justify-between items-center">
                <span className="font-medium">New-Home Buyers (Construction)</span>
                <Badge variant="outline">~737K SAAR</Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-1">Oct 2025 indicator</p>
            </div>
            <div className="p-3 border rounded-lg">
              <div className="flex justify-between items-center">
                <span className="font-medium">Existing-Home Transactions</span>
                <Badge variant="outline">3.95M SAAR</Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-1">Dec 2025 — closing gift distribution</p>
            </div>
          </CardContent>
        </Card>

        {/* B2B: Real Estate */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              B2B: Real Estate Professionals
            </CardTitle>
            <CardDescription>Distribution channel + resale</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="p-4 bg-muted rounded-lg">
              <div className="flex justify-between items-center">
                <span className="font-medium">NAR Members (May 2025)</span>
                <Badge className="bg-primary">1,453,690</Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Individual agent accounts, team accounts, or brokerage rollups
              </p>
            </div>
          </CardContent>
        </Card>

        {/* B2B: Small Business */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="w-5 h-5" />
              B2B: Small Businesses
            </CardTitle>
            <CardDescription>SMB asset documentation + continuity</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="p-4 bg-muted rounded-lg">
              <div className="flex justify-between items-center">
                <span className="font-medium">U.S. Small Businesses</span>
                <Badge className="bg-primary">36.2M</Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Total possible business accounts
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* B2B2C Ecosystem */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            B2B2C: Claims + Restoration Ecosystem
          </CardTitle>
          <CardDescription>Referrals + packaged documentation</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg">
              <div className="flex justify-between items-center">
                <span className="font-medium">Damage Restoration Services</span>
                <Badge variant="secondary">60,020</Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-1">U.S. businesses (2025)</p>
            </div>
            <div className="p-4 border rounded-lg">
              <div className="flex justify-between items-center">
                <span className="font-medium">P&C / Direct Insurance</span>
                <Badge variant="secondary">4,116</Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-1">U.S. businesses (2024)</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* SAM Section */}
      <Card className="border-2 border-blue-500/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <Badge className="mb-2 bg-blue-500">SAM</Badge>
              <CardTitle>Serviceable Addressable Market</CardTitle>
              <CardDescription>Where Asset Safe is realistically positioned today</CardDescription>
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold text-blue-500">35.2M</div>
              <div className="text-sm text-muted-foreground">subscription-ready households</div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* SAM Calculation */}
          <div className="p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
            <h4 className="font-semibold mb-2">SAM Calculation (Consumer Market)</h4>
            <p className="text-sm text-muted-foreground mb-4">
              Asset Safe is best suited for: Homeowners, families with dependents, higher-income homes, 
              people who care about preparedness + legacy, tech-capable subscription buyers.
            </p>
            <div className="flex items-center gap-2 text-sm font-mono bg-background p-2 rounded">
              <span>88.0M homeowners</span>
              <span>×</span>
              <span>40% subscription-ready</span>
              <span>=</span>
              <span className="font-bold text-blue-500">35.2M</span>
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>SAM Segment</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>Notes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">Consumer Subscription-Ready Households</TableCell>
                <TableCell className="font-bold text-blue-500">35.2M</TableCell>
                <TableCell>Core market</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">High-Producing Real Estate Agents</TableCell>
                <TableCell className="font-bold">290K</TableCell>
                <TableCell>Top 20% of NAR members</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Restoration Partner Channel</TableCell>
                <TableCell className="font-bold">15K</TableCell>
                <TableCell>25% of restoration companies</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Separator />

      {/* SOM Section */}
      <Card className="border-2 border-green-500/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <Badge className="mb-2 bg-green-500">SOM</Badge>
              <CardTitle>Serviceable Obtainable Market</CardTitle>
              <CardDescription>What Asset Safe can realistically capture in 5 years</CardDescription>
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold text-green-500">~194K</div>
              <div className="text-sm text-muted-foreground">paying households</div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Source</TableHead>
                <TableHead>Calculation</TableHead>
                <TableHead className="text-right">Accounts</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">Direct Consumer Growth</TableCell>
                <TableCell className="text-sm text-muted-foreground">35.2M × 0.3% penetration</TableCell>
                <TableCell className="text-right font-bold">~106K</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Real Estate Closing Gift Channel</TableCell>
                <TableCell className="text-sm text-muted-foreground">5,800 agents × 10 subs/year</TableCell>
                <TableCell className="text-right font-bold">~58K</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Restoration Claim Channel</TableCell>
                <TableCell className="text-sm text-muted-foreground">150 companies × 200 referrals/year</TableCell>
                <TableCell className="text-right font-bold">~30K</TableCell>
              </TableRow>
              <TableRow className="bg-green-50 dark:bg-green-950/30">
                <TableCell className="font-bold">Total SOM (5-Year)</TableCell>
                <TableCell></TableCell>
                <TableCell className="text-right font-bold text-green-500 text-lg">~194K</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Revenue Translation */}
      <Card className="bg-gradient-to-r from-primary/5 to-green-500/5 border-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Revenue Translation (Investor-Ready)
          </CardTitle>
          <CardDescription>5-Year SOM Revenue Potential</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-4 bg-background rounded-lg border">
              <div className="text-sm text-muted-foreground">Blended ARPU</div>
              <div className="text-3xl font-bold">$120</div>
              <div className="text-xs text-muted-foreground">per year (Standard + Premium mix)</div>
            </div>
            <div className="p-4 bg-background rounded-lg border">
              <div className="text-sm text-muted-foreground">Attainable Accounts</div>
              <div className="text-3xl font-bold">194K</div>
              <div className="text-xs text-muted-foreground">paying households</div>
            </div>
            <div className="p-4 bg-primary text-primary-foreground rounded-lg">
              <div className="text-sm opacity-90">ARR Potential</div>
              <div className="text-3xl font-bold">~$23M</div>
              <div className="text-xs opacity-90">achievable with &lt;0.5% penetration</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Target Demographics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChart className="w-5 h-5" />
            Target Demographics (Who Buys First)
          </CardTitle>
          <CardDescription>Demographic groupings mapped to product value props</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold flex items-center gap-2">
                Older Households / Legacy Planning
                <Badge variant="outline">61.2M age 65+</Badge>
              </h4>
              <p className="text-sm text-muted-foreground mt-2">
                "Legacy Locker," simplified access for spouse/kids, paid storage, peace-of-mind.
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold flex items-center gap-2">
                People Living Alone
                <Badge variant="outline">38.5M households</Badge>
              </h4>
              <p className="text-sm text-muted-foreground mt-2">
                Fewer "built-in helpers," higher need for structured checklist + emergency readiness + shared access.
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold flex items-center gap-2">
                Home Buyers/Sellers
                <Badge variant="outline">3.95M SAAR</Badge>
              </h4>
              <p className="text-sm text-muted-foreground mt-2">
                Closing gifts, moving-risk messaging, instant onboarding moment.
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold flex items-center gap-2">
                Small Business Owners
                <Badge variant="outline">36.2M businesses</Badge>
              </h4>
              <p className="text-sm text-muted-foreground mt-2">
                Equipment, receipts, insurance documentation, continuity planning.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Revenue Streams */}
      <Card>
        <CardHeader>
          <CardTitle>Complete Revenue Map</CardTitle>
          <CardDescription>All revenue stream areas for Asset Safe</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Subscription */}
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold text-primary mb-2">A) Subscription Revenue</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• B2C household subscriptions</li>
                <li>• Storage-based add-ons</li>
                <li>• Seat-based add-ons</li>
                <li>• Vault / Legacy Locker add-on</li>
                <li>• Business subscriptions</li>
              </ul>
            </div>

            {/* Transactional */}
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold text-primary mb-2">B) Transactional Revenue</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Verified Inventory Package</li>
                <li>• Claim-ready report generation</li>
                <li>• Property onboarding package</li>
                <li>• Moving kit</li>
              </ul>
            </div>

            {/* B2B/Enterprise */}
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold text-primary mb-2">C) B2B / Enterprise</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• White-label programs</li>
                <li>• Employer benefits</li>
                <li>• Insurance/restoration agreements</li>
              </ul>
            </div>

            {/* Channel */}
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold text-primary mb-2">D) Channel Revenue</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Agent closing-gift bundles</li>
                <li>• Affiliate/referral revenue</li>
                <li>• Retail activation</li>
              </ul>
            </div>

            {/* API/Platform */}
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold text-primary mb-2">E) API / Platform</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• API access fees</li>
                <li>• Usage-based pricing</li>
                <li>• Verification badge as a service</li>
              </ul>
            </div>

            {/* Data Products */}
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold text-primary mb-2">F) Data Products</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Valuation reports</li>
                <li>• Underwriting/claims scoring</li>
                <li>• Portfolio analytics for SMBs</li>
              </ul>
            </div>

            {/* Professional Services */}
            <div className="p-4 border rounded-lg col-span-full md:col-span-1">
              <h4 className="font-semibold text-primary mb-2">G) Professional Services</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• On-site capture network</li>
                <li>• Concierge onboarding</li>
                <li>• Training & implementation</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Reference */}
      <Card className="bg-muted/50">
        <CardHeader>
          <CardTitle>Quick "Plug-In" TAM Lines</CardTitle>
          <CardDescription>Ready-to-use metrics for decks and pitches</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <div className="text-center p-3 bg-background rounded-lg border">
              <div className="text-lg font-bold">~134.8M</div>
              <div className="text-xs text-muted-foreground">Household TAM</div>
            </div>
            <div className="text-center p-3 bg-background rounded-lg border">
              <div className="text-lg font-bold">~88.0M</div>
              <div className="text-xs text-muted-foreground">Homeowner TAM</div>
            </div>
            <div className="text-center p-3 bg-background rounded-lg border">
              <div className="text-lg font-bold">~46.8M</div>
              <div className="text-xs text-muted-foreground">Renter TAM</div>
            </div>
            <div className="text-center p-3 bg-background rounded-lg border">
              <div className="text-lg font-bold">~1.45M</div>
              <div className="text-xs text-muted-foreground">REALTORS® Channel</div>
            </div>
            <div className="text-center p-3 bg-background rounded-lg border">
              <div className="text-lg font-bold">36.2M</div>
              <div className="text-xs text-muted-foreground">SMB TAM</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* One-Slide Summary */}
      <Card className="border-2 border-primary">
        <CardHeader className="bg-primary text-primary-foreground rounded-t-lg">
          <CardTitle className="text-center">One-Slide Summary (Deck Version)</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <h3 className="text-2xl font-bold">Asset Safe Market Opportunity (U.S.)</h3>
            <div className="grid md:grid-cols-4 gap-4 mt-6">
              <div className="p-4 bg-muted rounded-lg">
                <div className="text-sm text-muted-foreground">TAM</div>
                <div className="text-2xl font-bold text-primary">134.8M</div>
                <div className="text-xs text-muted-foreground">households</div>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <div className="text-sm text-muted-foreground">SAM</div>
                <div className="text-2xl font-bold text-blue-500">35.2M</div>
                <div className="text-xs text-muted-foreground">subscription-ready</div>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <div className="text-sm text-muted-foreground">SOM (5yr)</div>
                <div className="text-2xl font-bold text-green-500">~194K</div>
                <div className="text-xs text-muted-foreground">attainable accounts</div>
              </div>
              <div className="p-4 bg-primary text-primary-foreground rounded-lg">
                <div className="text-sm opacity-90">ARR Potential</div>
                <div className="text-2xl font-bold">~$23M</div>
                <div className="text-xs opacity-90">at modest adoption</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sources */}
      <Card>
        <CardHeader>
          <CardTitle>Data Sources</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <a href="https://fred.stlouisfed.org/series/TTLHH" target="_blank" rel="noopener noreferrer" 
               className="flex items-center gap-2 text-primary hover:underline">
              <ExternalLink className="w-4 h-4" />
              FRED Household Count
            </a>
            <a href="https://www.nar.realtor/magazine/real-estate-news/nar-membership-remains-above-forecast" target="_blank" rel="noopener noreferrer"
               className="flex items-center gap-2 text-primary hover:underline">
              <ExternalLink className="w-4 h-4" />
              NAR Membership Data
            </a>
            <a href="https://www.ibisworld.com/united-states/industry/damage-restoration-services/6278/" target="_blank" rel="noopener noreferrer"
               className="flex items-center gap-2 text-primary hover:underline">
              <ExternalLink className="w-4 h-4" />
              IBISWorld Restoration Services
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MarketSizing;
