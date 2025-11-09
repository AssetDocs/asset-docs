
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DollarSign, Save, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

const incomeRanges = [
  { value: 'under-25k', label: 'Under $25,000' },
  { value: '25k-50k', label: '$25,000 - $50,000' },
  { value: '50k-75k', label: '$50,000 - $75,000' },
  { value: '75k-100k', label: '$75,000 - $100,000' },
  { value: '100k-150k', label: '$100,000 - $150,000' },
  { value: '150k-200k', label: '$150,000 - $200,000' },
  { value: '200k-300k', label: '$200,000 - $300,000' },
  { value: '300k-500k', label: '$300,000 - $500,000' },
  { value: 'over-500k', label: 'Over $500,000' },
];

const HouseholdIncomeSection: React.FC = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [inputMethod, setInputMethod] = useState<'manual' | 'range'>('range');
  const [manualIncome, setManualIncome] = useState('');
  const [selectedRange, setSelectedRange] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [savedIncome, setSavedIncome] = useState<string | null>(null);

  useEffect(() => {
    const fetchSavedIncome = async () => {
      if (!user) return;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('household_income')
        .eq('user_id', user.id)
        .single();
      
      if (data?.household_income) {
        setSavedIncome(data.household_income);
      }
    };
    
    fetchSavedIncome();
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    
    setIsLoading(true);
    
    // Validate input
    if (inputMethod === 'manual' && !manualIncome) {
      toast({
        title: "Validation Error",
        description: "Please enter your household income.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }
    
    if (inputMethod === 'range' && !selectedRange) {
      toast({
        title: "Validation Error",
        description: "Please select an income range.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    try {
      const incomeValue = inputMethod === 'manual' ? `$${parseInt(manualIncome).toLocaleString()}` : selectedRange;
      
      const { error } = await supabase
        .from('profiles')
        .update({ household_income: incomeValue })
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      setSavedIncome(incomeValue);
      
      toast({
        title: "Household Income Updated",
        description: "Your household income information has been successfully saved.",
      });
      
      // Reset form
      setManualIncome('');
      setSelectedRange('');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save household income. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (value: string) => {
    const numValue = value.replace(/[^\d]/g, '');
    if (!numValue) return '';
    
    const formatted = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(parseInt(numValue));
    
    return formatted;
  };

  const handleManualIncomeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const numericValue = value.replace(/[^\d]/g, '');
    setManualIncome(numericValue);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-brand-blue" />
          Household Income
        </CardTitle>
        <CardDescription>
          Help us better understand your financial profile by providing your total household income
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {savedIncome && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
            <div>
              <p className="font-semibold text-green-900">Saved Income</p>
              <p className="text-sm text-green-700">
                {incomeRanges.find(r => r.value === savedIncome)?.label || savedIncome}
              </p>
            </div>
          </div>
        )}

        <div className="space-y-4">
          <Label className="text-base font-medium">How would you like to provide your income?</Label>
          
          <div className="flex gap-4">
            <Button
              type="button"
              variant={inputMethod === 'range' ? 'default' : 'outline'}
              onClick={() => setInputMethod('range')}
              className="flex-1"
            >
              Select Range
            </Button>
            <Button
              type="button"
              variant={inputMethod === 'manual' ? 'default' : 'outline'}
              onClick={() => setInputMethod('manual')}
              className="flex-1"
            >
              Enter Manually
            </Button>
          </div>
        </div>

        {inputMethod === 'range' && (
          <div className="space-y-2">
            <Label htmlFor="income-range">Select Income Range</Label>
            <Select value={selectedRange} onValueChange={setSelectedRange}>
              <SelectTrigger id="income-range">
                <SelectValue placeholder="Choose your household income range" />
              </SelectTrigger>
              <SelectContent>
                {incomeRanges.map((range) => (
                  <SelectItem key={range.value} value={range.value}>
                    {range.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {inputMethod === 'manual' && (
          <div className="space-y-2">
            <Label htmlFor="manual-income">Enter Annual Household Income</Label>
            <div className="relative">
              <Input
                id="manual-income"
                type="text"
                placeholder="Enter your annual income"
                value={formatCurrency(manualIncome)}
                onChange={handleManualIncomeChange}
                className="pl-8"
              />
              <DollarSign className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
            </div>
            <p className="text-sm text-gray-500">
              Enter your total household income before taxes
            </p>
          </div>
        )}

        <Button onClick={handleSave} disabled={isLoading} className="w-full">
          <Save className="h-4 w-4 mr-2" />
          {isLoading ? 'Saving...' : 'Save Household Income'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default HouseholdIncomeSection;