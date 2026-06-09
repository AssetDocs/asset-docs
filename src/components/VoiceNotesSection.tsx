// @ts-nocheck
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Mic, Square, Trash2, Play, Pause, Upload, FileText, X, Edit2, Lock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { getVaultKey, decryptBytes, encryptBytes } from '@/lib/vaultKey';

interface VoiceNote {
  id: string;
  title: string;
  description?: string;
  audio_url: string;
  audio_path: string;
  duration?: number;
  created_at: string;
  is_encrypted?: boolean;
  storage_bucket?: string;
  legacy_locker_id?: string | null;
}

interface VoiceNoteAttachment {
  id: string;
  voice_note_id: string;
  file_name: string;
  file_url: string;
  file_path: string;
  file_size: number;
  file_type: string;
  created_at: string;
  is_encrypted?: boolean;
  storage_bucket?: string;
  legacy_locker_id?: string | null;
}

export const VoiceNotesSection = () => {
  const [voiceNotes, setVoiceNotes] = useState<VoiceNote[]>([]);
  const [attachments, setAttachments] = useState<Record<string, VoiceNoteAttachment[]>>({});
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
  const [newNote, setNewNote] = useState({ title: '', description: '' });
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [editingFileName, setEditingFileName] = useState<string | null>(null);
  const [newFileName, setNewFileName] = useState('');
  const [lockerId, setLockerId] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user?.id) {
      fetchLocker();
      fetchVoiceNotes();
    }
  }, [user?.id]);

  const fetchLocker = async () => {
    try {
      const { data, error } = await supabase
        .from('legacy_locker')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();
      if (error) throw error;
      setLockerId(data?.id ?? null);
    } catch (err) {
      console.error('Error fetching locker:', err);
    }
  };

  const fetchAttachments = async (voiceNoteId: string) => {
    try {
      const { data, error } = await supabase
        .from('voice_note_attachments')
        .select('*')
        .eq('voice_note_id', voiceNoteId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAttachments(prev => ({ ...prev, [voiceNoteId]: data || [] }));
    } catch (error) {
      console.error('Error fetching attachments:', error);
    }
  };

  const fetchVoiceNotes = async () => {
    try {
      const { data, error } = await supabase
        .from('legacy_locker_voice_notes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setVoiceNotes(data || []);
      data?.forEach(note => fetchAttachments(note.id));
    } catch (error) {
      console.error('Error fetching voice notes:', error);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: Blob[] = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };
      recorder.onstop = () => {
        setAudioChunks(chunks);
        stream.getTracks().forEach(track => track.stop());
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
    } catch (error) {
      toast({ title: 'Error', description: 'Could not access microphone', variant: 'destructive' });
    }
  };

  const stopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      setIsRecording(false);
    }
  };

  const saveVoiceNote = async () => {
    if (!user || audioChunks.length === 0 || !newNote.title.trim()) {
      toast({ title: 'Error', description: 'Please add a title and record audio', variant: 'destructive' });
      return;
    }

    const vk = getVaultKey(user.id);
    if (!vk) {
      toast({
        title: 'Vault locked',
        description: 'Unlock your Legacy Locker before recording new voice notes.',
        variant: 'destructive',
      });
      return;
    }
    if (!lockerId) {
      toast({
        title: 'Setup required',
        description: 'Set up your Legacy Locker before recording voice notes.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
      const rawBytes = new Uint8Array(await audioBlob.arrayBuffer());

      // Encrypt with vault key, AAD bound to this locker.
      const encBytes = await encryptBytes(rawBytes, vk, `voice:${lockerId}`);
      const encBlob = new Blob([encBytes], { type: 'application/octet-stream' });

      // Locker-scoped path: legacy-locker/<owner>/<locker>/<filename>
      const fileName = `legacy-locker/${user.id}/${lockerId}/${Date.now()}-voice-note.webm.asv2`;

      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(fileName, encBlob, { contentType: 'application/octet-stream' });

      if (uploadError) throw uploadError;

      const { error: insertError } = await supabase
        .from('legacy_locker_voice_notes')
        .insert({
          user_id: user.id,
          legacy_locker_id: lockerId,
          title: newNote.title,
          description: newNote.description,
          audio_path: fileName,
          audio_url: '', // resolved on demand via signed URL + decryption
          file_size: encBlob.size,
          is_encrypted: true,
          storage_bucket: 'documents',
        });

      if (insertError) throw insertError;

      toast({ title: 'Success', description: 'Voice note saved (encrypted).' });
      setNewNote({ title: '', description: '' });
      setAudioChunks([]);
      fetchVoiceNotes();
    } catch (error) {
      console.error('Error saving voice note:', error);
      toast({ title: 'Error', description: 'Failed to save voice note', variant: 'destructive' });
    }
  };

  const deleteVoiceNote = async (id: string, audioPath: string, bucket: string = 'documents') => {
    try {
      if (audioPath) {
        await supabase.storage.from(bucket).remove([audioPath]);
      }
      const { error } = await supabase.from('legacy_locker_voice_notes').delete().eq('id', id);
      if (error) throw error;
      toast({ title: 'Success', description: 'Voice note deleted' });
      fetchVoiceNotes();
    } catch (error) {
      console.error('Error deleting voice note:', error);
      toast({ title: 'Error', description: 'Failed to delete voice note', variant: 'destructive' });
    }
  };

  // Resolve a playable URL on demand: fetch (signed if private) and decrypt if encrypted.
  const resolvePlayableUrl = async (note: VoiceNote): Promise<string | null> => {
    try {
      const bucket = note.storage_bucket || 'documents';
      if (!note.is_encrypted) {
        // Legacy plaintext audio: use signed URL directly.
        if (note.audio_url && note.audio_url.startsWith('http')) return note.audio_url;
        const { data, error } = await supabase.storage.from(bucket).createSignedUrl(note.audio_path, 3600);
        if (error) throw error;
        return data.signedUrl;
      }
      const vk = getVaultKey(user!.id);
      if (!vk) {
        toast({ title: 'Vault locked', description: 'Unlock your vault to play encrypted voice notes.', variant: 'destructive' });
        return null;
      }
      const { data: signed, error: sErr } = await supabase.storage.from(bucket).createSignedUrl(note.audio_path, 300);
      if (sErr) throw sErr;
      const resp = await fetch(signed.signedUrl);
      const encBytes = new Uint8Array(await resp.arrayBuffer());
      const plain = await decryptBytes(encBytes, vk);
      const blob = new Blob([plain], { type: 'audio/webm' });
      return URL.createObjectURL(blob);
    } catch (err) {
      console.error('Error resolving audio:', err);
      toast({ title: 'Error', description: 'Failed to load voice note', variant: 'destructive' });
      return null;
    }
  };

  const togglePlay = async (note: VoiceNote) => {
    if (playingId === note.id) {
      setPlayingId(null);
      return;
    }
    const url = await resolvePlayableUrl(note);
    if (!url) return;
    const audio = new Audio(url);
    audio.play();
    setPlayingId(note.id);
    audio.onended = () => setPlayingId(null);
  };

  const handleFileUpload = async (voiceNoteId: string, files: FileList | null) => {
    if (!files || !user) return;

    const vk = getVaultKey(user.id);
    if (!vk) {
      toast({ title: 'Vault locked', description: 'Unlock your vault to attach files.', variant: 'destructive' });
      return;
    }
    if (!lockerId) {
      toast({ title: 'Setup required', description: 'Legacy Locker not set up.', variant: 'destructive' });
      return;
    }

    for (const file of Array.from(files)) {
      try {
        const rawBytes = new Uint8Array(await file.arrayBuffer());
        const encBytes = await encryptBytes(rawBytes, vk, `voice:${lockerId}:${voiceNoteId}`);
        const encBlob = new Blob([encBytes], { type: 'application/octet-stream' });

        const fileName = `legacy-locker/${user.id}/${lockerId}/${voiceNoteId}/${Date.now()}-${file.name}.asv2`;

        const { error: uploadError } = await supabase.storage
          .from('documents')
          .upload(fileName, encBlob, { contentType: 'application/octet-stream' });

        if (uploadError) throw uploadError;

        const { error: insertError } = await supabase
          .from('voice_note_attachments')
          .insert({
            voice_note_id: voiceNoteId,
            user_id: user.id,
            legacy_locker_id: lockerId,
            file_name: file.name,
            file_path: fileName,
            file_url: '',
            file_size: encBlob.size,
            file_type: file.type,
            is_encrypted: true,
            storage_bucket: 'documents',
          });

        if (insertError) throw insertError;

        toast({ title: 'Success', description: 'File attached (encrypted).' });
        fetchAttachments(voiceNoteId);
      } catch (error) {
        console.error('Error uploading file:', error);
        toast({ title: 'Error', description: 'Failed to attach file', variant: 'destructive' });
      }
    }
  };

  const downloadAttachment = async (attachment: VoiceNoteAttachment) => {
    try {
      const bucket = attachment.storage_bucket || 'documents';
      if (!attachment.is_encrypted) {
        const url =
          attachment.file_url && attachment.file_url.startsWith('http')
            ? attachment.file_url
            : (await supabase.storage.from(bucket).createSignedUrl(attachment.file_path, 3600)).data?.signedUrl;
        if (!url) throw new Error('No URL');
        window.open(url, '_blank');
        return;
      }
      const vk = getVaultKey(user!.id);
      if (!vk) {
        toast({ title: 'Vault locked', description: 'Unlock your vault to open this file.', variant: 'destructive' });
        return;
      }
      const { data: signed, error: sErr } = await supabase.storage.from(bucket).createSignedUrl(attachment.file_path, 300);
      if (sErr) throw sErr;
      const resp = await fetch(signed.signedUrl);
      const encBytes = new Uint8Array(await resp.arrayBuffer());
      const plain = await decryptBytes(encBytes, vk);
      const blob = new Blob([plain], { type: attachment.file_type || 'application/octet-stream' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = attachment.file_name;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch (err) {
      console.error('Error downloading attachment:', err);
      toast({ title: 'Error', description: 'Failed to open file', variant: 'destructive' });
    }
  };

  const deleteAttachment = async (attachment: VoiceNoteAttachment) => {
    try {
      const bucket = attachment.storage_bucket || 'documents';
      await supabase.storage.from(bucket).remove([attachment.file_path]);

      const { error } = await supabase
        .from('voice_note_attachments')
        .delete()
        .eq('id', attachment.id);

      if (error) throw error;

      toast({ title: 'Success', description: 'File deleted' });
      fetchAttachments(attachment.voice_note_id);
    } catch (error) {
      console.error('Error deleting attachment:', error);
      toast({ title: 'Error', description: 'Failed to delete file', variant: 'destructive' });
    }
  };

  const startRename = (attachmentId: string, currentName: string) => {
    setEditingFileName(attachmentId);
    setNewFileName(currentName);
  };

  const saveRename = async (attachmentId: string, voiceNoteId: string) => {
    if (!newFileName.trim()) return;
    try {
      const { error } = await supabase
        .from('voice_note_attachments')
        .update({ file_name: newFileName })
        .eq('id', attachmentId);
      if (error) throw error;
      toast({ title: 'Success', description: 'File renamed' });
      setEditingFileName(null);
      fetchAttachments(voiceNoteId);
    } catch (error) {
      console.error('Error renaming file:', error);
      toast({ title: 'Error', description: 'Failed to rename file', variant: 'destructive' });
    }
  };

  const vaultUnlocked = !!(user && getVaultKey(user.id));

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mic className="h-5 w-5 text-brand-blue" />
            Voice Notes
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Record and store voice memos for your records. New recordings are end-to-end encrypted with your vault key.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {!vaultUnlocked && (
            <div className="flex items-start gap-2 rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
              <Lock className="h-4 w-4 mt-0.5" />
              <span>Unlock your Legacy Locker vault to record new voice notes or attach files.</span>
            </div>
          )}

          <div>
            <label className="text-sm font-medium mb-2 block">Title *</label>
            <Input
              value={newNote.title}
              onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
              placeholder="Enter title for this voice note"
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Description</label>
            <Textarea
              value={newNote.description}
              onChange={(e) => setNewNote({ ...newNote, description: e.target.value })}
              placeholder="Add optional description"
              rows={3}
            />
          </div>

          <div className="flex gap-2">
            {!isRecording ? (
              <Button onClick={startRecording} disabled={!vaultUnlocked} className="flex items-center gap-2">
                <Mic className="h-4 w-4" />
                Start Recording
              </Button>
            ) : (
              <Button onClick={stopRecording} variant="destructive" className="flex items-center gap-2">
                <Square className="h-4 w-4" />
                Stop Recording
              </Button>
            )}

            {audioChunks.length > 0 && (
              <Button onClick={saveVoiceNote} variant="secondary" disabled={!vaultUnlocked}>
                Save Voice Note
              </Button>
            )}
          </div>

          {isRecording && (
            <p className="text-sm text-muted-foreground animate-pulse">Recording...</p>
          )}
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Your Voice Notes</h3>
        {voiceNotes.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">No voice notes yet. Record your first one above!</p>
        ) : (
          <div className="grid gap-4">
            {voiceNotes.map((note) => (
              <Card key={note.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <h4 className="font-semibold flex items-center gap-2">
                        {note.title}
                        {note.is_encrypted && <Lock className="h-3 w-3 text-muted-foreground" aria-label="Encrypted" />}
                      </h4>
                      {note.description && (
                        <p className="text-sm text-muted-foreground">{note.description}</p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        {new Date(note.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => togglePlay(note)}>
                        {playingId === note.id ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => deleteVoiceNote(note.id, note.audio_path, note.storage_bucket || 'documents')}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="mt-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">Attachments</p>
                      <label>
                        <input
                          type="file"
                          multiple
                          className="hidden"
                          disabled={!vaultUnlocked}
                          onChange={(e) => handleFileUpload(note.id, e.target.files)}
                        />
                        <Button size="sm" variant="outline" asChild disabled={!vaultUnlocked}>
                          <span className="cursor-pointer">
                            <Upload className="h-4 w-4 mr-2" />
                            Add Files
                          </span>
                        </Button>
                      </label>
                    </div>

                    {attachments[note.id]?.length > 0 && (
                      <div className="space-y-2">
                        {attachments[note.id].map((attachment) => (
                          <div key={attachment.id} className="flex items-center justify-between p-2 bg-muted rounded-md">
                            <div className="flex items-center gap-2 flex-1">
                              <FileText className="h-4 w-4" />
                              {attachment.is_encrypted && <Lock className="h-3 w-3 text-muted-foreground" aria-label="Encrypted" />}
                              {editingFileName === attachment.id ? (
                                <Input
                                  value={newFileName}
                                  onChange={(e) => setNewFileName(e.target.value)}
                                  onBlur={() => saveRename(attachment.id, note.id)}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') saveRename(attachment.id, note.id);
                                    if (e.key === 'Escape') setEditingFileName(null);
                                  }}
                                  className="h-7 text-sm"
                                  autoFocus
                                />
                              ) : (
                                <button
                                  className="text-sm truncate text-left hover:underline"
                                  onClick={() => downloadAttachment(attachment)}
                                >
                                  {attachment.file_name}
                                </button>
                              )}
                            </div>
                            <div className="flex gap-1">
                              <Button size="sm" variant="ghost" onClick={() => startRename(attachment.id, attachment.file_name)}>
                                <Edit2 className="h-3 w-3" />
                              </Button>
                              <Button size="sm" variant="ghost" onClick={() => deleteAttachment(attachment)}>
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default VoiceNotesSection;
