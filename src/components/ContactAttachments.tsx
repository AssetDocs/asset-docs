import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Upload, 
  FileText, 
  Image, 
  Mic, 
  Trash2, 
  Download, 
  StopCircle,
  Play,
  Pause,
  X
} from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

interface Attachment {
  id: string;
  file_name: string;
  file_url: string;
  file_type: string;
  file_size: number | null;
  attachment_type: string;
  description: string | null;
  created_at: string;
}

interface ContactAttachmentsProps {
  contactId: string;
  userId: string;
  isViewer: boolean;
  contactName: string;
}

const ContactAttachments: React.FC<ContactAttachmentsProps> = ({
  contactId,
  userId,
  isViewer,
  contactName
}) => {
  const { toast } = useToast();
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [description, setDescription] = useState('');
  
  // Voice recording state
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchAttachments();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
  }, [contactId]);

  const fetchAttachments = async () => {
    try {
      const { data, error } = await supabase
        .from('vip_contact_attachments')
        .select('*')
        .eq('contact_id', contactId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAttachments(data || []);
    } catch (error) {
      console.error('Error fetching attachments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    
    try {
      for (const file of Array.from(files)) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}_${file.name}`;
        const filePath = `${userId}/${contactId}/${fileName}`;
        
        // Determine attachment type
        let attachmentType = 'document';
        if (file.type.startsWith('image/')) {
          attachmentType = 'image';
        } else if (file.type.startsWith('audio/')) {
          attachmentType = 'voice_note';
        }

        // Upload to storage
        const { error: uploadError } = await supabase.storage
          .from('contact-attachments')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        // Get public URL
        const { data: urlData } = supabase.storage
          .from('contact-attachments')
          .getPublicUrl(filePath);

        // Save to database
        const { error: dbError } = await supabase
          .from('vip_contact_attachments')
          .insert({
            contact_id: contactId,
            user_id: userId,
            file_name: file.name,
            file_path: filePath,
            file_url: urlData.publicUrl,
            file_type: file.type,
            file_size: file.size,
            attachment_type: attachmentType,
            description: description || null
          });

        if (dbError) throw dbError;
      }

      toast({
        title: "Success",
        description: "File(s) uploaded successfully."
      });
      
      setDescription('');
      fetchAttachments();
    } catch (error) {
      console.error('Error uploading file:', error);
      toast({
        title: "Error",
        description: "Failed to upload file.",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (error) {
      console.error('Error starting recording:', error);
      toast({
        title: "Error",
        description: "Could not access microphone. Please check permissions.",
        variant: "destructive"
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  };

  const cancelRecording = () => {
    setAudioBlob(null);
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
    }
    setRecordingTime(0);
  };

  const saveVoiceNote = async () => {
    if (!audioBlob) return;

    setUploading(true);
    try {
      const fileName = `voice_note_${Date.now()}.webm`;
      const filePath = `${userId}/${contactId}/${fileName}`;

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from('contact-attachments')
        .upload(filePath, audioBlob);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('contact-attachments')
        .getPublicUrl(filePath);

      // Save to database
      const { error: dbError } = await supabase
        .from('vip_contact_attachments')
        .insert({
          contact_id: contactId,
          user_id: userId,
          file_name: fileName,
          file_path: filePath,
          file_url: urlData.publicUrl,
          file_type: 'audio/webm',
          file_size: audioBlob.size,
          attachment_type: 'voice_note',
          description: description || null
        });

      if (dbError) throw dbError;

      toast({
        title: "Success",
        description: "Voice note saved successfully."
      });

      cancelRecording();
      setDescription('');
      fetchAttachments();
    } catch (error) {
      console.error('Error saving voice note:', error);
      toast({
        title: "Error",
        description: "Failed to save voice note.",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (attachment: Attachment) => {
    try {
      // Delete from storage
      const filePath = `${userId}/${contactId}/${attachment.file_name}`;
      await supabase.storage.from('contact-attachments').remove([filePath]);

      // Delete from database
      const { error } = await supabase
        .from('vip_contact_attachments')
        .delete()
        .eq('id', attachment.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Attachment deleted."
      });
      
      fetchAttachments();
    } catch (error) {
      console.error('Error deleting attachment:', error);
      toast({
        title: "Error",
        description: "Failed to delete attachment.",
        variant: "destructive"
      });
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return 'Unknown size';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getAttachmentIcon = (type: string) => {
    switch (type) {
      case 'image':
        return <Image className="h-5 w-5 text-brand-blue" />;
      case 'voice_note':
        return <Mic className="h-5 w-5 text-brand-green" />;
      default:
        return <FileText className="h-5 w-5 text-brand-orange" />;
    }
  };

  const getSignedUrl = async (filePath: string) => {
    const { data, error } = await supabase.storage
      .from('contact-attachments')
      .createSignedUrl(filePath, 3600);
    
    if (error || !data?.signedUrl) {
      console.error('Error getting signed URL:', error);
      return null;
    }
    return data.signedUrl;
  };

  const handleDownload = async (attachment: Attachment) => {
    const filePath = `${userId}/${contactId}/${attachment.file_name}`;
    const signedUrl = await getSignedUrl(filePath);
    if (signedUrl) {
      window.open(signedUrl, '_blank');
    } else {
      toast({
        title: "Error",
        description: "Could not generate download link.",
        variant: "destructive"
      });
    }
  };

  return (
    <Card className="mt-4">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Upload className="h-5 w-5 text-brand-blue" />
          Attachments for {contactName}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!isViewer && (
          <>
            {/* File Upload Section */}
            <div className="space-y-3 p-4 border rounded-lg bg-gray-50">
              <Label className="font-medium">Upload Documents or Images</Label>
              <Input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*,.pdf,.doc,.docx,.txt,.xls,.xlsx"
                onChange={handleFileUpload}
                disabled={uploading}
                className="cursor-pointer"
              />
              <Textarea
                placeholder="Optional description for the upload..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
              />
            </div>

            {/* Voice Note Section */}
            <div className="space-y-3 p-4 border rounded-lg bg-gray-50">
              <Label className="font-medium">Record Voice Note</Label>
              
              {!audioBlob && !isRecording && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={startRecording}
                  className="w-full border-brand-green text-brand-green hover:bg-brand-green hover:text-white"
                >
                  <Mic className="h-4 w-4 mr-2" />
                  Start Recording
                </Button>
              )}

              {isRecording && (
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 text-red-500 animate-pulse">
                    <div className="w-3 h-3 bg-red-500 rounded-full" />
                    Recording: {formatTime(recordingTime)}
                  </div>
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={stopRecording}
                  >
                    <StopCircle className="h-4 w-4 mr-2" />
                    Stop
                  </Button>
                </div>
              )}

              {audioBlob && audioUrl && (
                <div className="space-y-3">
                  <audio ref={audioRef} src={audioUrl} controls className="w-full" />
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      onClick={saveVoiceNote}
                      disabled={uploading}
                      className="flex-1 bg-brand-green hover:bg-brand-green/90"
                    >
                      {uploading ? 'Saving...' : 'Save Voice Note'}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={cancelRecording}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {/* Attachments List */}
        {loading ? (
          <div className="flex justify-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-brand-green"></div>
          </div>
        ) : attachments.length === 0 ? (
          <p className="text-center text-gray-500 py-4">No attachments yet.</p>
        ) : (
          <div className="space-y-2">
            {attachments.map((attachment) => (
              <div
                key={attachment.id}
                className="flex items-center justify-between p-3 bg-white border rounded-lg hover:shadow-sm transition-shadow"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {getAttachmentIcon(attachment.attachment_type)}
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-sm truncate">{attachment.file_name}</p>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(attachment.file_size)} • {new Date(attachment.created_at).toLocaleDateString()}
                    </p>
                    {attachment.description && (
                      <p className="text-xs text-gray-600 mt-1 line-clamp-1">{attachment.description}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDownload(attachment)}
                    className="h-8 w-8 p-0"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                  {!isViewer && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Attachment</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete "{attachment.file_name}"? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(attachment)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ContactAttachments;
