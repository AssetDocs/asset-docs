import React from 'react';
import { DashboardGridCard } from '@/components/DashboardGridCard';
import { BookOpen, Mic } from 'lucide-react';

interface NotesHubProps {
  onTabChange: (tab: string) => void;
}

/** Navigation-only wrapper: renders choices, fetches and mutates nothing. */
const NotesHub: React.FC<NotesHubProps> = ({ onTabChange }) => {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Notes</h2>
        <p className="text-muted-foreground text-sm mt-1">
          Keep important notes, reminders, and information in one place.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <DashboardGridCard
          icon={<BookOpen className="h-5 w-5" />}
          title="Written Notes"
          description="Organize notes into folders with optional attachments."
          actionLabel="View Notes"
          onClick={() => onTabChange('notes')}
          color="rose"
          variant="compact"
        />
        <DashboardGridCard
          icon={<Mic className="h-5 w-5" />}
          title="Voice Notes"
          description="Record and store voice memos for your records."
          actionLabel="Voice Notes"
          onClick={() => onTabChange('voice-notes')}
          color="rose"
          variant="compact"
        />
      </div>
    </div>
  );
};

export default NotesHub;
