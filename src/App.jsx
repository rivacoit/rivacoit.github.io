import { useEffect, useRef, useState } from "react";
import { Arrow, CopyEmail, GITHUB, LINKEDIN, Pill } from "./shared.jsx";

/* ------------------------------------------------------------------ */
/* Content                                                            */
/* ------------------------------------------------------------------ */

// `tone` picks the pill color; each org keeps its color everywhere.
const EXPERIENCE = [
  {
    id: "esrg",
    org: "Stanford Empirical Security Research Group",
    role: "Student Researcher",
    date: "Since Sep 2026",
    tone: "mint",
    bullets: [
      "Working with Prof. Zakir Durumeric on whether we can automatically spot long-term trends in network traffic.",
      "Right now that means digging through a year of Stanford’s campus Zeek logs (1B+ records, ~300 GB) in BigQuery to figure out which trends are worth automating.",
    ],
  },
  {
    id: "ccdc",
    org: "Stanford Collegiate Cyber Defense Competition Team",
    role: "Network Lead",
    date: "Since Nov 2025",
    tone: "butter",
    bullets: [
      "I run the network side of our defense: routers, switches, firewalls, host hardening, and segmentation, all while a live red team is trying to get in.",
      "Also hunting for red-team access in packet captures and writing incident reports. I built a tool that summarizes iptables rules.",
      "We won Western Regionals and placed 7th nationally.",
      "Before Stanford: four years of CyberPatriot, including 1st nationally in the 2025 Cisco Networking Challenge.",
    ],
  },
  {
    id: "socket",
    org: "Socket",
    role: "Research Intern",
    date: "Jun – Sep 2026",
    tone: "aqua",
    bullets: [
      "Built Socket’s supply-chain malware benchmark from scratch: 7,000 reviewed packages across 15 ecosystems (it covered 3 before), plus a TypeScript CLI to collect, validate, scan, and score them.",
      "Turned real production detections, false positives included, into 1,267 test cases.",
      "Built the dashboard the engineering team now uses to compare 10+ LLMs on recall, false positives, cost, and latency. It showed the model they were about to adopt did worse than others at the same price.",
    ],
  },
  {
    id: "deeptempo",
    org: "DeepTempo",
    role: "Machine Learning Intern",
    date: "Feb – Jun 2026",
    tone: "pink",
    bullets: [
      "Built a pipeline that generates labeled fake attack traffic for training anomaly detectors, fit to ~940K real Zeek flows across 5 MITRE ATT&CK techniques.",
      "One distribution per attack didn’t fit the data, so I modeled attacks in phases (brute force is spray → session → grind) and matched the real flow-duration profile within 1 percentage point.",
      "Merged MITRE data from 5 sources (ATT&CK, Caldera, Atomic Red Team, Attack Flow, CTID) into one registry, so the fake attacks follow what real adversaries do.",
    ],
  },
  {
    id: "yekola",
    org: "Yekola",
    role: "Backend / AI Engineering Intern",
    date: "Jun – Nov 2024",
    tone: "sky",
    bullets: ["Built backend services (AWS Lambda, S3) for a language-learning app that covers 2,000+ African languages."],
  },
  {
    id: "cpp",
    org: "Cal Poly Pomona",
    role: "Research & Software Engineering Intern",
    date: "Jun 2023 – Aug 2024",
    tone: "peach",
    bullets: [
      "Built Lyrically Yours, an app that recommends songs by matching how you’re feeling to their lyrics.",
      "Compared 4 emotion classifiers on 16K sentences (random forest won, 89% accuracy) and wrote it up as a first-author paper at SNLP 2024. It also took first at IgniteCS, GameGala, and the OC Science & Engineering Fair.",
    ],
  },
  {
    id: "cmu",
    org: "Carnegie Mellon",
    role: "AI Research Intern",
    date: "Summer 2024",
    tone: "lilac",
    bullets: ["Fine-tuned image-editing models for culturally appropriate visual storytelling."],
  },
  {
    id: "more",
    org: "Google, MIT, Non-Trivial",
    role: "Programs & fellowships",
    date: "2024",
    tone: "lime",
    bullets: [
      "Google, Career Exploration Intern: pitch decks, financial models, and market research for strategy recommendations.",
      "MIT Beaver Works, Cybersecurity: a month of IoT security and reverse engineering binaries in Ghidra.",
      "Non-Trivial Fellowship: 1 of 172 fellows out of 11,583 applicants. I researched how fiction shapes the way people think about AI risk.",
    ],
  },
];

