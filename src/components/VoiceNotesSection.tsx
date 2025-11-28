import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Mic, Square, Trash2, Play, Pause } from 'lucide-react';
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

export const VoiceNotesSection = () => {
  const [voiceNotes, setVoiceNotes] = useState<VoiceNote[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
  const [newNote, setNewNote] = useState({ title: '', description: '' });
  const [playingId, setPlayingId] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchVoiceNotes();
    }
  }, [user]);

  const fetchVoiceNotes = async () => {
    try {
      const { data, error } = await supabase
        .from('legacy_locker_voice_notes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setVoiceNotes(data || []);
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

      const { data: { publicUrl } } = supabase.storage
        .from('documents')
        .getPublicUrl(fileName);

      const { error: insertError } = await supabase
        .from('legacy_locker_voice_notes')
        .insert({
          user_id: user.id,
          title: newNote.title,
          description: newNote.description,
          audio_path: fileName,
          audio_url: publicUrl,
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
