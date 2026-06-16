import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { RefreshCw, Mail, MailCheck, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

type ContactStatus = 'new' | 'in_review' | 'responded' | 'archived';
type EmailStatus = 'pending' | 'sent' | 'failed';

interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  telephone: string | null;
  hear_about_us: string | null;
  message: string;
  status: ContactStatus;
  email_status: EmailStatus;
  resend_id: string | null;
  email_error: string | null;
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
}

interface ContactSubmissionsTable {
  select: (columns: string) => {
    order: (column: string, options: { ascending: boolean }) => {
      limit: (count: number) => Promise<{ data: ContactSubmission[] | null; error: Error | null }>;
    };
  };
  update: (patch: Partial<ContactSubmission>) => {
    eq: (column: 'id', value: string) => Promise<{ error: Error | null }>;
  };
}

const contactSubmissionsTable = () =>
  (supabase.from as unknown as (table: 'contact_submissions') => ContactSubmissionsTable)('contact_submissions');

const statusLabel: Record<ContactStatus, string> = {
  new: 'New',
  in_review: 'In Review',
  responded: 'Responded',
  archived: 'Archived',
};

const statusVariant = (status: ContactStatus) => {
  if (status === 'new') return 'default';
  if (status === 'responded') return 'secondary';
  if (status === 'archived') return 'outline';
  return 'destructive';
};

const emailStatusIcon = (status: EmailStatus) => {
  if (status === 'sent') return <MailCheck className="h-4 w-4 text-green-600" />;
  if (status === 'failed') return <AlertCircle className="h-4 w-4 text-destructive" />;
  return <Mail className="h-4 w-4 text-muted-foreground" />;
};

const AdminContactSubmissions: React.FC = () => {
  const [rows, setRows] = useState<ContactSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [notesDraft, setNotesDraft] = useState('');

  const selected = useMemo(
    () => rows.find((row) => row.id === selectedId) || rows[0] || null,
    [rows, selectedId],
  );

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await contactSubmissionsTable()
      .select('id, name, email, telephone, hear_about_us, message, status, email_status, resend_id, email_error, admin_notes, created_at, updated_at')
      .order('created_at', { ascending: false })
      .limit(250);

    if (error) {
      toast.error('Failed to load contact submissions');
    } else {
      const nextRows = (data || []) as ContactSubmission[];
      setRows(nextRows);
      setSelectedId((current) => {
        if (current && nextRows.some((row) => row.id === current)) return current;
        return nextRows[0]?.id || null;
      });
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (selected) setNotesDraft(selected.admin_notes || '');
  }, [selected]);

  const updateSubmission = useCallback(async (id: string, patch: Partial<ContactSubmission>) => {
    setSavingId(id);
    const { error } = await contactSubmissionsTable()
      .update(patch)
      .eq('id', id);

    if (error) {
      toast.error('Failed to update contact submission');
    } else {
      setRows((prev) => prev.map((row) => (row.id === id ? { ...row, ...patch } : row)));
      toast.success('Contact submission updated');
    }
    setSavingId(null);
  }, []);

  const newCount = rows.filter((row) => row.status === 'new').length;
  const failedEmailCount = rows.filter((row) => row.email_status === 'failed').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold">Contact Intake</h2>
          <p className="text-sm text-muted-foreground">
            General Contact Us submissions from getassetsafe.com/contact.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={load} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Total Submissions</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-bold">{rows.length}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">New</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-bold">{newCount}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Email Failures</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-bold">{failedEmailCount}</CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>General Contact Messages</CardTitle>
            <CardDescription>
              Email delivery is handled by the send-contact-email Edge Function and sent to support@assetsafe.net.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="py-8 text-center text-muted-foreground">Loading...</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Received</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Email</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((row) => (
                    <TableRow
                      key={row.id}
                      className={`cursor-pointer ${selected?.id === row.id ? 'bg-muted/60' : ''}`}
                      onClick={() => setSelectedId(row.id)}
                    >
                      <TableCell className="whitespace-nowrap text-sm">
                        {new Date(row.created_at).toLocaleString()}
                      </TableCell>
                      <TableCell className="font-medium">{row.name}</TableCell>
                      <TableCell>{row.email}</TableCell>
                      <TableCell>
                        <Badge variant={statusVariant(row.status)}>{statusLabel[row.status]}</Badge>
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center gap-2">
                          {emailStatusIcon(row.email_status)}
                          {row.email_status}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                  {rows.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                        No contact submissions yet.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Message Detail</CardTitle>
            <CardDescription>Select a message to review and track response status.</CardDescription>
          </CardHeader>
          <CardContent>
            {!selected ? (
              <p className="text-sm text-muted-foreground">No message selected.</p>
            ) : (
              <div className="space-y-4">
                <div>
                  <Label className="text-xs text-muted-foreground">From</Label>
                  <p className="font-medium">{selected.name}</p>
                  <p className="text-sm">{selected.email}</p>
                  {selected.telephone && <p className="text-sm">{selected.telephone}</p>}
                </div>

                <div>
                  <Label className="text-xs text-muted-foreground">How they heard about us</Label>
                  <p className="text-sm">{selected.hear_about_us || 'Not provided'}</p>
                </div>

                <div>
                  <Label className="text-xs text-muted-foreground">Message</Label>
                  <div className="mt-1 rounded-md border bg-muted/30 p-3 text-sm whitespace-pre-wrap">
                    {selected.message}
                  </div>
                </div>

                <div>
                  <Label>Status</Label>
                  <Select
                    value={selected.status}
                    onValueChange={(value) => updateSubmission(selected.id, { status: value as ContactStatus })}
                    disabled={savingId === selected.id}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">New</SelectItem>
                      <SelectItem value="in_review">In Review</SelectItem>
                      <SelectItem value="responded">Responded</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Email delivery</Label>
                  <div className="mt-1 flex items-center gap-2 text-sm">
                    {emailStatusIcon(selected.email_status)}
                    <span>{selected.email_status}</span>
                  </div>
                  {selected.email_error && (
                    <p className="mt-1 text-xs text-destructive">{selected.email_error}</p>
                  )}
                  {selected.resend_id && (
                    <p className="mt-1 text-xs text-muted-foreground">Resend ID: {selected.resend_id}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="admin-notes">Admin notes</Label>
                  <Textarea
                    id="admin-notes"
                    value={notesDraft}
                    onChange={(event) => setNotesDraft(event.target.value)}
                    rows={5}
                    placeholder="Internal follow-up notes..."
                  />
                  <Button
                    className="mt-2 w-full"
                    size="sm"
                    onClick={() => updateSubmission(selected.id, { admin_notes: notesDraft })}
                    disabled={savingId === selected.id}
                  >
                    Save Notes
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminContactSubmissions;
