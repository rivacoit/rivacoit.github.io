import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { fetchBlockCatalog, fetchPlainTextFile } from "./blockCatalog.js";
import SpotlightCard from "./reactbits/SpotlightCard.jsx";
import TiltCard from "./reactbits/TiltCard.jsx";
import ClickSpark from "./reactbits/ClickSpark.jsx";

/* ------------------------------------------------------------------ */
/* Content                                                            */
/* ------------------------------------------------------------------ */

const ABOUT_TEXT = `Victoria Yang - CS @ Stanford (B.S., expected 2029).
Curious about a lot: AI, AI safety, systems, security, and the occasional
startup idea. Currently an ML intern at DeepTempo and Network Lead for
Stanford's CCDC team. Past: Stanford AI Lab (Dror Lab), Carnegie Mellon,
Google, and Cal Poly Pomona. Non-Trivial Fellow (172 of 11,583).`;

const CONTACT_TEXT = `Victoria Yang
Email:    victoriayang425@gmail.com
Stanford: vicyang@stanford.edu
Phone:    (909) 729-7491
GitHub:   github.com/rivacoit`;

const SKILLS_TEXT = `Languages & ML
- Python, PyTorch, scikit-learn, XGBoost
- Transformers, Graph Neural Networks, NLP, LLMs

Frameworks & Tools
- Next.js, React, Supabase, Vertex AI, Azure, Git

Security
- Network defense, firewalls, intrusion detection
- Reverse engineering, IoT security, defense-in-depth`;

const HELP_TEXT = `Shell-style navigation:
  tab         autocomplete commands
  ls          list files in the current directory
  cd <dir>    enter a directory
  pwd         print working directory
  cat <file>  print file content

Other:
  help        show this text
  clear       clear the screen
  whoami      easter egg`;

const NAV_LINKS = [
  { href: "#education", label: "education" },
  { href: "#experience", label: "experience" },
  { href: "#projects", label: "work" },
  { href: "#skills", label: "toolkit" },
  { href: "#contact", label: "contact" },
];

const EDUCATION = {
  org: "Stanford University",
  detail: "B.S. in Computer Science (intended) · Expected Jun 2029",
  gpa: "4.10 / 4.30",
  note: "Selected coursework:",
  courses: [
    { id: "CS 229", name: "Machine Learning" },
    { id: "CS 152", name: "Trust & Safety" },
    { id: "CS 109", name: "Probability for Computer Scientists" },
    { id: "CS 107", name: "Computer Organization & Systems" },
    { id: "CS 106B", name: "Programming Abstractions" },
    { id: "CS 103", name: "Mathematical Foundations of Computing" },
    { id: "MATH 51", name: "Linear Algebra & Multivariable Calculus" },
    { id: "MATH 104", name: "Applied Matrix Theory" },
  ],
};

