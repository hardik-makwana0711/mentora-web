import type { LegalSection } from '@/features/legal/components/LegalPageLayout';

export const supportLastUpdated = 'November 9, 2026';

export const supportIntro = [
  'Need help with Mentora? We are here for parents, students, and mentors using the Mentora mobile app and website.',
  'Email us at info@mentoratr.com and our team will get back to you, usually within 1-2 business days.',
];

export const supportSections: LegalSection[] = [
  {
    title: 'Contact Support',
    blocks: [
      {
        type: 'ul',
        items: [
          'Email: info@mentoratr.com',
          'Website: https://mentoratr.com',
          'Company: Aurion Ventures LLC',
        ],
      },
      {
        type: 'p',
        text: 'To help us solve your issue quickly, please include the email address of your Mentora account, your role (parent, student, or mentor), your device and app version, and a short description or screenshot of the problem.',
      },
    ],
  },
  {
    title: 'Account and Login',
    blocks: [
      {
        type: 'ul',
        items: [
          'Forgot your password? Use "Forgot password" on the login screen to receive a reset link by email.',
          'Did not receive a verification or reset email? Check your spam folder, then contact info@mentoratr.com.',
          'Parents can add and manage their students from the parent account.',
        ],
      },
    ],
  },
  {
    title: 'Lessons and Bookings',
    blocks: [
      {
        type: 'ul',
        items: [
          'You can see upcoming and past lessons in the Lessons section of the app.',
          'Online lessons are joined from the lesson details screen when the lesson starts.',
          'For questions about a specific lesson, message your mentor in the app or contact info@mentoratr.com.',
        ],
      },
    ],
  },
  {
    title: 'Credits and Payments',
    blocks: [
      {
        type: 'p',
        text: 'Lesson credits are used to book live lessons with mentors. For questions about your credit balance, bookings, or refunds, contact info@mentoratr.com with your account email.',
      },
    ],
  },
  {
    title: 'Report a Problem or Safety Concern',
    blocks: [
      {
        type: 'p',
        text: 'To report inappropriate content, abusive behavior, or a safety concern, email info@mentoratr.com with the name of the user involved and a description of what happened. We review every report.',
      },
    ],
  },
  {
    title: 'Delete Your Account',
    blocks: [
      {
        type: 'p',
        text: 'You can delete your account in the app from Profile → Delete Account. You can also request deletion by emailing info@mentoratr.com from the email address linked to your account.',
      },
    ],
  },
  {
    title: 'Privacy and Terms',
    blocks: [
      {
        type: 'ul',
        items: [
          'Privacy Policy: https://mentoratr.com/privacy-policy',
          'Terms and Conditions: https://mentoratr.com/terms-and-conditions',
        ],
      },
    ],
  },
];
