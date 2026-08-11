import { useEffect, useMemo, useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useBlocker } from 'react-router-dom';
import type { AxiosError } from 'axios';
import { toast } from 'sonner';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Spinner } from '@/components/ui/Spinner';
import { ErrorState } from '@/components/ui/ErrorState';
import i18n from '@/i18n';
import { useStrings } from '@/constants/strings';
import { qk } from '@/constants/query-keys';
import { profileService } from '@/services/profile.service';
import { useAuthStore } from '@/app/store/authStore';
import type { ProfileResponse } from '@/types/profile';
import { joinFullName, splitFullName, toDateInputValue } from '@/features/profile/lib/profile-utils';
import { mapMentorProfileSaveError } from '@/features/profile/lib/mentor-profile-errors';
import { useRoleBase } from '@/features/profile/hooks/useRoleBase';
import { ProfilePhotoPicker } from '@/features/profile/components/ProfilePhotoPicker';
import { UniversityAutocomplete } from '@/features/education/components/UniversityAutocomplete';
import { AttendanceStatusSelector } from '@/features/education/components/AttendanceStatusSelector';
import { SubjectGradeEditor } from '@/features/education/components/SubjectGradeEditor';
import { ExamPreparationSelector } from '@/features/education/components/ExamPreparationSelector';
import {
  examIdsEqual,
  examProficienciesToPatchPayload,
  proficienciesToPatchPayload,
  structuredProficienciesEqual,
  type SubjectProficiencyDraft,
} from '@/features/education/lib/education-utils';
import type { ExamProficiency, UniversityAttendanceStatus, UniversitySummary } from '@/types/education';
import {
  createParentProfileFormSchema,
  createMentorProfileFormSchema,
  createStudentProfileFormSchema,
  type ParentProfileForm,
  type MentorProfileForm,
  type StudentProfileForm,
} from '@/features/profile/validations/profile.schemas';

function normAxios(e: unknown): string {
  const ax = e as AxiosError & { normalizedMessage?: string };
  return ax.normalizedMessage || ax.message || i18n.t('profileSaveError');
}

function ParentFields({
  profile,
  onSuccessNavigate,
}: {
  profile: ProfileResponse;
  onSuccessNavigate: () => void;
}) {
  const tr = useStrings();
  const { i18n: i18nInst } = useTranslation();
  const parentSchema = useMemo(() => createParentProfileFormSchema(), [i18nInst.language]);
  const qc = useQueryClient();
  const setUser = useAuthStore((s) => s.setUser);
  const user = useAuthStore((s) => s.user);
  const [leaveOpen, setLeaveOpen] = useState(false);
  const skipLeaveGuardRef = useRef(false);
  const form = useForm<ParentProfileForm>({
    resolver: zodResolver(parentSchema),
    mode: 'onChange',
    defaultValues: {
      ...splitFullName(profile.common_profile.full_name),
      phone: profile.phone_number ?? '',
    },
  });

  useEffect(() => {
    form.reset({
      ...splitFullName(profile.common_profile.full_name),
      phone: profile.phone_number ?? '',
    });
    void form.trigger();
  }, [profile, form]);

  const isDirty = form.formState.isDirty;
  const blocker = useBlocker(({ currentLocation, nextLocation }) => {
    if (skipLeaveGuardRef.current) return false;
    return isDirty && currentLocation.pathname !== nextLocation.pathname;
  });

  useEffect(() => {
    if (blocker.state === 'blocked') setLeaveOpen(true);
  }, [blocker.state]);

  useEffect(() => {
    const h = (e: BeforeUnloadEvent) => {
      if (!isDirty) return;
      e.preventDefault();
    };
    window.addEventListener('beforeunload', h);
    return () => window.removeEventListener('beforeunload', h);
  }, [isDirty]);

  const mutation = useMutation({
    mutationFn: profileService.patchMe,
    onSuccess: async (data) => {
      if (user?.id) qc.setQueryData(qk.profile(user.id), data);
      if (user) {
        const { firstName, lastName } = splitFullName(data.common_profile.full_name);
        setUser({
          ...user,
          name: data.common_profile.full_name,
          first_name: firstName,
          last_name: lastName,
          avatar_url: data.common_profile.profile_photo_url ?? user.avatar_url,
        });
      }
      toast.success(tr.profileUpdated);
      skipLeaveGuardRef.current = true;
      form.reset({
        ...splitFullName(data.common_profile.full_name),
        phone: data.phone_number ?? '',
      });
      onSuccessNavigate();
      if (user?.id) await qc.refetchQueries({ queryKey: qk.profile(user.id) });
    },
    onError: (e) => toast.error(normAxios(e)),
  });

  const submit = form.handleSubmit((vals) => {
    const payload: Parameters<typeof profileService.patchMe>[0] = {
      full_name: joinFullName(vals.firstName, vals.lastName),
    };
    if (vals.phone?.trim()) payload.phone_number = vals.phone.trim();
    mutation.mutate(payload);
  });

  return (
    <>
      <form onSubmit={submit} className="mx-auto max-w-xl space-y-1">
        <Input label={tr.firstName} {...form.register('firstName')} error={form.formState.errors.firstName?.message} />
        <Input label={tr.lastName} {...form.register('lastName')} error={form.formState.errors.lastName?.message} />
        <Input label={tr.phone} {...form.register('phone')} error={form.formState.errors.phone?.message} />
        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button type="button" variant="secondary" onClick={onSuccessNavigate} disabled={mutation.isPending}>
            {tr.cancel}
          </Button>
          <Button
            type="submit"
            disabled={!form.formState.isValid || !isDirty || mutation.isPending}
            isLoading={mutation.isPending}
          >
            {tr.saveProfile}
          </Button>
        </div>
      </form>

      <Modal
        open={leaveOpen}
        title={tr.unsavedTitle}
        onClose={() => {
          setLeaveOpen(false);
          blocker.reset?.();
        }}
        footer={
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setLeaveOpen(false);
                blocker.reset?.();
              }}
            >
              {tr.stayOnPage}
            </Button>
            <Button
              type="button"
              variant="danger"
              onClick={() => {
                setLeaveOpen(false);
                blocker.proceed?.();
              }}
            >
              {tr.leavePage}
            </Button>
          </div>
        }
      >
        <p className="text-sm text-[var(--color-text-muted)]">{tr.unsavedBody}</p>
      </Modal>
    </>
  );
}

