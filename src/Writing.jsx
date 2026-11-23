import { Arrow } from "./shared.jsx";
import { POSTS } from "./posts/index.js";

export default function Writing() {
  return (
    <div className="page writing-page">
      <a className="skip-link" href="#posts">
        Skip to content
      </a>
      <nav className="post-nav">
        <a className="pill pill-small" href="/">
          ← Victoria Yang
        </a>
      </nav>

      <h1 className="writing-title">Writing</h1>

      <ul className="bento" id="posts">
        {POSTS.map((p) => (
          <li key={p.href} className={`bento-${p.size ?? "half"}`}>
            <a className={`bento-tile tone-${p.tone}`} href={p.href}>
              <span className="bento-date">{p.date}</span>
              <span className="bento-title">{p.title}</span>
              <span className="bento-subtitle">{p.subtitle}</span>
              <span className="bento-arrow">
                <Arrow />
              </span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
