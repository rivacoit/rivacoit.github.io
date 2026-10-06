import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import SpotlightCard from "./reactbits/SpotlightCard.jsx";
import TiltCard from "./reactbits/TiltCard.jsx";
import ClickSpark from "./reactbits/ClickSpark.jsx";

/* ------------------------------------------------------------------ */
/* Content                                                            */
/* ------------------------------------------------------------------ */

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
  gpa: "4.093 / 4.30",
  note: "Selected coursework:",
  courses: [
    { id: "CS 111", name: "Operating Systems Principles (in progress)" },
    { id: "CS 251", name: "Cryptocurrencies & Blockchain Technologies (in progress)" },
    { id: "MATH 110", name: "Number Theory for Cryptography (in progress)" },
    { id: "CS 107", name: "Computer Organization & Systems" },
    { id: "CS 152", name: "Trust & Safety" },
    { id: "CS 229", name: "Machine Learning" },
    { id: "CS 238", name: "Decision Making Under Uncertainty (in progress)" },
    { id: "CS 109", name: "Probability for Computer Scientists" },
    { id: "CS 103", name: "Mathematical Foundations of Computing" },
    { id: "CS 106B", name: "Programming Abstractions" },
    { id: "MATH 104", name: "Applied Matrix Theory" },
    { id: "MATH 51", name: "Linear Algebra & Multivariable Calculus" },
  ],
};

