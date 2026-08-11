import { useEffect, useState } from 'react';

import { Link } from 'react-router-dom';

import { useForm } from 'react-hook-form';

import { zodResolver } from '@hookform/resolvers/zod';

import { z } from 'zod';

import { useMutation, useQuery } from '@tanstack/react-query';

import { toast } from 'sonner';

import type { AxiosError } from 'axios';

import { Modal } from '@/components/ui/Modal';

import { Button } from '@/components/ui/Button';

import { Input } from '@/components/ui/Input';

import { Textarea } from '@/components/ui/Textarea';

import { DropdownSelect } from '@/components/ui/DropdownSelect';

import { Spinner } from '@/components/ui/Spinner';

import { contactRequestsService } from '@/services/contact-requests.service';

import { profileService } from '@/services/profile.service';

import { useAuthStore } from '@/app/store/authStore';

import { useRoleBase } from '@/features/profile/hooks/useRoleBase';

import { useStrings } from '@/constants/strings';
import i18n from '@/i18n';

import { qk } from '@/constants/query-keys';

import type { ContactRequestType } from '@/types/contact-requests';

import type { LinkedStudentRow } from '@/types/profile';



function normAxios(e: unknown): string {

  const ax = e as AxiosError & { normalizedMessage?: string };

  return ax.normalizedMessage || ax.message || i18n.t('requestFailed');

}



const schema = z.object({

  request_type: z.enum(['contact', 'trial', 'regular_lesson']),

  student_id: z.string().optional(),

  subject: z.string().trim().min(1).max(200),

  exam_type: z.string().trim().max(100).optional(),

  grade_level: z.string().trim().min(1).max(100),

  preferred_teaching_format: z.string().optional(),

  preferred_days: z.string().optional(),

  preferred_time_slots: z.string().optional(),

  message: z.string().trim().max(2000).optional(),

});



type FormValues = z.infer<typeof schema>;



function resolveStudentId(

  role: string | null | undefined,

  values: FormValues,

  linkedStudents: LinkedStudentRow[]

): string | undefined {

  if (role !== 'parent') return undefined;

  if (values.student_id) return values.student_id;

  if (linkedStudents.length === 1) return linkedStudents[0]?.id;

  return undefined;

}