function MentorFields({
  profile,
  onSuccessNavigate,
}: {
  profile: ProfileResponse;
  onSuccessNavigate: () => void;
}) {
  const tr = useStrings();
  const { i18n: i18nInst } = useTranslation();
  const mentorSchema = useMemo(() => createMentorProfileFormSchema(), [i18nInst.language]);
  const qc = useQueryClient();
  const setUser = useAuthStore((s) => s.setUser);
  const user = useAuthStore((s) => s.user);
  const [leaveOpen, setLeaveOpen] = useState(false);
  const skipLeaveGuardRef = useRef(false);

  const initialUniversity: UniversitySummary | null = profile.mentor_profile?.primary_university
    ? {
        id: profile.mentor_profile.primary_university.id,
        name: profile.mentor_profile.primary_university.name,
        city: profile.mentor_profile.primary_university.city,
        institution_type: profile.mentor_profile.primary_university.institution_type ?? '',
      }
    : null;
  const initialAttendance = profile.mentor_profile?.primary_university?.attendance_status ?? null;

  const [university, setUniversity] = useState<UniversitySummary | null>(initialUniversity);
  const [attendanceStatus, setAttendanceStatus] = useState<UniversityAttendanceStatus | null>(
    initialAttendance
  );
  const [subjectProficiencies, setSubjectProficiencies] =
    useState<SubjectProficiencyDraft[]>(profile.mentor_profile?.subject_proficiencies ?? []);
  const [examProficiencies, setExamProficiencies] = useState<ExamProficiency[]>(profile.mentor_profile?.exam_proficiencies ?? []);
  const [universityError, setUniversityError] = useState<string | null>(null);
  const [attendanceError, setAttendanceError] = useState<string | null>(null);
  const [subjectsError, setSubjectsError] = useState<string | null>(null);
  const [examsError, setExamsError] = useState<string | null>(null);

  const form = useForm<MentorProfileForm>({
    resolver: zodResolver(mentorSchema),
    mode: 'onChange',
    defaultValues: {
      ...splitFullName(profile.common_profile.full_name),
      bio: profile.common_profile.short_bio ?? '',
    },
  });

  useEffect(() => {
    const nextUniversity: UniversitySummary | null = profile.mentor_profile?.primary_university
      ? {
          id: profile.mentor_profile.primary_university.id,
          name: profile.mentor_profile.primary_university.name,
          city: profile.mentor_profile.primary_university.city,
          institution_type: profile.mentor_profile.primary_university.institution_type ?? '',
        }
      : null;
    setUniversity(nextUniversity);
    setAttendanceStatus(profile.mentor_profile?.primary_university?.attendance_status ?? null);
    setSubjectProficiencies(profile.mentor_profile?.subject_proficiencies ?? []);
    setExamProficiencies(profile.mentor_profile?.exam_proficiencies ?? []);
    form.reset({
      ...splitFullName(profile.common_profile.full_name),
      bio: profile.common_profile.short_bio ?? '',
    });
    void form.trigger();
  }, [profile, form]);

  const baselineUniversityId = profile.mentor_profile?.primary_university?.id ?? null;
  const baselineAttendance = profile.mentor_profile?.primary_university?.attendance_status ?? null;
  const baselineSubjects = profile.mentor_profile?.subject_proficiencies ?? [];
  const baselineExams = profile.mentor_profile?.exam_proficiencies ?? [];

  const structuredDirty =
    (university?.id ?? null) !== baselineUniversityId ||
    attendanceStatus !== baselineAttendance ||
    !structuredProficienciesEqual(subjectProficiencies, baselineSubjects) ||
    !examIdsEqual(
      examProficiencies.map((e) => e.id),
      baselineExams.map((e) => e.id)
    );

  const isDirty = form.formState.isDirty || structuredDirty;
  const blocker = useBlocker(({ currentLocation, nextLocation }) => {
    if (skipLeaveGuardRef.current) return false;
    return isDirty && currentLocation.pathname !== nextLocation.pathname;
  });

  useEffect(() => {
    if (blocker.state === 'blocked') setLeaveOpen(true);
  }, [blocker.state]);

  useEffect(() => {
    const h = (e: BeforeUnloadEvent) => {
      if (!isDirty) return;
      e.preventDefault();
    };
    window.addEventListener('beforeunload', h);
    return () => window.removeEventListener('beforeunload', h);
  }, [isDirty]);

  const mutation = useMutation({
    mutationFn: profileService.patchMe,
    onSuccess: async (data) => {
      if (user?.id) qc.setQueryData(qk.profile(user.id), data);
      if (user) {
        const { firstName, lastName } = splitFullName(data.common_profile.full_name);
        setUser({
          ...user,
          name: data.common_profile.full_name,
          first_name: firstName,
          last_name: lastName,
          avatar_url: data.common_profile.profile_photo_url ?? user.avatar_url,
        });
      }
      toast.success(tr.profileUpdated);
      skipLeaveGuardRef.current = true;
      form.reset({
        ...splitFullName(data.common_profile.full_name),
        bio: data.common_profile.short_bio ?? '',
      });
      onSuccessNavigate();
      if (user?.id) await qc.refetchQueries({ queryKey: qk.profile(user.id) });
    },
    onError: (e) => {
      const msg = normAxios(e);
      const fieldErrors = mapMentorProfileSaveError(msg);
      setUniversityError(fieldErrors.university ?? null);
      setAttendanceError(fieldErrors.attendance ?? null);
      setSubjectsError(fieldErrors.subjects ?? null);
      setExamsError(fieldErrors.exams ?? null);
      toast.error(msg);
    },
  });

  const submit = form.handleSubmit((vals) => {
    setUniversityError(null);
    setAttendanceError(null);
    setSubjectsError(null);
    setExamsError(null);
    if (university && !attendanceStatus) {
      setAttendanceError(tr.attendanceStatus);
      return;
    }
    if (!university && attendanceStatus) {
      setUniversityError(tr.university);
      return;
    }

    const payload: Parameters<typeof profileService.patchMe>[0] = {
      full_name: joinFullName(vals.firstName, vals.lastName),
    };
    if (vals.bio?.trim()) payload.short_bio = vals.bio.trim();

    if (structuredDirty) {
      payload.primary_university_id = university?.id ?? null;
      payload.university_attendance_status = university ? attendanceStatus : null;
      payload.subject_proficiencies = proficienciesToPatchPayload(subjectProficiencies);
      payload.exam_proficiencies = examProficienciesToPatchPayload(examProficiencies.map((e) => e.id));
    }

    mutation.mutate(payload);
  });

  return (
    <>
      <form onSubmit={submit} className="mx-auto max-w-xl space-y-1">
        <Input label={tr.firstName} {...form.register('firstName')} error={form.formState.errors.firstName?.message} />
        <Input label={tr.lastName} {...form.register('lastName')} error={form.formState.errors.lastName?.message} />
        <Textarea label={tr.bio} {...form.register('bio')} error={form.formState.errors.bio?.message} />

        <UniversityAutocomplete
          value={university}
          onChange={(next) => {
            setUniversity(next);
            if (!next) setAttendanceStatus(null);
            setUniversityError(null);
            setAttendanceError(null);
          }}
          disabled={mutation.isPending}
          error={universityError ?? undefined}
        />
        {university ? (
          <AttendanceStatusSelector
            value={attendanceStatus}
            onChange={(status) => {
              setAttendanceStatus(status);
              setAttendanceError(null);
            }}
            disabled={mutation.isPending}
            error={attendanceError ?? undefined}
          />
        ) : null}

        <SubjectGradeEditor
          value={subjectProficiencies}
          onChange={(next) => {
            setSubjectProficiencies(next);
            setSubjectsError(null);
          }}
          disabled={mutation.isPending}
          error={subjectsError ?? undefined}
        />
        <ExamPreparationSelector
          value={examProficiencies}
          onChange={(next) => {
            setExamProficiencies(next);
            setExamsError(null);
          }}
          disabled={mutation.isPending}
          error={examsError ?? undefined}
        />

        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button type="button" variant="secondary" onClick={onSuccessNavigate} disabled={mutation.isPending}>
            {tr.cancel}
          </Button>
          <Button
            type="submit"
            disabled={!form.formState.isValid || !isDirty || mutation.isPending}
            isLoading={mutation.isPending}
          >
            {tr.saveProfile}
          </Button>
        </div>
      </form>

      <Modal
        open={leaveOpen}
        title={tr.unsavedTitle}
        onClose={() => {
          setLeaveOpen(false);
          blocker.reset?.();
        }}
        footer={
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setLeaveOpen(false);
                blocker.reset?.();
              }}
            >
              {tr.stayOnPage}
            </Button>
            <Button
              type="button"
              variant="danger"
              onClick={() => {
                setLeaveOpen(false);
                blocker.proceed?.();
              }}
            >
              {tr.leavePage}
            </Button>
          </div>
        }
      >
        <p className="text-sm text-[var(--color-text-muted)]">{tr.unsavedBody}</p>
      </Modal>
    </>
  );
}

