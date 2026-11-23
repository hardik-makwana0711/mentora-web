import type { LegalSection } from '@/features/legal/components/LegalPageLayout';

export const privacyPolicyLastUpdated = 'November 23, 2026';

export const privacyPolicyIntro = [
  'This Privacy Policy explains how Aurion Ventures LLC ("Aurion Ventures," "Mentora," "we," "us," or "our") collects, uses, stores, and protects information when you use the Mentora mobile application, website, and related services.',
  'By using Mentora, you agree to the collection and use of information as described in this Privacy Policy.',
];

export const privacyPolicySections: LegalSection[] = [
  {
    title: 'Who We Are',
    blocks: [
      {
        type: 'p',
        text: 'Mentora is an education platform that helps parents, students, and mentors manage lessons, communicate, and access learning-related tools.',
      },
      {
        type: 'ul',
        items: [
          'Company: Aurion Ventures LLC',
          'App: Mentora',
          'Website: https://mentoratr.com',
          'Contact: info@mentoratr.com',
        ],
      },
    ],
  },
  {
    title: 'Who Can Use Mentora',
    blocks: [
      {
        type: 'p',
        text: 'Mentora accounts are intended to be created and managed by adults, such as parents, legal guardians, mentors, or authorized users.',
      },
      {
        type: 'p',
        text: 'Students may use Mentora only with the permission and supervision of a parent or legal guardian.',
      },
      {
        type: 'p',
        text: 'Mentora is not intended for children under the age of 13. We do not knowingly allow children under 13 to create accounts or use the service. If we learn that we have collected personal information from a child under 13 without proper authorization, we will take reasonable steps to delete that information.',
      },
    ],
  },
  {
    title: 'Information We Collect',
    blocks: [
      {
        type: 'p',
        text: 'We may collect the following types of information depending on how you use Mentora.',
      },
      { type: 'h3', text: 'Account Information' },
      {
        type: 'ul',
        items: [
          'Name and surname',
          'Email address',
          'Phone number',
          'Password or authentication information',
          'User role, such as parent, student, mentor, or administrator',
        ],
      },
      { type: 'h3', text: 'Parent and Student Information' },
      {
        type: 'ul',
        items: [
          'Parent or guardian profile information',
          'Student profile information created or managed by a parent or guardian',
          'Education level, grade, subjects, learning preferences, and lesson-related information',
          'Lesson history, bookings, and learning progress information',
        ],
      },
      { type: 'h3', text: 'Mentor Information' },
      {
        type: 'ul',
        items: [
          'Mentor profile information',
          'Education background',
          'Subjects taught',
          'Availability',
          'Lesson listings',
          'Experience, biography, and profile details',
          'Mentor-related service information',
        ],
      },
      { type: 'h3', text: 'Lesson and Booking Information' },
      {
        type: 'ul',
        items: [
          'Lesson requests',
          'Lesson dates and times',
          'Lesson status',
          'Mentor-student matching information',
          'Session details',
          'Google Meet or similar meeting links, if used for lessons',
        ],
      },
      { type: 'h3', text: 'Communication Information' },
      {
        type: 'ul',
        items: [
          'Messages sent through the app',
          'Lesson-related notes',
          'Support requests',
          'Reports, complaints, or safety-related messages',
          'Email and service notification records',
        ],
      },
      { type: 'h3', text: 'AI and Learning Information' },
      {
        type: 'p',
        text: 'Mentora may use AI-supported features to help generate lesson summaries, quizzes, learning assistance, recommendations, or educational insights.',
      },
      { type: 'p', text: 'For these features, Mentora may process:' },
      {
        type: 'ul',
        items: [
          'Lesson-related content',
          'Transcripts, if available',
          'Notes',
          'Educational materials provided by users',
          'User prompts or learning-related inputs',
          'AI-generated summaries, quizzes, or outputs',
        ],
      },
      {
        type: 'p',
        text: 'AI-generated content may not always be accurate or complete. Users should review important educational information and use their own judgment.',
      },
      { type: 'h3', text: 'Technical Information' },
      { type: 'p', text: 'We may collect technical information such as:' },
      {
        type: 'ul',
        items: [
          'Device type',
          'Operating system',
          'App version',
          'IP address',
          'Log data',
          'Crash data',
          'Performance data',
          'Security and authentication logs',
        ],
      },
      { type: 'h3', text: 'Payment Information' },
      { type: 'p', text: 'Mentora does not currently store full credit card information.' },
      {
        type: 'p',
        text: 'If payment features are introduced, payments may be processed by third-party payment providers. In that case, payment providers may process payment-related information according to their own privacy policies and security standards.',
      },
    ],
  },
  {
    title: 'How We Use Information',
    blocks: [
      { type: 'p', text: 'We use information to:' },
      {
        type: 'ul',
        items: [
          'Create and manage user accounts',
          'Provide parent, student, and mentor features',
          'Manage lesson bookings and lesson-related activity',
          'Enable communication between users',
          'Provide customer support',
          'Send service-related emails and notifications',
          'Generate AI-supported summaries, quizzes, and learning assistance',
          'Improve app performance and user experience',
          'Detect, prevent, and investigate fraud, misuse, safety issues, or unauthorized access',
          'Enforce our Terms and Conditions',
          'Comply with legal obligations',
        ],
      },
    ],
  },
  {
    title: 'Service Providers We Use',
    blocks: [
      {
        type: 'p',
        text: 'We may use trusted third-party service providers to operate and improve Mentora.',
      },
      { type: 'p', text: 'These may include:' },
      {
        type: 'ul',
        items: [
          'Amazon Web Services (AWS) for hosting and cloud infrastructure',
          'Elastic Email / SMTP services for transactional emails and service notifications',
          'Google Meet or similar video meeting tools for lesson links',
          'Gemini AI or similar AI service providers for AI-supported learning features',
          'Analytics, crash reporting, security, or operational tools',
          'Future payment processors, if payment features are introduced',
        ],
      },
      {
        type: 'p',
        text: 'These providers may process information only as needed to provide their services to Mentora.',
      },
    ],
  },
  {
    title: 'Google User Data',
    blocks: [
      {
        type: 'p',
        text: 'Mentora offers two optional Google features: signing in with Google, and connecting a Google Calendar so lessons are added to the calendar with a Google Meet link. This section explains what Google data we access and how we use it.',
      },
      { type: 'h3', text: 'Data We Access' },
      {
        type: 'ul',
        items: [
          'Sign in with Google (openid, email): your name, Google account email address, and Google account ID, used only to create your Mentora account and sign you in.',
          'Google Calendar (calendar.events): permission to create, update, and delete calendar events. Mentora uses it only for lesson events that Mentora itself creates.',
        ],
      },
      { type: 'h3', text: 'How We Use It' },
      {
        type: 'ul',
        items: [
          'When a lesson is booked, Mentora creates an event for that lesson in the connected calendar, with a Google Meet link, and invites the lesson participants.',
          'When a lesson is rescheduled, Mentora moves that event to the new time. When a lesson is cancelled, Mentora deletes that event.',
          'Mentora does not read, list, or change any other events in your calendar.',
        ],
      },
      { type: 'h3', text: 'Storage, Sharing, and Deletion' },
      {
        type: 'ul',
        items: [
          'We store the connected Google email address and an encrypted access token. The token is encrypted at rest and used only by our servers to manage lesson events.',
          'We do not sell Google user data, do not use it for advertising, and do not share it with third parties except as needed to provide these features or as required by law.',
          'People at Mentora do not read Google user data, except with your permission, for security purposes, or as required by law.',
          'You can disconnect Google Calendar at any time in your Mentora profile. We then revoke Mentora’s access with Google and delete the stored token. You can also remove access at https://myaccount.google.com/permissions, or email info@mentoratr.com to delete your data.',
        ],
      },
      {
        type: 'p',
        text: 'Mentora’s use and transfer of information received from Google APIs to any other app will adhere to the Google API Services User Data Policy (https://developers.google.com/terms/api-services-user-data-policy), including the Limited Use requirements.',
      },
    ],
  },
  {
    title: 'Sharing of Information',
    blocks: [
      { type: 'p', text: 'We do not sell users’ personal information.' },
      { type: 'p', text: 'We may share information only when necessary with:' },
      {
        type: 'ul',
        items: [
          'Service providers that help us operate Mentora',
          'Parents, students, and mentors when needed to provide the service',
          'Payment processors, if payment features are introduced',
          'Cloud hosting, email, communication, AI, analytics, or support providers',
          'Legal authorities if required by law',
          'Professional advisors, if needed for legal, accounting, compliance, or business purposes',
        ],
      },
    ],
  },
  {
    title: 'User Communication and Safety',
    blocks: [
      {
        type: 'p',
        text: 'Mentora may allow users to communicate through messages, lesson-related notes, reports, or other interactive features.',
      },
      {
        type: 'p',
        text: 'We may review, restrict, remove, or investigate content, messages, or accounts when necessary to:',
      },
      {
        type: 'ul',
        items: [
          'Protect users',
          'Respond to safety concerns',
          'Prevent abuse or misuse',
          'Enforce our Terms and Conditions',
          'Comply with legal obligations',
        ],
      },
      {
        type: 'p',
        text: 'Users may report inappropriate content, abusive behavior, safety concerns, or AI-generated content issues through in-app reporting features if available, or by contacting info@mentoratr.com.',
      },
    ],
  },
  {
    title: 'Notifications and Emails',
    blocks: [
      { type: 'p', text: 'Mentora may send service-related emails or notifications about:' },
      {
        type: 'ul',
        items: [
          'Account activity',
          'Lesson bookings',
          'Lesson reminders',
          'Messages',
          'Support requests',
          'Security alerts',
          'Important service updates',
        ],
      },
      {
        type: 'p',
        text: 'Users may control device notifications through their device settings where applicable.',
      },
    ],
  },
  {
    title: 'Data Storage and Security',
    blocks: [
      {
        type: 'p',
        text: 'We use reasonable technical and organizational measures to protect user information.',
      },
      {
        type: 'p',
        text: 'However, no method of transmission or storage over the internet is completely secure. We cannot guarantee absolute security, but we work to protect user data responsibly.',
      },
    ],
  },
  {
    title: 'Data Retention',
    blocks: [
      { type: 'p', text: 'We keep personal information only as long as necessary to:' },
      {
        type: 'ul',
        items: [
          'Provide Mentora services',
          'Maintain user accounts',
          'Resolve disputes',
          'Prevent fraud or misuse',
          'Comply with legal obligations',
          'Enforce our agreements',
        ],
      },
      { type: 'p', text: 'When information is no longer needed, we may delete or anonymize it.' },
    ],
  },
  {
    title: 'Account and Data Deletion',
    blocks: [
      { type: 'p', text: 'Users may request account deletion at any time.' },
      {
        type: 'p',
        text: 'If account deletion is available inside the app, users may delete their account from the account settings or relevant in-app deletion page.',
      },
      { type: 'p', text: 'Users may also request deletion by contacting info@mentoratr.com.' },
      {
        type: 'p',
        text: 'After receiving a deletion request, we will delete or anonymize personal information unless we are required or permitted to keep certain information for legal, security, fraud prevention, payment, dispute resolution, or compliance purposes.',
      },
    ],
  },
  {
    title: 'User Rights',
    blocks: [
      { type: 'p', text: 'Depending on your location, you may have the right to:' },
      {
        type: 'ul',
        items: [
          'Access your personal information',
          'Correct inaccurate information',
          'Request deletion of your information',
          'Object to certain processing',
          'Withdraw consent where applicable',
          'Request a copy of your information',
        ],
      },
      { type: 'p', text: 'To make a privacy request, contact info@mentoratr.com.' },
    ],
  },
  {
    title: 'International Data Processing',
    blocks: [
      {
        type: 'p',
        text: 'Your information may be processed and stored in countries other than your own.',
      },
      {
        type: 'p',
        text: 'We take reasonable steps to protect information in accordance with this Privacy Policy and applicable law.',
      },
    ],
  },
  {
    title: 'Changes to This Privacy Policy',
    blocks: [
      { type: 'p', text: 'We may update this Privacy Policy from time to time.' },
      {
        type: 'p',
        text: 'If we make important changes, we may notify users through the app, website, or email.',
      },
      {
        type: 'p',
        text: 'The updated version will be posted on this page with a new "Last updated" date.',
      },
    ],
  },
  {
    title: 'Contact Us',
    blocks: [
      {
        type: 'p',
        text: 'For questions about this Privacy Policy or your personal information, contact us at:',
      },
      {
        type: 'ul',
        items: [
          'Aurion Ventures LLC',
          'App: Mentora',
          'Email: info@mentoratr.com',
          'Website: https://mentoratr.com',
        ],
      },
    ],
  },
];
