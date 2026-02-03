import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export type DevReleaseStatus = 'planned' | 'in_progress' | 'released' | 'rolled_back';

interface AddReleaseModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: {
    version: string;
    title: string;
    description?: string;
    release_date?: string;
    status?: DevReleaseStatus;
    key_changes?: string[];
    known_issues?: string[];
  }) => Promise<boolean>;
}

export const AddReleaseModal: React.FC<AddReleaseModalProps> = ({
  open,
  onOpenChange,
  onSubmit,
}) => {
  const [version, setVersion] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [releaseDate, setReleaseDate] = useState('');
  const [status, setStatus] = useState<DevReleaseStatus>('planned');
  const [keyChanges, setKeyChanges] = useState('');
  const [knownIssues, setKnownIssues] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!version.trim() || !title.trim()) return;

    setLoading(true);
    const success = await onSubmit({
      version: version.trim(),
      title: title.trim(),
      description: description.trim() || undefined,
      release_date: releaseDate || undefined,
      status,
      key_changes: keyChanges.split('\n').filter(Boolean),
      known_issues: knownIssues.split('\n').filter(Boolean),
    });

    if (success) {
      setVersion('');
      setTitle('');
      setDescription('');
      setReleaseDate('');
      setStatus('planned');
      setKeyChanges('');
      setKnownIssues('');
      onOpenChange(false);
    }
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Add Release</DialogTitle>
          <DialogDescription>
            Track a new release or changelog entry
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="version">Version *</Label>
                <Input
                  id="version"
                  placeholder="v1.2.0"
                  value={version}
                  onChange={(e) => setVersion(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={status} onValueChange={(v) => setStatus(v as DevReleaseStatus)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="planned">Planned</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="released">Released</SelectItem>
                    <SelectItem value="rolled_back">Rolled Back</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                placeholder="Dev Workspace Enhancements"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="release_date">Release Date</Label>
              <Input
                id="release_date"
                type="date"
                value={releaseDate}
                onChange={(e) => setReleaseDate(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Brief summary of this release..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="key_changes">Key Changes (one per line)</Label>
              <Textarea
                id="key_changes"
                placeholder="Added new feature X&#10;Fixed bug Y&#10;Improved performance Z"
                value={keyChanges}
                onChange={(e) => setKeyChanges(e.target.value)}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="known_issues">Known Issues (one per line)</Label>
              <Textarea
                id="known_issues"
                placeholder="Issue A still pending&#10;Workaround needed for B"
                value={knownIssues}
                onChange={(e) => setKnownIssues(e.target.value)}
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !version.trim() || !title.trim()}>
              {loading ? 'Adding...' : 'Add Release'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
