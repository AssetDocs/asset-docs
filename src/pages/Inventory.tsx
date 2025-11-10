import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Search, Package, DollarSign, FileText, Eye, Plus } from 'lucide-react';
import { ItemService, Item } from '@/services/ItemService';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';
import ReceiptUpload from '@/components/ReceiptUpload';
import ItemReceiptsSection from '@/components/ItemReceiptsSection';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useNavigate, useSearchParams } from 'react-router-dom';
import ManualEntrySection from '@/components/ManualEntrySection';

const Inventory: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [receiptRefresh, setReceiptRefresh] = useState(0);
  const [showManualEntry, setShowManualEntry] = useState(false);

  useEffect(() => {
    if (searchParams.get('mode') === 'manual') {
      setShowManualEntry(true);
    }
  }, [searchParams]);

  useEffect(() => {
    if (user?.id) {
      loadItems();
    }
  }, [user]);

  const loadItems = async () => {
    if (!user?.id) return;
    
    try {
      const itemData = await ItemService.getUserItems(user.id);
      setItems(itemData);
    } catch (error) {
      console.error('Error loading items:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.location?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const categories = [...new Set(items.map(item => item.category).filter(Boolean))];
  const totalValue = filteredItems.reduce((sum, item) => sum + (item.estimated_value || 0), 0);

  const handleReceiptUploaded = () => {
    setReceiptRefresh(prev => prev + 1);
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Please log in to view your inventory.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground">My Inventory</h1>
              <p className="text-muted-foreground mt-2">
                Manage your items and their documentation
              </p>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => setShowManualEntry(!showManualEntry)} variant="outline" className="flex items-center">
                <Plus className="h-4 w-4 mr-2" />
                {showManualEntry ? 'Hide Manual Entry' : 'Manual Entry'}
              </Button>
              <Button onClick={() => navigate('/photo-upload')} className="flex items-center">
                <Plus className="h-4 w-4 mr-2" />
                Add Items
              </Button>
            </div>
          </div>

          {showManualEntry && (
            <div className="mb-6">
              <ManualEntrySection />
            </div>
          )}

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Package className="h-8 w-8 text-primary" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-muted-foreground">Total Items</p>
                    <p className="text-2xl font-bold">{filteredItems.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <DollarSign className="h-8 w-8 text-green-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-muted-foreground">Total Value</p>
                    <p className="text-2xl font-bold">${totalValue.toLocaleString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <FileText className="h-8 w-8 text-blue-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-muted-foreground">Categories</p>
                    <p className="text-2xl font-bold">{categories.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category!}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Items Grid */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading your inventory...</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Package className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No items found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || categoryFilter !== 'all' 
                  ? "Try adjusting your search or filters" 
                  : "Start by adding your first item to begin building your inventory"}
              </p>
              <Button onClick={() => navigate('/photo-upload')}>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Item
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item) => (
              <Card key={item.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-semibold text-lg mb-2">{item.name}</h3>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {item.category && (
                          <Badge variant="secondary">{item.category}</Badge>
                        )}
                        {item.ai_generated && (
                          <Badge variant="outline" className="text-xs">AI</Badge>
                        )}
                      </div>
                    </div>
                    {item.photo_url && (
                      <img 
                        src={item.photo_url} 
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded-md"
                      />
                    )}
                  </div>

                  {item.description && (
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                      {item.description}
                    </p>
                  )}

                  <div className="space-y-2 text-sm">
                    {item.estimated_value && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Value:</span>
                        <span className="font-medium">${item.estimated_value}</span>
                      </div>
                    )}
                    {item.location && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Location:</span>
                        <span>{item.location}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Added:</span>
                      <span>{format(new Date(item.created_at), 'MMM d, yyyy')}</span>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-full"
                          onClick={() => setSelectedItem(item)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View Details & Receipts
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle className="flex items-center">
                            <Package className="h-5 w-5 mr-2" />
                            {selectedItem?.name}
                          </DialogTitle>
                          <DialogDescription>
                            Item details and receipt management
                          </DialogDescription>
                        </DialogHeader>
                        
                        {selectedItem && (
                          <div className="space-y-6">
                            {/* Item Details */}
                            <Card>
                              <CardHeader>
                                <CardTitle className="text-lg">Item Information</CardTitle>
                              </CardHeader>
                              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <h4 className="font-medium mb-2">Details</h4>
                                  <div className="space-y-2 text-sm">
                                    <div><strong>Category:</strong> {selectedItem.category || 'N/A'}</div>
                                    <div><strong>Type:</strong> {selectedItem.item_type || 'N/A'}</div>
                                    <div><strong>Location:</strong> {selectedItem.location || 'N/A'}</div>
                                    <div><strong>Value:</strong> ${selectedItem.estimated_value || 0}</div>
                                  </div>
                                </div>
                                {selectedItem.photo_url && (
                                  <div>
                                    <h4 className="font-medium mb-2">Photo</h4>
                                    <img 
                                      src={selectedItem.photo_url} 
                                      alt={selectedItem.name}
                                      className="w-full h-32 object-cover rounded-md"
                                    />
                                  </div>
                                )}
                              </CardContent>
                            </Card>

                            {/* Receipts Section */}
                            <ItemReceiptsSection 
                              itemId={selectedItem.id} 
                              refreshTrigger={receiptRefresh}
                            />

                            {/* Upload Receipt */}
                            <ReceiptUpload
                              itemId={selectedItem.id}
                              userId={user.id}
                              onReceiptUploaded={handleReceiptUploaded}
                            />
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Inventory;