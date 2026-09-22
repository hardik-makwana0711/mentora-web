import { LegalPageLayout } from '@/features/legal/components/LegalPageLayout';
import {
  termsIntro,
  termsLastUpdated,
  termsSections,
} from '@/features/legal/content/terms-and-conditions';
import { useStrings } from '@/constants/strings';

export default function TermsAndConditionsPage() {
  const tr = useStrings();
  return (
    <LegalPageLayout
      title={tr.termsAndConditions}
      lastUpdated={termsLastUpdated}
      intro={termsIntro}
      sections={termsSections}
    />
  );
}
