import { PageHeader } from '@/components/ui/PageHeader';
import { EmptyState } from '@/components/ui/EmptyState';
import { useStrings } from '@/constants/strings';

export default function FeaturePlaceholderPage({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  const tr = useStrings();
  return (
    <div>
      <PageHeader title={title} description={description} />
      <EmptyState title={tr.comingSoonTitle} description={tr.comingSoonDescription} />
    </div>
  );
}