export function ContactRequestModal({

  open,

  mentorId,

  mentorName,

  defaultRequestType = 'trial',

  onClose,

  onSuccess,

}: {

  open: boolean;

  mentorId: string;

  mentorName: string;

  defaultRequestType?: ContactRequestType;

  onClose: () => void;

  onSuccess?: () => void;

}) {

  const tr = useStrings();

  const roleBase = useRoleBase();

  const user = useAuthStore((s) => s.user);

  const role = user?.role;

  const isParent = role === 'parent';

  const [submitted, setSubmitted] = useState(false);



  const profileQuery = useQuery({

    queryKey: user?.id ? qk.profile(user.id) : ['profile', 'none'],

    queryFn: () => profileService.getMe(),

    enabled: open && isParent && Boolean(user?.id),

  });



  const linkedStudents = profileQuery.data?.parent_profile?.linked_students ?? [];



  const form = useForm<FormValues>({

    resolver: zodResolver(schema),

    defaultValues: {

      request_type: defaultRequestType,

      subject: '',

      grade_level: '',

      message: '',

    },

  });



  useEffect(() => {

    if (open) {

      form.reset({

        request_type: defaultRequestType,

        subject: '',

        grade_level: '',

        message: '',

        student_id: linkedStudents.length === 1 ? linkedStudents[0]?.id : undefined,

      });

      setSubmitted(false);

    }

  }, [open, defaultRequestType, form, linkedStudents]);



  useEffect(() => {

    if (linkedStudents.length === 1 && linkedStudents[0]?.id) {

      form.setValue('student_id', linkedStudents[0].id);

    }

  }, [linkedStudents, form]);



  const mutation = useMutation({

    mutationFn: (values: FormValues) => {

      const studentId = resolveStudentId(role, values, linkedStudents);

      return contactRequestsService.createForMentor(mentorId, {

        request_type: values.request_type,

        student_id: studentId,

        subject: values.subject,

        exam_type: values.exam_type,

        grade_level: values.grade_level,

        preferred_teaching_format: values.preferred_teaching_format,

        preferred_days: values.preferred_days

          ? values.preferred_days.split(',').map((d) => d.trim()).filter(Boolean)

          : undefined,

        preferred_time_slots: values.preferred_time_slots

          ? values.preferred_time_slots.split(',').map((t) => t.trim()).filter(Boolean)

          : undefined,

        message: values.message,

      });

    },

    onSuccess: () => {

      setSubmitted(true);

      onSuccess?.();

    },

    onError: (e) => toast.error(normAxios(e)),

  });



  const handleSubmit = (values: FormValues) => {

    if (isParent) {

      const studentId = resolveStudentId(role, values, linkedStudents);

      if (!studentId) {

        form.setError('student_id', { message: tr.selectStudentHint });

        return;

      }

    }

    mutation.mutate(values);

  };



  const parentMissingStudent = isParent && !profileQuery.isPending && linkedStudents.length === 0;



  const footer = submitted ? (

    <div className="flex flex-wrap justify-end gap-2">

      <Button type="button" variant="primary" size="sm" onClick={onClose}>

        {tr.close}

      </Button>

    </div>

  ) : (

    <div className="flex flex-wrap justify-end gap-2">

      <Button type="button" variant="ghost" size="sm" onClick={onClose}>

        {tr.cancel}

      </Button>

      <Button

        type="button"

        variant="primary"

        size="sm"

        isLoading={mutation.isPending}

        disabled={parentMissingStudent || (isParent && profileQuery.isPending)}

        onClick={() => void form.handleSubmit(handleSubmit)()}

      >

        {tr.sendRequest}

      </Button>

    </div>

  );



  return (

    <Modal open={open} title={tr.contactMentorTitle} onClose={onClose} footer={footer}>

      {submitted ? (

        <div className="space-y-3 text-sm text-[var(--color-m-text-muted)]">

          <p className="font-medium text-[var(--color-m-text)]">{tr.contactRequestSuccessTitle}</p>

          <p>{tr.contactRequestSuccessBody}</p>

        </div>

      ) : (

        <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>

          <p className="text-sm text-[var(--color-m-text-secondary)]">

            {tr.contactMentorIntro.replace('{name}', mentorName)}

          </p>



          <fieldset>

            <legend className="mb-2 text-sm font-medium text-[var(--color-m-text)]">{tr.requestType}</legend>

            <div className="flex flex-wrap gap-2">

              {(

                [

                  ['trial', tr.requestTypeTrial],

                  ['contact', tr.requestTypeContact],

                  ['regular_lesson', tr.requestTypeRegular],

                ] as const

              ).map(([value, label]) => (

                <button

                  key={value}

                  type="button"

                  className={`rounded-full border px-3 py-1 text-sm ${

                    form.watch('request_type') === value

                      ? 'border-[var(--color-brand-primary)] bg-[var(--color-brand-primary)]/15 text-[var(--color-m-text)]'

                      : 'border-[var(--color-m-card-border)] text-[var(--color-m-text-muted)]'

                  }`}

                  onClick={() => form.setValue('request_type', value)}

                >

                  {label}

                </button>

              ))}

            </div>

          </fieldset>



          {isParent ? (

            <div>

              <label className="mb-1 block text-sm font-medium text-[var(--color-m-text)]">

                {tr.selectStudent} *

              </label>

              <p className="mb-2 text-xs text-[var(--color-m-text-muted)]">{tr.selectStudentHint}</p>

              {profileQuery.isPending ? (

                <div className="flex items-center gap-2 py-2 text-sm text-[var(--color-m-text-muted)]">

                  <Spinner className="size-4" />

                  {tr.loading}

                </div>

              ) : linkedStudents.length === 0 ? (

                <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-3 text-sm text-amber-100">

                  <p>{tr.contactNoLinkedStudents}</p>

                  <Link

                    to={`${roleBase}/students`}

                    className="mt-2 inline-block font-medium text-[var(--color-brand-primary)] hover:underline"

                    onClick={onClose}

                  >

                    {tr.navMyStudents} →

                  </Link>

                </div>

              ) : linkedStudents.length === 1 ? (

                <div className="rounded-xl border border-[var(--color-m-card-border)] bg-[var(--color-m-hover-overlay)] px-3 py-2.5 text-sm text-[var(--color-m-text)]">

                  {linkedStudents[0]?.name}

                </div>

              ) : (

                <DropdownSelect

                  value={form.watch('student_id') ?? ''}

                  onChange={(v) => {

                    form.setValue('student_id', v, { shouldValidate: true });

                    form.clearErrors('student_id');

                  }}

                  options={[

                    { value: '', label: tr.selectStudent },

                    ...linkedStudents.map((s) => ({

                      value: s.id,

                      label: s.name,

                    })),

                  ]}

                />

              )}

              {form.formState.errors.student_id ? (

                <p className="mt-1 text-xs text-rose-400">{form.formState.errors.student_id.message}</p>

              ) : null}

            </div>

          ) : null}



          <div>

            <label className="mb-1 block text-sm font-medium text-[var(--color-m-text)]">{tr.subjectField} *</label>

            <Input {...form.register('subject')} />

            {form.formState.errors.subject ? (

              <p className="mt-1 text-xs text-rose-400">{tr.fieldRequired}</p>

            ) : null}

          </div>



          <div>

            <label className="mb-1 block text-sm font-medium text-[var(--color-m-text)]">{tr.examType}</label>

            <Input {...form.register('exam_type')} />

          </div>



          <div>

            <label className="mb-1 block text-sm font-medium text-[var(--color-m-text)]">{tr.gradeLevel} *</label>

            <Input {...form.register('grade_level')} />

            {form.formState.errors.grade_level ? (

              <p className="mt-1 text-xs text-rose-400">{tr.fieldRequired}</p>

            ) : null}

          </div>



          <div>

            <label className="mb-1 block text-sm font-medium text-[var(--color-m-text)]">{tr.teachingFormat}</label>

            <DropdownSelect

              value={form.watch('preferred_teaching_format') ?? ''}

              onChange={(v) => form.setValue('preferred_teaching_format', v)}

              options={[

                { value: '', label: tr.anyFormat },

                { value: 'online', label: tr.formatOnline },

                { value: 'in_person', label: tr.formatInPerson },

                { value: 'hybrid', label: tr.formatHybrid },

              ]}

            />

          </div>



          <div>

            <label className="mb-1 block text-sm font-medium text-[var(--color-m-text)]">{tr.preferredDays}</label>

            <Input placeholder={tr.preferredDaysHint} {...form.register('preferred_days')} />

          </div>



          <div>

            <label className="mb-1 block text-sm font-medium text-[var(--color-m-text)]">{tr.preferredTimeSlots}</label>

            <Input placeholder={tr.preferredTimeSlotsHint} {...form.register('preferred_time_slots')} />

          </div>



          <div>

            <label className="mb-1 block text-sm font-medium text-[var(--color-m-text)]">{tr.messageLabel}</label>

            <Textarea

              rows={4}

              placeholder={tr.contactMessagePlaceholder}

              {...form.register('message')}

            />

          </div>

        </form>

      )}

    </Modal>

  );

}

