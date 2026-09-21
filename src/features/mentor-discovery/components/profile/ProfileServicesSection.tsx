import type { RefObject } from 'react';
import type { UseQueryResult } from '@tanstack/react-query';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import { useStrings } from '@/constants/strings';
import { PublicListingCard } from '@/features/search/components/PublicListingCard';
import { ProfileSectionWrapper } from '@/features/mentor-discovery/components/profile/ProfileSectionWrapper';
import type { MentorPublicProfileResponse } from '@/types/search';

export function ProfileServicesSection({
  mentorId,
  mentorName,
  listingsQuery,
  sectionRef,
}: {
  mentorId: string;
  mentorName: string;
  listingsQuery: UseQueryResult<MentorPublicProfileResponse>;
  sectionRef?: RefObject<HTMLElement | null>;
}) {
  const tr = useStrings();
  const listings = listingsQuery.data?.listings ?? [];

  const groups: { subject: string; items: typeof listings }[] = [];
  for (const listing of listings) {
    let group = groups.find((g) => g.subject === listing.subject);
    if (!group) {
      group = { subject: listing.subject, items: [] };
      groups.push(group);
    }
    group.items.push(listing);
  }

  const actions =
    listingsQuery.isSuccess && listings.length > 0 ? (
      <Badge variant="primary">
        {listings.length} {tr.activeListings}
      </Badge>
    ) : null;

  return (
    <ProfileSectionWrapper
      id="services"
      heading={tr.services}
      sectionRef={sectionRef}
      actions={actions}
    >
      {listingsQuery.isPending ? (
        <div className="flex items-center justify-center py-6">
          <Spinner className="size-6 border-[var(--color-brand-primary)]/30 border-t-[var(--color-brand-primary)]" />
        </div>
      ) : listingsQuery.isError ? (
        <p className="text-sm text-[var(--color-m-text-muted)]">{tr.listingLoadError}</p>
      ) : listings.length === 0 ? (
        <p className="text-sm text-[var(--color-m-text-muted)]">{tr.noActiveServices}</p>
      ) : (
        <div className="space-y-5">
          {groups.map((group) => (
            <div key={group.subject}>
              {group.items.map((listing) => (
                <PublicListingCard
                  key={listing.id}
                  listing={listing}
                  mentorId={mentorId}
                  mentorName={mentorName}
                  canBook={listingsQuery.data?.viewer_permissions.can_book ?? false}
                />
              ))}
            </div>
          ))}
        </div>
      )}
    </ProfileSectionWrapper>
  );
}