function StudentFields({
  profile,
  onSuccessNavigate,
}: {
  profile: ProfileResponse;
  onSuccessNavigate: () => void;
}) {
  const tr = useStrings();
  const { i18n: i18nInst } = useTranslation();
  const studentSchema = useMemo(() => createStudentProfileFormSchema(), [i18nInst.language]);
  const qc = useQueryClient();
  const setUser = useAuthStore((s) => s.setUser);
  const user = useAuthStore((s) => s.user);
  const [leaveOpen, setLeaveOpen] = useState(false);
  const skipLeaveGuardRef = useRef(false);
  const form = useForm<StudentProfileForm>({
    resolver: zodResolver(studentSchema),
    mode: 'onChange',
    defaultValues: {
      ...splitFullName(profile.common_profile.full_name),
      dateOfBirth: toDateInputValue(profile.common_profile.date_of_birth),
      school_name: profile.student_profile?.school_name ?? '',
      grade_level: profile.student_profile?.grade_level ?? '',
    },
  });

  useEffect(() => {
    form.reset({
      ...splitFullName(profile.common_profile.full_name),
      dateOfBirth: toDateInputValue(profile.common_profile.date_of_birth),
      school_name: profile.student_profile?.school_name ?? '',
      grade_level: profile.student_profile?.grade_level ?? '',
    });
    void form.trigger();
  }, [profile, form]);

  const isDirty = form.formState.isDirty;
  const blocker = useBlocker(({ currentLocation, nextLocation }) => {
    if (skipLeaveGuardRef.current) return false;
    return isDirty && currentLocation.pathname !== nextLocation.pathname;
  });

  useEffect(() => {
    if (blocker.state === 'blocked') setLeaveOpen(true);
  }, [blocker.state]);

  useEffect(() => {
    const h = (e: BeforeUnloadEvent) => {
      if (!isDirty) return;
      e.preventDefault();
    };
    window.addEventListener('beforeunload', h);
    return () => window.removeEventListener('beforeunload', h);
  }, [isDirty]);

  const mutation = useMutation({
    mutationFn: profileService.patchMe,
    onSuccess: async (data) => {
      if (user?.id) qc.setQueryData(qk.profile(user.id), data);
      if (user) {
        const { firstName, lastName } = splitFullName(data.common_profile.full_name);
        setUser({
          ...user,
          name: data.common_profile.full_name,
          first_name: firstName,
          last_name: lastName,
          avatar_url: data.common_profile.profile_photo_url ?? user.avatar_url,
        });
      }
      toast.success(tr.profileUpdated);
      skipLeaveGuardRef.current = true;
      form.reset({
        ...splitFullName(data.common_profile.full_name),
        dateOfBirth: toDateInputValue(data.common_profile.date_of_birth),
      });
      onSuccessNavigate();
      if (user?.id) await qc.refetchQueries({ queryKey: qk.profile(user.id) });
    },
    onError: (e) => toast.error(normAxios(e)),
  });

  const submit = form.handleSubmit((vals) => {
    const payload: Parameters<typeof profileService.patchMe>[0] = {
      full_name: joinFullName(vals.firstName, vals.lastName),
    };
    if (vals.dateOfBirth?.trim()) {
      payload.date_of_birth = new Date(vals.dateOfBirth + 'T12:00:00.000Z').toISOString();
    }
    if (vals.school_name?.trim()) payload.school_name = vals.school_name.trim();
    if (vals.grade_level?.trim()) payload.grade_level = vals.grade_level.trim();
    mutation.mutate(payload);
  });

  return (
    <>
      <form onSubmit={submit} className="mx-auto max-w-xl space-y-1">
        <Input label={tr.firstName} {...form.register('firstName')} error={form.formState.errors.firstName?.message} />
        <Input label={tr.lastName} {...form.register('lastName')} error={form.formState.errors.lastName?.message} />
        <Input type="date" label={tr.dateOfBirth} {...form.register('dateOfBirth')} error={form.formState.errors.dateOfBirth?.message} />
        <Input label={tr.school} placeholder={tr.schoolNamePlaceholder} {...form.register('school_name')} error={form.formState.errors.school_name?.message} />
        <Input label={tr.grade} placeholder={tr.gradeLevelPlaceholder} {...form.register('grade_level')} error={form.formState.errors.grade_level?.message} />
        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button type="button" variant="secondary" onClick={onSuccessNavigate} disabled={mutation.isPending}>
            {tr.cancel}
          </Button>
          <Button
            type="submit"
            disabled={!form.formState.isValid || !isDirty || mutation.isPending}
            isLoading={mutation.isPending}
          >
            {tr.saveProfile}
          </Button>
        </div>
      </form>

      <Modal
        open={leaveOpen}
        title={tr.unsavedTitle}
        onClose={() => {
          setLeaveOpen(false);
          blocker.reset?.();
        }}
        footer={
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setLeaveOpen(false);
                blocker.reset?.();
              }}
            >
              {tr.stayOnPage}
            </Button>
            <Button
              type="button"
              variant="danger"
              onClick={() => {
                setLeaveOpen(false);
                blocker.proceed?.();
              }}
            >
              {tr.leavePage}
            </Button>
          </div>
        }
      >
        <p className="text-sm text-[var(--color-text-muted)]">{tr.unsavedBody}</p>
      </Modal>
    </>
  );
}