const WORK = [
  {
    id: "cs229",
    title: "Self-attention for weight evolution in dynamic graph networks",
    meta: "CS 229 · Paper",
    body: "We swapped EvolveGCN’s GRU for a Transformer that looks back over the GCN’s past weights. I built the model and pipeline and ran every experiment. Micro-F1 on Bitcoin-OTC went from 0.699 to 0.783.",
    image: { src: "/work/cs229.webp", alt: "First page of the CS 229 paper", width: 900, height: 737 },
    links: [{ label: "Read the paper", href: "/cs229-paper.pdf" }],
  },
  {
    id: "jobshield",
    title: "JobShield: catching fake job postings",
    meta: "CS 152 · Poster",
    body: "Rules plus Gemini, and every moderator decision gets fed back in as a few-shot example. 0.91 F1 and 0.95 fraud recall at 4.5× lower cost than the LLM alone. I led ML and backend on a team of five.",
    image: { src: "/work/jobshield.webp", alt: "JobShield research poster", width: 1200, height: 866 },
    links: [
      { label: "Poster", href: "/jobshield-poster.pdf" },
      { label: "Code", href: "https://github.com/stanfordcs152/sp26-team-19" },
    ],
  },
];

const COURSES = [
  { code: "CS 111", name: "Operating Systems Principles", now: true },
  { code: "CS 251", name: "Cryptocurrencies & Blockchain", now: true },
  { code: "CS 107", name: "Computer Organization & Systems" },
  { code: "CS 152", name: "Trust & Safety" },
  { code: "CS 229", name: "Machine Learning" },
  { code: "CS 109", name: "Probability for Computer Scientists" },
  { code: "CS 103", name: "Mathematical Foundations of Computing" },
  { code: "CS 106B", name: "Programming Abstractions" },
  { code: "MATH 104", name: "Applied Matrix Theory" },
  { code: "MATH 51", name: "Linear Algebra & Multivariable Calculus" },
];

const TOOLKIT = [
  { title: "Languages", items: ["C", "C++", "Python", "Java", "TypeScript", "JavaScript", "SQL", "Bash"] },
  { title: "Systems & security", items: ["Linux", "gdb", "Ghidra", "objdump", "strace", "Valgrind", "Docker", "Git"] },
  { title: "Networking", items: ["TCP/IP", "DNS", "TLS", "Cisco IOS", "iptables", "Wireshark", "tcpdump", "Zeek"] },
  { title: "Data & web", items: ["BigQuery", "pandas", "AWS (Lambda, S3)", "Next.js", "React"] },
];

/* ------------------------------------------------------------------ */
/* Pieces                                                             */
/* ------------------------------------------------------------------ */

function Role({ item, open, onToggle }) {
  return (
    <li className={`role tone-${item.tone}${open ? " is-open" : ""}`}>
      <button type="button" className="role-head" aria-expanded={open} aria-controls={`role-${item.id}`} onClick={onToggle}>
        <span className="role-org">{item.org}</span>
        <span className="role-meta">
          <span>
            {item.role} · {item.date}
          </span>
          <span className="role-icon" aria-hidden="true">
            {open ? "−" : "+"}
          </span>
        </span>
      </button>
      {open && (
        <ul className="role-body" id={`role-${item.id}`}>
          {item.bullets.map((b) => (
            <li key={b}>{b}</li>
          ))}
        </ul>
      )}
    </li>
  );
}

// Balloons drifting up the empty side margins (wide screens only; see CSS).
const STRINGS = [
  "M50 123 C 40 140, 62 150, 52 168 C 44 182, 40 196, 50 210 C 54 216, 60 214, 58 208",
  "M50 123 C 58 142, 38 156, 46 176 C 52 190, 64 198, 58 214",
  "M50 123 C 44 138, 60 146, 56 162 C 52 178, 36 186, 40 204 C 42 212, 48 214, 50 210",
];
const BODY = "M50 6 C 22 6, 6 28, 6 54 C 6 82, 30 104, 50 112 C 70 104, 94 82, 94 54 C 94 28, 78 6, 50 6 Z";

// side, x (0-1 across the margin), color, string, mirror string, duration (s), delay (s, negative = already mid-flight)
const BALLOONS = [
  ["left", 0.2, "rose", 0, false, 24, -3],
  ["left", 0.75, "butter", 1, true, 27, -12],
  ["left", 0.4, "aqua", 2, false, 25, -20],
  ["right", 0.25, "lilac", 1, false, 26, -8],
  ["right", 0.75, "mint", 2, true, 23, -16],
  ["right", 0.45, "peach", 0, true, 28, -1],
];

