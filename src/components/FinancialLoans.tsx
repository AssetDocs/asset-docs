import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Landmark, Pencil, Trash2, FolderPlus, Folder } from 'lucide-react';
import DeleteConfirmationDialog from '@/components/DeleteConfirmationDialog';

interface Loan {
  id: string;
  loan_type: string | null;
  institution: string | null;
  loan_terms: string | null;
  total_amount: number | null;
  apr: number | null;
  monthly_payment: number | null;
  start_date: string | null;
  maturity_date: string | null;
  account_number: string | null;
  notes: string | null;
  file_name: string | null;
  file_path: string | null;
  file_size: number | null;
  file_type: string | null;
  status: string;
  folder_id: string | null;
  created_at: string;
}

interface LoanFolder {
  id: string;
  folder_name: string;
}

const LOAN_TYPES = ['Mortgage', 'Auto', 'Personal', 'Student', 'Business', 'Home Equity', 'Other'];

const FinancialLoans: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  const [loans, setLoans] = useState<Loan[]>([]);
  const [folders, setFolders] = useState<LoanFolder[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<Loan | null>(null);
  const [showFolderForm, setShowFolderForm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Loan | null>(null);

  // Form state
  const [loanType, setLoanType] = useState('');
  const [institution, setInstitution] = useState('');
  const [loanTerms, setLoanTerms] = useState('');
  const [totalAmount, setTotalAmount] = useState('');
  const [apr, setApr] = useState('');
  const [monthlyPayment, setMonthlyPayment] = useState('');
  const [startDate, setStartDate] = useState('');
  const [maturityDate, setMaturityDate] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState('active');
  const [file, setFile] = useState<File | null>(null);
  const [folderName, setFolderName] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    if (!user) return;
    setLoading(true);
    const [fRes, lRes] = await Promise.all([
      supabase.from('financial_loan_folders').select('*').eq('user_id', user.id).order('display_order'),
      supabase.from('financial_loans').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
    ]);
    if (fRes.data) setFolders(fRes.data);
    if (lRes.data) setLoans(lRes.data);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [user]);

  const resetForm = () => {
    setLoanType(''); setInstitution(''); setLoanTerms(''); setTotalAmount('');
    setApr(''); setMonthlyPayment(''); setStartDate(''); setMaturityDate('');
    setAccountNumber(''); setNotes(''); setStatus('active'); setFile(null);
  };

  const openAdd = () => { setEditingItem(null); resetForm(); setShowForm(true); };

  const openEdit = (item: Loan) => {
    setEditingItem(item);
    setLoanType(item.loan_type || '');
    setInstitution(item.institution || '');
    setLoanTerms(item.loan_terms || '');
    setTotalAmount(item.total_amount != null ? String(item.total_amount) : '');
    setApr(item.apr != null ? String(item.apr) : '');
    setMonthlyPayment(item.monthly_payment != null ? String(item.monthly_payment) : '');
    setStartDate(item.start_date || '');
    setMaturityDate(item.maturity_date || '');
    setAccountNumber(item.account_number || '');
    setNotes(item.notes || '');
    setStatus(item.status);
    setFile(null);
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    let filePath = editingItem?.file_path || null;
    let fileName = editingItem?.file_name || null;
    let fileSize = editingItem?.file_size || null;
    let fileType = editingItem?.file_type || null;

    if (file) {
      const ext = file.name.split('.').pop();
      const path = `${user.id}/financial-loans/${Date.now()}.${ext}`;
      const { error: uploadErr } = await supabase.storage.from('documents').upload(path, file);
      if (uploadErr) {
        toast({ title: 'Upload failed', description: uploadErr.message, variant: 'destructive' });
        setSaving(false);
        return;
      }
      filePath = path; fileName = file.name; fileSize = file.size; fileType = file.type;
    }

    const payload = {
      user_id: user.id,
      loan_type: loanType || null,
      institution: institution.trim() || null,
      loan_terms: loanTerms.trim() || null,
      total_amount: totalAmount ? Number(totalAmount) : null,
      apr: apr ? Number(apr) : null,
      monthly_payment: monthlyPayment ? Number(monthlyPayment) : null,
      start_date: startDate || null,
      maturity_date: maturityDate || null,
      account_number: accountNumber.trim() || null,
      notes: notes.trim() || null,
      status,
      folder_id: selectedFolder || null,
      file_name: fileName,
      file_path: filePath,
      file_size: fileSize,
      file_type: fileType,
    };

    if (editingItem) {
      const { error } = await supabase.from('financial_loans').update(payload).eq('id', editingItem.id);
      if (error) toast({ title: 'Error', description: error.message, variant: 'destructive' });
      else toast({ title: 'Loan updated' });
    } else {
      const { error } = await supabase.from('financial_loans').insert(payload);
      if (error) toast({ title: 'Error', description: error.message, variant: 'destructive' });
      else toast({ title: 'Loan saved' });
    }

    setSaving(false);
    setShowForm(false);
    fetchData();
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    if (deleteTarget.file_path) {
      await supabase.storage.from('documents').remove([deleteTarget.file_path]);
    }
    await supabase.from('financial_loans').delete().eq('id', deleteTarget.id);
    toast({ title: 'Deleted' });
    setDeleteTarget(null);
    fetchData();
  };

  const handleAddFolder = async () => {
    if (!user || !folderName.trim()) return;
    await supabase.from('financial_loan_folders').insert({ user_id: user.id, folder_name: folderName.trim() });
    setFolderName('');
    setShowFolderForm(false);
    fetchData();
  };

  const fmt = (n: number | null) => n != null ? `$${Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '—';

  const filtered = selectedFolder ? loans.filter(l => l.folder_id === selectedFolder) : loans;

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Financial Loans</h2>
        <p className="text-muted-foreground text-sm mt-1">Track and organize your loans and associated documents.</p>
      </div>

      <Button onClick={openAdd} className="w-full bg-brand-blue hover:bg-brand-blue/90 text-white">
        <Plus className="h-4 w-4 mr-2" /> Add Loan
      </Button>

      {/* Folders */}
      <div className="flex flex-wrap gap-2 items-center">
        <Button variant={!selectedFolder ? 'default' : 'outline'} size="sm" onClick={() => setSelectedFolder(null)}>All</Button>
        {folders.map(f => (
          <Button key={f.id} variant={selectedFolder === f.id ? 'default' : 'outline'} size="sm" onClick={() => setSelectedFolder(f.id)}>
            <Folder className="h-3 w-3 mr-1" /> {f.folder_name}
          </Button>
        ))}
        <Button variant="ghost" size="sm" onClick={() => setShowFolderForm(true)}>
          <FolderPlus className="h-4 w-4 mr-1" /> New Folder
        </Button>
      </div>

      {/* List */}
      {loading ? (
        <p className="text-sm text-muted-foreground">Loading...</p>
      ) : filtered.length === 0 ? (
        <Card><CardContent className="py-8 text-center text-muted-foreground text-sm">No loans yet. Click "Add Loan" to get started.</CardContent></Card>
      ) : (
        <div className="grid gap-3">
          {filtered.map(item => (
            <Card key={item.id} className="hover:shadow-md transition-shadow">
              <CardContent className="py-4 flex items-start gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-emerald-50 flex-shrink-0">
                  <Landmark className="h-5 w-5 text-emerald-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-foreground">{item.institution || 'Untitled Loan'}</p>
                  <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-muted-foreground mt-1">
                    {item.loan_type && <span>Type: {item.loan_type}</span>}
                    {item.total_amount != null && <span>Amount: {fmt(item.total_amount)}</span>}
                    {item.apr != null && <span>APR: {item.apr}%</span>}
                    {item.monthly_payment != null && <span>Monthly: {fmt(item.monthly_payment)}</span>}
                  </div>
                  {item.loan_terms && <p className="text-xs text-muted-foreground mt-0.5">Terms: {item.loan_terms}</p>}
                  {item.file_name && <p className="text-xs text-muted-foreground mt-1">📎 {item.file_name}</p>}
                  <span className={`inline-block mt-1 text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded ${item.status === 'active' ? 'bg-emerald-100 text-emerald-700' : item.status === 'paid_off' ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'}`}>
                    {item.status.replace('_', ' ')}
                  </span>
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(item)}><Pencil className="h-3.5 w-3.5" /></Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setDeleteTarget(item)}><Trash2 className="h-3.5 w-3.5" /></Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Form Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editingItem ? 'Edit Loan' : 'Add Loan'}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Loan Type</Label>
              <Select value={loanType} onValueChange={setLoanType}>
                <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                <SelectContent>{LOAN_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Institution</Label><Input value={institution} onChange={e => setInstitution(e.target.value)} placeholder="e.g. Chase, Wells Fargo" /></div>
            <div><Label>Terms</Label><Input value={loanTerms} onChange={e => setLoanTerms(e.target.value)} placeholder="e.g. 30-year fixed" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Total Amount ($)</Label><Input type="number" value={totalAmount} onChange={e => setTotalAmount(e.target.value)} placeholder="0.00" /></div>
              <div><Label>APR (%)</Label><Input type="number" step="0.01" value={apr} onChange={e => setApr(e.target.value)} placeholder="0.00" /></div>
            </div>
            <div><Label>Monthly Payment ($)</Label><Input type="number" value={monthlyPayment} onChange={e => setMonthlyPayment(e.target.value)} placeholder="0.00" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Start Date</Label><Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} /></div>
              <div><Label>Maturity Date</Label><Input type="date" value={maturityDate} onChange={e => setMaturityDate(e.target.value)} /></div>
            </div>
            <div><Label>Account Number</Label><Input value={accountNumber} onChange={e => setAccountNumber(e.target.value)} placeholder="Optional" /></div>
            <div>
              <Label>Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="paid_off">Paid Off</SelectItem>
                  <SelectItem value="defaulted">Defaulted</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div><Label>Notes</Label><Textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Any additional notes..." /></div>
            <div>
              <Label>Attachment</Label>
              <Input type="file" onChange={e => setFile(e.target.files?.[0] || null)} accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.jpg,.jpeg,.png,.webp,.txt" />
              {editingItem?.file_name && !file && <p className="text-xs text-muted-foreground mt-1">Current: {editingItem.file_name}</p>}
            </div>
            <Button onClick={handleSave} disabled={saving} className="w-full">
              {saving ? 'Saving...' : editingItem ? 'Update' : 'Save'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Folder Dialog */}
      <Dialog open={showFolderForm} onOpenChange={setShowFolderForm}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader><DialogTitle>Create Folder</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Folder Name</Label><Input value={folderName} onChange={e => setFolderName(e.target.value)} placeholder="e.g. Mortgage Documents" /></div>
            <Button onClick={handleAddFolder} disabled={!folderName.trim()} className="w-full">Create Folder</Button>
          </div>
        </DialogContent>
      </Dialog>

      <DeleteConfirmationDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Loan"
        description={`Are you sure you want to delete this loan record? This cannot be undone.`}
      />
    </div>
  );
};

export default FinancialLoans;
