import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { format } from 'date-fns';
import { Flag, Play, Star } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { PageContainer } from '@/components/layouts/PageContainer';
import { BackLink } from '@/components/ui/BackLink';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { ErrorState } from '@/components/ui/ErrorState';
import { EmptyState } from '@/components/ui/EmptyState';
import { Modal } from '@/components/ui/Modal';
import { PhotoCarousel } from '@/features/mentor-discovery/components/PhotoCarousel';
import { ContactRequestModal } from '@/features/mentor-discovery/components/ContactRequestModal';
import { ReportMentorModal } from '@/features/mentor-discovery/components/ReportMentorModal';
import { discoveryService } from '@/services/discovery.service';
import { qk } from '@/constants/query-keys';
import { useRoleBase } from '@/features/profile/hooks/useRoleBase';
import { useAuthStore } from '@/app/store/authStore';
import { useStrings } from '@/constants/strings';
import { getDateFnsLocale } from '@/lib/date-locale';
import { isHttpNotFound } from '@/lib/http-errors';
import { MentorEducationSections } from '@/features/education/components/MentorEducationSections';
import type { ContactRequestType } from '@/types/contact-requests';

export default function MentorDiscoveryProfilePage() {
  const tr = useStrings();
  const { mentorId = '' } = useParams();
  const [searchParams] = useSearchParams();
  const roleBase = useRoleBase();
  const role = useAuthStore((s) => s.role);
  const [contactOpen, setContactOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [videoOpen, setVideoOpen] = useState(false);
  const defaultRequestType = (searchParams.get('request') === 'trial'
    ? 'trial'
    : 'contact') as ContactRequestType;

  useEffect(() => {
    if (searchParams.get('request')) setContactOpen(true);
  }, [searchParams]);

  const query = useQuery({
    queryKey: qk.discoveryProfile(mentorId),
    queryFn: () => discoveryService.getFullProfile(mentorId),
    enabled: Boolean(mentorId),
  });

  const canRequest = role === 'parent' || role === 'student';

  if (query.isPending) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Spinner className="size-10 border-[var(--color-brand-primary)]/30 border-t-[var(--color-brand-primary)]" />
      </div>
    );
  }

  if (query.isError || !query.data) {
    if (isHttpNotFound(query.error)) {
      return <EmptyState title={tr.mentorUnavailable} />;
    }
    return <ErrorState title={tr.mentorProfileLoadError} onRetry={() => void query.refetch()} />;
  }

  const profile = query.data;
  const photos = profile.photos.map((p) => p.url);
  const locale = getDateFnsLocale();

  return (
    <PageContainer>
      <div className="mb-4 flex items-center justify-between gap-2">
        <BackLink to={`${roleBase}/mentor-discovery`}>{tr.backToDiscovery}</BackLink>
        {canRequest ? (
          <button
            type="button"
            className="rounded-lg p-2 text-rose-400 hover:bg-[var(--color-m-hover-overlay)]"
            onClick={() => setReportOpen(true)}
            aria-label={tr.reportProfile}
          >
            <Flag className="size-5" />
          </button>
        ) : null}
      </div>

      <div className="mx-auto max-w-3xl space-y-8">
        <section className="overflow-hidden rounded-2xl border border-[var(--color-m-card-border)] bg-[var(--color-m-card)]">
          <PhotoCarousel photos={photos} alt={profile.display_name} />
          <div className="p-6">
            <h1 className="text-2xl font-bold text-[var(--color-m-text)]">{profile.display_name}</h1>
            {profile.title ? (
              <p className="mt-1 text-[var(--color-m-text-secondary)]">{profile.title}</p>
            ) : null}
            <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
              <span className="flex items-center gap-1 rounded-full border border-yellow-500/30 bg-yellow-500/10 px-3 py-1 text-yellow-400">
                <Star className="size-3.5 fill-yellow-400" aria-hidden />
                {profile.rating_average != null ? profile.rating_average.toFixed(1) : '—'}
              </span>
              <span className="text-[var(--color-m-text-muted)]">
                {profile.review_count} {tr.reviews}
              </span>
            </div>
            {profile.verification_badges.length > 0 ? (
              <p className="mt-3 text-sm text-[var(--color-m-text-secondary)]">
                {profile.verification_badges.join(' · ')}
              </p>
            ) : null}
            {canRequest ? (
              <Button
                type="button"
                variant="primary"
                className="mt-4 w-full sm:w-auto"
                onClick={() => setContactOpen(true)}
              >
                {tr.requestTrialLesson}
              </Button>
            ) : null}
          </div>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-[var(--color-m-text)]">{tr.aboutMentor}</h2>
          {profile.profile_slogan ? (
            <p className="mt-2 text-sm italic text-[var(--color-m-primary)]">
              &ldquo;{profile.profile_slogan}&rdquo;
            </p>
          ) : null}
          <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-[var(--color-m-text-secondary)]">
            {profile.long_bio || profile.short_bio || tr.notProvided}
          </p>
        </section>

        <section className="rounded-xl border border-[var(--color-m-card-border)] bg-[var(--color-m-card)] p-4">
          <h2 className="mb-3 text-lg font-semibold text-[var(--color-m-text)]">{tr.education}</h2>
          <dl className="space-y-2 text-sm">
            {profile.education.university ? (
              <div>
                <dt className="text-[var(--color-m-text-muted)]">{tr.university}</dt>
                <dd className="text-[var(--color-m-text)]">{profile.education.university}</dd>
              </div>
            ) : null}
            {profile.education.department ? (
              <div>
                <dt className="text-[var(--color-m-text-muted)]">{tr.department}</dt>
                <dd className="text-[var(--color-m-text)]">{profile.education.department}</dd>
              </div>
            ) : null}
            {profile.education.degree ? (
              <div>
                <dt className="text-[var(--color-m-text-muted)]">{tr.degree}</dt>
                <dd className="text-[var(--color-m-text)]">{profile.education.degree}</dd>
              </div>
            ) : null}
            {profile.education.graduation_year ? (
              <div>
                <dt className="text-[var(--color-m-text-muted)]">{tr.graduationYear}</dt>
                <dd className="text-[var(--color-m-text)]">{profile.education.graduation_year}</dd>
              </div>
            ) : null}
            {profile.education.high_school ? (
              <div>
                <dt className="text-[var(--color-m-text-muted)]">{tr.highSchool}</dt>
                <dd className="text-[var(--color-m-text)]">{profile.education.high_school}</dd>
              </div>
            ) : null}
          </dl>
          {(profile.subject_proficiencies?.length || profile.exam_proficiencies?.length) ? (
            <div className="mt-4 border-t border-[var(--color-m-card-border)] pt-4">
              <MentorEducationSections
                primaryUniversity={profile.education.primary_university}
                legacyUniversity={profile.education.university ?? undefined}
                subjectProficiencies={profile.subject_proficiencies}
                examProficiencies={profile.exam_proficiencies}
              />
            </div>
          ) : null}
        </section>

        <section>
          <h2 className="text-lg font-semibold text-[var(--color-m-text)]">{tr.expertise}</h2>
          <div className="mt-2 space-y-2 text-sm text-[var(--color-m-text-secondary)]">
            {profile.subjects.length > 0 ? (
              <p>
                <span className="text-[var(--color-m-text-muted)]">{tr.subjects}: </span>
                {profile.subjects.join(' · ')}
              </p>
            ) : null}
            {profile.exam_types.length > 0 ? (
              <p>
                <span className="text-[var(--color-m-text-muted)]">{tr.examType}: </span>
                {profile.exam_types.join(' · ')}
              </p>
            ) : null}
            {profile.grade_levels.length > 0 ? (
              <p>
                <span className="text-[var(--color-m-text-muted)]">{tr.gradeLevel}: </span>
                {profile.grade_levels.join(' · ')}
              </p>
            ) : null}
            {profile.teaching_formats.length > 0 ? (
              <p>
                <span className="text-[var(--color-m-text-muted)]">{tr.teachingFormat}: </span>
                {profile.teaching_formats.join(' · ')}
              </p>
            ) : null}
          </div>
        </section>

        {profile.teaching_style_tags.length > 0 ? (
          <section>
            <h2 className="text-lg font-semibold text-[var(--color-m-text)]">{tr.teachingStyle}</h2>
            <p className="mt-2 text-sm text-[var(--color-m-text-secondary)]">
              {profile.teaching_style_tags.join(' · ')}
            </p>
          </section>
        ) : null}

        {profile.intro_video ? (
          <section>
            <h2 className="text-lg font-semibold text-[var(--color-m-text)]">{tr.introVideo}</h2>
            <button
              type="button"
              className="relative mt-3 block w-full max-w-md overflow-hidden rounded-xl border border-[var(--color-m-card-border)]"
              onClick={() => setVideoOpen(true)}
            >
              {profile.intro_video.thumbnail_url ? (
                <img
                  src={profile.intro_video.thumbnail_url}
                  alt={tr.introVideo}
                  className="aspect-video w-full object-cover"
                />
              ) : (
                <div className="flex aspect-video items-center justify-center bg-[var(--color-m-surface-light)]">
                  <Play className="size-12 text-[var(--color-m-primary)]" />
                </div>
              )}
              <span className="absolute bottom-2 right-2 rounded bg-black/60 px-2 py-1 text-xs text-white">
                {profile.intro_video.duration_seconds
                  ? `${profile.intro_video.duration_seconds}s`
                  : tr.playVideo}
              </span>
            </button>
          </section>
        ) : null}

        <section>
          <h2 className="text-lg font-semibold text-[var(--color-m-text)]">{tr.reviews}</h2>
          {profile.reviews.length === 0 ? (
            <p className="mt-2 text-sm text-[var(--color-m-text-muted)]">{tr.noReviewsYet}</p>
          ) : (
            <ul className="mt-3 space-y-3">
              {profile.reviews.map((r) => (
                <li
                  key={r.id}
                  className="rounded-xl border border-[var(--color-m-card-border)] bg-[var(--color-m-card)] p-4"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium text-[var(--color-m-text)]">{r.reviewer_name_display}</span>
                    {r.rating != null ? (
                      <span className="text-sm text-yellow-400">⭐ {r.rating.toFixed(1)}</span>
                    ) : null}
                  </div>
                  <p className="mt-2 text-sm text-[var(--color-m-text-secondary)]">{r.review_text}</p>
                  <p className="mt-2 text-xs text-[var(--color-m-text-muted)]">
                    {format(new Date(r.created_at), 'PP', { locale })}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section>
          <h2 className="text-lg font-semibold text-[var(--color-m-text)]">{tr.successStories}</h2>
          {profile.success_stories.length === 0 ? (
            <p className="mt-2 text-sm text-[var(--color-m-text-muted)]">{tr.noSuccessStories}</p>
          ) : (
            <ul className="mt-3 space-y-3">
              {profile.success_stories.map((s) => (
                <li
                  key={s.id}
                  className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4"
                >
                  <h3 className="font-semibold text-emerald-200">{s.title}</h3>
                  <p className="text-xs text-emerald-400/80">
                    {[s.exam_type, s.year].filter(Boolean).join(' · ')}
                  </p>
                  <p className="mt-2 text-sm text-[var(--color-m-text-secondary)]">{s.description}</p>
                </li>
              ))}
            </ul>
          )}
        </section>

        {profile.availability_summary.next_available_slots.length > 0 ? (
          <section>
            <h2 className="text-lg font-semibold text-[var(--color-m-text)]">{tr.availability}</h2>
            <ul className="mt-2 space-y-1 text-sm text-[var(--color-m-text-secondary)]">
              {profile.availability_summary.next_available_slots.map((slot) => (
                <li key={slot.slot_start}>
                  {format(new Date(slot.slot_start), 'PPp', { locale })}
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <section>
          <h2 className="text-lg font-semibold text-[var(--color-m-text)]">{tr.pricing}</h2>
          {profile.pricing_summary.hourly_rate != null ? (
            <p className="mt-2 text-sm text-[var(--color-m-text-secondary)]">
              {tr.hourlyRate}: ₺{profile.pricing_summary.hourly_rate}
            </p>
          ) : (
            <p className="mt-2 text-sm text-[var(--color-m-text-muted)]">{tr.pricingHidden}</p>
          )}
        </section>
      </div>

      <ContactRequestModal
        open={contactOpen}
        mentorId={mentorId}
        mentorName={profile.display_name}
        defaultRequestType={defaultRequestType}
        onClose={() => setContactOpen(false)}
      />

      <ReportMentorModal open={reportOpen} mentorId={mentorId} onClose={() => setReportOpen(false)} />

      <Modal open={videoOpen} title={tr.introVideo} onClose={() => setVideoOpen(false)}>
        {profile.intro_video ? (
          <video
            src={profile.intro_video.url}
            controls
            className="w-full rounded-lg"
            preload="metadata"
          />
        ) : null}
      </Modal>
    </PageContainer>
  );
}
