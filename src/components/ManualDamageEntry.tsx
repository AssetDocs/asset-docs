import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import PropertySelector from '@/components/PropertySelector';
import { AlertTriangle, Plus, Save } from 'lucide-react';

interface ManualDamageEntry {
  id: string;
  name: string;
  description: string;
  location: string;
  damageType: string;
  severity: 'minor' | 'moderate' | 'severe';
  propertyId: string;
  dateOccurred: string;
  estimatedCost: string;
}

const ManualDamageEntry: React.FC = () => {
  const [damageEntries, setDamageEntries] = useState<ManualDamageEntry[]>([]);
  const [showNewEntry, setShowNewEntry] = useState(false);
  const [newEntry, setNewEntry] = useState<ManualDamageEntry>({
    id: '',
    name: '',
    description: '',
    location: '',
    damageType: '',
    severity: 'moderate',
    propertyId: '',
    dateOccurred: new Date().toISOString().split('T')[0],
    estimatedCost: ''
  });

  const damageTypes = [
    'Water Damage',
    'Fire Damage',
    'Storm Damage',
    'Structural Damage',
    'Vandalism',
    'Break-in',
    'Appliance Failure',
    'Plumbing Issues',
    'Electrical Issues',
    'HVAC Issues',
    'Roof Damage',
    'Foundation Issues',
    'Other'
  ];

  const handleAddEntry = () => {
    if (newEntry.name && newEntry.damageType && newEntry.propertyId) {
      const entry = {
        ...newEntry,
        id: Date.now().toString() + Math.random().toString()
      };
      setDamageEntries([...damageEntries, entry]);
      setNewEntry({
        id: '',
        name: '',
        description: '',
        location: '',
        damageType: '',
        severity: 'moderate',
        propertyId: '',
        dateOccurred: new Date().toISOString().split('T')[0],
        estimatedCost: ''
      });
      setShowNewEntry(false);
      console.log('Manual damage entry added:', entry);
    }
  };

  const removeEntry = (id: string) => {
    setDamageEntries(entries => entries.filter(entry => entry.id !== id));
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'minor': return 'bg-yellow-100 text-yellow-800';
      case 'moderate': return 'bg-orange-100 text-orange-800';
      case 'severe': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <AlertTriangle className="h-5 w-5 mr-2 text-red-600" />
          Manual Damage Entry
        </CardTitle>
        <CardDescription>
          Record damage details without uploading photos or videos
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add New Entry Button */}
        {!showNewEntry && (
          <Button 
            onClick={() => setShowNewEntry(true)}
            className="w-full bg-red-600 hover:bg-red-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Manual Damage Entry
          </Button>
        )}

        {/* New Entry Form */}
        {showNewEntry && (
          <Card className="border-red-200">
            <CardHeader>
              <CardTitle className="text-lg">New Damage Entry</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Property</Label>
                  <PropertySelector
                    value={newEntry.propertyId}
                    onChange={(value) => setNewEntry({...newEntry, propertyId: value})}
                    placeholder="Select property"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Damage Title</Label>
                  <Input
                    value={newEntry.name}
                    onChange={(e) => setNewEntry({...newEntry, name: e.target.value})}
                    placeholder="Brief description of damage"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Damage Type</Label>
                  <Select 
                    value={newEntry.damageType} 
                    onValueChange={(value) => setNewEntry({...newEntry, damageType: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select damage type" />
                    </SelectTrigger>
                    <SelectContent>
                      {damageTypes.map((type) => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Severity</Label>
                  <Select 
                    value={newEntry.severity} 
                    onValueChange={(value) => setNewEntry({...newEntry, severity: value as 'minor' | 'moderate' | 'severe'})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="minor">Minor</SelectItem>
                      <SelectItem value="moderate">Moderate</SelectItem>
                      <SelectItem value="severe">Severe</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Location</Label>
                  <Input
                    value={newEntry.location}
                    onChange={(e) => setNewEntry({...newEntry, location: e.target.value})}
                    placeholder="Room/area"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Date Occurred</Label>
                  <Input
                    type="date"
                    value={newEntry.dateOccurred}
                    onChange={(e) => setNewEntry({...newEntry, dateOccurred: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Estimated Cost (Optional)</Label>
                  <Input
                    value={newEntry.estimatedCost}
                    onChange={(e) => setNewEntry({...newEntry, estimatedCost: e.target.value})}
                    placeholder="$0.00"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={newEntry.description}
                  onChange={(e) => setNewEntry({...newEntry, description: e.target.value})}
                  placeholder="Detailed description of the damage, cause, and any relevant information"
                  rows={3}
                />
              </div>

              <div className="flex gap-2">
                <Button onClick={handleAddEntry} className="bg-red-600 hover:bg-red-700">
                  <Save className="h-4 w-4 mr-2" />
                  Save Entry
                </Button>
                <Button 
                  onClick={() => setShowNewEntry(false)} 
                  variant="outline"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Existing Entries */}
        {damageEntries.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium">Manual Damage Entries ({damageEntries.length})</h4>
            <div className="space-y-3">
              {damageEntries.map((entry) => (
                <Card key={entry.id} className="border-l-4 border-l-red-500">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h5 className="font-medium">{entry.name}</h5>
                      <Button
                        onClick={() => removeEntry(entry.id)}
                        variant="destructive"
                        size="sm"
                        className="text-xs"
                      >
                        Remove
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-gray-600 mb-2">
                      <div>Type: {entry.damageType}</div>
                      <div>Location: {entry.location || 'Not specified'}</div>
                      <div>Date: {new Date(entry.dateOccurred).toLocaleDateString()}</div>
                      <div className="flex items-center">
                        Severity: <span className={`ml-1 px-2 py-1 rounded text-xs ${getSeverityColor(entry.severity)}`}>
                          {entry.severity}
                        </span>
                      </div>
                    </div>
                    {entry.estimatedCost && (
                      <div className="text-sm text-gray-600 mb-2">
                        Estimated Cost: {entry.estimatedCost}
                      </div>
                    )}
                    {entry.description && (
                      <p className="text-sm text-gray-700">{entry.description}</p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ManualDamageEntry;