export default function EditProfilePage() {
  const tr = useStrings();
  const navigate = useNavigate();
  const roleBase = useRoleBase();
  const authUser = useAuthStore((s) => s.user);
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: authUser?.id ? qk.profile(authUser.id) : [...qk.profileScope, 'none'],
    queryFn: () => profileService.getMe(),
    enabled: Boolean(authUser?.id),
  });

  const back = () => navigate(`${roleBase}/profile`);

  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Spinner className="size-10 border-[var(--color-brand-primary)]/30 border-t-[var(--color-brand-primary)]" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="mx-auto max-w-lg">
        <PageHeader title={tr.editProfile} description="" />
        <ErrorState title={tr.profileLoadError} description={normAxios(error)} onRetry={() => void refetch()} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title={tr.editProfile} description={tr.profile} />
      <Card className="mt-4 p-6">
        <ProfilePhotoPicker photoUrl={data.common_profile.profile_photo_url} displayName={data.common_profile.full_name} />
        {data.role === 'parent' ? (
          <ParentFields profile={data} onSuccessNavigate={back} />
        ) : data.role === 'mentor' ? (
          <MentorFields profile={data} onSuccessNavigate={back} />
        ) : (
          <StudentFields profile={data} onSuccessNavigate={back} />
        )}
      </Card>
    </div>
  );
}
