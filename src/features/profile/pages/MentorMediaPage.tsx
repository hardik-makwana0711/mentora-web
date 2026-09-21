import { PageContainer } from '@/components/layouts/PageContainer';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { useStrings } from '@/constants/strings';
import { MentorMediaGallery } from '@/features/profile/components/MentorMediaGallery';
import { MentorIntroVideoSection } from '@/features/profile/components/MentorIntroVideoSection';

export default function MentorMediaPage() {
  const tr = useStrings();

  return (
    <PageContainer width="content">
      <PageHeader title={tr.mediaGalleryTitle} description={tr.mediaGalleryDescription} />
      <Card className="mt-4 p-6">
        <MentorMediaGallery />
        <MentorIntroVideoSection />
      </Card>
    </PageContainer>
  );
}
