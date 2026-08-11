import i18n from '@/i18n';

/** Map API notification copy (English from backend) to the active UI language. */
export function translateNotificationText(title?: string, body?: string) {
  const rawTitle = title?.trim() ?? '';
  const rawBody = (body ?? '').trim();

  let displayTitle = rawTitle || i18n.t('notificationDefaultTitle');
  let displayBody = rawBody;

  if (rawTitle === 'New message') {
    displayTitle = i18n.t('notificationNewMessageTitle');
  }

  if (rawTitle === 'Assignment reminder') {
    displayTitle = i18n.t('notificationAssignmentReminderTitle');
  }

  if (rawTitle === 'Reminder') {
    displayTitle = i18n.t('notificationParentReminderTitle');
  }

  if (rawTitle === 'Missing assignment submissions') {
    displayTitle = i18n.t('notificationMissingSubmissionsTitle');
  }

  const sentMatch = /^(.+?)\s+sent you a message\.?$/i.exec(rawBody);
  if (sentMatch) {
    displayBody = i18n.t('notificationNewMessageBody', { name: sentMatch[1].trim() });
  }

  const studentDue3Match = /^Assignment reminder:\s*"(.+?)"\s+is due in 3 days\.?$/i.exec(rawBody);
  if (studentDue3Match) {
    displayBody = i18n.t('notificationAssignmentDue3DaysStudent', { title: studentDue3Match[1] });
  }

  const studentDue1Match = /^Assignment reminder:\s*"(.+?)"\s+is due tomorrow\.?$/i.exec(rawBody);
  if (studentDue1Match) {
    displayBody = i18n.t('notificationAssignmentDue1DayStudent', { title: studentDue1Match[1] });
  }

  const parentDue3Match = /^Reminder:\s*Your child has an assignment\s*"(.+?)"\s+due in 3 days\.?$/i.exec(rawBody);
  if (parentDue3Match) {
    displayBody = i18n.t('notificationAssignmentDue3DaysParent', { title: parentDue3Match[1] });
  }

  const parentDue1Match = /^Reminder:\s*Your child has an assignment\s*"(.+?)"\s+due tomorrow\.?$/i.exec(rawBody);
  if (parentDue1Match) {
    displayBody = i18n.t('notificationAssignmentDue1DayParent', { title: parentDue1Match[1] });
  }

  const parentMissingMatch = /^Your child has not submitted the assignment\s*"(.+?)"\.?$/i.exec(rawBody);
  if (parentMissingMatch) {
    displayBody = i18n.t('notificationAssignmentMissingParent', { title: parentMissingMatch[1] });
  }

  const mentorMissingMatch = /^(\d+)\s+students have not submitted\s+(.+)$/i.exec(rawBody);
  if (mentorMissingMatch) {
    displayBody = i18n.t('notificationAssignmentMissingMentor', {
      count: mentorMissingMatch[1],
      title: mentorMissingMatch[2],
    });
  }

  return { title: displayTitle, body: displayBody };
}
