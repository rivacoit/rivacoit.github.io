import { useEffect, useRef, useState } from "react";
import { fetchBlockCatalog, fetchPlainTextFile } from "./blockCatalog.js";

const ABOUT_TEXT = `Lorem ipsum dolor sit amet, consectetur adipiscing elit.
Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.`;

const CONTACT_TEXT = `Lorem Ipsum
Phone: +1 (000) 000-0000
Email: lorem@example.com`;

const SKILLS_TEXT = `Lorem Skills
- Lorem ipsum dolor sit amet
- Consectetur adipiscing elit

Tools: Lorem, Ipsum, Dolor
Cloud: Sit, Amet`;

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

const BLOG_POSTS = [
  {
    title: "Lorem ipsum article one",
    summary: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod.",
    tag: "Lorem",
  },
  {
    title: "Lorem ipsum article two",
    summary: "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.",
    tag: "Ipsum",
  },
  {
    title: "Lorem ipsum article three",
    summary: "Duis aute irure dolor in reprehenderit in voluptate velit esse.",
    tag: "Dolor",
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

function vfsNode(cwd, catalogs) {
  const key = cwd.join("/");
  if (key === "") return VFS_HOME;
  if (key === "projects") return { dirs: [], files: catalogs.projects.slugs };
  if (key === "experiences") return { dirs: [], files: catalogs.experiences.slugs };
  return null;
}

function HomePage({ onEnterTerminal }) {
  return (
    <main className="home">
      <header className="home-nav">
        <p className="brand">Lorem Ipsum</p>
        <nav>
          <a href="#experience">Experience</a>
          <a href="#skills">Skills</a>
          <a href="#blog">Blog</a>
          <a href="mailto:lorem@example.com">Contact</a>
        </nav>
      </header>

      <section className="home-hero home-panel fade-up">
        <div className="home-hero-layout">
          <div>
            <p className="home-kicker">Lorem Ipsum</p>
            <h1>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</h1>
            <p className="home-lead">
              Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
              Ut enim ad minim veniam, quis nostrud exercitation ullamco
              laboris.
            </p>
            <div className="home-actions">
              <a className="button-primary" href="mailto:lorem@example.com">
                Contact
              </a>
              <a
                className="button-secondary"
                href="/resume.pdf"
                target="_blank"
                rel="noreferrer"
              >
                View resume PDF
              </a>
              <button className="button-secondary" onClick={onEnterTerminal}>
                Open technical terminal view
              </button>
            </div>
          </div>
          <div className="profile-wrap">
            <img
              className="profile-photo"
              src="/profile.webp"
              alt="Profile"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          </div>
        </div>
        <div className="stats-grid">
          <article className="stat-card">
            <h3>7+</h3>
            <p>Lorem ipsum dolor sit amet</p>
          </article>
          <article className="stat-card">
            <h3>1st Place</h3>
            <p>Consectetur adipiscing elit</p>
          </article>
          <article className="stat-card">
            <h3>172 / 11,583</h3>
            <p>Sed do eiusmod tempor</p>
          </article>
        </div>
      </section>

      <section id="experience" className="home-panel fade-up">
        <h2>Experience Highlights</h2>
        <div className="home-grid">
          <article className="home-card">
            <h3>Lorem Experience One</h3>
            <p className="meta">Role · Date</p>
            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
          </article>
          <article className="home-card">
            <h3>Lorem Experience Two</h3>
            <p className="meta">Role · Date</p>
            <p>Sed do eiusmod tempor incididunt ut labore et dolore magna.</p>
          </article>
          <article className="home-card">
            <h3>Lorem Experience Three</h3>
            <p className="meta">Role · Date</p>
            <p>Ut enim ad minim veniam, quis nostrud exercitation ullamco.</p>
          </article>
        </div>
      </section>

      <section id="skills" className="home-panel fade-up">
        <h2>Skills</h2>
        <div className="pill-list">
          <span>Lorem</span><span>Ipsum</span><span>Dolor</span><span>Sit</span>
          <span>Amet</span><span>Consectetur</span><span>Adipiscing</span>
          <span>Elit</span><span>Sed</span><span>Eiusmod</span>
        </div>
      </section>

      <section id="blog" className="home-panel fade-up">
        <div className="section-head">
          <h2>Blog</h2>
          <p>Lorem ipsum placeholder posts.</p>
        </div>
        <div className="blog-grid">
          {BLOG_POSTS.map((post) => (
            <article key={post.title} className="blog-card">
              <p className="meta">{post.tag}</p>
              <h3>{post.title}</h3>
              <p>{post.summary}</p>
              <a href="#" aria-disabled="true">Coming soon</a>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
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
    { type: "output", text: "Terminal mode loaded. Type help." },
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
          Back to website
        </button>
      </div>
      <div className="terminal" onClick={() => inputRef.current?.focus()}>
        {history.map((line, i) => (
          <pre key={i} className="terminal-line">
            {line.type === "input"
              ? `visitor@lorem:${line.path ?? "~"}$ ${line.text}`
              : line.text}
          </pre>
        ))}
        <div className="terminal-input-row">
          <span className="terminal-prompt">visitor@lorem:{formatPromptPath(cwd)}$</span>
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
