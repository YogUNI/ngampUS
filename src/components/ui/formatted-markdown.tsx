"use client";

import React from "react";

interface FormattedMarkdownProps {
  content: string;
  className?: string;
}

/**
 * Parses inline formatting like **bold**, *italic*, and `code`
 */
function renderInline(text: string): React.ReactNode {
  // Split by inline markdown tokens: `code`, **bold**, *italic*
  const tokens: React.ReactNode[] = [];
  const regex = /(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      tokens.push(text.substring(lastIndex, match.index));
    }

    const matchedStr = match[0];
    if (matchedStr.startsWith("`") && matchedStr.endsWith("`")) {
      tokens.push(
        <code
          key={match.index}
          className="rounded-md bg-black/5 dark:bg-white/10 px-1.5 py-0.5 font-mono text-[11px] font-semibold text-[var(--brand)]"
        >
          {matchedStr.slice(1, -1)}
        </code>
      );
    } else if (matchedStr.startsWith("**") && matchedStr.endsWith("**")) {
      tokens.push(
        <strong key={match.index} className="font-extrabold text-[var(--ink)]">
          {matchedStr.slice(2, -2)}
        </strong>
      );
    } else if (matchedStr.startsWith("*") && matchedStr.endsWith("*")) {
      tokens.push(
        <em key={match.index} className="italic text-[var(--ink)] font-medium">
          {matchedStr.slice(1, -1)}
        </em>
      );
    }
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    tokens.push(text.substring(lastIndex));
  }

  return tokens.length > 0 ? tokens : text;
}

/**
 * FormattedMarkdown cleanly renders AI responses by parsing:
 * - Markdown Headings (#, ##, ###)
 * - Horizontal rules (---)
 * - Bullet list items (*, -, •) without leaving raw asterisks
 * - Numbered lists (1., 2.)
 * - Inline bold, italic, code
 * - Paragraphs with natural line breaks
 */
export function FormattedMarkdown({ content, className = "" }: FormattedMarkdownProps) {
  if (!content) return null;

  const lines = content.split("\n");
  const elements: React.ReactNode[] = [];
  let currentListItems: React.ReactNode[] = [];
  let isNumberedList = false;

  const flushList = () => {
    if (currentListItems.length > 0) {
      if (isNumberedList) {
        elements.push(
          <ol
            key={`ol-${elements.length}`}
            className="my-2 list-decimal list-outside space-y-1 pl-5 text-xs leading-relaxed"
          >
            {currentListItems}
          </ol>
        );
      } else {
        elements.push(
          <ul
            key={`ul-${elements.length}`}
            className="my-2 space-y-1.5 pl-0.5 text-xs leading-relaxed"
          >
            {currentListItems}
          </ul>
        );
      }
      currentListItems = [];
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const trimmed = rawLine.trim();

    // 1. Empty lines
    if (!trimmed) {
      flushList();
      continue;
    }

    // 2. Horizontal rules: --- or ***
    if (/^(\-{3,}|\*{3,})$/.test(trimmed)) {
      flushList();
      elements.push(
        <hr key={`hr-${i}`} className="my-3 border-[var(--line)] border-t" />
      );
      continue;
    }

    // 3. Headings (###, ##, #)
    const headingMatch = trimmed.match(/^(#{1,4})\s+(.+)$/);
    if (headingMatch) {
      flushList();
      const level = headingMatch[1].length;
      const headingText = headingMatch[2];
      if (level === 1 || level === 2) {
        elements.push(
          <h4
            key={`h-${i}`}
            className="font-display mt-3.5 mb-1.5 text-sm font-black text-[var(--ink)] tracking-tight"
          >
            {renderInline(headingText)}
          </h4>
        );
      } else {
        elements.push(
          <h5
            key={`h-${i}`}
            className="font-display mt-2.5 mb-1 text-xs font-black text-[var(--brand)] tracking-wide uppercase"
          >
            {renderInline(headingText)}
          </h5>
        );
      }
      continue;
    }

    // 4. Bullet lists: lines starting with *, -, +, or •
    const bulletMatch = trimmed.match(/^[\*\-\+•]\s+(.+)$/);
    if (bulletMatch) {
      if (isNumberedList) {
        flushList();
      }
      isNumberedList = false;
      currentListItems.push(
        <li key={`li-${i}`} className="flex items-start gap-2 text-xs text-[var(--ink)]">
          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--brand)]" />
          <span className="flex-1 leading-relaxed">{renderInline(bulletMatch[1])}</span>
        </li>
      );
      continue;
    }

    // 5. Numbered lists: lines starting with 1., 2., etc.
    const numberMatch = trimmed.match(/^(\d+)[\.\)]\s+(.+)$/);
    if (numberMatch) {
      if (!isNumberedList && currentListItems.length > 0) {
        flushList();
      }
      isNumberedList = true;
      currentListItems.push(
        <li key={`li-num-${i}`} className="text-xs text-[var(--ink)] pl-1 leading-relaxed">
          {renderInline(numberMatch[2])}
        </li>
      );
      continue;
    }

    // 6. Regular paragraph
    flushList();
    elements.push(
      <p key={`p-${i}`} className="text-xs leading-relaxed text-[var(--ink)] mb-1.5 last:mb-0">
        {renderInline(trimmed)}
      </p>
    );
  }

  // Final flush
  flushList();

  return <div className={`space-y-1 ${className}`}>{elements}</div>;
}
