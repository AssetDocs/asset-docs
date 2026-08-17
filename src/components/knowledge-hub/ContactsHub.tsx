import React from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardGridCard } from '@/components/DashboardGridCard';
import { Contact, Briefcase } from 'lucide-react';

interface ContactsHubProps {
  onTabChange: (tab: string) => void;
}

/**
 * Navigation-only wrapper. It preserves the active account/workspace context
 * simply by not touching it: no queries, no writes, no state of its own.
 */
const ContactsHub: React.FC<ContactsHubProps> = ({ onTabChange }) => {
  const navigate = useNavigate();

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Contacts</h2>
        <p className="text-muted-foreground text-sm mt-1">
          The people you rely on — personal and professional.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <DashboardGridCard
          icon={<Contact className="h-5 w-5" />}
          title="VIP Contacts"
          description="Your most important contacts with priority levels."
          actionLabel="View Contacts"
          onClick={() => navigate('/account/contacts')}
          color="rose"
          variant="compact"
        />
        <DashboardGridCard
          icon={<Briefcase className="h-5 w-5" />}
          title="Trusted Professionals"
          description="Track your trusted service providers and contractors."
          actionLabel="View Pros"
          onClick={() => onTabChange('service-pros')}
          color="rose"
          variant="compact"
        />
      </div>
    </div>
  );
};

export default ContactsHub;
