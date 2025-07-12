import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Play, Pause, Trash2, Save } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

// Extend Window interface for speech recognition
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

interface VoiceNote {
  id: string;
  title: string;
  transcript: string;
  audioUrl?: string;
  category: string;
  createdAt: Date;
  duration?: number;
}

const VoiceNotesSection: React.FC = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [voiceNotes, setVoiceNotes] = useState<VoiceNote[]>([]);
  const [currentTranscript, setCurrentTranscript] = useState('');
  const [noteTitle, setNoteTitle] = useState('');
  const [noteCategory, setNoteCategory] = useState('General');
  const [isListening, setIsListening] = useState(false);
  const [playingNoteId, setPlayingNoteId] = useState<string | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recognitionRef = useRef<any>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  
  const { toast } = useToast();

  useEffect(() => {
    // Initialize speech recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';
      
      recognition.onresult = (event) => {
        let finalTranscript = '';
        let interimTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }
        
        setCurrentTranscript(prev => prev + finalTranscript);
      };
      
      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };
      
      recognition.onend = () => {
        setIsListening(false);
      };
      
      recognitionRef.current = recognition;
    }
    
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      
      audioChunksRef.current = [];
      
      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };
      
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const audioUrl = URL.createObjectURL(audioBlob);
        
        // Save the note with audio
        saveVoiceNote(audioUrl);
      };
      
      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);
      
      // Start speech recognition
      if (recognitionRef.current) {
        recognitionRef.current.start();
        setIsListening(true);
      }
      
      toast({
        title: "Recording started",
        description: "Speak into your microphone to add a voice note.",
      });
    } catch (error) {
      console.error('Error starting recording:', error);
      toast({
        title: "Recording failed",
        description: "Could not access microphone. Please check permissions.",
        variant: "destructive",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
    }
    
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  const saveVoiceNote = (audioUrl?: string) => {
    if (!currentTranscript.trim() && !audioUrl) {
      toast({
        title: "Nothing to save",
        description: "Please record some audio or enter text.",
        variant: "destructive",
      });
      return;
    }

    const newNote: VoiceNote = {
      id: Date.now().toString(),
      title: noteTitle || `Voice Note ${voiceNotes.length + 1}`,
      transcript: currentTranscript,
      audioUrl,
      category: noteCategory,
      createdAt: new Date(),
    };

    setVoiceNotes(prev => [newNote, ...prev]);
    setCurrentTranscript('');
    setNoteTitle('');
    setNoteCategory('General');

    toast({
      title: "Voice note saved",
      description: "Your voice note has been saved successfully.",
    });
  };

  const playAudio = (noteId: string, audioUrl: string) => {
    if (playingNoteId === noteId) {
      audioElementRef.current?.pause();
      setPlayingNoteId(null);
    } else {
      if (audioElementRef.current) {
        audioElementRef.current.pause();
      }
      
      const audio = new Audio(audioUrl);
      audio.onended = () => setPlayingNoteId(null);
      audio.play();
      audioElementRef.current = audio;
      setPlayingNoteId(noteId);
    }
  };

  const deleteNote = (noteId: string) => {
    setVoiceNotes(prev => prev.filter(note => note.id !== noteId));
    toast({
      title: "Note deleted",
      description: "Voice note has been removed.",
    });
  };

  const categories = ['General', 'Family Heirlooms', 'Collectibles', 'Priceless Items', 'Insurance', 'Memories'];

  return (
    <div className="space-y-6">
      {/* Recording Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mic className="h-5 w-5" />
            Record Voice Note
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              placeholder="Note title (optional)"
              value={noteTitle}
              onChange={(e) => setNoteTitle(e.target.value)}
            />
            <select
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
              value={noteCategory}
              onChange={(e) => setNoteCategory(e.target.value)}
            >
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-4">
            <Button
              onClick={isRecording ? stopRecording : startRecording}
              variant={isRecording ? "destructive" : "default"}
              size="lg"
              className="flex items-center gap-2"
            >
              {isRecording ? (
                <>
                  <MicOff className="h-4 w-4" />
                  Stop Recording
                </>
              ) : (
                <>
                  <Mic className="h-4 w-4" />
                  Start Recording
                </>
              )}
            </Button>
            
            {isRecording && (
              <div className="flex items-center gap-2 text-red-500">
                <div className="h-2 w-2 bg-red-500 rounded-full animate-pulse" />
                Recording...
              </div>
            )}
          </div>

          {currentTranscript && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Live Transcript:</label>
              <Textarea
                value={currentTranscript}
                onChange={(e) => setCurrentTranscript(e.target.value)}
                placeholder="Your speech will appear here..."
                className="min-h-[100px]"
              />
              <Button onClick={() => saveVoiceNote()} className="w-full">
                <Save className="h-4 w-4 mr-2" />
                Save Note
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Voice Notes List */}
      <Card>
        <CardHeader>
          <CardTitle>Your Voice Notes ({voiceNotes.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {voiceNotes.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Mic className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No voice notes yet</p>
              <p className="text-sm">Record your first voice note to get started</p>
            </div>
          ) : (
            <div className="space-y-4">
              {voiceNotes.map((note) => (
                <Card key={note.id} className="bg-muted/30">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h3 className="font-medium">{note.title}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="secondary">{note.category}</Badge>
                          <span className="text-xs text-muted-foreground">
                            {note.createdAt.toLocaleDateString()} at {note.createdAt.toLocaleTimeString()}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {note.audioUrl && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => playAudio(note.id, note.audioUrl!)}
                          >
                            {playingNoteId === note.id ? (
                              <Pause className="h-4 w-4" />
                            ) : (
                              <Play className="h-4 w-4" />
                            )}
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteNote(note.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    {note.transcript && (
                      <p className="text-sm text-muted-foreground bg-background p-3 rounded">
                        {note.transcript}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default VoiceNotesSection;