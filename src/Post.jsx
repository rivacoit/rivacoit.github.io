import Markdown from "react-markdown";
import { Arrow, CopyEmail, GITHUB, Pill } from "./shared.jsx";
import { POSTS } from "./posts/index.js";
import body from "./posts/names-can-be-deceiving.md?raw";

const post = POSTS.find((p) => p.href === "/writing/names-can-be-deceiving/");

// Real pixel sizes, so the page doesn't jump while screenshots load.
const IMAGE_SIZES = {
  "git-hook.webp": [1340, 810],
  "find-delete.webp": [1294, 480],
  "npm-install.webp": [2000, 999],
  "rm-rf.webp": [752, 234],
  "script.webp": [788, 356],
};

const components = {
  // Every link in the post goes off-site, so open it in a new tab.
  a: ({ href, children }) => (
    <a href={href} target="_blank" rel="noreferrer">
      {children}
    </a>
  ),
  img: ({ src, alt }) => {
    const [width, height] = IMAGE_SIZES[src.split("/").pop()] ?? [];
    return <img src={src} alt={alt} width={width} height={height} loading="lazy" />;
  },
};

export default function Post() {
  return (
    <div className="page post-page">
      <a className="skip-link" href="#post">
        Skip to content
      </a>
      <nav className="post-nav">
        <a className="pill pill-small" href="/writing/">
          ← Writing
        </a>
      </nav>

      <article className="post" id="post">
        <header className="post-header">
          <p className="post-date">{post.date}</p>
          <h1 className="post-title">{post.title}</h1>
          <p className="post-subtitle">{post.subtitle}</p>
        </header>
        <div className="post-body">
          <Markdown components={components}>{body}</Markdown>
        </div>
      </article>

      <footer className="post-footer">
        <p className="post-footer-line">Thoughts on this? I’d love to hear them.</p>
        <div className="pill-row">
          <CopyEmail variant="solid" />
          <Pill href={GITHUB}>
            GitHub <Arrow />
          </Pill>
        </div>
      </footer>
    </div>
  );
}
