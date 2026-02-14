import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { DollarSign, TrendingUp, Package, Home, ToggleLeft, ToggleRight, RefreshCw, FileText, ShoppingBag, Building } from 'lucide-react';
import { useAssetValues, AssetEntry } from '@/hooks/useAssetValues';
import { Skeleton } from '@/components/ui/skeleton';

const sourceIcon = (source: AssetEntry['source']) => {
  switch (source) {
    case 'property': return <Building className="h-4 w-4 text-emerald-600" />;
    case 'item': return <ShoppingBag className="h-4 w-4 text-sky-600" />;
    case 'file_value': return <FileText className="h-4 w-4 text-violet-600" />;
  }
};

const sourceLabel = (source: AssetEntry['source']) => {
  switch (source) {
    case 'property': return 'Real Estate';
    case 'item': return 'Inventory Item';
    case 'file_value': return 'Documented Value';
  }
};

const AssetValuesSection: React.FC = () => {
  const { entries, totalValue, summaryByCategory, isLoading, refresh } = useAssetValues();
  const [viewMode, setViewMode] = useState<'summary' | 'itemized'>('summary');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refresh();
    setIsRefreshing(false);
  };

  const realEstateTotal = summaryByCategory.find(s => s.category === 'Real Estate')?.totalValue || 0;
  const personalAssetsTotal = totalValue - realEstateTotal;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-4 w-1/2 mb-2" />
                <Skeleton className="h-8 w-3/4" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Controls */}
      <div className="flex flex-wrap justify-between items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={isRefreshing}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
          {isRefreshing ? 'Refreshing...' : 'Refresh'}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            const isOnSampleDashboard = window.location.pathname === '/sample-dashboard';
            if (isOnSampleDashboard) {
              alert('Asset Safe says\n\nDemo: This toggles between category summary and itemized list view.');
              return;
            }
            setViewMode(viewMode === 'summary' ? 'itemized' : 'summary');
          }}
          className="flex items-center gap-2"
        >
          {viewMode === 'itemized' ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />}
          {viewMode === 'itemized' ? 'Show Category Summary' : 'Show Itemized List'}
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-brand-blue" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Total Asset Value</p>
                <p className="text-2xl font-bold">${totalValue.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Home className="h-8 w-8 text-brand-blue" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Real Estate Value</p>
                <p className="text-2xl font-bold">${realEstateTotal.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Package className="h-8 w-8 text-brand-blue" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Personal Assets</p>
                <p className="text-2xl font-bold">${personalAssetsTotal.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-brand-blue" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Total Entries</p>
                <p className="text-2xl font-bold">{entries.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Category Summary View */}
      {viewMode === 'summary' && (
        <Card>
          <CardHeader>
            <CardTitle>Asset Breakdown by Category</CardTitle>
            <CardDescription>
              Accumulated values across all properties, inventory items, and documented file values
            </CardDescription>
          </CardHeader>
          <CardContent>
            {summaryByCategory.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No asset values found. Add estimated values to your properties, items, or file uploads.
              </p>
            ) : (
              <div className="space-y-3">
                {summaryByCategory.map((cat) => (
                  <div key={cat.category} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div
                        className="w-4 h-4 rounded-full shrink-0"
                        style={{ backgroundColor: cat.color }}
                      />
                      <span className="font-medium">{cat.category}</span>
                      <Badge variant="secondary" className="text-xs">
                        {cat.count} {cat.count === 1 ? 'entry' : 'entries'}
                      </Badge>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">${cat.totalValue.toLocaleString()}</p>
                      <p className="text-sm text-muted-foreground">
                        {totalValue > 0 ? ((cat.totalValue / totalValue) * 100).toFixed(1) : 0}% of total
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Itemized List View */}
      {viewMode === 'itemized' && (
        <Card>
          <CardHeader>
            <CardTitle>Itemized Asset List</CardTitle>
            <CardDescription>
              Every individual asset entry with its value and source
            </CardDescription>
          </CardHeader>
          <CardContent>
            {entries.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No asset values found. Add estimated values to your properties, items, or file uploads.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Asset Name</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Source</TableHead>
                      <TableHead className="text-right">Value</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {entries
                      .sort((a, b) => b.value - a.value)
                      .map((entry) => (
                        <TableRow key={entry.id}>
                          <TableCell>
                            <div>
                              <span className="font-medium">{entry.name}</span>
                              {entry.parentName && (
                                <p className="text-xs text-muted-foreground mt-0.5">
                                  From: {entry.parentName}
                                </p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{entry.category}</Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1.5">
                              {sourceIcon(entry.source)}
                              <span className="text-sm text-muted-foreground">{sourceLabel(entry.source)}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right font-semibold">
                            ${entry.value.toLocaleString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    {/* Totals Row */}
                    <TableRow className="border-t-2 bg-muted/50">
                      <TableCell colSpan={3} className="font-bold">
                        Total ({entries.length} entries)
                      </TableCell>
                      <TableCell className="text-right font-bold text-lg">
                        ${totalValue.toLocaleString()}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AssetValuesSection;
