import { TabList, TabTrigger, Tabs } from '@/components/ui/Tabs';
import { useStrings } from '@/constants/strings';
import { useMentorContactRequestsCount } from '@/features/mentor/hooks/useMentorContactRequestsList';
import {
  CONTACT_REQUEST_STATUS_TABS,
  contactRequestTabLabelKey,
} from '@/features/mentor/lib/contact-request-labels';
import type { ContactRequestStatus } from '@/types/contact-requests';

function TabLabel({ tab }: { tab: 'all' | ContactRequestStatus }) {
  const tr = useStrings();
  const countQuery = useMentorContactRequestsCount(tab);
  const count = countQuery.data;
  return (
    <span>
      {tr[contactRequestTabLabelKey(tab)]}
      {typeof count === 'number' ? ` (${count})` : ''}
    </span>
  );
}

export function ContactRequestStatusTabs({
  value,
  onChange,
}: {
  value: 'all' | ContactRequestStatus;
  onChange: (v: 'all' | ContactRequestStatus) => void;
}) {
  return (
    <Tabs value={value} onValueChange={(v) => onChange(v as 'all' | ContactRequestStatus)}>
      <TabList className="flex-wrap">
        {CONTACT_REQUEST_STATUS_TABS.map((tab) => (
          <TabTrigger key={tab} value={tab}>
            <TabLabel tab={tab} />
          </TabTrigger>
        ))}
      </TabList>
    </Tabs>
  );
}
