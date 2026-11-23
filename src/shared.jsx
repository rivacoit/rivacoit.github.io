import { useState } from "react";

// Pieces used by both the home page and the post pages.

export const EMAIL = "victoriayang425@gmail.com";
export const GITHUB = "https://github.com/rivacoit";
export const LINKEDIN = "https://www.linkedin.com/in/victoria-yang-96953b330/";

const ext = (href) => (/^https?:|\.pdf$/.test(href) ? { target: "_blank", rel: "noreferrer" } : {});

// Hand-drawn swoop arrow for links (replaces the plain ↗).
export function Arrow() {
  return (
    <svg className="arrow-icon" viewBox="0 1 32 17" aria-hidden="true" focusable="false">
      <path d="M3 10.5 C 3.8 13.5, 5.5 15.5, 9 15.5 C 16 15.5, 23 10.5, 29.5 3.8" />
      <path d="M22.8 5.2 L 29.6 3.6 L 28.8 10.4" />
    </svg>
  );
}

export function Pill({ href, children, variant = "outline" }) {
  return (
    <a className={`pill pill-${variant}`} href={href} {...ext(href)}>
      {children}
    </a>
  );
}

// Email pill: shows the address; clicking copies it instead of opening a mail app.
export function CopyEmail({ variant }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(EMAIL);
    } catch {
      // Older browsers: fall back to a hidden textarea.
      const t = document.createElement("textarea");
      t.value = EMAIL;
      document.body.appendChild(t);
      t.select();
      document.execCommand("copy");
      t.remove();
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button type="button" className={`pill pill-${variant}`} onClick={copy} aria-label={`Copy email address ${EMAIL}`}>
      {EMAIL}
      <span className="copy-mark" aria-hidden="true">
        {copied ? "✓" : "⧉"}
      </span>
      <span className="sr-only" aria-live="polite">
        {copied ? "Email address copied" : ""}
      </span>
    </button>
  );
}
