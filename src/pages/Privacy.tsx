import { Link } from 'react-router-dom';
import Header from '../components/Header';
import { ArrowLeft, Database, Lock, Shield } from 'lucide-react';

const privacySections = [
  {
    title: 'Overview',
    paragraphs: [
      'GutWise is a personal gut-health workspace. The product is designed around private logging, careful pattern review, and clinician-ready reporting.',
      'This policy explains what we collect, why we collect it, and how you can manage your data.',
    ],
  },
  {
    title: 'What we collect',
    paragraphs: ['We collect only what is needed to operate GutWise:'],
    bullets: [
      'Account credentials, including email address and a hashed password',
      'Health logs you choose to enter, including bowel movements, symptoms, food, hydration, sleep, stress, medications, and menstrual cycle data',
      'Optional profile context such as age range and diagnosed conditions, used to personalize in-app context',
      'Basic technical information such as browser type and session data, used for platform security and reliability',
    ],
    trailing:
      'We do not collect location data beyond what you choose to enter. We do not use third-party advertising trackers.',
  },
  {
    title: 'How we use your information',
    bullets: [
      'To provide your personal GutWise workspace',
      'To generate non-diagnostic pattern summaries within the app',
      'To maintain platform reliability and security',
      'To communicate with you about your account',
    ],
    trailing:
      'We do not use your health data for research or aggregate analysis without your explicit consent.',
  },
  {
    title: 'Data security',
    paragraphs: [
      'Your data is stored on infrastructure provided by Supabase, which supports encryption at rest and in transit. Access to your records is restricted to your account through row-level security controls.',
      'No security measure is absolute. If a security incident occurs, we are committed to acting promptly and transparently.',
    ],
  },
  {
    title: 'Third-party services',
    paragraphs: [
      'We use a small number of trusted providers to operate GutWise, including database infrastructure and AI inference. These providers process your data only as instructed by us and are not permitted to use it for their own purposes.',
      'We do not sell your personal or health data to any third party.',
    ],
  },
  {
    title: 'Your rights',
    paragraphs: ['You can, at any time:'],
    bullets: [
      'Access and review data stored in your account',
      'Export health data from Data Management Settings',
      'Delete health logs from Data Management Settings',
      'Request account deletion',
    ],
  },
  {
    title: 'Data retention',
    paragraphs: [
      'Your data is retained while your account is active. If you delete your account, personal data will be removed within a reasonable period except where retention is required by law.',
    ],
  },
  {
    title: 'Children',
    paragraphs: [
      'GutWise is intended for adults aged 18 and over. We do not knowingly collect data from anyone under 18.',
    ],
  },
  {
    title: 'Changes to this policy',
    paragraphs: [
      'We will update this policy as the product evolves. Material changes will be communicated in-app. The date at the top of this page reflects the most recent revision.',
    ],
  },
  {
    title: 'Contact',
    paragraphs: [
      'For privacy-related questions or data requests, please contact us through the in-app support channel. A dedicated privacy contact address will be published here before public launch.',
    ],
  },
];

export default function Privacy() {
  return (
    <div className="page-shell min-h-screen text-[var(--color-text-primary)]">
      <Header />

      <main id="main-content" tabIndex={-1} className="mx-auto max-w-4xl px-4 pb-14 pt-24 sm:px-6 sm:pt-28 lg:px-8">
        <div className="clinical-page-header">
          <Link
            to="/"
            className="motion-nav-link inline-flex w-fit items-center gap-2 text-sm font-semibold text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)]"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back to GutWise
          </Link>
          <span className="clinical-chip clinical-chip-accent w-fit">
            <Shield className="h-4 w-4" aria-hidden="true" />
            Privacy posture
          </span>
          <div>
            <h1 className="text-3xl font-semibold tracking-[var(--gw-letter-spacing-tight)] text-[var(--color-text-primary)] sm:text-4xl">
              Privacy Policy
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--color-text-secondary)]">
              Last updated: March 2026. Contact details will be finalized before public launch.
            </p>
          </div>
        </div>

        <section className="clinical-panel p-5 sm:p-6">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="clinical-card p-4">
              <Lock className="mb-3 h-5 w-5 text-[var(--gw-brand-300)]" aria-hidden="true" />
              <p className="text-sm font-semibold text-[var(--color-text-primary)]">No advertising sale</p>
              <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">
                GutWise does not sell personal or health data to advertisers.
              </p>
            </div>
            <div className="clinical-card p-4">
              <Database className="mb-3 h-5 w-5 text-[var(--gw-brand-300)]" aria-hidden="true" />
              <p className="text-sm font-semibold text-[var(--color-text-primary)]">Account-scoped records</p>
              <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">
                Health records are tied to your private account and used to run the product.
              </p>
            </div>
          </div>

          <div className="mt-7 space-y-8 text-sm leading-7 text-[var(--color-text-secondary)]">
            {privacySections.map((section) => (
              <section key={section.title}>
                <h2 className="mb-3 text-base font-semibold text-[var(--color-text-primary)]">
                  {section.title}
                </h2>
                {section.paragraphs?.map((paragraph) => (
                  <p key={paragraph} className="mb-3 last:mb-0">
                    {paragraph}
                  </p>
                ))}
                {section.bullets && (
                  <ul className="mb-3 list-disc space-y-2 pl-5">
                    {section.bullets.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                )}
                {section.trailing && <p>{section.trailing}</p>}
              </section>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
