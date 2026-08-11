import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Calendar, GraduationCap, UserPlus, Users } from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';
import { ErrorState } from '@/components/ui/ErrorState';
import { EmptyState } from '@/components/ui/EmptyState';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { qk } from '@/constants/query-keys';
import { useStrings } from '@/constants/strings';
import i18n from '@/i18n';
import { profileService } from '@/services/profile.service';
import { studentsService } from '@/services/students.service';
import { useAuthStore } from '@/app/store/authStore';
import { useRoleBase } from '@/features/profile/hooks/useRoleBase';

interface StudentFormData {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  confirm_password: string;
  date_of_birth: string;
}

interface FormErrors {
  first_name?: string;
  last_name?: string;
  email?: string;
  password?: string;
  confirm_password?: string;
  date_of_birth?: string;
}

function validateForm(form: StudentFormData): FormErrors {
  const errs: FormErrors = {};
  if (!form.first_name.trim()) errs.first_name = i18n.t('validationFirstNameRequired');
  if (!form.last_name.trim()) errs.last_name = i18n.t('validationLastNameRequired');
  if (!form.email.trim()) {
    errs.email = i18n.t('validationEmailRequired');
  } else if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(form.email.trim())) {
    errs.email = i18n.t('validationEmailInvalid');
  }
  if (!form.password) {
    errs.password = i18n.t('validationPasswordRequired');
  } else if (form.password.length < 8) {
    errs.password = i18n.t('validationPasswordMinLength');
  }
  if (form.password !== form.confirm_password) {
    errs.confirm_password = i18n.t('validationPasswordsMismatch');
  }
  if (!form.date_of_birth.trim()) {
    errs.date_of_birth = i18n.t('validationDateOfBirthRequired');
  }
  return errs;
}

const EMPTY_FORM: StudentFormData = {
  first_name: '',
  last_name: '',
  email: '',
  password: '',
  confirm_password: '',
  date_of_birth: '',
};