const EXPERIENCES = [
  {
    org: "DeepTempo",
    role: "Machine Learning Intern",
    date: "Feb 2026 - Present",
    place: "Hybrid · Stanford, CA",
    bullets: [
      "Build and validate end-to-end ML pipelines for network intrusion detection, engineering features and evaluating models on high-dimensional NetFlow data.",
      "Generate synthetic enterprise network traffic via statistical distribution fitting to train and stress-test anomaly-detection models against realistic attack patterns.",
    ],
  },
  {
    org: "Stanford Applied Cyber (CCDC)",
    role: "Network Lead",
    date: "Nov 2025 - Present",
    place: "Western Regional Champion · 7th Nationally",
    bullets: [
      "Lead network defense for Stanford's competition team — configuring firewalls, hardening devices, and keeping scored services online under live red-team attack.",
      "Apply defense-in-depth across enterprise-style environments, balancing security against usability to win the Western Regional title and place 7th nationally.",
    ],
  },
  {
    org: "Socket",
    role: "Machine Learning Intern (incoming)",
    date: "Jun - Sep 2026",
    place: "Remote",
    bullets: [
      "Incoming ML intern on an open-source supply-chain security platform, working on malicious-package detection across the npm/PyPI ecosystem.",
    ],
  },
  {
    org: "Stanford AI Lab (SAIL) · Dror Lab",
    role: "Research Assistant",
    date: "Oct 2025 - Mar 2026",
    place: "Stanford, CA",
    bullets: [
      "Integrated state-of-the-art ML into ligand–protein binding-affinity prediction pipelines for computational drug discovery.",
      "Surveyed recent ML-for-drug-discovery literature to identify research gaps and the most promising directions for the lab.",
    ],
  },
  {
    org: "Carnegie Mellon University",
    role: "AI Research Intern",
    date: "Summer 2024",
    place: "Remote",
    bullets: [
      "Implemented and fine-tuned image-editing models on Azure GPU VMs to support culturally appropriate visual storytelling.",
    ],
  },
  {
    org: "Google",
    role: "Career Exploration Intern",
    date: "Summer 2024",
    place: "Hybrid · Irvine, CA",
    bullets: [
      "Built pitch decks, financial models, and one-pagers, and researched market trends to inform strategic recommendations.",
    ],
  },
  {
    org: "MIT Beaver Works Summer Institute",
    role: "Cybersecurity Program",
    date: "Jul 2024",
    place: "Remote",
    bullets: [
      "Completed an intensive cybersecurity immersion covering IoT security, reverse engineering, and offensive/defensive techniques.",
    ],
  },
  {
    org: "Non-Trivial Fellowship",
    role: "Research Fellow",
    date: "May 2024",
    place: "Remote · 1 of 172 from 11,583 applicants",
    bullets: [
      "Selected as 1 of 172 fellows from 11,583 applicants; conducted cognitive-science research on how fiction shapes attitudes toward AI risk.",
    ],
  },
  {
    org: "Cal Poly Pomona",
    role: "Research & Software Engineering Intern",
    date: "Jun 2023 - Aug 2024",
    place: "Hybrid",
    bullets: [
      "First-author publication and presentation at the 5th Intl. Conference on Semantic & Natural Language Processing; first place at IgniteCS, GameGala, and the OC Science & Engineering Fair.",
      "Designed and launched an ML-based music-therapy app, shipped live on the Apple App Store and Google Play.",
    ],
  },
];

const PROJECTS = [
  {
    title: "EvolveGCN-T: Self-Attention for Weight Evolution in Dynamic Graphs",
    course: "CS229 Machine Learning · Stanford",
    bullets: [
      "Proposed and implemented EvolveGCN-T, a novel dynamic graph neural network that replaces EvolveGCN's GRU weight recurrence with a causally-masked Transformer attending directly over the history of GCN weight matrices — a pathway prior work hadn't explored.",
      "Built the full PyTorch training & logging pipeline (Weights & Biases) and ran every experiment across three benchmarks (Elliptic, Bitcoin-OTC, SBM); in an architecture-matched head-to-head, the Transformer lifted Bitcoin-OTC edge-classification micro-F1 from 0.699 → 0.783.",
      "Reproduced published EvolveGCN baselines (Elliptic illicit-class F1 0.578, SBM MAP 0.194) to validate correctness, then isolated optimization stability — not context length — as the dominant performance factor.",
    ],
    tags: ["PyTorch", "Transformers", "Graph NNs", "Weights & Biases"],
    links: [{ label: "Read the report", href: "/cs229-report.pdf" }],
  },
  {
    title: "Hybrid Fraud Detection for Fake Job Postings",
    course: "CS152 Trust & Safety · Stanford",
    bullets: [
      "Built a production hybrid rule-based + LLM (Gemini 2.5 Flash) classifier with a moderator-feedback loop that auto-injects resolved cases as few-shot examples — reaching F1 0.913 and 0.95 fraud recall at 4.5× lower inference cost than a pure-LLM baseline.",
      "Owned ML and backend for a 5-person team: shipped on a Next.js / Supabase / Vertex AI stack with fail-closed routing, and built a three-approach offline eval harness (TF-IDF + LR, LLM, hybrid) to benchmark accuracy against cost.",
    ],
    tags: ["LLMs", "Next.js", "Supabase", "Vertex AI"],
    links: [{ label: "GitHub", href: "https://github.com/stanfordcs152/sp26-team-19" }],
  },
];

