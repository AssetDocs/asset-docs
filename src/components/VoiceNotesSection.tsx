import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Mic, Square, Trash2, Play, Pause, Upload, FileText, X, Edit2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface VoiceNote {
  id: string;
  title: string;
  description?: string;
  audio_url: string;
  duration?: number;
  created_at: string;
}

interface VoiceNoteAttachment {
  id: string;
  voice_note_id: string;
  file_name: string;
  file_url: string;
  file_size: number;
  file_type: string;
  created_at: string;
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
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchVoiceNotes();
    }
  }, [user]);

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
      
      // Fetch attachments for each voice note
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
        if (e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      recorder.onstop = () => {
        setAudioChunks(chunks);
        stream.getTracks().forEach(track => track.stop());
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Could not access microphone',
        variant: 'destructive',
      });
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
      toast({
        title: 'Error',
        description: 'Please add a title and record audio',
        variant: 'destructive',
      });
      return;
    }

    try {
      const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
      const fileName = `${user.id}/${Date.now()}-voice-note.webm`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('documents')
        .upload(fileName, audioBlob);

      if (uploadError) throw uploadError;

      // Use signed URL for private bucket
      const { data: signedData, error: signedError } = await supabase.storage
        .from('documents')
        .createSignedUrl(fileName, 86400); // 24 hour expiry

      if (signedError) throw signedError;

      const { error: insertError } = await supabase
        .from('legacy_locker_voice_notes')
        .insert({
          user_id: user.id,
          title: newNote.title,
          description: newNote.description,
          audio_path: fileName,
          audio_url: signedData.signedUrl,
          file_size: audioBlob.size,
        });

      if (insertError) throw insertError;

      toast({
        title: 'Success',
        description: 'Voice note saved successfully',
      });

      setNewNote({ title: '', description: '' });
      setAudioChunks([]);
      fetchVoiceNotes();
    } catch (error) {
      console.error('Error saving voice note:', error);
      toast({
        title: 'Error',
        description: 'Failed to save voice note',
        variant: 'destructive',
      });
    }
  };

  const deleteVoiceNote = async (id: string, audioPath: string) => {
    try {
      await supabase.storage.from('documents').remove([audioPath]);
      
      const { error } = await supabase
        .from('legacy_locker_voice_notes')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Voice note deleted',
      });

      fetchVoiceNotes();
    } catch (error) {
      console.error('Error deleting voice note:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete voice note',
        variant: 'destructive',
      });
    }
  };

  const togglePlay = (id: string, audioUrl: string) => {
    if (playingId === id) {
      setPlayingId(null);
    } else {
      const audio = new Audio(audioUrl);
      audio.play();
      setPlayingId(id);
      audio.onended = () => setPlayingId(null);
    }
  };

  const handleFileUpload = async (voiceNoteId: string, files: FileList | null) => {
    if (!files || !user) return;

    for (const file of Array.from(files)) {
      try {
        const fileName = `${user.id}/${voiceNoteId}/${Date.now()}-${file.name}`;

        const { error: uploadError } = await supabase.storage
          .from('documents')
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        // Use signed URL for private bucket
        const { data: signedData, error: signedError } = await supabase.storage
          .from('documents')
          .createSignedUrl(fileName, 86400); // 24 hour expiry

        if (signedError) throw signedError;

        const { error: insertError } = await supabase
          .from('voice_note_attachments')
          .insert({
            voice_note_id: voiceNoteId,
            user_id: user.id,
            file_name: file.name,
            file_path: fileName,
            file_url: signedData.signedUrl,
            file_size: file.size,
            file_type: file.type,
          });

        if (insertError) throw insertError;

        toast({
          title: 'Success',
          description: 'File attached successfully',
        });

        fetchAttachments(voiceNoteId);
      } catch (error) {
        console.error('Error uploading file:', error);
        toast({
          title: 'Error',
          description: 'Failed to attach file',
          variant: 'destructive',
        });
      }
    }
  };

  const deleteAttachment = async (attachmentId: string, filePath: string, voiceNoteId: string) => {
    try {
      await supabase.storage.from('documents').remove([filePath]);

      const { error } = await supabase
        .from('voice_note_attachments')
        .delete()
        .eq('id', attachmentId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'File deleted',
      });

      fetchAttachments(voiceNoteId);
    } catch (error) {
      console.error('Error deleting attachment:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete file',
        variant: 'destructive',
      });
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

      toast({
        title: 'Success',
        description: 'File renamed',
      });

      setEditingFileName(null);
      fetchAttachments(voiceNoteId);
    } catch (error) {
      console.error('Error renaming file:', error);
      toast({
        title: 'Error',
        description: 'Failed to rename file',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Record New Voice Note</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
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
              <Button onClick={startRecording} className="flex items-center gap-2">
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
              <Button onClick={saveVoiceNote} variant="secondary">
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
                      <h4 className="font-semibold">{note.title}</h4>
                      {note.description && (
                        <p className="text-sm text-muted-foreground">{note.description}</p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        {new Date(note.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => togglePlay(note.id, note.audio_url)}
                      >
                        {playingId === note.id ? (
                          <Pause className="h-4 w-4" />
                        ) : (
                          <Play className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => deleteVoiceNote(note.id, note.audio_url)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Attachments Section */}
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">Attachments</p>
                      <label>
                        <input
                          type="file"
                          multiple
                          className="hidden"
                          onChange={(e) => handleFileUpload(note.id, e.target.files)}
                        />
                        <Button size="sm" variant="outline" asChild>
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
                                <span className="text-sm truncate">{attachment.file_name}</span>
                              )}
                            </div>
                            <div className="flex gap-1">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => startRename(attachment.id, attachment.file_name)}
                              >
                                <Edit2 className="h-3 w-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => deleteAttachment(attachment.id, attachment.file_url, note.id)}
                              >
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
