import { Component, lazy, Suspense, useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { refreshMotion, scrollToElement, startMotion } from "./motion.js";

const NameField = lazy(() => import("./NameField.jsx"));

/* ------------------------------------------------------------------ */
/* Content                                                            */
/* ------------------------------------------------------------------ */

const EMAIL = "victoriayang425@gmail.com";
const GITHUB = "https://github.com/rivacoit";
const LINKEDIN = "https://www.linkedin.com/in/victoria-yang-96953b330/";

// Matches the section titles below, in order.
const NAV = [
  { href: "#currently", label: "Currently" },
  { href: "#experience", label: "Previously" },
  { href: "#work", label: "Selected work" },
  { href: "#education", label: "Education" },
  { href: "#toolkit", label: "Toolkit" },
];

const CURRENTLY = [
  {
    id: "now-esrg",
    org: "Stanford",
    abbr: "ESRG",
    since: "Since September 2026",
    role: "Student Researcher, with Prof. Zakir Durumeric",
    body: "Testing whether long-term trends in network telemetry can be detected automatically, using a year of Stanford campus Zeek logs (1B+ records, ~300 GB) in BigQuery.",
  },
  {
    id: "now-ccdc",
    org: "Stanford",
    abbr: "CCDC",
    since: "Since November 2025",
    role: "Network Lead, Stanford Applied Cyber",
    body: "Keeping scored services online under live red-team attack with Palo Alto firewalls, iptables, host hardening, and segmentation, plus an iptables audit tool I built. Western Regional Champion, 7th nationally. Before Stanford: four years of CyberPatriot, including 1st nationally in the 2025 Cisco Networking Challenge.",
  },
];

const EXPERIENCE = [
  {
    id: "socket",
    date: "Jun – Sep 2026",
    org: "Socket",
    role: "Research Intern",
    bullets: [
      "Built Socket's supply-chain malware benchmark from scratch: 7,000 reviewed, deduplicated packages across 15 ecosystems (up from 3), with a TypeScript CLI for collection, validation, scanning, and evaluation.",
      "Turned production threat-feed detections, including false positives, into 1,267 test cases, and added sources for scanner disagreements and customer package usage.",
      "Built a benchmark runner and Next.js dashboard, now used by the engineering team, comparing 10+ LLMs on recall, false positives, cost, and latency; showed a model the team planned to adopt underperformed similarly priced alternatives.",
    ],
  },
  {
    id: "deeptempo",
    date: "Feb – Jun 2026",
    org: "DeepTempo",
    role: "Machine Learning Intern",
    bullets: [
      "Built a pipeline that generates labeled synthetic attack traffic for anomaly-detection models, fit to ~940K real Zeek flows across 5 MITRE ATT&CK techniques.",
      "Modeled attacks as multi-phase sequences (brute force as spray → session → grind), matching the real flow-duration profile within 1 percentage point.",
      "Merged MITRE technique data from 5 sources into one registry to ground attack specs in real adversary behavior.",
    ],
  },
  {
    id: "yekola",
    date: "Jun – Nov 2024",
    org: "Yekola",
    role: "Backend / AI Engineering Intern",
    bullets: ["Built AWS Lambda and S3 backend services for a language-learning app covering 2,000+ African languages."],
  },
  {
    id: "cpp",
    date: "Jun 2023 – Aug 2024",
    org: "Cal Poly Pomona",
    role: "Research & Software Engineering Intern",
    bullets: [
      "Built Lyrically Yours, a Flutter/Firebase app that recommends songs by matching how you feel to their lyrics.",
      "Trained an emotion classifier on 16K sentences (89% accuracy); first-author paper at SNLP 2024, and first place at IgniteCS, GameGala, and the OC Science & Engineering Fair.",
    ],
  },
  {
    id: "cmu",
    date: "Summer 2024",
    org: "Carnegie Mellon University",
    role: "AI Research Intern",
    bullets: ["Fine-tuned image-editing models on Azure GPUs for culturally appropriate visual storytelling."],
  },
  {
    id: "google",
    date: "Summer 2024",
    org: "Google",
    role: "Career Exploration Intern",
    bullets: ["Built pitch decks, financial models, and market research to inform strategic recommendations."],
  },
  {
    id: "mit",
    date: "Jul 2024",
    org: "MIT Beaver Works Summer Institute",
    role: "Cybersecurity Program",
    bullets: ["Month-long program in IoT security and reverse engineering; analyzed binaries with Ghidra."],
  },
  {
    id: "nontrivial",
    date: "May 2024",
    org: "Non-Trivial Fellowship",
    role: "Research Fellow",
    bullets: ["1 of 172 fellows from 11,583 applicants; researched how fiction shapes attitudes toward AI risk."],
  },
];

const PROJECTS = [
  {
    id: "work-cs229",
    meta: "CS 229 · Paper",
    title: "Replacing Recurrence with Self-Attention for Weight Evolution in Dynamic Graph Networks",
    body: "Replaced EvolveGCN's GRU with a Transformer over past GCN weights. I built the model and pipeline and ran every experiment; Bitcoin-OTC micro-F1 rose from 0.699 to 0.783.",
    image: { src: "/work/cs229.webp", alt: "First page of the CS 229 paper", kind: "paper" },
    links: [{ label: "Read the paper", href: "/cs229-paper.pdf" }],
  },
  {
    id: "work-jobshield",
    meta: "CS 152 · Poster",
    title: "JobShield: Detecting Fraudulent Job Postings",
    body: "Rules plus Gemini, with moderator decisions fed back as few-shot examples: 0.91 F1 and 0.95 fraud recall at 4.5× lower cost than LLM-only. I led ML and backend on a five-person team.",
    image: { src: "/work/jobshield.webp", alt: "JobShield research poster", kind: "poster" },
    links: [
      { label: "View the poster", href: "/jobshield-poster.pdf" },
      { label: "GitHub", href: "https://github.com/stanfordcs152/sp26-team-19" },
    ],
  },
  {
    id: "work-cs107",
    meta: "CS 107 · Systems",
    title: "Heap Allocator & x86-64 Debugging",
    body: "Free-list heap allocators in C with coalescing and in-place realloc; traced compiled x86-64 with gdb to recover behavior without source.",
  },
];

const EDUCATION = {
  school: "Stanford University",
  degree: "B.S. Computer Science",
  gpa: "GPA 4.093 / 4.30",
  // Summaries condensed from the Stanford course catalog (explorecourses.stanford.edu).
  courses: [
    { id: "cs111", code: "CS 111", name: "Operating Systems Principles", now: true, desc: "Concurrency, synchronization, scheduling, processes, virtual memory, I/O, file systems, and protection." },
    { id: "cs251", code: "CS 251", name: "Cryptocurrencies & Blockchain", now: true, desc: "How cryptocurrencies, blockchains, and distributed consensus work, and how to engineer secure software that interacts with them." },
    { id: "cs107", code: "CS 107", name: "Computer Organization & Systems", desc: "How computers execute programs, from C down to the microprocessor: data representation, machine-level code, memory management, and performance." },
    { id: "cs152", code: "CS 152", name: "Trust & Safety", desc: "How online services and AI systems are abused to cause real harm, from fraud to misinformation, and the technical, product, and policy responses." },
    { id: "cs229", code: "CS 229", name: "Machine Learning", desc: "Supervised and unsupervised learning, kernel methods, deep learning, learning theory, and reinforcement learning." },
    { id: "cs109", code: "CS 109", name: "Probability for Computer Scientists", desc: "Combinatorics, random variables, distributions, expectation, and estimation, applied to machine learning and algorithm analysis." },
    { id: "cs103", code: "CS 103", name: "Mathematical Foundations of Computing", desc: "Proofs, logic, discrete math, computability, and complexity: the theoretical limits of what computers can solve." },
    { id: "cs106b", code: "CS 106B", name: "Programming Abstractions", desc: "Data abstraction, recursion, and fundamental data structures in C++, with an introduction to complexity analysis." },
    { id: "math104", code: "MATH 104", name: "Applied Matrix Theory", desc: "Orthogonality, spectral theory, the SVD and QR decompositions, and least squares, with applications to data analysis." },
    { id: "math51", code: "MATH 51", name: "Linear Algebra & Multivariable Calculus", desc: "Linear algebra and multivariable calculus together: eigenvalues, least squares, the SVD, gradients, and optimization." },
  ],
};

const TOOLKIT = [
  { title: "Languages", items: "Python, C, C++, Java, TypeScript, JavaScript, SQL, Bash, x86-64 assembly" },
  {
    title: "Systems & networking",
    items: "Linux, Git, Docker, Make/CMake, gdb, Valgrind, Ghidra, QEMU, Palo Alto, iptables, Cisco IOS, Wireshark, tcpdump, Zeek",
  },
  { title: "Data & ML", items: "BigQuery, PyTorch, pandas, NumPy, SciPy, scikit-learn, Weights & Biases, Jupyter" },
  { title: "Cloud & web", items: "AWS (Lambda, S3), GCP / Vertex AI, Azure, Next.js, React, Supabase" },
];

const CONTACT = [
  { meta: "Write", label: "Email", href: `mailto:${EMAIL}`, external: false },
  { meta: "Code", label: "GitHub", href: GITHUB, external: true },
  { meta: "Connect", label: "LinkedIn", href: LINKEDIN, external: true },
];

/* ------------------------------------------------------------------ */
/* Helpers                                                            */
/* ------------------------------------------------------------------ */

function Arrow() {
  return (
    <svg className="arrow" viewBox="0 0 12 12" aria-hidden="true">
      <path d="M2 10 L10 2 M3.5 2 L10 2 L10 8.5" fill="none" stroke="currentColor" strokeWidth="1" />
    </svg>
  );
}

class GLBoundary extends Component {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {
    this.props.onFail();
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

function Section({ id, num, title, children }) {
  return (
    <section id={id} className="section">
      <div className="wrap">
        <header className="section-head">
          <span className="section-num">({num})</span>
          <h2 className="section-title">
            <span className="title-mask">
              <span className="title-inner">{title}</span>
            </span>
          </h2>
          <span className="rule head-rule" aria-hidden="true" />
        </header>
        <div className="section-body">{children}</div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Cover                                                              */
/* ------------------------------------------------------------------ */

function Cover() {
  const [gl, setGl] = useState("pending");
  const onReady = useCallback(() => setGl("ready"), []);
  const onFail = useCallback(() => setGl("failed"), []);
  const cover = useRef(null);

  return (
    <header ref={cover} className={`cover is-gl-${gl}`} id="top">
      <GLBoundary onFail={onFail}>
        <Suspense fallback={null}>
          <NameField coverRef={cover} onReady={onReady} />
        </Suspense>
      </GLBoundary>

      <div className="wrap cover-wrap">
        <div className="topbar">
          <a className="monogram" href="#top" aria-label="Victoria Yang, back to top">
            V·Y
          </a>
          <nav className="topbar-nav" aria-label="Sections">
            {NAV.map((l) => (
              <a key={l.href} href={l.href}>
                {l.label}
              </a>
            ))}
          </nav>
          <a className="pill" href="#contact">
            Get in touch
          </a>
          <span className="rule topbar-rule" aria-hidden="true" />
        </div>

        <div className="masthead">
          <h1 className="mast-name">
            <span className="mast-line">
              <span data-text>Victoria</span>
              <i className="baseline-probe" aria-hidden="true" />
            </span>
            <span className="mast-line mast-last">
              <em data-text>Yang</em>
              <i className="baseline-probe" aria-hidden="true" />
            </span>
          </h1>
          <div className="intro">
            <p className="tagline">
              <span className="tagline-lead">Hi! I&rsquo;m studying computer science at Stanford.</span> I&rsquo;m curious
              about how systems work underneath and how to keep them secure, from networks and operating systems to the
              infrastructure AI runs on. If you work in this space, <a href="#contact">reach out</a> :)
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}

/* ------------------------------------------------------------------ */
/* Sections                                                           */
/* ------------------------------------------------------------------ */

function Currently() {
  return (
    <div className="now-grid">
      {CURRENTLY.map((c) => (
        <article key={c.id} id={c.id} className="now-item rv">
          <p className="now-meta">{c.since}</p>
          <h3 className="now-title">
            {c.org} <em>{c.abbr}</em>
          </h3>
          <p className="now-role">{c.role}</p>
          <p className="now-body">{c.body}</p>
        </article>
      ))}
    </div>
  );
}

function Experience({ open, onToggle }) {
  return (
    <ol className="exp-list">
      {EXPERIENCE.map((x, i) => {
        const isOpen = open === x.id;
        return (
          <li key={x.id} id={`exp-${x.id}`} className={`exp-row rv${isOpen ? " is-open" : ""}`}>
            <button
              type="button"
              className="exp-head"
              aria-expanded={isOpen}
              aria-controls={`exp-${x.id}-body`}
              onClick={() => onToggle(isOpen ? null : x.id)}
            >
              <span className="exp-num">{String(i + 1).padStart(2, "0")}</span>
              <span className="exp-org">{x.org}</span>
              <span className="exp-role">{x.role}</span>
              <span className="exp-date">{x.date}</span>
              <span className="exp-icon" aria-hidden="true" />
            </button>
            <div className="exp-body" id={`exp-${x.id}-body`} aria-hidden={!isOpen}>
              <div className="exp-body-inner">
                <ul>
                  {x.bullets.map((b, j) => (
                    <li key={j}>{b}</li>
                  ))}
                </ul>
              </div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

function HeapDrawing() {
  return (
    <svg viewBox="0 0 320 240" className="heap-svg" aria-hidden="true">
      <rect x="20" y="104" width="280" height="48" fill="none" stroke="currentColor" />
      <g fill="currentColor">
        <rect x="20" y="104" width="8" height="48" />
        <rect x="84" y="104" width="8" height="48" />
        <rect x="132" y="104" width="8" height="48" />
        <rect x="172" y="104" width="8" height="48" />
        <rect x="252" y="104" width="8" height="48" />
      </g>
      <g fill="#4a423a">
        <rect x="28" y="104" width="56" height="48" />
        <rect x="140" y="104" width="32" height="48" />
        <rect x="260" y="104" width="40" height="48" />
      </g>
      <rect x="180" y="104" width="72" height="48" fill="#e3a35b" />
      <path d="M112 104 C 112 70, 216 70, 216 104" fill="none" stroke="currentColor" />
      <polyline points="212,98 216,104 220,98" fill="none" stroke="currentColor" />
      <g className="heap-labels">
        <text x="20" y="40">heap · explicit free list</text>
        <text x="36" y="174">alloc</text>
        <text x="98" y="174">free</text>
        <text x="186" y="174">coalesced</text>
      </g>
    </svg>
  );
}

function Work() {
  return (
    <div className="work-grid">
      {PROJECTS.map((p) => (
        <article key={p.id} id={p.id} className="work-card rv">
          {p.image ? (
            <a className={`work-figure is-${p.image.kind}`} href={p.links[0].href} target="_blank" rel="noreferrer" tabIndex={-1}>
              <span className="work-shift">
                <img src={p.image.src} alt={p.image.alt} loading="lazy" />
              </span>
            </a>
          ) : (
            <div className="work-figure is-drawing">
              <span className="work-shift">
                <HeapDrawing />
              </span>
            </div>
          )}
          <p className="work-meta">{p.meta}</p>
          <h3 className="work-title">{p.title}</h3>
          <p className="work-body">{p.body}</p>
          {p.links && (
            <p className="work-links">
              {p.links.map((l) => (
                <a key={l.href} href={l.href} target="_blank" rel="noreferrer">
                  {l.label}
                  <Arrow />
                </a>
              ))}
            </p>
          )}
        </article>
      ))}
    </div>
  );
}

function Education() {
  const [open, setOpen] = useState(null);
  return (
    <>
      <div className="edu-head rv">
        <h3 className="edu-school">
          {EDUCATION.school} <span>· {EDUCATION.degree}</span>
        </h3>
        <p className="edu-gpa">{EDUCATION.gpa}</p>
      </div>
      <ul className="course-grid">
        {EDUCATION.courses.map((c) => {
          const isOpen = open === c.id;
          return (
            <li key={c.id} className={`course rv${isOpen ? " is-open" : ""}`}>
              <button
                type="button"
                className="course-head"
                aria-expanded={isOpen}
                aria-controls={`course-${c.id}`}
                onClick={() => setOpen(isOpen ? null : c.id)}
              >
                <span className="course-id">{c.code}</span>
                <span className="course-name">
                  {c.name}
                  {c.now && <span className="course-now">Now</span>}
                </span>
                <span className="exp-icon" aria-hidden="true" />
              </button>
              <div className="course-body" id={`course-${c.id}`} aria-hidden={!isOpen}>
                <div className="course-inner">
                  <p>{c.desc}</p>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </>
  );
}

function Toolkit() {
  return (
    <div className="tool-grid">
      {TOOLKIT.map((g) => (
        <div key={g.title} className="tool-col rv">
          <h3 className="tool-title">{g.title}</h3>
          <p className="tool-items">{g.items}</p>
        </div>
      ))}
    </div>
  );
}

function Contact() {
  return (
    <section id="contact" className="contact">
      <div className="wrap">
        <div className="contact-mast">
          <span className="section-num">(06)</span>
          <h2 className="mast-name contact-name">
            Let&rsquo;s <em>talk</em>
          </h2>
        </div>
        <div className="index contact-index">
          <span className="rule index-rule" aria-hidden="true" />
          <p className="index-cell index-static rv">
            <span className="index-meta">
              <span>Open to</span>
            </span>
            <span className="index-desc">Off-cycle roles on security and infrastructure teams.</span>
          </p>
          {CONTACT.map((c) => (
            <a key={c.label} className="index-cell rv" href={c.href} {...(c.external ? { target: "_blank", rel: "noreferrer" } : {})}>
              <span className="index-meta">
                <span>{c.meta}</span>
                <Arrow />
              </span>
              <span className="index-title">{c.label}</span>
            </a>
          ))}
        </div>
        <footer className="footer rv">
          <span>© 2026 Victoria Yang</span>
          <a href="#top">Back to top ↑</a>
        </footer>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* App                                                                */
/* ------------------------------------------------------------------ */

export default function App() {
  const [openExp, setOpenExp] = useState(() => {
    const hash = window.location.hash.slice(1);
    const match = EXPERIENCE.find((x) => `exp-${x.id}` === hash);
    return match ? match.id : "socket";
  });

  const toggleExp = useCallback((id) => {
    setOpenExp(id);
    // The row animates open; re-measure scroll positions once it settles.
    setTimeout(refreshMotion, 500);
  }, []);

  // Deep links (#exp-socket etc.) land on their entry.
  useEffect(() => {
    const id = window.location.hash.slice(1);
    const el = id && document.getElementById(id);
    if (el) setTimeout(() => scrollToElement(el), 300);
  }, []);

  const root = useRef(null);
  useLayoutEffect(() => startMotion(root.current), []);

  return (
    <div ref={root}>
      <Cover />
      <main>
        <Section id="currently" num="01" title="Currently">
          <Currently />
        </Section>
        <Section id="experience" num="02" title="Previously">
          <Experience open={openExp} onToggle={toggleExp} />
        </Section>
        <Section
          id="work"
          num="03"
          title={
            <>
              Selected <em>work</em>
            </>
          }
        >
          <Work />
        </Section>
        <Section id="education" num="04" title="Education">
          <Education />
        </Section>
        <Section id="toolkit" num="05" title="Toolkit">
          <Toolkit />
        </Section>
      </main>
      <Contact />
    </div>
  );
}
