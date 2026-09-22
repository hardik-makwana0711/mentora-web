import { LegalPageLayout } from '@/features/legal/components/LegalPageLayout';
import {
  privacyPolicyIntro,
  privacyPolicyLastUpdated,
  privacyPolicySections,
} from '@/features/legal/content/privacy-policy';
import { useStrings } from '@/constants/strings';

export default function PrivacyPolicyPage() {
  const tr = useStrings();
  return (
    <LegalPageLayout
      title={tr.privacyPolicy}
      lastUpdated={privacyPolicyLastUpdated}
      intro={privacyPolicyIntro}
      sections={privacyPolicySections}
    />
  );
}
