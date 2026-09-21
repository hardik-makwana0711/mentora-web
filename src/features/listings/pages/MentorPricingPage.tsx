import { useEffect, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Plus, Trash2 } from 'lucide-react';
import { PageContainer } from '@/components/layouts/PageContainer';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Checkbox } from '@/components/ui/Checkbox';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { useStrings } from '@/constants/strings';
import { useAuthStore } from '@/app/store/authStore';
import { mentorPricingService, type MentorPricingPackage } from '@/services/mentor-pricing.service';

export default function MentorPricingPage() {
  const tr = useStrings();
  const userId = useAuthStore((s) => s.user?.id);

  const query = useQuery({
    queryKey: ['mentor-pricing', 'mine', userId],
    queryFn: () => mentorPricingService.getMine(userId!),
    enabled: Boolean(userId),
  });

  const [currency, setCurrency] = useState('TRY');
  const [hourlyPrice, setHourlyPrice] = useState('');
  const [trialPrice, setTrialPrice] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [packages, setPackages] = useState<MentorPricingPackage[]>([]);

  useEffect(() => {
    if (!query.data) return;
    setCurrency(query.data.currency || 'TRY');
    setHourlyPrice(query.data.hourly_price != null ? String(query.data.hourly_price) : '');
    setTrialPrice(
      query.data.trial_lesson_price != null ? String(query.data.trial_lesson_price) : ''
    );
    setIsPublic(query.data.is_public);
    setPackages(query.data.package_options ?? []);
  }, [query.data]);

  const saveMutation = useMutation({
    mutationFn: () =>
      mentorPricingService.update({
        currency: currency.trim().toUpperCase() || 'TRY',
        hourly_price: hourlyPrice ? Number(hourlyPrice) : null,
        trial_lesson_price: trialPrice ? Number(trialPrice) : null,
        package_options: packages.filter((p) => p.name.trim() && p.lessons > 0),
        is_public: isPublic,
      }),
    onSuccess: () => toast.success(tr.pricingSaveSuccess),
    onError: () => toast.error(tr.pricingSaveFailed),
  });

  function updatePackage(index: number, patch: Partial<MentorPricingPackage>) {
    setPackages((prev) => prev.map((p, i) => (i === index ? { ...p, ...patch } : p)));
  }

  function addPackage() {
    setPackages((prev) => [...prev, { name: '', lessons: 1, price: 0 }]);
  }

  function removePackage(index: number) {
    setPackages((prev) => prev.filter((_, i) => i !== index));
  }

  if (query.isPending) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Spinner className="size-10 border-[var(--color-brand-primary)]/30 border-t-[var(--color-brand-primary)]" />
      </div>
    );
  }

  return (
    <PageContainer width="form">
      <PageHeader title={tr.mentorPricingTitle} description={tr.mentorPricingSubtitle} />

      <Card className="p-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Input
            label={tr.pricingCurrencyLabel}
            value={currency}
            onChange={(e) => setCurrency(e.target.value.toUpperCase())}
            maxLength={3}
          />
          <Input
            label={tr.pricingHourlyRateLabel}
            type="number"
            value={hourlyPrice}
            onChange={(e) => setHourlyPrice(e.target.value)}
          />
          <Input
            label={tr.pricingTrialPriceLabel}
            type="number"
            value={trialPrice}
            onChange={(e) => setTrialPrice(e.target.value)}
          />
        </div>

        <Checkbox
          label={tr.pricingPublicToggleLabel}
          checked={isPublic}
          onChange={(e) => setIsPublic(e.target.checked)}
        />

        <div className="mt-2 border-t border-[var(--color-m-card-border)] pt-4">
          <h2 className="mb-3 text-sm font-semibold text-[var(--color-m-text)]">
            {tr.pricingPackagesTitle}
          </h2>
          <div className="space-y-3">
            {packages.map((pkg, i) => (
              <div
                key={i}
                className="grid grid-cols-1 gap-2 sm:grid-cols-[2fr_1fr_1fr_auto] sm:items-end"
              >
                <Input
                  label={tr.pricingPackageNameLabel}
                  value={pkg.name}
                  onChange={(e) => updatePackage(i, { name: e.target.value })}
                />
                <Input
                  label={tr.pricingPackageLessonsLabel}
                  type="number"
                  value={pkg.lessons}
                  onChange={(e) => updatePackage(i, { lessons: Number(e.target.value) })}
                />
                <Input
                  label={tr.pricingPackagePriceLabel}
                  type="number"
                  value={pkg.price}
                  onChange={(e) => updatePackage(i, { price: Number(e.target.value) })}
                />
                <Button
                  type="button"
                  variant="ghost"
                  className="mb-4"
                  aria-label={tr.pricingRemovePackage}
                  onClick={() => removePackage(i)}
                >
                  <Trash2 className="size-4" aria-hidden />
                </Button>
              </div>
            ))}
          </div>
          <Button type="button" variant="secondary" size="sm" className="mt-2" onClick={addPackage}>
            <Plus className="mr-1.5 size-4" aria-hidden />
            {tr.pricingAddPackage}
          </Button>
        </div>

        <Button
          type="button"
          fullWidth
          className="mt-6"
          isLoading={saveMutation.isPending}
          onClick={() => saveMutation.mutate()}
        >
          {tr.pricingSave}
        </Button>
      </Card>
    </PageContainer>
  );
}
