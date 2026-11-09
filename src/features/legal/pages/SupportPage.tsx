import { LegalPageLayout } from '@/features/legal/components/LegalPageLayout';
import {
  supportIntro,
  supportLastUpdated,
  supportSections,
} from '@/features/legal/content/support';
import { useStrings } from '@/constants/strings';

export default function SupportPage() {
  const tr = useStrings();
  return (
    <LegalPageLayout
      title={tr.supportPageTitle}
      lastUpdated={supportLastUpdated}
      intro={supportIntro}
      sections={supportSections}
    />
  );
}