const SKILL_GROUPS = [
  {
    title: "Languages & ML",
    items: ["Python", "PyTorch", "scikit-learn", "XGBoost", "Transformers", "Graph Neural Networks", "NLP", "LLMs"],
  },
  {
    title: "Frameworks & Tools",
    items: ["Next.js", "React", "Supabase", "Vertex AI", "Azure", "Git"],
  },
  {
    title: "Security",
    items: ["Network Defense", "Firewalls", "Intrusion Detection", "Reverse Engineering", "IoT Security", "Defense-in-Depth"],
  },
];

const EMPTY_CATALOGS = {
  projects: { bySlug: Object.create(null), slugs: [] },
  experiences: { bySlug: Object.create(null), slugs: [] },
};

const VFS_HOME = {
  dirs: ["projects", "experiences"],
  files: ["about", "contact", "skills", "education", "help"],
};

/* ------------------------------------------------------------------ */
/* Scroll reveal                                                      */
/* ------------------------------------------------------------------ */

function Reveal({ children, className = "", delay = 0 }) {
  const ref = useRef(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          observer.unobserve(el);
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" },
    );
    observer.observe(el);
    // Safety net: never leave content hidden if the observer doesn't fire.
    const fallback = setTimeout(() => setShown(true), 2500);
    return () => {
      observer.disconnect();
      clearTimeout(fallback);
    };
  }, []);

  return (
    <div
      ref={ref}
      className={`reveal ${shown ? "reveal-in" : ""} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

// A little white cat with a pink collar, drawn so it can be recolored + run.
// Pixel-art cat (VS Code Pets vibe): black-outlined white kitty with a curled tail.
const CAT_COLORS = { o: "#1c1c1c", w: "#ffffff", g: "#8f8f93" };
const CAT_W = 16;
const CAT_BASE = [
  "....o......o.....",
  "...ooo....ooo....",
  "...ogo....ogo....",
  "..ogggo..ogggo...",
  ".ooggggooggggo...",
  ".owwwwwwwwwwwoooo",
  ".owwwwwwwwwwwo..o",
  ".owwwwwwwwwwwoooo",
  ".owwowwowwwwwo...",
  ".owwowwowwwwwo...",
  ".owwowwowwwwwo...",
  ".owwwwwwwwwwwwo..",
  ".oowwwwwwwwwwoo..",
];
const CAT_FRAME_A = [...CAT_BASE, "..ooo.ooo.ooo..."];
const CAT_FRAME_B = [...CAT_BASE, "...ooo.ooo.ooo.."];

function catPixels(rows, S) {
  const out = [];
  for (let y = 0; y < rows.length; y++) {
    const row = rows[y] || "";
    for (let x = 0; x < row.length; x++) {
      const col = CAT_COLORS[row[x]];
      if (col) out.push(<rect key={`${x},${y}`} x={x * S} y={y * S} width={S} height={S} fill={col} />);
    }
  }
  return out;
}

function CatSprite() {
  const S = 4;
  const W = CAT_W * S;
  const H = 14 * S;
  const svgProps = { width: W, height: H, viewBox: `0 0 ${W} ${H}`, shapeRendering: "crispEdges" };
  return (
    <span className="cat-sprite">
      <svg className="cat-frame cat-a" {...svgProps}>{catPixels(CAT_FRAME_A, S)}</svg>
      <svg className="cat-frame cat-b" {...svgProps}>{catPixels(CAT_FRAME_B, S)}</svg>
    </span>
  );
}

// Easter egg: the pink "currently" dot is a ball — click it and a cat fetches it,
// carries it back, and tosses it home into the dot.
function CatFetch() {
  const [active, setActive] = useState(false);
  const [dotEmpty, setDotEmpty] = useState(false);
  const dotRef = useRef(null);
  const ballRef = useRef(null);
  const catRef = useRef(null);

  const play = () => {
    if (active) return;
    setActive(true);
    setDotEmpty(true);
  };

  useEffect(() => {
    if (!active) return;
    const dot = dotRef.current;
    if (!dot) return;
    const rect = dot.getBoundingClientRect();
    const sx = rect.left + rect.width / 2;
    const sy = rect.top + rect.height / 2;
    const W = window.innerWidth;
    const H = window.innerHeight;
    const groundY = H - 24;
    const landX = Math.min(sx + W * (0.3 + (Date.now() % 15) / 100), W - 70);
    const catOff = -80;
    const HALF = 32; // half the sprite width

    const T_DROP = 800; // ball falls from the dot to the ground
    const T_IN = 1500; // cat runs in and reaches the ball
    const T_CARRY = 2350; // cat carries it back under the dot
    const T_TOSS = 2950; // cat tosses it home into the dot
    const T_EXIT = 3550; // cat trots off
    const start = performance.now();
    let raf = 0;
    let cleared = false;

    const tick = (now) => {
      const t = now - start;
      const ball = ballRef.current;
      const cat = catRef.current;

      // cat
      let cx;
      let faceLeft = true;
      let dy = 0;
      if (t <= T_IN) {
        const p = 1 - (1 - t / T_IN) ** 2;
        cx = catOff + (landX - catOff) * p;
        faceLeft = false;
      } else if (t <= T_CARRY) {
        const p = (t - T_IN) / (T_CARRY - T_IN);
        cx = landX + (sx - landX) * p;
      } else if (t <= T_TOSS) {
        cx = sx;
        const p = (t - T_CARRY) / (T_TOSS - T_CARRY);
        dy = -Math.sin(Math.min(1, p * 1.5) * Math.PI) * 18; // crouch + pop
      } else {
        const p = Math.min(1, (t - T_TOSS) / (T_EXIT - T_TOSS)) ** 2;
        cx = sx + (catOff - sx) * p;
      }
      if (cat) cat.style.transform = `translate(${cx - HALF}px, ${dy}px) scaleX(${faceLeft ? 1 : -1})`;

      // ball
      if (ball) {
        if (t <= T_DROP) {
          const p = t / T_DROP;
          const x = sx + (landX - sx) * p;
          const y = sy + (groundY - sy) * p + Math.sin(p * Math.PI) * -34;
          ball.style.transform = `translate(${x}px, ${y}px) rotate(${p * 540}deg)`;
        } else if (t <= T_IN) {
          ball.style.transform = `translate(${landX}px, ${groundY}px) rotate(540deg)`;
        } else if (t <= T_CARRY) {
          const p = (t - T_IN) / (T_CARRY - T_IN);
          ball.style.transform = `translate(${landX + (sx - landX) * p - 13}px, ${groundY - 8}px) rotate(${540 + p * 360}deg)`;
        } else if (t <= T_TOSS) {
          const p = (t - T_CARRY) / (T_TOSS - T_CARRY);
          const y = groundY - 8 + (sy - (groundY - 8)) * p - Math.sin(p * Math.PI) * 28;
          ball.style.transform = `translate(${sx}px, ${y}px) rotate(${540 + p * 360}deg)`;
        } else {
          ball.style.opacity = "0";
        }
      }

      if (!cleared && t >= T_TOSS - 70) {
        cleared = true;
        setDotEmpty(false);
      }
      if (t < T_EXIT) raf = requestAnimationFrame(tick);
      else setActive(false);
    };

    raf = requestAnimationFrame(tick);
    // Safety net: always restore the dot + end the run even if rAF is throttled.
    const safety = setTimeout(() => {
      setDotEmpty(false);
      setActive(false);
    }, T_EXIT + 500);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(safety);
    };
  }, [active]);

  return (
    <>
      <button
        ref={dotRef}
        className={`currently-dot ${dotEmpty ? "is-empty" : ""}`}
        onClick={play}
        aria-label="say hi to the cat"
      />
      {active &&
        createPortal(
          <div className="cat-stage" aria-hidden="true">
            <span ref={ballRef} className="cat-ball" style={{ transform: "translate(-100px, -100px)" }} />
            <span ref={catRef} className="cat-runner" style={{ transform: "translate(-120px, 0) scaleX(-1)" }}>
              <CatSprite />
            </span>
          </div>,
          document.body,
        )}
    </>
  );
}

function SectionHead({ title, sub }) {
  return (
    <Reveal>
      <div className="section-head">
        <h2>{title}</h2>
        {sub && <p>{sub}</p>}
      </div>
    </Reveal>
  );
}

/* ------------------------------------------------------------------ */
/* Home page                                                          */
/* ------------------------------------------------------------------ */

function HomePage({ onEnterTerminal }) {
  const [activeSection, setActiveSection] = useState("");
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    const ids = NAV_LINKS.map((l) => l.href.slice(1));
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActiveSection(e.target.id);
        });
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: 0 },
    );
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    const onScroll = () => setShowTop(window.scrollY > 700);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <ClickSpark sparkColor="#c98aa0" sparkSize={9} sparkRadius={16} sparkCount={8} duration={520}>
      <div className="page">
        <div className="cozy-bg" aria-hidden="true">
          <span className="blob blob-1" />
          <span className="blob blob-2" />
        </div>

        <main className="home">
          <header className="home-nav">
            <a className="brand" href="#top">
              Victoria Yang
            </a>
            <nav>
              {NAV_LINKS.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  className={activeSection === l.href.slice(1) ? "is-current" : ""}
                >
                  {l.label}
                </a>
              ))}
              <button className="nav-terminal" onClick={onEnterTerminal}>
                <span className="nav-terminal-glyph">{">_"}</span> terminal
              </button>
            </nav>
          </header>

          <section id="top" className="home-hero">
            <div className="home-hero-layout">
              <div className="profile-wrap">
                <figure className="polaroid">
                  <img
                    className="profile-photo"
                    src="/profile.webp"
                    alt="Victoria Yang"
                    onError={(e) => {
                      e.currentTarget.closest(".profile-wrap").style.display = "none";
                    }}
                  />
                  <figcaption className="polaroid-caption">me @ mt. tam</figcaption>
                </figure>
              </div>
              <div>
                <p className="hero-hi">hi, i&apos;m</p>
                <h1 className="hero-name">Victoria</h1>
                <p className="hero-tagline">
                  A Stanford CS student building (and breaking) things across AI,
                  systems, and security.
                </p>
                <div className="currently">
                  <CatFetch />
                  currently — ML intern @{" "}
                  <a className="currently-link" href="#experience">DeepTempo</a> &amp;
                  network lead @{" "}
                  <a className="currently-link" href="#experience">Stanford CCDC</a>
                </div>
                <div className="home-actions">
                  <a className="button-primary" href="/resume.pdf" target="_blank" rel="noreferrer">
                    Resume
                  </a>
                  <a className="button-secondary" href="mailto:victoriayang425@gmail.com">
                    Email
                  </a>
                  <a className="button-secondary" href="https://github.com/rivacoit" target="_blank" rel="noreferrer">
                    GitHub
                  </a>
                  <a className="button-secondary" href="https://www.linkedin.com/in/yuqi-yang-96953b330/" target="_blank" rel="noreferrer">
                    LinkedIn
                  </a>
                </div>
              </div>
            </div>
          </section>

          <section id="education" className="home-section">
            <SectionHead title="Education" />
            <Reveal>
              <div className="edu-item edu-feature">
                <div className="edu-head">
                  <div>
                    <h3>{EDUCATION.org}</h3>
                    <p className="edu-detail">{EDUCATION.detail}</p>
                  </div>
                  <span className="edu-gpa">
                    GPA <strong>{EDUCATION.gpa}</strong>
                  </span>
                </div>
                <p className="edu-note">{EDUCATION.note}</p>
                <div className="course-list">
                  {EDUCATION.courses.map((c) => (
                    <span key={c.id} className="course-chip">
                      <span className="course-id">{c.id}</span> {c.name}
                    </span>
                  ))}
                </div>
              </div>
            </Reveal>
          </section>

          <section id="experience" className="home-section">
            <SectionHead title="Experience" sub="where i've been building & researching" />
            <div className="card-grid">
              {EXPERIENCES.map((e, i) => (
                <Reveal key={e.org} delay={(i % 2) * 70}>
                  <TiltCard className="exp-card">
                    <div className="exp-top">
                      <h3>{e.org}</h3>
                      <span className="exp-date">{e.date}</span>
                    </div>
                    <p className="exp-role">{e.role}</p>
                    <p className="exp-place">{e.place}</p>
                    <ul className="exp-bullets">
                      {e.bullets.map((b, j) => (
                        <li key={j}>{b}</li>
                      ))}
                    </ul>
                  </TiltCard>
                </Reveal>
              ))}
            </div>
          </section>

          <section id="projects" className="home-section">
            <SectionHead title="Selected work" sub="ml & trust-and-safety projects" />
            <div className="project-grid">
              {PROJECTS.map((p, i) => (
                <Reveal key={p.title} delay={i * 90}>
                  <TiltCard className="project-card" max={4}>
                    <p className="project-course">{p.course}</p>
                    <h3>{p.title}</h3>
                    <ul>
                      {p.bullets.map((b, j) => (
                        <li key={j}>{b}</li>
                      ))}
                    </ul>
                    <div className="tag-row">
                      {p.tags.map((t) => (
                        <span key={t}>{t}</span>
                      ))}
                    </div>
                    {p.links && (
                      <div className="project-links">
                        {p.links.map((l) => (
                          <a
                            key={l.href}
                            href={l.href}
                            target="_blank"
                            rel="noreferrer"
                            className="project-link"
                          >
                            {l.label} <span aria-hidden="true">→</span>
                          </a>
                        ))}
                      </div>
                    )}
                  </TiltCard>
                </Reveal>
              ))}
            </div>
          </section>

          <section id="skills" className="home-section">
          <SectionHead title="Toolkit" />
          <div className="skills-grid">
            {SKILL_GROUPS.map((g, i) => (
              <Reveal key={g.title} delay={i * 80}>
                <div className="skill-group">
                  <h4>{g.title}</h4>
                  <div className="pill-list">
                    {g.items.map((it) => (
                      <span key={it}>{it}</span>
                    ))}
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        <section id="contact" className="home-section contact-section">
          <Reveal>
            <SpotlightCard className="contact-card" spotlightColor="rgba(201, 138, 160, 0.16)">
              <h2>Let&apos;s connect</h2>
              <p>
                I&apos;m looking for internships and research collaborations across
                AI, systems, and security. Email is the best way to reach me.
              </p>
              <div className="home-actions">
                <a className="button-primary" href="mailto:victoriayang425@gmail.com">
                  victoriayang425@gmail.com
                </a>
                <a className="button-secondary" href="/resume.pdf" target="_blank" rel="noreferrer">
                  Resume
                </a>
                <a className="button-secondary" href="https://github.com/rivacoit" target="_blank" rel="noreferrer">
                  GitHub
                </a>
                <a className="button-secondary" href="https://www.linkedin.com/in/yuqi-yang-96953b330/" target="_blank" rel="noreferrer">
                  LinkedIn
                </a>
              </div>
            </SpotlightCard>
          </Reveal>
          <footer className="home-footer">
            <span>© 2026 Victoria Yang</span>
            <button className="footer-terminal" onClick={onEnterTerminal}>
              terminal mode →
            </button>
          </footer>
        </section>
        </main>

        <button
          className={`to-top ${showTop ? "is-visible" : ""}`}
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          aria-label="Back to top"
        >
          ↑
        </button>
      </div>
    </ClickSpark>
  );
}

/* ------------------------------------------------------------------ */
/* Terminal mode                                                      */
/* ------------------------------------------------------------------ */

function vfsNode(cwd, catalogs) {
  const key = cwd.join("/");
  if (key === "") return VFS_HOME;
  if (key === "projects") return { dirs: [], files: catalogs.projects.slugs };
  if (key === "experiences") return { dirs: [], files: catalogs.experiences.slugs };
  return null;
}

function formatPromptPath(cwd) {
  return cwd.length ? `~/${cwd.join("/")}` : "~";
}

function splitCommand(text) {
  const parts = text.split(/\s+/).filter(Boolean);
  return { name: parts[0]?.toLowerCase() ?? "", args: parts.slice(1) };
}

function lsOutput(cwd, catalogs) {
  const node = vfsNode(cwd, catalogs);
  if (!node) return "ls: cannot open directory: No such file or directory";
  const entries = [...node.dirs.map((d) => `${d}/`), ...node.files].sort((a, b) =>
    a.localeCompare(b),
  );
  return entries.length ? entries.join("\n") : "(empty)";
}

function runCd(args, cwd) {
  if (args.length > 1) return { nextCwd: cwd, error: "cd: too many arguments" };
  const target = args[0];
  if (!target || target === "~" || target === "/") return { nextCwd: [], error: null };
  if (target === "..") return { nextCwd: cwd.slice(0, -1), error: null };
  const node = vfsNode(cwd, EMPTY_CATALOGS);
  if (node?.dirs.includes(target)) return { nextCwd: [...cwd, target], error: null };
  return { nextCwd: cwd, error: `cd: no such file or directory: ${target}` };
}

function runCat(args, cwd, catalogs, educationText) {
  if (!args.length) return "cat: missing file operand";
  if (args.length > 1) return "cat: too many arguments";
  const name = args[0];
  const key = cwd.join("/");
  const node = vfsNode(cwd, catalogs);
  if (!node) return "cat: no such file or directory";
  if (!node.files.includes(name)) {
    if (node.dirs.includes(name)) return `cat: ${name}: Is a directory`;
    return `cat: ${name}: No such file or directory`;
  }
  if (key === "") {
    if (name === "about") return ABOUT_TEXT;
    if (name === "contact") return CONTACT_TEXT;
    if (name === "skills") return SKILLS_TEXT;
    if (name === "help") return HELP_TEXT;
    if (name === "education") return educationText ?? "education.txt is still loading...";
  }
  if (key === "projects") return catalogs.projects.bySlug[name];
  if (key === "experiences") return catalogs.experiences.bySlug[name];
  return `cat: ${name}: No such file or directory`;
}

const COMMANDS = ["cat", "cd", "clear", "help", "ls", "pwd", "whoami"];

function tabComplete(input, cwd, catalogs) {
  const parts = input.split(/\s+/).filter(Boolean);
  if (!parts.length) return null;
  if (parts.length === 1) {
    const matches = COMMANDS.filter((c) => c.startsWith(parts[0].toLowerCase()));
    if (matches.length === 1) return matches[0] + " ";
    return null;
  }
  const [cmd, partial] = [parts[0].toLowerCase(), parts.at(-1) ?? ""];
  const node = vfsNode(cwd, catalogs);
  if (!node) return null;
  if (cmd === "cd") {
    const targets = [...node.dirs, "..", "~"].filter((d) => d.startsWith(partial));
    if (targets.length === 1) return input.replace(new RegExp(`${partial}$`), targets[0]);
  }
  if (cmd === "cat") {
    const targets = node.files.filter((f) => f.startsWith(partial));
    if (targets.length === 1) return input.replace(new RegExp(`${partial}$`), targets[0]);
  }
  return null;
}

function TerminalShell({ onExit }) {
  const [history, setHistory] = useState([
    { type: "output", text: "rivacoit shell — type 'help' to get started, 'ls' to look around." },
  ]);
  const [cwd, setCwd] = useState([]);
  const [catalogs, setCatalogs] = useState(EMPTY_CATALOGS);
  const [educationText, setEducationText] = useState(null);
  const [input, setInput] = useState("");
  const inputRef = useRef(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [projects, experiences, education] = await Promise.allSettled([
        fetchBlockCatalog("projects.txt"),
        fetchBlockCatalog("experiences.txt"),
        fetchPlainTextFile("education.txt"),
      ]);
      if (cancelled) return;
      setCatalogs({
        projects:
          projects.status === "fulfilled" ? projects.value : EMPTY_CATALOGS.projects,
        experiences:
          experiences.status === "fulfilled"
            ? experiences.value
            : EMPTY_CATALOGS.experiences,
      });
      if (education.status === "fulfilled") {
        setEducationText(
          education.value.trimEnd() || "(no content yet - edit public/education.txt)",
        );
      } else {
        setEducationText("(could not load education.txt)");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history, input]);

  const handleCommand = (raw) => {
    const text = raw.trim();
    const path = formatPromptPath(cwd);
    if (text === "") {
      setHistory((h) => [...h, { type: "input", text: "", path }]);
      setInput("");
      return;
    }
    const { name, args } = splitCommand(text);
    let output = null;
    let nextCwd = cwd;
    if (name === "ls") output = lsOutput(cwd, catalogs);
    else if (name === "pwd") output = `/home/visitor/${cwd.join("/")}`.replace(/\/$/, "");
    else if (name === "cd") {
      const result = runCd(args, cwd);
      nextCwd = result.nextCwd;
      output = result.error;
    } else if (name === "cat") output = runCat(args, cwd, catalogs, educationText);
    else if (name === "help") output = HELP_TEXT;
    else if (name === "whoami") output = ABOUT_TEXT;
    else if (name === "clear") output = "CLEAR";
    else output = `command not found: ${text}. Type help for hints.`;

    if (output === "CLEAR") setHistory([]);
    else {
      setCwd(nextCwd);
      setHistory((h) => [
        ...h,
        { type: "input", text, path },
        ...(output ? [{ type: "output", text: output }] : []),
      ]);
    }
    setInput("");
  };

  return (
    <div className="terminal-wrap">
      <div className="terminal-toolbar">
        <button className="button-secondary" onClick={onExit}>
          ← back to the site
        </button>
      </div>
      <div className="terminal" onClick={() => inputRef.current?.focus()}>
        {history.map((line, i) => (
          <pre key={i} className="terminal-line">
            {line.type === "input"
              ? `visitor@rivacoit:${line.path ?? "~"}$ ${line.text}`
              : line.text}
          </pre>
        ))}
        <div className="terminal-input-row">
          <span className="terminal-prompt">visitor@rivacoit:{formatPromptPath(cwd)}$</span>
          <input
            ref={inputRef}
            className="terminal-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleCommand(input);
              if (e.key === "Tab") {
                e.preventDefault();
                const next = tabComplete(input, cwd, catalogs);
                if (next) setInput(next);
              }
            }}
            autoFocus
            spellCheck={false}
            autoComplete="off"
            aria-label="Terminal command"
          />
        </div>
        <div ref={bottomRef} />
      </div>
    </div>
  );
}

export default function App() {
  const [mode, setMode] = useState("home");
  return mode === "home" ? (
    <HomePage onEnterTerminal={() => setMode("terminal")} />
  ) : (
    <TerminalShell onExit={() => setMode("home")} />
  );
}