// Click a balloon, get a fortune.
const FORTUNES = [
  "A good surprise is floating your way.",
  "Your next bug will be an easy one.",
  "Someone is really glad you stopped by today.",
  "Drink some water. Future you says thanks.",
  "Your code will compile on the first try. (Probably.)",
  "Good things come to those who git pull.",
  "You will find the semicolon you were missing.",
  "A nap is in your near future.",
  "Your tests will pass, and so will this week.",
  "Today is a great day to be a little bit silly.",
  "The firewall is on your side.",
  "You are someone’s favorite person to talk to.",
  "A friend will send you a very good meme.",
  "Snacks are coming. Be ready.",
  "Your hard work is about to pay off.",
  "You will be brave in a small way today.",
  "Something you’ve been waiting for is almost here.",
  "The red team will not get in.",
  "Take the scenic route. It’s worth it.",
  "Your plants are proud of you.",
  "You deserve a little treat.",
  "Happiness is a warm drink and zero merge conflicts.",
  "You have excellent taste in websites.",
  "You will get a really good night’s sleep soon.",
  "Someone is going to compliment your outfit.",
  "A small win is coming. Celebrate it anyway.",
  "Your favorite song will come on at the perfect moment.",
  "The bug was a typo. It’s always a typo.",
  "Someone out there is rooting for you.",
  "Your future self is very proud of you.",
  "Every green light is yours today.",
  "You will laugh so hard you snort.",
  "A great idea will find you in the shower.",
  "Your next coffee will be exactly right.",
  "You’re doing better than you think.",
  "Rest is productive too.",
  "Good news is on its way. Check your email.",
  "Your segfault will be easy to find.",
  "Today you will be someone’s sunshine.",
  "Something sweet is coming your way. Maybe literally.",
  "Your network logs will make sense.",
  "Valgrind will come back clean.",
  "You have enough tokens.",
  "Reviewer 2 will be nice to you.",
  "Your model will generalize.",
  "Your false positive rate will go down. Your happiness will go up.",
  "You will free() what you malloc().",
  "Your pull request will be approved on the first try.",
  "Your gdb breakpoint will land exactly where the bug is.",
  "Check the pointer. It’s null.",
];

const luckyNumbers = () => {
  const picks = new Set();
  while (picks.size < 5) picks.add(1 + Math.floor(Math.random() * 60));
  return [...picks].sort((a, b) => a - b).join("  ");
};

// Random starting point, picked once per page load.
const FIRST_FORTUNE = Math.floor(Math.random() * FORTUNES.length);

