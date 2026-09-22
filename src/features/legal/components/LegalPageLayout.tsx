import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { useStrings } from '@/constants/strings';

export type LegalBlock =
  | { type: 'p'; text: string }
  | { type: 'ul'; items: string[] }
  | { type: 'h3'; text: string };

export type LegalSection = {
  title: string;
  blocks: LegalBlock[];
};

const LINK_SPLIT_RE = /(https?:\/\/[^\s)]+|[\w.+-]+@[\w-]+\.[\w.-]+)/g;
const IS_URL_RE = /^https?:\/\//;
const IS_EMAIL_RE = /^[\w.+-]+@[\w-]+\.[\w.-]+$/;

function Linkify({ text }: { text: string }) {
  return (
    <>
      {text.split(LINK_SPLIT_RE).map((part, i) => {
        if (IS_URL_RE.test(part)) {
          return (
            <a
              key={i}
              href={part}
              target="_blank"
              rel="noreferrer"
              className="text-[var(--color-m-primary)] underline underline-offset-2 hover:text-[var(--color-m-primary-light)]"
            >
              {part}
            </a>
          );
        }
        if (IS_EMAIL_RE.test(part)) {
          return (
            <a
              key={i}
              href={`mailto:${part}`}
              className="text-[var(--color-m-primary)] underline underline-offset-2 hover:text-[var(--color-m-primary-light)]"
            >
              {part}
            </a>
          );
        }
        return <span key={i}>{part}</span>;
      })}
    </>
  );
}

function Block({ block }: { block: LegalBlock }) {
  if (block.type === 'h3') {
    return (
      <h3 className="mt-5 mb-1 text-[16px] font-semibold text-[var(--color-m-text)]">
        {block.text}
      </h3>
    );
  }
  if (block.type === 'ul') {
    return (
      <ul className="my-2 list-disc space-y-1 pl-5">
        {block.items.map((item, i) => (
          <li key={i} className="text-[15px] leading-relaxed text-[var(--color-m-text-secondary)]">
            <Linkify text={item} />
          </li>
        ))}
      </ul>
    );
  }
  return (
    <p className="my-2 text-[15px] leading-relaxed text-[var(--color-m-text-secondary)]">
      <Linkify text={block.text} />
    </p>
  );
}

export function LegalPageLayout({
  title,
  lastUpdated,
  intro,
  sections,
  children,
}: {
  title: string;
  lastUpdated: string;
  intro?: string[];
  sections: LegalSection[];
  children?: ReactNode;
}) {
  const tr = useStrings();

  return (
    <div className="min-h-screen bg-[var(--color-m-bg)]">
      <header className="border-b border-[var(--color-m-card-border)]">
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-4">
          <Link to="/" className="flex items-center gap-2">
            <img src="/master-icon.png" alt="" aria-hidden className="size-8 object-contain" />
            <span className="text-lg font-bold text-[var(--color-m-text)]">{tr.appName}</span>
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-10">
        <Link
          to="/"
          className="text-sm text-[var(--color-m-text-muted)] transition-colors hover:text-[var(--color-m-primary)]"
        >
          {tr.legalBackToHome}
        </Link>

        <h1 className="mt-4 text-[28px] font-bold text-[var(--color-m-text)] md:text-[32px]">
          {title}
        </h1>
        <p className="mt-1 text-sm text-[var(--color-m-text-muted)]">
          {tr.legalLastUpdated}: {lastUpdated}
        </p>

        {intro?.map((p, i) => (
          <p
            key={i}
            className="mt-4 text-[15px] leading-relaxed text-[var(--color-m-text-secondary)]"
          >
            <Linkify text={p} />
          </p>
        ))}

        <div className="mt-8 space-y-8">
          {sections.map((section, i) => (
            <section key={i}>
              <h2 className="text-[19px] font-semibold text-[var(--color-m-text)]">
                {i + 1}. {section.title}
              </h2>
              {section.blocks.map((block, j) => (
                <Block key={j} block={block} />
              ))}
            </section>
          ))}
        </div>

        {children}
      </main>
    </div>
  );
}
