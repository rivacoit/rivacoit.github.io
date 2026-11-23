import { Arrow } from "./shared.jsx";
import { POSTS } from "./posts/index.js";

// "HELLO my name is git" sticker on top of the terminal showing what it really did.
function NameTagArt() {
  return (
    <div className="art-nametag" aria-hidden="true">
      <div className="art-term">
        <div className="art-term-dots">
          <i />
          <i />
          <i />
        </div>
        <code>$ git commit</code>
        <code>running checks</code>
        <code className="art-term-bad">+ ~/bad.txt (added)</code>
      </div>
      <div className="art-tag">
        <div className="art-tag-head">
          <strong>HELLO</strong>
          <span>my name is</span>
        </div>
        <div className="art-tag-name">git</div>
      </div>
    </div>
  );
}

const ART = {
  nametag: NameTagArt,
};

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

      {/* Heading on a tilted paper slip, like the fortune notes on the home page. */}
      <h1 className="writing-title">
        <span className="writing-slip">Writing</span>
      </h1>

      <ul className="bento" id="posts">
        {POSTS.map((p) => {
          const Art = ART[p.art];
          return (
            <li key={p.href} className={`bento-${p.size ?? "half"}`}>
              <a className={`bento-tile tone-${p.tone}${Art ? " has-art" : ""}`} href={p.href}>
                <span className="bento-text">
                  <span className="bento-date">{p.date}</span>
                  <span className="bento-title">{p.title}</span>
                  <span className="bento-subtitle">{p.subtitle}</span>
                </span>
                {Art && <Art />}
                <span className="bento-arrow">
                  <Arrow />
                </span>
              </a>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