function Balloons() {
  const [note, setNote] = useState(null);
  const next = useRef(FIRST_FORTUNE);
  const timer = useRef(0);

  useEffect(() => {
    if (!note) return;
    const onKey = (e) => e.key === "Escape" && setNote(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [note]);

  const open = (e) => {
    const text = FORTUNES[next.current];
    // Walk through the list from a random start so nobody sees a repeat for a while.
    next.current = (next.current + 1 + Math.floor(Math.random() * 3)) % FORTUNES.length;
    // Keyboard presses have no pointer position, so use the balloon's middle.
    const box = e.currentTarget.getBoundingClientRect();
    const px = e.detail ? e.clientX : box.left + box.width / 2;
    const py = e.detail ? e.clientY : box.top + box.width / 2;
    const w = 240;
    const x = Math.min(Math.max(px - w / 2, 12), window.innerWidth - w - 12);
    const y = Math.min(Math.max(py - 40, 12), window.innerHeight - 120);
    setNote({ text, numbers: luckyNumbers(), x, y, key: Date.now() });
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setNote(null), 5000);
  };

  return (
    <>
      <div className="balloons">
        {BALLOONS.map(([side, x, color, string, mirror, dur, delay], i) => (
          <button
            type="button"
            key={i}
            className={`balloon balloon-${side}`}
            style={{ "--x": x, "--c": `var(--${color})`, animationDuration: `${dur}s`, animationDelay: `${delay}s` }}
            onClick={open}
            aria-label="Balloon: open a fortune"
          >
            <svg viewBox="0 0 100 230" className="balloon-svg" aria-hidden="true" focusable="false">
              <defs>
                <clipPath id={`balloon-clip-${i}`}>
                  <path d={BODY} />
                </clipPath>
              </defs>
              <path
                d={STRINGS[string]}
                transform={mirror ? "translate(100 0) scale(-1 1)" : undefined}
                fill="none"
                stroke="#111"
                strokeWidth="5"
                strokeLinecap="round"
              />
              {/* Darker underside, then the main color on top, offset up-left. */}
              <path className="b-shade" d={BODY} />
              <circle className="b-base" cx="43" cy="45" r="51" clipPath={`url(#balloon-clip-${i})`} />
              <path d={BODY} fill="none" stroke="#111" strokeWidth="5" />
              <ellipse cx="31" cy="29" rx="10" ry="6.5" fill="#fff" transform="rotate(-40 31 29)" />
              <ellipse cx="21" cy="46" rx="4.5" ry="7" fill="#fff" transform="rotate(-20 21 46)" />
              <path
                className="b-shade"
                d="M50 110 C 44 114, 38 118, 39 124 C 45 121, 55 121, 61 124 C 62 118, 56 114, 50 110 Z"
                stroke="#111"
                strokeWidth="4.5"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        ))}
      </div>
      <p className="sr-only" role="status">
        {note ? `Your fortune: ${note.text}` : ""}
      </p>
      {note && (
        <button
          type="button"
          key={note.key}
          className="fortune"
          style={{ left: note.x, top: note.y }}
          onClick={() => setNote(null)}
          aria-label="Close fortune"
        >
          <span className="fortune-text">{note.text}</span>
          <span className="fortune-lucky">Lucky numbers {note.numbers}</span>
        </button>
      )}
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                               */
/* ------------------------------------------------------------------ */

export default function App() {
  const [open, setOpen] = useState(() => new Set());
  const toggle = (id) =>
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  return (
    <>
    <div className="page" id="top">
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <section className="hero">
        <div className="hero-text">
          <h1 className="hero-name">
            Victoria
            <br />
            Yang
          </h1>
          <p className="hero-line">
            I study CS at Stanford and work on <mark>systems and security</mark>.
          </p>
          <a className="latest" href="/writing/">
            See what I’m up to
            <Arrow />
          </a>
          <div className="pill-row">
            <CopyEmail variant="solid" />
            <Pill href={GITHUB}>GitHub <Arrow /></Pill>
            <Pill href={LINKEDIN}>LinkedIn <Arrow /></Pill>
          </div>
        </div>
        <div className="hero-badge">
          <img className="badge-main" src="/badge.webp" alt="Victoria Yang" width="380" height="380" fetchPriority="high" />
          {/* Hover swaps in a photo where I'm smiling more. */}
          <img className="badge-smile" src="/badge-smile.webp" alt="" aria-hidden="true" width="380" height="380" />
        </div>
      </section>

      <main id="main">
        <section className="card" id="experience">
          <h2 className="card-title">Experience</h2>
          <ul className="roles">
            {EXPERIENCE.map((x) => (
              <Role key={x.id} item={x} open={open.has(x.id)} onToggle={() => toggle(x.id)} />
            ))}
          </ul>
        </section>

        <section className="card" id="work">
          <h2 className="card-title">Selected work</h2>
          <div className="work-grid">
            {WORK.map((w) => (
              <article key={w.id} className="work">
                <div className="work-figure">
                  <img src={w.image.src} alt={w.image.alt} width={w.image.width} height={w.image.height} loading="lazy" />
                </div>
                <p className="work-meta">{w.meta}</p>
                <h3 className="work-title">{w.title}</h3>
                <p className="work-body">{w.body}</p>
                {w.links && (
                  <div className="pill-row">
                    {w.links.map((l) => (
                      <Pill key={l.href} href={l.href} variant="small">
                        {l.label} <Arrow />
                      </Pill>
                    ))}
                  </div>
                )}
              </article>
            ))}
          </div>
        </section>

        <div className="split">
          <section className="card" id="education">
            <h2 className="card-title">Education</h2>
            <p className="school">Stanford University</p>
            <p className="degree">B.S. Computer Science</p>
            <ul className="chips">
              {COURSES.map((c) => (
                <li key={c.code} className={`chip${c.now ? " is-now" : ""}`} title={c.name}>
                  {c.code} · {c.name}
                  {c.now && " · now"}
                </li>
              ))}
            </ul>
          </section>

          <section className="card" id="toolkit">
            <h2 className="card-title">Toolkit</h2>
            {TOOLKIT.map((g) => (
              <div key={g.title} className="tool-group">
                <h3 className="group-label">{g.title}</h3>
                <ul className="chips">
                  {g.items.map((t) => (
                    <li key={t} className="chip">
                      {t}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </section>
        </div>
      </main>

      <footer className="contact" id="contact">
        <h2 className="contact-title">Let&rsquo;s talk</h2>
        <p className="contact-line">Always down to talk security, systems, or whatever you’re working on. Also open to off-cycle roles on security and infra teams.</p>
        <div className="pill-row">
          <CopyEmail variant="pink" />
          <Pill href={GITHUB} variant="ghost">
            GitHub <Arrow />
          </Pill>
          <Pill href={LINKEDIN} variant="ghost">
            LinkedIn <Arrow />
          </Pill>
        </div>
        <div className="footer">
          <span>© 2026 Victoria Yang</span>
          <a href="#top">Back to top ↑</a>
        </div>
      </footer>
    </div>
      <Balloons />
    </>
  );
}