export default function StudentsPage() {
  const tr = useStrings();
  const user = useAuthStore((s) => s.user);
  const qc = useQueryClient();
  const navigate = useNavigate();
  const roleBase = useRoleBase();

  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<StudentFormData>(EMPTY_FORM);
  const [errors, setErrors] = useState<FormErrors>({});

  const profileQ = useQuery({
    queryKey: user?.id ? qk.profile(user.id) : ['profile', 'none'],
    queryFn: () => profileService.getMe(),
    enabled: Boolean(user?.id),
  });

  const linkedStudents = profileQ.data?.parent_profile?.linked_students ?? [];

  const createMutation = useMutation({
    mutationFn: studentsService.createStudent,
    onSuccess: async () => {
      toast.success(tr.studentsCreatedSuccess);
      setShowModal(false);
      setForm(EMPTY_FORM);
      setErrors({});
      if (user?.id) {
        await qc.invalidateQueries({ queryKey: qk.profile(user.id) });
        await qc.refetchQueries({ queryKey: qk.profile(user.id) });
      }
    },
    onError: (e: unknown) => {
      const err = e as {
        normalizedMessage?: string;
        response?: { data?: { message?: string; errors?: Array<{ field: string; message: string }> } };
      };
      const resErrors = err.response?.data?.errors;
      if (resErrors?.length) {
        const newErrs: FormErrors = {};
        resErrors.forEach(({ field, message }) => {
          const k = field as keyof FormErrors;
          newErrs[k] = message;
        });
        setErrors(newErrs);
      } else {
        const msg = err.response?.data?.message || err.normalizedMessage || tr.studentsCreateFailed;
        toast.error(msg);
      }
    },
  });

  function updateField<K extends keyof StudentFormData>(key: K, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  function handleSubmit() {
    const errs = validateForm(form);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    const dob = new Date(form.date_of_birth + 'T12:00:00');

    createMutation.mutate({
      first_name: form.first_name.trim(),
      last_name: form.last_name.trim(),
      email: form.email.trim().toLowerCase(),
      password: form.password,
      confirm_password: form.confirm_password,
      date_of_birth: dob.toISOString(),
    });
  }

  const initials = (name: string) => {
    const parts = name.trim().split(' ');
    return parts
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase() ?? '')
      .join('');
  };

  return (
    <div>
      <PageHeader
        title={tr.studentsPageTitle}
        description={tr.studentsPageDescription}
        actions={
          <Button type="button" onClick={() => setShowModal(true)}>
            <UserPlus className="mr-2 size-4" />
            {tr.studentsAdd}
          </Button>
        }
      />

      {profileQ.isPending ? (
        <div className="flex min-h-[30vh] items-center justify-center">
          <Spinner className="size-10 border-[var(--color-brand-primary)]/30 border-t-[var(--color-brand-primary)]" />
        </div>
      ) : profileQ.isError ? (
        <ErrorState title={tr.studentsLoadError} onRetry={() => void profileQ.refetch()} />
      ) : linkedStudents.length === 0 ? (
        <EmptyState
          title={tr.studentsEmptyTitle}
          description={tr.studentsEmptyDescription}
          action={
            <Button type="button" onClick={() => setShowModal(true)}>
              <UserPlus className="mr-2 size-4" />
              {tr.studentsAdd}
            </Button>
          }
        />
      ) : (
        <>
          <div className="mb-6 grid grid-cols-1 gap-3 sm:max-w-xs">
            <div className="flex items-center gap-3 rounded-xl border border-[var(--color-m-card-border)] bg-[var(--color-m-card)] px-4 py-3 ring-1 ring-[var(--color-m-ring-subtle)]">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-[var(--color-m-primary)]/12 text-[var(--color-m-primary-light)]">
                <Users className="size-5" aria-hidden />
              </div>
              <div className="min-w-0">
                <p className="truncate text-xs font-medium text-[var(--color-m-text-muted)]">
                  {tr.studentsStatTotal}
                </p>
                <p className="mt-0.5 text-xl font-semibold tabular-nums text-[var(--color-m-text)]">
                  {linkedStudents.length}
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {linkedStudents.map((student) => (
              <Card key={student.id} className="flex flex-col p-5">
                <div className="flex items-center gap-4">
                  {student.profile_photo_url ? (
                    <img
                      src={student.profile_photo_url}
                      alt={student.name}
                      className="size-14 shrink-0 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex size-14 shrink-0 items-center justify-center rounded-full bg-[var(--color-brand-primary)]/20 text-lg font-bold text-[var(--color-brand-primary)]">
                      {initials(student.name)}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-[var(--color-m-text)]">{student.name}</p>
                    {student.email ? (
                      <p className="mt-0.5 truncate text-xs text-[var(--color-m-text-muted)]">
                        {student.email}
                      </p>
                    ) : null}
                    <p className="mt-1 flex items-center gap-1 text-xs text-[var(--color-m-text-secondary)]">
                      <GraduationCap className="size-3.5 shrink-0" aria-hidden />
                      {student.grade_level
                        ? i18n.t('studentsGradeLabel', { grade: student.grade_level })
                        : tr.studentsNoGrade}
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2 border-t border-[var(--color-m-card-border)] pt-4">
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    onClick={() => navigate(`${roleBase}/lessons?studentId=${student.id}`)}
                  >
                    <Calendar className="mr-1.5 size-4" />
                    {tr.studentsCardViewLessons}
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    onClick={() => navigate(`${roleBase}/materials?studentId=${student.id}`)}
                  >
                    <BookOpen className="mr-1.5 size-4" />
                    {tr.studentsCardViewMaterials}
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </>
      )}

      <Modal
        open={showModal}
        title={tr.studentsModalTitle}
        onClose={() => {
          setShowModal(false);
          setForm(EMPTY_FORM);
          setErrors({});
        }}
        footer={
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setShowModal(false);
                setForm(EMPTY_FORM);
                setErrors({});
              }}
              disabled={createMutation.isPending}
            >
              {tr.cancel}
            </Button>
            <Button type="button" onClick={handleSubmit} isLoading={createMutation.isPending}>
              {tr.studentsCreate}
            </Button>
          </div>
        }
      >
        <div className="space-y-1">
          <div className="grid grid-cols-1 gap-0 sm:grid-cols-2 sm:gap-4">
            <Input
              label={tr.firstName}
              value={form.first_name}
              onChange={(e) => updateField('first_name', e.target.value)}
              error={errors.first_name}
              autoComplete="given-name"
            />
            <Input
              label={tr.lastName}
              value={form.last_name}
              onChange={(e) => updateField('last_name', e.target.value)}
              error={errors.last_name}
              autoComplete="family-name"
            />
          </div>
          <Input
            label={tr.email}
            type="email"
            value={form.email}
            onChange={(e) => updateField('email', e.target.value)}
            error={errors.email}
            autoComplete="email"
          />
          <Input
            label={tr.dateOfBirth}
            type="date"
            value={form.date_of_birth}
            onChange={(e) => updateField('date_of_birth', e.target.value)}
            error={errors.date_of_birth}
          />
          <Input
            label={tr.password}
            type="password"
            value={form.password}
            onChange={(e) => updateField('password', e.target.value)}
            error={errors.password}
            autoComplete="new-password"
          />
          <Input
            label={tr.confirmPassword}
            type="password"
            value={form.confirm_password}
            onChange={(e) => updateField('confirm_password', e.target.value)}
            error={errors.confirm_password}
            autoComplete="new-password"
          />
          <p className="pt-1 text-xs text-[var(--color-m-text-muted)]">{tr.studentsVerificationHint}</p>
        </div>
      </Modal>
    </div>
  );
}