const EXPERIENCES = [
  {
    org: "Stanford Empirical Security Research Group (ESRG)",
    role: "Student Researcher",
    date: "Sep 2026 - Present",
    place: "Stanford, CA · Advised by Prof. Zakir Durumeric",
    bullets: [
      "Investigating whether longitudinal trends in large-scale network telemetry can be detected automatically, as groundwork for a long-term network measurement system.",
      "Characterizing ~1 year of Stanford campus Zeek connection, DNS, and TLS logs (1B+ records, ~300 GB) in BigQuery to identify which trends are worth automating.",
    ],
  },
  {
    org: "Socket",
    role: "Research Intern",
    date: "Jun - Sep 2026",
    place: "Remote",
    bullets: [
      "Built Socket's unified benchmark for supply-chain malware detection from scratch: a reviewed, fuzzy-hash-deduplicated corpus of 7,000 labeled packages across 15 ecosystems (up from 3), with a TypeScript CLI for collection, validation, scanning, and evaluation.",
      "Developed an ingestion pipeline that turns production threat-feed detections, including false positives, into test cases with the flagged file recorded (1,267 cases), and added sources for agentic-scanner vs. production disagreements and customer package usage.",
      "Created a benchmark runner and Next.js dashboard evaluating 10+ commercial and open-weight LLMs on recall, false positive rate, cost, and latency; showed that a model the team planned to adopt underperformed similarly priced alternatives, prompting a re-evaluation.",
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
    org: "DeepTempo",
    role: "Machine Learning Intern",
    date: "Feb - Jun 2026",
    place: "Hybrid · Stanford, CA",
    bullets: [
      "Built a pipeline that generates labeled synthetic network attack traffic for training and evaluating anomaly-detection models, fit to ~940K real Zeek attack flows across 5 MITRE ATT&CK techniques.",
      "Modeled attacks as multi-phase sequences (e.g., brute force as spray → session → grind) where single distributions failed, matching the real flow-duration profile within 1 percentage point; selected per-feature fits by KS, Wasserstein, and quantile error.",
      "Grounded attack specs in real adversary behavior by merging MITRE technique data from 5 sources (ATT&CK, Caldera, Atomic Red Team, Attack Flow, CTID emulation plans) into one registry.",
    ],
  },
  {
    org: "Yekola",
    role: "Backend / AI Engineering Intern",
    date: "2024",
    place: "Remote",
    bullets: [
      "Built backend services on AWS Lambda and S3 for a language-learning app targeting 2,000+ African languages, including endangered ones with almost no available training data.",
      "Fine-tuned speech-to-text models across multiple low-resource African languages on the AI team.",
    ],
  },
  {
    org: "Cal Poly Pomona",
    role: "Research & Software Engineering Intern",
    date: "Jun 2023 - Aug 2024",
    place: "Hybrid",
    bullets: [
      "Built Lyrically Yours, a Flutter/Firebase mobile app that recommended songs by matching a user's description of how they felt against song lyrics, with Spotify and Genius API integration.",
      "Trained an emotion classifier on 16K labeled sentences, comparing 4 scikit-learn models (Random Forest best, 89% accuracy); first-author paper at SNLP 2024, plus first place at IgniteCS, GameGala, and the OC Science & Engineering Fair.",
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
];

const PROJECTS = [
  {
    title: "EvolveGCN-T: Self-Attention for Weight Evolution in Dynamic Graphs",
    course: "CS229 Machine Learning · Stanford",
    bullets: [
      "Implemented EvolveGCN-T, a dynamic graph neural network that replaces EvolveGCN's GRU weight recurrence with a Transformer encoder attending directly over the history of past GCN weight matrices — a pathway prior work hadn't explored.",
      "Built the full PyTorch training & logging pipeline (Weights & Biases) and ran every experiment across three benchmarks (Elliptic, Bitcoin-OTC, SBM); in an architecture-matched head-to-head, the Transformer lifted Bitcoin-OTC edge-classification micro-F1 from 0.699 → 0.783.",
      "Reproduced published EvolveGCN baselines (Elliptic illicit-class F1 0.578, SBM MAP 0.194) to validate correctness, then ran ablations isolating optimization stability — not context length — as the dominant performance factor.",
    ],
    tags: ["PyTorch", "Transformers", "Graph NNs", "Weights & Biases"],
    links: [{ label: "Read the report", href: "/cs229-report.pdf" }],
  },
  {
    title: "Hybrid Fraud Detection for Fake Job Postings",
    course: "CS152 Trust & Safety · Stanford",
    bullets: [
      "Built a hybrid rule-based + LLM (Gemini 2.5 Flash) fraud classifier with a moderator-feedback loop that auto-injects resolved cases as few-shot examples — reaching 0.91 F1 and 0.95 fraud recall at 4.5× lower inference cost than an LLM-only baseline (200-example balanced eval).",
      "Led ML and backend integration for a 5-person team on a Next.js / Supabase / Vertex AI stack, adding fail-closed routing and an offline eval harness comparing TF-IDF + logistic regression, LLM-only, and hybrid classifiers on accuracy vs. cost.",
    ],
    tags: ["LLMs", "Next.js", "Supabase", "Vertex AI"],
    links: [{ label: "GitHub", href: "https://github.com/stanfordcs152/sp26-team-19" }],
  },
];

const SKILL_GROUPS = [
  {
    title: "Languages",
    items: ["Python", "C", "C++", "Rust", "TypeScript", "JavaScript", "SQL", "Bash"],
  },
  {
    title: "Systems & Networking",
    items: ["Linux", "Git", "Docker", "Make/CMake", "Valgrind", "Wireshark", "tcpdump", "Zeek"],
  },
  {
    title: "Data & ML",
    items: ["BigQuery", "PyTorch", "pandas", "NumPy", "SciPy", "scikit-learn", "XGBoost", "Jupyter"],
  },
  {
    title: "Cloud & Web",
    items: ["AWS (Lambda, S3)", "Azure", "Vertex AI", "Next.js", "React", "Supabase"],
  },
];

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

function HomePage() {
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
                </figure>
              </div>
              <div>
                <p className="hero-hi">hi, i&apos;m</p>
                <h1 className="hero-name">Victoria</h1>
                <p className="hero-tagline">
                  A computer science student at Stanford, interested in systems
                  and security research.
                </p>
                <div className="home-actions">
                  <a className="button-primary" href="mailto:victoriayang425@gmail.com">
                    Email
                  </a>
                  <a className="button-secondary" href="https://github.com/rivacoit" target="_blank" rel="noreferrer">
                    GitHub
                  </a>
                  <a className="button-secondary" href="https://www.linkedin.com/in/victoria-yang-96953b330/" target="_blank" rel="noreferrer">
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
            <SectionHead title="Selected work" sub="things i've designed, built, and shipped" />
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
                I&apos;m looking for software engineering and research internships on
                systems, security, and infrastructure teams, plus research
                collaborations. Email is the best way to reach me.
              </p>
              <div className="home-actions">
                <a className="button-primary" href="mailto:victoriayang425@gmail.com">
                  victoriayang425@gmail.com
                </a>
                <a className="button-secondary" href="https://github.com/rivacoit" target="_blank" rel="noreferrer">
                  GitHub
                </a>
                <a className="button-secondary" href="https://www.linkedin.com/in/victoria-yang-96953b330/" target="_blank" rel="noreferrer">
                  LinkedIn
                </a>
              </div>
            </SpotlightCard>
          </Reveal>
          <footer className="home-footer">
            <span className="footer-left">
              <CatFetch />© 2026 Victoria Yang
            </span>
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

export default function App() {
  return <HomePage />;
}
