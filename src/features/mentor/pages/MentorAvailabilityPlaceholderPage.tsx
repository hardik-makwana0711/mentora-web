import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { format, parseISO, startOfToday } from 'date-fns';
import { getDateFnsLocale, getWeekDays } from '@/lib/date-locale';
import { Plus, Trash2, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { ErrorState } from '@/components/ui/ErrorState';
import { useStrings } from '@/constants/strings';
import { qk } from '@/constants/query-keys';
import { cn } from '@/lib/utils';
import {
  fetchMentorAvailability,
  putMentorAvailability,
  type TimeRange,
  type MentorAvailabilityPayload,
  type AvailabilityOverride,
} from '@/services/mentor-availability.service';

type WeeklyRules = Record<number, TimeRange[]>;

interface DateOverride {
  date: string;
  unavailable: boolean;
  custom_ranges: { start_time: string; end_time: string }[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────

function apiPayloadToWeeklyRules(payload: MentorAvailabilityPayload): WeeklyRules {
  const state: WeeklyRules = { 1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 7: [] };
  for (const item of payload.weeklyAvailability) {
    state[item.dayOfWeek] = item.ranges ?? [];
  }
  return state;
}

function apiPayloadToOverrides(payload: MentorAvailabilityPayload): DateOverride[] {
  return payload.overrides.map((ov) => {
    if (ov.kind === 'unavailable') {
      return { date: ov.date, unavailable: true, custom_ranges: [] };
    }
    return {
      date: ov.date,
      unavailable: false,
      custom_ranges: ov.ranges.map((r) => ({ start_time: r.startTime, end_time: r.endTime })),
    };
  });
}

function buildSavePayload(
  weeklyRules: WeeklyRules,
  overrides: DateOverride[]
): MentorAvailabilityPayload {
  const weeklyAvailability = Object.entries(weeklyRules)
    .filter(([, ranges]) => ranges.length > 0)
    .map(([day, ranges]) => ({ dayOfWeek: Number(day), ranges }));

  const mappedOverrides: AvailabilityOverride[] = overrides.map((ov) => {
    if (ov.unavailable || ov.custom_ranges.length === 0) {
      return { date: ov.date, kind: 'unavailable' };
    }
    return {
      date: ov.date,
      kind: 'custom_hours',
      ranges: ov.custom_ranges.map((r) => ({
        startTime: r.start_time,
        endTime: r.end_time,
      })),
    };
  });

  return { weeklyAvailability, overrides: mappedOverrides };
}

function hasTimeOverlap(ranges: TimeRange[], start: string, end: string, skipIdx = -1): boolean {
  for (let i = 0; i < ranges.length; i++) {
    if (i === skipIdx) continue;
    const r = ranges[i]!;
    if (start < r.endTime && end > r.startTime) return true;
  }
  return false;
}

function formatTime(t: string) {
  const [h, m] = t.split(':').map(Number);
  const suffix = h! >= 12 ? 'PM' : 'AM';
  const hour = h! % 12 || 12;
  return `${hour}:${m!.toString().padStart(2, '0')} ${suffix}`;
}

// ─── Time Edit Modal ──────────────────────────────────────────────────────

interface TimeModalProps {
  open: boolean;
  startTime: string;
  endTime: string;
  isUnavailable?: boolean;
  showUnavailable?: boolean;
  onStartChange: (v: string) => void;
  onEndChange: (v: string) => void;
  onUnavailableChange?: (v: boolean) => void;
  onApply: () => void;
  onCancel: () => void;
}

function TimeModal({
  open,
  startTime,
  endTime,
  isUnavailable,
  showUnavailable,
  onStartChange,
  onEndChange,
  onUnavailableChange,
  onApply,
  onCancel,
}: TimeModalProps) {
  const tr = useStrings();
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <div className="absolute inset-0 bg-black/60" onClick={onCancel} />
      <div className="relative z-10 w-full max-w-sm rounded-t-2xl border border-[var(--color-m-card-border)] bg-[var(--color-m-card)] p-6 shadow-xl sm:rounded-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-base font-semibold text-[var(--color-m-text)]">{tr.availabilitySelectTime}</h3>
          <button type="button" onClick={onCancel} className="rounded-lg p-1 text-[var(--color-m-text-muted)] hover:bg-[var(--color-m-hover-overlay)]">
            <X className="size-5" />
          </button>
        </div>

        {showUnavailable && (
          <label className="mb-4 flex cursor-pointer items-center gap-3">
            <div
              className={cn(
                'relative h-6 w-11 rounded-full transition-colors',
                isUnavailable ? 'bg-[var(--color-m-error)]' : 'bg-[var(--color-m-card-border)]'
              )}
              onClick={() => onUnavailableChange?.(!isUnavailable)}
            >
              <span
                className={cn(
                  'absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform',
                  isUnavailable ? 'translate-x-5' : 'translate-x-0.5'
                )}
              />
            </div>
            <span className="text-sm text-[var(--color-m-text-secondary)]">{tr.availabilityDayUnavailable}</span>
          </label>
        )}

        {!isUnavailable && (
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-xs font-medium text-[var(--color-m-text-muted)]">{tr.availabilityStartTime}</label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => onStartChange(e.target.value)}
                className="w-full rounded-xl border border-[var(--color-m-card-border)] bg-[var(--color-surface-bg)] px-4 py-3 text-base text-[var(--color-m-text)] outline-none focus:border-[var(--color-brand-primary)]"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-[var(--color-m-text-muted)]">{tr.availabilityEndTime}</label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => onEndChange(e.target.value)}
                className="w-full rounded-xl border border-[var(--color-m-card-border)] bg-[var(--color-surface-bg)] px-4 py-3 text-base text-[var(--color-m-text)] outline-none focus:border-[var(--color-brand-primary)]"
              />
            </div>
          </div>
        )}

        <div className="mt-6 flex gap-3">
          <Button type="button" variant="secondary" onClick={onCancel} className="flex-1">
            {tr.cancel}
          </Button>
          <Button type="button" onClick={onApply} className="flex-1">
            {tr.apply}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Weekly Hours Tab ────────────────────────────────────────────────────

interface WeeklyHoursProps {
  weeklyRules: WeeklyRules;
  onRulesChange: (rules: WeeklyRules) => void;
}

function WeeklyHoursTab({ weeklyRules, onRulesChange }: WeeklyHoursProps) {
  const tr = useStrings();
  const DAYS = getWeekDays();
  const [modalOpen, setModalOpen] = useState(false);
  const [editDay, setEditDay] = useState<number>(1);
  const [editIdx, setEditIdx] = useState<number>(-1);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('17:00');
  const [useSameHours, setUseSameHours] = useState(false);

  function openAddRange(dayVal: number) {
    const currentRanges = weeklyRules[dayVal] ?? [];
    let sd = '09:00';
    let ed = '17:00';
    if (currentRanges.length > 0) {
      const last = currentRanges[currentRanges.length - 1]!;
      const [h] = last.endTime.split(':').map(Number);
      const nextH = Math.min(h! + 1, 23);
      sd = last.endTime;
      ed = `${nextH.toString().padStart(2, '0')}:00`;
    }
    setEditDay(dayVal);
    setEditIdx(currentRanges.length);
    setStartTime(sd);
    setEndTime(ed);
    setModalOpen(true);
  }

  function openEditRange(dayVal: number, idx: number, range: TimeRange) {
    setEditDay(dayVal);
    setEditIdx(idx);
    setStartTime(range.startTime);
    setEndTime(range.endTime);
    setModalOpen(true);
  }

  function applyRange() {
    if (startTime >= endTime) {
      toast.error(tr.availabilityStartBeforeEnd);
      return;
    }
    const targetDay = useSameHours ? 1 : editDay;
    const current = weeklyRules[targetDay] ?? [];
    if (hasTimeOverlap(current, startTime, endTime, editIdx)) {
      toast.error(tr.availabilityTimeOverlap);
      return;
    }

    const newRange: TimeRange = { startTime, endTime };
    const newRules = { ...weeklyRules };

    if (useSameHours) {
      DAYS.forEach((d) => {
        const existing = [...(weeklyRules[d.val] ?? [])];
        if (editIdx >= existing.length) {
          existing.push(newRange);
        } else {
          existing[editIdx] = newRange;
        }
        newRules[d.val] = existing;
      });
    } else {
      const updated = [...current];
      if (editIdx >= updated.length) {
        updated.push(newRange);
      } else {
        updated[editIdx] = newRange;
      }
      newRules[editDay] = updated;
    }

    onRulesChange(newRules);
    setModalOpen(false);
  }

  function deleteRange(dayVal: number, idx: number) {
    const newRules = { ...weeklyRules };
    if (useSameHours) {
      DAYS.forEach((d) => {
        newRules[d.val] = (weeklyRules[d.val] ?? []).filter((_, i) => i !== idx);
      });
    } else {
      newRules[dayVal] = (weeklyRules[dayVal] ?? []).filter((_, i) => i !== idx);
    }
    onRulesChange(newRules);
  }

  function toggleDay(dayVal: number) {
    const current = weeklyRules[dayVal] ?? [];
    const newRules = { ...weeklyRules };
    if (current.length > 0) {
      newRules[dayVal] = [];
      if (useSameHours) setUseSameHours(false);
    } else {
      newRules[dayVal] = [{ startTime: '09:00', endTime: '17:00' }];
    }
    onRulesChange(newRules);
  }

  function toggleSameHours(val: boolean) {
    setUseSameHours(val);
    if (val) {
      const base = weeklyRules[1]?.length ? weeklyRules[1] : [{ startTime: '09:00', endTime: '17:00' }];
      const newRules: WeeklyRules = {};
      DAYS.forEach((d) => { newRules[d.val] = [...base]; });
      onRulesChange(newRules);
    }
  }

  const sampleRanges = useSameHours ? (weeklyRules[1] ?? []) : [];

  return (
    <>
      {/* Day circles */}
      <div className="flex gap-2">
        {DAYS.map((day) => {
          const active = (weeklyRules[day.val] ?? []).length > 0;
          return (
            <button
              key={day.val}
              type="button"
              onClick={() => toggleDay(day.val)}
              className={cn(
                'flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold transition-colors',
                active
                  ? 'bg-[var(--color-brand-primary)] text-[var(--color-m-text)]'
                  : 'border border-[var(--color-m-card-border)] text-[var(--color-m-text-muted)] hover:border-[var(--color-brand-primary)] hover:text-[var(--color-m-text)]'
              )}
            >
              {day.short}
            </button>
          );
        })}
      </div>

      {/* Same-hours toggle */}
      <label className="mt-4 flex cursor-pointer items-center gap-3">
        <div
          className={cn(
            'relative h-6 w-11 rounded-full transition-colors',
            useSameHours ? 'bg-[var(--color-brand-primary)]' : 'bg-[var(--color-m-card-border)]'
          )}
          onClick={() => toggleSameHours(!useSameHours)}
        >
          <span
            className={cn(
              'absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform',
              useSameHours ? 'translate-x-5' : 'translate-x-0.5'
            )}
          />
        </div>
        <span className="text-sm text-[var(--color-m-text-secondary)]">{tr.availabilitySameHoursAllDays}</span>
      </label>

      {/* Per-day or unified rows */}
      <div className="mt-6 space-y-4">
        {useSameHours ? (
          <div className="rounded-xl border border-[var(--color-m-card-border)] bg-[var(--color-m-card)] p-4">
            <p className="mb-3 text-sm font-semibold text-[var(--color-m-text)]">{tr.availabilityAllDays}</p>
            {sampleRanges.map((range, idx) => (
              <div key={idx} className="mb-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => openEditRange(1, idx, range)}
                  className="flex-1 rounded-lg border border-[var(--color-m-card-border)] px-3 py-2 text-left text-sm text-[var(--color-m-text)] hover:border-[var(--color-brand-primary)]"
                >
                  {formatTime(range.startTime)} – {formatTime(range.endTime)}
                </button>
                <button
                  type="button"
                  onClick={() => deleteRange(1, idx)}
                  className="rounded-lg p-2 text-[var(--color-m-text-muted)] hover:bg-[var(--color-m-hover-overlay)] hover:text-[var(--color-m-error)]"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => openAddRange(1)}
              className="mt-1 flex items-center gap-1 text-sm text-[var(--color-brand-primary)] hover:underline"
            >
              <Plus className="size-4" /> {tr.availabilityAddRange}
            </button>
          </div>
        ) : (
          DAYS.map((day) => {
            const ranges = weeklyRules[day.val] ?? [];
            const active = ranges.length > 0;
            if (!active) return null;
            return (
              <div
                key={day.val}
                className="rounded-xl border border-[var(--color-m-card-border)] bg-[var(--color-m-card)] p-4"
              >
                <p className="mb-3 text-sm font-semibold text-[var(--color-m-text)]">{day.full}</p>
                {ranges.map((range, idx) => (
                  <div key={idx} className="mb-2 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => openEditRange(day.val, idx, range)}
                      className="flex-1 rounded-lg border border-[var(--color-m-card-border)] px-3 py-2 text-left text-sm text-[var(--color-m-text)] hover:border-[var(--color-brand-primary)]"
                    >
                      {formatTime(range.startTime)} – {formatTime(range.endTime)}
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteRange(day.val, idx)}
                      className="rounded-lg p-2 text-[var(--color-m-text-muted)] hover:bg-[var(--color-m-hover-overlay)] hover:text-[var(--color-m-error)]"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => openAddRange(day.val)}
                  className="mt-1 flex items-center gap-1 text-sm text-[var(--color-brand-primary)] hover:underline"
                >
                  <Plus className="size-4" /> {tr.availabilityAddRange}
                </button>
              </div>
            );
          })
        )}
      </div>

      <TimeModal
        open={modalOpen}
        startTime={startTime}
        endTime={endTime}
        onStartChange={setStartTime}
        onEndChange={setEndTime}
        onApply={applyRange}
        onCancel={() => setModalOpen(false)}
      />
    </>
  );
}

// ─── Date Overrides Tab ───────────────────────────────────────────────────

interface OverridesTabProps {
  overrides: DateOverride[];
  onOverridesChange: (overrides: DateOverride[]) => void;
}

function buildCalendarMonth(year: number, month: number) {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startWeekday = (firstDay.getDay() + 6) % 7; // Mon=0
  const days: (number | null)[] = Array(startWeekday).fill(null);
  for (let d = 1; d <= lastDay.getDate(); d++) days.push(d);
  while (days.length % 7 !== 0) days.push(null);
  return days;
}

function OverridesTab({ overrides, onOverridesChange }: OverridesTabProps) {
  const tr = useStrings();
  const DAYS = getWeekDays();
  const dateLocale = getDateFnsLocale();
  const today = startOfToday();
  const [calYear, setCalYear] = useState(today.getFullYear());
  const [calMonth, setCalMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editRangeIdx, setEditRangeIdx] = useState(-1);
  const [isUnavailable, setIsUnavailable] = useState(false);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('17:00');

  const calDays = buildCalendarMonth(calYear, calMonth);
  const monthLabel = format(new Date(calYear, calMonth, 1), 'MMMM yyyy', { locale: dateLocale });

  function prevMonth() {
    if (calMonth === 0) { setCalYear(y => y - 1); setCalMonth(11); }
    else setCalMonth(m => m - 1);
  }
  function nextMonth() {
    if (calMonth === 11) { setCalYear(y => y + 1); setCalMonth(0); }
    else setCalMonth(m => m + 1);
  }

  function dateString(day: number) {
    return `${calYear}-${String(calMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  }

  function isToday(day: number) {
    return dateString(day) === format(today, 'yyyy-MM-dd');
  }

  function isPast(day: number) {
    return new Date(calYear, calMonth, day) < today;
  }

  function getOverride(date: string) {
    return overrides.find((o) => o.date === date);
  }

  function handleDayClick(day: number) {
    if (isPast(day)) return;
    const ds = dateString(day);
    setSelectedDate(ds);
    const existing = getOverride(ds);
    setIsUnavailable(existing?.unavailable ?? false);
    const lastRange = existing?.custom_ranges?.[existing.custom_ranges.length - 1];
    if (lastRange) {
      setStartTime(lastRange.end_time);
      const [h] = lastRange.end_time.split(':').map(Number);
      setEndTime(`${Math.min(h! + 1, 23).toString().padStart(2, '0')}:00`);
    } else {
      setStartTime('09:00');
      setEndTime('17:00');
    }
    setEditRangeIdx(existing?.custom_ranges?.length ?? 0);
    setModalOpen(true);
  }

  function openEditOverrideRange(date: string, idx: number, range: { start_time: string; end_time: string }) {
    setSelectedDate(date);
    setStartTime(range.start_time);
    setEndTime(range.end_time);
    setEditRangeIdx(idx);
    setIsUnavailable(false);
    setModalOpen(true);
  }

  function applyOverride() {
    if (!selectedDate) return;
    if (!isUnavailable && startTime >= endTime) {
      toast.error(tr.availabilityStartBeforeEnd);
      return;
    }
    const existing = getOverride(selectedDate);
    const existingRanges = existing?.custom_ranges ?? [];

    if (!isUnavailable) {
      const asTimeRange: TimeRange[] = existingRanges.map(r => ({ startTime: r.start_time, endTime: r.end_time }));
      if (hasTimeOverlap(asTimeRange, startTime, endTime, editRangeIdx)) {
        toast.error(tr.availabilityTimeOverlap);
        return;
      }
    }

    const newOverrides = overrides.filter((o) => o.date !== selectedDate);
    if (isUnavailable) {
      newOverrides.push({ date: selectedDate, unavailable: true, custom_ranges: [] });
    } else {
      const updatedRanges = [...existingRanges];
      const newRange = { start_time: startTime, end_time: endTime };
      if (editRangeIdx >= updatedRanges.length) {
        updatedRanges.push(newRange);
      } else {
        updatedRanges[editRangeIdx] = newRange;
      }
      newOverrides.push({ date: selectedDate, unavailable: false, custom_ranges: updatedRanges });
    }

    onOverridesChange(newOverrides.sort((a, b) => a.date.localeCompare(b.date)));
    setModalOpen(false);
  }

  function deleteOverride(date: string) {
    onOverridesChange(overrides.filter((o) => o.date !== date));
  }

  function deleteOverrideRange(date: string, idx: number) {
    const newOverrides = overrides.map((o) => {
      if (o.date !== date) return o;
      const ranges = o.custom_ranges.filter((_, i) => i !== idx);
      return { ...o, custom_ranges: ranges, unavailable: ranges.length === 0 };
    }).filter((o) => o.custom_ranges.length > 0 || o.unavailable);
    onOverridesChange(newOverrides);
  }

  const sortedOverrides = [...overrides].sort((a, b) => a.date.localeCompare(b.date));

  return (
    <>
      {/* Calendar */}
      <div className="rounded-xl border border-[var(--color-m-card-border)] bg-[var(--color-m-card)] p-4">
        <div className="mb-4 flex items-center justify-between">
          <button type="button" onClick={prevMonth} className="rounded-lg p-1 text-[var(--color-m-text-muted)] hover:bg-[var(--color-m-hover-overlay)] hover:text-[var(--color-m-text)]">
            <ChevronLeft className="size-5" />
          </button>
          <p className="text-sm font-semibold capitalize text-[var(--color-m-text)]">{monthLabel}</p>
          <button type="button" onClick={nextMonth} className="rounded-lg p-1 text-[var(--color-m-text-muted)] hover:bg-[var(--color-m-hover-overlay)] hover:text-[var(--color-m-text)]">
            <ChevronRight className="size-5" />
          </button>
        </div>

        <div className="mb-2 grid grid-cols-7 gap-1 text-center text-xs text-[var(--color-m-text-muted)]">
          {DAYS.map((d) => (
            <div key={d.val}>{d.short}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {calDays.map((day, i) => {
            if (day === null) return <div key={`empty-${i}`} />;
            const ds = dateString(day);
            const override = getOverride(ds);
            const past = isPast(day);
            return (
              <button
                key={ds}
                type="button"
                disabled={past}
                onClick={() => handleDayClick(day)}
                className={cn(
                  'relative flex h-9 w-full items-center justify-center rounded-lg text-sm transition-colors',
                  past && 'cursor-not-allowed text-[var(--color-m-text-muted)] opacity-40',
                  !past && !override && 'text-[var(--color-m-text)] hover:bg-[var(--color-m-hover-overlay)]',
                  isToday(day) && !override && 'font-bold text-[var(--color-brand-primary)]',
                  override?.unavailable && 'bg-[var(--color-m-error)]/20 font-semibold text-[var(--color-m-error)]',
                  override && !override.unavailable && 'bg-[var(--color-brand-primary)]/20 font-semibold text-[var(--color-brand-primary)]'
                )}
              >
                {day}
                {override && (
                  <span className="absolute bottom-0.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-current" />
                )}
              </button>
            );
          })}
        </div>

        <div className="mt-3 flex items-center gap-4 text-xs text-[var(--color-m-text-muted)]">
          <span className="flex items-center gap-1">
            <span className="inline-block h-2 w-2 rounded-full bg-[var(--color-brand-primary)]" />
            {tr.availabilityCustomHours}
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block h-2 w-2 rounded-full bg-[var(--color-m-error)]" />
            {tr.availabilityUnavailable}
          </span>
        </div>
      </div>

      {/* Override list */}
      {sortedOverrides.length > 0 && (
        <div className="mt-6 space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-[var(--color-m-text-muted)]">
            {tr.availabilityDateOverridesHeader}
          </h3>
          {sortedOverrides.map((ov) => {
            const dateObj = parseISO(ov.date + 'T12:00:00');
            const label = format(dateObj, 'd MMMM yyyy, EEEE', { locale: dateLocale });
            return (
              <div key={ov.date} className="rounded-xl border border-[var(--color-m-card-border)] bg-[var(--color-m-card)] p-4">
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-sm font-semibold capitalize text-[var(--color-m-text)]">{label}</p>
                  <button
                    type="button"
                    onClick={() => deleteOverride(ov.date)}
                    className="rounded-lg p-1 text-[var(--color-m-text-muted)] hover:bg-[var(--color-m-hover-overlay)] hover:text-[var(--color-m-error)]"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>

                {ov.unavailable ? (
                  <p className="text-sm text-[var(--color-m-error)]">{tr.availabilityUnavailable}</p>
                ) : (
                  <>
                    {ov.custom_ranges.map((r, idx) => (
                      <div key={idx} className="mb-2 flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => openEditOverrideRange(ov.date, idx, r)}
                          className="flex-1 rounded-lg border border-[var(--color-m-card-border)] px-3 py-2 text-left text-sm text-[var(--color-m-text)] hover:border-[var(--color-brand-primary)]"
                        >
                          {formatTime(r.start_time)} – {formatTime(r.end_time)}
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteOverrideRange(ov.date, idx)}
                          className="rounded-lg p-2 text-[var(--color-m-text-muted)] hover:bg-[var(--color-m-hover-overlay)] hover:text-[var(--color-m-error)]"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => {
                        const last = ov.custom_ranges[ov.custom_ranges.length - 1];
                        const [h] = (last?.end_time ?? '09:00').split(':').map(Number);
                        setSelectedDate(ov.date);
                        setStartTime(last?.end_time ?? '09:00');
                        setEndTime(`${Math.min(h! + 1, 23).toString().padStart(2, '0')}:00`);
                        setEditRangeIdx(ov.custom_ranges.length);
                        setIsUnavailable(false);
                        setModalOpen(true);
                      }}
                      className="mt-1 flex items-center gap-1 text-sm text-[var(--color-brand-primary)] hover:underline"
                    >
                      <Plus className="size-4" /> {tr.availabilityAddRange}
                    </button>
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}

      <TimeModal
        open={modalOpen}
        startTime={startTime}
        endTime={endTime}
        isUnavailable={isUnavailable}
        showUnavailable
        onStartChange={setStartTime}
        onEndChange={setEndTime}
        onUnavailableChange={setIsUnavailable}
        onApply={applyOverride}
        onCancel={() => setModalOpen(false)}
      />
    </>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────

export default function MentorAvailabilityPlaceholderPage() {
  const tr = useStrings();
  const qc = useQueryClient();

  const availabilityQuery = useQuery({
    queryKey: qk.mentorAvailability,
    queryFn: fetchMentorAvailability,
  });

  const [activeTab, setActiveTab] = useState<'hours' | 'overrides'>('hours');
  const [weeklyRules, setWeeklyRules] = useState<WeeklyRules>({
    1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 7: [],
  });
  const [overrides, setOverrides] = useState<DateOverride[]>([]);
  const [initialized, setInitialized] = useState(false);

  // Sync from API on first load
  if (!initialized && availabilityQuery.data) {
    const wRules = apiPayloadToWeeklyRules(availabilityQuery.data);
    const ovs = apiPayloadToOverrides(availabilityQuery.data);
    setWeeklyRules(wRules);
    setOverrides(ovs);
    setInitialized(true);
  }

  const saveMutation = useMutation({
    mutationFn: (payload: MentorAvailabilityPayload) => putMentorAvailability(payload),
    onSuccess: async () => {
      toast.success(tr.availabilitySaveSuccess);
      await qc.invalidateQueries({ queryKey: qk.mentorAvailability });
    },
    onError: () => toast.error(tr.availabilitySaveError),
  });

  function handleSave() {
    const payload = buildSavePayload(weeklyRules, overrides);
    saveMutation.mutate(payload);
  }

  if (availabilityQuery.isPending) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Spinner className="size-10 border-[var(--color-brand-primary)]/30 border-t-[var(--color-brand-primary)]" />
      </div>
    );
  }

  if (availabilityQuery.isError) {
    return (
      <ErrorState
        title={tr.availabilityLoadError}
        onRetry={() => void availabilityQuery.refetch()}
      />
    );
  }

  return (
    <div>
      <PageHeader
        title={tr.navAvailability}
        description={tr.availabilityPageDescription}
      />

      {/* Tab selector */}
      <div className="mb-6 flex rounded-xl border border-[var(--color-m-card-border)] bg-[var(--color-m-card)] p-1">
        {(['hours', 'overrides'] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={cn(
              'flex-1 rounded-lg py-2 text-sm font-semibold transition-colors',
              activeTab === tab
                ? 'bg-[var(--color-surface-bg)] text-[var(--color-m-text)] shadow'
                : 'text-[var(--color-m-text-muted)] hover:text-[var(--color-m-text)]'
            )}
          >
            {tab === 'hours' ? tr.availabilityTabWeeklyHours : tr.availabilityTabDateOverrides}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="space-y-4">
        {activeTab === 'hours' ? (
          <WeeklyHoursTab weeklyRules={weeklyRules} onRulesChange={setWeeklyRules} />
        ) : (
          <OverridesTab overrides={overrides} onOverridesChange={setOverrides} />
        )}
      </div>

      {/* Save / Cancel */}
      <div className="mt-8 flex gap-3 border-t border-[var(--color-m-card-border)] pt-6">
        <Button
          type="button"
          variant="secondary"
          onClick={() => {
            if (availabilityQuery.data) {
              setWeeklyRules(apiPayloadToWeeklyRules(availabilityQuery.data));
              setOverrides(apiPayloadToOverrides(availabilityQuery.data));
            }
          }}
          disabled={saveMutation.isPending}
        >
          {tr.cancel}
        </Button>
        <Button
          type="button"
          onClick={handleSave}
          isLoading={saveMutation.isPending}
        >
          {tr.save}
        </Button>
      </div>
    </div>
  );
}
